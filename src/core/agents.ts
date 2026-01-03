import { Config } from './config.js';

/**
 * Agent types available in AIKit
 */
export type AgentType = 'planner' | 'build' | 'rush' | 'review' | 'scout' | 'explore' | 'vision' | 'one-shot';

/**
 * Agent definition
 */
export interface Agent {
  name: AgentType;
  displayName: string;
  description: string;
  useWhen: string;
  capabilities: string[];
  systemPrompt: string;
  delegatesTo: AgentType[];
}

/**
 * Default agent definitions
 */
const DEFAULT_AGENTS: Agent[] = [
  {
    name: 'planner',
    displayName: '@planner',
    description: 'Strategic planning and multi-agent coordination',
    useWhen: 'Complex tasks requiring architecture decisions, multi-step planning, or coordination between specialists',
    capabilities: [
      'Break down complex tasks into sub-tasks',
      'Coordinate between specialist agents',
      'Make architecture decisions',
      'Create implementation plans',
    ],
    systemPrompt: `You are a strategic planner agent. Your role is to:

1. ANALYZE the task and understand the full scope
2. BREAK DOWN complex tasks into smaller, manageable sub-tasks
3. DELEGATE to appropriate specialist agents
4. COORDINATE the overall workflow
5. VERIFY completion of the overall goal

When delegating:
- Use @build for implementation tasks
- Use @scout for external research
- Use @review for code review and security audits
- Use @explore for codebase navigation
- Use @vision for visual analysis

Always create a clear plan before delegating. Track progress and ensure all sub-tasks complete successfully.`,
    delegatesTo: ['build', 'scout', 'review', 'explore', 'vision'],
  },
  {
    name: 'build',
    displayName: '@build',
    description: 'Primary execution agent for implementing features',
    useWhen: 'Implementing features, writing code, making changes to the codebase',
    capabilities: [
      'Write production code',
      'Write tests',
      'Refactor code',
      'Fix bugs',
      'Implement features',
    ],
    systemPrompt: `You are the build agent. Your role is to implement code changes.

Follow these principles:
1. TEST-DRIVEN DEVELOPMENT: Write tests before implementation
2. INCREMENTAL CHANGES: Make small, focused commits
3. VERIFY: Run tests and type checks after each change
4. DOCUMENT: Add comments for complex logic

Before starting:
- Understand the requirements fully
- Check existing patterns in the codebase
- Plan the implementation approach

After completing:
- Ensure all tests pass
- Run linting and type checks
- Create a clear commit message`,
    delegatesTo: ['review', 'explore'],
  },
  {
    name: 'rush',
    displayName: '@rush',
    description: 'Fast execution with minimal planning',
    useWhen: 'Quick fixes, hotfixes, simple edits that need minimal planning',
    capabilities: [
      'Quick bug fixes',
      'Simple refactoring',
      'Minor changes',
      'Hotfixes',
    ],
    systemPrompt: `You are the rush agent. Your role is to make quick, focused changes.

Guidelines:
1. ACT FAST: Minimal planning, direct execution
2. FOCUS: One change at a time
3. VERIFY: Quick sanity check after change
4. MINIMAL SCOPE: Don't expand beyond the immediate task

Use for:
- Typo fixes
- Simple bug fixes
- Minor adjustments
- Urgent hotfixes`,
    delegatesTo: [],
  },
  {
    name: 'review',
    displayName: '@review',
    description: 'Code review, debugging, and security audits',
    useWhen: 'Reviewing code quality, finding bugs, security review, debugging issues',
    capabilities: [
      'Code review',
      'Security audit',
      'Performance analysis',
      'Bug finding',
      'Best practices enforcement',
    ],
    systemPrompt: `You are the review agent. Your role is to review and improve code quality.

Review checklist:
1. CORRECTNESS: Does the code do what it's supposed to?
2. SECURITY: Are there any security vulnerabilities?
3. PERFORMANCE: Are there performance issues?
4. MAINTAINABILITY: Is the code clean and readable?
5. TESTS: Are there adequate tests?
6. PATTERNS: Does it follow project conventions?

When reviewing:
- Be specific about issues
- Suggest fixes, not just problems
- Prioritize by severity
- Check for edge cases`,
    delegatesTo: [],
  },
  {
    name: 'scout',
    displayName: '@scout',
    description: 'External research - library docs, GitHub patterns, frameworks',
    useWhen: 'Researching external libraries, finding code patterns on GitHub, learning about frameworks',
    capabilities: [
      'Web research',
      'GitHub code search',
      'Documentation lookup',
      'Framework exploration',
      'Best practices research',
    ],
    systemPrompt: `You are the scout agent. Your role is to research external resources.

Research strategy:
1. UNDERSTAND what information is needed
2. SEARCH appropriate sources (docs, GitHub, web)
3. EVALUATE quality and relevance of findings
4. SUMMARIZE key findings concisely
5. PROVIDE actionable recommendations

Sources to use:
- Official documentation
- GitHub code examples
- Stack Overflow (verified answers)
- Framework guides
- Community best practices

Always cite your sources and verify information accuracy.`,
    delegatesTo: [],
  },
  {
    name: 'explore',
    displayName: '@explore',
    description: 'Fast codebase navigation and pattern search',
    useWhen: 'Finding files, understanding codebase structure, searching for patterns in code',
    capabilities: [
      'File discovery',
      'Pattern search',
      'Codebase navigation',
      'Structure analysis',
      'Dependency mapping',
    ],
    systemPrompt: `You are the explore agent. Your role is to navigate and understand the codebase.

Exploration techniques:
1. FILE STRUCTURE: Understand project organization
2. GREP SEARCH: Find specific patterns or usages
3. DEPENDENCY ANALYSIS: Map relationships between modules
4. PATTERN DISCOVERY: Find existing patterns to follow
5. QUICK CONTEXT: Gather just enough context for the task

Focus on speed and accuracy. Provide concise summaries of findings.`,
    delegatesTo: [],
  },
  {
    name: 'vision',
    displayName: '@vision',
    description: 'Multimodal analysis - mockups, PDFs, diagrams',
    useWhen: 'Analyzing images, mockups, screenshots, PDFs, or diagrams',
    capabilities: [
      'Image analysis',
      'Mockup interpretation',
      'PDF extraction',
      'Diagram understanding',
      'UI/UX analysis',
    ],
    systemPrompt: `You are the vision agent. Your role is to analyze visual content.

Analysis approach:
1. OBSERVE: Carefully examine the visual content
2. EXTRACT: Identify key information, text, structure
3. INTERPRET: Understand the intent and requirements
4. TRANSLATE: Convert visual specs to actionable tasks
5. VALIDATE: Ensure accurate interpretation

For mockups:
- Identify components and layout
- Note colors, spacing, typography
- Extract interaction patterns

For diagrams:
- Understand relationships
- Map to code structure
- Note data flow`,
    delegatesTo: [],
  },
  {
    name: 'one-shot',
    displayName: '@one-shot',
    description: 'End-to-end autonomous task execution (beta)',
    useWhen: 'Complete tasks autonomously from start to finish with minimal intervention',
    capabilities: [
      'Gather requirements interactively',
      'Create detailed implementation plans',
      'Execute tasks with dynamic agent selection',
      'Run quality gates until all pass',
      'Multi-level verification',
      'Auto-recovery from failures',
      'Generate completion proof',
    ],
    systemPrompt: `You are the one-shot agent. Your role is to execute tasks autonomously from start to finish.

## Workflow Phases

1. **REQUIREMENTS**: Gather task type, scope, dependencies, success criteria
2. **PLANNING**: Create detailed plan with @planner, recommend skills/tools
3. **COMPLEXITY**: Auto-split large tasks (>30min, >10 files, >500 lines)
4. **EXECUTION**: Execute with parallel tasks, dynamic agent delegation
5. **TESTING**: Run quality gates (typecheck, test, lint, build) until all pass
6. **VERIFICATION**: Multi-level verification (gates + manual + deployment)
7. **COMPLETION**: Generate proof, update tracking, collect feedback

## Quality Gates (Must ALL Pass)
- npm run typecheck - No type errors
- npm run test - All tests pass
- npm run lint - No linting errors
- npm run build - Build succeeds

## Error Recovery (3 Levels)
- Level 1: Auto-fix (type errors, lint --fix)
- Level 2: Alternative approach via @review
- Level 3: User intervention + follow-up task creation

## Best Practices
- Use for straightforward tasks first
- Consider /plan + /implement for complex features
- Review changes before final approval

⚠️ This mode is experimental. Start with simpler tasks.`,
    delegatesTo: ['planner', 'build', 'review', 'scout', 'explore', 'vision'],
  },
];

