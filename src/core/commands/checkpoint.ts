import { DefaultCommand } from './types';

/**
 * Checkpoint Commands
 */
export const CHECKPOINT_COMMANDS: DefaultCommand[] = [
  {
    name: 'checkpoint:create',
    description: 'Save current state as a checkpoint',
    category: 'checkpoint',
    usage: '/checkpoint:create [message]',
    examples: ['/checkpoint:create', '/checkpoint:create "Before refactoring"'],
    content: `Create a checkpoint of the current working state.

## Workflow

Optional message: $ARGUMENTS

1. **Check Git Status**: Verify clean or staged state
2. **Create Checkpoint**:
   - Generate checkpoint ID (timestamp-based)
   - Save git diff or uncommitted changes
   - Save current branch name
   - Save list of modified files
   - Save user's message (if provided)
3. **Store Checkpoint**: Save to .aikit/checkpoints/checkpoint-{id}.json
4. **Confirm**: Display checkpoint ID and summary

## Checkpoint Contents
- Timestamp
- Git branch
- Git commit hash (if any)
- Uncommitted changes (diff)
- Modified files list
- User message
- Beads task state (if active)

## Example Output
\`\`\`
Checkpoint created: checkpoint-20250102-143022
Message: Before refactoring
Files modified: 5 files
\`\`\`

## Notes
- Checkpoints are stored locally in .aikit/checkpoints/
- Git changes are preserved (not committed)
- Use for experimentation - safely restore if things go wrong
- Checkpoints include full state, not just git`,
  },
  {
    name: 'checkpoint:restore',
    description: 'Restore to a previous checkpoint',
    category: 'checkpoint',
    usage: '/checkpoint:restore [checkpoint-id]',
    examples: ['/checkpoint:restore', '/checkpoint:restore checkpoint-20250102-143022', '/checkpoint:restore latest'],
    content: `Restore the project state from a checkpoint.

## Workflow

Checkpoint ID: $ARGUMENTS (default: latest)

1. **Find Checkpoint**:
   - If no ID provided, find latest checkpoint
   - Verify checkpoint file exists
2. **Display Summary**: Show what will be restored
3. **Confirm with User**: Ask for confirmation before proceeding
4. **Restore State**:
   - Clean working directory (remove uncommitted changes)
   - Checkout git commit from checkpoint
   - Apply uncommitted changes from checkpoint
   - Restore Beads task state if available
5. **Verify**: Confirm restoration successful

## Safety Checks
- Warn if current changes will be lost
- Show diff between current and checkpoint
- Require explicit user confirmation
- Backup current state before restoring

## Example Output
\`\`\`
Restoring checkpoint: checkpoint-20250102-143022
Message: Before refactoring
Files modified: 5 files

⚠️  Warning: Uncommitted changes will be lost
Proceed? (yes/no)

✓ Restored successfully
\`\`\`

## Notes
- Current uncommitted changes will be lost
- Git history is preserved
- Beads tasks will be restored to checkpointed state`,
  },
  {
    name: 'checkpoint:list',
    description: 'List all available checkpoints',
    category: 'checkpoint',
    usage: '/checkpoint:list',
    examples: ['/checkpoint:list'],
    content: `List all saved checkpoints with details.

## Workflow

1. **Scan Checkpoints Directory**: Find all checkpoint files in .aikit/checkpoints/
2. **Sort by Date**: Most recent first
3. **Display Summary**: Show table/list of checkpoints

## Output Format
\`\`\`
Available Checkpoints:

1. checkpoint-20250102-143022
   Date: 2025-01-02 14:30:22
   Message: Before refactoring
   Branch: feature/user-auth
   Files: 5 modified
   Size: 2.3MB

2. checkpoint-20250102-120815
   Date: 2025-01-02 12:08:15
   Message: Initial implementation
   Branch: main
   Files: 12 modified
   Size: 5.1MB

Total: 2 checkpoints
\`\`\`

## Filtering Options (future)
- Filter by branch
- Filter by date range
- Filter by message content
- Show only checkpoints with specific files

## Notes
- Checkpoints are stored in .aikit/checkpoints/
- Older checkpoints can be manually deleted
- Use /checkpoint:restore <id> to restore
- Use /checkpoint:restore latest for most recent`,
  },
];
