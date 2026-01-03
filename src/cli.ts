/**
 * AIKit CLI
 * 
 * This file serves as the entry point for the CLI.
 * All command implementations are in src/cli/ directory.
 * 
 * Structure:
 * - src/cli/index.ts - Main entry point with program setup
 * - src/cli/commands/ - Individual command implementations
 * - src/cli/helpers.ts - Helper functions for commands
 */

// Re-export everything from the CLI module
export * from './cli/index.js';

// The actual CLI is started in src/cli/index.ts
// This file just serves as the build entry point
import './cli/index.js';
