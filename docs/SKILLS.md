# AIKit Skills Guide

Skills are mandatory workflow instructions that AI agents must follow step by step. They enforce structured processes like TDD, systematic debugging, etc.

## Available Skills

### Development (6 skills)

#### 1. API Design (`api-design`)
**When to use**: When designing APIs, endpoints, or interfaces
**Category**: development

#### 2. Component Design (`component-design`)
**When to use**: When designing React/Vue components or UI components
**Category**: development

#### 3. Error Handling (`error-handling`)
**When to use**: When implementing error handling, exception handling, or error recovery
**Category**: development

#### 4. Performance Optimization (`performance-optimization`)
**When to use**: When optimizing application performance, reducing load times, or improving responsiveness
**Category**: development

#### 5. Refactoring (`refactoring`)
**When to use**: When refactoring code to improve structure without changing behavior
**Category**: development

#### 6. State Management (`state-management`)
**When to use**: When managing application state, choosing state management approach, or implementing state
**Category**: development

### Design (4 skills)

#### 7. Accessibility (`accessibility`)
**When to use**: When building accessible UI that works for all users
**Category**: design

#### 8. Design Measurement (`design-measurement`)
**When to use**: When measuring and validating design implementations
**Category**: design

#### 9. Database Design (`database-design`)
**When to use**: When designing database schema, relationships, or data models
**Category**: design

#### 10. Frontend Aesthetics (`frontend-aesthetics`)
**When to use**: When building UI components to ensure visual quality
**Category**: design

### Testing (3 skills)

#### 11. Test-Driven Development (`test-driven-development`)
**When to use**: When implementing features with TDD approach
**Category**: testing

**Workflow**:
1. RED: Write failing test first
2. GREEN: Write minimal code to pass test
3. REFACTOR: Refactor code while keeping tests green
4. Repeat for next requirement

**Use**: `/ak_sk_test-driven-development`

#### 16. Systematic Debugging (`systematic-debugging`)
**When to use**: When debugging issues with a structured approach
**Category**: debugging

**Workflow**:
1. Reproduce issue
2. Gather evidence (logs, stack traces)
3. Form hypothesis
4. Test hypothesis
5. Implement fix
6. Verify fix works
7. Add regression test

**Use**: `/ak_sk_systematic-debugging`

#### 17. Code Review (`code-review`)
**When to use**: When reviewing code for quality, security, and best practices
**Category**: review

**Checklist**:
- Code correctness and logic
- Security vulnerabilities
- Performance issues
- Maintainability
- Test coverage
- Documentation
- Style consistency

**Use**: `/ak_sk_code-review`

#### 19. Git Workflow (`git-workflow`)
**When to use**: When working with git branches, commits, and PRs
**Category**: git

**Best Practices**:
- Branch naming conventions
- Commit message format
- PR descriptions
- Code review process
- Merge strategies
- Atomic commits
- Clean history

**Use**: `/ak_sk_git-workflow`

#### 21. Writing Plans (`writing-plans`)
**When to use**: When creating detailed implementation plans before coding
**Category**: meta

**Workflow**:
1. Requirements analysis
2. Architecture decisions
3. Implementation steps
4. Dependencies and risks
5. Testing strategy
6. Estimated timeline

**Use**: `/ak_sk_writing-plans`

#### 22. Using Superpowers (`using-superpowers`)
**When to use**: When using advanced AI capabilities
**Category**: meta

**Use**: `/using-superpowers`

## Creating Custom Skills

### Step 1: Create Skill File

```bash
aikit skills create my-custom-skill
```

This will create file `.aikit/skills/my-custom-skill.md`

### Step 2: Edit Skill Content

```markdown
---
name: my-custom-skill
description: Use when you need to do X
useWhen: The user asks you to do X
category: custom
tags:
  - custom
---

# My Custom Skill

## Overview
Describe what this skill does.

## Workflow

### Step 1: Understand the Task
- Gather context
- Clarify requirements

### Step 2: Plan the Approach
- Break down into sub-tasks
- Identify dependencies

### Step 3: Execute
- Follow TDD principles
- Write tests first

### Step 4: Verify
- Run all tests
- Check for regressions

### Checklist
- [ ] Requirements understood
- [ ] Tests written
- [ ] Implementation complete
- [ ] All tests passing
- [ ] Code reviewed
```

### Step 3: Install to OpenCode

```bash
aikit install
```

New skill will automatically have command `/ak_sk_my-custom-skill` in OpenCode.

## Skill Structure

Each skill file contains:

1. **Frontmatter** (YAML):
   - `name`: Name of the skill
   - `description`: Short description
   - `useWhen`: When to use this skill
   - `category`: Category (general, custom, etc.)
   - `tags`: Tags for searching

2. **Content** (Markdown):
   - Workflow steps
   - Guidelines
   - Checklists
   - Examples

## Finding Skills

### In OpenCode

```
> find_skills("debugging")
> use_skill("systematic-debugging")
# Or use directly with prefix:
/ak_sk_systematic-debugging
```

### In CLI

```bash
# List all skills
aikit skills list

# Show skill details
aikit skills show test-driven-development

# Search skills
aikit skills list | grep debug
```

## Best Practices

1. **Be Specific**: Skills should have clear, step-by-step workflows
2. **Include Checklists**: Help agents verify completion
3. **Use Examples**: Provide code examples when possible
4. **Update Regularly**: Update skills based on feedback
5. **Test Skills**: Verify skills work with actual tasks

## Global vs Project Skills

- **Global Skills**: Stored in `~/.config/aikit/skills/` (or `%APPDATA%/aikit/skills/`)
- **Project Skills**: Stored in `.aikit/skills/`
- **Project skills override global skills** with the same name

### Sync Global Skills to Project

```bash
aikit skills sync
```

## Skill Categories

- `development`: Development workflows (API, components, error handling, performance, refactoring, state)
- `design`: Design-related skills (accessibility, measurement, database, frontend aesthetics)
- `testing`: Testing-related skills (TDD, unit testing, integration testing)
- `figma`: Figma-specific skills (analyze, to-code)
- `debugging`: Debugging skills (systematic debugging)
- `review`: Code review skills (code review, security audit)
- `git`: Git workflows (workflow)
- `documentation`: Documentation skills
- `meta`: Meta skills (writing plans, using superpowers)
