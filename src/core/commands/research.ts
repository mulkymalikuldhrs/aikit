import { DefaultCommand } from './types';

/**
 * Research & Analysis Commands
 */
export const RESEARCH_COMMANDS: DefaultCommand[] = [
  {
    name: 'research',
    description: 'Deep research on a topic',
    category: 'research',
    usage: '/research <topic>',
    examples: ['/research React Server Components', '/research OAuth 2.0 best practices'],
    content: `Conduct thorough research and document findings.

## Workflow

Research topic: $ARGUMENTS

1. Search documentation and resources
2. Find code examples and patterns
3. Evaluate options and trade-offs
4. Document findings in memory/research/

## Output
- Summary of findings
- Recommended approach
- Code examples
- Links to resources`,
  },
  {
    name: 'analyze-project',
    description: 'Analyze project structure and patterns',
    category: 'research',
    usage: '/analyze-project',
    examples: ['/analyze-project'],
    content: `Comprehensive project analysis.

## Workflow
1. Scan directory structure
2. Identify:
   - Tech stack
   - Architecture patterns
   - Key dependencies
   - Coding conventions
3. Document findings in AGENTS.md`,
  },
  {
    name: 'review-codebase',
    description: 'Review codebase quality',
    category: 'research',
    usage: '/review-codebase [path]',
    examples: ['/review-codebase', '/review-codebase src/'],
    content: `Review codebase for quality issues.

## Workflow

Optional path: $ARGUMENTS

1. Check code quality metrics
2. Identify:
   - Code smells
   - Security issues
   - Performance concerns
   - Test coverage gaps
3. Prioritize findings
4. Suggest improvements`,
  },
];
