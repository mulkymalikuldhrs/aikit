import { readFile, readdir, writeFile, mkdir } from 'fs/promises';
import { join, basename, extname } from 'path';
import matter from 'gray-matter';
import { Config } from './config.js';
import { paths } from '../utils/paths.js';
import { logger } from '../utils/logger.js';

/**
 * Skill definition
 */
export interface Skill {
  name: string;
  description: string;
  useWhen: string;
  category: string;
  tags: string[];
  content: string;
  filePath: string;
}

/**
 * Skill frontmatter schema
 */
interface SkillFrontmatter {
  name?: string;
  description?: string;
  useWhen?: string;
  category?: string;
  tags?: string[];
}

/**
 * Skill Engine - Manages workflow skills for AI agents
 * 
 * Skills are mandatory workflow instructions that agents must follow.
 * They enforce structured processes like TDD, systematic debugging, etc.
 */
export class SkillEngine {
  private config: Config;
  private skillsCache: Map<string, Skill> = new Map();

  constructor(config: Config) {
    this.config = config;
  }

  /**
   * List all available skills
   */
  async listSkills(): Promise<Skill[]> {
    const skills: Skill[] = [];
    
    // Load from global config
    const globalSkillsPath = paths.skills(paths.globalConfig());
    try {
      const globalSkills = await this.loadSkillsFromDir(globalSkillsPath);
      skills.push(...globalSkills);
    } catch {
      // No global skills
    }
    
    // Load from project config (override global)
    const projectSkillsPath = paths.skills(this.config.configPath);
    if (projectSkillsPath !== globalSkillsPath) {
      try {
        const projectSkills = await this.loadSkillsFromDir(projectSkillsPath);
        // Override global skills with project skills
        for (const skill of projectSkills) {
          const existingIndex = skills.findIndex(s => s.name === skill.name);
          if (existingIndex >= 0) {
            skills[existingIndex] = skill;
          } else {
            skills.push(skill);
          }
        }
      } catch {
        // No project skills
      }
    }
    
    return skills.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Get a specific skill by name
   */
  async getSkill(name: string): Promise<Skill | null> {
    // Check cache first
    if (this.skillsCache.has(name)) {
      return this.skillsCache.get(name)!;
    }
    
    const skills = await this.listSkills();
    const skill = skills.find(s => s.name === name);
    
    if (skill) {
      this.skillsCache.set(name, skill);
    }
    
    return skill || null;
  }

  /**
   * Find skills matching a query
   */
  async findSkills(query?: string): Promise<Skill[]> {
    const skills = await this.listSkills();
    
    if (!query) {
      return skills;
    }
    
    const lowerQuery = query.toLowerCase();
    return skills.filter(skill =>
      skill.name.toLowerCase().includes(lowerQuery) ||
      skill.description.toLowerCase().includes(lowerQuery) ||
      skill.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
      skill.category.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Create a new skill
   */
  async createSkill(name: string, options?: {
    description?: string;
    useWhen?: string;
    category?: string;
    tags?: string[];
    content?: string;
    global?: boolean;
  }): Promise<Skill> {
    const configPath = options?.global ? paths.globalConfig() : this.config.configPath;
    const skillsDir = paths.skills(configPath);
    
    await mkdir(skillsDir, { recursive: true });
    
    const fileName = `${name.replace(/\s+/g, '-').toLowerCase()}.md`;
    const filePath = join(skillsDir, fileName);
    
    const frontmatter: SkillFrontmatter = {
      name,
      description: options?.description || `Use when you need to ${name}`,
      useWhen: options?.useWhen || `The user asks you to ${name}`,
      category: options?.category || 'custom',
      tags: options?.tags || ['custom'],
    };
    
    const content = options?.content || `## ${name}

### Overview
Describe what this skill does.

### Workflow

#### Step 1: Understand the Task
- Gather context
- Clarify requirements

#### Step 2: Plan the Approach
- Break down into sub-tasks
- Identify dependencies

#### Step 3: Execute
- Follow TDD principles
- Write tests first

#### Step 4: Verify
- Run all tests
- Check for regressions

### Checklist
- [ ] Requirements understood
- [ ] Tests written
- [ ] Implementation complete
- [ ] All tests passing
- [ ] Code reviewed
`;

    const fileContent = matter.stringify(content, frontmatter);
    await writeFile(filePath, fileContent);
    
    const skill: Skill = {
      name,
      description: frontmatter.description!,
      useWhen: frontmatter.useWhen!,
      category: frontmatter.category!,
      tags: frontmatter.tags!,
      content,
      filePath,
    };
    
    this.skillsCache.set(name, skill);
    
    return skill;
  }

  /**
   * Sync global skills to project directory
   */
  async syncSkillsToProject(): Promise<{ count: number; synced: string[] }> {
    const globalSkillsPath = paths.skills(paths.globalConfig());
    const projectSkillsPath = paths.skills(this.config.configPath);
    
    if (globalSkillsPath === projectSkillsPath) {
      return { count: 0, synced: [] };
    }
    
    // Check if global skills directory exists before trying to load
    let globalSkills: Skill[] = [];
    try {
      globalSkills = await this.loadSkillsFromDir(globalSkillsPath);
    } catch (error) {
      // Global skills directory doesn't exist or can't be read
      logger.warn('Global skills directory not found. Skipping sync.');
      return { count: 0, synced: [] };
    }
    
    if (globalSkills.length === 0) {
      logger.info('No global skills to sync.');
      return { count: 0, synced: [] };
    }
    
    await mkdir(projectSkillsPath, { recursive: true });
    
    const synced: string[] = [];
    
    for (const skill of globalSkills) {
      const fileName = `${skill.name.replace(/\s+/g, '-').toLowerCase()}.md`;
      const destPath = join(projectSkillsPath, fileName);
      const srcContent = await readFile(skill.filePath, 'utf-8');
      await writeFile(destPath, srcContent);
      synced.push(skill.name);
    }
    
    return { count: synced.length, synced };
  }

  /**
   * Format skill for agent consumption
   */
  formatForAgent(skill: Skill): string {
    return `# Skill: ${skill.name}

## When to Use
${skill.useWhen}

## Description
${skill.description}

## Workflow
${skill.content}

---
**IMPORTANT**: Follow this workflow step by step. Do not skip steps.
`;
  }

  /**
   * Load skills from a directory
   */
  private async loadSkillsFromDir(dir: string): Promise<Skill[]> {
    const files = await readdir(dir);
    const skills: Skill[] = [];
    
    for (const file of files) {
      if (extname(file) !== '.md') continue;
      
      const filePath = join(dir, file);
      const content = await readFile(filePath, 'utf-8');
      const { data, content: body } = matter(content);
      
      const frontmatter = data as SkillFrontmatter;
      const name = frontmatter.name || basename(file, '.md');
      
      skills.push({
        name,
        description: frontmatter.description || '',
        useWhen: frontmatter.useWhen || '',
        category: frontmatter.category || 'general',
        tags: frontmatter.tags || [],
        content: body.trim(),
        filePath,
      });
    }
    
    return skills;
  }
}
