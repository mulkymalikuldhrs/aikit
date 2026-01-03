import { readFile, writeFile, mkdir, access, constants } from 'fs/promises';
import { join } from 'path';
import { z } from 'zod';
import { Config } from './config.js';

/**
 * Tool configuration status
 */
export type ToolStatus = 'ready' | 'needs_config' | 'error';

/**
 * Configuration method
 */
export type ConfigMethod = 'oauth' | 'manual' | 'none';

/**
 * Tool configuration schema
 */
const ToolConfigSchema = z.object({
  name: z.string(),
  status: z.enum(['ready', 'needs_config', 'error']),
  description: z.string(),
  configMethod: z.enum(['oauth', 'manual', 'none']),
  config: z.record(z.unknown()).optional(),
  errorMessage: z.string().optional(),
});

export type ToolConfig = z.infer<typeof ToolConfigSchema>;

/**
 * Tools registry with configuration
 */
const REGISTERED_TOOLS: Omit<ToolConfig, 'status' | 'config' | 'errorMessage'>[] = [
  {
    name: 'figma-analysis',
    description: 'Analyze Figma designs and extract design tokens using Figma API',
    configMethod: 'oauth',
  },
  // Add more tools here as needed
];

/**
 * Tool Configuration Manager
 */
export class ToolConfigManager {
  private config: Config;
  private toolsConfigPath: string;

  constructor(config: Config) {
    this.config = config;
    this.toolsConfigPath = join(this.config.configPath, 'config', 'tools.json');
  }

  /**
   * Get all registered tools with their current status
   */
  async listTools(): Promise<ToolConfig[]> {
    const savedConfigs = await this.loadConfigs();
    const tools: ToolConfig[] = [];

    for (const tool of REGISTERED_TOOLS) {
      const saved = savedConfigs[tool.name];
      const toolConfig: ToolConfig = {
        ...tool,
        status: this.determineStatus(tool, saved),
        config: saved?.config,
        errorMessage: saved?.errorMessage,
      };
      tools.push(toolConfig);
    }

    return tools;
  }

  /**
   * Get configuration for a specific tool
   */
  async getToolConfig(toolName: string): Promise<ToolConfig | null> {
    const tools = await this.listTools();
    return tools.find(t => t.name === toolName) || null;
  }

  /**
   * Update tool configuration
   */
  async updateToolConfig(toolName: string, updates: {
    config?: Record<string, unknown>;
    status?: ToolStatus;
    errorMessage?: string;
  }): Promise<void> {
    const savedConfigs = await this.loadConfigs();
    const tool = REGISTERED_TOOLS.find(t => t.name === toolName);

    if (!tool) {
      throw new Error(`Tool not found: ${toolName}`);
    }

    const existing = savedConfigs[toolName] || {};
    savedConfigs[toolName] = {
      ...existing,
      ...updates,
    };

    await this.saveConfigs(savedConfigs);
  }

  /**
   * Check if a tool is ready to use
   */
  async isToolReady(toolName: string): Promise<boolean> {
    const toolConfig = await this.getToolConfig(toolName);
    return toolConfig?.status === 'ready';
  }

  /**
   * Get API key for a tool (if configured)
   */
  async getApiKey(toolName: string): Promise<string | null> {
    const toolConfig = await this.getToolConfig(toolName);
    if (toolConfig?.config?.apiKey && typeof toolConfig.config.apiKey === 'string') {
      return toolConfig.config.apiKey;
    }
    return null;
  }

  /**
   * Determine tool status based on configuration
   */
  private determineStatus(
    tool: Omit<ToolConfig, 'status' | 'config' | 'errorMessage'>,
    saved?: { config?: Record<string, unknown>; errorMessage?: string }
  ): ToolStatus {
    if (tool.configMethod === 'none') {
      return 'ready';
    }

    if (saved?.errorMessage) {
      return 'error';
    }

    if (tool.configMethod === 'oauth' || tool.configMethod === 'manual') {
      // Check if API key is configured
      if (saved?.config?.apiKey && typeof saved.config.apiKey === 'string' && saved.config.apiKey.length > 0) {
        return 'ready';
      }
      return 'needs_config';
    }

    return 'needs_config';
  }

  /**
   * Load saved configurations
   */
  private async loadConfigs(): Promise<Record<string, { config?: Record<string, unknown>; errorMessage?: string }>> {
    try {
      await access(this.toolsConfigPath, constants.R_OK);
      const content = await readFile(this.toolsConfigPath, 'utf-8');
      return JSON.parse(content);
    } catch {
      return {};
    }
  }

  /**
   * Save configurations
   */
  private async saveConfigs(configs: Record<string, unknown>): Promise<void> {
    const configDir = join(this.config.configPath, 'config');
    await mkdir(configDir, { recursive: true });
    await writeFile(this.toolsConfigPath, JSON.stringify(configs, null, 2));
  }
}

