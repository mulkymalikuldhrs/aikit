/**
 * Sync Command
 * 
 * Update AIKit to latest version
 */

import { Command } from 'commander';
import chalk from 'chalk';

import { loadConfig } from '../../core/config.js';
import { SyncEngine } from '../../core/sync-engine.js';
import { logger } from '../../utils/logger.js';

export function registerSyncCommand(program: Command): void {
  program
    .command('sync [subcommand]')
    .description('Update AIKit to latest version')
    .option('--dry-run', 'Preview changes without applying')
    .option('-f, --force', 'Skip confirmation prompts')
    .option('--no-backup', 'Skip creating backup')
    .action(async (subcommand, options) => {
      const config = await loadConfig();
      const syncEngine = new SyncEngine(config);

      if (!subcommand) {
        // Default: check and apply
        await syncEngine.applyUpdate(options);
      } else {
        switch (subcommand) {
          case 'check':
            await syncEngine.checkForUpdates();
            break;
          case 'preview':
            await syncEngine.previewUpdate();
            break;
          case 'apply':
            await syncEngine.applyUpdate(options);
            break;
          case 'rollback':
            await syncEngine.rollback();
            break;
          default:
            logger.error(`Unknown subcommand: ${subcommand}`);
            console.log(chalk.gray('Available subcommands: check, preview, apply, rollback'));
            process.exit(1);
        }
      }
    });
}




