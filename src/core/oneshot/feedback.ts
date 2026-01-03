import chalk from 'chalk';
import { InteractivePrompts } from '../interactive.js';
import { logger } from '../../utils/logger.js';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { paths } from '../../utils/paths.js';

/**
 * Get AIKit directory for current project
 */
function getAikitDir(): string {
  return paths.projectConfig();
}

/**
 * Feedback data structure
 */
interface FeedbackData {
  timestamp: Date;
  satisfaction: number; // 1-5
  issues: string[];
  suggestions: string;
  wouldRecommend: boolean;
  taskType?: string;
  duration?: number;
}

/**
 * Feedback summary
 */
interface FeedbackSummary {
  totalFeedback: number;
  averageSatisfaction: number;
  commonIssues: string[];
  recentSuggestions: string[];
}

/**
 * Beta feedback collector
 *
 * Collects user feedback for one-shot mode improvements
 */
export class FeedbackCollector {
  private prompts: InteractivePrompts;
  private feedbackHistory: FeedbackData[] = [];

  constructor() {
    this.prompts = new InteractivePrompts();
  }

  /**
   * Collect feedback from user after completion
   */
  async collect(): Promise<FeedbackData | null> {
    console.log(chalk.bold('\n📝 Beta Feedback'));
    console.log(chalk.gray('─'.repeat(50)));
    console.log(chalk.dim('Your feedback helps improve One-Shot Mode!\n'));

    // Ask if user wants to provide feedback
    const wantsToProvide = await this.prompts.confirm(
      'Would you like to provide quick feedback? (30 seconds)',
      true
    );

    if (!wantsToProvide) {
      logger.info('Feedback skipped');
      return null;
    }

    try {
      // Collect satisfaction rating
      const satisfactionChoice = await this.prompts.selectOne(
        'How satisfied are you with this One-Shot Mode session?',
        [
          '⭐ 1 - Very Dissatisfied',
          '⭐⭐ 2 - Dissatisfied',
          '⭐⭐⭐ 3 - Neutral',
          '⭐⭐⭐⭐ 4 - Satisfied',
          '⭐⭐⭐⭐⭐ 5 - Very Satisfied',
        ]
      );
      const satisfaction = parseInt(satisfactionChoice.charAt(0)) || 3;

      // Collect issues encountered
      const issueChoices = await this.prompts.selectMultiple(
        'Did you encounter any of these issues? (select all that apply)',
        [
          'Task took longer than expected',
          'Quality gates failed unexpectedly',
          'Auto-fix didn\'t work well',
          'Manual intervention was needed too often',
          'Progress reporting was unclear',
          'Deployment process was confusing',
          'No issues encountered',
        ]
      );
      const issues = issueChoices.filter(i => i !== 'No issues encountered');

      // Collect suggestions
      const suggestions = await this.prompts.input(
        'Any suggestions for improvement? (optional, press Enter to skip)'
      );

      // Would recommend
      const wouldRecommend = await this.prompts.confirm(
        'Would you recommend One-Shot Mode to other developers?',
        true
      );

      // Create feedback data
      const feedback: FeedbackData = {
        timestamp: new Date(),
        satisfaction,
        issues,
        suggestions: suggestions || '',
        wouldRecommend,
      };

      // Store feedback
      await this.storeFeedback(feedback);

      // Show thank you message
      console.log(chalk.green('\n✓ Thank you for your feedback!'));
      if (satisfaction >= 4) {
        console.log(chalk.dim('  Glad you had a good experience! 🎉'));
      } else if (satisfaction <= 2) {
        console.log(chalk.dim('  We\'re sorry it didn\'t meet expectations.'));
        console.log(chalk.dim('  Your feedback will help us improve.'));
      }

      return feedback;
    } catch (error: any) {
      logger.warn(`Feedback collection failed: ${error.message}`);
      return null;
    }
  }

  /**
   * Store feedback locally
   */
  private async storeFeedback(feedback: FeedbackData): Promise<void> {
    this.feedbackHistory.push(feedback);

    try {
      // Store in .aikit/feedback directory
      const feedbackDir = join(getAikitDir(), 'feedback');
      await mkdir(feedbackDir, { recursive: true });

      // Create feedback file with timestamp
      const fileName = `feedback-${Date.now()}.json`;
      const filePath = join(feedbackDir, fileName);

      await writeFile(filePath, JSON.stringify(feedback, null, 2));
      logger.info(`Feedback saved to ${filePath}`);
    } catch (error: any) {
      logger.warn(`Failed to save feedback: ${error.message}`);
    }
  }

  /**
   * Get feedback summary
   */
  async getSummary(): Promise<FeedbackSummary> {
    const history = this.feedbackHistory;

    if (history.length === 0) {
      return {
        totalFeedback: 0,
        averageSatisfaction: 0,
        commonIssues: [],
        recentSuggestions: [],
      };
    }

    // Calculate average satisfaction
    const totalSatisfaction = history.reduce((sum, f) => sum + f.satisfaction, 0);
    const averageSatisfaction = totalSatisfaction / history.length;

    // Find common issues
    const issueCount: Record<string, number> = {};
    for (const feedback of history) {
      for (const issue of feedback.issues) {
        issueCount[issue] = (issueCount[issue] || 0) + 1;
      }
    }
    const commonIssues = Object.entries(issueCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([issue]) => issue);

    // Get recent suggestions
    const recentSuggestions = history
      .filter(f => f.suggestions)
      .slice(-5)
      .map(f => f.suggestions);

    return {
      totalFeedback: history.length,
      averageSatisfaction: Math.round(averageSatisfaction * 10) / 10,
      commonIssues,
      recentSuggestions,
    };
  }

  /**
   * Display feedback summary
   */
  async displaySummary(): Promise<void> {
    const summary = await this.getSummary();

    console.log(chalk.bold('\n📊 Feedback Summary'));
    console.log(chalk.gray('─'.repeat(40)));
    console.log(`Total Feedback: ${summary.totalFeedback}`);
    console.log(`Average Satisfaction: ${summary.averageSatisfaction}/5`);

    if (summary.commonIssues.length > 0) {
      console.log(chalk.bold('\nCommon Issues:'));
      for (const issue of summary.commonIssues) {
        console.log(chalk.dim(`  • ${issue}`));
      }
    }

    if (summary.recentSuggestions.length > 0) {
      console.log(chalk.bold('\nRecent Suggestions:'));
      for (const suggestion of summary.recentSuggestions) {
        console.log(chalk.dim(`  • ${suggestion}`));
      }
    }
  }

  /**
   * Quick feedback (yes/no only)
   */
  async collectQuick(): Promise<boolean | null> {
    const helpful = await this.prompts.confirm(
      'Was this One-Shot session helpful?',
      true
    );

    // Store minimal feedback
    const feedback: FeedbackData = {
      timestamp: new Date(),
      satisfaction: helpful ? 4 : 2,
      issues: [],
      suggestions: '',
      wouldRecommend: helpful,
    };

    await this.storeFeedback(feedback);
    return helpful;
  }

  /**
   * Clear feedback history (for testing)
   */
  clearHistory(): void {
    this.feedbackHistory = [];
  }
}
