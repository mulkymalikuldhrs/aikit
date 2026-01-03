import { Command } from '../core/commands.js';
import { Skill } from '../core/skills.js';
import { Agent } from '../core/agents.js';
import { CliPlatform } from '../utils/cli-detector.js';

/**
 * Platform adapter interface
 * Adapters transform aikit's commands/skills/agents to platform-specific formats
 */
export interface PlatformAdapter {
  readonly platform: CliPlatform;
  readonly displayName: string;

  /**
   * Get commands directory for this platform
   */
  getCommandsDir(): string;

  /**
   * Get skills directory for this platform
   */
  getSkillsDir(): string;

  /**
   * Get agents directory for this platform
   */
  getAgentsDir(): string;

  /**
   * Transform aikit command to platform-specific format
   */
  transformCommand(command: Command): Promise<{ name: string; content: string }>;

  /**
   * Transform aikit skill to platform-specific format
   */
  transformSkill(skill: Skill): Promise<{ name: string; directory: string; files: Record<string, string> }>;

  /**
   * Transform aikit agent to platform-specific format
   */
  transformAgent(agent: Agent): Promise<{ name: string; content: string }>;

  /**
   * Install command to filesystem
   */
  installCommand(name: string, content: string): Promise<void>;

  /**
   * Install skill to filesystem
   */
  installSkill(name: string, directory: string, files: Record<string, string>): Promise<void>;

  /**
   * Install agent to filesystem
   */
  installAgent(name: string, content: string): Promise<void>;
}
