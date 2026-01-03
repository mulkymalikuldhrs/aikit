import { exec } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';
import { BeadsIntegration } from '../beads.js';
import { InteractivePrompts } from '../interactive.js';
import {
  EnhancedPlan,
  TestLoopResult,
  VerificationResult,
  CompletionProof,
} from '../oneshot.js';
import { DeploymentHandler } from './deployment.js';
import { logger } from '../../utils/logger.js';

const execAsync = promisify(exec);

/**
 * Verification level
 */
export enum VerificationLevel {
  GATES_ONLY = 1,      // Only check quality gates
  MANUAL_REVIEW = 2,   // Gates + manual verification
  FULL_APPROVAL = 3,   // Gates + manual + deployment approval
}

/**
 * Completion verifier - Phase 6 of one-shot workflow
 *
 * Multi-level verification: gates + manual + deployment
 */
export class CompletionVerifier {
  private beads: BeadsIntegration;
  private prompts: InteractivePrompts;
  private deployment: DeploymentHandler;

  constructor(beads: BeadsIntegration, prompts: InteractivePrompts) {
    this.beads = beads;
    this.prompts = prompts;
    this.deployment = new DeploymentHandler(prompts, beads);
  }

  /**
   * Verify task completion with multi-level verification
   */
  async verify(
    plan: EnhancedPlan,
    testResults: TestLoopResult
  ): Promise<VerificationResult> {
    console.log(chalk.bold('\n🔍 Verification Phase'));
    console.log(chalk.gray('─'.repeat(50)));

    // Step 1: Verify all quality gates passed
    const gatesOk = this.verifyGates(testResults);
    if (!gatesOk.success) {
      return {
        success: false,
        reason: gatesOk.reason,
        manualVerified: false,
      };
    }
    console.log(chalk.green('  ✓ All quality gates passed'));

    // Step 2: Get list of changed files
    const changedFiles = await this.getChangedFiles();
    console.log(chalk.dim(`  📁 ${changedFiles.length} files changed`));

    // Step 3: Display summary for manual verification
    await this.displayVerificationSummary(plan, testResults, changedFiles);

    // Step 4: Ask for manual verification
    const manualVerified = await this.requestManualVerification();
    if (!manualVerified) {
      const action = await this.handleVerificationFailure();
      if (action === 'abort') {
        return {
          success: false,
          reason: 'User declined manual verification',
          manualVerified: false,
        };
      }
      // User chose to continue anyway
    }

    // Step 5: Check if deployment is needed
    const needsDeployment = await this.checkDeploymentNeeded(plan);
    let deploymentApproved = false;

    if (needsDeployment) {
      const deployResult = await this.deployment.handleDeployment(
        plan.beadId,
        'staging'
      );
      deploymentApproved = deployResult.deployed;
    }

    // Step 6: Generate completion proof
    const proof = await this.generateProof(
      plan,
      testResults,
      changedFiles,
      manualVerified,
      deploymentApproved
    );

    // Step 7: Update bead status
    await this.updateBeadStatus(plan.beadId, manualVerified);

    return {
      success: true,
      proof,
      manualVerified,
      deploymentApproved: needsDeployment ? deploymentApproved : undefined,
    };
  }

  /**
   * Verify all quality gates passed
   */
  private verifyGates(testResults: TestLoopResult): {
    success: boolean;
    reason?: string;
  } {
    if (!testResults.allPassed) {
      const failedGates = testResults.results
        .filter(r => !r.passed)
        .map(r => r.gate)
        .join(', ');
      return {
        success: false,
        reason: `Quality gates failed: ${failedGates}`,
      };
    }
    return { success: true };
  }

  /**
   * Get list of changed files
   */
  private async getChangedFiles(): Promise<string[]> {
    try {
      const { stdout } = await execAsync('git diff --name-only HEAD~1', {
        cwd: process.cwd(),
      });
      return stdout.trim().split('\n').filter(Boolean);
    } catch {
      // Try to get staged files if no commits
      try {
        const { stdout } = await execAsync('git diff --name-only --cached', {
          cwd: process.cwd(),
        });
        return stdout.trim().split('\n').filter(Boolean);
      } catch {
        return [];
      }
    }
  }

