import { exec } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';
import { InteractivePrompts } from '../interactive.js';
import { BeadsIntegration } from '../beads.js';
import { DeploymentStatus } from '../oneshot.js';
import { logger } from '../../utils/logger.js';

const execAsync = promisify(exec);

/**
 * Deployment environment
 */
type DeploymentEnvironment = 'dev' | 'staging' | 'prod';

/**
 * Deployment plan
 */
interface DeploymentPlan {
  environment: DeploymentEnvironment;
  commands: string[];
  rollbackCommands: string[];
  verificationCommands: string[];
  estimatedDuration: number; // seconds
}

/**
 * Deployment handler - Manage deployment with approval
 *
 * Handles deployment planning, approval, execution, and rollback
 */
export class DeploymentHandler {
  private prompts: InteractivePrompts;
  private beads: BeadsIntegration;

  constructor(prompts: InteractivePrompts, beads: BeadsIntegration) {
    this.prompts = prompts;
    this.beads = beads;
  }

  /**
   * Handle deployment with user approval
   */
  async handleDeployment(
    taskId: string,
    environment: DeploymentEnvironment
  ): Promise<DeploymentStatus> {
    console.log(chalk.bold(`\n🚀 Deployment to ${environment}`));
    console.log(chalk.gray('─'.repeat(50)));

    // Step 1: Generate deployment plan
    const plan = await this.generateDeploymentPlan(environment);
    await this.displayDeploymentPlan(plan);

    // Step 2: Ask for user approval
    const approved = await this.requestApproval(environment);
    if (!approved) {
      logger.info('Deployment cancelled by user');
      return {
        deployed: false,
        environment,
        timestamp: new Date(),
      };
    }

    // Step 3: Execute deployment
    console.log(chalk.yellow('\n⏳ Executing deployment...'));
    const result = await this.executeDeployment(plan);

    if (!result.success) {
      // Step 4: Handle failure - ask about rollback
      const shouldRollback = await this.prompts.confirm(
        'Deployment failed. Would you like to rollback?',
        true
      );

      if (shouldRollback) {
        await this.executeRollback(plan);
      }

      // Add note to bead
      await this.beads.addNote(
        taskId,
        `Deployment to ${environment} failed: ${result.error}`
      );

      return {
        deployed: false,
        environment,
        timestamp: new Date(),
        rollbackPlan: plan.rollbackCommands.join('\n'),
      };
    }

    // Step 5: Verify deployment
    const verified = await this.verifyDeployment(plan);
    if (!verified) {
      const shouldRollback = await this.prompts.confirm(
        'Deployment verification failed. Would you like to rollback?',
        true
      );

      if (shouldRollback) {
        await this.executeRollback(plan);
        return {
          deployed: false,
          environment,
          timestamp: new Date(),
        };
      }
    }

    // Add note to bead
    await this.beads.addNote(
      taskId,
      `Successfully deployed to ${environment}`
    );

    logger.success(`Deployment to ${environment} complete!`);

    return {
      deployed: true,
      environment,
      url: this.getEnvironmentUrl(environment),
      timestamp: new Date(),
      rollbackPlan: plan.rollbackCommands.join('\n'),
    };
  }

  /**
   * Generate deployment plan based on environment
   */
  private async generateDeploymentPlan(
    environment: DeploymentEnvironment
  ): Promise<DeploymentPlan> {
    const basePlan: DeploymentPlan = {
      environment,
      commands: [],
      rollbackCommands: [],
      verificationCommands: [],
      estimatedDuration: 60,
    };

    // Detect deployment type based on project files
    const deploymentType = await this.detectDeploymentType();

    switch (deploymentType) {
      case 'npm':
        if (environment === 'prod') {
          basePlan.commands = [
            'npm version patch',
            'npm run build',
            'npm publish',
          ];
          basePlan.rollbackCommands = [
            'npm unpublish --force',
          ];
          basePlan.verificationCommands = [
            'npm view . version',
          ];
          basePlan.estimatedDuration = 120;
        } else {
          basePlan.commands = [
            'npm run build',
            `npm pack`,
          ];
          basePlan.verificationCommands = [
            'ls -la *.tgz',
          ];
        }
        break;

      case 'docker':
        basePlan.commands = [
          'docker build -t app:latest .',
          `docker tag app:latest app:${environment}`,
          `docker push app:${environment}`,
        ];
        basePlan.rollbackCommands = [
          `docker pull app:${environment}-previous`,
          `docker tag app:${environment}-previous app:${environment}`,
        ];
        basePlan.verificationCommands = [
          `docker images | grep app:${environment}`,
        ];
        basePlan.estimatedDuration = 180;
        break;

      case 'vercel':
        basePlan.commands = [
          environment === 'prod'
            ? 'vercel --prod'
            : 'vercel',
        ];
        basePlan.rollbackCommands = [
          'vercel rollback',
        ];
        basePlan.verificationCommands = [
          'vercel ls',
        ];
        basePlan.estimatedDuration = 90;
        break;

      case 'git':
      default:
        basePlan.commands = [
          'git add .',
          'git commit -m "Deploy"',
          `git push origin ${environment === 'prod' ? 'main' : environment}`,
        ];
        basePlan.rollbackCommands = [
          'git revert HEAD --no-edit',
          'git push',
        ];
        basePlan.verificationCommands = [
          'git log -1 --oneline',
        ];
        break;
    }

    return basePlan;
  }