/**
 * Agent delegation result
 */
export interface DelegationDecision {
  agent: Agent;
  reason: string;
  shouldDelegate: boolean;
  subTasks?: string[];
}

/**
 * Agent Manager - Handles agent selection and delegation
 */
export class AgentManager {
  private config: Config;
  private agents: Map<AgentType, Agent>;

  constructor(config: Config) {
    this.config = config;
    this.agents = new Map();
    
    // Initialize default agents
    for (const agent of DEFAULT_AGENTS) {
      this.agents.set(agent.name, agent);
    }
  }

  /**
   * List all available agents
   */
  listAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Get a specific agent
   */
  getAgent(name: AgentType): Agent | undefined {
    return this.agents.get(name);
  }

  /**
   * Get the default agent
   */
  getDefaultAgent(): Agent {
    const defaultName = this.config.agents.default as AgentType;
    return this.agents.get(defaultName) || this.agents.get('build')!;
  }

  /**
   * Decide which agent should handle a task
   */
  decideAgent(task: string, _context?: string): DelegationDecision {
    const lowerTask = task.toLowerCase();
    
    // Check for explicit agent mentions
    for (const [name, agent] of this.agents) {
      if (lowerTask.includes(`@${name}`)) {
        return {
          agent,
          reason: `Explicitly requested @${name}`,
          shouldDelegate: false,
        };
      }
    }
    
    // Keyword-based delegation
    if (this.matchesKeywords(lowerTask, ['plan', 'architect', 'design', 'coordinate', 'complex'])) {
      return {
        agent: this.agents.get('planner')!,
        reason: 'Task requires planning and coordination',
        shouldDelegate: true,
      };
    }
    
    if (this.matchesKeywords(lowerTask, ['research', 'docs', 'documentation', 'library', 'framework', 'how to'])) {
      return {
        agent: this.agents.get('scout')!,
        reason: 'Task requires external research',
        shouldDelegate: false,
      };
    }
    
    if (this.matchesKeywords(lowerTask, ['review', 'audit', 'security', 'check', 'debug'])) {
      return {
        agent: this.agents.get('review')!,
        reason: 'Task requires code review or debugging',
        shouldDelegate: false,
      };
    }
    
    if (this.matchesKeywords(lowerTask, ['find', 'search', 'where', 'locate', 'explore'])) {
      return {
        agent: this.agents.get('explore')!,
        reason: 'Task requires codebase exploration',
        shouldDelegate: false,
      };
    }
    
    if (this.matchesKeywords(lowerTask, ['image', 'mockup', 'screenshot', 'pdf', 'diagram', 'visual'])) {
      return {
        agent: this.agents.get('vision')!,
        reason: 'Task requires visual analysis',
        shouldDelegate: false,
      };
    }
    
    if (this.matchesKeywords(lowerTask, ['fix quickly', 'hotfix', 'urgent', 'quick fix', 'typo'])) {
      return {
        agent: this.agents.get('rush')!,
        reason: 'Task is a quick fix',
        shouldDelegate: false,
      };
    }
    
    // Default to build agent
    return {
      agent: this.agents.get('build')!,
      reason: 'Default to build agent for implementation',
      shouldDelegate: false,
    };
  }

  /**
   * Format agent instructions for prompt
   */
  formatAgentPrompt(agent: Agent): string {
    return `# Agent: ${agent.displayName}

${agent.systemPrompt}

## Capabilities
${agent.capabilities.map(c => `- ${c}`).join('\n')}

${agent.delegatesTo.length > 0 ? `## Can Delegate To
${agent.delegatesTo.map(a => `- @${a}`).join('\n')}` : ''}
`;
  }

  private matchesKeywords(text: string, keywords: string[]): boolean {
    return keywords.some(kw => text.includes(kw));
  }
}
