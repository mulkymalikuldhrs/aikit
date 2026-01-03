---
name: code-review
description: Use when reviewing code for quality, security, and best practices
useWhen: The user asks to review code, check for issues, or audit code quality
category: review
tags:
  - review
  - quality
  - security
---

# Code Review

## Overview
Systematic code review focusing on correctness, security, performance, and maintainability.

## Workflow

### Step 1: Understand Context
1. What is this code supposed to do?
2. What feature/bug is it addressing?
3. Who wrote it and when?
4. Are there related tests?

### Step 2: Review for Correctness
Check:
- [ ] Logic is correct
- [ ] Edge cases handled
- [ ] Error handling is appropriate
- [ ] Return types are correct
- [ ] No off-by-one errors
- [ ] Null/undefined handled properly

**Red flags:**
- Unchecked array access
- Missing null checks
- Incorrect boolean logic
- Silent error swallowing

### Step 3: Review for Security
Check:
- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities
- [ ] Input is validated
- [ ] Secrets not hardcoded
- [ ] Authentication checks in place
- [ ] Authorization properly enforced

**Red flags:**
- `eval()` usage
- Unescaped user input
- Hardcoded credentials
- Missing auth checks
- Overly permissive CORS

### Step 4: Review for Performance
Check:
- [ ] No N+1 queries
- [ ] Appropriate caching
- [ ] No memory leaks
- [ ] Efficient algorithms
- [ ] No unnecessary re-renders (React)

**Red flags:**
- Loops inside loops
- Large objects in memory
- Synchronous blocking operations
- Missing pagination

### Step 5: Review for Maintainability
Check:
- [ ] Clear naming
- [ ] Small, focused functions
- [ ] Appropriate comments
- [ ] Follows project conventions
- [ ] DRY (Don't Repeat Yourself)
- [ ] SOLID principles

**Red flags:**
- Functions over 50 lines
- Cryptic variable names
- Copy-pasted code
- Magic numbers
- Deep nesting

### Step 6: Document Findings

**Format:**
```markdown
## Code Review Summary

### Critical Issues 🔴
1. [Issue] - [File:Line] - [Explanation]

### Warnings ⚠️
1. [Issue] - [File:Line] - [Explanation]

### Suggestions 💡
1. [Suggestion] - [File:Line] - [Explanation]

### Positive Notes ✅
1. [What was done well]

### Recommended Actions
1. [Action item]
```

## Severity Levels
- **Critical 🔴**: Must fix before merge (security, data loss, crashes)
- **Warning ⚠️**: Should fix (bugs, performance, maintainability)
- **Suggestion 💡**: Nice to have (style, minor improvements)

## Anti-Patterns in Reviewing
- Nitpicking style when there are real issues
- Being overly harsh or personal
- Only pointing out problems (acknowledge good work)
- Not explaining why something is an issue
- Suggesting rewrites when small fixes work
