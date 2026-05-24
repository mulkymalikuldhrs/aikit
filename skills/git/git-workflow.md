---
name: git-workflow
description: Use when working with git branches, commits, and PRs
useWhen: The user asks to commit, create a branch, or manage git workflow
category: git
tags:
  - git
  - version-control
  - workflow
---

# Git Workflow

## Overview
Structured git workflow with conventional commits and proper branching.

## Workflow

### Branch Naming
```
feat/feature-name     # New feature
fix/bug-description   # Bug fix
refactor/what-why     # Code refactoring
docs/what-changed     # Documentation
test/what-testing     # Adding tests
chore/what-task       # Maintenance
```

### Creating a Branch
```bash
# Ensure clean state
git status

# Update main
git checkout main
git pull origin main

# Create and switch
git checkout -b feat/feature-name
```

### Making Commits
Use Conventional Commits format:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting (no code change)
- `refactor`: Code restructure
- `test`: Adding tests
- `chore`: Maintenance

**Examples:**
```bash
git commit -m "feat(auth): add login form validation"
git commit -m "fix(api): handle null response in user fetch"
git commit -m "docs(readme): update installation instructions"
git commit -m "refactor(utils): extract date formatting helpers"
```

### Commit Best Practices
1. **Atomic commits**: One logical change per commit
2. **Present tense**: "add feature" not "added feature"
3. **Imperative**: "fix bug" not "fixes bug"
4. **Under 50 chars**: For the subject line
5. **No period**: At end of subject

### Before Pushing
```bash
# Run quality checks
npm run typecheck
npm run test
npm run lint

# Verify branch is up to date
git fetch origin main
git rebase origin/main
```

### Creating a PR

**PR Title:**
Same format as commits: `type(scope): description`

**PR Description Template:**
```markdown
## Summary
Brief description of changes.

## Changes
- Change 1
- Change 2

## Related Issues
Closes #123

## Testing
- [ ] Unit tests added
- [ ] Manual testing done

## Screenshots (if UI)
[Add screenshots]

## Checklist
- [ ] Types pass
- [ ] Tests pass
- [ ] Lint passes
- [ ] Build passes
```

### Merging
```bash
# Squash merge for clean history
git checkout main
git pull origin main
git merge --squash feat/feature-name
git commit -m "feat(scope): summary of feature"
git push origin main

# Delete feature branch
git branch -d feat/feature-name
git push origin --delete feat/feature-name
```

## Handling Conflicts
```bash
# During rebase
git rebase origin/main

# If conflicts:
# 1. Resolve in files
# 2. Stage resolved files
git add .
# 3. Continue rebase
git rebase --continue
```

## Emergency Fixes
```bash
# For urgent production fixes
git checkout main
git checkout -b hotfix/critical-issue
# Make fix
git commit -m "fix(prod): critical issue description"
# Fast-track review and merge
```

## Anti-Patterns
- Huge commits with many changes
- Vague commit messages ("fix stuff")
- Not running tests before push
- Force pushing to shared branches
- Merging without review
- Large, unrelated commits
- Committing broken code
- Leaving conflict markers

## Branch Management

### Keeping Branches Short-Lived
1. Work in small, focused branches
2. Merge frequently to reduce conflicts
3. Delete branches after merging
4. Don't let branches linger for days

### Branch Lifecycle
```bash
# Create branch
git checkout -b feat/new-feature

# Work and commit
git add .
git commit -m "feat: add feature"

# Keep branch updated
git fetch origin main
git rebase origin/main

# Merge when ready
git checkout main
git merge feat/new-feature

# Delete branch
git branch -d feat/new-feature
```

## Commit Frequency

### When to Commit
1. **Feature complete**: After implementing a logical feature
2. **Bug fixed**: After fixing a bug
3. **Test passing**: After tests are green
4. **Logical unit**: After completing a logical unit of work

### Commit When
- [ ] Feature is complete and working
- [ ] Bug is fixed and tested
- [ ] Tests are passing
- [ ] Logical change is done
- [ ] Code is not broken

### Don't Commit When
- [ ] Code is broken
- [ ] Tests are failing
- [ ] Work is incomplete
- [ ] Code is in experimental state

## Git History Management

### Interactive Rebase
```bash
# Interactive rebase last 3 commits
git rebase -i HEAD~3

# Commands:
# pick - keep commit
# squash - merge with previous commit
# reword - edit commit message
# drop - remove commit
```

### Squash Related Commits
```bash
# Identify related commits
git log --oneline

# Interactive rebase to squash
git rebase -i HEAD~3

# Pick first, squash others:
# pick abc1234 initial implementation
# squash def5678 fix bug
# squash ghi8901 add tests

# Edit combined commit message
```

### Remove Unnecessary Commits
```bash
# Interactive rebase
git rebase -i HEAD~N

# Mark commits to drop
drop abc1234 WIP commit
drop def5676 debugging
```

## Best Practices

### Atomic Commits
- One logical change per commit
- Related changes together
- Unrelated changes separate
- Testable individually

### Clear Messages
- Describe what and why
- Use conventional commit format
- Keep subject under 50 chars
- Use imperative mood

### Clean History
- Easy to follow and understand
- Use squashing for related commits
- Remove WIP commits
- Keep main branch clean

### Regular Commits
- Commit often but logically
- Don't wait too long
- Don't commit broken code
- Small, focused commits

### Test Before Commit
- All tests passing
- No type errors
- No lint errors
- Code reviewed (if needed)

## Verification Checklist

Before completing git work:
- [ ] Commit messages are clear and follow conventions
- [ ] Commits are atomic (one logical change each)
- [ ] Branch names are meaningful
- [ ] No broken code committed
- [ ] All tests passing
- [ ] Type check passing
- [ ] Lint passing
- [ ] Branch is up to date with main
- [ ] Conflicts resolved (if any)
- [ ] History is clean (squashed WIP commits)
- [ ] Feature branch deleted after merge

---

> **Contact:** Mulky Malikul Dhaher — [mulkymalikuldhaher@email.com](mailto:mulkymalikuldhaher@email.com)
>
> **Disclaimer:** This project is for Education Purpose only. Risiko apapun tidak kita tanggung. (We are not responsible for any risks or damages.)
