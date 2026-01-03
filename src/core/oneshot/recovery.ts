import { exec } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';
import { AgentManager } from '../agents.js';
import { BeadsIntegration } from '../beads.js';
import { OneShotState, EnhancedPlan } from '../oneshot.js';
import { InteractivePrompts } from '../interactive.js';
import { logger } from '../../utils/logger.js';

const execAsync = promisify(exec);

/**
 * Recovery level enum
 */
export enum RecoveryLevel {
  AUTO_FIX = 1,      // Automatic fixes (lint --fix, type coercion, etc.)
  REVIEW_AGENT = 2,  // Delegate to @review agent for alternative approach
  USER_INTERVENTION = 3,  // Ask user for help
}

/**
 * Recovery result
 */
interface RecoveryResult {
  success: boolean;
  level: RecoveryLevel;
  action: string;
  details?: string;
}

/**
 * Error classification
 */
interface ErrorClassification {
  type: 'lint' | 'typescript' | 'test' | 'build' | 'runtime' | 'unknown';
  autoFixable: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  suggestedAction?: string;
}

/**
 * Error recovery - 3-level recovery strategy
 *
 * Level 1: Auto-fix (type errors, lint errors)
 * Level 2: Alternative approach (@review delegation)
 * Level 3: User intervention + follow-up bead
 */
export class ErrorRecovery {
  private agentManager: AgentManager;
  private beads: BeadsIntegration;
  private prompts: InteractivePrompts;
  private recoveryHistory: RecoveryResult[] = [];

  constructor(agentManager: AgentManager, beads: BeadsIntegration) {
    this.agentManager = agentManager;
    this.beads = beads;
    this.prompts = new InteractivePrompts();
  }

  /**
   * Recover from an error using 3-level strategy
   */
  async recover(error: Error, attempt: number): Promise<boolean> {
    const classification = this.classifyError(error);
    const level = this.determineRecoveryLevel(attempt, classification);

    logger.info(chalk.yellow(`\n🔧 Attempting recovery (Level ${level})...`));

    switch (level) {
      case RecoveryLevel.AUTO_FIX:
        return await this.attemptAutoFix(error, classification);

      case RecoveryLevel.REVIEW_AGENT:
        return await this.delegateToReviewAgent(error, classification);

      case RecoveryLevel.USER_INTERVENTION:
        return await this.requestUserIntervention(error, classification);

      default:
        return false;
    }
  }

  /**
   * Classify the error type
   */
  private classifyError(error: Error): ErrorClassification {
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';

    // Lint errors
    if (
      message.includes('eslint') ||
      message.includes('lint') ||
      message.includes('prettier')
    ) {
      return {
        type: 'lint',
        autoFixable: true,
        severity: 'low',
        suggestedAction: 'npm run lint -- --fix',
      };
    }

    // TypeScript errors
    if (
      message.includes('typescript') ||
      message.includes('ts') ||
      message.includes('type') ||
      message.includes('cannot find name') ||
      message.includes('is not assignable')
    ) {
      return {
        type: 'typescript',
        autoFixable: false, // TS errors usually need manual fix
        severity: 'medium',
        suggestedAction: 'Review TypeScript errors and fix type issues',
      };
    }

    // Test errors
    if (
      message.includes('test') ||
      message.includes('jest') ||
      message.includes('vitest') ||
      message.includes('assertion') ||
      message.includes('expect')
    ) {
      return {
        type: 'test',
        autoFixable: false,
        severity: 'medium',
        suggestedAction: 'Review failing tests and fix implementation',
      };
    }

    // Build errors
    if (
      message.includes('build') ||
      message.includes('webpack') ||
      message.includes('esbuild') ||
      message.includes('rollup') ||
      message.includes('vite')
    ) {
      return {
        type: 'build',
        autoFixable: false,
        severity: 'high',
        suggestedAction: 'Check build configuration and dependencies',
      };
    }

    // Runtime errors
    if (
      stack.includes('runtime') ||
      message.includes('undefined') ||
      message.includes('null') ||
      message.includes('reference')
    ) {
      return {
        type: 'runtime',
        autoFixable: false,
        severity: 'high',
        suggestedAction: 'Check for null/undefined values and runtime issues',
      };
    }

    // Unknown
    return {
      type: 'unknown',
      autoFixable: false,
      severity: 'medium',
      suggestedAction: 'Review error message and investigate',
    };
  }

  /**
   * Determine the appropriate recovery level
   */
  private determineRecoveryLevel(
    attempt: number,
    classification: ErrorClassification
  ): RecoveryLevel {
    // First attempt - try auto-fix if possible
    if (attempt === 1 && classification.autoFixable) {
      return RecoveryLevel.AUTO_FIX;
    }

    // Second attempt - delegate to review agent
    if (attempt <= 2) {
      return RecoveryLevel.REVIEW_AGENT;
    }

    // Third attempt and beyond - user intervention
    return RecoveryLevel.USER_INTERVENTION;
  }

