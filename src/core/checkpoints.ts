import { readFile, writeFile, readdir, mkdir, access } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Checkpoint data structure
 */
export interface Checkpoint {
  id: string;
  timestamp: string;
  message?: string;
  branch: string;
  commit?: string;
  files: string[];
  diff?: string;
  beadsTask?: {
    id: string;
    status: string;
  };
}

/**
 * Checkpoint Manager
 * Handles saving and restoring project state
 */
export class CheckpointManager {
  private checkpointsDir: string;
  private projectPath: string;

  constructor(projectPath?: string) {
    this.projectPath = projectPath || process.cwd();
    this.checkpointsDir = join(this.projectPath, '.aikit', 'checkpoints');
  }

  /**
   * Initialize checkpoints directory
   */
  async init(): Promise<void> {
    await mkdir(this.checkpointsDir, { recursive: true });
  }

  /**
   * Create a new checkpoint
   */
  async create(message?: string): Promise<Checkpoint> {
    await this.init();

    // Generate checkpoint ID
    const id = this.generateId();
    const timestamp = new Date().toISOString();

    // Get current git state
    const gitState = await this.getGitState();

    // Get modified files
    const files = await this.getModifiedFiles();

    // Get uncommitted diff
    const diff = await this.getUncommittedDiff();

    // Get current Beads task if any
    const beadsTask = await this.getCurrentBeadsTask();

    // Create checkpoint object
    const checkpoint: Checkpoint = {
      id,
      timestamp,
      message,
      branch: gitState.branch,
      commit: gitState.commit,
      files,
      diff: diff || undefined,
      beadsTask: beadsTask || undefined,
    };

    // Save checkpoint to file
    const filePath = join(this.checkpointsDir, `${id}.json`);
    await writeFile(filePath, JSON.stringify(checkpoint, null, 2));

    return checkpoint;
  }

  /**
   * Restore from a checkpoint
   */
  async restore(checkpointId: string): Promise<boolean> {
    const checkpoint = await this.getCheckpoint(checkpointId);
    if (!checkpoint) {
      throw new Error(`Checkpoint not found: ${checkpointId}`);
    }

    // Confirm with user
    console.log(`\nRestoring checkpoint: ${checkpoint.id}`);
    console.log(`Message: ${checkpoint.message || 'No message'}`);
    console.log(`Branch: ${checkpoint.branch}`);
    console.log(`Files modified: ${checkpoint.files.length}`);
    console.log(`\n⚠️  Warning: Uncommitted changes will be lost`);

    // TODO: Implement user confirmation (for now, auto-proceed)

    try {
      // Clean working directory
      await this.cleanWorkingDirectory();

      // Checkout to the commit/branch from checkpoint
      if (checkpoint.commit) {
        await this.gitCheckout(checkpoint.commit);
      }

      // Apply uncommitted changes if available
      if (checkpoint.diff) {
        await this.applyDiff(checkpoint.diff);
      }

      // Restore Beads task state if available
      if (checkpoint.beadsTask) {
        await this.restoreBeadsTask(checkpoint.beadsTask);
      }

      return true;
    } catch (error) {
      console.error('Failed to restore checkpoint:', error);
      return false;
    }
  }

  /**
   * List all checkpoints
   */
  async list(): Promise<Checkpoint[]> {
    try {
      const files = await readdir(this.checkpointsDir);
      const checkpoints: Checkpoint[] = [];

      for (const file of files) {
        if (!file.endsWith('.json')) continue;

        const filePath = join(this.checkpointsDir, file);
        const content = await readFile(filePath, 'utf-8');
        const checkpoint = JSON.parse(content) as Checkpoint;
        checkpoints.push(checkpoint);
      }

      // Sort by timestamp, newest first
      return checkpoints.sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    } catch {
      return [];
    }
  }

  /**
   * Get a specific checkpoint
   */
  async getCheckpoint(id: string): Promise<Checkpoint | null> {
    const filePath = join(this.checkpointsDir, `${id}.json`);

    try {
      const content = await readFile(filePath, 'utf-8');
      return JSON.parse(content) as Checkpoint;
    } catch {
      return null;
    }
  }

  /**
   * Get the latest checkpoint
   */
  async getLatest(): Promise<Checkpoint | null> {
    const checkpoints = await this.list();
    return checkpoints.length > 0 ? checkpoints[0] : null;
  }

