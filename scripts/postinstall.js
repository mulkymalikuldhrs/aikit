/**
 * Postinstall script for AIKit
 * Sets up global configuration on first install
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isWindows = process.platform === 'win32';

function getConfigDir() {
  if (isWindows) {
    return path.join(process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'), 'aikit');
  }
  return path.join(os.homedir(), '.config', 'aikit');
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Recursively copy a directory
 */
function copyDirRecursive(src, dest) {
  // Check if source exists
  if (!fs.existsSync(src)) {
    return;
  }

  const stat = fs.statSync(src);
  
  if (stat.isDirectory()) {
    // Create destination directory
    ensureDir(dest);
    
    // Copy contents
    const entries = fs.readdirSync(src);
    for (const entry of entries) {
      const srcPath = path.join(src, entry);
      const destPath = path.join(dest, entry);
      copyDirRecursive(srcPath, destPath);
    }
  } else if (stat.isFile()) {
    // Copy file if it doesn't exist at destination
    if (!fs.existsSync(dest)) {
      try {
        fs.copyFileSync(src, dest);
      } catch (err) {
        // Ignore copy errors (e.g., permission issues)
        console.warn(`  Warning: Could not copy ${src}: ${err.message}`);
      }
    }
  }
}

function main() {
  const configDir = getConfigDir();

  // Create directory structure
  const dirs = [
    '',
    'skills',
    'agents',
    'commands',
    'tools',
    'plugins',
    'memory',
    'memory/_templates',
    'memory/handoffs',
    'memory/observations',
    'memory/research',
    'feedback',
  ];

  for (const dir of dirs) {
    ensureDir(path.join(configDir, dir));
  }

  // Create default config if not exists
  const configFile = path.join(configDir, 'aikit.json');
  if (!fs.existsSync(configFile)) {
    const defaultConfig = {
      version: '0.1.0',
      skills: { enabled: true },
      agents: { enabled: true, default: 'build' },
      commands: { enabled: true },
      tools: { enabled: true },
      plugins: { enabled: true },
      memory: { enabled: true },
      beads: { enabled: true },
      antiHallucination: { enabled: true },
    };
    
    fs.writeFileSync(configFile, JSON.stringify(defaultConfig, null, 2));
    console.log('✓ Created AIKit configuration at:', configDir);
  }
  
  // Copy skills recursively if they don't exist
  const skillsDir = path.join(configDir, 'skills');
  const sourceSkillsDir = path.join(__dirname, '..', 'skills');
  
  if (fs.existsSync(sourceSkillsDir)) {
    let skillCount = 0;
    const categories = fs.readdirSync(sourceSkillsDir);
    
    for (const category of categories) {
      const categoryPath = path.join(sourceSkillsDir, category);
      const stat = fs.statSync(categoryPath);
      
      if (stat.isDirectory()) {
        // It's a category directory (e.g., debugging/, design/, etc.)
        const targetCategoryPath = path.join(skillsDir, category);
        copyDirRecursive(categoryPath, targetCategoryPath);
        
        // Count skills
        const skillFiles = fs.readdirSync(categoryPath).filter(f => f.endsWith('.md'));
        skillCount += skillFiles.length;
      } else if (category.endsWith('.md')) {
        // It's a direct skill file
        const targetPath = path.join(skillsDir, category);
        if (!fs.existsSync(targetPath)) {
          try {
            fs.copyFileSync(categoryPath, targetPath);
            skillCount++;
          } catch (err) {
            console.warn(`  Warning: Could not copy ${category}: ${err.message}`);
          }
        }
      }
    }
    
    if (skillCount > 0) {
      console.log(`✓ Installed ${skillCount} skills`);
    }
  }
  
  console.log('\n🚀 AIKit installed successfully!');
  console.log('\nRun "aikit status" to verify installation.');
  console.log('Run "aikit install" to add AIKit plugin to OpenCode.\n');
}

main();
