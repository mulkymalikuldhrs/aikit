import { DefaultCommand } from './types';

/**
 * Utility Commands
 */
export const UTILITY_COMMANDS: DefaultCommand[] = [
  {
    name: 'status',
    description: 'Show current status overview',
    category: 'utility',
    usage: '/status',
    examples: ['/status'],
    content: `Display comprehensive status.

## Shows
- Current task (from Beads)
- Git status
- Active branch
- Pending changes
- Test status
- Recent activity`,
  },
  {
    name: 'help',
    description: 'Show available commands',
    category: 'utility',
    usage: '/help [command]',
    examples: ['/help', '/help plan'],
    content: `Display help information.

If no command specified, list all available commands.
If command specified, show detailed help for that command.`,
  },
  {
    name: 'test',
    description: 'Run tests and show results',
    category: 'utility',
    usage: '/test [pattern]',
    examples: ['/test', '/test auth', '/test --watch'],
    content: `Run test suite and display results.

## Workflow

Optional pattern: $ARGUMENTS

1. Run test command: \`npm run test\`
2. Parse and display results
3. Show coverage if available
4. Highlight failures
5. Suggest fixes for failures`,
  },
  {
    name: 'deploy',
    description: 'Deploy application to production',
    category: 'utility',
    usage: '/deploy [environment]',
    examples: ['/deploy', '/deploy staging', '/deploy production'],
    content: `Deploy application with quality checks.

## Workflow

Optional environment: $ARGUMENTS

1. Run quality gates (test, lint, build)
2. Check for uncommitted changes
3. Build production bundle
4. Deploy to target environment
5. Verify deployment success`,
  },
  {
    name: 'rollback',
    description: 'Rollback to previous deployment',
    category: 'utility',
    usage: '/rollback [version]',
    examples: ['/rollback', '/rollback v1.2.3'],
    content: `Rollback to previous version.

## Workflow

Optional version: $ARGUMENTS

1. Identify current version
2. List available versions
3. Confirm rollback target
4. Execute rollback
5. Verify rollback success`,
  },
  {
    name: 'logs',
    description: 'View application logs',
    category: 'utility',
    usage: '/logs [--tail] [--follow]',
    examples: ['/logs', '/logs --tail 100', '/logs --follow'],
    content: `View and filter application logs.

## Workflow

Optional flags: $ARGUMENTS

1. Determine log location
2. Apply filters if specified
3. Display logs
4. If --follow, stream updates
5. Format for readability`,
  },
  {
    name: 'create-agent',
    description: 'Create a custom AI agent with specific capabilities',
    category: 'utility',
    usage: '/create-agent <name> [description]',
    examples: ['/create-agent security "Security audit agent"', '/create-agent writer'],
    content: `Create a custom AI agent for specialized tasks.

## Workflow

Agent name: $ARGUMENTS

1. **Determine Agent Purpose**: Ask user clarifying questions:
   - What specific tasks will this agent handle?
   - What expertise should it have?
   - What tools should it have access to?
   - Any specific behaviors or constraints?

2. **Generate Agent Configuration**:
   - System prompt with instructions
   - Recommended tools/skills
   - Preferred models
   - Interaction patterns

3. **Create Agent File**: Save to .aikit/agents/<name>.md
   - Frontmatter with metadata
   - System prompt
   - Tool recommendations
   - Usage examples

4. **Verify Creation**: Confirm agent created successfully

## Agent Template

**Frontmatter:**
\`\`\`yaml
---
name: <agent-name>
description: <what this agent does>
useWhen: <when to use this agent>
mode: subagent
tools: [list of tools]
skills: [list of skills]
---
\`\`\`

**System Prompt:**
\`\`\`
# Agent Name

You are a specialized AI agent for <specific domain>.

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
\`\`\`

## Example Agents

**Security Agent:**
- Focuses on code security vulnerabilities
- Tools: static analysis, dependency checker
- Skills: security-audit, code-review

**Performance Agent:**
- Focuses on optimization
- Tools: profiler, benchmark
- Skills: performance-optimization

**Documentation Agent:**
- Focuses on writing clear docs
- Tools: markdown formatter
- Skills: documentation

## Notes
- Agents are saved as markdown files
- Can be customized after creation
- Used with /agent or agent delegation
- Appear in agent selector in OpenCode`,
  },
  {
    name: 'list-agents',
    description: 'List all available custom agents',
    category: 'utility',
    usage: '/list-agents',
    examples: ['/list-agents'],
    content: `List all available custom agents with descriptions.

## Workflow

1. **Scan Agents Directory**: Find all agent files in .aikit/agents/
2. **Parse Metadata**: Extract agent descriptions and use cases
3. **Categorize**: Group by type/purpose
4. **Display**: Show formatted list with details

## Output Format

\`\`\`
Available Agents:

### Development Agents
• security - Security vulnerability scanner
  Use when: Reviewing code for security issues
  Skills: security-audit, code-review
  Tools: static-analysis, dependency-checker

• performance - Performance optimization specialist
  Use when: Optimizing slow code or databases
  Skills: performance-optimization, database-design
  Tools: profiler, query-analyzer

### Documentation Agents
• writer - Technical documentation writer
  Use when: Creating or updating docs
  Skills: documentation
  Tools: markdown-formatter

### Design Agents
• ui-ux - UI/UX design reviewer
  Use when: Reviewing interface designs
  Skills: accessibility, frontend-aesthetics

Total: 4 agents

Create a new agent: /create-agent <name>
\`\`\`

## Agent Information Shown
- Agent name
- Description
- When to use it
- Required skills
- Available tools
- Category/type

## Notes
- Built-in agents (plan, build, review, etc.) also shown
- Custom agents appear after built-in ones
- Use /agent <name> to invoke specific agent
- Can view full agent file for details`,
  },
];
