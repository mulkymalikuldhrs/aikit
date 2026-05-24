---
name: writing-plans
description: Use when creating detailed implementation plans before coding
useWhen: The user asks to plan a feature, design a solution, or before starting complex work
category: meta
tags:
  - planning
  - design
  - architecture
---

# Writing Implementation Plans

## Overview
Create detailed, actionable plans before implementation. Good plans have 2-5 minute tasks with exact file paths.

## Workflow

### Step 1: Understand Requirements
Use Socratic questioning to clarify:

1. **What** - What exactly needs to be built?
2. **Why** - What problem does this solve?
3. **Who** - Who will use this?
4. **When** - What are the constraints/deadlines?
5. **How** - Any technical constraints?

**Output:**
```markdown
## Requirements
- [Requirement 1]
- [Requirement 2]
- [Constraint 1]
- [Constraint 2]
```

### Step 2: Research Existing Patterns
1. Search codebase for similar implementations
2. Check how related features work
3. Identify reusable components
4. Note dependencies

**Commands:**
```bash
# Find similar patterns
grep -r "pattern" src/
# Check existing implementations
find src -name "*.ts" | xargs grep "related"
```

### Step 3: Break Down into Tasks
Each task should be:
- Completable in 2-5 minutes
- Have an exact file path
- Have clear verification criteria
- Be independently testable

**Task format:**
```markdown
### Task 1: [Title]
- **File**: `src/path/to/file.ts`
- **Action**: [Create/Modify/Delete]
- **Changes**: [Description of changes]
- **Verify**: [How to verify it works]
- **Time**: [2-5 min]
```

### Step 4: Order Tasks by Dependencies
1. Group related tasks
2. Identify dependencies between tasks
3. Order so dependencies come first
4. Mark parallel tasks that can be done together

### Step 5: Document the Plan
Create a plan file with all details:

```markdown
# Plan: [Feature Name]

## Overview
[Brief description of what we're building]

## Requirements
- [List of requirements]

## Architecture
[High-level architecture description]

## Tasks

### Phase 1: Setup
1. [ ] Task 1 - src/file.ts (5 min)
2. [ ] Task 2 - src/other.ts (3 min)

### Phase 2: Implementation
3. [ ] Task 3 - src/feature.ts (5 min)
4. [ ] Task 4 - src/feature.test.ts (4 min)

### Phase 3: Integration
5. [ ] Task 5 - src/index.ts (2 min)

## Risks
- [Risk 1]: [Mitigation]
- [Risk 2]: [Mitigation]

## Verification
- [ ] All tests pass
- [ ] Feature works end-to-end
- [ ] No regressions
```

## Anti-Patterns
- Tasks longer than 10 minutes
- Vague task descriptions
- No file paths specified
- No verification criteria
- Not considering dependencies

## Checklist
- [ ] Requirements are clear and complete
- [ ] Existing patterns researched
- [ ] Tasks are 2-5 minutes each
- [ ] All tasks have file paths
- [ ] Dependencies are ordered correctly
- [ ] Risks identified

---

> **Contact:** Mulky Malikul Dhaher — [mulkymalikuldhaher@email.com](mailto:mulkymalikuldhaher@email.com)
>
> **Disclaimer:** This project is for Education Purpose only. Risiko apapun tidak kita tanggung. (We are not responsible for any risks or damages.)
