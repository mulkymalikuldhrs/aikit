# One-Shot Mode (Beta)

End-to-end autonomous task execution for AIKit.

> **Warning**: This feature is experimental. Start with straightforward tasks first.

## Quick Start

```bash
# Basic usage
/ak_cm_one-shot Add user authentication

# Bug fix
/ak_cm_one-shot Fix navigation bug causing page crash

# Refactoring
/ak_cm_one-shot Refactor payment service to use async/await
```

## Overview

One-Shot Mode takes a single request and handles everything autonomously:
- Gathers requirements interactively
- Creates a detailed plan
- Executes with dynamic agent selection
- Runs tests until all pass
- Verifies completion with proof
- Creates follow-up tasks if needed

## Workflow Phases

### Phase 1: Requirements Gathering

Interactive selection with arrow-key navigation:

```
? Select task type:
  ❯ Feature - New functionality
    Bug Fix - Fix existing behavior
    Refactoring - Improve code structure
    Performance - Optimization
    Testing - Add/improve tests
    Documentation - Update docs
    Research - Investigate options
```

Then select:
- **Scope**: What files/areas are affected
- **Dependencies**: External dependencies needed
- **Success Criteria**: How to verify completion
- **Progress Level**: How much output to show

### Phase 2: Planning

Delegates to `@planner` agent to create:
- Detailed implementation plan with tasks
- Recommended skills (TDD, debugging, etc.)
- Required tools
- Time estimates
- Creates a **Bead** for tracking

### Phase 3: Complexity Analysis

Automatically splits large tasks if:
- Estimated time > 30 minutes
- More than 10 files affected
- More than 500 lines to change
- Touches more than 2 sub-systems

Creates child beads for each sub-task.

### Phase 4: Execution

- Builds task dependency graph
- Executes up to 3 tasks in parallel
- Dynamic agent selection:
  - `@build` for implementation
  - `@review` for code review
  - `@scout` for research
  - `@explore` for codebase navigation
- Integrates relevant skills automatically
- Smart terminal access with approval controls

### Phase 5: Testing Loop

Runs all quality gates until they pass (max 3 attempts):

| Gate | Command | Purpose |
|------|---------|---------|
| TypeCheck | `npm run typecheck` | No type errors |
| Test | `npm run test` | All tests pass |
| Lint | `npm run lint` | No lint errors |
| Build | `npm run build` | Build succeeds |

**Auto-fix on failure:**
- **Level 1**: Auto-fix (type errors, `lint --fix`)
- **Level 2**: Alternative approach via `@review`
- **Level 3**: User intervention + follow-up bead

### Phase 6: Verification

Multi-level verification before completion:

1. **Quality Gates** - All must pass
2. **Manual Verification** - User confirms behavior
3. **Deployment Approval** - If deployment is needed
4. **Rollback Option** - If verification fails

### Phase 7: Completion

- Generates proof of completion:
  - Files changed
  - Test results
  - Build output
  - Deployment status
- Updates Bead status to `completed`
- Stores proof in bead notes
- Collects beta feedback

## Progress Levels

Choose how much output to see:

| Level | Description | Example Output |
|-------|-------------|----------------|
| **Minimal** | Phase transitions only | `Phase 1 → Phase 2` |
| **Moderate** | Sub-task completion | `Task 3/5 complete` |
| **Detailed** | Each command/test | `Running npm test... ✓` |
| **Quiet** | Errors only | (silent unless error) |

## Error Handling

### 3-Level Recovery System

```
Level 1: Auto-Fix
├── Fix type errors automatically
├── Run lint --fix
└── Retry failed operations

Level 2: Alternative Approach
├── Delegate to @review agent
├── Get alternative implementation
└── Apply and retry

Level 3: User Intervention
├── Show detailed error context
├── Ask user for guidance
└── Create follow-up bead
```

### Follow-up Beads

When errors can't be auto-fixed:
- Creates a new bead with error context
- Links to parent task
- Includes partial progress
- Ready for next session

## Success Criteria

A task is considered complete when:

- [ ] All tests passing
- [ ] No type errors
- [ ] No lint errors
- [ ] Build succeeds
- [ ] Manual verification confirmed
- [ ] Deployment complete (if applicable)
- [ ] Bead updated with completion proof

## Best Practices

### Good Use Cases

```bash
# Simple feature
/ak_cm_one-shot Add logout button to header

# Bug fix with clear scope
/ak_cm_one-shot Fix form validation not showing errors

# Straightforward refactoring
/ak_cm_one-shot Convert callback functions to async/await
```

### Consider Alternatives For

| Scenario | Recommended Approach |
|----------|---------------------|
| Complex multi-system features | `/plan` + `/implement` |
| Exploratory research | `/research` first |
| Unknown codebase | `/analyze-project` first |
| Critical production changes | Manual with `/review` |

## Completion Summary

After completion, you'll see:

```
📊 Completion Summary
──────────────────────────────────────────────────
Task: Add user authentication
Bead ID: auth-feature-001
Total Duration: 12m 45s

Execution:
  Tasks completed: 5
  Tasks failed: 0

Testing:
  Attempts: 2
  All passed: ✓

Verification:
  Manual verified: ✓
  Deployment: N/A
──────────────────────────────────────────────────
```

## Beta Feedback

After each One-Shot completion, you'll be asked:

```
? How was your One-Shot Mode experience?
  ❯ Great - worked as expected
    Good - minor issues
    Okay - some problems
    Poor - significant issues
    
? What went well?
? What could be improved?
```

Your feedback helps improve the feature!

## Troubleshooting

### "Testing failed after all retries"

The testing loop exhausted all 3 attempts. Check:
1. Pre-existing test failures
2. Environment issues (missing deps)
3. Flaky tests

A follow-up bead is created automatically.

### "Verification failed"

Manual verification was rejected. Options:
1. Rollback changes
2. Continue anyway (creates warning bead)
3. Create follow-up for fixes

### "Complexity too high"

Task was auto-split. Check created beads:
```bash
bd ready  # See available work
```

## Related Commands

| Command | Purpose |
|---------|---------|
| `/plan` | Create detailed plan without execution |
| `/implement` | Execute a planned task with TDD |
| `/fix` | Quick fix for simple issues |
| `/review-codebase` | Get codebase overview first |

## Architecture

```
OneShotMode
├── RequirementsGatherer    # Interactive input
├── OneShotPlanner          # @planner delegation
├── ComplexityAnalyzer      # Auto-split logic
├── OneShotExecutor         # Task execution
├── TestingLoop             # Quality gates
├── ErrorRecovery           # 3-level recovery
├── CompletionVerifier      # Multi-level verify
├── FeedbackCollector       # Beta feedback
└── ProgressReporter        # Output control
```

## Configuration

One-Shot Mode uses your AIKit configuration:

```yaml
# ~/.aikit/config.yaml
oneshot:
  maxRetries: 3              # Test loop retries
  maxConcurrent: 3           # Parallel tasks
  complexityThreshold: 30    # Minutes before split
  autoApproveTerminal: false # Terminal access approval
```

---

**Note**: One-Shot Mode is in beta. Please share feedback to help improve it!
