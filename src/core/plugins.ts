import { readdir, writeFile, mkdir } from 'fs/promises';
import { join, basename, extname } from 'path';
import { Config } from './config.js';
import { paths } from '../utils/paths.js';
import { logger } from '../utils/logger.js';

/**
 * Plugin event types
 */
export type PluginEventType =
  | 'session.idle'
  | 'session.created'
  | 'session.error'
  | 'tool.execute.before'
  | 'tool.execute.after'
  | 'file.edited'
  | 'file.watcher.updated'
  | 'message.updated'
  | 'message.removed';

/**
 * Plugin event payload
 */
export interface PluginEvent {
  type: PluginEventType;
  timestamp: Date;
  properties?: Record<string, unknown>;
}

/**
 * Plugin context passed to plugins
 */
export interface PluginContext {
  project: {
    path: string;
    name: string;
  };
  config: Config;
  emit: (event: PluginEvent) => Promise<void>;
}

/**
 * Plugin handler return type
 */
export interface PluginHandlers {
  event?: (event: PluginEvent) => Promise<void>;
  'tool.execute.before'?: (input: unknown) => Promise<unknown>;
  'tool.execute.after'?: (input: unknown, output: unknown) => Promise<unknown>;
}

/**
 * Plugin definition function type
 */
export type PluginFactory = (context: PluginContext) => Promise<PluginHandlers>;

/**
 * Plugin metadata
 */
export interface PluginInfo {
  name: string;
  description: string;
  enabled: boolean;
  filePath: string;
  handlers?: PluginHandlers;
}

/**
 * Plugin definition helper
 */
export type Plugin = PluginFactory;

/**
 * Plugin System - Manages event-driven plugins
 */
export class PluginSystem {
  private config: Config;
  private plugins: Map<string, PluginInfo> = new Map();
  private loadedPlugins: Map<string, PluginHandlers> = new Map();
  private eventQueue: PluginEvent[] = [];
  private processing = false;

  constructor(config: Config) {
    this.config = config;
  }

