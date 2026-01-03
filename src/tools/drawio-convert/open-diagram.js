/**
 * Open Diagram in Draw.io Application
 *
 * Cross-platform utility to open diagrams in Draw.io desktop app or web app
 */

import { execSync } from 'child_process';
import fs from 'fs';

/**
 * Open diagram in Draw.io application
 * @param {string} drawioPath - Absolute path to .drawio file
 * @returns {Object} { success, message, openedWith }
 */
export function openDiagram(drawioPath) {
  // 1. Validate file exists
  if (!fs.existsSync(drawioPath)) {
    return {
      success: false,
      message: `File not found: ${drawioPath}`,
      openedWith: null,
    };
  }

  const platform = process.platform;
  let command;
  let openedWith = 'desktop';

  // 2. Build platform-specific command
  try {
    if (platform === 'darwin') {
      // macOS
      command = `open -a "Draw.io" "${drawioPath}"`;
    } else if (platform === 'linux') {
      // Linux - try Draw.io desktop first, fallback to xdg-open
      try {
        // Check if Draw.io is installed
        execSync('which drawio', { stdio: 'ignore' });
        command = `drawio "${drawioPath}"`;
      } catch {
        // Draw.io not found, use xdg-open
        command = `xdg-open "${drawioPath}"`;
      }
    } else if (platform === 'win32') {
      // Windows
      command = `start "" "${drawioPath}"`;
    } else {
      throw new Error(`Unsupported platform: ${platform}`);
    }

    // 3. Try to open desktop app
    execSync(command, { stdio: 'ignore' });

    return {
      success: true,
      message: `Opened in Draw.io desktop app`,
      openedWith: 'desktop',
    };
  } catch (err) {
    // Desktop app failed, fallback to web app
    try {
      const webUrl = `https://app.diagrams.net/?splash=0&local=1#${encodeURIComponent(drawioPath)}`;

      if (platform === 'darwin') {
        execSync(`open "${webUrl}"`, { stdio: 'ignore' });
      } else if (platform === 'linux') {
        execSync(`xdg-open "${webUrl}"`, { stdio: 'ignore' });
      } else if (platform === 'win32') {
        execSync(`start "" "${webUrl}"`, { stdio: 'ignore', shell: true });
      }

      return {
        success: true,
        message: `Opened in Draw.io web app (desktop app not found)`,
        openedWith: 'web',
      };
    } catch (webErr) {
      return {
        success: false,
        message: `Failed to open Draw.io: ${webErr.message}`,
        openedWith: null,
      };
    }
  }
}

/**
 * Check if Draw.io desktop app is installed
 * @returns {boolean} True if installed
 */
export function isDrawioInstalled() {
  const platform = process.platform;

  try {
    if (platform === 'darwin') {
      // Check macOS Applications folder
      execSync('ls /Applications/Draw.io.app 2>/dev/null', { stdio: 'ignore' });
      return true;
    } else if (platform === 'linux') {
      // Check Linux
      execSync('which drawio', { stdio: 'ignore' });
      return true;
    } else if (platform === 'win32') {
      // Check Windows (check common install locations)
      const paths = [
        'C:\\Program Files\\Draw.io\\drawio.exe',
        'C:\\Program Files (x86)\\Draw.io\\drawio.exe',
        process.env.LOCALAPPDATA + '\\Programs\\Draw.io\\drawio.exe',
      ];
      return paths.some(p => fs.existsSync(p));
    }
    return false;
  } catch {
    return false;
  }
}
