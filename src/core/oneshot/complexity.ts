import { BeadsIntegration } from '../beads.js';
import { EnhancedPlan, OneShotState } from '../oneshot.js';

/**
 * Complexity analyzer - Phase 3 of one-shot workflow
 *
 * Determines if a task is too complex and needs to be split
 */
export class ComplexityAnalyzer {
  private beads: BeadsIntegration;

  // Complexity thresholds
  private readonly MAX_DURATION = 30; // minutes
  private readonly MAX_FILES = 10;
  private readonly MAX_LINES = 500;
  private readonly MAX_SUBSYSTEMS = 2;

  constructor(beads: BeadsIntegration) {
    this.beads = beads;
  }

  /**
   * Check if task should be split
   */
  async shouldSplit(plan: EnhancedPlan): Promise<boolean> {
    // Analyze complexity based on plan
    const estimatedDuration = plan.estimatedDuration;

    // Check each criterion
    const timeTooLong = estimatedDuration > this.MAX_DURATION;
    const sizeTooLarge = this.analyzeSize(plan).tooLarge;
    const complexityTooHigh = this.analyzeComplexity(plan).tooComplex;

    return timeTooLong || sizeTooLarge || complexityTooHigh;
  }

  /**
   * Analyze task size (files and line changes)
   */
  private analyzeSize(plan: EnhancedPlan): {
    fileCount: number;
    lineChanges: number;
    tooLarge: boolean;
  } {
    // Estimate based on plan complexity
    const estimatedFiles = Math.max(1, Math.floor(plan.complexity / 2));
    const estimatedLines = Math.max(100, plan.complexity * 50);

    const tooLarge =
      estimatedFiles > this.MAX_FILES || estimatedLines > this.MAX_LINES;

    return {
      fileCount: estimatedFiles,
      lineChanges: estimatedLines,
      tooLarge,
    };
  }

  /**
   * Analyze task complexity (number of sub-systems affected)
   */
  private analyzeComplexity(plan: EnhancedPlan): {
    subsystems: number;
    complexityScore: number;
    tooComplex: boolean;
  } {
    // Estimate based on plan complexity
    const subsystems = Math.min(3, Math.ceil(plan.complexity / 3));
    const tooComplex = plan.complexity > 8 || subsystems > this.MAX_SUBSYSTEMS;

    return {
      subsystems,
      complexityScore: plan.complexity,
      tooComplex,
    };
  }

  /**
   * Create follow-up beads if splitting
   */
  async createFollowUpBeads(
    plan: EnhancedPlan,
    _state?: OneShotState
  ): Promise<void> {
    // Calculate number of subtasks
    const totalSubtasks = Math.ceil(plan.estimatedDuration / 15); // ~15 min per subtask
    const subtaskBeadIds: string[] = [];

    for (let i = 1; i <= totalSubtasks; i++) {
      const subtaskBeadId = `${plan.beadId}-${i}`;
      subtaskBeadIds.push(subtaskBeadId);

      const subtaskDescription = `${plan.description} (Part ${i}/${totalSubtasks})`;

      // Create the subtask bead
      await this.beads.createBead(
        subtaskDescription,
        `Created by one-shot auto-split\n\nEstimated: 15 minutes\n\nOriginal task:\n${plan.description}`
      );

      await this.beads.addNote(
        subtaskBeadId,
        `Part ${i} of ${totalSubtasks} for original task: ${plan.beadId}`
      );
    }

    // Update original bead to reference follow-ups
    await this.beads.addNote(
      plan.beadId,
      `Auto-split into ${totalSubtasks} sub-tasks\n\nSub-task bead IDs: ${subtaskBeadIds.join(', ')}`
    );
  }
}