  /**
   * Display verification summary
   */
  private async displayVerificationSummary(
    plan: EnhancedPlan,
    testResults: TestLoopResult,
    changedFiles: string[]
  ): Promise<void> {
    console.log(chalk.bold('\n📊 Verification Summary'));
    console.log(chalk.gray('─'.repeat(50)));

    // Task info
    console.log(chalk.bold('Task:'), plan.description);
    console.log(chalk.bold('Bead ID:'), plan.beadId);

    // Test results
    console.log(chalk.bold('\nTest Results:'));
    console.log(`  Attempts: ${testResults.finalAttempt}`);
    console.log(`  All passed: ${testResults.allPassed ? chalk.green('✓') : chalk.red('✗')}`);
    console.log(`  Duration: ${this.formatDuration(testResults.totalDuration)}`);

    // Changed files
    console.log(chalk.bold('\nChanged Files:'));
    if (changedFiles.length > 0) {
      const displayLimit = 10;
      for (let i = 0; i < Math.min(changedFiles.length, displayLimit); i++) {
        console.log(chalk.dim(`  • ${changedFiles[i]}`));
      }
      if (changedFiles.length > displayLimit) {
        console.log(chalk.dim(`  ... and ${changedFiles.length - displayLimit} more`));
      }
    } else {
      console.log(chalk.dim('  No files changed'));
    }

    console.log(chalk.gray('─'.repeat(50)));
  }

  /**
   * Request manual verification from user
   */
  private async requestManualVerification(): Promise<boolean> {
    console.log(chalk.yellow('\n⚠️  Manual Verification Required'));
    console.log(chalk.dim('Please review the changes and confirm they are correct.\n'));

    const verified = await this.prompts.confirm(
      'Have you reviewed and verified the changes are correct?',
      true
    );

    return verified;
  }

  /**
   * Handle verification failure
   */
  private async handleVerificationFailure(): Promise<'abort' | 'continue'> {
    const action = await this.prompts.selectOne(
      'What would you like to do?',
      [
        'Abort and make changes',
        'Continue anyway (not recommended)',
      ]
    );

    return action.startsWith('Abort') ? 'abort' : 'continue';
  }

  /**
   * Check if deployment is needed
   */
  private async checkDeploymentNeeded(plan: EnhancedPlan): Promise<boolean> {
    const description = plan.description.toLowerCase();
    
    // Check if task mentions deployment
    const deploymentKeywords = ['deploy', 'release', 'publish', 'production', 'staging'];
    const mentionsDeployment = deploymentKeywords.some(kw => description.includes(kw));

    if (!mentionsDeployment) {
      return false;
    }

    // Ask user if they want to deploy
    return await this.prompts.confirm(
      'This task may require deployment. Would you like to proceed with deployment?',
      false
    );
  }

  /**
   * Generate completion proof
   */
  private async generateProof(
    plan: EnhancedPlan,
    testResults: TestLoopResult,
    changedFiles: string[],
    manualVerified: boolean,
    deploymentApproved: boolean
  ): Promise<CompletionProof> {
    // Get build output summary
    let buildOutput = '';
    try {
      const { stdout } = await execAsync('npm run build 2>&1 | tail -5', {
        cwd: process.cwd(),
        timeout: 30000,
      });
      buildOutput = stdout;
    } catch (error: any) {
      buildOutput = error.stdout || 'Build output not available';
    }

    return {
      timestamp: new Date(),
      taskId: plan.beadId,
      taskDescription: plan.description,
      filesChanged: changedFiles,
      testResults: testResults.results,
      buildOutput,
      deploymentStatus: deploymentApproved
        ? {
            deployed: true,
            environment: 'staging',
            timestamp: new Date(),
          }
        : undefined,
      manualVerification: manualVerified,
    };
  }

  /**
   * Update bead status to completed
   */
  private async updateBeadStatus(
    beadId: string,
    verified: boolean
  ): Promise<void> {
    try {
      if (verified) {
        await this.beads.updateBeadStatus(beadId, 'completed');
        await this.beads.addNote(beadId, 'Task completed and verified via One-Shot Mode');
        logger.success('Bead marked as completed');
      } else {
        await this.beads.addNote(beadId, 'Task completed but not manually verified');
      }
    } catch (error: any) {
      logger.warn(`Failed to update bead status: ${error.message}`);
    }
  }

  /**
   * Format duration in human-readable format
   */
  private formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);

    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  }
}
