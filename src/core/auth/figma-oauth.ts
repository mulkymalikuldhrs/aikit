import open from 'open';
import { ToolConfigManager } from '../tool-config.js';
import { logger } from '../../utils/logger.js';

/**
 * Figma OAuth Configuration
 * 
 * Note: Figma uses Personal Access Tokens, not OAuth 2.0
 * For OAuth-like experience, we'll guide user through browser
 * to create a token, then they paste it back
 */
export class FigmaOAuth {
  private configManager: ToolConfigManager;

  constructor(configManager: ToolConfigManager) {
    this.configManager = configManager;
  }

  /**
   * Start OAuth flow for Figma
   * 
   * Since Figma uses Personal Access Tokens (not OAuth 2.0),
   * we'll open browser to token creation page and guide user
   */
  async authenticate(): Promise<string> {
    console.log('\n🔐 Figma Authentication\n');
    console.log('Figma uses Personal Access Tokens for API access.');
    console.log('We will open your browser to create a token.\n');

    // Open Figma token creation page
    const tokenUrl = 'https://www.figma.com/developers/api#access-tokens';
    console.log(`Opening: ${tokenUrl}`);
    
    try {
      await open(tokenUrl);
    } catch (error) {
      console.log('\n⚠️  Could not open browser automatically.');
      console.log(`Please visit: ${tokenUrl}`);
    }

    console.log('\n📋 Instructions:');
    console.log('1. In the browser, scroll to "Personal access tokens" section');
    console.log('2. Click "Create new token"');
    console.log('3. Give it a name (e.g., "AIKit")');
    console.log('4. Copy the token (you won\'t see it again!)');
    console.log('5. Paste it here when prompted\n');

    // Use inquirer to get token from user
    const { default: inquirer } = await import('inquirer');
    
    const { token } = await inquirer.prompt([
      {
        type: 'password',
        name: 'token',
        message: 'Paste your Figma Personal Access Token:',
        validate: (input: string) => {
          if (!input || input.trim().length === 0) {
            return 'Token cannot be empty';
          }
          if (input.length < 20) {
            return 'Token seems too short. Please check and try again.';
          }
          return true;
        },
      },
    ]);

    // Validate token format (Figma tokens are typically long alphanumeric strings)
    const trimmedToken = token.trim();
    
    // Save token
    await this.configManager.updateToolConfig('figma-analysis', {
      config: {
        apiKey: trimmedToken,
      },
      status: 'ready',
    });

    logger.success('Figma token saved successfully!');
    return trimmedToken;
  }

  /**
   * Alternative: Manual token input
   */
  async authenticateManual(): Promise<string> {
    const { default: inquirer } = await import('inquirer');
    
    console.log('\n🔐 Figma Authentication (Manual)\n');
    console.log('To get your Figma Personal Access Token:');
    console.log('1. Visit: https://www.figma.com/developers/api#access-tokens');
    console.log('2. Scroll to "Personal access tokens"');
    console.log('3. Click "Create new token"');
    console.log('4. Copy the token and paste it below\n');

    const { token } = await inquirer.prompt([
      {
        type: 'password',
        name: 'token',
        message: 'Enter your Figma Personal Access Token:',
        validate: (input: string) => {
          if (!input || input.trim().length === 0) {
            return 'Token cannot be empty';
          }
          return true;
        },
      },
    ]);

    const trimmedToken = token.trim();
    
    await this.configManager.updateToolConfig('figma-analysis', {
      config: {
        apiKey: trimmedToken,
      },
      status: 'ready',
    });

    logger.success('Figma token saved successfully!');
    return trimmedToken;
  }

  /**
   * Test if token is valid by making a simple API call
   */
  async validateToken(token: string): Promise<boolean> {
    try {
      // Try to get user info from Figma API
      const response = await fetch('https://api.figma.com/v1/me', {
        headers: {
          'X-Figma-Token': token,
        },
      });

      if (response.ok) {
        const data = await response.json() as { email?: string };
        logger.success(`Token validated! Logged in as: ${data.email || 'Unknown'}`);
        return true;
      } else {
        logger.error(`Token validation failed: ${response.status} ${response.statusText}`);
        return false;
      }
    } catch (error) {
      logger.error(`Token validation error: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }
}

