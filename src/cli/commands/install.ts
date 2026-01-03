/**
 * Install Command
 *
 * Install AIKit to specific CLI tool configuration
 */

import { Command } from 'commander';
import inquirer from 'inquirer';

import { logger } from '../../utils/logger.js';
import { CliDetector, CliPlatform } from '../../utils/cli-detector.js';
import { createAdapter } from '../../platform/adapters.js';
import { loadConfig } from '../../core/config.js';
import { AgentManager } from '../../core/agents.js';
import { CommandRunner } from '../../core/commands.js';
import { SkillEngine } from '../../core/skills.js';

export function registerInstallCommand(program: Command): void {
  program
    .command('install [platform]')
    .description('Install AIKit to specific CLI tool configuration')
    .action(async (platformArg) => {
      try {
        let selectedPlatform: CliPlatform;

        if (platformArg) {
          selectedPlatform = CliDetector.matchPlatform(platformArg);
          if (!selectedPlatform) {
            logger.error(`Unknown platform: ${platformArg}`);
            logger.info(`Supported platforms: ${Object.values(CliPlatform).join(', ')}`);
            process.exit(1);
          }
        } else {
          const platforms = await CliDetector.detectPlatforms();
          
          // Smart default: prefer already installed platform
          const installedPlatforms = CliDetector.filterInstalledPlatforms(platforms);
          const defaultPlatform = installedPlatforms.length > 0
            ? installedPlatforms[0].platform
            : platforms[0]?.platform;

          const { platform } = await inquirer.prompt([
            {
              type: 'list',
              name: 'platform',
              message: 'Which CLI tool do you want to install AIKit for?',
              choices: platforms.map(p => ({
                name: p.displayName,
                value: p.platform,
              })),
              default: defaultPlatform,
            },
          ]);

          selectedPlatform = platform;
        }

        logger.info(`Installing AIKit for ${selectedPlatform}...`);

        const config = await loadConfig();
        const adapter = createAdapter(selectedPlatform);

        const skillEngine = config.skills.enabled ? new SkillEngine(config) : null;
        const commandRunner = config.commands.enabled ? new CommandRunner(config) : null;
        const agentManager = config.agents.enabled ? new AgentManager(config) : null;

        // Install commands
        if (commandRunner) {
          const commands = await commandRunner.listCommands();
          logger.info(`Installing ${commands.length} commands...`);
          for (const command of commands) {
            const { name, content } = await adapter.transformCommand(command);
            await adapter.installCommand(name, content);
            logger.info(`  ✓ Created ${name} command`);
          }
        }

        // Install skills
        if (skillEngine) {
          const skills = await skillEngine.listSkills();
          logger.info(`Installing ${skills.length} skills...`);
          for (const skill of skills) {
            const { name, directory, files } = await adapter.transformSkill(skill);
            await adapter.installSkill(name, directory, files);
            logger.info(`  ✓ Created ${name} skill`);
          }
        }

        // Install agents
        if (agentManager) {
          const agents = await agentManager.listAgents();
          logger.info(`Installing ${agents.length} agents...`);
          for (const agent of agents) {
            const { name, content } = await adapter.transformAgent(agent);
            await adapter.installAgent(name, content);
            logger.info(`  ✓ Created ${name} agent`);
          }
        }

        logger.success(`\n✓ AIKit installed to ${adapter.displayName}!`);
      } catch (error) {
        logger.error('Failed to install:', error);
        process.exit(1);
      }
    });
}

