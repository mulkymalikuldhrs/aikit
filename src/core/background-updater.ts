/**
 * Background Updater
 *
 * Spawns detached background processes for npm updates
 */

import { spawn } from 'child_process';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { paths } from '../utils/paths.js';

/**
 * Spawn a detached background process to update AIKit
 */
export async function spawnUpdateProcess(targetVersion: string): Promise<boolean> {
  try {
    const configDir = paths.globalConfig();
    const logsDir = join(configDir, 'logs');

    // Ensure logs directory exists
    await mkdir(logsDir, { recursive: true });

    // Create update script
    const scriptContent = generateUpdateScript(targetVersion, logsDir);
    const scriptPath = join(configDir, 'update-script.js');
    await writeFile(scriptPath, scriptContent, 'utf-8');

    // Spawn detached process
    const child = spawn(process.execPath, [scriptPath], {
      detached: true,
      stdio: 'ignore',
      windowsHide: true,
    });

    // Detach child process
    child.unref();

    return true;
  } catch {
    return false;
  }
}

/**
 * Generate update script content
 */
function generateUpdateScript(targetVersion: string, logsDir: string): string {
  return `
// AIKit Auto-Update Script
// Generated automatically - DO NOT EDIT

const { spawn } = require('child_process');
const { writeFile, appendFile } = require('fs').promises;
const { join } = require('path');

const configDir = '${paths.globalConfig().replace(/\\/g, '\\\\')}';
const logsDir = '${logsDir.replace(/\\/g, '\\\\')}';
const cachePath = join(configDir, '.update-cache.json');
const errorLogPath = join(logsDir, 'update-error.log');
const targetVersion = '${targetVersion}';

async function logError(message) {
  const timestamp = new Date().toISOString();
  await appendFile(errorLogPath, \`[\${timestamp}] \${message}\\n\`);
}

async function updateCache(version, error) {
  try {
    const fs = require('fs');
    let cache = { lastCheckTime: 0, lastCheckedVersion: '0.0.0', errorCount: 0 };

    try {
      cache = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
    } catch {}

    if (error) {
      cache.errorCount = (cache.errorCount || 0) + 1;
      cache.lastError = error;
    } else {
      cache.completedUpdate = version;
      cache.completedUpdateTime = Date.now();
      cache.errorCount = 0;
      cache.lastError = undefined;
    }

    await writeFile(cachePath, JSON.stringify(cache, null, 2));
  } catch {}
}

async function runUpdate() {
  return new Promise((resolve) => {
    const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    const child = spawn(npmCmd, ['install', '-g', '@tdsoft-tech/aikit@latest'], {
      stdio: 'pipe',
    });

    let output = '';
    let errorOutput = '';

    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    child.on('close', async (code) => {
      if (code === 0) {
        await updateCache(targetVersion, null);
        resolve(true);
      } else {
        const errorMsg = errorOutput || 'npm install failed';
        await logError(\`Update failed (code \${code}): \${errorMsg}\`);
        await updateCache(targetVersion, errorMsg);
        resolve(false);
      }
    });

    child.on('error', async (err) => {
      await logError(\`Update error: \${err.message}\`);
      await updateCache(targetVersion, err.message);
      resolve(false);
    });
  });
}

// Run update and exit
runUpdate().then(() => process.exit(0));
`;
}
