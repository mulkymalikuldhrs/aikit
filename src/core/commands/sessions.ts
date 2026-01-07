import { DefaultCommand } from './types';

/**
 * Session Management Commands
 */
export const SESSION_COMMANDS: DefaultCommand[] = [
  {
    name: 'session-start',
    description: 'Start a new development session',
    category: 'session',
    usage: '/session-start [name]',
    examples: [
      '/session-start',
      '/session-start authentication-refactor',
      '/session-start "Add user profile feature"',
    ],
    content: `Start a new development session to track your work.

## Workflow

Session name: $ARGUMENTS

**IMPORTANT - Scope Rules:**
- Sessions are scoped to the CURRENT working directory
- AIKit will NOT search parent directories for .aikit
- If .aikit doesn't exist in current directory, you MUST run 'aikit init' first
- Each directory needs its own .aikit if you want separate session tracking

1. **Check Current Directory:**
   - Verify .aikit exists in current directory (process.cwd())
   - If not, inform user to run 'aikit init' first
   - DO NOT search parent directories

2. **Create Session:**
   - Generate session ID with timestamp
   - Create session file in .aikit/sessions/ (current directory only)
   - Determine session tracker file:
     * Try 'tty' command to get terminal identifier
     * If 'tty' works, use .aikit/sessions/.current-<sanitized_tty>-session
       (replace '/' with '-' in TTY path)
     * If 'tty' fails with "not a tty", get parent PID using: ps -o ppid= -p $$
       Use .aikit/sessions/.current-ppid-<PPID>-session
       (each Claude Code window has unique PPID)
   - Write session ID to the tracker file
   - **Capture initial git state (scoped to current directory):**
     * First check if .git exists in CURRENT directory (process.cwd())
     * ONLY capture git state if .git exists in current directory
     * DO NOT search parent directories for git repo
     * If no .git in current directory, skip git state capture

3. **Set Goals:**
   - Ask user for session goals if not provided
   - Document what you want to accomplish
   - Link to Beads task if active

4. **Session Started:**
   - Session ID: YYYY-MM-DD-HHMM[-name]
   - Status: active
   - Ready for updates

## What Gets Tracked
- Session start time
- Git branch and commits (ONLY if .git exists in current directory)
- Modified files (ONLY if .git exists in current directory)
- Progress notes
- Linked Beads task

## Session File Location
Current directory: .aikit/sessions/YYYY-MM-DD-HHMM[-name].md
(Always relative to process.cwd(), never parent directories)

## Examples

Start unnamed session:
\`\`\`
/session-start
\`\`\`

Start with descriptive name:
\`\`\`
/session-start auth-refactor
\`\`\`

Start with goal:
\`\`\`
/session-start "Implement OAuth 2.0"
Goals:
- Add Google OAuth
- Add JWT token handling
\`\`\`

## Notes
- Session files are markdown with frontmatter
- Sessions persist across AI conversations
- Use /session-update to add progress notes
- Use /session-end to close and summarize`,
  },
  {
    name: 'session-update',
    description: 'Add progress notes to current session',
    category: 'session',
    usage: '/session-update [notes]',
    examples: [
      '/session-update',
      '/session-update Fixed authentication bug',
      '/session-update "Added JWT middleware"',
    ],
    content: `Update the current session with progress notes.

## Workflow

Progress notes: $ARGUMENTS

1. **Check Active Session:**
   - Determine session tracker file:
     * Try 'tty' command to get terminal identifier
     * If 'tty' works, read .aikit/sessions/.current-<sanitized_tty>-session
     * If 'tty' fails, get parent PID and read .aikit/sessions/.current-ppid-<PPID>-session
   - Load session file

2. **Capture Current State:**
   - **IMPORTANT - Git State Scope:**
     * First check if .git exists in CURRENT directory (process.cwd())
     * ONLY capture git state if .git exists in current directory
     * DO NOT search parent directories for git repo
     * If no .git in current directory, skip git state capture
   - If .git exists in current directory:
     * Get current git branch
     * Count git commits
     * List modified files
   - Check active Beads task (from .beads directory if exists)

3. **Add Update:**
   - Add timestamped update entry
   - Include your notes (or auto-generate)
   - Include git state ONLY if .git exists in current directory
   - Include Beads task if active

4. **Save Session:**
   - Update session file
   - Confirm update added

## What Gets Captured
- Timestamp of update
- Your progress notes
- Git state (branch, commits, files) - ONLY if .git exists in current directory
- Active Beads task (if any)

## Examples

Auto-update (no notes):
\`\`\`
/session-update
\`\`\`
*Auto-generates summary of recent work*

With specific notes:
\`\`\`
/session-update Fixed Next.js params issue
\`\`\`

With detailed notes:
\`\`\`
/session-update "Implemented OAuth flow with Google provider. Added callback handler and token validation."
\`\`\`

## Notes
- Must have active session first
- Updates are timestamped
- Git state automatically captured
- Beads task automatically linked`,
  },
  {
    name: 'session-end',
    description: 'End current session with summary',
    category: 'session',
    usage: '/session-end',
    examples: ['/session-end'],
    content: `End the current session and generate a comprehensive summary.

## Workflow

1. **Check Active Session:**
   - Verify there's an active session
   - Load session data

2. **Generate Summary:**
   - Calculate session duration
   - Review all progress notes
   - Check goals completion
   - Count git commits
   - List modified files
   - Identify key accomplishments

3. **Create Summary Section:**
   - Duration
   - Goals status
   - Total updates
   - Git summary
   - Key accomplishments
   - Problems solved
   - Lessons learned

4. **Close Session:**
   - Mark session as ended
   - Set end time
   - Save session file
   - Determine session tracker file:
     * Try 'tty' command to get terminal identifier
     * If 'tty' works, clear .aikit/sessions/.current-<sanitized_tty>-session
     * If 'tty' fails, get parent PID and clear .aikit/sessions/.current-ppid-<PPID>-session

## Summary Includes

**Session Info:**
- Duration (hours and minutes)
- Start and end times
- Session name

**Goals:**
- List of all goals
- Completion status

**Progress:**
- Number of updates
- Key accomplishments
- Problems and solutions

**Git Activity:**
- Total commits
- Files modified
- Branch worked on

**Beads Task:**
- Linked task ID and status

## Example Output
\`\`\`
Session ended: 2025-01-02-1430-auth-refactor
Duration: 2h 30m

Goals:
- Refactor OAuth flow ✅
- Add JWT support ✅

Updates: 5
Commits: 3
Files Modified: 7

Summary:
Successfully refactored authentication system with OAuth 2.0
and JWT token support. Resolved Next.js 15 async issues.

Lessons:
- Next.js 15 requires await for params
- JWT middleware order matters
\`\`\`

## Notes
- Session cannot be updated after ending
- Summary is automatically generated
- Session file persists for future reference
- Can start new session after ending`,
  },
  {
    name: 'session-current',
    description: 'Show current active session',
    category: 'session',
    usage: '/session-current',
    examples: ['/session-current'],
    content: `Display information about the current active session.

## Workflow

1. **Check Active Session:**
   - Determine session tracker file:
     * Try 'tty' command to get terminal identifier
     * If 'tty' works, read .aikit/sessions/.current-<sanitized_tty>-session
     * If 'tty' fails, get parent PID and read .aikit/sessions/.current-ppid-<PPID>-session
   - Load session data

2. **Display Session Info:**
   - Session name and ID
   - How long session has been active
   - Session goals
   - Recent updates (last 3)
   - Current git state
   - Active Beads task

3. **Show Actions:**
   - Available session commands
   - Quick reminder to update/end

## Example Output
\`\`\`
📍 Current Session

Session: authentication-refactor
ID: 2025-01-02-1430-auth-refactor
Started: 2 hours ago

Goals:
- [ ] Refactor OAuth flow
- [x] Add JWT support

Recent Updates:
15:45 - Implemented OAuth 2.0 with Google
16:20 - Added JWT token generation

Git:
- Branch: feature/auth
- Commits: 3
- Modified: 5 files

Beads Task:
- bead-001 (in-progress)

Commands:
/session-update [notes] - Add progress
/session-end - Close session
\`\`\`

## Notes
- Shows error if no active session
- Use to quickly check session status
- Displays recent progress`,
  },
  {
    name: 'session-list',
    description: 'List all sessions',
    category: 'session',
    usage: '/session-list',
    examples: ['/session-list'],
    content: `List all development sessions with summaries.

## Workflow

1. **Scan Sessions Directory:**
   - Find all .md files in .aikit/sessions/
   - Exclude all .current-*-session files (terminal trackers)

2. **Sort by Date:**
   - Newest sessions first

3. **Display Summary:**
   - Session ID and name
   - Start and end times
   - Status (active/ended)
   - Number of updates
   - Session goals

## Example Output
\`\`\`
📚 All Sessions

1. 2025-01-02-1430-auth-refactor
   Status: Active
   Started: 2 hours ago
   Updates: 5
   Goals: Refactor OAuth, Add JWT

2. 2025-01-02-1200-bug-fix
   Status: Ended
   Started: Today 12:00
   Ended: Today 13:30 (1h 30m)
   Updates: 3
   Goals: Fix email bounce handling

3. 2025-01-01-1530-feature-user-profile
   Status: Ended
   Started: Yesterday 15:30
   Ended: Yesterday 18:45 (3h 15m)
   Updates: 8
   Goals: Add user profile page

Total: 3 sessions
\`\`\`

## Notes
- Shows both active and ended sessions
- Most recent sessions first
- Active session highlighted
- Use /session-show <id> for details`,
  },
  {
    name: 'session-show',
    description: 'Show details of a specific session',
    category: 'session',
    usage: '/session-show <session-id>',
    examples: [
      '/session-show 2025-01-02-1430',
      '/session-show 2025-01-02-1430-auth-refactor',
    ],
    content: `Display full details of a specific session.

## Workflow

Session ID: $ARGUMENTS

1. **Load Session:**
   - Find session file
   - Parse session data

2. **Display Details:**
   - Session metadata
   - All progress notes
   - Git activity timeline
   - Summary (if ended)

3. **Format Output:**
   - Readable markdown format
   - Chronological updates
   - Key accomplishments

## Example Output
\`\`\`
📄 Session: 2025-01-02-1430-auth-refactor

Status: Ended
Started: 2025-01-02 14:30
Ended: 2025-01-02 17:00
Duration: 2h 30m

Goals:
- [x] Refactor OAuth flow
- [x] Add JWT support

## Progress

### 2025-01-02 14:30
Started session: authentication-refactor
Git Branch: feature/auth

### 2025-01-02 15:45
Implemented OAuth 2.0 flow with Google provider
Added callback handler and token validation
Git Branch: feature/auth

### 2025-01-02 16:20
Added JWT token generation and validation
Created middleware for protected routes
Git Branch: feature/auth

### 2025-01-02 17:00
Session ended

## Summary
Duration: 2h 30m
Goals: 2
Updates: 4
Git Commits: 3
Files Modified: 7

Successfully refactored authentication system...
\`\`\`

## Notes
- Use session ID or partial ID
- Shows all updates chronologically
- Full session details displayed`,
  },
  {
    name: 'session-search',
    description: 'Search sessions by keyword',
    category: 'session',
    usage: '/session-search <query>',
    examples: [
      '/session-search oauth',
      '/session-search "jwt"',
      '/session-search authentication',
    ],
    content: `Search for sessions matching a keyword.

## Workflow

Search query: $ARGUMENTS

1. **Search Sessions:**
   - Search in session names
   - Search in session IDs
   - Search in goals
   - Search in update notes

2. **Display Results:**
   - Matching sessions
   - Highlight match context
   - Sort by date

3. **Show Actions:**
   - List matching sessions
   - Suggest /session-show for details

## Example Output
\`\`\`
🔍 Search Results: "oauth"

Found 2 sessions:

1. 2025-01-02-1430-auth-refactor
   Match: Name contains "oauth" (case-insensitive)
   Started: 2 hours ago
   Status: Active
   Goals: Refactor OAuth flow, Add JWT

2. 2025-01-01-1200-oauth-fix
   Match: Goals contain "OAuth"
   Started: Yesterday
   Status: Ended
   Goals: Fix OAuth callback

Total: 2 matching sessions
\`\`\`

## Notes
- Case-insensitive search
- Searches name, goals, and notes
- Shows matching context
- Use partial IDs too`,
  },
  {
    name: 'session-resume',
    description: 'Resume a past session (load context)',
    category: 'session',
    usage: '/session-resume <session-id>',
    examples: [
      '/session-resume latest',
      '/session-resume 2025-01-02-1430',
      '/session-resume 2025-01-02-1430-auth-refactor',
    ],
    content: `Load context from a past session to resume work.

## Workflow

Session ID: $ARGUMENTS (or "latest")

1. **Find Session:**
   - If "latest", load most recent session
   - Otherwise, load specified session

2. **Load Context:**
   - Display session summary
   - Show what was accomplished
   - Show what's remaining
   - List key decisions made

3. **Suggest Next Actions:**
   - Based on session goals
   - Based on remaining tasks
   - Based on session end notes

4. **Display Session:**
   - Full session details
   - All progress notes
   - Git activity
   - Summary and lessons

## Example Output
\`\`\`
🔄 Resuming Session: 2025-01-02-1430-auth-refactor

## What Was Done
✓ Refactored OAuth flow
✓ Added JWT middleware
✓ Fixed Next.js 15 issues

## What Remains
○ Add refresh token support
○ Write tests for auth module
○ Update documentation

## Key Decisions
- Used next-auth for OAuth
- JWT middleware order: auth → validate → route
- Next.js 15 requires async params

## Problems Solved
- Next.js 15 params Promise issue
- Cookie domain configuration
- JWT secret from env var

## Suggested Next Steps
1. Add refresh token rotation
2. Write unit tests for auth
3. Update API documentation
4. Deploy to staging for testing

Session context loaded! Ready to continue.
\`\`\`

## Notes
- Use "latest" for most recent session
- Loads full context for continuity
- Suggests next actions based on goals
- Great for picking up after a break`,
  },
];
