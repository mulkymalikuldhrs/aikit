import { readFile, writeFile, readdir, stat, unlink, mkdir, copyFile } from 'fs/promises';
import { join } from 'path';

/**
 * Migration 0.1.9 -> 0.1.10: Add version tracking and restructure skills directory
 */
export const migration = {
  version: '0.1.9-to-0.1.10',
  description: 'Add version tracking file and restructure skills into category directories',

  async up(configPath: string) {
    console.log('Running migration: 0.1.9 -> 0.1.10');

    // 1. Create version file
    const now = new Date().toISOString();
    const versionFile = {
      installedVersion: '0.1.10',
      lastSynced: now,
      packageVersion: '0.1.10',
      migrationHistory: [{
        from: '0.1.9',
        to: '0.1.10',
        timestamp: now,
        status: 'completed'
      }]
    };

    const versionPath = join(configPath, '.version.json');
    await writeFile(versionPath, JSON.stringify(versionFile, null, 2));
    console.log('  ✓ Created .version.json');

    // 2. Restructure skills directory
    await restructureSkills(configPath);
    console.log('  ✓ Restructured skills directory');

    console.log('Migration completed successfully');
  },

  async down(configPath: string) {
    console.log('Rolling back migration: 0.1.10 -> 0.1.9');

    // 1. Remove version file
    const versionPath = join(configPath, '.version.json');
    try {
      await unlink(versionPath);
      console.log('  ✓ Removed .version.json');
    } catch {
      // File might not exist
    }

    // 2. Note: We don't undo skills restructuring as it's non-destructive
    console.log('  ℹ Skills restructuring preserved (safe change)');
    console.log('Rollback completed');
  }
};

/**
 * Restructure skills into category directories
 */
async function restructureSkills(configPath: string) {
  const skillsPath = join(configPath, 'skills');

  try {
    const files = await readdir(skillsPath);

    for (const file of files) {
      const filePath = join(skillsPath, file);
      const stats = await stat(filePath);

      if (file.startsWith('.') || file === 'migrations') {
        continue; // Skip hidden files and migrations dir
      }

      if (stats.isDirectory()) {
        // Already a category directory - skip
        continue;
      }

      if (file.endsWith('.md')) {
        // Read skill file to get category
        const content = await readFile(filePath, 'utf-8');

        // Extract category from frontmatter
        const categoryMatch = content.match(/^category:\s*(.+)$/m);
        let category = 'uncategorized';

        if (categoryMatch) {
          category = categoryMatch[1].trim();
        }

        // Create category directory
        const categoryDir = join(skillsPath, category);
        await mkdir(categoryDir, { recursive: true });

        // Move file to category directory
        const newPath = join(categoryDir, file);

        try {
          // Try to move first
          const fs = await import('fs');
          fs.promises.rename(filePath, newPath)
            .catch(async () => {
              // If rename fails, copy and delete
              await copyFile(filePath, newPath);
              await unlink(filePath);
            });
        } catch (error) {
          console.log(`  ℹ Could not move ${file}: ${(error as Error).message}`);
        }
      }
    }
  } catch (error) {
    console.log(`  ℹ Skills directory check: ${(error as Error).message}`);
    // Don't fail migration if skills directory doesn't exist
  }
}

export default migration;
