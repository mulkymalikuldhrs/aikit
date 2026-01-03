import { Config } from './config.js';
import { AgentManager } from './agents.js';
import { SkillEngine } from './skills.js';
// import { ToolRegistry } from './tools.js';
import { BeadsIntegration } from './beads.js';
import { InteractivePrompts } from './interactive.js';
import { ProgressReporter, ProgressLevel } from './oneshot/reporter.js';
import { RequirementsGatherer } from './oneshot/requirements.js';
import { OneShotPlanner } from './oneshot/planning.js';
import { ComplexityAnalyzer } from './oneshot/complexity.js';
import { OneShotExecutor } from './oneshot/execution.js';
import { TestingLoop } from './oneshot/testing.js';
import { ErrorRecovery } from './oneshot/recovery.js';
import { CompletionVerifier } from './oneshot/verification.js';
import { FeedbackCollector } from './oneshot/feedback.js';
import { logger } from '../utils/logger.js';
import chalk from 'chalk';

/**
 * One-shot execution phases
 */
export enum OneShotPhase {
  REQUIREMENTS = 'requirements',
  PLANNING = 'planning',
  EXECUTION = 'execution',
  TESTING = 'testing',
  VERIFICATION = 'verification',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

/**
 * Task types for classification
 */
export enum TaskType {
  FEATURE = 'feature',
  BUG_FIX = 'bug-fix',
  REFACTORING = 'refactoring',
  PERFORMANCE = 'performance',
  TESTING = 'testing',
  DOCUMENTATION = 'documentation',
  RESEARCH = 'research',
}

/**
 * One-shot execution state
 */
export interface OneShotState {
  phase: OneShotPhase;
  userRequest: string;
  taskType?: TaskType;
  progressLevel: ProgressLevel;
  requirements?: GatheredRequirements;
  plan?: EnhancedPlan;
  executionLog: ExecutionStep[];
  testResults: TestResult[];
  beadId: string | null;
  retryCount: number;
  lastError: Error | null;
  startTime: Date;
}

/**
 * Gathered requirements from user
 */
export interface GatheredRequirements {
  originalRequest: string;
  taskType: TaskType;
  scope: string;
  dependencies: string[];
  successCriteria: string[];
  constraints: string[];
}

/**
 * Enhanced plan with recommendations
 */
export interface EnhancedPlan {
  description: string;
  tasks: PlanTask[];
  recommendedSkills: string[];
  requiredTools: string[];
  beadId: string;
  estimatedDuration: number; // minutes
  complexity: number; // 1-10 scale
}

/**
 * Individual plan task
 */
export interface PlanTask {
  id: string;
  description: string;
  files: string[];
  dependencies: string[];
  estimatedMinutes: number;
  requiresImplementation: boolean;
  requiresResearch: boolean;
  requiresReview: boolean;
  requiresCodeExploration: boolean;
}

/**
 * Execution step log
 */
export interface ExecutionStep {
  timestamp: Date;
  phase: OneShotPhase;
  action: string;
  agent?: string;
  skill?: string;
  tool?: string;
  result: 'success' | 'failed' | 'in-progress';
  details?: string;
  duration: number; // milliseconds
}

/**
 * Test result from quality gates
 */
export interface TestResult {
  timestamp: Date;
  gate: string;
  command: string;
  passed: boolean;
  output: string;
  attempt: number;
  duration: number;
}

/**
 * Final one-shot result
 */
export interface OneShotResult {
  success: boolean;
  state: OneShotState;
  plan?: EnhancedPlan;
  execution?: ExecutionResult;
  testResults?: TestLoopResult;
  verification?: VerificationResult;
  error?: Error;
  totalDuration: number;
}

/**
 * Execution result
 */
export interface ExecutionResult {
  success: boolean;
  log: ExecutionStep[];
  totalDuration: number;
  tasksCompleted: number;
  tasksFailed: number;
}

/**
 * Test loop result
 */
export interface TestLoopResult {
  success: boolean;
  finalAttempt: number;
  allPassed: boolean;
  results: TestResult[];
  totalDuration: number;
}

/**
 * Verification result
 */
export interface VerificationResult {
  success: boolean;
  reason?: string;
  proof?: CompletionProof;
  manualVerified: boolean;
  deploymentApproved?: boolean;
  rollbackConfirmed?: boolean;
}

/**
 * Completion proof
 */
export interface CompletionProof {
  timestamp: Date;
  taskId: string;
  taskDescription: string;
  filesChanged: string[];
  testResults: TestResult[];
  buildOutput: string;
  deploymentStatus?: DeploymentStatus;
  manualVerification: boolean;
}

/**
 * Deployment status
 */
export interface DeploymentStatus {
  deployed: boolean;
  environment: string;
  url?: string;
  timestamp: Date;
  rollbackPlan?: string;
}

/**
 * One-Shot Mode - End-to-end autonomous task execution
 *
 * Workflow:
 * 1. Requirements: Interactive gathering with select menus
 * 2. Planning: Delegate to @planner agent
 * 3. Auto-Split: Check complexity and split if needed
 * 4. Execution: Parallel task execution with dynamic agent selection
 * 5. Testing: Continuous loop until all gates pass
 * 6. Verification: Multi-level verification (gates + manual + deployment)
 * 7. Completion: Generate proof, update bead, collect feedback
 */
export class OneShotMode {
  private agentManager: AgentManager;
  private skillEngine: SkillEngine;
  // TODO: Use toolRegistry in full implementation
  private beads: BeadsIntegration;
  private prompts: InteractivePrompts;
  private reporter: ProgressReporter;

