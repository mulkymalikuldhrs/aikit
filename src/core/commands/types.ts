/**
 * Command definition
 */
export interface Command {
  name: string;
  description: string;
  category: string;
  usage: string;
  examples: string[];
  content: string;
  filePath: string;
}

/**
 * Command frontmatter schema
 */
export interface CommandFrontmatter {
  name?: string;
  description?: string;
  category?: string;
  usage?: string;
  examples?: string[];
}

/**
 * Command categories
 */
export const COMMAND_CATEGORIES = {
  core: 'Core Workflow',
  quick: 'Quick Actions',
  research: 'Research & Analysis',
  design: 'Design & Planning',
  git: 'Git & Version Control',
  utility: 'Utilities',
  checkpoint: 'Checkpoints',
  session: 'Sessions',
} as const;

/**
 * Default command (without filePath)
 */
export type DefaultCommand = Omit<Command, 'filePath'>;
