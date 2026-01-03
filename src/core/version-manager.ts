import { readFile, readdir, writeFile, stat } from 'fs/promises';
import { join } from 'path';
import { createHash } from 'crypto';
import { Config } from './config.js';
import { paths } from '../utils/paths.js';
import { logger } from '../utils/logger.js';

/**
 * Version information
 */
export interface VersionInfo {
  installedVersion: string;
  lastSynced: string;
  packageVersion: string;
  migrationHistory: MigrationHistoryEntry[];
}

/**
 * Migration history entry
 */
export interface MigrationHistoryEntry {
  from: string;
  to: string;
  timestamp: string;
  status: 'completed' | 'failed' | 'rolled-back';
}

/**
 * Skill hash information
 */
export interface SkillHash {
  path: string;
  name: string;
  hash: string;
  category: string;
}

/**
 * Update changes detected
 */
export interface UpdateChanges {
  hasUpdate: boolean;
  fromVersion: string;
  toVersion: string;
  newSkills: SkillHash[];
  modifiedSkills: SkillHash[];
  removedSkills: SkillHash[];
  conflicts: SkillConflict[];
  configChanges: string[];
}

/**
 * Skill conflict information
 */
export interface SkillConflict {
  skillName: string;
  userHash: string;
  sourceHash: string;
  installedHash: string;
  userModified: boolean;
  sourceModified: boolean;
}

/**
 * Version Manager - Handles version tracking and update detection
 */
export class VersionManager {
  private config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  /**
   * Get current installed version
   */
  async getCurrentVersion(): Promise<VersionInfo | null> {
    const versionPath = join(paths.globalConfig(), '.version.json');

    try {
      const content = await readFile(versionPath, 'utf-8');
      return JSON.parse(content) as VersionInfo;
    } catch {
      return null;
    }
  }

  /**
   * Get package version from package.json
   */
  getPackageVersion(): string {
    try {
      const packageJson = require(join(process.cwd(), 'package.json'));
      return packageJson.version || '0.0.0';
    } catch {
      return '0.0.0';
    }
  }

  /**
   * Check for updates
   */
  async checkForUpdates(): Promise<UpdateChanges> {
    const installed = await this.getCurrentVersion();
    const packageVersion = this.getPackageVersion();

    // If no version file exists, treat as fresh install
    if (!installed) {
      return {
        hasUpdate: true,
        fromVersion: 'none',
        toVersion: packageVersion,
        newSkills: [],
        modifiedSkills: [],
        removedSkills: [],
        conflicts: [],
        configChanges: ['Initial version tracking']
      };
    }

    // Compare versions (simple string comparison for now)
    const hasUpdate = installed.installedVersion !== packageVersion;

    if (!hasUpdate) {
      return {
        hasUpdate: false,
        fromVersion: installed.installedVersion,
        toVersion: packageVersion,
        newSkills: [],
        modifiedSkills: [],
        removedSkills: [],
        conflicts: [],
        configChanges: []
      };
    }

    // Detect changes
    const changes = await this.detectChanges();

    return {
      hasUpdate: true,
      fromVersion: installed.installedVersion,
      toVersion: packageVersion,
      ...changes
    };
  }

