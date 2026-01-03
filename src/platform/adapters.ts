import { CliPlatform } from '../utils/cli-detector.js';
import { OpenCodeAdapter } from './opencode-adapter.js';
import { ClaudeAdapter } from './claude-adapter.js';
import { PlatformAdapter } from './types.js';

export function createAdapter(platform: CliPlatform): PlatformAdapter {
  switch (platform) {
    case CliPlatform.OPENCODE:
      return new OpenCodeAdapter();
    case CliPlatform.CLAUDE:
      return new ClaudeAdapter();
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

export const SUPPORTED_PLATFORMS = [
  { platform: CliPlatform.OPENCODE, name: 'OpenCode' },
  { platform: CliPlatform.CLAUDE, name: 'Claude Code CLI' },
] as const;
