import { readFile, writeFile, readdir, access, constants, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { paths } from '../utils/paths.js';
import { logger } from '../utils/logger.js';

const execAsync = promisify(exec);

/**
 * Bead task structure
 */
export interface Bead {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'completed' | 'blocked';
  type?: 'feature' | 'pattern' | 'decision' | 'knowledge';
  createdAt: Date;
  updatedAt: Date;
  notes: string[];
  subtasks?: string[];
}

/**
 * Beads integration status
 */
export interface BeadsStatus {
  installed: boolean;
  version?: string;
  initialized: boolean;
  activeTasks: number;
  completedTasks: number;
  currentTask?: string;
}

/**
 * Beads Integration - Task tracking with hard quality gates
 */
export class BeadsIntegration {
  private projectPath: string;

  constructor(projectPath?: string) {
    this.projectPath = projectPath || process.cwd();
  }

  /**
   * Check if Beads CLI is installed
   */
  async isInstalled(): Promise<boolean> {
    try {
      await execAsync('bd --version');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get Beads version
   */
  async getVersion(): Promise<string | null> {
    try {
      const { stdout } = await execAsync('bd --version');
      const match = stdout.match(/bd version (\S+)/);
      return match?.[1] || null;
    } catch {
      return null;
    }
  }

  /**
   * Check if Beads is initialized in project
   */
  async isInitialized(): Promise<boolean> {
    const beadsDir = paths.beadsDir(this.projectPath);
    try {
      await access(beadsDir, constants.R_OK);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Install Beads CLI globally
   */
  async install(): Promise<boolean> {
    try {
      await execAsync('npm install -g beads');
      return true;
    } catch (error) {
      logger.error('Failed to install Beads CLI:', error);
      return false;
    }
  }

  /**
   * Initialize Beads in project using bd CLI
   */
  async init(): Promise<boolean> {
    try {
      await execAsync('bd init', { cwd: this.projectPath });
      logger.success('Beads initialized');
      return true;
    } catch (error) {
      logger.error('Failed to initialize Beads:', error);
      return false;
    }
  }

  /**
   * Initialize local .beads directory (works without global beads CLI)
   * Creates a fully functional beads workspace for OpenCode/Claude Code
   */
  async initLocal(): Promise<boolean> {
    try {
      const beadsDir = paths.beadsDir(this.projectPath);
      await mkdir(beadsDir, { recursive: true });

      // Create config.yaml
      const configYaml = `# Beads Configuration File
# This file configures default behavior for all bd commands in this repository
# All settings can also be set via environment variables (BD_* prefix)
# or overridden with command-line flags

# Issue prefix for this repository (used by bd init)
# If not set, bd init will auto-detect from directory name
# issue-prefix: ""

# Use no-db mode: load from JSONL, no SQLite, write back after each command
# When true, bd will use .beads/issues.jsonl as the source of truth
# instead of SQLite database
# no-db: false

# Disable daemon for RPC communication (forces direct database access)
# no-daemon: false

# Disable auto-flush of database to JSONL after mutations
# no-auto-flush: false

# Disable auto-import from JSONL when it's newer than database
# no-auto-import: false

# Enable JSON output by default
# json: false

# Default actor for audit trails (overridden by BD_ACTOR or --actor)
# actor: ""

# Path to database (overridden by BEADS_DB or --db)
# db: ""

# Auto-start daemon if not running (can also use BEADS_AUTO_START_DAEMON)
# auto-start-daemon: true

# Debounce interval for auto-flush (can also use BEADS_FLUSH_DEBOUNCE)
# flush-debounce: "5s"

# Git branch for beads commits (bd sync will commit to this branch)
# IMPORTANT: Set this for team projects so all clones use the same sync branch.
# sync-branch: "beads-sync"
`;
      await writeFile(join(beadsDir, 'config.yaml'), configYaml);

      // Create metadata.json
      const metadata = {
        database: "beads.db",
        jsonl_export: "issues.jsonl"
      };
      await writeFile(join(beadsDir, 'metadata.json'), JSON.stringify(metadata, null, 2));

      // Create .gitignore
      const gitignore = `# SQLite databases
*.db
*.db?*
*.db-journal
*.db-wal
*.db-shm

# Daemon runtime files
daemon.lock
daemon.log
daemon.pid
bd.sock

# Local version tracking (prevents upgrade notification spam after git ops)
.local_version

# Legacy database files
db.sqlite
bd.db

# Merge artifacts (temporary files from 3-way merge)
beads.base.jsonl
beads.base.meta.json
beads.left.jsonl
beads.left.meta.json
beads.right.jsonl
beads.right.meta.json

# Keep JSONL exports and config (source of truth for git)
!issues.jsonl
!metadata.json
!config.json
`;
      await writeFile(join(beadsDir, '.gitignore'), gitignore);

      // Create .local_version (with placeholder version)
      await writeFile(join(beadsDir, '.local_version'), '0.32.1\n');

      // Create README for .beads directory
      const readmeContent = `# Beads - Task Tracking

This directory contains task beads for tracking work items.

## How it works
- Each file is a task bead (bead-001.md, bead-002.md, etc.)
- Status: todo, in-progress, completed, blocked
- Use \`/create\` command to create new tasks
- Use \`/finish\` command to complete tasks with quality gates

## Automatic Setup
This directory was automatically initialized by AIKit for use with OpenCode/Claude Code.
No manual setup required - it's ready to use!

## Beads CLI (Optional)
For advanced functionality, you can install the beads CLI globally:
\`\`\`bash
npm install -g beads
\`\`\`

Then you can use commands like:
- \`bd ready\` - Show available work
- \`bd show <id>\` - View task details
- \`bd update <id> --status in_progress\` - Update task status
- \`bd close <id>\` - Complete task
- \`bd sync\` - Sync with git
`;

      await writeFile(join(beadsDir, 'README.md'), readmeContent);

      return true;
    } catch (error) {
      logger.error('Failed to initialize .beads directory:', error);
      return false;
    }
  }

  /**
   * Setup git hooks
   */
  async setupGitHooks(): Promise<boolean> {
    try {
      const gitHooksDir = join(this.projectPath, '.git', 'hooks');

      // Check if .git directory exists (skip if not a git repo)
      
      if (!existsSync(gitHooksDir)) {
        logger.info('Not a git repository, skipping git hooks setup');
        return true;
      }

      const preCommitHook = join(gitHooksDir, 'pre-commit');

      // Pre-commit hook content
      const hookContent = `#!/bin/sh
#
# bd (beads) pre-commit hook
#
# This hook ensures that any pending bd issue changes are flushed to
# .beads/issues.jsonl before the commit is created, preventing a
# race condition where daemon auto-flush fires after the commit.
#

# Check if bd is available
if ! command -v bd >/dev/null 2>&1; then
  echo "Warning: bd command not found, skipping pre-commit flush" >&2
  exit 0
fi

# Check if we're in a bd workspace
BEADS_DIR=""
if [ -d ".beads" ]; then
  BEADS_DIR=".beads"
fi

if [ -z "$BEADS_DIR" ]; then
  # Not a bd workspace, nothing to do
  exit 0
fi

# Check if bd is actually initialized (has beads.db or config.yaml)
# This prevents errors if .beads/ exists but bd was never initialized
if [ ! -f "$BEADS_DIR/beads.db" ] && [ ! -f "$BEADS_DIR/config.yaml" ]; then
  # .beads/ exists but bd is not initialized, skip bd operations
  exit 0
fi

# Flush pending changes to JSONL
# Use --flush-only to skip git operations (we're already in a git hook)
# Suppress output unless there's an error
if ! bd sync --flush-only >/dev/null 2>&1; then
  echo "Error: Failed to flush bd changes to JSONL" >&2
  echo "Run 'bd sync --flush-only' manually to diagnose" >&2
  exit 1
fi

exit 0
`;

      // Write hook file
      await writeFile(preCommitHook, hookContent, { mode: 0o755 });
      return true;
    } catch (error) {
      logger.error('Failed to setup git hooks:', error);
      return false;
    }
  }

  /**
   * Get current status
   */
  async getStatus(): Promise<BeadsStatus> {
    const installed = await this.isInstalled();
    const version = await this.getVersion();
    const initialized = await this.isInitialized();
    
    let activeTasks = 0;
    let completedTasks = 0;
    let currentTask: string | undefined;
    
    if (initialized) {
      const beads = await this.listBeads();
      activeTasks = beads.filter(b => b.status === 'in-progress' || b.status === 'todo').length;
      completedTasks = beads.filter(b => b.status === 'completed').length;
      
      const active = beads.find(b => b.status === 'in-progress');
      currentTask = active?.title;
    }
    
    return {
      installed,
      version: version || undefined,
      initialized,
      activeTasks,
      completedTasks,
      currentTask,
    };
  }

  /**
   * List all beads in project
   */
  async listBeads(): Promise<Bead[]> {
    const beadsDir = paths.beadsDir(this.projectPath);
    const beads: Bead[] = [];
    
    try {
      const files = await readdir(beadsDir);
      
      for (const file of files) {
        if (!file.match(/^bead-\d+\.md$/)) continue;
        
        const content = await readFile(join(beadsDir, file), 'utf-8');
        const bead = this.parseBeadFile(file, content);
        if (bead) beads.push(bead);
      }
    } catch {
      // No beads directory
    }
    
    return beads.sort((a, b) => a.id.localeCompare(b.id));
  }

  /**
   * Get a specific bead
   */
  async getBead(id: string): Promise<Bead | null> {
    const beadsDir = paths.beadsDir(this.projectPath);
    const fileName = id.endsWith('.md') ? id : `${id}.md`;
    
    try {
      const content = await readFile(join(beadsDir, fileName), 'utf-8');
      return this.parseBeadFile(fileName, content);
    } catch {
      return null;
    }
  }

  /**
   * Create a new bead
   */
  async createBead(title: string, description: string): Promise<Bead> {
    const beadsDir = paths.beadsDir(this.projectPath);
    await mkdir(beadsDir, { recursive: true });
    
    // Get next bead ID
    const beads = await this.listBeads();
    const maxId = beads.reduce((max, b) => {
      const num = parseInt(b.id.replace('bead-', ''), 10);
      return num > max ? num : max;
    }, 0);
    
    const id = `bead-${String(maxId + 1).padStart(3, '0')}`;
    const now = new Date().toISOString();
    
    const content = `---
id: ${id}
title: ${title}
status: in-progress
created: ${now}
updated: ${now}
---

# ${title}

## Description
${description}

## Notes

`;

    await writeFile(join(beadsDir, `${id}.md`), content);
    
    return {
      id,
      title,
      description,
      status: 'in-progress',
      createdAt: new Date(now),
      updatedAt: new Date(now),
      notes: [],
    };
  }

  /**
   * Update bead status
   */
  async updateBeadStatus(id: string, status: Bead['status']): Promise<boolean> {
    const beadsDir = paths.beadsDir(this.projectPath);
    const fileName = id.endsWith('.md') ? id : `${id}.md`;
    const filePath = join(beadsDir, fileName);
    
    try {
      let content = await readFile(filePath, 'utf-8');
      
      // Update status in frontmatter
      content = content.replace(
        /status:\s*\w+/,
        `status: ${status}`
      );
      
      // Update timestamp
      content = content.replace(
        /updated:\s*.+/,
        `updated: ${new Date().toISOString()}`
      );
      
      await writeFile(filePath, content);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Add note to bead
   */
  async addNote(id: string, note: string): Promise<boolean> {
    const beadsDir = paths.beadsDir(this.projectPath);
    const fileName = id.endsWith('.md') ? id : `${id}.md`;
    const filePath = join(beadsDir, fileName);
    
    try {
      let content = await readFile(filePath, 'utf-8');
      
      // Find notes section and add note
      const notesMatch = content.match(/## Notes\n([\s\S]*?)(?=\n##|$)/);
      if (notesMatch) {
        const timestamp = new Date().toLocaleString();
        const newNote = `- [${timestamp}] ${note}`;
        content = content.replace(
          notesMatch[0],
          `## Notes\n${notesMatch[1]}${newNote}\n`
        );
      }
      
      // Update timestamp
      content = content.replace(
        /updated:\s*.+/,
        `updated: ${new Date().toISOString()}`
      );
      
      await writeFile(filePath, content);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Update bead type
   */
  async updateBeadType(id: string, type: Bead['type']): Promise<boolean> {
    const beadsDir = paths.beadsDir(this.projectPath);
    const fileName = id.endsWith('.md') ? id : `${id}.md`;
    const filePath = join(beadsDir, fileName);

    try {
      let content = await readFile(filePath, 'utf-8');

      // Check if type field already exists
      const typeMatch = content.match(/^type:\s*.+/m);
      if (typeMatch) {
        // Update existing type
        content = content.replace(typeMatch[0], `type: ${type}`);
      } else {
        // Add type field after status
        content = content.replace(/^---\n([\s\S]*?)\n---/, (match) => {
          return match.replace(/^---\n/, `---\ntype: ${type}\n`);
        });
      }

      // Update timestamp
      content = content.replace(
        /updated:\s*.+/,
        `updated: ${new Date().toISOString()}`
      );

      await writeFile(filePath, content);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Complete a bead with quality gates
   */
  async completeBead(id: string): Promise<{
    success: boolean;
    gates: { name: string; passed: boolean; error?: string }[];
    handoffCreated: boolean;
  }> {
    // Run quality gates
    const gates = [
      { name: 'Type Check', command: 'npm run typecheck' },
      { name: 'Tests', command: 'npm run test' },
      { name: 'Lint', command: 'npm run lint' },
      { name: 'Build', command: 'npm run build' },
    ];
    
    const results: { name: string; passed: boolean; error?: string }[] = [];
    
    for (const gate of gates) {
      try {
        await execAsync(gate.command, { cwd: this.projectPath });
        results.push({ name: gate.name, passed: true });
        logger.success(`${gate.name}: passed`);
      } catch (error) {
        results.push({
          name: gate.name,
          passed: false,
          error: error instanceof Error ? error.message.slice(0, 200) : 'Failed',
        });
        logger.error(`${gate.name}: failed`);
      }
    }
    
    const allPassed = results.every(r => r.passed);
    
    if (allPassed) {
      await this.updateBeadStatus(id, 'completed');
      await this.addNote(id, 'Task completed - all quality gates passed');
      
      // Auto-generate handoff for session continuity
      const { MemoryManager } = await import('./memory.js');
      const { loadConfig } = await import('./config.js');
      const config = await loadConfig(this.projectPath);
      const memory = new MemoryManager(config);
      
      await memory.createHandoff({
        completed: [id],
        inProgress: [],
        remaining: [],
        context: `Auto-generated handoff for completed task: ${id}`,
        nextSteps: ['Review completed work', 'Start new task if needed'],
      });
    } else {
      await this.addNote(id, 'Completion attempted but quality gates failed');
    }
    
    return {
      success: allPassed,
      gates: results,
      handoffCreated: allPassed,
    };
  }

  /**
   * Get current active bead
   */
  async getCurrentBead(): Promise<Bead | null> {
    const beads = await this.listBeads();
    return beads.find(b => b.status === 'in-progress') || null;
  }

  /**
   * Parse a bead file
   */
  private parseBeadFile(fileName: string, content: string): Bead | null {
    try {
      const id = fileName.replace('.md', '');
      
      // Extract frontmatter
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      const frontmatter = frontmatterMatch?.[1] || '';
      
      const getValue = (key: string): string => {
        const match = frontmatter.match(new RegExp(`${key}:\\s*(.+)`));
        return match?.[1]?.trim() || '';
      };
      
      // Parse title
      const titleMatch = content.match(/^# (.+)/m);
      const title = getValue('title') || titleMatch?.[1] || id;
      
      // Parse description
      const descMatch = content.match(/## Description\n([\s\S]*?)(?=\n##|$)/);
      const description = descMatch?.[1]?.trim() || '';
      
      // Parse notes
      const notesMatch = content.match(/## Notes\n([\s\S]*?)(?=\n##|$)/);
      const notesContent = notesMatch?.[1] || '';
      const notes = notesContent
        .split('\n')
        .filter(line => line.trim().startsWith('-'))
        .map(line => line.replace(/^-\s*/, '').trim());
      
      // Parse type
      const type = getValue('type') as Bead['type'] | undefined;
      
      return {
        id,
        title,
        description,
        status: (getValue('status') as Bead['status']) || 'todo',
        type,
        createdAt: new Date(getValue('created') || Date.now()),
        updatedAt: new Date(getValue('updated') || Date.now()),
        notes,
      };
    } catch {
      return null;
    }
  }
}