  /**
   * Detect deployment type based on project files
   */
  private async detectDeploymentType(): Promise<'npm' | 'docker' | 'vercel' | 'git'> {
    try {
      // Check for vercel.json
      await execAsync('test -f vercel.json', { cwd: process.cwd() });
      return 'vercel';
    } catch {
      // Not Vercel
    }

    try {
      // Check for Dockerfile
      await execAsync('test -f Dockerfile', { cwd: process.cwd() });
      return 'docker';
    } catch {
      // Not Docker
    }

    try {
      // Check for npm publish config
      const { stdout } = await execAsync('npm pkg get publishConfig', {
        cwd: process.cwd(),
      });
      if (stdout && stdout !== '{}') {
        return 'npm';
      }
    } catch {
      // Not npm
    }

    return 'git';
  }

  /**
   * Display deployment plan
   */
  private async displayDeploymentPlan(plan: DeploymentPlan): Promise<void> {
    console.log(chalk.bold('\n📋 Deployment Plan'));
    console.log(chalk.gray('─'.repeat(40)));

    console.log(chalk.bold('Environment:'), plan.environment);
    console.log(chalk.bold('Estimated Duration:'), `${plan.estimatedDuration}s`);

    console.log(chalk.bold('\nCommands to execute:'));
    for (const cmd of plan.commands) {
      console.log(chalk.cyan(`  $ ${cmd}`));
    }

    console.log(chalk.bold('\nRollback commands (if needed):'));
    for (const cmd of plan.rollbackCommands) {
      console.log(chalk.yellow(`  $ ${cmd}`));
    }

    console.log(chalk.gray('─'.repeat(40)));
  }

  /**
   * Request deployment approval
   */
  private async requestApproval(environment: DeploymentEnvironment): Promise<boolean> {
    if (environment === 'prod') {
      console.log(chalk.red.bold('\n⚠️  PRODUCTION DEPLOYMENT'));
      console.log(chalk.red('This will deploy to production. Please review carefully.\n'));
    }

    const confirmed = await this.prompts.confirm(
      `Do you approve deployment to ${environment}?`,
      environment !== 'prod'
    );

    if (confirmed && environment === 'prod') {
      // Double confirm for production
      const doubleConfirmed = await this.prompts.confirm(
        'Are you absolutely sure? This is a PRODUCTION deployment.',
        false
      );
      return doubleConfirmed;
    }

    return confirmed;
  }

  /**
   * Execute deployment commands
   */
  private async executeDeployment(
    plan: DeploymentPlan
  ): Promise<{ success: boolean; error?: string }> {
    for (const cmd of plan.commands) {
      console.log(chalk.dim(`  Running: ${cmd}`));

      try {
        const { stdout } = await execAsync(cmd, {
          cwd: process.cwd(),
          timeout: plan.estimatedDuration * 1000 * 2, // 2x estimated time
        });

        if (stdout) {
          console.log(chalk.dim(stdout.trim().slice(0, 200)));
        }
        console.log(chalk.green(`  ✓ ${cmd}`));
      } catch (error: any) {
        console.log(chalk.red(`  ✗ ${cmd}`));
        console.log(chalk.red(`    Error: ${error.message.slice(0, 100)}`));
        return {
          success: false,
          error: error.message,
        };
      }
    }

    return { success: true };
  }

  /**
   * Execute rollback commands
   */
  private async executeRollback(plan: DeploymentPlan): Promise<boolean> {
    console.log(chalk.yellow('\n⏪ Executing rollback...'));

    for (const cmd of plan.rollbackCommands) {
      console.log(chalk.dim(`  Running: ${cmd}`));

      try {
        await execAsync(cmd, {
          cwd: process.cwd(),
          timeout: 60000,
        });
        console.log(chalk.green(`  ✓ ${cmd}`));
      } catch (error: any) {
        console.log(chalk.red(`  ✗ ${cmd} - ${error.message.slice(0, 50)}`));
        // Continue with other rollback commands
      }
    }

    logger.info('Rollback completed');
    return true;
  }

  /**
   * Verify deployment success
   */
  private async verifyDeployment(plan: DeploymentPlan): Promise<boolean> {
    console.log(chalk.dim('\n  Verifying deployment...'));

    for (const cmd of plan.verificationCommands) {
      try {
        const { stdout } = await execAsync(cmd, {
          cwd: process.cwd(),
          timeout: 30000,
        });
        console.log(chalk.dim(`  ${stdout.trim()}`));
      } catch (error: any) {
        logger.warn(`Verification command failed: ${cmd}`);
        return false;
      }
    }

    console.log(chalk.green('  ✓ Deployment verified'));
    return true;
  }

  /**
   * Get environment URL
   */
  private getEnvironmentUrl(environment: DeploymentEnvironment): string | undefined {
    // This would typically come from config or deployment output
    switch (environment) {
      case 'dev':
        return 'http://localhost:3000';
      case 'staging':
        return 'https://staging.example.com';
      case 'prod':
        return 'https://example.com';
      default:
        return undefined;
    }
  }
}