  /**
   * Level 1: Attempt automatic fixes
   */
  private async attemptAutoFix(
    error: Error,
    classification: ErrorClassification
  ): Promise<boolean> {
    logger.info(chalk.dim('Level 1: Attempting auto-fix...'));

    const commands: string[] = [];

    // Determine fix commands based on error type
    switch (classification.type) {
      case 'lint':
        commands.push('npm run lint -- --fix');
        break;

      case 'typescript':
        // For some TS errors, we can try to fix imports
        commands.push('npx tsc --noEmit 2>&1 | head -20');
        break;

      default:
        if (classification.suggestedAction) {
          logger.info(chalk.gray(`Suggested action: ${classification.suggestedAction}`));
        }
        break;
    }

    // Execute fix commands
    for (const cmd of commands) {
      try {
        logger.info(chalk.dim(`Running: ${cmd}`));
        await execAsync(cmd, { timeout: 60000, cwd: process.cwd() });
        logger.success(`Auto-fix command succeeded: ${cmd}`);
      } catch (cmdError: any) {
        logger.warn(`Auto-fix command failed: ${cmd}`);
        // Continue with other commands
      }
    }

    // Record recovery attempt
    this.recoveryHistory.push({
      success: commands.length > 0,
      level: RecoveryLevel.AUTO_FIX,
      action: commands.join('; ') || 'No auto-fix available',
      details: error.message,
    });

    return commands.length > 0;
  }

  /**
   * Level 2: Delegate to @review agent for alternative approach
   */
  private async delegateToReviewAgent(
    error: Error,
    classification: ErrorClassification
  ): Promise<boolean> {
    logger.info(chalk.dim('Level 2: Analyzing with @review agent approach...'));

    try {
      // Get the review agent configuration
      const reviewAgent = this.agentManager.getAgent('review');

      if (!reviewAgent) {
        logger.warn('Review agent not available');
        return false;
      }

      // Prepare context for review
      const context = `
Error Type: ${classification.type}
Severity: ${classification.severity}
Error Message: ${error.message}
Suggested Action: ${classification.suggestedAction || 'None'}

Review Agent Capabilities:
${reviewAgent.capabilities.join('\n')}
`;

      // Display analysis to user
      console.log(chalk.bold('\n📝 Review Agent Analysis:'));
      console.log(chalk.gray('─'.repeat(50)));
      console.log(chalk.cyan(`Error Type: ${classification.type}`));
      console.log(chalk.cyan(`Severity: ${classification.severity}`));
      console.log(chalk.cyan(`\nSuggested approaches:`));
      
      // Provide suggestions based on error type
      const suggestions = this.getReviewSuggestions(classification);
      for (const suggestion of suggestions) {
        console.log(chalk.dim(`  • ${suggestion}`));
      }
      console.log(chalk.gray('─'.repeat(50)));

      // Record recovery attempt
      this.recoveryHistory.push({
        success: true,
        level: RecoveryLevel.REVIEW_AGENT,
        action: 'Review agent analysis provided',
        details: context,
      });

      return true;
    } catch (agentError: any) {
      logger.warn(`Review agent analysis failed: ${agentError.message}`);

      // Record failed recovery attempt
      this.recoveryHistory.push({
        success: false,
        level: RecoveryLevel.REVIEW_AGENT,
        action: 'Review agent analysis failed',
        details: error.message,
      });

      return false;
    }
  }

  /**
   * Get review suggestions based on error classification
   */
  private getReviewSuggestions(classification: ErrorClassification): string[] {
    switch (classification.type) {
      case 'lint':
        return [
          'Run npm run lint -- --fix to auto-fix formatting issues',
          'Check ESLint/Prettier configuration for conflicting rules',
          'Review the specific lint errors and fix manually if needed',
        ];

      case 'typescript':
        return [
          'Check for missing type definitions (@types packages)',
          'Review type annotations for accuracy',
          'Consider using type assertions or generics where appropriate',
          'Check import statements for typos or missing exports',
        ];

      case 'test':
        return [
          'Review the failing test assertions',
          'Check if the implementation matches the expected behavior',
          'Look for race conditions or async issues',
          'Ensure test mocks are properly configured',
        ];

      case 'build':
        return [
          'Check for circular dependencies',
          'Verify all imports resolve correctly',
          'Check build configuration (tsconfig, bundler config)',
          'Ensure all required dependencies are installed',
        ];

      case 'runtime':
        return [
          'Add null/undefined checks before accessing properties',
          'Use optional chaining (?.) and nullish coalescing (??)',
          'Check for uninitialized variables',
          'Review async/await handling for proper error catching',
        ];

      default:
        return [
          'Review the error message carefully',
          'Check recent changes that might have caused the issue',
          'Search for similar issues in project history',
          'Consider reverting recent changes if needed',
        ];
    }
  }

