import chalk from 'chalk';

/**
 * Simple logger with colored output
 */
export const logger = {
  info(...args: unknown[]): void {
    console.log(chalk.blue('ℹ'), ...args);
  },

  success(...args: unknown[]): void {
    console.log(chalk.green('✓'), ...args);
  },

  warn(...args: unknown[]): void {
    console.log(chalk.yellow('⚠'), ...args);
  },

  error(...args: unknown[]): void {
    console.error(chalk.red('✖'), ...args);
  },

  debug(...args: unknown[]): void {
    if (process.env.DEBUG || process.env.AIKIT_DEBUG) {
      console.log(chalk.gray('⋯'), ...args);
    }
  },

  step(step: number, total: number, message: string): void {
    console.log(chalk.cyan(`[${step}/${total}]`), message);
  },

  header(message: string): void {
    console.log(chalk.bold.underline(`\n${message}\n`));
  },

  list(items: string[], prefix = '•'): void {
    for (const item of items) {
      console.log(`  ${prefix} ${item}`);
    }
  },
};
