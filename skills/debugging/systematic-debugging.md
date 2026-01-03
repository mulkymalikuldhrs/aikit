---
name: systematic-debugging
description: Use when debugging issues with a structured approach
useWhen: The user reports a bug, error, or unexpected behavior that needs investigation
category: debugging
tags:
  - debugging
  - troubleshooting
  - root-cause
---

# Systematic Debugging

## Overview
A 4-phase structured approach to finding and fixing bugs: Reproduce → Isolate → Identify → Verify.

## Workflow

### Phase 1: REPRODUCE
1. Get exact steps to reproduce the issue
2. Confirm you can reproduce it locally
3. Document the reproduction steps
4. Note the expected vs actual behavior

**Questions to ask:**
- What exactly happens?
- What should happen instead?
- When did this start occurring?
- Does it happen every time?

**Output:**
```markdown
## Bug Reproduction
Steps: [1, 2, 3...]
Expected: [what should happen]
Actual: [what happens]
Frequency: [always/sometimes/once]
```

### Phase 2: ISOLATE
1. Find the smallest reproduction case
2. Remove unrelated code/components
3. Identify the boundaries of the bug
4. Narrow down to specific file/function

**Techniques:**
- Binary search through code
- Comment out sections
- Add logging at key points
- Check git blame for recent changes

**Output:**
```markdown
## Isolation Results
Affected files: [list]
Affected functions: [list]
First bad commit: [if known]
Related dependencies: [if any]
```

### Phase 3: IDENTIFY Root Cause
1. Read the code carefully
2. Trace the data flow
3. Check assumptions
4. Identify the actual bug (not symptoms)

**Common causes:**
- Off-by-one errors
- Null/undefined handling
- Race conditions
- State management issues
- Type coercion bugs
- Edge cases

**Output:**
```markdown
## Root Cause
The bug is caused by: [explanation]
Location: [file:line]
Why it happens: [detailed explanation]
```

### Phase 4: VERIFY Fix
1. Write a test that fails due to the bug
2. Apply the fix
3. Confirm test passes
4. Check for regressions
5. Run full test suite

**Checklist:**
- [ ] Test reproduces the bug
- [ ] Fix is minimal and targeted
- [ ] Test passes after fix
- [ ] No regressions introduced
- [ ] All tests pass

## Anti-Patterns
- Making random changes hoping to fix it
- Fixing symptoms instead of root cause
- Not writing a test for the bug
- Changing multiple things at once
- Assuming you know the cause without investigating

## Verification
```bash
npm run test        # Bug test passes, no regressions
npm run typecheck   # No type errors
npm run lint        # No lint errors
```
