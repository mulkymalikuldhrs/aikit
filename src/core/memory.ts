import { readFile, writeFile, mkdir, access, constants } from 'fs/promises';
import { join } from 'path';
import { Config } from './config.js';
import { paths } from '../utils/paths.js';

/**
 * Memory entry structure
 */
export interface Memory {
  key: string;
  content: string;
  summary: string;
  createdAt: Date;
  updatedAt: Date;
  type: 'observation' | 'handoff' | 'research' | 'template' | 'custom';
}

/**
 * Memory Manager - Persistent context across sessions
 */
export class MemoryManager {
  private config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  /**
   * List all memory entries
   */
  async list(): Promise<Memory[]> {
    const memories: Memory[] = [];
    const memoryPath = paths.memory(this.config.configPath);
    
    const subDirs = ['observations', 'handoffs', 'research'];
    
    for (const subDir of subDirs) {
      const dirPath = join(memoryPath, subDir);
      try {
        const { readdir } = await import('fs/promises');
        const files = await readdir(dirPath);
        
        for (const file of files) {
          if (!file.endsWith('.md')) continue;
          
          const content = await readFile(join(dirPath, file), 'utf-8');
          const summary = this.extractSummary(content);
          
          memories.push({
            key: `${subDir}/${file.replace('.md', '')}`,
            content,
            summary,
            createdAt: new Date(), // Would get from file stats
            updatedAt: new Date(),
            type: subDir as Memory['type'],
          });
        }
      } catch {
        // Directory doesn't exist
      }
    }
    
    return memories;
  }

  /**
   * Read a memory entry
   */
  async read(key: string): Promise<string | null> {
    const memoryPath = paths.memory(this.config.configPath);
    
    // Check if key includes subdirectory
    let filePath: string;
    if (key.includes('/')) {
      filePath = join(memoryPath, `${key}.md`);
    } else {
      // Search in all subdirectories
      const subDirs = ['observations', 'handoffs', 'research', '_templates'];
      for (const subDir of subDirs) {
        const testPath = join(memoryPath, subDir, `${key}.md`);
        try {
          await access(testPath, constants.R_OK);
          filePath = testPath;
          break;
        } catch {
          continue;
        }
      }
      filePath = filePath! || join(memoryPath, `${key}.md`);
    }
    
    try {
      return await readFile(filePath, 'utf-8');
    } catch {
      return null;
    }
  }

  /**
   * Update a memory entry
   */
  async update(key: string, content: string, options?: {
    append?: boolean;
    type?: Memory['type'];
  }): Promise<void> {
    const memoryPath = paths.memory(this.config.configPath);
    const type = options?.type || 'custom';
    
    // Determine file path based on type
    let filePath: string;
    if (key.includes('/')) {
      filePath = join(memoryPath, `${key}.md`);
    } else {
      const subDir = type === 'observation' ? 'observations' 
        : type === 'handoff' ? 'handoffs'
        : type === 'research' ? 'research'
        : '';
      filePath = join(memoryPath, subDir, `${key}.md`);
    }
    
    // Ensure directory exists
    const { dirname } = await import('path');
    await mkdir(dirname(filePath), { recursive: true });
    
    // Handle append mode
    if (options?.append) {
      try {
        const existing = await readFile(filePath, 'utf-8');
        const timestamp = new Date().toISOString();
        content = `${existing}\n\n---\n_Updated: ${timestamp}_\n\n${content}`;
      } catch {
        // File doesn't exist, create new
      }
    }
    
    await writeFile(filePath, content);
  }

  /**
   * Create a handoff bundle
   */
  async createHandoff(summary: {
    completed: string[];
    inProgress: string[];
    remaining: string[];
    context: string;
    nextSteps: string[];
  }): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const key = `handoffs/${timestamp}`;
    
    const content = `# Handoff: ${new Date().toLocaleString()}

## Completed
${summary.completed.map(item => `- [x] ${item}`).join('\n') || '- None'}

## In Progress
${summary.inProgress.map(item => `- [ ] ${item}`).join('\n') || '- None'}

## Remaining
${summary.remaining.map(item => `- [ ] ${item}`).join('\n') || '- None'}

## Context
${summary.context || 'No additional context.'}

## Next Steps
${summary.nextSteps.map((step, i) => `${i + 1}. ${step}`).join('\n') || '- Continue from where left off'}
`;
    
    await this.update(key, content, { type: 'handoff' });
    return key;
  }

  /**
   * Get the latest handoff
   */
  async getLatestHandoff(): Promise<Memory | null> {
    const memories = await this.list();
    const handoffs = memories.filter(m => m.type === 'handoff');
    
    if (handoffs.length === 0) return null;
    
    // Sort by key (which includes timestamp)
    handoffs.sort((a, b) => b.key.localeCompare(a.key));
    return handoffs[0];
  }

  /**
   * Create an observation
   */
  async createObservation(title: string, observation: {
    what: string;
    why: string;
    impact: string;
    tags?: string[];
  }): Promise<string> {
    const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const key = `observations/${slug}`;
    
    const content = `# ${title}

## What
${observation.what}

## Why
${observation.why}

## Impact
${observation.impact}

${observation.tags?.length ? `## Tags\n${observation.tags.map(t => `- ${t}`).join('\n')}` : ''}

---
_Created: ${new Date().toISOString()}_
`;
    
    await this.update(key, content, { type: 'observation' });
    return key;
  }

  /**
   * Save research findings
   */
  async saveResearch(topic: string, findings: {
    summary: string;
    sources: string[];
    recommendations: string[];
    codeExamples?: string;
  }): Promise<string> {
    const slug = topic.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const key = `research/${slug}`;
    
    const content = `# Research: ${topic}

## Summary
${findings.summary}

## Sources
${findings.sources.map(s => `- ${s}`).join('\n')}

## Recommendations
${findings.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}

${findings.codeExamples ? `## Code Examples\n\`\`\`\n${findings.codeExamples}\n\`\`\`` : ''}

---
_Researched: ${new Date().toISOString()}_
`;
    
    await this.update(key, content, { type: 'research' });
    return key;
  }

  /**
   * Extract a summary from content (first paragraph or heading)
   */
  private extractSummary(content: string): string {
    const lines = content.split('\n').filter(l => l.trim());
    
    // Find first non-heading line
    for (const line of lines) {
      if (!line.startsWith('#') && line.trim().length > 0) {
        return line.slice(0, 100) + (line.length > 100 ? '...' : '');
      }
    }
    
    // Fall back to first heading
    if (lines[0]?.startsWith('#')) {
      return lines[0].replace(/^#+\s*/, '');
    }
    
    return 'No summary available';
  }
}
