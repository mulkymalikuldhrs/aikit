/**
 * AIKit Superpowers Plugin for OpenCode
 * 
 * This plugin integrates AIKit's skills, agents, and tools with OpenCode.
 * Install by copying to ~/.config/opencode/plugin/aikit.ts
 */

import type { Plugin } from 'opencode';

interface AIKitSkill {
  name: string;
  description: string;
  useWhen: string;
  content: string;
}

interface AIKitAgent {
  name: string;
  displayName: string;
  description: string;
  useWhen: string;
  systemPrompt: string;
}

interface AIKitMode {
  name: string;
  displayName: string;
  description: string;
  icon: string;
}

/**
 * Load skills from AIKit configuration
 */
async function loadSkills(): Promise<AIKitSkill[]> {
  const fs = await import('fs/promises');
  const path = await import('path');
  const matter = await import('gray-matter');
  const os = await import('os');
  
  const skills: AIKitSkill[] = [];
  
  // Check both global and project locations
  const locations = [
    path.join(os.homedir(), '.config', 'aikit', 'skills'),
    path.join(os.homedir(), 'AppData', 'Roaming', 'aikit', 'skills'),
    path.join(process.cwd(), '.aikit', 'skills'),
  ];

  for (const skillsDir of locations) {
    try {
      const files = await fs.readdir(skillsDir);
      
      for (const file of files) {
        if (!file.endsWith('.md')) continue;
        
        const content = await fs.readFile(path.join(skillsDir, file), 'utf-8');
        const { data, content: body } = matter.default(content);
        
        skills.push({
          name: data.name || file.replace('.md', ''),
          description: data.description || '',
          useWhen: data.useWhen || '',
          content: body.trim(),
        });
      }
    } catch {
      // Directory doesn't exist, skip
    }
  }

  return skills;
}

/**
 * Get agent definitions
 */
function getAgents(): AIKitAgent[] {
  return [
    {
      name: 'planner',
      displayName: '@planner',
      description: 'Strategic planning and multi-agent coordination',
      useWhen: 'Complex tasks requiring architecture decisions or multi-step planning',
      systemPrompt: `You are a strategic planner agent. Break down complex tasks, coordinate work, and create implementation plans.`,
    },
    {
      name: 'build',
      displayName: '@build',
      description: 'Primary execution agent for implementing features',
      useWhen: 'Implementing features, writing code, making changes',
      systemPrompt: `You are the build agent. Implement code using TDD principles. Write tests first, then implementation.`,
    },
    {
      name: 'rush',
      displayName: '@rush',
      description: 'Fast execution with minimal planning',
      useWhen: 'Quick fixes, hotfixes, simple edits',
      systemPrompt: `You are the rush agent. Make quick, focused changes with minimal ceremony.`,
    },
    {
      name: 'review',
      displayName: '@review',
      description: 'Code review, debugging, and security audits',
      useWhen: 'Reviewing code, finding bugs, security review',
      systemPrompt: `You are the review agent. Review code for correctness, security, performance, and maintainability.`,
    },
    {
      name: 'scout',
      displayName: '@scout',
      description: 'External research - docs, GitHub, frameworks',
      useWhen: 'Researching libraries, finding patterns, learning frameworks',
      systemPrompt: `You are the scout agent. Research external resources and provide actionable recommendations.`,
    },
    {
      name: 'explore',
      displayName: '@explore',
      description: 'Fast codebase navigation and search',
      useWhen: 'Finding files, understanding codebase, searching patterns',
      systemPrompt: `You are the explore agent. Navigate and understand the codebase quickly.`,
    },
  ];
}

/**
 * Get mode definitions
 */
function getModes(): AIKitMode[] {
  return [
    {
      name: 'plan',
      displayName: 'Plan Mode',
      description: 'Create detailed implementation plans before execution',
      icon: '📋',
    },
    {
      name: 'build',
      displayName: 'Build Mode',
      description: 'Direct execution mode for implementing features',
      icon: '🔧',
    },
    {
      name: 'one-shot',
      displayName: 'One-Shot Mode',
      description: 'End-to-end autonomous task execution',
      icon: '🚀',
    },
  ];
}

/**
 * AIKit Superpowers Plugin
 */
