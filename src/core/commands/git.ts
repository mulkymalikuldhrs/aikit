import { DefaultCommand } from './types';

/**
 * Git & Version Control Commands
 */
export const GIT_COMMANDS: DefaultCommand[] = [
  {
    name: 'branch',
    description: 'Create a new feature branch',
    category: 'git',
    usage: '/branch <name>',
    examples: ['/branch feat/auth', '/branch fix/navigation-bug'],
    content: `Create and switch to a new branch.

## Workflow

Branch name: $ARGUMENTS

1. Ensure clean working directory
2. Pull latest main/master
3. Create branch with naming convention:
   - feat/* for features
   - fix/* for bug fixes
   - refactor/* for refactoring
   - docs/* for documentation
4. Switch to new branch`,
  },
  {
    name: 'merge',
    description: 'Merge current branch to target',
    category: 'git',
    usage: '/merge [target]',
    examples: ['/merge', '/merge main'],
    content: `Merge current branch to target.

## Workflow

Optional target branch: $ARGUMENTS

1. Run quality gates first
2. Commit any pending changes
3. Switch to target branch
4. Pull latest
5. Merge feature branch
6. Resolve conflicts if any
7. Push`,
  },
  {
    name: 'git:ignore-init',
    description: 'Initialize AI-safe .gitignore patterns',
    category: 'git',
    usage: '/git:ignore-init',
    examples: ['/git:ignore-init'],
    content: `Initialize AI-safe .gitignore patterns to prevent AI from accessing sensitive files.

## Workflow

1. **Check Existing .gitignore**: See if .gitignore exists
2. **Backup**: Create .gitignore.backup if file exists
3. **Append Patterns**: Add AI-specific ignore patterns
4. **Verify**: Confirm patterns added successfully

## Patterns Added

**AI-Sensitive Files:**
\`\`\`
# AIKit - AI Agent Protection
.env
.env.local
.env.*.local
*.key
*.pem
secrets/
credentials/
.aws/
.ssh/
config/secrets.json

# AI Working Directories
.aikit/memory/
.aikit/checkpoints/
.aikit/sessions/

# Claude Code
.claude/settings.json
.claude/local_history.json

# OpenCode
.opencode/config.json
.opencode/state.json

# Agent-Specific
.agentignore
.aiignore

# Logs and Debug
*.log
logs/
debug.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Temporary Files
*.tmp
*.temp
.cache/
temp/
tmp/
\`\`\`

**Explanation of Each Pattern:**
- **Credentials**: API keys, tokens, certificates
- **Config**: Sensitive configuration files
- **Memory**: AI conversation history and context
- **Sessions**: Active AI session data
- **Logs**: Debug and error logs
- **Temp**: Temporary processing files

**Why These Patterns?**
- Prevent AI from reading API keys and secrets
- Avoid exposing sensitive user data
- Reduce AI context noise (logs, cache)
- Protect privacy
- Comply with security best practices

## Verification

**After Running Command:**
\`\`\`
✓ AI-safe patterns added to .gitignore
✓ Backup created: .gitignore.backup
✓ Protected: API keys, secrets, memory, logs
✓ Safe to commit code
\`\`\`

## Notes
- Patterns appended to existing .gitignore
- Doesn't remove existing patterns
- Can be manually customized after creation
- Recommend reviewing before committing`,
  },
];
