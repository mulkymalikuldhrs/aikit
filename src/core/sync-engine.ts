import { readFile, writeFile, copyFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { VersionManager, UpdateChanges, SkillConflict, SkillHash } from './version-manager.js';
import { BackupManager } from './backup-manager.js';
import { MigrationManager } from './migration-manager.js';
import { logger } from '../utils/logger.js';
import { Config } from './config.js';
import { paths } from '../utils/paths.js';

/**
 * Sync options
 */
export interface SyncOptions {
  dryRun?: boolean;
  force?: boolean;
  backup?: boolean;
}

/**
 * Sync result
 */
export interface SyncResult {
  success: boolean;
  backupId?: string;
  newSkills: string[];
  updatedSkills: string[];
  removedSkills: string[];
  migrationsRun: string[];
}

/**
 * Sync Engine - Orchestrates update process
 */
export class SyncEngine {
  private versionManager: VersionManager;
  private backupManager: BackupManager;
  private migrationManager: MigrationManager;

  constructor(config: Config) {
    this.versionManager = new VersionManager(config);
    this.backupManager = new BackupManager(config.configPath);
    this.migrationManager = new MigrationManager(config.configPath);
  }

  /**
   * Check for updates without applying
   */
  async checkForUpdates(): Promise<UpdateChanges | null> {
    try {
      const changes = await this.versionManager.checkForUpdates();

      if (changes.hasUpdate) {
        this.displayUpdateInfo(changes);
      } else {
        console.log(chalk.green('✓ Your AIKit is up to date'));
        console.log(`  Installed: ${changes.fromVersion}`);
        console.log(`  Latest:    ${changes.toVersion}`);
      }

      return changes;
    } catch (error) {
      logger.error('Failed to check for updates:', error);
      return null;
    }
  }

  /**
   * Preview changes without applying
   */
  async previewUpdate(): Promise<boolean> {
    try {
      console.log(chalk.bold('\n🔍 Previewing update...\n'));

      const changes = await this.versionManager.checkForUpdates();

      if (!changes.hasUpdate) {
        console.log(chalk.green('✓ No updates available'));
        return false;
      }

      await this.displayChanges(changes);

      console.log(chalk.yellow('\n⚠️  This is a preview - no changes will be made.'));
      console.log(chalk.gray('Use `aikit sync apply` to apply these changes.'));

      return true;
    } catch (error) {
      logger.error('Failed to preview update:', error);
      return false;
    }
  }

  /**
   * Apply update
   */
  async applyUpdate(options: SyncOptions = {}): Promise<SyncResult> {
    try {
      // Step 1: Check for updates
      const changes = await this.versionManager.checkForUpdates();

      if (!changes.hasUpdate) {
        console.log(chalk.green('✓ Already up to date'));
        return {
          success: true,
          newSkills: [],
          updatedSkills: [],
          removedSkills: [],
          migrationsRun: []
        };
      }

      // Step 2: Display changes
      await this.displayChanges(changes);

      // Step 3: Confirm
      if (!options.force) {
        const { confirmed } = await inquirer.prompt([{
          type: 'confirm',
          name: 'confirmed',
          message: 'Continue with update?',
          default: false
        }]);

        if (!confirmed) {
          console.log(chalk.yellow('Update cancelled'));
          return {
            success: false,
            newSkills: [],
            updatedSkills: [],
            removedSkills: [],
            migrationsRun: []
          };
        }
      }

      // Step 4: Create backup (unless dry run)
      let backupId: string | undefined = undefined;

      if (!options.dryRun && options.backup !== false) {
        console.log(chalk.bold('\n📦 Creating backup...'));
        const backupResult = await this.backupManager.createBackup(
          changes.fromVersion,
          changes.toVersion
        );

        if (!backupResult) {
          throw new Error('Failed to create backup');
        }
        backupId = backupResult;
      }

      // Step 5: Resolve conflicts
      for (const conflict of changes.conflicts) {
        await this.resolveConflict(conflict);
      }

      // Step 6: Run migrations
      console.log(chalk.bold('\n🔄 Running migrations...'));
      const migrationResult = await this.migrationManager.runPendingMigrations();

      if (!migrationResult.success) {
        throw new Error(`Migration failed: ${migrationResult.failed.join(', ')}`);
      }

      // Step 7: Update skills
      console.log(chalk.bold('\n📝 Updating skills...'));
      const updateResult = await this.updateSkills(changes, options);

      // Step 8: Update version
      await this.versionManager.updateVersion(changes.toVersion);

      // Update installed skills tracking
      if (backupId) {
        const allSkills = await this.versionManager.loadSkillHashes(paths.skills(paths.globalConfig()));
        await this.versionManager.saveInstalledSkills(allSkills);
      }

      console.log(chalk.green('\n✅ Update complete!'));
      this.displaySummary({
        success: true,
        backupId,
        ...updateResult,
        migrationsRun: migrationResult.applied
      });

      return {
        success: true,
        backupId,
        ...updateResult,
        migrationsRun: migrationResult.applied
      };
    } catch (error) {
      logger.error('Update failed:', error);
      console.log(chalk.red('\n❌ Update failed'));

      // TODO: Implement automatic rollback
      return {
        success: false,
        newSkills: [],
        updatedSkills: [],
        removedSkills: [],
        migrationsRun: []
      };
    }
  }

  /**
   * Rollback to previous backup
   */
  async rollback(backupId?: string): Promise<boolean> {
    try {
      console.log(chalk.bold('\n🔄 Rollback...\n'));

      // List backups if no ID provided
      if (!backupId) {
        const backups = await this.backupManager.listBackups();

        if (backups.length === 0) {
          console.log(chalk.yellow('No backups available'));
          return false;
        }

        const { selectedBackup } = await inquirer.prompt([{
          type: 'list',
          name: 'selectedBackup',
          message: 'Select backup to restore:',
          choices: backups.map((b) => ({
            name: `${b.manifest.backupId} (${b.manifest.fromVersion} → ${b.manifest.toVersion})`,
            value: b.manifest.backupId
          }))
        }]);

        backupId = selectedBackup;
      }

      if (!backupId) {
        console.log(chalk.yellow('No backup ID provided'));
        return false;
      }

      const success = await this.backupManager.restoreBackup(backupId);

      if (success) {
        console.log(chalk.green('✓ Rollback complete'));
        return true;
      }

      return false;
    } catch (error) {
      logger.error('Rollback failed:', error);
      return false;
    }
  }

  /**
   * Display update information
   */
  private displayUpdateInfo(changes: UpdateChanges): void {
    console.log(chalk.bold('\n📢 New version available!\n'));
    console.log(`  ${chalk.cyan('Current:')} ${changes.fromVersion}`);
    console.log(`  ${chalk.cyan('Latest:')}  ${changes.toVersion}\n`);
  }

  /**
   * Display changes summary
   */
  private async displayChanges(changes: UpdateChanges): Promise<void> {
    console.log(chalk.bold('📊 Changes detected:\n'));

    if (changes.newSkills.length > 0) {
      console.log(chalk.green('  New Skills:'));
      changes.newSkills.forEach((skill) => {
        console.log(`    + ${skill.name} (${skill.category})`);
      });
    }

    if (changes.modifiedSkills.length > 0) {
      console.log(chalk.yellow('  Updated Skills:'));
      changes.modifiedSkills.forEach((skill) => {
        console.log(`    ~ ${skill.name}`);
      });
    }

    if (changes.removedSkills.length > 0) {
      console.log(chalk.red('  Removed Skills:'));
      changes.removedSkills.forEach((skill) => {
        console.log(`    - ${skill.name}`);
      });
    }

    if (changes.conflicts.length > 0) {
      console.log(chalk.bold.red('  ⚠️  Conflicts:'));
      changes.conflicts.forEach((conflict) => {
        console.log(`    ! ${conflict.skillName} (user modified)`);
      });
    }
  }

  /**
   * Resolve a conflict
   */
  private async resolveConflict(conflict: SkillConflict): Promise<void> {
    console.log(chalk.bold.red(`\n⚠️  Conflict detected: ${conflict.skillName}\n`));
    console.log(chalk.yellow('Your version differs from official version.'));

    const { action } = await inquirer.prompt([{
      type: 'list',
      name: 'action',
      message: 'Choose action:',
      choices: [
        {
          name: 'Keep your version (will be renamed to -custom.md)',
          value: 'preserve'
        },
        {
          name: 'Overwrite with official version',
          value: 'overwrite'
        },
        {
          name: 'Skip this skill',
          value: 'skip'
        }
      ]
    }]);

    if (action === 'skip') {
      return;
    }

    if (action === 'overwrite') {
      // User chose to overwrite - do nothing, sync will overwrite
      return;
    }

    // Preserve - rename user's version to -custom
    // TODO: Implement this logic
    console.log(chalk.yellow('  Your version will be preserved as -custom.md'));
  }

  /**
   * Update skills based on changes
   */
  private async updateSkills(
    changes: UpdateChanges,
    options: SyncOptions
  ): Promise<{
    newSkills: string[];
    updatedSkills: string[];
    removedSkills: string[];
  }> {
    const globalSkillsPath = paths.skills(paths.globalConfig());
    const projectSkillsPath = paths.skills(this.versionManager['config'].configPath);
    const newSkills: string[] = [];
    const updatedSkills: string[] = [];
    const removedSkills: string[] = [];

    // Install new skills
    for (const skill of changes.newSkills) {
      if (!options.dryRun) {
        await this.installSkill(globalSkillsPath, skill, projectSkillsPath);
      }
      newSkills.push(skill.name);
      console.log(chalk.green(`    + ${skill.name}`));
    }

    // Update modified skills
    for (const skill of changes.modifiedSkills) {
      if (!options.dryRun) {
        await this.installSkill(globalSkillsPath, skill, projectSkillsPath);
      }
      updatedSkills.push(skill.name);
      console.log(chalk.yellow(`    ~ ${skill.name}`));
    }

    // Handle removed skills (archive them)
    for (const skill of changes.removedSkills) {
      if (!options.dryRun) {
        await this.archiveSkill(projectSkillsPath, skill);
      }
      removedSkills.push(skill.name);
      console.log(chalk.red(`    - ${skill.name} (archived)`));
    }

    return {
      newSkills,
      updatedSkills,
      removedSkills
    };
  }

  /**
   * Install a skill
   */
  private async installSkill(
    sourceDir: string,
    skill: SkillHash,
    targetDir: string
  ): Promise<void> {
    const sourcePath = join(sourceDir, skill.category, `${skill.name}.md`);
    const targetPath = join(targetDir, skill.category, `${skill.name}.md`);

    // Create target directory
    await mkdir(dirname(targetPath), { recursive: true });

    // Copy file
    await copyFile(sourcePath, targetPath);
  }

  /**
   * Archive a removed skill
   */
  private async archiveSkill(
    targetDir: string,
    skill: SkillHash
  ): Promise<void> {
    const sourcePath = join(targetDir, skill.category, `${skill.name}.md`);
    const targetPath = join(targetDir, skill.category, `${skill.name}-deprecated.md`);

    try {
      // Read original content
      const content = await readFile(sourcePath, 'utf-8');

      // Add deprecation notice
      const deprecatedNotice = `---
⚠️  DEPRECATED: This skill has been removed

Deprecation date: ${new Date().toISOString()}
Reason: Check release notes for replacement
---

${content}`;

      // Create target directory
      await mkdir(dirname(targetPath), { recursive: true });

      await writeFile(targetPath, deprecatedNotice);
    } catch (error) {
      // If source file doesn't exist, skip archiving
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        console.log(chalk.yellow(`    - ${skill.name} (not found, skipping)`));
      } else {
        throw error;
      }
    }
  }

  /**
   * Display sync summary
   */
  private displaySummary(result: SyncResult): void {
        console.log(chalk.bold('\n📋 Summary:\n'));
    console.log(`  Updated from: ${chalk.cyan(result.backupId || 'N/A')}`);
    console.log(`  Updated to:   ${chalk.cyan('current')}`);
    console.log();

    if (result.newSkills.length > 0) {
      console.log(chalk.green(`  ${result.newSkills.length} new skills installed`));
    }
    if (result.updatedSkills.length > 0) {
      console.log(chalk.yellow(`  ${result.updatedSkills.length} skills updated`));
    }
    if (result.removedSkills.length > 0) {
      console.log(chalk.red(`  ${result.removedSkills.length} skills archived`));
    }
    if (result.migrationsRun.length > 0) {
      console.log(chalk.blue(`  ${result.migrationsRun.length} migrations run`));
    }

    if (result.backupId) {
      console.log(chalk.gray(`\n  Rollback available: aikit sync rollback ${result.backupId}`));
    }
  }
}