  private requirements: RequirementsGatherer;
  private planner: OneShotPlanner;
  private complexity: ComplexityAnalyzer;
  private executor: OneShotExecutor;
  private testing: TestingLoop;
  private recovery: ErrorRecovery;
  private verifier: CompletionVerifier;
  private feedback: FeedbackCollector;

  constructor(config: Config) {
    this.agentManager = new AgentManager(config);
    this.skillEngine = new SkillEngine(config);
    this.beads = new BeadsIntegration();
    this.prompts = new InteractivePrompts();
    this.reporter = new ProgressReporter();

    // Initialize sub-modules
    this.requirements = new RequirementsGatherer(this.prompts);
    this.planner = new OneShotPlanner(
      this.agentManager,
      this.skillEngine
    );
    this.complexity = new ComplexityAnalyzer(this.beads);
    this.executor = new OneShotExecutor(this.reporter);
    this.recovery = new ErrorRecovery(this.agentManager, this.beads);
    this.testing = new TestingLoop(this.reporter, this.recovery);
    this.verifier = new CompletionVerifier(
      this.beads,
      this.prompts
    );
    this.feedback = new FeedbackCollector();
  }

  /**
   * Run one-shot mode end-to-end
   */
  async run(request: string): Promise<OneShotResult> {
    const startTime = Date.now();

    // Show beta warning
    this.showBetaWarning();

    // Select progress level
    const progressLevel = await this.selectProgressLevel();

    // Initialize state
    const state: OneShotState = {
      phase: OneShotPhase.REQUIREMENTS,
      userRequest: request,
      progressLevel,
      executionLog: [],
      testResults: [],
      beadId: null,
      retryCount: 0,
      lastError: null,
      startTime: new Date(),
    };

    // Set reporter level
    this.reporter.setLevel(progressLevel);

    try {
      logger.info(chalk.bold('🚀 Starting One-Shot Mode'));

      // Phase 1: Requirements
      state.phase = OneShotPhase.REQUIREMENTS;
      this.reporter.phaseTransition('Gathering Requirements');
      const requirements = await this.requirements.gather(request);
      state.taskType = requirements.taskType;
      state.requirements = requirements;
      this.reporter.phaseComplete();

      // Phase 2: Planning
      state.phase = OneShotPhase.PLANNING;
      this.reporter.phaseTransition('Planning');
      const plan = await this.planner.plan(requirements);
      state.plan = plan;
      state.beadId = plan.beadId;
      this.reporter.phaseComplete();

      // Phase 3: Complexity Check & Auto-Split
      this.reporter.phaseTransition('Analyzing Complexity');
      const shouldSplit = await this.complexity.shouldSplit(plan);
      if (shouldSplit) {
        await this.complexity.createFollowUpBeads(plan, state);
        this.reporter.info('Task split into multiple beads');
      }
      this.reporter.phaseComplete();

      // Phase 4: Execution
      state.phase = OneShotPhase.EXECUTION;
      this.reporter.phaseTransition('Executing Tasks');
      const execution = await this.executor.execute(plan);
      state.executionLog = execution.log;

      if (!execution.success) {
        throw new Error('Execution failed');
      }
      this.reporter.phaseComplete();

      // Phase 5: Testing Loop
      state.phase = OneShotPhase.TESTING;
      this.reporter.phaseTransition('Running Tests');
      const testResults = await this.testing.runUntilSuccess(plan);
      state.testResults = testResults.results;

      if (!testResults.success) {
        throw new Error('Testing failed after all retries');
      }
      this.reporter.phaseComplete();

      // Phase 6: Verification
      state.phase = OneShotPhase.VERIFICATION;
      this.reporter.phaseTransition('Verifying Completion');
      const verification = await this.verifier.verify(plan, testResults);

      if (!verification.success) {
        throw new Error(verification.reason || 'Verification failed');
      }
      this.reporter.phaseComplete();

      // Phase 7: Complete
      state.phase = OneShotPhase.COMPLETED;
      logger.success('\n🎉 One-Shot Mode Complete!');
      await this.displayCompletionSummary(plan, execution, testResults, verification);

      // Collect beta feedback
      await this.feedback.collect();

      return {
        success: true,
        state,
        plan,
        execution,
        testResults,
        verification,
        totalDuration: Date.now() - startTime,
      };

    } catch (error) {
      state.phase = OneShotPhase.FAILED;
      state.lastError = error as Error;
      logger.error('One-Shot Mode failed:', error);

      // Create follow-up bead for recovery
      if (state.beadId && state.plan) {
        await this.recovery.createFollowUpBead(
          state.beadId,
          state.plan,
          error as Error,
          state
        );
      }

      return {
        success: false,
        state,
        error: error as Error,
        totalDuration: Date.now() - startTime,
      };
    }
  }

