import { readFile, writeFile, readdir, access, constants } from 'fs/promises';
import { join } from 'path';
import { Config } from './config.js';
import { logger } from '../utils/logger.js';

/**
 * Spec violation
 */
export interface SpecViolation {
  rule: string;
  description: string;
  severity: 'error' | 'warning';
  location?: string;
}

/**
 * Review item
 */
export interface ReviewItem {
  type: 'change' | 'skip' | 'inconsistency';
  description: string;
  files?: string[];
}

/**
 * Anti-Hallucination System
 * 
 * Prevents AI from inventing APIs, assuming features, and losing track of requirements.
 * Implements three validation layers:
 * 1. Task Validation (.beads/ tracking)
 * 2. Spec Enforcement (spec.md constraints)
 * 3. Review Gates (review.md documentation)
 */
export class AntiHallucination {
  private config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  /**
   * Layer 1: Validate task exists before work begins
   */
  async validateTask(taskId?: string): Promise<{
    valid: boolean;
    task?: {
      id: string;
      description: string;
      status: string;
    };
    error?: string;
  }> {
    const beadsDir = join(this.config.projectPath, '.beads');
    
    try {
      await access(beadsDir, constants.R_OK);
    } catch {
      return {
        valid: false,
        error: 'No .beads directory found. Run "bd init" to initialize task tracking.',
      };
    }
    
    if (!taskId) {
      // Check for any active task
      const files = await readdir(beadsDir);
      const beadFiles = files.filter(f => f.match(/^bead-\d+\.md$/));
      
      if (beadFiles.length === 0) {
        return {
          valid: false,
          error: 'No tasks found. Create a task with /create before starting work.',
        };
      }
      
      // Find in-progress task
      for (const file of beadFiles) {
        const content = await readFile(join(beadsDir, file), 'utf-8');
        if (content.includes('status: in-progress') || content.includes('Status: In Progress')) {
          const id = file.replace('.md', '');
          const descMatch = content.match(/description:\s*(.+)/i) || content.match(/# (.+)/);
          return {
            valid: true,
            task: {
              id,
              description: descMatch?.[1] || 'Unknown task',
              status: 'in-progress',
            },
          };
        }
      }
      
      return {
        valid: false,
        error: 'No active task found. Start a task with /create or /implement.',
      };
    }
    
    // Check specific task
    const taskFile = join(beadsDir, `${taskId}.md`);
    try {
      const content = await readFile(taskFile, 'utf-8');
      const statusMatch = content.match(/status:\s*(\w+)/i);
      const descMatch = content.match(/description:\s*(.+)/i) || content.match(/# (.+)/);
      
      return {
        valid: true,
        task: {
          id: taskId,
          description: descMatch?.[1] || 'Unknown task',
          status: statusMatch?.[1] || 'unknown',
        },
      };
    } catch {
      return {
        valid: false,
        error: `Task not found: ${taskId}`,
      };
    }
  }

  /**
   * Layer 2: Check spec constraints
   */
  async checkSpec(): Promise<{
    hasSpec: boolean;
    constraints?: {
      naming: string[];
      forbidden: string[];
      required: string[];
    };
  }> {
    const specFile = this.config.antiHallucination.specFile;
    const specPath = join(this.config.projectPath, specFile);
    
    try {
      const content = await readFile(specPath, 'utf-8');
      
      const constraints = {
        naming: this.extractConstraints(content, 'Naming'),
        forbidden: this.extractConstraints(content, 'Forbidden'),
        required: this.extractConstraints(content, 'Required'),
      };
      
      return { hasSpec: true, constraints };
    } catch {
      return { hasSpec: false };
    }
  }

  /**
   * Validate code against spec constraints
   */
  async validateAgainstSpec(code: string, filePath: string): Promise<SpecViolation[]> {
    const spec = await this.checkSpec();
    const violations: SpecViolation[] = [];
    
    if (!spec.hasSpec || !spec.constraints) {
      return violations;
    }
    
    // Check forbidden patterns
    for (const forbidden of spec.constraints.forbidden) {
      const pattern = this.patternToRegex(forbidden);
      if (pattern && pattern.test(code)) {
        violations.push({
          rule: 'Forbidden Pattern',
          description: forbidden,
          severity: 'error',
          location: filePath,
        });
      }
    }
    
    return violations;
  }

  /**
   * Layer 3: Create review documentation
   */
  async createReview(changes: {
    filesChanged: string[];
    functionsAdded: string[];
    testsAdded: string[];
    skipped?: string[];
    inconsistencies?: string[];
  }): Promise<string> {
    const reviewFile = this.config.antiHallucination.reviewFile;
    const reviewPath = join(this.config.projectPath, reviewFile);
    
    const content = `# Code Review

_Generated: ${new Date().toISOString()}_

## What Changed

### Files Modified
${changes.filesChanged.map(f => `- ${f}`).join('\n') || '- None'}

### Functions Added
${changes.functionsAdded.map(f => `- ${f}`).join('\n') || '- None'}

### Tests Added
${changes.testsAdded.map(t => `- ${t}`).join('\n') || '- None'}

## What Was Skipped
${changes.skipped?.map(s => `- ${s}`).join('\n') || '- Nothing skipped'}

## Inconsistencies
${changes.inconsistencies?.map(i => `- ⚠️ ${i}`).join('\n') || '- None found'}

## Verification
- [ ] All tests pass
- [ ] Type check passes
- [ ] Linting passes
- [ ] Build succeeds
- [ ] Manual testing completed
`;
    
    await writeFile(reviewPath, content);
    return reviewPath;
  }

  /**
   * Verify completion (hard gates)
   */
  async verifyCompletion(): Promise<{
    passed: boolean;
    gates: {
      name: string;
      passed: boolean;
      error?: string;
    }[];
  }> {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    const gates = [
      { name: 'Type Check', command: 'npm run typecheck' },
      { name: 'Tests', command: 'npm run test' },
      { name: 'Lint', command: 'npm run lint' },
      { name: 'Build', command: 'npm run build' },
    ];
    
    const results: { name: string; passed: boolean; error?: string }[] = [];
    
    for (const gate of gates) {
      try {
        await execAsync(gate.command, { cwd: this.config.projectPath });
        results.push({ name: gate.name, passed: true });
      } catch (error) {
        results.push({
          name: gate.name,
          passed: false,
          error: error instanceof Error ? error.message : 'Failed',
        });
      }
    }
    
    return {
      passed: results.every(r => r.passed),
      gates: results,
    };
  }

  /**
   * Recovery: Check for context loss
   */
  async checkContextLoss(): Promise<{
    hasHandoff: boolean;
    latestHandoff?: string;
  }> {
    const handoffsDir = join(this.config.configPath, 'memory', 'handoffs');
    
    try {
      const files = await readdir(handoffsDir);
      const handoffs = files.filter(f => f.endsWith('.md')).sort().reverse();
      
      if (handoffs.length > 0) {
        return {
          hasHandoff: true,
          latestHandoff: handoffs[0],
        };
      }
    } catch {
      // No handoffs directory
    }
    
    return { hasHandoff: false };
  }

  /**
   * Initialize spec.md template
   */
  async initSpec(): Promise<void> {
    const specPath = join(this.config.projectPath, this.config.antiHallucination.specFile);
    
    try {
      await access(specPath, constants.R_OK);
      logger.info('spec.md already exists');
      return;
    } catch {
      // Create template
    }
    
    const template = `# Project Specification

## Constraints

### Naming
- Components: PascalCase
- Files: kebab-case
- Variables: camelCase
- Constants: SCREAMING_SNAKE_CASE

### Forbidden
- No inline styles
- No \`any\` types
- No console.log in production code
- No hardcoded secrets
- No disabled ESLint rules

### Required
- JSDoc on all exported functions
- Input validation on API routes
- Error handling for async operations
- Unit tests for business logic

## Architecture

Describe your project architecture here.

## Dependencies

List approved dependencies here.
`;
    
    await writeFile(specPath, template);
    logger.success('Created spec.md template');
  }

  /**
   * Extract constraints from a section
   */
  private extractConstraints(content: string, section: string): string[] {
    const sectionMatch = content.match(new RegExp(`### ${section}[\\s\\S]*?(?=###|$)`, 'i'));
    if (!sectionMatch) return [];
    
    const lines = sectionMatch[0].split('\n');
    return lines
      .filter(line => line.trim().startsWith('-'))
      .map(line => line.replace(/^-\s*/, '').trim());
  }

  /**
   * Convert a constraint description to a regex pattern
   */
  private patternToRegex(description: string): RegExp | null {
    // Simple pattern matching
    if (description.includes('console.log')) {
      return /console\.log/;
    }
    if (description.includes('any') && description.includes('type')) {
      return /:\s*any\b/;
    }
    if (description.includes('inline style')) {
      return /style=\{/;
    }
    return null;
  }
}
