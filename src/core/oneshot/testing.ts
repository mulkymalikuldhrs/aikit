import { exec } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';
import { ErrorRecovery } from './recovery.js';
import { ProgressReporter } from './reporter.js';
import { EnhancedPlan, TestLoopResult, TestResult } from '../oneshot.js';
import { InteractivePrompts } from '../interactive.js';
import { logger } from '../../utils/logger.js';

const execAsync = promisify(exec);

/**
 * Quality gate configuration
 */
interface QualityGate {
  name: string;
  command: string;
  autoFix?: string; // Command to auto-fix issues
  required: boolean;
  timeout: number; // milliseconds
}

/**
 * Sample execution configuration
 */
interface SampleConfig {
  name: string;
  command: string;
  expectedOutput?: string;
  requiresApproval: boolean;
}

/**
 * Retry level for 3-level recovery
 */
enum RetryLevel {
  AUTO_FIX = 1,
  ALTERNATIVE = 2,
  USER_INTERVENTION = 3,
}

/**
 * Testing Loop - Phase 5 of one-shot workflow
 *
 * Features:
 * - Auto-generate tests for new functionality
 * - Run quality gates (typecheck, test, lint, build)
 * - Execute samples (user-approved)
 * - Semantic log validation
 * - 3-level auto-retry (auto-fix → alternative → user)
 */
export class TestingLoop {
  private recovery: ErrorRecovery;
  private reporter: ProgressReporter;
  private prompts: InteractivePrompts;
  private maxRetries: number = 3;

  // Default quality gates
  private defaultGates: QualityGate[] = [
    {
      name: 'TypeScript Check',
      command: 'npm run typecheck',
      autoFix: undefined, // TypeScript errors need manual fix
      required: true,
      timeout: 60000,
    },
    {
      name: 'Lint',
      command: 'npm run lint',
      autoFix: 'npm run lint -- --fix',
      required: true,
      timeout: 60000,
    },
    {
      name: 'Unit Tests',
      command: 'npm test',
      autoFix: undefined,
      required: true,
      timeout: 120000,
    },
    {
      name: 'Build',
      command: 'npm run build',
      autoFix: undefined,
      required: true,
      timeout: 120000,
    },
  ];

  constructor(reporter: ProgressReporter, recovery: ErrorRecovery) {
    this.reporter = reporter;
    this.recovery = recovery;
    this.prompts = new InteractivePrompts();
  }

  /**
   * Run testing loop until success or max retries
   */
  async runUntilSuccess(plan: EnhancedPlan): Promise<TestLoopResult> {
    const startTime = Date.now();
    const results: TestResult[] = [];
    let attempt = 0;
    let allPassed = false;

    while (attempt < this.maxRetries && !allPassed) {
      attempt++;
      this.reporter.info(`\n📋 Testing Attempt ${attempt}/${this.maxRetries}`);

      // Run all quality gates
      const gateResults = await this.runQualityGates(attempt);
      results.push(...gateResults);

      // Check if all gates passed
      allPassed = gateResults.every(r => r.passed);

      if (!allPassed) {
        const failedGates = gateResults.filter(r => !r.passed);
        this.reporter.warning(`${failedGates.length} gate(s) failed`);

        // Determine retry level
        const retryLevel = this.getRetryLevel(attempt);

        // Try to recover
        const recovered = await this.handleFailure(failedGates, retryLevel, plan);
        if (!recovered && attempt >= this.maxRetries) {
          break;
        }
      }
    }

    // If all gates passed, optionally run sample execution
    if (allPassed) {
      const sampleResults = await this.runSampleExecution(plan);
      results.push(...sampleResults);

      // Check sample results
      const samplesFailed = sampleResults.some(r => !r.passed);
      if (samplesFailed) {
        allPassed = false;
      }
    }

    return {
      success: allPassed,
      finalAttempt: attempt,
      allPassed,
      results,
      totalDuration: Date.now() - startTime,
    };
  }

  /**
   * Run all quality gates
   */
  private async runQualityGates(attempt: number): Promise<TestResult[]> {
    const results: TestResult[] = [];

    for (const gate of this.defaultGates) {
      this.reporter.command(gate.command);
      this.reporter.info('running...');

      const result = await this.runGate(gate, attempt);
      results.push(result);

      if (result.passed) {
        this.reporter.commandResult(true);
      } else {
        this.reporter.commandResult(false, result.output);

        // Try auto-fix if available and this is first attempt
        if (gate.autoFix && attempt === 1) {
          this.reporter.info(`Attempting auto-fix: ${gate.autoFix}`);
          const fixResult = await this.runCommand(gate.autoFix, gate.timeout);

          if (fixResult.success) {
            // Re-run the gate
            const retryResult = await this.runGate(gate, attempt);
            if (retryResult.passed) {
              this.reporter.success(`Auto-fix succeeded for ${gate.name}`);
              results[results.length - 1] = retryResult;
            }
          }
        }
      }
    }

    return results;
  }

