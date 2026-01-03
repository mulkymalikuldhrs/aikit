import { readFile, readdir, writeFile, mkdir } from 'fs/promises';
import { join, basename, extname } from 'path';
import matter from 'gray-matter';
import { Config } from '../config.js';
import { paths } from '../../utils/paths.js';
import { Command, CommandFrontmatter, DefaultCommand, COMMAND_CATEGORIES } from './types.js';
import { CORE_COMMANDS } from './core.js';
import { QUICK_COMMANDS } from './quick.js';
import { RESEARCH_COMMANDS } from './research.js';
import { DESIGN_COMMANDS } from './design.js';
import { GIT_COMMANDS } from './git.js';
import { UTILITY_COMMANDS } from './utility.js';
import { CHECKPOINT_COMMANDS } from './checkpoint.js';
import { SESSION_COMMANDS } from './sessions.js';
import { DRAWIO_COMMANDS } from './drawio.js';

/**
 * Aggregate all default commands from separate modules
 */
const DEFAULT_COMMANDS: DefaultCommand[] = [
  ...CORE_COMMANDS,
  ...QUICK_COMMANDS,
  ...RESEARCH_COMMANDS,
  ...DESIGN_COMMANDS,
  ...GIT_COMMANDS,
  ...UTILITY_COMMANDS,
  ...CHECKPOINT_COMMANDS,
  ...SESSION_COMMANDS,
  ...DRAWIO_COMMANDS,
];

/**
 * Command Runner - Manages and executes slash commands
 */
export class CommandRunner {
  private config: Config;
  private commandsCache: Map<string, Command> = new Map();

  constructor(config: Config) {
    this.config = config;
  }

  /**
   * List all available commands
   */
  async listCommands(): Promise<Command[]> {
    const commands: Command[] = [];

    // Add default commands
    for (const cmd of DEFAULT_COMMANDS) {
      commands.push({
        ...cmd,
        filePath: 'built-in',
      });
    }

    // Load custom commands from global config
    const globalCommandsPath = paths.commands(paths.globalConfig());
    try {
      const globalCommands = await this.loadCommandsFromDir(globalCommandsPath);
      commands.push(...globalCommands);
    } catch {
      // No global commands
    }

    // Load custom commands from project config
    const projectCommandsPath = paths.commands(this.config.configPath);
    if (projectCommandsPath !== globalCommandsPath) {
      try {
        const projectCommands = await this.loadCommandsFromDir(projectCommandsPath);
        // Override with project commands
        for (const cmd of projectCommands) {
          const existingIndex = commands.findIndex(c => c.name === cmd.name);
          if (existingIndex >= 0) {
            commands[existingIndex] = cmd;
          } else {
            commands.push(cmd);
          }
        }
      } catch {
        // No project commands
      }
    }

    return commands.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Get a specific command
   */
  async getCommand(name: string): Promise<Command | null> {
    if (this.commandsCache.has(name)) {
      return this.commandsCache.get(name)!;
    }

    const commands = await this.listCommands();
    const command = commands.find(c => c.name === name);

    if (command) {
      this.commandsCache.set(name, command);
    }

    return command || null;
  }

  /**
   * Create a custom command
   */
  async createCommand(name: string, options?: {
    description?: string;
    category?: string;
    usage?: string;
    examples?: string[];
    content?: string;
    global?: boolean;
  }): Promise<Command> {
    const configPath = options?.global ? paths.globalConfig() : this.config.configPath;
    const category = options?.category || 'utility';
    const commandsDir = join(paths.commands(configPath), category);

    await mkdir(commandsDir, { recursive: true });

    const fileName = `${name}.md`;
    const filePath = join(commandsDir, fileName);

    const frontmatter: CommandFrontmatter = {
      name,
      description: options?.description || `Custom command: ${name}`,
      category,
      usage: options?.usage || `/${name}`,
      examples: options?.examples || [`/${name}`],
    };

    const content = options?.content || `## /${name}

Describe what this command does.

## Workflow
1. Step 1
2. Step 2
3. Step 3
`;

    const fileContent = matter.stringify(content, frontmatter);
    await writeFile(filePath, fileContent);

    const command: Command = {
      name,
      description: frontmatter.description!,
      category,
      usage: frontmatter.usage!,
      examples: frontmatter.examples!,
      content,
      filePath,
    };

    this.commandsCache.set(name, command);

    return command;
  }

  /**
   * Format command for agent consumption
   */
  formatForAgent(command: Command, args?: string): string {
    let content = command.content;

    if (args && args.trim()) {
      const argParts = args.trim().split(/\s+/);

      content = content
        .replace(/\$ARGUMENTS/g, args.trim())
        .replace(/\$1/g, argParts[0] || '')
        .replace(/\$2/g, argParts[1] || '')
        .replace(/\$3/g, argParts[2] || '')
        .replace(/\$4/g, argParts[3] || '')
        .replace(/\$5/g, argParts[4] || '');
    }

    let output = `# Command: /${command.name}

## Usage
\`${command.usage}\`

## Description
${command.description}

## Examples
${command.examples.map(e => `- \`${e}\``).join('\n')}

## Workflow
${content}
`;

    if (args && args.trim()) {
      output += `
User arguments are : ${args.trim()}
`;
    }

    return output;
  }

  /**
   * Load commands from directory (recursively)
   */
  private async loadCommandsFromDir(dir: string): Promise<Command[]> {
    const commands: Command[] = [];

    const processDir = async (currentDir: string, category: string) => {
      try {
        const entries = await readdir(currentDir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = join(currentDir, entry.name);

          if (entry.isDirectory()) {
            await processDir(fullPath, entry.name);
          } else if (extname(entry.name) === '.md') {
            const content = await readFile(fullPath, 'utf-8');
            const { data, content: body } = matter(content);
            const frontmatter = data as CommandFrontmatter;
            const name = frontmatter.name || basename(entry.name, '.md');

            commands.push({
              name,
              description: frontmatter.description || '',
              category: frontmatter.category || category,
              usage: frontmatter.usage || `/${name}`,
              examples: frontmatter.examples || [],
              content: body.trim(),
              filePath: fullPath,
            });
          }
        }
      } catch {
        // Directory doesn't exist or can't be read
        return;
      }
    };

    await processDir(dir, 'custom');
    return commands;
  }
}

// Re-export types and constants
export { Command, DefaultCommand, COMMAND_CATEGORIES };
export type { CommandFrontmatter };
