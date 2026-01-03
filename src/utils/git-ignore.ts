import { readFile, writeFile, access } from 'fs/promises';
import { join } from 'path';

/**
 * Git ignore patterns for AI safety
 */
const AI_GITIGNORE_PATTERNS = `
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
`;

/**
 * Initialize AI-safe .gitignore patterns
 */
export async function initAISafeGitignore(projectPath?: string): Promise<boolean> {
  const project = projectPath || process.cwd();
  const gitignorePath = join(project, '.gitignore');

  try {
    // Check if .gitignore exists
    let existingContent = '';
    try {
      existingContent = await readFile(gitignorePath, 'utf-8');
    } catch {
      // File doesn't exist, that's fine
    }

    // Create backup
    if (existingContent) {
      const backupPath = join(project, '.gitignore.backup');
      await writeFile(backupPath, existingContent);
    }

    // Check if AI patterns already exist
    if (existingContent.includes('# AIKit - AI Agent Protection')) {
      return false; // Already initialized
    }

    // Append AI patterns
    const newContent = existingContent.trimEnd() + '\n' + AI_GITIGNORE_PATTERNS.trim() + '\n';
    await writeFile(gitignorePath, newContent);

    return true;
  } catch (error) {
    console.error('Failed to initialize AI-safe .gitignore:', error);
    return false;
  }
}

/**
 * Verify if .gitignore has AI-safe patterns
 */
export async function verifyAISafeGitignore(projectPath?: string): Promise<boolean> {
  const project = projectPath || process.cwd();
  const gitignorePath = join(project, '.gitignore');

  try {
    const content = await readFile(gitignorePath, 'utf-8');
    return content.includes('# AIKit - AI Agent Protection');
  } catch {
    return false;
  }
}
