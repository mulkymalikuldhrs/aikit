import { readFile, writeFile, readdir, mkdir, access, constants, unlink } from 'fs/promises';
import { join } from 'path';
import matter from 'gray-matter';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Sanitize TTY path for use in filename
 * Replaces '/' and other special characters with '-'
 */
function sanitizeTTY(tty: string): string {
  return tty.replace(/[^a-zA-Z0-9._-]/g, '-');
}

/**
 * Session update structure
 */
export interface SessionUpdate {
  timestamp: string;
  notes?: string;
  gitBranch?: string;
  gitCommits?: number;
  modifiedFiles?: string[];
  beadsTask?: {
    id: string;
    status: string;
  };
}

/**
 * Session data structure
 */
export interface Session {
  id: string;
  name: string;
  startTime: string;
  endTime?: string;
  goals: string[];
  updates: SessionUpdate[];
  status: 'active' | 'ended';
}

/**
 * Session Manager
 * Handles session lifecycle for development tracking
 */
export class SessionManager {
  private sessionsDir: string;
  private projectPath: string;
  private aikitDir: string;

  constructor(projectPath?: string) {
    // STRICT SCOPE: Only use current working directory, never search parent
    this.projectPath = projectPath || process.cwd();
    this.aikitDir = join(this.projectPath, '.aikit');
    this.sessionsDir = join(this.aikitDir, 'sessions');
  }

  /**
   * Get current terminal's TTY path
   * Uses the `tty` command to get the terminal device path
   * Returns null if not a TTY (editor environment)
   */
  private async getCurrentTTY(): Promise<string | null> {
    try {
      const { stdout } = await execAsync('tty');
      const tty = stdout.trim();
      // Check if it's a valid TTY (not "not a tty")
      if (tty === 'not a tty' || !tty.startsWith('/')) {
        return null;
      }
      return tty;
    } catch {
      // Not a TTY or tty command not available
      return null;
    }
  }

  /**
   * Get a unique identifier for the current terminal/editor session
   * Uses TTY if available, otherwise uses PPID (parent process ID)
   */
  private async getTerminalIdentifier(): Promise<string> {
    const tty = await this.getCurrentTTY();
    if (tty) {
      return sanitizeTTY(tty);
    }
    // No TTY - use parent PID for unique per-terminal identification
    // Each Claude Code window has a different parent process
    return `ppid-${process.ppid}`;
  }

  /**
   * Get the current session tracker file path
   * Always uses per-terminal file (TTY or PPID-based)
   */
  private async getSessionTrackerPath(): Promise<string> {
    const identifier = await this.getTerminalIdentifier();
    return join(this.sessionsDir, `.current-${identifier}-session`);
  }

  /**
   * Switch to a different session in the current terminal
   */
  async switchSession(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    const sessionFile = await this.getSessionTrackerPath();
    await writeFile(sessionFile, sessionId);
  }

  /**
   * Initialize the current terminal's session file
   * Creates an empty tracker file if it doesn't exist
   */
  async initTerminalSession(): Promise<{ tracker: string }> {
    const sessionFile = await this.getSessionTrackerPath();

    // Create empty file if it doesn't exist
    try {
      await access(sessionFile);
    } catch {
      await writeFile(sessionFile, '');
    }

    return { tracker: sessionFile };
  }

  /**
   * Get current terminal info (for display purposes)
   */
  async getTerminalInfo(): Promise<{ tty: string | null; sessionId: string | null }> {
    const tty = await this.getCurrentTTY();
    const sessionId = await this.getActiveSessionId();
    return { tty, sessionId };
  }

  /**
   * Check if .aikit directory exists in current project path
   */
  private async ensureAikitExists(): Promise<void> {
    try {
      await access(this.aikitDir, constants.R_OK);
    } catch {
      throw new Error(
        `AIKit not initialized in current directory (${this.projectPath}). ` +
        `Run 'aikit init' first to initialize AIKit in this directory.`
      );
    }
  }

