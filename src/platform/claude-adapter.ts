import { PlatformAdapter } from './types.js';
import { Command } from '../core/commands.js';
import { Skill } from '../core/skills.js';
import { Agent } from '../core/agents.js';
import { CliPlatform } from '../utils/cli-detector.js';
import { paths } from '../utils/paths.js';
import { writeFile, mkdir, readdir } from 'fs/promises';
import { join } from 'path';
import matter from 'gray-matter';

/**
 * Claude Code CLI Platform Adapter
 * Transforms aikit commands/skills/agents to Claude Code CLI format
 */
export class ClaudeAdapter implements PlatformAdapter {
  readonly platform = CliPlatform.CLAUDE;
  readonly displayName = 'Claude Code CLI';

  // Track installed commands for manifest generation
  private installedCommands: string[] = [];

  getCommandsDir(): string {
    return paths.claudeCommands(true); // project scope
  }

  getSkillsDir(): string {
    return paths.claudeSkills(true); // project scope
  }

  getAgentsDir(): string {
    return paths.claudeAgents(true); // project scope
  }

  async transformCommand(command: Command): Promise<{ name: string; content: string }> {
    // Sanitize filename for Windows (replace colons with dashes)
    const name = command.name.replace(/:/g, '-');
    const content = this.generateCommandContent(command);
    return { name, content };
  }

  async transformSkill(skill: Skill): Promise<{ name: string; directory: string; files: Record<string, string> }> {
    const name = skill.name; // No prefix
    const content = this.generateSkillContent(skill);
    return {
      name,
      directory: name,
      files: { 'SKILL.md': content },
    };
  }

  async transformAgent(agent: Agent): Promise<{ name: string; content: string }> {
    const name = agent.name;
    const content = this.generateAgentContent(agent);
    return { name, content };
  }

  async installCommand(name: string, content: string): Promise<void> {
    const dir = this.getCommandsDir();
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, `${name}.md`), content);
    // Track command for manifest generation
    this.installedCommands.push(name);
  }

  async installSkill(_name: string, directory: string, files: Record<string, string>): Promise<void> {
    const baseDir = this.getSkillsDir();
    const targetDir = join(baseDir, directory);
    await mkdir(targetDir, { recursive: true });
    for (const [filename, content] of Object.entries(files)) {
      await writeFile(join(targetDir, filename), content);
    }
  }

  async installAgent(name: string, content: string): Promise<void> {
    const dir = this.getAgentsDir();
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, `${name}.md`), content);
  }

  private generateCommandContent(command: Command): string {
    // Remove OpenCode-specific headers and formatting
    let workflow = command.content;

    // Remove OpenCode-specific sections
    workflow = workflow
      .replace(/## ⚠️ CRITICAL: The User Has Already Provided Arguments!.*?(?![\n])?.*/gs, '')
      .replace(/\*\*The user has provided arguments with this command!\*\*/g, '')
      .replace(/\*\*The arguments are available in this command response.*?\*\*/g, '')
      .replace(/\*\*YOUR JOB\*\*:.*/gs, '')
      .replace(/1\. Follow command workflow steps.*?\n2\. The workflow will tell you.*?\n3\. Use those arguments.*?\n4\. They have already provided it.*?\n5\. DO NOT ask.*?\n6\. DO: Follow workflow.*?\n+\**Example Scenario\*\*:.*/gs, '')
      .replace(/\*\*User runs:.*?\*\*:\n.*?\n+- Command:.*?\n+- Arguments to use:.*?\n+- You must use.*?\n+- DO NOT:.*?\n+- DO:.*?\n+\*\*\*/g, '')
      .replace(/\*\*\*/g, '');

    // Remove command header
    workflow = workflow.replace(/^# Command: \/[a-z_]*[\s-]+\n+/g, '');

    // Transform $ARGUMENTS to Claude format
    workflow = workflow
      .replace(/\$ARGUMENTS/g, '$ARGUMENTS')
      .replace(/\$1/g, '$1')
      .replace(/\$2/g, '$2');

    // Generate frontmatter
    const frontmatter = {
      description: command.description,
      argumentHint: command.usage.replace(/^\//, '').replace(/<[^>]+>/g, '[args]'),
    };

    return matter.stringify(workflow, frontmatter);
  }

  private generateSkillContent(skill: Skill): string {
    // Transform to Claude skill format
    const frontmatter = {
      name: skill.name,
      description: `${skill.description}. ${skill.useWhen}`,
    };

    const content = `# ${skill.name}

## When to Use
${skill.useWhen}

## Description
${skill.description}

## Workflow
${skill.content}

## Tips
- Use this skill when: ${skill.useWhen.toLowerCase()}
- Category: ${skill.category}
- Tags: ${skill.tags.join(', ')}`;

    return matter.stringify(content, frontmatter);
  }

  private generateAgentContent(agent: Agent): string {
    // Transform to Claude agent format
    const frontmatter = {
      name: agent.name,
      description: agent.useWhen,
      tools: ['Read', 'Edit', 'Bash', 'Grep', 'Glob'], // Default tools
    };

    return matter.stringify(agent.systemPrompt, frontmatter);
  }

  /**
   * Generate commands.json manifest file
   * This ensures local commands are discovered by Claude Code
   * and take precedence over parent directory commands
   *
   * Reference: https://github.com/anthropics/claude-code/issues/14243
   */
  async generateCommandsManifest(): Promise<void> {
    const commandsDir = this.getCommandsDir();
    const manifestPath = join(commandsDir, 'commands.json');

    // Sort commands alphabetically for consistent ordering
    const sortedCommands = [...this.installedCommands].sort();

    const manifest = {
      commands: sortedCommands,
      // Add version for future compatibility
      version: '1.0',
      generatedBy: 'aikit',
      generatedAt: new Date().toISOString(),
    };

    await writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  }
}
