import { DefaultCommand } from './types';

/**
 * Core Workflow Commands (Beads integration)
 */
export const CORE_COMMANDS: DefaultCommand[] = [
  {
    name: 'create',
    description: 'Create a new Beads task for tracking',
    category: 'core',
    usage: '/create <task description>',
    examples: ['/create Add user authentication', '/create Fix navigation bug'],
    content: `Create a new task in the Beads system (.beads/ directory).

## Workflow

Task description: $ARGUMENTS

1. Create a new bead file with unique ID
2. Add task description, status, and notes
3. Set status to "in-progress"
4. Initialize working notes section

## Required Output
- Task ID for reference
- Confirmation of task creation
- Next steps`,
  },
  {
    name: 'plan',
    description: 'Create a detailed implementation plan',
    category: 'core',
    usage: '/plan <feature or task>',
    examples: ['/plan user authentication system', '/plan refactor database layer'],
    content: `Create a comprehensive plan before implementation.

## Workflow

Feature or task to plan: $ARGUMENTS

1. UNDERSTAND: Clarify requirements through Socratic questioning
2. RESEARCH: Check existing patterns and dependencies
3. BREAK DOWN: Create 2-5 minute sub-tasks with:
   - Exact file paths
   - Expected changes
   - Verification steps
4. DOCUMENT: Write plan to memory/plans/

## Output Format
\`\`\`markdown
# Plan: [Feature Name]

## Overview
Brief description of the goal.

## Tasks
1. [ ] Task 1 - file.ts
2. [ ] Task 2 - component.tsx
...

## Dependencies
- List dependencies

## Risks
- Potential issues

## Verification
- How to verify completion
\`\`\``,
  },
  {
    name: 'implement',
    description: 'Implement a planned task with TDD',
    category: 'core',
    usage: '/implement <task reference>',
    examples: ['/implement task-001', '/implement "add login form"'],
    content: `Implement a task following TDD principles.

## Workflow

Task reference or description: $ARGUMENTS

1. LOAD: Get task details from .beads/ or plan
2. TEST: Write failing tests first (RED)
3. IMPLEMENT: Write minimal code to pass (GREEN)
4. REFACTOR: Clean up while keeping tests green
5. VERIFY: Run full test suite

## Hard Gates
Before marking complete:
- [ ] All new tests pass
- [ ] No regressions
- [ ] Type check passes
- [ ] Linting passes`,
  },
  {
    name: 'finish',
    description: 'Complete a task with quality gates',
    category: 'core',
    usage: '/finish [task-id]',
    examples: ['/finish', '/finish task-001'],
    content: `Complete the current task with mandatory quality checks.

## Hard Gates (Must ALL Pass)
1. \`npm run typecheck\` - No type errors
2. \`npm run test\` - All tests pass
3. \`npm run lint\` - No linting errors
4. \`npm run build\` - Build succeeds

## Workflow
1. Run all quality gates
2. If any fail, report issues and stop
3. If all pass, update task status to "completed"
4. Create summary of changes
5. Suggest commit message`,
  },
  {
    name: 'handoff',
    description: 'Create handoff bundle for session continuity',
    category: 'core',
    usage: '/handoff',
    examples: ['/handoff'],
    content: `Create a handoff bundle for context transfer to next session.

## Workflow
1. Summarize current progress
2. Document:
   - What was completed
   - What remains
   - Current blockers
   - Key decisions made
3. Save to memory/handoffs/[timestamp].md

## Output Format
\`\`\`markdown
# Handoff: [Date/Time]

## Completed
- List of completed items

## In Progress
- Current work state

## Remaining
- What still needs to be done

## Context
- Important context for next session

## Next Steps
- Recommended actions
\`\`\``,
  },
  {
    name: 'resume',
    description: 'Resume from last handoff',
    category: 'core',
    usage: '/resume',
    examples: ['/resume'],
    content: `Resume work from the most recent handoff.

## Workflow
1. Load latest handoff from memory/handoffs/
2. Display summary to user
3. Propose next actions
4. Continue from where left off`,
  },
  {
    name: 'one-shot',
    description: 'End-to-end autonomous task execution (beta)',
    category: 'core',
    usage: '/one-shot <task description>',
    examples: ['/one-shot Add user authentication', '/one-shot Fix navigation bug'],
    content: `One-Shot Mode (beta) - End-to-end autonomous task execution.

⚠️  This mode is experimental. Use for straightforward tasks first.

## Workflow

Task description: $ARGUMENTS

**Phase 1: Requirements Gathering**
- Interactive selection of task type (Feature, Bug Fix, Refactoring, etc.)
- Scope clarification
- Dependencies identification
- Success criteria definition
- User selects progress level (Minimal/Moderate/Detailed/Quiet)

**Phase 2: Planning**
- Delegate to @planner agent
- Create detailed implementation plan
- Recommend relevant skills and tools
- Create Beads task for tracking

**Phase 3: Complexity Check & Auto-Split**
- Analyze task complexity
- Split into multiple beads if needed:
  * Time > 30 minutes
  * >10 files affected
  * >500 lines to change
  * Touches >2 sub-systems

**Phase 4: Execution**
- Build dependency graph
- Execute tasks in parallel (max 3 concurrent)
- Dynamic agent selection (@build → @review → @scout → ...)
- Integrate skills (TDD, debugging, etc.)
- Smart terminal access (auto-allow/ask/forbid)

**Phase 5: Enhanced Testing & Validation**
- Auto-generate test scripts for new functionality
- Run quality gates: typecheck, test, lint, build
- Execute sample commands (with user approval)
- Validate logs semantically with historical comparison
- Retry loop (max 3 attempts) with:
  * Auto-fix type errors, lint errors
  * Alternative approaches from @review
  * User intervention on final failure

**Phase 6: Multi-Level Verification**
- All quality gates passed ✓
- Manual verification confirmation
- Deployment approval (if needed)
- Rollback confirmation (if verification fails)

**Phase 7: Completion**
- Generate proof of completion
  * Files changed
  * Test results
  * Build output
  * Deployment status
- Update Beads task → completed
- Store proof in bead notes
- Collect beta feedback

## Quality Gates (Must ALL Pass)
- \`npm run typecheck\` - No type errors
- \`npm run test\` - All tests pass
- \`npm run lint\` - No linting errors
- \`npm run build\` - Build succeeds

## Success Criteria
- All tests passing
- No regressions
- Manual verification
- Deployment complete (if applicable)
- Beads task completed with proof

## Error Handling
- **Level 1**: Auto-fix (type errors, lint --fix)
- **Level 2**: Alternative approach (@review delegation)
- **Level 3**: User intervention + follow-up bead creation

## Tips
✓ Use for straightforward tasks first
✓ Consider /plan + /implement for complex features
✓ Review changes before final approval`,
  },
];