  /**
   * Initialize sessions directory
   */
  async init(): Promise<void> {
    // Ensure .aikit exists before creating sessions subdirectory
    await this.ensureAikitExists();
    await mkdir(this.sessionsDir, { recursive: true });
  }

  /**
   * Start a new session
   */
  async startSession(name?: string, goals?: string[]): Promise<Session> {
    // Ensure .aikit exists (will throw if not)
    await this.ensureAikitExists();
    await this.init();

    // Generate session ID
    const now = new Date();
    const date = now.toISOString().split('T')[0].replace(/-/g, '');
    const time = now.toTimeString().split(' ')[0].replace(/:/g, '');
    const nameSuffix = name ? `-${name.replace(/\s+/g, '-').toLowerCase()}` : '';
    const id = `${date}-${time}${nameSuffix}`;

    // Create session object
    const session: Session = {
      id,
      name: name || 'Untitled Session',
      startTime: now.toISOString(),
      goals: goals || [],
      updates: [],
      status: 'active',
    };

    // Get initial git state
    const gitState = await this.getGitState();

    // Create initial update
    session.updates.push({
      timestamp: now.toISOString(),
      notes: name ? `Started session: ${name}` : 'Started new session',
      gitBranch: gitState.branch,
      gitCommits: 0,
    });

    // Save session file
    await this.saveSession(session);

    // Update active session tracker
    await this.setActiveSession(id);

    return session;
  }

  /**
   * Update current session with notes
   */
  async updateSession(notes?: string): Promise<Session | null> {
    // Ensure .aikit exists (will throw if not)
    await this.ensureAikitExists();
    
    const sessionId = await this.getActiveSessionId();
    if (!sessionId) {
      throw new Error('No active session. Use startSession() first.');
    }

    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    // Get current git state
    const gitState = await this.getGitState();
    const modifiedFiles = await this.getModifiedFiles();

    // Create update
    const update: SessionUpdate = {
      timestamp: new Date().toISOString(),
      notes: notes || 'Session updated',
      gitBranch: gitState.branch,
      gitCommits: gitState.commits || 0,
      modifiedFiles,
    };

    // Check for active Beads task
    const beadsTask = await this.getCurrentBeadsTask();
    if (beadsTask) {
      update.beadsTask = beadsTask;
    }

    session.updates.push(update);

    // Save session
    await this.saveSession(session);

    return session;
  }

  /**
   * End current session and generate summary
   */
  async endSession(): Promise<Session | null> {
    // Ensure .aikit exists (will throw if not)
    await this.ensureAikitExists();
    
    const sessionId = await this.getActiveSessionId();
    if (!sessionId) {
      throw new Error('No active session. Use startSession() first.');
    }

    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    // Set end time
    session.endTime = new Date().toISOString();
    session.status = 'ended';

    // Add final update with summary
    const gitState = await this.getGitState();
    const modifiedFiles = await this.getModifiedFiles();

    session.updates.push({
      timestamp: session.endTime,
      notes: 'Session ended',
      gitBranch: gitState.branch,
      gitCommits: gitState.commits || 0,
      modifiedFiles,
    });

    // Save session
    await this.saveSession(session);

    // Clear active session
    await this.clearActiveSession();

    return session;
  }

  /**
   * Get current active session
   */
  async getCurrentSession(): Promise<Session | null> {
    // Ensure .aikit exists (will throw if not)
    await this.ensureAikitExists();
    
    const sessionId = await this.getActiveSessionId();
    if (!sessionId) return null;
    return this.getSession(sessionId);
  }

