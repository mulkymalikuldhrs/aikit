import { PlatformAdapter } from './types.js';
import { Command } from '../core/commands.js';
import { Skill } from '../core/skills.js';
import { Agent } from '../core/agents.js';
import { CliPlatform } from '../utils/cli-detector.js';
import { paths } from '../utils/paths.js';
import { readFile, writeFile, mkdir, access } from 'fs/promises';
import { join } from 'path';

interface TransformedSkill {
  name: string;
  directory: string;
  files: Record<string, string>;
}

/**
 * OpenCode Platform Adapter
 * Transforms aikit commands/skills/agents to OpenCode format
 */
export class OpenCodeAdapter implements PlatformAdapter {
  readonly platform = CliPlatform.OPENCODE;
  readonly displayName = 'OpenCode';

  getCommandsDir(): string {
    return join(process.cwd(), '.opencode', 'command');
  }

  getSkillsDir(): string {
    return join(process.cwd(), '.opencode', 'skill');
  }

  getAgentsDir(): string {
    return join(paths.opencodeConfig(), 'agent');
  }

  async transformCommand(command: Command): Promise<{ name: string; content: string }> {
    // Sanitize filename for Windows (replace colons with dashes)
    const sanitizedName = command.name.replace(/:/g, '-');
    const name = `ak_cm_${sanitizedName}`;
    const content = this.generateCommandContent(command);
    return { name, content };
  }

  async transformSkill(skill: Skill): Promise<TransformedSkill> {
    const skillName = `ak_sk_${skill.name}`;
    const skillContent = this.generateSkillContent(skill);
    const result: TransformedSkill = {
      name: skillName,
      directory: '',
      files: { [`${skillName}.md`]: skillContent },
    };
    return result;
  }

  async transformAgent(agent: Agent): Promise<{ name: string; content: string }> {
    // Rename build and planner to avoid conflicts with OpenCode's default modes
    const name = (agent.name === 'build' || agent.name === 'planner')
      ? `aikit${agent.name}`
      : agent.name;
    const content = this.generateAgentContent(agent, name);
    return { name, content };
  }

  async installCommand(name: string, content: string): Promise<void> {
    const dir = this.getCommandsDir();
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, `${name}.md`), content);
  }

  async installSkill(_name: string, directory: string, files: Record<string, string>): Promise<void> {
    const baseDir = this.getSkillsDir();
    const targetDir = directory ? join(baseDir, directory) : baseDir;
    await mkdir(targetDir, { recursive: true });
    for (const [filename, content] of Object.entries(files)) {
      await writeFile(join(targetDir, filename), content);
    }
  }

  async installAgent(name: string, content: string): Promise<void> {
    const dir = this.getAgentsDir();
    await mkdir(dir, { recursive: true });
    const filePath = join(dir, `${name}.md`);

    try {
      await access(filePath);
      // File exists - check if it has mode: subagent
      const existingContent = await readFile(filePath, 'utf-8');
      if (!existingContent.includes('mode: subagent')) {
        // Missing mode: subagent - add it to preserve user edits but ensure critical config
        const matter = await import('gray-matter');
        const { data: frontmatter, content: body } = matter.default(existingContent);
        frontmatter.mode = 'subagent';
        const updatedContent = matter.default.stringify(body, frontmatter);
        await writeFile(filePath, updatedContent, 'utf-8');
      }
      // File exists and has mode: subagent - keep user edits
    } catch {
      // File doesn't exist - create it
      await writeFile(filePath, content, 'utf-8');
    }
  }

  private generateCommandContent(command: Command): string {
    const examples = command.examples.map(e => {
      const prefixed = e.replace(/\//g, '/ak_cm_');
      return `- \`${prefixed}\``;
    }).join('\n');

    return `# Command: /ak_cm_${command.name}

## Description
${command.description}

## Usage
\`${command.usage.replace(/\//g, '/ak_cm_')}\`

## Examples
${examples}

## ⚠️ CRITICAL: The User Has Already Provided Arguments!

**The user has provided arguments with this command!**

The arguments are available in this command response - look at the command workflow below, which now includes explicit instructions to use the provided arguments.

**YOUR JOB**:
1. Follow the command workflow steps
2. The workflow will tell you to look at "Arguments Provided" section
3. Use those arguments - do NOT ask the user for this information!
4. They have already provided it - extract and use it!

**Example Scenario**:
- User runs: \`/ak_cm_${command.name} snake game with html & css\`
- Command: \`/ak_cm_${command.name}\`
- Arguments to use: \`snake game with html & css\`
- You must use "snake game with html & css" as provided in the workflow!

**DO NOT**: Ask "Please provide a task description"
**DO**: Follow the workflow and use the arguments provided in it!

## Workflow
${command.content}

**Category**: ${command.category}`;
  }

  private generateSkillContent(skill: Skill): string {
    const relativePath = skill.filePath.startsWith(process.cwd())
      ? skill.filePath.replace(process.cwd(), '').replace(/\\/g, '/').replace(/^\//, '')
      : `.aikit/skills/${skill.name}.md`;

    return `Use the **${skill.name} skill** ${skill.useWhen.toLowerCase()}.

READ ${relativePath}

## Description
${skill.description}

## When to Use
${skill.useWhen}

## Workflow
${skill.content.split('\n').slice(0, 20).join('\n')}${skill.content.split('\n').length > 20 ? '\n\n... (see full skill file for complete workflow)' : ''}

**IMPORTANT**: Follow this skill's workflow step by step. Do not skip steps.
Complete the checklist at the end of the skill.`;
  }

  private generateAgentContent(agent: Agent, nameOverride?: string): string {
    // All agents (including renamed ones) should have mode: subagent for tab switching
    return `---
name: ${nameOverride || agent.name}
mode: subagent
---

${agent.systemPrompt}`;
  }
}
