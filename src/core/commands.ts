/**
 * This file re-exports the modular commands structure for backward compatibility.
 * The actual implementation is in the commands/ directory.
 *
 * @deprecated Import directly from './commands/index.js' instead
 */

export {
  CommandRunner,
  Command,
  COMMAND_CATEGORIES,
  type CommandFrontmatter,
  type DefaultCommand,
} from './commands/index.js';
