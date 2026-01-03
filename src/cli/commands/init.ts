/**
 * Init Command
 *
 * Initialize AIKit configuration for a specific platform
 */

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';

import { loadConfig } from '../../core/config.js';
import { SkillEngine } from '../../core/skills.js';
import { BeadsIntegration } from '../../core/beads.js';
import { CliDetector, CliTool, CliPlatform } from '../../utils/cli-detector.js';
import { logger } from '../../utils/logger.js';
import { paths } from '../../utils/paths.js';
import { initializeConfig, installCliTool } from '../helpers.js';
import { AgentManager } from '../../core/agents.js';
import { CommandRunner } from '../../core/commands.js';
import { createAdapter } from '../../platform/adapters.js';

export function registerInitCommand(program: Command): void {
  program
    .command('init [platform]')
    .description('Initialize AIKit configuration for a specific platform')
    .option('-g, --global', 'Initialize global configuration')
    .option('-p, --project', 'Initialize project-level configuration')
    .action(async (platformArg, options) => {
      const configDir = options.global ? paths.globalConfig() : paths.projectConfig();

      console.log(chalk.bold('\n🚀 AIKit Setup\n'));
      logger.info(`Initializing AIKit in ${configDir}...`);

      try {
        // Step 1: Initialize config
        await initializeConfig(configDir, options.global);
        logger.success('✓ Configuration created');

        if (!options.global) {
          // Step 2: Platform selection
          let selectedPlatform: CliPlatform;

          if (platformArg) {
            selectedPlatform = CliDetector.matchPlatform(platformArg);
          } else {
            const platforms = await CliDetector.detectPlatforms();
            const installed = CliDetector.filterInstalledPlatforms(platforms);

            console.log(chalk.bold('\n🔍 Available CLI Tools\n'));
            for (const p of platforms) {
              const status = p.installed ? chalk.green('✓') : chalk.gray('○');
              console.log(`  ${status} ${p.displayName}`);
            }

            const { platform } = await inquirer.prompt([
              {
                type: 'list',
                name: 'platform',
                message: 'Which CLI tool do you want to configure AIKit for?',
                choices: platforms.map(p => ({
                  name: p.displayName,
                  value: p.platform,
                })),
                default: installed[0]?.platform || CliPlatform.OPENCODE,
              },
            ]);

            selectedPlatform = platform;
          }

          logger.info(`Selected platform: ${selectedPlatform}`);

          // Step 3: Sync skills
          const config = await loadConfig();
          const engine = new SkillEngine(config);
          const result = await engine.syncSkillsToProject();
          if (result.count > 0) {
            logger.success(`✓ Synced ${result.count} skills`);
          }

          // Step 4: Install CLI tool if needed
          if (selectedPlatform === CliPlatform.CLAUDE) {
            const cliTools = await CliDetector.checkAll();
            const claudeTool = cliTools.find(t => t.name === CliTool.CLAUDE);
            if (claudeTool && !claudeTool.installed) {
              const { installClaude } = await inquirer.prompt([
                {
                  type: 'confirm',
                  name: 'installClaude',
                  message: 'Claude Code CLI is not installed. Install now?',
                  default: true,
                },
              ]);

              if (installClaude) {
                await installCliTool(claudeTool);
              }
            }
          }

          // Step 5: Initialize beads
          const beads = new BeadsIntegration();
          const beadsStatus = await beads.getStatus();

          if (!beadsStatus.initialized) {
            logger.info('Initializing .beads directory...');
            await beads.initLocal();
            logger.success('✓ .beads directory created');

            if (!beadsStatus.installed) {
              logger.info('Tip: Install Beads CLI globally for full functionality: npm install -g beads');
            }
          } else {
            logger.info('Beads already initialized');
          }

          // Step 5.5: Setup git hooks
          logger.info('Setting up git hooks...');
          await beads.setupGitHooks();
          logger.success('✓ Git hooks configured');

          // Step 6: Install platform-specific commands
          const adapter = createAdapter(selectedPlatform);
          logger.info(`Installing AIKit for ${adapter.displayName}...`);
          await installToPlatform(adapter, config);

          console.log(chalk.bold('\n✨ AIKit is ready!\n'));

          // Show platform-specific usage
          if (selectedPlatform === CliPlatform.OPENCODE) {
            showOpenCodeUsage();
          } else if (selectedPlatform === CliPlatform.CLAUDE) {
            showClaudeUsage();
          }
        }
      } catch (error) {
        logger.error('Failed to initialize AIKit:', error);
        process.exit(1);
      }
    });
}

async function installToPlatform(
  adapter: any,
  config: any
): Promise<void> {
  const skillEngine = new SkillEngine(config);
  const commandRunner = new CommandRunner(config);
  const agentManager = new AgentManager(config);

  const skills = await skillEngine.listSkills();
  const commands = await commandRunner.listCommands();
  const agents = await agentManager.listAgents();

  // Install commands
  logger.info(`Installing ${commands.length} commands...`);
  for (const command of commands) {
    const { name, content } = await adapter.transformCommand(command);
    await adapter.installCommand(name, content);
    logger.info(`  ✓ Created ${name} command`);
  }

  // Install skills
  logger.info(`Installing ${skills.length} skills...`);
  for (const skill of skills) {
    const { name, directory, files } = await adapter.transformSkill(skill);
    await adapter.installSkill(name, directory, files);
    logger.info(`  ✓ Created ${name} skill`);
  }

  // Install agents
  logger.info(`Installing ${agents.length} agents...`);
  for (const agent of agents) {
    const { name, content } = await adapter.transformAgent(agent);
    await adapter.installAgent(name, content);
    logger.info(`  ✓ Created ${name} agent`);
  }
}

function showOpenCodeUsage(): void {
  console.log('Usage in OpenCode:');
  console.log(chalk.cyan('  /skills') + '  - List all available skills');
  console.log(chalk.cyan('  /plan') + '    - Create implementation plan');
  console.log(chalk.cyan('  /tdd') + '     - Test-driven development');
  console.log(chalk.cyan('  /debug') + '   - Systematic debugging');
  console.log(chalk.cyan('  /review') + '  - Code review checklist');
  console.log(chalk.cyan('  /git') + '     - Git workflow');
  console.log(chalk.cyan('  /frontend-aesthetics') + ' - UI/UX guidelines');
  console.log('\nPress ' + chalk.bold('Ctrl+K') + ' in OpenCode to see all commands.\n');
}

function showClaudeUsage(): void {
  console.log('Usage in Claude Code CLI:');
  console.log(chalk.cyan('  /help') + '    - List all available commands');
  console.log(chalk.cyan('  /plan') + '    - Create implementation plan');
  console.log(chalk.cyan('  /implement') + ' - Implement a task');
  console.log(chalk.cyan('  /test') + '    - Run tests');
  console.log('\nType ' + chalk.bold('"/help"') + ' in Claude to see all commands.\n');
}

