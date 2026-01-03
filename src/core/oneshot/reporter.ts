import chalk from 'chalk';
import { logger } from '../../utils/logger.js';

/**
 * Progress reporting levels
 */
export enum ProgressLevel {
  MINIMAL,   // Only phase transitions
  MODERATE,  // Sub-task completion
  DETAILED,  // Each command/test
  QUIET,     // Errors only
}

/**
 * Progress reporter for one-shot mode
 *
 * Provides configurable output based on user preference
 */
export class ProgressReporter {
  private level: ProgressLevel;

  constructor(level: ProgressLevel = ProgressLevel.MINIMAL) {
    this.level = level;
  }

  /**
   * Set progress level
   */
  setLevel(level: ProgressLevel): void {
    this.level = level;
  }

  /**
   * Get current level
   */
  getLevel(): ProgressLevel {
    return this.level;
  }

  /**
   * Report phase transition
   * Always shown (even in quiet mode)
   */
  phaseTransition(phase: string): void {
    if (this.level !== ProgressLevel.QUIET) {
      console.log(chalk.bold(`\n📋 ${phase}`));
    }
  }

  /**
   * Report phase complete
   */
  phaseComplete(): void {
    if (this.level === ProgressLevel.DETAILED) {
      console.log(chalk.green('✓ Phase complete\n'));
    }
  }

  /**
   * Report task start
   */
  taskStart(taskId: string, description: string): void {
    if (this.level === ProgressLevel.DETAILED) {
      console.log(chalk.dim(`  → Task ${taskId}: ${description}`));
    } else if (this.level === ProgressLevel.MODERATE) {
      console.log(chalk.cyan(`  [Task ${taskId}] ${description}`));
    }
  }

  /**
   * Report task complete
   */
  taskComplete(taskId: string): void {
    if (this.level === ProgressLevel.DETAILED) {
      console.log(chalk.green(`  ✓ Task ${taskId} complete`));
    } else if (this.level === ProgressLevel.MODERATE) {
      console.log(chalk.green(`  ✓ Task ${taskId}`));
    }
  }

  /**
   * Report task failed
   */
  taskFailed(taskId: string, error: string): void {
    if (this.level !== ProgressLevel.QUIET) {
      console.log(chalk.red(`  ✗ Task ${taskId} failed: ${error}`));
    }
  }

  /**
   * Report command execution
   */
  command(command: string): void {
    if (this.level === ProgressLevel.DETAILED) {
      console.log(chalk.dim(`    $ ${command}`));
    }
  }

  /**
   * Report command result
   */
  commandResult(success: boolean, output?: string): void {
    if (this.level === ProgressLevel.DETAILED) {
      const icon = success ? chalk.green('✓') : chalk.red('✗');
      console.log(`    ${icon}`);
      if (output && this.level === ProgressLevel.DETAILED) {
        console.log(chalk.dim(output.substring(0, 200)));
      }
    }
  }

  /**
   * Report test gate execution
   */
  testGate(gateName: string, attempt: number, maxAttempts: number): void {
    if (this.level === ProgressLevel.DETAILED) {
      console.log(chalk.dim(`    ${gateName} (${attempt}/${maxAttempts})`));
    } else if (this.level === ProgressLevel.MODERATE) {
      console.log(chalk.dim(`  Testing ${gateName}... (${attempt}/${maxAttempts})`));
    }
  }

  /**
   * Report test gate result
   */
  testGateResult(gateName: string, passed: boolean): void {
    if (this.level === ProgressLevel.DETAILED) {
      const icon = passed ? chalk.green('✓') : chalk.red('✗');
      console.log(`    ${icon} ${gateName}`);
    } else if (this.level === ProgressLevel.MODERATE) {
      const icon = passed ? chalk.green('✓') : chalk.red('✗');
      console.log(`  ${icon} ${gateName}`);
    }
  }

  /**
   * Report agent delegation
   */
  agentDelegate(agent: string, task: string): void {
    if (this.level === ProgressLevel.DETAILED) {
      console.log(chalk.cyan(`    @${agent}: ${task}`));
    } else if (this.level === ProgressLevel.MODERATE) {
      console.log(chalk.cyan(`  @${agent}`));
    }
  }

  /**
   * Report skill usage
   */
  skillUsage(skill: string): void {
    if (this.level === ProgressLevel.DETAILED) {
      console.log(chalk.magenta(`    /${skill}`));
    }
  }

  /**
   * Report tool usage
   */
  toolUsage(tool: string): void {
    if (this.level === ProgressLevel.DETAILED) {
      console.log(chalk.yellow(`    tool:${tool}`));
    }
  }

  /**
   * General info message
   */
  info(message: string): void {
    if (this.level === ProgressLevel.DETAILED || this.level === ProgressLevel.MODERATE) {
      console.log(chalk.dim(`    ${message}`));
    } else {
      logger.info(message);
    }
  }

  /**
   * Warning message
   */
  warning(message: string): void {
    if (this.level !== ProgressLevel.QUIET) {
      console.log(chalk.yellow(`  ⚠ ${message}`));
    }
  }

  /**
   * Error message
   */
  error(message: string): void {
    if (this.level !== ProgressLevel.QUIET) {
      console.log(chalk.red(`  ✗ ${message}`));
    }
    logger.error(message);
  }

  /**
   * Success message
   */
  success(message: string): void {
    if (this.level !== ProgressLevel.QUIET) {
      console.log(chalk.green(`  ✓ ${message}`));
    }
    logger.success(message);
  }

  /**
   * Progress percentage
   */
  progress(current: number, total: number, label?: string): void {
    if (this.level === ProgressLevel.DETAILED) {
      const percentage = Math.round((current / total) * 100);
      const bar = '█'.repeat(Math.floor(percentage / 5)) + '░'.repeat(20 - Math.floor(percentage / 5));
      const message = label ? `${label}: ` : '';
      console.log(chalk.dim(`    [${bar}] ${percentage}% ${message}`));
    } else if (this.level === ProgressLevel.MODERATE) {
      const percentage = Math.round((current / total) * 100);
      const message = label ? `${label}: ` : '';
      console.log(chalk.dim(`  ${message}${current}/${total} (${percentage}%)`));
    }
  }

  /**
   * Section divider
   */
  divider(): void {
    if (this.level === ProgressLevel.DETAILED) {
      console.log(chalk.gray('    ' + '─'.repeat(40)));
    }
  }

  /**
   * Indented block for detailed output
   */
  indented(message: string, indent: number = 4): void {
    if (this.level === ProgressLevel.DETAILED) {
      const spaces = ' '.repeat(indent);
      console.log(spaces + message);
    }
  }
}