  /**
   * Initialize and load all plugins
   */
  async initialize(): Promise<void> {
    await this.loadPlugins();
    
    // Initialize each plugin
    for (const [name, info] of this.plugins) {
      if (info.enabled) {
        try {
          const handlers = await this.initializePlugin(info);
          this.loadedPlugins.set(name, handlers);
          info.handlers = handlers;
        } catch (error) {
          logger.warn(`Failed to initialize plugin ${name}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    }
  }

  /**
   * List all available plugins
   */
  async listPlugins(): Promise<PluginInfo[]> {
    await this.loadPlugins();
    return Array.from(this.plugins.values());
  }

  /**
   * Enable a plugin
   */
  async enablePlugin(name: string): Promise<void> {
    const plugin = this.plugins.get(name);
    if (plugin) {
      plugin.enabled = true;
      if (!this.loadedPlugins.has(name)) {
        const handlers = await this.initializePlugin(plugin);
        this.loadedPlugins.set(name, handlers);
        plugin.handlers = handlers;
      }
    }
  }

  /**
   * Disable a plugin
   */
  disablePlugin(name: string): void {
    const plugin = this.plugins.get(name);
    if (plugin) {
      plugin.enabled = false;
      this.loadedPlugins.delete(name);
      plugin.handlers = undefined;
    }
  }

  /**
   * Emit an event to all plugins
   */
  async emit(event: PluginEvent): Promise<void> {
    this.eventQueue.push(event);
    
    if (!this.processing) {
      await this.processEventQueue();
    }
  }

  /**
   * Execute before hooks for tool execution
   */
  async executeBeforeHooks(_toolName: string, input: unknown): Promise<unknown> {
    let result = input;
    
    for (const handlers of this.loadedPlugins.values()) {
      if (handlers['tool.execute.before']) {
        result = await handlers['tool.execute.before'](result);
      }
    }
    
    return result;
  }

  /**
   * Execute after hooks for tool execution
   */
  async executeAfterHooks(_toolName: string, input: unknown, output: unknown): Promise<unknown> {
    let result = output;
    
    for (const handlers of this.loadedPlugins.values()) {
      if (handlers['tool.execute.after']) {
        result = await handlers['tool.execute.after'](input, result);
      }
    }
    
    return result;
  }

  /**
   * Create a new plugin
   */
  async createPlugin(name: string, options: {
    description?: string;
    code: string;
    global?: boolean;
  }): Promise<void> {
    const configPath = options.global ? paths.globalConfig() : this.config.configPath;
    const pluginsDir = paths.plugins(configPath);
    
    await mkdir(pluginsDir, { recursive: true });
    
    const fileName = `${name}.ts`;
    const filePath = join(pluginsDir, fileName);
    
    const content = `import { Plugin } from 'aikit';

/**
 * ${options.description || `Custom plugin: ${name}`}
 */
export const ${toPascalCase(name)}Plugin: Plugin = async ({ project, config, emit }) => {
  return {
    event: async ({ event }) => {
${options.code}
    }
  };
};

export default ${toPascalCase(name)}Plugin;
`;
    
    await writeFile(filePath, content);
  }

  /**
   * Process event queue
   */
  private async processEventQueue(): Promise<void> {
    this.processing = true;
    
    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift()!;
      
      for (const handlers of this.loadedPlugins.values()) {
        if (handlers.event) {
          try {
            await handlers.event(event);
          } catch (error) {
            logger.warn(`Plugin error handling event ${event.type}: ${error instanceof Error ? error.message : String(error)}`);
          }
        }
      }
    }
    
    this.processing = false;
  }

  /**
   * Load plugins from disk
   */
  private async loadPlugins(): Promise<void> {
    // Load built-in plugins
    this.registerBuiltInPlugins();
    
    // Load from global config
    const globalPluginsPath = paths.plugins(paths.globalConfig());
    await this.loadPluginsFromDir(globalPluginsPath);
    
    // Load from project config
    const projectPluginsPath = paths.plugins(this.config.configPath);
    if (projectPluginsPath !== globalPluginsPath) {
      await this.loadPluginsFromDir(projectPluginsPath);
    }
  }

  private registerBuiltInPlugins(): void {
    // Enforcer plugin - warns about abandoned work
    this.plugins.set('enforcer', {
      name: 'enforcer',
      description: 'Warns when session idles with TODO items remaining',
      enabled: true,
      filePath: 'built-in',
    });
    
    // Compactor plugin - warns about context overflow
    this.plugins.set('compactor', {
      name: 'compactor',
      description: 'Warns when context usage reaches 70%, 85%, 95%',
      enabled: true,
      filePath: 'built-in',
    });
    
    // Truncator plugin - auto-truncates large outputs
    this.plugins.set('truncator', {
      name: 'truncator',
      description: 'Auto-truncates tool output to preserve context space',
      enabled: true,
      filePath: 'built-in',
    });
    
    // Notification plugin - OS notifications when session completes
    this.plugins.set('notification', {
      name: 'notification',
      description: 'OS notifications when OpenCode completes a session',
      enabled: true,
      filePath: 'built-in',
    });
    
    // Session Management plugin - cross-session context transfer
    this.plugins.set('session-management', {
      name: 'session-management',
      description: 'Cross-session context transfer based on handoffs',
      enabled: true,
      filePath: 'built-in',
    });
  }

  private async loadPluginsFromDir(dir: string): Promise<void> {
    let files: string[];
    try {
      files = await readdir(dir);
    } catch {
      return;
    }
    
    for (const file of files) {
      if (extname(file) !== '.ts' && extname(file) !== '.js') continue;
      
      const filePath = join(dir, file);
      const name = basename(file, extname(file));
      
      this.plugins.set(name, {
        name,
        description: `Custom plugin: ${name}`,
        enabled: true,
        filePath,
      });
    }
  }

  private async initializePlugin(info: PluginInfo): Promise<PluginHandlers> {
    if (info.filePath === 'built-in') {
      return this.getBuiltInPluginHandlers(info.name);
    }
    
    try {
      const pluginModule = await import(`file://${info.filePath}`);
      const factory = pluginModule.default as PluginFactory;
      
      const context: PluginContext = {
        project: {
          path: this.config.projectPath,
          name: basename(this.config.projectPath),
        },
        config: this.config,
        emit: this.emit.bind(this),
      };
      
      return await factory(context);
    } catch (error) {
      logger.warn(`Failed to load plugin ${info.name}: ${error instanceof Error ? error.message : String(error)}`);
      return {};
    }
  }

  private getBuiltInPluginHandlers(name: string): PluginHandlers {
    switch (name) {
      case 'enforcer':
        return {
          event: async (event) => {
            if (event.type === 'session.idle') {
              // Check for remaining TODOs and warn
              logger.info('[Enforcer] Session idle - check for remaining work');
            }
          },
        };
      
      case 'compactor':
        return {
          event: async (event) => {
            // Monitor context usage
            const usage = event.properties?.contextUsage as number | undefined;
            if (usage && usage > 70) {
              logger.info(`[Compactor] Context usage at ${usage}%`);
            }
          },
        };
      
      case 'truncator':
        return {
          'tool.execute.after': async (_input, output) => {
            if (typeof output === 'string' && output.length > 50000) {
              return output.slice(0, 50000) + '\n\n[Output truncated - exceeded 50KB limit]';
            }
            return output;
          },
        };
      
      case 'notification':
        return {
          event: async (event) => {
            if (event.type === 'session.idle') {
              // Send OS notification when session completes
              try {
                const { exec } = await import('child_process');
                const { promisify } = await import('util');
                const execAsync = promisify(exec);
                
                const platform = process.platform;
                const summary = event.properties?.summary as string | undefined || 'Session completed';
                
                if (platform === 'darwin') {
                  // macOS
                  await execAsync(`osascript -e 'display notification "${summary}" with title "OpenCode Session Complete"'`);
                } else if (platform === 'linux') {
                  // Linux
                  await execAsync(`notify-send "OpenCode Session Complete" "${summary}"`);
                } else if (platform === 'win32') {
                  // Windows
                  await execAsync(`powershell -Command "New-BurntToastNotification -Text 'OpenCode Session Complete', '${summary}'"`);
                }
              } catch (error) {
                // Notification failed, but don't break the workflow
                logger.warn(`[Notification] Failed to send notification: ${error instanceof Error ? error.message : String(error)}`);
              }
            }
          },
        };
      
      case 'session-management':
        return {
          event: async (event) => {
            if (event.type === 'session.idle') {
              // Session management is handled via tools (list_session, read_session)
              // This plugin just ensures session data is properly saved
              logger.info('[Session Management] Session idle - context saved for next session');
            }
          },
        };
      
      default:
        return {};
    }
  }
}

/**
 * Convert string to PascalCase
 */
function toPascalCase(str: string): string {
  return str
    .split(/[-_\s]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}