  /**
   * Detect changes between versions
   */
  async detectChanges(): Promise<{
    newSkills: SkillHash[];
    modifiedSkills: SkillHash[];
    removedSkills: SkillHash[];
    conflicts: SkillConflict[];
    configChanges: string[];
  }> {
    const globalSkillsPath = paths.skills(paths.globalConfig());
    const projectSkillsPath = paths.skills(this.config.configPath);

    // Get all skills from both locations
    const sourceSkills = await this.loadSkillHashes(globalSkillsPath);
    const userSkills = await this.loadSkillHashes(projectSkillsPath);

    const newSkills: SkillHash[] = [];
    const modifiedSkills: SkillHash[] = [];
    const removedSkills: SkillHash[] = [];
    const conflicts: SkillConflict[] = [];
    const installedSkills = new Map<string, SkillHash>();

    // Load installed versions (for comparison)
    const installedPath = join(paths.globalConfig(), '.installed-skills.json');
    try {
      const installedData = await readFile(installedPath, 'utf-8');
      const installedList = JSON.parse(installedData) as SkillHash[];
      installedList.forEach(skill => {
        installedSkills.set(skill.name, skill);
      });
    } catch {
      // No installed skills file yet
    }

    // Detect new and modified skills
    for (const sourceSkill of sourceSkills) {
      const installed = installedSkills.get(sourceSkill.name);
      const user = userSkills.find(s => s.name === sourceSkill.name);

      if (!installed) {
        // New skill
        newSkills.push(sourceSkill);
      } else if (installed.hash !== sourceSkill.hash) {
        // Modified skill
        modifiedSkills.push(sourceSkill);

        // Check for conflicts
        if (user && user.hash !== installed.hash) {
          conflicts.push({
            skillName: sourceSkill.name,
            userHash: user.hash,
            sourceHash: sourceSkill.hash,
            installedHash: installed.hash,
            userModified: user.hash !== installed.hash,
            sourceModified: sourceSkill.hash !== installed.hash
          });
        }
      }
    }

    // Detect removed skills
    for (const [name, installedSkill] of installedSkills.entries()) {
      const existsInSource = sourceSkills.find(s => s.name === name);
      if (!existsInSource) {
        removedSkills.push(installedSkill);
      }
    }

    return {
      newSkills,
      modifiedSkills,
      removedSkills,
      conflicts,
      configChanges: [] // Will be detected separately
    };
  }

  /**
   * Load skill hashes from directory
   */
  async loadSkillHashes(skillsPath: string): Promise<SkillHash[]> {
    const hashes: SkillHash[] = [];

    try {
      const loadFromDir = async (dir: string) => {
        const files = await readdir(dir);

        for (const file of files) {
          const filePath = join(dir, file);
          const stats = await stat(filePath);

          if (stats.isDirectory()) {
            // Recursively load subdirectories
            await loadFromDir(filePath);
          } else if (file.endsWith('.md')) {
            // Calculate hash for markdown file
            const hash = await this.calculateSkillHash(filePath);
            hashes.push({
              path: filePath,
              name: file.replace('.md', ''),
              hash,
              category: this.extractCategory(dir, skillsPath)
            });
          }
        }
      };

      await loadFromDir(skillsPath);
    } catch (error) {
      // Skills directory might not exist
      logger.debug(`Could not load skills from ${skillsPath}:`, error);
    }

    return hashes;
  }

  /**
   * Calculate hash for a skill file
   */
  async calculateSkillHash(filePath: string): Promise<string> {
    try {
      const content = await readFile(filePath, 'utf-8');
      return createHash('sha256').update(content).digest('hex');
    } catch {
      return '';
    }
  }

  /**
   * Extract category from path
   */
  private extractCategory(filePath: string, basePath: string): string {
    const relative = filePath.replace(basePath + '/', '');
    const parts = relative.split('/');

    if (parts.length > 1) {
      return parts[0]; // First directory is category
    }

    return 'uncategorized';
  }

  /**
   * Save installed skills info
   */
  async saveInstalledSkills(skills: SkillHash[]): Promise<void> {
    const installedPath = join(paths.globalConfig(), '.installed-skills.json');

    try {
      await writeFile(installedPath, JSON.stringify(skills, null, 2));
    } catch (error) {
      logger.error('Failed to save installed skills info:', error);
    }
  }

  /**
   * Update version file
   */
  async updateVersion(version: string, migration?: MigrationHistoryEntry): Promise<void> {
    const current = await this.getCurrentVersion() || {
      installedVersion: '0.0.0',
      lastSynced: new Date().toISOString(),
      packageVersion: '0.0.0',
      migrationHistory: []
    };

    const updated: VersionInfo = {
      installedVersion: version,
      lastSynced: new Date().toISOString(),
      packageVersion: this.getPackageVersion(),
      migrationHistory: migration
        ? [...current.migrationHistory, migration]
        : current.migrationHistory
    };

    const versionPath = join(paths.globalConfig(), '.version.json');
    await writeFile(versionPath, JSON.stringify(updated, null, 2));
  }

  /**
   * Check if migration is needed
   */
  async needsMigration(): Promise<boolean> {
    const current = await this.getCurrentVersion();
    const packageVersion = this.getPackageVersion();

    // Simple version comparison
    // In a real implementation, use semver for proper comparison
    return current?.installedVersion !== packageVersion;
  }
}
