---
name: using-superpowers
description: First-response protocol for AIKit - find and use skills
useWhen: Starting any new task or conversation
category: meta
tags:
  - meta
  - skills
  - workflow
---

# Using Superpowers (AIKit Skills)

## Overview
This is the mandatory first-response protocol. Always check for relevant skills before starting work.

## Workflow

### Step 1: Identify Task Type
Categorize the user's request:
- **Planning**: design, plan, architect, brainstorm
- **Development**: implement, build, add, create, code
- **Debugging**: fix, debug, investigate, troubleshoot
- **Testing**: test, verify, validate
- **Review**: review, audit, check
- **Research**: research, explore, find, learn

### Step 2: Find Relevant Skills
Call the `find_skills` tool with a relevant query:

```
find_skills(query: "task type keywords")
```

Example queries:
- "test driven development"
- "debugging"
- "code review"
- "planning"
- "frontend ui"

### Step 3: Load Appropriate Skill
Call `use_skill` with the skill name:

```
use_skill(name: "skill-name")
```

### Step 4: Follow Skill Workflow
**MANDATORY**: Follow the skill's workflow step by step.

- Do not skip steps
- Do not modify the workflow
- Complete each step before moving to the next
- Check off items as you complete them

### Step 5: Verify Completion
At the end, verify:
- [ ] All skill steps completed
- [ ] Quality gates passed
- [ ] User's original request satisfied

## Available Skills

### Planning & Design
- `writing-plans` - Create detailed implementation plans
- `brainstorming` - Generate and evaluate ideas

### Development
- `test-driven-development` - RED-GREEN-REFACTOR cycle
- `executing-plans` - Execute plans step by step

### Debugging
- `systematic-debugging` - Reproduce → Isolate → Identify → Verify

### Review
- `code-review` - Comprehensive code review

### Meta
- `using-superpowers` - This skill (first-response protocol)

## When No Skill Applies
If no skill matches:
1. Apply general best practices
2. Follow TDD principles
3. Document your approach
4. Verify your work

## Anti-Patterns
- Skipping skill lookup
- Partially following skills
- Ignoring skill verification steps
- Using wrong skill for task type

---

> **Contact:** Mulky Malikul Dhaher — [mulkymalikuldhaher@email.com](mailto:mulkymalikuldhaher@email.com)
>
> **Disclaimer:** This project is for Education Purpose only. Risiko apapun tidak kita tanggung. (We are not responsible for any risks or damages.)
