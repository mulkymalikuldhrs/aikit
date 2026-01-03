import { readFile, writeFile, readdir, mkdir } from 'fs/promises';
import { join } from 'path';
import matter from 'gray-matter';
import { CheckpointManager } from './checkpoints.js';

/**
 * Agent metadata
 */
export interface Agent {
  name: string;
  description: string;
  useWhen: string;
  mode: string;
  tools?: string[];
  skills?: string[];
  systemPrompt: string;
  filePath: string;
}

/**
 * Agent Manager
 * Handles custom agent creation and listing
 */
export class AgentManager {
  private agentsDir: string;
  private projectPath: string;

  constructor(projectPath?: string) {
    this.projectPath = projectPath || process.cwd();
    this.agentsDir = join(this.projectPath, '.aikit', 'agents');
  }

  /**
   * Initialize agents directory
   */
  async init(): Promise<void> {
    await mkdir(this.agentsDir, { recursive: true });
  }

  /**
   * List all agents (built-in + custom)
   */
  async listAgents(): Promise<Agent[]> {
    const agents: Agent[] = [];

    // Load built-in agents from package
    const builtinAgents = await this.loadBuiltinAgents();
    agents.push(...builtinAgents);

    // Load custom agents
    const customAgents = await this.loadCustomAgents();
    agents.push(...customAgents);

    return agents;
  }

  /**
   * Get a specific agent
   */
  async getAgent(name: string): Promise<Agent | null> {
    const agents = await this.listAgents();
    return agents.find(a => a.name === name) || null;
  }

  /**
   * Create a new agent
   */
  async createAgent(name: string, description?: string): Promise<Agent> {
    await this.init();

    // Check if agent already exists
    const existing = await this.getAgent(name);
    if (existing) {
      throw new Error(`Agent already exists: ${name}`);
    }

    // Generate agent content through AI interaction
    // For now, create a basic template
    const agentContent = this.generateAgentTemplate(name, description);

    // Write agent file
    const filePath = join(this.agentsDir, `${name}.md`);
    await writeFile(filePath, agentContent);

    // Load and return the created agent
    return this.parseAgentFile(filePath);
  }

  /**
   * Load built-in agents
   */
  private async loadBuiltinAgents(): Promise<Agent[]> {
    // TODO: Load from package agents directory
    // For now, return empty array
    return [];
  }

  /**
   * Load custom agents from .aikit/agents/
   */
  private async loadCustomAgents(): Promise<Agent[]> {
    const agents: Agent[] = [];

    try {
      const files = await readdir(this.agentsDir);

      for (const file of files) {
        if (!file.endsWith('.md')) continue;

        const filePath = join(this.agentsDir, file);
        const agent = await this.parseAgentFile(filePath);
        agents.push(agent);
      }
    } catch {
      // Directory doesn't exist yet
    }

    return agents;
  }

  /**
   * Parse agent file
   */
  private async parseAgentFile(filePath: string): Promise<Agent> {
    const content = await readFile(filePath, 'utf-8');
    const { data, content: body } = matter(content);

    return {
      name: data.name as string || '',
      description: data.description as string || '',
      useWhen: data.useWhen as string || '',
      mode: data.mode as string || 'subagent',
      tools: data.tools as string[] || [],
      skills: data.skills as string[] || [],
      systemPrompt: body.trim(),
      filePath,
    };
  }

  /**
   * Generate agent template
   */
  private generateAgentTemplate(name: string, description?: string): string {
    const desc = description || `A specialized ${name} agent`;

    return `---
name: ${name}
description: ${desc}
useWhen: You need assistance with ${name} tasks
mode: subagent
tools: []
skills: []
---

# ${name.charAt(0).toUpperCase() + name.slice(1)} Agent

You are a specialized AI agent for ${name} tasks.

## Your Expertise
- Expertise area 1
- Expertise area 2
- Expertise area 3

## Your Role
1. Primary responsibility
2. Secondary tasks
3. Collaboration with other agents

## Guidelines
- How to approach tasks
- What to focus on
- What to avoid

## Tools You Have Access To
- Tool 1: description
- Tool 2: description

## Output Format
- Preferred response format
- Code style (if applicable)
- Explanation style
`;
  }

  /**
   * Delete an agent
   */
  async deleteAgent(name: string): Promise<boolean> {
    const agent = await this.getAgent(name);
    if (!agent) {
      return false;
    }

    // Only allow deleting custom agents (not built-in)
    if (!agent.filePath.includes('.aikit/agents')) {
      throw new Error('Cannot delete built-in agents');
    }

    // TODO: Implement file deletion
    return true;
  }
}

/**
 * Format agent for display
 */
export function formatAgent(agent: Agent): string {
  const skills = agent.skills?.join(', ') || 'None';
  const tools = agent.tools?.join(', ') || 'None';

  return `
• ${agent.name} - ${agent.description}
  Use when: ${agent.useWhen}
  Skills: ${skills}
  Tools: ${tools}
`;
}