export const AIKitPlugin: Plugin = async ({ project, client }) => {
  let skillsCache: AIKitSkill[] | null = null;
  let currentMode: string = 'build'; // Default mode
  
  // Initialize mode from config if available
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    const configPath = path.join(process.cwd(), '.aikit', 'aikit.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(await fs.readFile(configPath, 'utf-8'));
      currentMode = config.mode || 'build';
    }
  } catch {
    // Use default mode
  }
  
  return {
    // Custom tools for skill and agent access
    tools: {
      find_skills: {
        description: 'Find available AIKit workflow skills. Use at the start of any task to find the right workflow.',
        args: {
          query: {
            type: 'string',
            description: 'Optional search query to filter skills',
            required: false,
          },
        },
        async execute({ query }) {
          if (!skillsCache) {
            skillsCache = await loadSkills();
          }
          
          let filtered = skillsCache;
          if (query) {
            const lowerQuery = (query as string).toLowerCase();
            filtered = skillsCache.filter(s =>
              s.name.toLowerCase().includes(lowerQuery) ||
              s.description.toLowerCase().includes(lowerQuery)
            );
          }
          
          if (filtered.length === 0) {
            return 'No skills found. Create skills in .aikit/skills/ or ~/.config/aikit/skills/';
          }
          
          return filtered.map(s => `- **${s.name}**: ${s.description}\n  _Use when: ${s.useWhen}_`).join('\n\n');
        },
      },
      
      use_skill: {
        description: 'Load and use a specific skill workflow. IMPORTANT: Follow the workflow step by step.',
        args: {
          name: {
            type: 'string',
            description: 'Name of the skill to use',
            required: true,
          },
        },
        async execute({ name }) {
          if (!skillsCache) {
            skillsCache = await loadSkills();
          }
          
          const skill = skillsCache.find(s => s.name === name);
          if (!skill) {
            return `Skill not found: ${name}\n\nAvailable skills:\n${skillsCache.map(s => `- ${s.name}`).join('\n')}`;
          }
          
          return `# Skill: ${skill.name}

## When to Use
${skill.useWhen}

## Description
${skill.description}

---

${skill.content}

---

**IMPORTANT**: Follow this workflow step by step. Do not skip steps. Check off items as you complete them.`;
        },
      },
      
      list_agents: {
        description: 'List available AIKit agents and their specializations',
        args: {},
        async execute() {
          const agents = getAgents();
          return agents.map(a => `- **${a.displayName}**: ${a.description}\n  _Use when: ${a.useWhen}_`).join('\n\n');
        },
      },
      
      delegate_to: {
        description: 'Delegate a task to a specialist agent',
        args: {
          agent: {
            type: 'string',
            description: 'Agent name (planner, build, rush, review, scout, explore)',
            required: true,
          },
          task: {
            type: 'string',
            description: 'Task description to delegate',
            required: true,
          },
        },
        async execute({ agent, task }) {
          const agents = getAgents();
          const targetAgent = agents.find(a => a.name === agent);
          
          if (!targetAgent) {
            return `Unknown agent: ${agent}\n\nAvailable agents: ${agents.map(a => a.name).join(', ')}`;
          }
          
          return `# Delegating to ${targetAgent.displayName}

## Task
${task}

## Agent Instructions
${targetAgent.systemPrompt}

---

Now acting as ${targetAgent.displayName}. Proceeding with the task...`;
        },
      },
      
      // Mode switching tools
      get_current_mode: {
        description: 'Get the current AIKit mode',
        args: {},
        async execute() {
          const modes = getModes();
          const currentModeInfo = modes.find(m => m.name === currentMode);
          return `Current mode: ${currentModeInfo?.displayName} (${currentMode})`;
        },
      },
      
      set_mode: {
        description: 'Set the AIKit mode (plan, build, or one-shot)',
        args: {
          mode: {
            type: 'string',
            description: 'Mode to set (plan, build, one-shot)',
            required: true,
          },
        },
        async execute({ mode }) {
          const modes = getModes();
          const validModes = modes.map(m => m.name);
          
          if (!validModes.includes(mode)) {
            return `Invalid mode. Available modes: ${validModes.join(', ')}`;
          }
          
          currentMode = mode;
          
          // Save mode to config
          try {
            const fs = await import('fs/promises');
            const path = await import('path');
            const configPath = path.join(process.cwd(), '.aikit', 'aikit.json');
            const config = fs.existsSync(configPath) 
              ? JSON.parse(await fs.readFile(configPath, 'utf-8'))
              : {};
            
            config.mode = mode;
            await fs.writeFile(configPath, JSON.stringify(config, null, 2));
          } catch {
            // Ignore config save errors
          }
          
          const modeInfo = modes.find(m => m.name === mode);
          return `Mode set to: ${modeInfo?.displayName}`;
        },
      },
      
      list_modes: {
        description: 'List available AIKit modes',
        args: {},
        async execute() {
          const modes = getModes();
          return modes.map(m => `- **${m.icon} ${m.displayName}**: ${m.description}`).join('\n');
        },
      },
    },
    
    // Event handlers
    event: async ({ event }) => {
      // Log session events for debugging
      if (event.type === 'session.created') {
        console.log('[AIKit] New session started');
      }
      
      // Handle mode change events
      if (event.type === 'mode.changed') {
        const newMode = event.data?.mode;
        if (newMode && ['plan', 'build', 'one-shot'].includes(newMode)) {
          currentMode = newMode;
          console.log(`[AIKit] Mode changed to: ${newMode}`);
        }
      }
    },
  };
};

export default AIKitPlugin;
