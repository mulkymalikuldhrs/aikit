# Contributing to AIKit

First off, thank you for considering contributing to AIKit! It's people like you that make AIKit such a great tool.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [What Can I Contribute?](#what-can-i-contribute)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)
- [Submitting PRs](#submitting-prs)
- [Reporting Issues](#reporting-issues)

---

## 🤝 Code of Conduct

By participating in this project, you agree to keep discussions and interactions respectful and inclusive. We're all here to build something great together.

---

## 💡 What Can I Contribute?

### Areas We Need Help With

- 🐛 **Bug Fixes** - Help us squash bugs!
- ✨ **New Features** - Have a great idea? We'd love to hear it!
- 📚 **Documentation** - Improve guides, fix typos, add examples
- 🧪 **Tests** - Increase test coverage
- 🎨 **Skills** - Create new AI skills
- 🔧 **Tools** - Build new tools or integrations
- 🌍 **Translations** - Help AIKit reach more developers

### Already Have an Idea?

Check out our [Good First Issues](https://github.com/tdsoft-technology/aikit/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) or [Help Wanted](https://github.com/tdsoft-technology/aikit/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22) tags!

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** or **yarn**
- **Git**

### Setup Development Environment

```bash
# 1. Fork the repository
# Click "Fork" button on https://github.com/tdsoft-technology/aikit

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/aikit.git
cd aikit

# 3. Install dependencies
npm install

# 4. Build the project
npm run build

# 5. Run tests (optional but recommended)
npm test
```

### Verify Your Setup

```bash
# Check if CLI works
npm start -- --help

# Run type checking
npm run typecheck

# Run linter
npm run lint
```

---

## 🔨 Development Workflow

### 1. Create a Branch

```bash
# From main branch
git checkout main
git pull upstream main

# Create your feature branch
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix-name
```

### Branch Naming Convention

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `test/` - Adding/updating tests
- `refactor/` - Code refactoring
- `chore/` - Maintenance tasks

### 2. Make Your Changes

```bash
# Make your changes
# ... edit files ...

# Watch for changes during development
npm run dev

# Test your changes
npm test
npm run typecheck
npm run lint
```

### 3. Commit Your Changes

See [Commit Messages](#commit-messages) for guidelines.

```bash
git add .
git commit -m "feat: add new skill for API design"
```

### 4. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 5. Create Pull Request

Go to https://github.com/tdsoft-technology/aikit and click "New Pull Request"

---

## 📐 Coding Standards

### TypeScript Guidelines

- Use **TypeScript** for all new code
- Provide **type annotations** for function parameters
- Avoid `any` type when possible
- Use **interfaces** for object shapes
- Add **JSDoc comments** for complex functions

**Example:**
```typescript
/**
 * Plans the implementation of a feature
 * @param feature - Description of the feature to implement
 * @returns Implementation plan with steps
 */
export async function planFeature(feature: string): Promise<Plan> {
  // implementation
}
```

### Code Style

We use ESLint for code quality. Run before committing:

```bash
npm run lint
npm run typecheck
```

### File Organization

```
src/
├── cli/           # CLI commands
├── core/          # Core functionality
├── tools/         # Tool implementations
├── utils/         # Utility functions
└── platform/      # Platform adapters
```

### Adding New Skills

1. Create skill file in `skills/`
2. Use markdown format
3. Include clear description
4. Add examples

**Example:**
```markdown
# API Design

Helps design RESTful APIs with best practices.

## Usage
/ak_sk_api-design

## What It Does
- Analyzes requirements
- Designs endpoints
- Creates data models
```

---

## 📝 Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks
- `perf` - Performance improvements

### Examples

**Good:**
```bash
feat(skills): add REST API design skill

Implements a new skill for designing RESTful APIs with:
- Endpoint planning
- Request/response schemas
- Error handling patterns

Closes #123
```

```bash
fix(cli): prevent crash when config file is missing

Added proper error handling and fallback to default config.

Fixes #456
```

**Bad:**
```bash
update stuff
fix bug
add feature
```

---

## 🎯 Submitting PRs

### Pull Request Checklist

Before submitting, make sure:

- [ ] Code builds successfully (`npm run build`)
- [ ] All tests pass (`npm test`)
- [ ] Type check passes (`npm run typecheck`)
- [ ] Linter passes (`npm run lint`)
- [ ] Added tests for new functionality
- [ ] Updated documentation if needed
- [ ] Commit messages follow conventions
- [ ] PR description clearly explains changes

### PR Template

When creating a PR, include:

```markdown
## Description
Brief description of what this PR does and why it's needed

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe how you tested your changes

## Screenshots (if applicable)
Add screenshots to help explain changes

## Related Issues
Fixes #123
Related to #456
```

### What Happens Next?

1. **Automated Checks** - CI/CD runs tests and linting
2. **Code Review** - Maintainers review your code
3. **Feedback** - We may request changes
4. **Approval** - Once approved, we'll merge your PR!

### Review Feedback

Don't be discouraged by review comments! They're meant to help improve the code. Ask questions if anything is unclear.

---

## 🐛 Reporting Issues

### Before Creating an Issue

- [ ] Check if issue already exists
- [ ] Search [existing issues](https://github.com/tdsoft-technology/aikit/issues)
- [ ] Read the [documentation](https://aikit.tdsoft.tech/docs/intro)

### Creating a Good Issue

#### Bug Reports

**Title:** Clear description of the bug

```markdown
## Description
Brief description of what's wrong

## Steps to Reproduce
1. Step one
2. Step two
3. Step three

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- Node.js version:
- OS:
- AIKit version:

## Additional Context
Logs, screenshots, etc.
```

#### Feature Requests

**Title:** Brief description of feature

```markdown
## Problem Statement
What problem does this solve?

## Proposed Solution
How should it work?

## Alternatives
What other approaches did you consider?

## Additional Context
Examples, mockups, etc.
```

---

## 🎖️ Recognition

Contributors will be:
- Listed in [CONTRIBUTORS.md](CONTRIBUTORS.md)
- Mentioned in release notes
- Invited to become maintainers (for consistent contributors)

---

## 📚 Additional Resources

- [Documentation](https://aikit.tdsoft.tech/docs/intro)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Project Roadmap](https://github.com/tdsoft-technology/aikit/milestones)
- [Discussions](https://github.com/tdsoft-technology/aikit/discussions)

---

## 🙏 Need Help?

- 📖 Read the [docs](https://aikit.tdsoft.tech/docs/intro)
- 💬 Join [Discussions](https://github.com/tdsoft-technology/aikit/discussions)
- 🐛 [Open an issue](https://github.com/tdsoft-technology/aikit/issues)
- ✉️ Email: dev@tdsoft.tech

---

**Happy Contributing! 🚀**

Made with ❤️ by the AIKit community
