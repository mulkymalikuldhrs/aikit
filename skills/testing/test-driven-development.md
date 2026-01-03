---
name: test-driven-development
description: Use when implementing features with TDD approach
useWhen: The user asks to implement a feature, fix a bug, or add functionality
category: testing
tags:
  - tdd
  - testing
  - implementation
---

# Test-Driven Development (TDD)

## Overview
This skill enforces the RED-GREEN-REFACTOR cycle for all code changes.

## Workflow

### Step 1: RED - Write Failing Test
1. Understand the requirement clearly
2. Write a test that describes the expected behavior
3. Run the test - confirm it FAILS
4. If test passes without code, the test is wrong

**Checklist:**
- [ ] Test describes expected behavior
- [ ] Test is minimal and focused
- [ ] Test fails for the right reason

### Step 2: GREEN - Make It Pass
1. Write the MINIMUM code to pass the test
2. Don't add extra functionality
3. Don't optimize yet
4. Run the test - confirm it PASSES

**Checklist:**
- [ ] Only code needed to pass is written
- [ ] Test now passes
- [ ] No other tests broken

### Step 3: REFACTOR - Clean Up
1. Remove duplication
2. Improve naming
3. Simplify logic
4. Run tests after each change

**Checklist:**
- [ ] Code is clean and readable
- [ ] No duplication
- [ ] All tests still pass

## Anti-Patterns to Avoid
- Writing code before tests
- Writing multiple tests before implementing
- Over-engineering the first implementation
- Skipping the refactor step
- Testing implementation details instead of behavior

## Verification
Before marking complete:
```bash
npm run test        # All tests pass
npm run typecheck   # No type errors
npm run lint        # No lint errors
```
