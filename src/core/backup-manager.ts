import { readFile, writeFile, readdir, stat, unlink, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { createHash } from 'crypto';
import { logger } from '../utils/logger.js';

/**
 * Backup manifest
 */
export interface BackupManifest {
  backupId: string;
  fromVersion: string;
  toVersion: string;
  timestamp: string;
  files: BackupFile[];
  success: boolean;
}

/**
 * Backup file entry
 */
export interface BackupFile {
  path: string;
  hash: string;
  size: number;
}

/**
 * Backup information
 */
export interface BackupInfo {
  manifest: BackupManifest;
  path: string;
  size: number;
}

/**
 * Backup Manager - Handles creating and restoring backups
 */
export class BackupManager {
  private configPath: string;
  private backupsDir: string;
  private maxBackups: number;

  constructor(configPath: string, maxBackups: number = 5) {
    this.configPath = configPath;
    this.backupsDir = join(configPath, '.backups');
    this.maxBackups = maxBackups;
  }

  /**
   * Create backup before update
   */
  async createBackup(fromVersion: string, toVersion: string): Promise<string | null> {
    try {
      await mkdir(this.backupsDir, { recursive: true });

      const backupId = `${new Date().toISOString().replace(/[:.]/g, '-')}`;
      const backupPath = join(this.backupsDir, `${backupId}-v${toVersion}`);

      await mkdir(backupPath, { recursive: true });

      logger.info(`Creating backup: ${backupPath}`);

      const files: BackupFile[] = [];

      // Backup critical files
      const backupItems = [
        'skills/',
        'aikit.json',
        'AGENTS.md',
        'config/',
      ];

      for (const item of backupItems) {
        const files = await this.backupItem(this.configPath, item, backupPath);
        files.push(...files);
      }

      // Create manifest
      const manifest: BackupManifest = {
        backupId,
        fromVersion,
        toVersion,
        timestamp: new Date().toISOString(),
        files,
        success: true
      };

      const manifestPath = join(backupPath, 'backup-manifest.json');
      await writeFile(manifestPath, JSON.stringify(manifest, null, 2));

      // Cleanup old backups
      await this.cleanupOldBackups();

      logger.success(`✓ Backup created: ${backupId}`);
      return backupId;
    } catch (error) {
      logger.error('Failed to create backup:', error);
      return null;
    }
  }

  /**
   * Backup a file or directory
   */
  async backupItem(
    sourceDir: string,
    item: string,
    targetDir: string
  ): Promise<BackupFile[]> {
    const sourcePath = join(sourceDir, item);
    const targetPath = join(targetDir, item);
    const files: BackupFile[] = [];

    try {
      const stats = await stat(sourcePath);

      if (stats.isDirectory()) {
        await mkdir(targetPath, { recursive: true });
        const entries = await readdir(sourcePath);

        for (const entry of entries) {
          const entryFiles = await this.backupItem(sourcePath, entry, targetPath);
          files.push(...entryFiles);
        }
      } else if (stats.isFile()) {
        await mkdir(dirname(targetPath), { recursive: true });
        await this.copyFile(sourcePath, targetPath);

        const hash = await this.calculateHash(targetPath);
        files.push({
          path: item,
          hash,
          size: stats.size
        });
      }
    } catch (error) {
      logger.debug(`Could not backup ${item}:`, error);
    }

    return files;
  }

  /**
   * Copy file with hash calculation
   */
  private async copyFile(source: string, target: string): Promise<void> {
    const content = await readFile(source);
    await writeFile(target, content);
  }

  /**
   * Calculate file hash
   */
  private async calculateHash(filePath: string): Promise<string> {
    try {
      const content = await readFile(filePath);
      return createHash('sha256').update(content).digest('hex');
    } catch {
      return '';
    }
  }

  /**
   * List available backups
   */
  async listBackups(): Promise<BackupInfo[]> {
    try {
      const entries = await readdir(this.backupsDir);
      const backups: BackupInfo[] = [];

      for (const entry of entries) {
        const backupPath = join(this.backupsDir, entry);
        const manifestPath = join(backupPath, 'backup-manifest.json');

        try {
          const manifestContent = await readFile(manifestPath, 'utf-8');
          const manifest = JSON.parse(manifestContent) as BackupManifest;

          const size = await this.calculateBackupSize(backupPath);

          backups.push({
            manifest,
            path: backupPath,
            size
          });
        } catch {
          // Invalid backup, skip
        }
      }

      // Sort by timestamp (newest first)
      backups.sort((a, b) =>
        new Date(b.manifest.timestamp).getTime() - new Date(a.manifest.timestamp).getTime()
      );

      return backups;
    } catch {
      return [];
    }
  }

  /**
   * Calculate backup directory size
   */
  private async calculateBackupSize(backupPath: string): Promise<number> {
    let totalSize = 0;

    try {
      const calculate = async (dir: string): Promise<void> => {
        const entries = await readdir(dir);

        for (const entry of entries) {
          const entryPath = join(dir, entry);
          const stats = await stat(entryPath);

          if (stats.isDirectory()) {
            await calculate(entryPath);
          } else {
            totalSize += stats.size;
          }
        }
      };

      await calculate(backupPath);
    } catch {
      // Return 0 if calculation fails
    }

    return totalSize;
  }

  /**
   * Restore from backup
   */
  async restoreBackup(backupId: string): Promise<boolean> {
    try {
      const backups = await this.listBackups();
      const backup = backups.find(b => b.manifest.backupId === backupId);

      if (!backup) {
        logger.error(`Backup not found: ${backupId}`);
        return false;
      }

      logger.info(`Restoring from backup: ${backupId}`);

      // Validate backup integrity
      const isValid = await this.validateBackup(backup);
      if (!isValid) {
        logger.error('Backup validation failed');
        return false;
      }

      // Restore each file
      for (const file of backup.manifest.files) {
        const sourcePath = join(backup.path, file.path);
        const targetPath = join(this.configPath, file.path);

        await mkdir(dirname(targetPath), { recursive: true });
        await this.copyFile(sourcePath, targetPath);
      }

      logger.success(`✓ Backup restored: ${backupId}`);
      return true;
    } catch (error) {
      logger.error('Failed to restore backup:', error);
      return false;
    }
  }

  /**
   * Validate backup integrity
   */
  async validateBackup(backup: BackupInfo): Promise<boolean> {
    try {
      // Check manifest exists and is valid JSON
      const manifestPath = join(backup.path, 'backup-manifest.json');
      await readFile(manifestPath, 'utf-8');

      // Check if all files exist
      for (const file of backup.manifest.files) {
        const filePath = join(backup.path, file.path);
        await stat(filePath);

        // Verify hash
        const currentHash = await this.calculateHash(filePath);
        if (currentHash !== file.hash) {
          logger.warn(`File hash mismatch: ${file.path}`);
          return false;
        }
      }

      return true;
    } catch (error) {
      logger.debug('Backup validation failed:', error);
      return false;
    }
  }

  /**
   * Delete backup
   */
  async deleteBackup(backupId: string): Promise<boolean> {
    try {
      const backups = await this.listBackups();
      const backup = backups.find(b => b.manifest.backupId === backupId);

      if (!backup) {
        return false;
      }

      // Remove all files in backup directory
      const entries = await readdir(backup.path);
      for (const entry of entries) {
        const entryPath = join(backup.path, entry);
        const stats = await stat(entryPath);

        if (stats.isDirectory()) {
          // Remove recursively
          await this.removeDirectory(entryPath);
        } else {
          await unlink(entryPath);
        }
      }

      logger.success(`✓ Backup deleted: ${backupId}`);
      return true;
    } catch (error) {
      logger.error('Failed to delete backup:', error);
      return false;
    }
  }

  /**
   * Remove directory recursively
   */
  private async removeDirectory(dirPath: string): Promise<void> {
    const entries = await readdir(dirPath);

    for (const entry of entries) {
      const entryPath = join(dirPath, entry);
      const stats = await stat(entryPath);

      if (stats.isDirectory()) {
        await this.removeDirectory(entryPath);
      } else {
        await unlink(entryPath);
      }
    }

    await unlink(dirPath);
  }

  /**
   * Cleanup old backups (keep only maxBackups)
   */
  async cleanupOldBackups(): Promise<void> {
    try {
      const backups = await this.listBackups();

      if (backups.length <= this.maxBackups) {
        return;
      }

      const toDelete = backups.slice(this.maxBackups);

      for (const backup of toDelete) {
        await this.deleteBackup(backup.manifest.backupId);
      }

      logger.info(`Cleaned up ${toDelete.length} old backup(s)`);
    } catch (error) {
      logger.error('Failed to cleanup old backups:', error);
    }
  }

  /**
   * Format backup size for display
   */
  formatSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }
}
