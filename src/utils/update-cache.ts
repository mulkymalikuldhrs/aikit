/**
 * Update Cache Manager
 *
 * Manages update state cache for auto-update functionality
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { paths } from './paths.js';

export interface UpdateCacheData {
  lastCheckTime: number;           // Unix timestamp
  lastCheckedVersion: string;      // Version that was checked
  completedUpdate?: string;        // Update ready to show
  completedUpdateTime?: number;    // When update completed
  errorCount: number;              // Consecutive failures
  lastError?: string;
}

const CACHE_FILE = '.update-cache.json';
const DEFAULT_CACHE: UpdateCacheData = {
  lastCheckTime: 0,
  lastCheckedVersion: '0.0.0',
  errorCount: 0,
};

/**
 * Get cache file path
 */
function getCachePath(): string {
  const configDir = paths.globalConfig();
  return join(configDir, CACHE_FILE);
}

/**
 * Read update cache from file
 */
export async function readCache(): Promise<UpdateCacheData> {
  try {
    const cachePath = getCachePath();

    if (!existsSync(cachePath)) {
      return DEFAULT_CACHE;
    }

    const content = await readFile(cachePath, 'utf-8');
    const data = JSON.parse(content) as UpdateCacheData;

    // Merge with defaults to ensure all fields exist
    return { ...DEFAULT_CACHE, ...data };
  } catch {
    return DEFAULT_CACHE;
  }
}

/**
 * Write update cache to file
 */
export async function writeCache(data: UpdateCacheData): Promise<void> {
  try {
    const cachePath = getCachePath();
    const configDir = paths.globalConfig();

    // Ensure config directory exists
    if (!existsSync(configDir)) {
      await mkdir(configDir, { recursive: true });
    }

    await writeFile(cachePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch {
    // Silent failure - don't throw if we can't write cache
  }
}

/**
 * Set last check time
 */
export async function setLastCheckTime(timestamp: number): Promise<void> {
  const cache = await readCache();
  cache.lastCheckTime = timestamp;
  await writeCache(cache);
}

/**
 * Set last checked version
 */
export async function setLastCheckedVersion(version: string): Promise<void> {
  const cache = await readCache();
  cache.lastCheckedVersion = version;
  await writeCache(cache);
}

/**
 * Mark update as completed for notification
 */
export async function setCompletedUpdate(version: string): Promise<void> {
  const cache = await readCache();
  cache.completedUpdate = version;
  cache.completedUpdateTime = Date.now();
  cache.errorCount = 0; // Reset error count on success
  cache.lastError = undefined;
  await writeCache(cache);
}

/**
 * Clear completed update notification
 */
export async function clearCompletedUpdate(): Promise<void> {
  const cache = await readCache();
  cache.completedUpdate = undefined;
  cache.completedUpdateTime = undefined;
  await writeCache(cache);
}

/**
 * Increment error count
 */
export async function incrementError(error: string): Promise<void> {
  const cache = await readCache();
  cache.errorCount += 1;
  cache.lastError = error;
  await writeCache(cache);
}

/**
 * Reset error count
 */
export async function resetError(): Promise<void> {
  const cache = await readCache();
  cache.errorCount = 0;
  cache.lastError = undefined;
  await writeCache(cache);
}
