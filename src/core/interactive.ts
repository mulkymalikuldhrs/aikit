import inquirer from 'inquirer';

/**
 * Interactive CLI prompts using inquirer
 *
 * Provides user-friendly prompts with arrow-key navigation
 */
export class InteractivePrompts {
  /**
   * Select one option from list (arrow-key navigation)
   */
  async selectOne(
    message: string,
    choices: string[],
    defaultChoice?: string
  ): Promise<string> {
    const { choice } = await inquirer.prompt([
      {
        type: 'list',
        name: 'choice',
        message,
        choices,
        default: defaultChoice,
      },
    ]);
    return choice;
  }

  /**
   * Select multiple options (arrow-key + space)
   */
  async selectMultiple(
    message: string,
    choices: string[],
    defaultChoices?: string[]
  ): Promise<string[]> {
    const { selected } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selected',
        message,
        choices,
        default: defaultChoices || [],
      },
    ]);
    return selected;
  }

  /**
   * Yes/no confirmation
   */
  async confirm(message: string, defaultChoice: boolean = true): Promise<boolean> {
    const { confirmed } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmed',
        message,
        default: defaultChoice,
      },
    ]);
    return confirmed;
  }

  /**
   * Text input with validation
   */
  async input(
    message: string,
    validate?: (input: string) => boolean | string,
    defaultText?: string
  ): Promise<string> {
    const { value } = await inquirer.prompt([
      {
        type: 'input',
        name: 'value',
        message,
        validate: validate ? (input: string) => {
          if (validate(input)) {
            return true;
          }
          return 'Invalid input';
        } : undefined,
        default: defaultText,
      },
    ]);
    return value;
  }

  /**
   * Password input (masked)
   */
  async password(message: string): Promise<string> {
    const { value } = await inquirer.prompt([
      {
        type: 'password',
        name: 'value',
        message,
      },
    ]);
    return value;
  }

  /**
   * Number input with validation
   */
  async number(
    message: string,
    min?: number,
    max?: number,
    defaultNum?: number
  ): Promise<number> {
    const { value } = await inquirer.prompt([
      {
        type: 'number',
        name: 'value',
        message,
        validate: (input: number) => {
          if (min !== undefined && input < min) {
            return `Minimum value is ${min}`;
          }
          if (max !== undefined && input > max) {
            return `Maximum value is ${max}`;
          }
          return true;
        },
        default: defaultNum,
      },
    ]);
    return value;
  }

  /**
   * Auto-complete input
   */
  async autocomplete(
    message: string,
    source: (answers: any, input: string) => Promise<string[]>,
    suggestOnly: boolean = false
  ): Promise<string> {
    // TODO: Implement autocomplete with inquirer-autocomplete-prompt
    // For now, fall back to regular select
    const choices = await source({}, '');
    void suggestOnly; // TODO: Use in full implementation
    return await this.selectOne(message, choices);
  }

  /**
   * Editor input (open editor for multi-line input)
   */
  async editor(message: string, defaultText?: string): Promise<string> {
    const { value } = await inquirer.prompt([
      {
        type: 'editor',
        name: 'value',
        message,
        default: defaultText,
      },
    ]);
    return value;
  }
}