  /**
   * Get all sessions
   */
  async listSessions(): Promise<Session[]> {
    // Ensure .aikit exists (will throw if not)
    await this.ensureAikitExists();
    
    try {
      const files = await readdir(this.sessionsDir);
      const sessions: Session[] = [];

      for (const file of files) {
        if (file === '.current-session' || !file.endsWith('.md')) continue;

        const sessionId = file.replace('.md', '');
        const session = await this.getSession(sessionId);
        if (session) {
          sessions.push(session);
        }
      }

      // Sort by start time, newest first
      return sessions.sort((a, b) =>
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      );
    } catch (error) {
      // If sessions directory doesn't exist, return empty array
      // (but .aikit should exist due to ensureAikitExists check above)
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  /**
   * Get specific session
   */
  async getSession(id: string): Promise<Session | null> {
    // Ensure .aikit exists (will throw if not)
    await this.ensureAikitExists();
    
    const filePath = join(this.sessionsDir, `${id}.md`);

    try {
      const content = await readFile(filePath, 'utf-8');
      const { data, content: body } = matter(content);

      // Parse updates from body
      const updates = this.parseUpdates(body);

      return {
        id: data.id as string || id,
        name: data.name as string || 'Untitled',
        startTime: data.startTime as string,
        endTime: data.endTime as string | undefined,
        goals: (data.goals as string[]) || [],
        updates,
        status: (data.status as 'active' | 'ended') || 'active',
      };
    } catch {
      return null;
    }
  }

  /**
   * Search sessions by keyword
   */
  async searchSessions(query: string): Promise<Session[]> {
    // listSessions() already ensures .aikit exists
    const sessions = await this.listSessions();
    const lowerQuery = query.toLowerCase();

    return sessions.filter((session) =>
      session.name.toLowerCase().includes(lowerQuery) ||
      session.id.toLowerCase().includes(lowerQuery) ||
      (Array.isArray(session.goals) && session.goals.some((g) => 
        typeof g === 'string' && g.toLowerCase().includes(lowerQuery)
      )) ||
      session.updates.some((u) => u.notes?.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Resume a past session (set as active)
   * Supports partial ID matching and "latest" keyword
   */
  async resumeSession(idOrLatest: string): Promise<Session> {
    // Ensure .aikit exists (will throw if not)
    await this.ensureAikitExists();

    let session: Session | null = null;

    if (idOrLatest === 'latest') {
      const sessions = await this.listSessions();
      if (sessions.length === 0) {
        throw new Error('No sessions found to resume');
      }
      session = sessions[0]; // Already sorted newest first
    } else {
      // Try exact match first
      session = await this.getSession(idOrLatest);
      
      // If not found, try partial match
      if (!session) {
        const sessions = await this.listSessions();
        const matches = sessions.filter(s => s.id.startsWith(idOrLatest));
        
        if (matches.length === 0) {
          throw new Error(`Session not found: ${idOrLatest}`);
        }
        if (matches.length > 1) {
          throw new Error(
            `Multiple sessions match "${idOrLatest}": ${matches.map(s => s.id).join(', ')}. ` +
            `Please use a more specific ID.`
          );
        }
        session = matches[0];
      }
    }

    if (!session) {
      throw new Error(`Session not found: ${idOrLatest}`);
    }

    // If session is already active, just return it
    const currentSessionId = await this.getActiveSessionId();
    if (currentSessionId === session.id) {
      return session;
    }

    // Set as active session
    await this.setActiveSession(session.id);

    // Add resume update if session was ended
    if (session.status === 'ended') {
      session.status = 'active';
      session.endTime = undefined; // Clear end time when resuming
      
      session.updates.push({
        timestamp: new Date().toISOString(),
        notes: 'Session resumed',
        gitBranch: (await this.getGitState()).branch,
      });

      await this.saveSession(session);
    }

    return session;
  }

  /**
   * Get active session ID
   * Reads from the current session tracker file
   */
  private async getActiveSessionId(): Promise<string | null> {
    const sessionFile = await this.getSessionTrackerPath();

    try {
      const content = await readFile(sessionFile, 'utf-8');
      return content.trim() || null;
    } catch {
      return null;
    }
  }

  /**
   * Set active session for current terminal
   * Writes to the current session tracker file
   */
  private async setActiveSession(id: string): Promise<void> {
    const sessionFile = await this.getSessionTrackerPath();
    await writeFile(sessionFile, id);
  }

  /**
   * Clear active session for current terminal
   */
  private async clearActiveSession(): Promise<void> {
    const sessionFile = await this.getSessionTrackerPath();

    try {
      await writeFile(sessionFile, '');
    } catch {
      // Ignore if file doesn't exist
    }
  }

  /**
   * Save session to file
   */
  private async saveSession(session: Session): Promise<void> {
    const filePath = join(this.sessionsDir, `${session.id}.md`);

    // Build updates section
    const updatesMarkdown = session.updates
      .map((update) => {
        const date = new Date(update.timestamp);
        const dateStr = date.toLocaleString();
        const sections: string[] = [`### ${dateStr}`];

        if (update.notes) {
          sections.push(update.notes);
        }

        if (update.gitBranch) {
          sections.push(`**Git Branch:** ${update.gitBranch}`);
        }

        if (update.modifiedFiles && update.modifiedFiles.length > 0) {
          sections.push(
            `**Modified Files:** ${update.modifiedFiles.length} files`,
            update.modifiedFiles.map((f) => `  - ${f}`).join('\n')
          );
        }

        if (update.beadsTask) {
          sections.push(`**Beads Task:** ${update.beadsTask.id} (${update.beadsTask.status})`);
        }

        return sections.join('\n');
      })
      .join('\n\n');

    // Build frontmatter (filter out undefined values)
    const frontmatter: Record<string, any> = {
      id: session.id,
      name: session.name,
      startTime: session.startTime,
      status: session.status,
      goals: session.goals,
    };

    // Only include endTime if it exists
    if (session.endTime) {
      frontmatter.endTime = session.endTime;
    }

    // Build content
    const content = `# Development Session - ${session.name}

**Started:** ${new Date(session.startTime).toLocaleString()}
**Status:** ${session.status}
${session.endTime ? `**Ended:** ${new Date(session.endTime).toLocaleString()}` : ''}

## Goals
${session.goals.map((g) => `- [ ] ${g}`).join('\n')}

## Progress

${updatesMarkdown}

## Summary
${this.generateSummary(session)}
`;

    // Write file
    const fileContent = matter.stringify(content, frontmatter);
    await writeFile(filePath, fileContent);
  }

  /**
   * Generate session summary
   */
  private generateSummary(session: Session): string {
    if (session.status === 'active') {
      return '*Session in progress...*';
    }

    const duration = session.endTime
      ? new Date(session.endTime).getTime() - new Date(session.startTime).getTime()
      : 0;
    const durationMinutes = Math.floor(duration / 60000);
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;

    let summary = `**Duration:** ${hours}h ${minutes}m\n\n`;

    // Goals completion
    const totalGoals = session.goals.length;
    summary += `**Goals:** ${totalGoals} defined\n\n`;

    // Count updates
    summary += `**Updates:** ${session.updates.length} progress notes\n\n`;

    // Git summary
    const lastUpdate = session.updates[session.updates.length - 1];
    if (lastUpdate?.gitCommits !== undefined) {
      summary += `**Git Commits:** ${lastUpdate.gitCommits} commits\n\n`;
    }

    if (lastUpdate?.modifiedFiles && lastUpdate.modifiedFiles.length > 0) {
      summary += `**Files Modified:** ${lastUpdate.modifiedFiles.length} files\n\n`;
    }

    summary += `**Total Updates:** ${session.updates.length}`;

    return summary;
  }

  /**
   * Parse updates from markdown body
   */
  private parseUpdates(body: string): SessionUpdate[] {
    const updates: SessionUpdate[] = [];
    const lines = body.split('\n');
    let currentUpdate: Partial<SessionUpdate> | null = null;
    let notesLines: string[] = [];

    for (const line of lines) {
      // Check for update header (### YYYY-MM-DD HH:MM)
      const updateMatch = line.match(/^### (\d{4}-\d{2}-\d{2} \d{2}:\d{2})/);
      if (updateMatch) {
        // Save previous update
        if (currentUpdate) {
          currentUpdate.notes = notesLines.join('\n').trim();
          updates.push(currentUpdate as SessionUpdate);
        }

        // Start new update
        currentUpdate = {
          timestamp: updateMatch[1],
        };
        notesLines = [];
        continue;
      }

      if (!currentUpdate) continue;

      // Parse git branch
      const gitBranchMatch = line.match(/\*\*Git Branch:\*\* (.+)/);
      if (gitBranchMatch) {
        currentUpdate.gitBranch = gitBranchMatch[1];
        continue;
      }

      // Parse commits
      const commitsMatch = line.match(/\*\*Git Commits:\*\* (\d+)/);
      if (commitsMatch) {
        currentUpdate.gitCommits = parseInt(commitsMatch[1], 10);
        continue;
      }

      // Parse modified files
      if (line.includes('**Modified Files:**')) {
        continue;
      }

      // Parse file list items
      if (line.trim().startsWith('- ') && currentUpdate) {
        if (!currentUpdate.modifiedFiles) {
          currentUpdate.modifiedFiles = [];
        }
        currentUpdate.modifiedFiles.push(line.trim().substring(2));
        continue;
      }

      // Parse Beads task
      const beadsMatch = line.match(/\*\*Beads Task:\*\* ([\w-]+) \((\w+)\)/);
      if (beadsMatch) {
        currentUpdate.beadsTask = {
          id: beadsMatch[1],
          status: beadsMatch[2],
        };
        continue;
      }

      // Collect notes (non-metadata lines)
      if (!line.startsWith('**') && !line.startsWith('#')) {
        notesLines.push(line);
      }
    }

    // Save last update
    if (currentUpdate) {
      currentUpdate.notes = notesLines.join('\n').trim();
      updates.push(currentUpdate as SessionUpdate);
    }

    return updates;
  }

  /**
   * Get git state
   */
  private async getGitState(): Promise<{ branch: string; commits?: number }> {
    try {
      // Get branch name
      const { stdout: branch } = await execAsync('git rev-parse --abbrev-ref HEAD');

      // Get commit count since session start (approximate)
      const { stdout: log } = await execAsync('git log --oneline | wc -l');

      return {
        branch: branch.trim(),
        commits: parseInt(log.trim(), 10),
      };
    } catch {
      // Not a git repository or git not available
      return { branch: 'main' };
    }
  }

  /**
   * Get modified files
   */
  private async getModifiedFiles(): Promise<string[]> {
    try {
      const { stdout } = await execAsync('git status --porcelain');
      const lines = stdout.trim().split('\n');
      return lines
        .filter((line) => line.trim())
        .map((line) => line.substring(3));
    } catch {
      return [];
    }
  }

  /**
   * Get current Beads task
   * NOTE: This only reads Beads metadata for session updates.
   * Sessions are NEVER stored in .beads - they are always in .aikit/sessions
   */
  private async getCurrentBeadsTask(): Promise<{ id: string; status: string } | null> {
    // STRICT SCOPE: Only read from .beads in current project path
    const beadsDir = join(this.projectPath, '.beads');
    try {
      const files = await readdir(beadsDir);
      const beadFiles = files.filter((f) => f.startsWith('bead-') && f.endsWith('.md'));

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
      // .beads doesn't exist or not readable - that's OK, just return null
      return null;
    }
  }
}

/**
 * Format session for display
 */
export function formatSession(session: Session): string {
  const startDate = new Date(session.startTime);
  const endDate = session.endTime ? new Date(session.endTime) : null;

  return `
${session.id}
  Name: ${session.name}
  Status: ${session.status}
  Started: ${startDate.toLocaleString()}
  ${endDate ? `Ended: ${endDate.toLocaleString()}` : ''}
  Goals: ${session.goals.length}
  Updates: ${session.updates.length}
`;
}