  /**
   * Delete a checkpoint
   */
  async delete(id: string): Promise<boolean> {
    const filePath = join(this.checkpointsDir, `${id}.json`);

    try {
      await execAsync(`rm "${filePath}"`);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Generate checkpoint ID based on timestamp
   */
  private generateId(): string {
    const now = new Date();
    const date = now.toISOString().split('T')[0].replace(/-/g, '');
    const time = now.toTimeString().split(' ')[0].replace(/:/g, '');
    return `checkpoint-${date}-${time}`;
  }

  /**
   * Get current git state
   */
  private async getGitState(): Promise<{ branch: string; commit?: string }> {
    try {
      // Get branch name
      const { stdout: branch } = await execAsync('git rev-parse --abbrev-ref HEAD');

      // Get current commit hash
      const { stdout: commit } = await execAsync('git rev-parse HEAD');

      return {
        branch: branch.trim(),
        commit: commit.trim(),
      };
    } catch {
      // Not a git repository or git not available
      return { branch: 'main' };
    }
  }

  /**
   * Get list of modified files
   */
  private async getModifiedFiles(): Promise<string[]> {
    try {
      const { stdout } = await execAsync('git status --porcelain');
      const lines = stdout.trim().split('\n');
      return lines.filter(line => line.trim()).map(line => line.substring(3));
    } catch {
      return [];
    }
  }

  /**
   * Get uncommitted changes diff
   */
  private async getUncommittedDiff(): Promise<string> {
    try {
      const { stdout } = await execAsync('git diff HEAD');
      return stdout;
    } catch {
      return '';
    }
  }

  /**
   * Get current Beads task
   */
  private async getCurrentBeadsTask(): Promise<{ id: string; status: string } | null> {
    const beadsDir = join(this.projectPath, '.beads');
    try {
      const files = await readdir(beadsDir);
      const beadFiles = files.filter(f => f.startsWith('bead-') && f.endsWith('.md'));

      for (const file of beadFiles) {
        const content = await readFile(join(beadsDir, file), 'utf-8');
        const statusMatch = content.match(/^status:\s*(\w+)/m);
        const id = file.replace('.md', '');

        if (statusMatch && (statusMatch[1] === 'in-progress' || statusMatch[1] === 'todo')) {
          return {
            id,
            status: statusMatch[1],
          };
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Clean working directory
   */
  private async cleanWorkingDirectory(): Promise<void> {
    try {
      // Reset all changes
      await execAsync('git reset --hard HEAD');
      // Clean untracked files
      await execAsync('git clean -fd');
    } catch (error) {
      throw new Error(`Failed to clean working directory: ${error}`);
    }
  }

  /**
   * Checkout to a specific commit
   */
  private async gitCheckout(commit: string): Promise<void> {
    try {
      await execAsync(`git checkout ${commit}`);
    } catch (error) {
      throw new Error(`Failed to checkout commit: ${error}`);
    }
  }

  /**
   * Apply diff to working directory
   */
  private async applyDiff(diff: string): Promise<void> {
    try {
      // Apply diff using git apply
      // Write diff to temp file first
      const tempFile = '/tmp/checkpoint.diff';
      await writeFile(tempFile, diff);
      await execAsync(`git apply ${tempFile}`);
    } catch (error) {
      console.warn('Warning: Could not apply uncommitted changes:', error);
    }
  }

  /**
   * Restore Beads task state
   */
  private async restoreBeadsTask(task: { id: string; status: string }): Promise<void> {
    try {
      const beadsDir = join(this.projectPath, '.beads');
      const filePath = join(beadsDir, `${task.id}.md`);

      // Update task status
      let content = await readFile(filePath, 'utf-8');
      content = content.replace(/^status:\s*\w+/m, `status: ${task.status}`);
      content = content.replace(/^updated:\s*.+/m, `updated: ${new Date().toISOString()}`);

      await writeFile(filePath, content);
    } catch (error) {
      console.warn('Warning: Could not restore Beads task:', error);
    }
  }
}

/**
 * Format checkpoint for display
 */
export function formatCheckpoint(checkpoint: Checkpoint): string {
  const date = new Date(checkpoint.timestamp).toLocaleString();
  const size = JSON.stringify(checkpoint).length;
  const sizeMB = (size / 1024 / 1024).toFixed(2);

  return `
${checkpoint.id}
  Date: ${date}
  Message: ${checkpoint.message || 'No message'}
  Branch: ${checkpoint.branch}
  Files: ${checkpoint.files.length} modified
  Size: ${sizeMB} MB
${checkpoint.commit ? `  Commit: ${checkpoint.commit.substring(0, 7)}` : ''}
`;
}
