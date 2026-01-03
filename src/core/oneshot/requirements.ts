import { InteractivePrompts } from '../interactive.js';
import { GatheredRequirements, TaskType } from '../oneshot.js';

/**
 * Requirements gatherer - Phase 1 of one-shot workflow
 *
 * Gathers user requirements through interactive prompts
 */
export class RequirementsGatherer {
  private prompts: InteractivePrompts;

  constructor(prompts: InteractivePrompts) {
    this.prompts = prompts;
  }

  /**
   * Gather requirements for a task
   */
  async gather(request: string): Promise<GatheredRequirements> {
    // Step 1: Task type classification
    const taskType = await this.selectTaskType();

    // Step 2: Scope clarification
    const scope = await this.clarifyScope();

    // Step 3: Dependencies identification
    const dependencies = await this.identifyDependencies();

    // Step 4: Success criteria definition
    const successCriteria = await this.defineSuccessCriteria();

    // Step 5: Constraint identification
    const constraints = await this.identifyConstraints();

    return {
      originalRequest: request,
      taskType,
      scope,
      dependencies,
      successCriteria,
      constraints,
    };
  }

  /**
   * Select task type from 7 categories
   */
  private async selectTaskType(): Promise<TaskType> {
    const choice = await this.prompts.selectOne(
      'What type of task is this?',
      [
        'Feature Development - New functionality',
        'Bug Fix - Fixing an issue',
        'Refactoring - Improving code structure',
        'Performance - Optimization work',
        'Testing - Writing or fixing tests',
        'Documentation - Docs or guides',
        'Research - Learning or investigation',
      ],
      'Feature Development - New functionality'
    );

    switch (choice) {
      case 'Feature Development - New functionality':
        return TaskType.FEATURE;
      case 'Bug Fix - Fixing an issue':
        return TaskType.BUG_FIX;
      case 'Refactoring - Improving code structure':
        return TaskType.REFACTORING;
      case 'Performance - Optimization work':
        return TaskType.PERFORMANCE;
      case 'Testing - Writing or fixing tests':
        return TaskType.TESTING;
      case 'Documentation - Docs or guides':
        return TaskType.DOCUMENTATION;
      case 'Research - Learning or investigation':
        return TaskType.RESEARCH;
      default:
        return TaskType.FEATURE;
    }
  }

  /**
   * Clarify the scope of the task
   */
  private async clarifyScope(): Promise<string> {
    const scopeLevel = await this.prompts.selectOne(
      'What is the scope of this task?',
      [
        'Small - Single file or component',
        'Medium - Multiple files or feature',
        'Large - Complex feature or system',
        'Extra-large - Multiple features or subsystems',
      ],
      'Medium - Multiple files or feature'
    );

    const affectedFiles = await this.prompts.selectMultiple(
      'Which files or components are affected? (select with space)',
      [
        'Frontend components',
        'Backend/API',
        'Database/Models',
        'Tests',
        'Documentation',
        'Configuration',
        'Infrastructure/DevOps',
      ]
    );

    return `${scopeLevel}: ${affectedFiles.join(', ')}`;
  }

  /**
   * Identify dependencies on other tasks or systems
   */
  private async identifyDependencies(): Promise<string[]> {
    const dependencies = await this.prompts.selectMultiple(
      'Does this task depend on other work? (select with space)',
      [
        'Yes - other beads must complete first',
        'No - can proceed independently',
      ]
    );

    if (dependencies.length === 1 && dependencies[0] === 'Yes - other beads must complete first') {
      const dependentTasks = await this.prompts.input(
        'Which bead IDs must complete first? (comma-separated)',
        undefined,
        'bead-001, bead-002' // Default example
      );
      const dependentBeads = dependentTasks.split(',').map(b => b.trim());
      return dependentBeads;
    }

    return [];
  }

  /**
   * Define success criteria for the task
   */
  private async defineSuccessCriteria(): Promise<string[]> {
    const criteriaType = await this.prompts.selectOne(
      'How should we know when this task is complete?',
      [
        'Tests pass - All tests passing',
        'Manual verification - User confirms it works',
        'Build succeeds - Build completes without errors',
        'Code review passes - Review approved',
      ],
      'Tests pass - All tests passing'
    );

    const criteria: string[] = [criteriaType];

    // Ask for specific metrics
    const measurable = await this.prompts.confirm(
      'Should this task have measurable performance or quality metrics?',
      false
    );

    if (measurable) {
      const metrics = await this.prompts.input(
        'What metrics define success? (e.g., "response time < 200ms", "test coverage > 80%")',
        undefined,
        ''
      );
      criteria.push(`Metric: ${metrics}`);
    }

    return criteria;
  }

  /**
   * Identify constraints for the task
   */
  private async identifyConstraints(): Promise<string[]> {
    const constraints: string[] = [];

    const hasConstraints = await this.prompts.confirm(
      'Are there any constraints for this task?',
      false
    );

    if (hasConstraints) {
      const constraintTypes = await this.prompts.selectMultiple(
        'What type of constraints? (select with space)',
        [
          'Time constraints - Must complete by deadline',
          'Budget constraints - Limited resources',
          'Technical constraints - Must use specific tech',
          'Performance constraints - Must meet benchmarks',
          'Security constraints - Must pass security review',
        ]
      );

      for (const constraintType of constraintTypes) {
        const details = await this.prompts.input(
          `Describe ${constraintType}:`,
          undefined,
          ''
        );
        constraints.push(`${constraintType}: ${details}`);
      }
    }

    return constraints;
  }
}