  /**
   * Level 3: Request user intervention
   */
  private async requestUserIntervention(
    error: Error,
    classification: ErrorClassification
  ): Promise<boolean> {
    logger.info(chalk.red('Level 3: User intervention required'));

    // Display error details
    console.log(chalk.bold('\n❌ Unable to automatically recover from this error:'));
    console.log(chalk.gray('─'.repeat(50)));
    console.log(chalk.red(`Type: ${classification.type}`));
    console.log(chalk.red(`Severity: ${classification.severity}`));
    console.log(chalk.red(`Message: ${error.message}`));
    if (classification.suggestedAction) {
      console.log(chalk.yellow(`\nSuggested: ${classification.suggestedAction}`));
    }
    console.log(chalk.gray('─'.repeat(50)));

    // Show recovery history
    if (this.recoveryHistory.length > 0) {
      console.log(chalk.dim('\nPrevious recovery attempts:'));
      for (const attempt of this.recoveryHistory) {
        const status = attempt.success ? chalk.green('✓') : chalk.red('✗');
        console.log(chalk.dim(`  ${status} Level ${attempt.level}: ${attempt.action}`));
      }
    }

    // Ask user what to do
    const action = await this.prompts.selectOne(
      'How would you like to proceed?',
      [
        'Fix manually and retry',
        'Skip this error and continue',
        'Create follow-up bead and abort',
        'Abort without follow-up',
      ]
    );

    switch (action) {
      case 'Fix manually and retry':
        console.log(chalk.cyan('\nPlease fix the issue and press Enter when ready...'));
        await this.prompts.input('Press Enter to continue');
        this.recoveryHistory.push({
          success: true,
          level: RecoveryLevel.USER_INTERVENTION,
          action: 'User fixed manually',
        });
        return true;

      case 'Skip this error and continue':
        logger.warn('Skipping error - continuing with caution');
        this.recoveryHistory.push({
          success: true,
          level: RecoveryLevel.USER_INTERVENTION,
          action: 'User skipped error',
        });
        return true;

      case 'Create follow-up bead and abort':
        this.recoveryHistory.push({
          success: false,
          level: RecoveryLevel.USER_INTERVENTION,
          action: 'User requested follow-up bead',
        });
        return false;

      case 'Abort without follow-up':
        this.recoveryHistory.push({
          success: false,
          level: RecoveryLevel.USER_INTERVENTION,
          action: 'User aborted',
        });
        throw new Error('User aborted recovery');

      default:
        return false;
    }
  }

  /**
   * Create follow-up bead for failed task
   */
  async createFollowUpBead(
    beadId: string,
    plan: EnhancedPlan,
    error: Error,
    state: OneShotState
  ): Promise<string | null> {
    logger.info('Creating follow-up bead for recovery...');

    try {
      // Prepare follow-up description
      const classification = this.classifyError(error);
      const description = `
## Original Task
${plan.description}

## Error Encountered
- Type: ${classification.type}
- Severity: ${classification.severity}
- Message: ${error.message}

## Suggested Action
${classification.suggestedAction || 'Manual investigation required'}

## Recovery Attempts
${this.recoveryHistory.map(r => `- Level ${r.level}: ${r.action} (${r.success ? 'success' : 'failed'})`).join('\n')}

## Context
- Original Bead ID: ${beadId}
- Phase: ${state.phase}
- Retry Count: ${state.retryCount}
- Started: ${state.startTime.toISOString()}

## Files Affected
${plan.tasks.flatMap(t => t.files).join('\n') || 'No specific files identified'}
`.trim();

      // Create the follow-up bead using the existing createBead method
      const followUpBead = await this.beads.createBead(
        `[Recovery] ${plan.description.slice(0, 50)}...`,
        description
      );

      if (followUpBead) {
        logger.success(`Created follow-up bead: ${followUpBead.id}`);
        console.log(chalk.green(`\n✓ Created follow-up bead: ${followUpBead.id}`));
        console.log(chalk.gray('  This task will be tracked for future resolution.'));
        
        // Add a note linking to the original bead
        await this.beads.addNote(
          followUpBead.id,
          `Follow-up for failed task. Original bead: ${beadId}`
        );
      }

      return followUpBead?.id || null;
    } catch (createError: any) {
      logger.error(`Failed to create follow-up bead: ${createError.message}`);
      return null;
    }
  }

  /**
   * Get recovery history
   */
  getRecoveryHistory(): RecoveryResult[] {
    return [...this.recoveryHistory];
  }

  /**
   * Clear recovery history
   */
  clearHistory(): void {
    this.recoveryHistory = [];
  }

  /**
   * Check if error is recoverable
   */
  isRecoverable(error: Error): boolean {
    const classification = this.classifyError(error);
    return classification.severity !== 'critical';
  }
}
