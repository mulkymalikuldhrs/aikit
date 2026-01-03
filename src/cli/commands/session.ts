/**
 * Session Commands
 *
 * Manages development sessions for tracking work progress
 */

import { Command } from 'commander';
import chalk from 'chalk';

import {
  startSession,
  updateSession,
  endSession,
  showCurrentSession,
  listSessions,
  showSession,
  searchSessions,
} from '../helpers.js';

/**
 * Register session command group
 */
export function registerSessionCommand(program: Command): Command {
  const sessionCmd = program
    .command('session')
    .description('Manage development sessions');

  // Start a new session
  sessionCmd
    .command('start [name]')
    .description('Start a new development session')
    .option('-g, --goals <goals...>', 'Session goals')
    .action(async (name, options) => {
      await startSession(name, options.goals);
    });

  // Update current session
  sessionCmd
    .command('update [notes]')
    .description('Add progress notes to current session')
    .action(async (notes) => {
      await updateSession(notes);
    });

  // End current session
  sessionCmd
    .command('end')
    .description('End current session with summary')
    .action(async () => {
      await endSession();
    });

  // Show current session
  sessionCmd
    .command('current')
    .description('Show current active session')
    .action(async () => {
      await showCurrentSession();
    });

  // List all sessions
  sessionCmd
    .command('list')
    .description('List all sessions')
    .action(async () => {
      await listSessions();
    });

  // Show specific session
  sessionCmd
    .command('show <sessionId>')
    .description('Show details of a specific session')
    .action(async (sessionId) => {
      await showSession(sessionId);
    });

  // Search sessions
  sessionCmd
    .command('search <query>')
    .description('Search sessions by keyword')
    .action(async (query) => {
      await searchSessions(query);
    });

  return sessionCmd;
}
