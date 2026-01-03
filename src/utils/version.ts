import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

/**
 * Get package version from package.json
 * This is the single source of truth for version
 */
export function getVersion(): string {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const packageJsonPath = join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    return packageJson.version;
  } catch (error) {
    // Fallback to 0.0.0 if can't read package.json
    console.warn('Warning: Could not read version from package.json, using fallback');
    return '0.0.0';
  }
}

