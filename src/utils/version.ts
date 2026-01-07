import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { compare, gt, valid } from 'semver';

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

/**
 * Compare two versions using semver
 * @returns 1 if v1 > v2, -1 if v1 < v2, 0 if equal
 */
export function compareVersions(v1: string, v2: string): number {
  return compare(v1, v2);
}

/**
 * Check if v1 is greater than v2
 */
export function isGreaterThan(v1: string, v2: string): boolean {
  return gt(v1, v2);
}

/**
 * Validate if version string is valid semver
 */
export function isValidVersion(version: string): boolean {
  return valid(version) !== null;
}
