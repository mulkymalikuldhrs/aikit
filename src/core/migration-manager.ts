import { readFile, writeFile, readdir } from 'fs/promises';
import { join } from 'path';
import { logger } from '../utils/logger.js';

/**
 * Migration interface
 */
export interface Migration {
  version: string;
  description: string;
  up(): Promise<void>;
  down(): Promise<void>;
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
 * Migration Manager - Handles version migrations
 */
export class MigrationManager {
  private configPath: string;
  private migrationsDir: string;

  constructor(configPath: string) {
    this.configPath = configPath;
    this.migrationsDir = join(process.cwd(), 'src/core/migrations');
  }

  /**
   * Load all available migrations
   */
  async loadMigrations(): Promise<Migration[]> {
    const migrations: Migration[] = [];

    try {
      const files = await readdir(this.migrationsDir);

      for (const file of files) {
        if (file.endsWith('.js') && file.startsWith('migrate-')) {
          try {
            const module = await import(join(this.migrationsDir, file));
            // Default export or named export 'migration'
            const migration: Migration = module.default || module.migration;
            if (migration) {
              migrations.push(migration);
            }
          } catch (error) {
            logger.warn(`Failed to load migration ${file}:`, error);
          }
        }
      }
    } catch (error) {
      logger.debug('Could not load migrations:', error);
    }

    return migrations.sort((a, b) => a.version.localeCompare(b.version));
  }

  /**
   * Get applied migrations
   */
  async getAppliedMigrations(): Promise<string[]> {
    const migrationHistoryPath = join(this.configPath, '.migration-history.json');

    try {
      const content = await readFile(migrationHistoryPath, 'utf-8');
      const history = JSON.parse(content) as MigrationHistoryEntry[];

      return history
        .filter(m => m.status === 'completed')
        .map(m => m.to);
    } catch {
      return [];
    }
  }

  /**
   * Run pending migrations
   */
  async runPendingMigrations(): Promise<{
    success: boolean;
    applied: string[];
    failed: string[];
  }> {
    const appliedMigrations = await this.getAppliedMigrations();
    const allMigrations = await this.loadMigrations();

    const pendingMigrations = allMigrations.filter(
      m => !appliedMigrations.includes(m.version)
    );

    if (pendingMigrations.length === 0) {
      logger.info('No pending migrations');
      return { success: true, applied: [], failed: [] };
    }

    logger.info(`Running ${pendingMigrations.length} pending migration(s)...`);

    const applied: string[] = [];
    const failed: string[] = [];
    const migrationHistory: MigrationHistoryEntry[] = [];

    for (const migration of pendingMigrations) {
      try {
        logger.info(`Running migration: ${migration.version}`);
        logger.info(`  ${migration.description}`);

        await migration.up();

        applied.push(migration.version);
        migrationHistory.push({
          from: 'previous',
          to: migration.version,
          timestamp: new Date().toISOString(),
          status: 'completed'
        });

        logger.success(`✓ Migration completed: ${migration.version}`);
      } catch (error) {
        logger.error(`✗ Migration failed: ${migration.version}`, error);
        failed.push(migration.version);

        migrationHistory.push({
          from: 'previous',
          to: migration.version,
          timestamp: new Date().toISOString(),
          status: 'failed'
        });

        // Stop on first failure
        break;
      }
    }

    // Update migration history
    await this.updateMigrationHistory(migrationHistory);

    return {
      success: failed.length === 0,
      applied,
      failed
    };
  }

  /**
   * Rollback migration
   */
  async rollbackMigration(version: string): Promise<boolean> {
    try {
      const applied = await this.getAppliedMigrations();

      if (!applied.includes(version)) {
        logger.error(`Migration not found in applied list: ${version}`);
        return false;
      }

      const allMigrations = await this.loadMigrations();
      const migration = allMigrations.find(m => m.version === version);

      if (!migration) {
        logger.error(`Migration file not found: ${version}`);
        return false;
      }

      logger.info(`Rolling back migration: ${version}`);

      await migration.down();

      // Update migration history
      await this.updateMigrationHistoryStatus(version, 'rolled-back');

      logger.success(`✓ Migration rolled back: ${version}`);
      return true;
    } catch (error) {
      logger.error('Failed to rollback migration:', error);
      return false;
    }
  }

  /**
   * Update migration history
   */
  private async updateMigrationHistory(
    entries: MigrationHistoryEntry[]
  ): Promise<void> {
    const historyPath = join(this.configPath, '.migration-history.json');

    try {
      let history: MigrationHistoryEntry[] = [];

      try {
        const content = await readFile(historyPath, 'utf-8');
        history = JSON.parse(content);
      } catch {
        // File doesn't exist yet
      }

      history.push(...entries);

      await writeFile(historyPath, JSON.stringify(history, null, 2));
    } catch (error) {
      logger.error('Failed to update migration history:', error);
    }
  }

  /**
   * Update migration history status
   */
  private async updateMigrationHistoryStatus(
    version: string,
    status: 'completed' | 'failed' | 'rolled-back'
  ): Promise<void> {
    const historyPath = join(this.configPath, '.migration-history.json');

    try {
      const content = await readFile(historyPath, 'utf-8');
      const history = JSON.parse(content) as MigrationHistoryEntry[];

      // Update status for matching migration
      const updated = history.map(m =>
        m.to === version ? { ...m, status } : m
      );

      await writeFile(historyPath, JSON.stringify(updated, null, 2));
    } catch (error) {
      logger.error('Failed to update migration history status:', error);
    }
  }

  /**
   * Get migration history
   */
  async getMigrationHistory(): Promise<MigrationHistoryEntry[]> {
    const historyPath = join(this.configPath, '.migration-history.json');

    try {
      const content = await readFile(historyPath, 'utf-8');
      return JSON.parse(content) as MigrationHistoryEntry[];
    } catch {
      return [];
    }
  }

  /**
   * Check if migration is needed for version
   */
  async needsMigration(_fromVersion: string): Promise<boolean> {
    const applied = await this.getAppliedMigrations();
    const allMigrations = await this.loadMigrations();

    // Check if there are migrations for this version range
    const pendingMigrations = allMigrations.filter(
      m => !applied.includes(m.version)
    );

    return pendingMigrations.length > 0;
  }
}
