/**
 * Update Manager
 *
 * Core orchestrator for update checks and installation
 */

import chalk from 'chalk';
import { getVersion, isGreaterThan } from '../utils/version.js';
import { getLatestVersion } from '../utils/npm-client.js';
import {
  readCache,
  setLastCheckTime,
  setLastCheckedVersion,
  setCompletedUpdate,
  clearCompletedUpdate,
  incrementError,
} from '../utils/update-cache.js';
import { spawnUpdateProcess } from './background-updater.js';

const CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
const PACKAGE_NAME = '@tdsoft-tech/aikit';

/**
 * Check if update check is needed (24-hour cache)
 */
async function shouldCheckForUpdates(): Promise<boolean> {
  const cache = await readCache();
  const now = Date.now();
  return now - cache.lastCheckTime > CHECK_INTERVAL;
}

/**
 * Display update notification
 */
async function displayNotification(): Promise<void> {
  const cache = await readCache();

  if (cache.completedUpdate) {
    const currentVersion = getVersion();

    // Only show notification if we haven't updated yet
    if (isGreaterThan(cache.completedUpdate, currentVersion)) {
      console.log(chalk.cyan.bold('\n✨ AIKit has been updated!\n'));
      console.log(chalk.gray(`   Version: ${currentVersion} → ${cache.completedUpdate}`));
      console.log(chalk.gray(`   Updated: Just now\n`));
      console.log(chalk.gray('Run \'aikit --version\' to verify.\n'));

      // Clear notification after displaying
      await clearCompletedUpdate();
    }
  }

  // Show error notification after 3 consecutive failures
  if (cache.errorCount >= 3 && cache.lastError) {
    console.log(chalk.yellow.bold('\n⚠️  AIKit update failed\n'));
    console.log(chalk.gray(`   Last error: ${cache.lastError}`));
    console.log(chalk.gray('   Check logs: ~/.config/aikit/logs/update-error.log\n'));
  }
}

/**
 * Perform background update
 */
async function performBackgroundUpdate(latestVersion: string): Promise<void> {
  const success = await spawnUpdateProcess(latestVersion);

  if (!success) {
    await incrementError('Failed to spawn update process');
  } else {
    await setCompletedUpdate(latestVersion);
  }
}

/**
 * Main update check logic
 */
export async function checkForUpdates(): Promise<void> {
  try {
    // Display any pending notifications first
    await displayNotification();

    // Check if we should update (24-hour cache)
    if (!(await shouldCheckForUpdates())) {
      return;
    }

    // Get current and latest versions
    const currentVersion = getVersion();
    const latestVersion = await getLatestVersion(PACKAGE_NAME);

    // Update cache with check time
    await setLastCheckTime(Date.now());
    await setLastCheckedVersion(currentVersion);

    // If no update available, return
    if (!latestVersion || !isGreaterThan(latestVersion, currentVersion)) {
      return;
    }

    // Trigger background update
    await performBackgroundUpdate(latestVersion);
  } catch {
    // Silent failure - don't interrupt CLI
  }
}

/**
 * Non-blocking public API for CLI
 */
export async function checkForUpdatesAsync(): Promise<void> {
  // Fire and forget - don't await
  checkForUpdates().catch(() => {
    // Silent failure
  });
}