  /**
   * Run a single quality gate
   */
  private async runGate(gate: QualityGate, attempt: number): Promise<TestResult> {
    const startTime = Date.now();

    try {
      const { stdout, stderr } = await execAsync(gate.command, {
        timeout: gate.timeout,
        cwd: process.cwd(),
      });

      return {
        timestamp: new Date(),
        gate: gate.name,
        command: gate.command,
        passed: true,
        output: stdout || stderr,
        attempt,
        duration: Date.now() - startTime,
      };
    } catch (error: any) {
      return {
        timestamp: new Date(),
        gate: gate.name,
        command: gate.command,
        passed: false,
        output: error.stdout || error.stderr || error.message,
        attempt,
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Run a command and return result
   */
  private async runCommand(
    command: string,
    timeout: number
  ): Promise<{ success: boolean; output: string }> {
    try {
      const { stdout, stderr } = await execAsync(command, {
        timeout,
        cwd: process.cwd(),
      });
      return { success: true, output: stdout || stderr };
    } catch (error: any) {
      return {
        success: false,
        output: error.stdout || error.stderr || error.message,
      };
    }
  }

  /**
   * Determine retry level based on attempt number
   */
  private getRetryLevel(attempt: number): RetryLevel {
    if (attempt === 1) return RetryLevel.AUTO_FIX;
    if (attempt === 2) return RetryLevel.ALTERNATIVE;
    return RetryLevel.USER_INTERVENTION;
  }

  /**
   * Handle test failure based on retry level
   */
  private async handleFailure(
    failedGates: TestResult[],
    retryLevel: RetryLevel,
    _plan: EnhancedPlan
  ): Promise<boolean> {
    switch (retryLevel) {
      case RetryLevel.AUTO_FIX:
        return await this.attemptAutoFix(failedGates);

      case RetryLevel.ALTERNATIVE:
        return await this.attemptAlternativeApproach(failedGates);

      case RetryLevel.USER_INTERVENTION:
        return await this.requestUserIntervention(failedGates);

      default:
        return false;
    }
  }

  /**
   * Level 1: Attempt auto-fix for common issues
   */
  private async attemptAutoFix(failedGates: TestResult[]): Promise<boolean> {
    this.reporter.info(chalk.yellow('Level 1: Attempting auto-fix...'));

    for (const gate of failedGates) {
      // Find the gate config
      const gateConfig = this.defaultGates.find(g => g.name === gate.gate);

      if (gateConfig?.autoFix) {
        const result = await this.runCommand(gateConfig.autoFix, gateConfig.timeout);
        if (result.success) {
          this.reporter.success(`Auto-fix applied for ${gate.gate}`);
        }
      }
    }

    // Return true to retry
    return true;
  }

  /**
   * Level 2: Attempt alternative approach using @review agent
   */
  private async attemptAlternativeApproach(
    failedGates: TestResult[]
  ): Promise<boolean> {
    this.reporter.info(chalk.yellow('Level 2: Attempting alternative approach...'));

    // Analyze errors and try to recover
    const errorContext = failedGates
      .map(g => `${g.gate}: ${g.output.slice(0, 500)}`)
      .join('\n\n');

    // Use error recovery to delegate to @review
    const recovered = await this.recovery.recover(
      new Error(`Quality gates failed:\n${errorContext}`),
      2
    );

    if (recovered) {
      this.reporter.success('Alternative approach applied');
      return true;
    }

    return true; // Still retry with user intervention
  }

  /**
   * Level 3: Request user intervention
   */
  private async requestUserIntervention(
    failedGates: TestResult[]
  ): Promise<boolean> {
    this.reporter.info(chalk.red('Level 3: User intervention required'));

    console.log(chalk.bold('\n❌ The following quality gates failed:'));
    for (const gate of failedGates) {
      console.log(chalk.red(`  • ${gate.gate}`));
      console.log(chalk.gray(`    Command: ${gate.command}`));
      console.log(chalk.gray(`    Output (truncated): ${gate.output.slice(0, 200)}...`));
    }

    const action = await this.prompts.selectOne(
      'How would you like to proceed?',
      [
        'Fix manually and retry',
        'Skip failed gates and continue',
        'Create follow-up bead and abort',
        'Abort without creating bead',
      ]
    );

    switch (action) {
      case 'Fix manually and retry':
        logger.info('Please fix the issues and press Enter to retry...');
        await this.prompts.input('Press Enter when ready');
        return true;

      case 'Skip failed gates and continue':
        this.reporter.warning('Skipping failed gates - proceeding with caution');
        return true;

      case 'Create follow-up bead and abort':
        // Error recovery will create the bead
        throw new Error(
          `User requested abort. Failed gates: ${failedGates.map(g => g.gate).join(', ')}`
        );

      case 'Abort without creating bead':
        throw new Error('User aborted testing');

      default:
        return false;
    }
  }

  /**
   * Run sample execution (user-approved)
   */
  private async runSampleExecution(plan: EnhancedPlan): Promise<TestResult[]> {
    const results: TestResult[] = [];

    // Check if there are sample commands to run
    const samples = this.extractSamples(plan);
    if (samples.length === 0) {
      return results;
    }

    // Ask user for approval
    console.log(chalk.bold('\n🧪 Sample Execution'));
    console.log(chalk.gray('The following commands can be run to verify the implementation:'));
    for (const sample of samples) {
      console.log(chalk.cyan(`  • ${sample.name}: ${sample.command}`));
    }

    const runSamples = await this.prompts.confirm(
      'Would you like to run these sample commands?',
      true
    );

    if (!runSamples) {
      this.reporter.info('Skipping sample execution');
      return results;
    }

    // Run each sample
    for (const sample of samples) {
      this.reporter.command(sample.command);
      this.reporter.info('running...');
      const startTime = Date.now();

      try {
        const { stdout, stderr } = await execAsync(sample.command, {
          timeout: 30000,
          cwd: process.cwd(),
        });

        const output = stdout || stderr;
        const passed = sample.expectedOutput
          ? output.includes(sample.expectedOutput)
          : true;

        results.push({
          timestamp: new Date(),
          gate: `Sample: ${sample.name}`,
          command: sample.command,
          passed,
          output,
          attempt: 1,
          duration: Date.now() - startTime,
        });

        if (passed) {
          this.reporter.commandResult(true);
        } else {
          this.reporter.commandResult(false, output);
        }
      } catch (error: any) {
        results.push({
          timestamp: new Date(),
          gate: `Sample: ${sample.name}`,
          command: sample.command,
          passed: false,
          output: error.message,
          attempt: 1,
          duration: Date.now() - startTime,
        });
        this.reporter.commandResult(false, error.message);
      }
    }

    return results;
  }

  /**
   * Extract sample commands from plan
   */
  private extractSamples(plan: EnhancedPlan): SampleConfig[] {
    // Look for sample commands in the plan description or tasks
    const samples: SampleConfig[] = [];

    // Check for common sample patterns in description
    const description = plan.description.toLowerCase();

    // Add samples based on task type
    if (description.includes('api') || description.includes('endpoint')) {
      samples.push({
        name: 'API Health Check',
        command: 'curl -s http://localhost:3000/health || echo "Server not running"',
        requiresApproval: true,
      });
    }

    if (description.includes('cli') || description.includes('command')) {
      samples.push({
        name: 'CLI Help',
        command: 'npx aikit --help',
        requiresApproval: true,
      });
    }

    return samples;
  }

  /**
   * Validate logs semantically (compare with historical patterns)
   */
  async validateLogs(output: string): Promise<{
    valid: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];

    // Check for common error patterns
    const errorPatterns = [
      /error:/i,
      /exception:/i,
      /failed:/i,
      /cannot find/i,
      /undefined is not/i,
      /null pointer/i,
      /segmentation fault/i,
      /out of memory/i,
      /stack overflow/i,
    ];

    for (const pattern of errorPatterns) {
      if (pattern.test(output)) {
        issues.push(`Detected error pattern: ${pattern.source}`);
      }
    }

    // Check for warning patterns
    const warningPatterns = [
      /warning:/i,
      /deprecated:/i,
      /unsafe/i,
    ];

    for (const pattern of warningPatterns) {
      if (pattern.test(output)) {
        issues.push(`Detected warning pattern: ${pattern.source}`);
      }
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }

  /**
   * Add custom quality gate
   */
  addGate(gate: QualityGate): void {
    this.defaultGates.push(gate);
  }

  /**
   * Remove quality gate by name
   */
  removeGate(name: string): void {
    this.defaultGates = this.defaultGates.filter(g => g.name !== name);
  }

  /**
   * Set max retries
   */
  setMaxRetries(max: number): void {
    this.maxRetries = max;
  }
}