  /**
   * Show beta warning message
   */
  private showBetaWarning(): void {
    console.log(chalk.yellow.bold('\n⚠️  ONE-SHOT MODE (beta) - Experimental Feature\n'));
    console.log(chalk.yellow('This mode is experimental and may have unexpected behavior.\n'));
    console.log(chalk.bold('Best practices:'));
    console.log(chalk.cyan('  ✓ Use for straightforward tasks first'));
    console.log(chalk.cyan('  ✓ Consider /plan + /implement for complex features'));
    console.log(chalk.cyan('  ✓ Review changes before final approval\n'));
    console.log(chalk.gray('After completion, we\'ll ask for your feedback!\n'));
  }

  /**
   * Select progress level
   */
  private async selectProgressLevel(): Promise<ProgressLevel> {
    const choice = await this.prompts.selectOne(
      'How much progress detail do you want to see?',
      [
        'Minimal - Only phase transitions (Phase 1 → Phase 2)',
        'Moderate - Sub-task completion (Task 3/5 complete)',
        'Detailed - Each command/test (Running npm test... ✓)',
        'Quiet - Suppress all output, only show errors',
      ],
      'Minimal - Only phase transitions (Phase 1 → Phase 2)'
    );

    switch (choice) {
      case 'Minimal - Only phase transitions (Phase 1 → Phase 2)':
        return ProgressLevel.MINIMAL;
      case 'Moderate - Sub-task completion (Task 3/5 complete)':
        return ProgressLevel.MODERATE;
      case 'Detailed - Each command/test (Running npm test... ✓)':
        return ProgressLevel.DETAILED;
      case 'Quiet - Suppress all output, only show errors':
        return ProgressLevel.QUIET;
      default:
        return ProgressLevel.MINIMAL;
    }
  }

  /**
   * Display completion summary
   */
  private async displayCompletionSummary(
    plan: EnhancedPlan,
    execution: ExecutionResult,
    testResults: TestLoopResult,
    verification: VerificationResult
  ): Promise<void> {
    console.log(chalk.bold('\n📊 Completion Summary\n'));
    console.log(chalk.gray('─'.repeat(50)));
    console.log(`${chalk.bold('Task:')} ${plan.description}`);
    console.log(`${chalk.bold('Bead ID:')} ${plan.beadId}`);
    console.log(`${chalk.bold('Total Duration:')} ${this.formatDuration(execution.totalDuration)}`);
    console.log('');
    console.log(chalk.bold('Execution:'));
    console.log(`  Tasks completed: ${chalk.green(execution.tasksCompleted)}`);
    console.log(`  Tasks failed: ${chalk.red(execution.tasksFailed)}`);
    console.log('');
    console.log(chalk.bold('Testing:'));
    console.log(`  Attempts: ${testResults.finalAttempt}`);
    console.log(`  All passed: ${testResults.allPassed ? chalk.green('✓') : chalk.red('✗')}`);
    console.log('');
    console.log(chalk.bold('Verification:'));
    console.log(`  Manual verified: ${verification.manualVerified ? chalk.green('✓') : chalk.yellow('○')}`);
    console.log(`  Deployment: ${verification.deploymentApproved ? chalk.green('Approved') : chalk.gray('N/A')}`);
    console.log(chalk.gray('─'.repeat(50)));
    console.log('');
  }

  /**
   * Format duration in human-readable format
   */
  private formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }
}
