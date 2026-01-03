import { DefaultCommand } from './types';

/**
 * Quick Actions Commands
 */
export const QUICK_COMMANDS: DefaultCommand[] = [
  {
    name: 'fix',
    description: 'Quick fix for an issue',
    category: 'quick',
    usage: '/fix <issue description>',
    examples: ['/fix button not clickable', '/fix type error in auth.ts'],
    content: `Quick fix with minimal ceremony.

## Workflow

Issue description: $ARGUMENTS

1. Identify issue
2. Make minimal change to fix
3. Verify fix works
4. Run affected tests`,
  },
  {
    name: 'fix-types',
    description: 'Fix TypeScript type errors',
    category: 'quick',
    usage: '/fix-types [file]',
    examples: ['/fix-types', '/fix-types src/auth.ts'],
    content: `Fix TypeScript type errors systematically.

## Workflow

Optional file argument: $ARGUMENTS

1. Run \`npm run typecheck\`
2. Parse error output
3. Fix each error in dependency order
4. Verify all types pass`,
  },
  {
    name: 'fix-ci',
    description: 'Fix CI/CD pipeline failures',
    category: 'quick',
    usage: '/fix-ci',
    examples: ['/fix-ci'],
    content: `Diagnose and fix CI failures.

## Workflow
1. Check CI logs for errors
2. Reproduce locally if possible
3. Fix issues in order:
   - Type errors
   - Test failures
   - Lint errors
   - Build errors
4. Verify full CI pipeline locally`,
  },
  {
    name: 'commit',
    description: 'Create a well-formatted commit',
    category: 'quick',
    usage: '/commit [message]',
    examples: ['/commit', '/commit "feat: add login"'],
    content: `Create a conventional commit.

## Workflow

Optional commit message: $ARGUMENTS

1. Stage changes: \`git add -A\`
2. Generate commit message following conventional commits:
   - feat: New feature
   - fix: Bug fix
   - docs: Documentation
   - refactor: Code refactoring
   - test: Adding tests
   - chore: Maintenance
3. Commit with message`,
  },
  {
    name: 'pr',
    description: 'Create a pull request',
    category: 'quick',
    usage: '/pr [title]',
    examples: ['/pr', '/pr "Add user authentication"'],
    content: `Create a pull request with proper description.

## Workflow

Optional PR title: $ARGUMENTS

1. Push current branch
2. Generate PR description:
   - Summary of changes
   - Related issues
   - Testing done
   - Screenshots if UI changes
3. Create PR via GitHub CLI or provide URL`,
  },
  {
    name: 'refactor',
    description: 'Refactor code to improve structure without changing behavior',
    category: 'quick',
    usage: '/refactor [file or pattern]',
    examples: ['/refactor src/utils.ts', '/refactor duplicate code'],
    content: `Refactor code following best practices.

## Workflow

Optional file or pattern: $ARGUMENTS

1. Ensure tests are in place
2. Identify refactoring opportunities
3. Apply refactoring incrementally
4. Run tests after each change
5. Verify no behavior changes`,
  },
  {
    name: 'lint',
    description: 'Run linter and fix issues',
    category: 'quick',
    usage: '/lint [--fix]',
    examples: ['/lint', '/lint --fix'],
    content: `Run linter and optionally fix issues.

## Workflow

Optional flags: $ARGUMENTS

1. Run linter: \`npm run lint\`
2. Parse errors and warnings
3. If --fix flag, run auto-fix
4. Report remaining issues
5. Suggest manual fixes if needed`,
  },
];
