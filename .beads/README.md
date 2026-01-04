# Beads - Task Tracking

This directory contains task beads for tracking work items.

## How it works
- Each file is a task bead (bead-001.md, bead-002.md, etc.)
- Status: todo, in-progress, completed, blocked
- Use `/create` command to create new tasks
- Use `/finish` command to complete tasks with quality gates

## Beads CLI
For full functionality, install beads globally:
```bash
npm install -g beads
bd init
```

## Available Commands
- `bd ready` - Show available work
- `bd show <id>` - View task details
- `bd update <id> --status in_progress` - Update task status
- `bd close <id>` - Complete task
- `bd sync` - Sync with git
