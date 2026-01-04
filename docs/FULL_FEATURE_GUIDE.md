# AIKit - Hướng Dẫn Sử Dụng Đầy Đủ

## Mục Lục

1. [Cài Đặt và Thiết Lập](#cài-đặt-và-thiết-lập)
2. [23 Skills - Hướng Dẫn Chi Tiết](#23-skills)
3. [7 Agents - Cách Sử Dụng](#7-agents)
4. [27 Commands - Danh Sách Đầy Đủ](#27-commands)
5. [Custom Tools - Hướng Dẫn](#custom-tools)
6. [5 Plugins - Cấu Hình](#5-plugins)
7. [Configuration System](#configuration-system)
8. [Anti-Hallucination System](#anti-hallucination-system)
9. [Workflows và Best Practices](#workflows-và-best-practices)

---

## Cài Đặt và Thiết Lập

### Bước 1: Cài Đặt Dependencies

```bash
# Clone repository
git clone <repository-url>
cd aikit

# Cài đặt dependencies
npm install

# Build project
npm run build

# Link globally (optional)
npm link
```

### Bước 2: Khởi Tạo AIKit

```bash
# Khởi tạo global config (một lần)
aikit init --global

# Trong project của bạn
cd your-project
aikit init

# Khởi tạo Beads (optional nhưng recommended)
bd init

# Cài đặt vào OpenCode
aikit install
```

### Bước 3: Xác Minh Cài Đặt

```bash
# Kiểm tra status
aikit status

# Liệt kê tất cả skills
aikit skills list

# Liệt kê tất cả agents
aikit agents list

# Liệt kê tất cả commands
aikit commands list
```

---

## 23 Skills

Skills là các workflow bắt buộc mà AI agents phải tuân theo. Mỗi skill định nghĩa một quy trình làm việc có cấu trúc.

### Development Skills

#### 1. Test-Driven Development (TDD)
**Khi nào sử dụng**: Khi implement features, fix bugs, hoặc thêm functionality

**Cách sử dụng trong OpenCode**:
```
> use_skill("test-driven-development")
> Implement user authentication
```

**Workflow**:
1. RED: Viết test fail trước
2. GREEN: Viết code tối thiểu để pass test
3. REFACTOR: Clean up code

**CLI**:
```bash
aikit skills show test-driven-development
```

#### 2. Refactoring
**Khi nào sử dụng**: Khi cần cải thiện code structure mà không thay đổi behavior

**Cách sử dụng**:
```
> use_skill("refactoring")
> Refactor the authentication module
```

**Workflow**:
1. Đảm bảo có tests
2. Identify refactoring opportunities
3. Apply từng thay đổi nhỏ
4. Run tests sau mỗi thay đổi

#### 3. Error Handling
**Khi nào sử dụng**: Khi implement error handling hoặc exception handling

**Cách sử dụng**:
```
> use_skill("error-handling")
> Add error handling to API endpoints
```

#### 4. State Management
**Khi nào sử dụng**: Khi quản lý application state

**Cách sử dụng**:
```
> use_skill("state-management")
> Implement state management for user session
```

### Testing Skills

#### 5. Unit Testing
**Khi nào sử dụng**: Khi viết unit tests cho functions và components

**Cách sử dụng**:
```
> use_skill("unit-testing")
> Write unit tests for the auth service
```

#### 6. Integration Testing
**Khi nào sử dụng**: Khi test cách các components làm việc cùng nhau

**Cách sử dụng**:
```
> use_skill("integration-testing")
> Test API endpoint integration
```

### Design Skills

#### 7. API Design
**Khi nào sử dụng**: Khi thiết kế APIs, endpoints, hoặc interfaces

**Cách sử dụng**:
```
> use_skill("api-design")
> Design REST API for user management
```

#### 8. Component Design
**Khi nào sử dụng**: Khi thiết kế React/Vue components

**Cách sử dụng**:
```
> use_skill("component-design")
> Design reusable button component
```

#### 9. Database Design
**Khi nào sử dụng**: Khi thiết kế database schema

**Cách sử dụng**:
```
> use_skill("database-design")
> Design database schema for e-commerce
```

### UI/UX Skills

#### 10. Accessibility (a11y)
**Khi nào sử dụng**: Khi build accessible UI

**Cách sử dụng**:
```
> use_skill("accessibility")
> Make the login form accessible
```

#### 11. Frontend Aesthetics
**Khi nào sử dụng**: Khi cần guidelines về UI/UX

**Cách sử dụng**:
```
> use_skill("frontend-aesthetics")
> Improve the dashboard design
```

#### 12. Performance Optimization
**Khi nào sử dụng**: Khi optimize performance

**Cách sử dụng**:
```
> use_skill("performance-optimization")
> Optimize page load time
```

### Debugging Skills

#### 13. Systematic Debugging
**Khi nào sử dụng**: Khi debug issues với structured approach

**Cách sử dụng**:
```
> use_skill("systematic-debugging")
> Debug the authentication bug
```

**Workflow**:
1. REPRODUCE: Tái tạo bug
2. ISOLATE: Tìm smallest reproduction case
3. IDENTIFY: Tìm root cause
4. VERIFY: Verify fix

### Review Skills

#### 14. Code Review
**Khi nào sử dụng**: Khi review code quality, security, best practices

**Cách sử dụng**:
```
> use_skill("code-review")
> Review the pull request
```

#### 15. Security Audit
**Khi nào sử dụng**: Khi audit code cho security vulnerabilities

**Cách sử dụng**:
```
> use_skill("security-audit")
> Audit the authentication system
```

### Collaboration Skills

#### 16. Documentation
**Khi nào sử dụng**: Khi viết documentation

**Cách sử dụng**:
```
> use_skill("documentation")
> Document the API endpoints
```

#### 17. Git Best Practices
**Khi nào sử dụng**: Khi làm việc với Git

**Cách sử dụng**:
```
> use_skill("git-best-practices")
> Create a feature branch
```

#### 18. Git Workflow
**Khi nào sử dụng**: Khi cần workflow với Git

**Cách sử dụng**:
```
> use_skill("git-workflow")
> Set up Git workflow for the team
```

### Planning Skills

#### 19. Writing Plans
**Khi nào sử dụng**: Khi tạo implementation plans

**Cách sử dụng**:
```
> use_skill("writing-plans")
> Create plan for user authentication
```

#### 20. Design Measurement
**Khi nào sử dụng**: Khi đo lường và đánh giá design

**Cách sử dụng**:
```
> use_skill("design-measurement")
> Measure design system consistency
```

### Figma Skills

#### 21. Analyze Figma
**Khi nào sử dụng**: Khi phân tích Figma designs

**Cách sử dụng**:
```
> use_skill("analyze-figma")
> Analyze this Figma design: https://www.figma.com/design/...
```

**Cấu hình trước**:
```bash
aikit skills figma-analysis config
```

#### 22. Figma to Code
**Khi nào sử dụng**: Khi convert Figma design thành code

**Cách sử dụng**:
```
> use_skill("figma-to-code")
> Convert this Figma design to React components
```

### Meta Skills

#### 23. Using Superpowers
**Khi nào sử dụng**: Khi cần hiểu cách sử dụng skills system

**Cách sử dụng**:
```
> use_skill("using-superpowers")
> How do I use the skills system?
```

### Tìm và Sử Dụng Skills

**Trong OpenCode**:
```
> find_skills("test")
> use_skill("test-driven-development")
```

**CLI**:
```bash
# List all skills
aikit skills list

# Show skill details
aikit skills show test-driven-development

# Create custom skill
aikit skills create my-custom-skill
```

---

## 7 Agents

Agents là các AI personas chuyên biệt cho các tasks khác nhau. Agents tự động delegate cho nhau khi cần.

### 1. @planner - Strategic Planner
**Khi nào sử dụng**: Tasks phức tạp cần planning và coordination

**Cách sử dụng**:
```
> @planner Design authentication system
```

**Capabilities**:
- Break down complex tasks
- Coordinate between specialist agents
- Make architecture decisions
- Create implementation plans

**Delegates to**: @build, @scout, @review, @explore, @vision

### 2. @build - Primary Builder
**Khi nào sử dụng**: Implement features, write code, make changes

**Cách sử dụng**:
```
> @build Implement login form
```

**Capabilities**:
- Write production code
- Write tests
- Refactor code
- Fix bugs
- Implement features

**Delegates to**: @review, @explore

### 3. @rush - Quick Fixer
**Khi nào sử dụng**: Quick fixes, hotfixes, simple edits

**Cách sử dụng**:
```
> @rush Fix typo in header
```

**Capabilities**:
- Quick bug fixes
- Simple refactoring
- Minor changes
- Hotfixes

**Delegates to**: None (direct execution)

### 4. @review - Code Reviewer
**Khi nào sử dụng**: Review code quality, find bugs, security review

**Cách sử dụng**:
```
> @review Check for security issues
```

**Capabilities**:
- Code review
- Security audit
- Performance analysis
- Bug finding
- Best practices enforcement

**Delegates to**: None

### 5. @scout - External Researcher
**Khi nào sử dụng**: Research external libraries, GitHub patterns, frameworks

**Cách sử dụng**:
```
> @scout Research React Server Components
```

**Capabilities**:
- Web research
- GitHub code search
- Documentation lookup
- Framework exploration
- Best practices research

**Delegates to**: None

### 6. @explore - Codebase Navigator
**Khi nào sử dụng**: Find files, understand codebase structure

**Cách sử dụng**:
```
> @explore Find where authentication is handled
```

**Capabilities**:
- File discovery
- Pattern search
- Codebase navigation
- Structure analysis
- Dependency mapping

**Delegates to**: None

### 7. @vision - Visual Analyzer
**Khi nào sử dụng**: Analyze images, mockups, screenshots, PDFs, diagrams

**Cách sử dụng**:
```
> @vision Analyze this mockup image
```

**Capabilities**:
- Image analysis
- Mockup interpretation
- PDF extraction
- Diagram understanding
- UI/UX analysis

**Delegates to**: None

### Agent Delegation

Agents tự động delegate khi cần:

```
> @build Implement authentication
# @build tự động delegate cho @planner để plan
# Sau đó delegate cho @scout để research
# Cuối cùng implement với @build
```

**CLI**:
```bash
# List all agents
aikit agents list
```

---

## 27 Commands

Commands là shortcuts để trigger specific workflows. Sử dụng trong OpenCode prompt.

### Core Workflow Commands (Beads Integration)

#### /create - Tạo Task Mới
```bash
/ak_cm_create Add user authentication
/ak_cm_create Fix navigation bug
```

**Workflow**:
1. Tạo bead file với unique ID
2. Set status to "in-progress"
3. Initialize working notes

#### /plan - Tạo Implementation Plan
```bash
/ak_cm_plan user authentication system
/ak_cm_plan refactor database layer
```

**Workflow**:
1. UNDERSTAND: Clarify requirements
2. RESEARCH: Check existing patterns
3. BREAK DOWN: Create 2-5 minute sub-tasks
4. DOCUMENT: Write plan to memory/plans/

#### /implement - Implement với TDD
```bash
/ak_cm_implement task-001
/ak_cm_implement "add login form"
```

**Workflow**:
1. LOAD: Get task details
2. TEST: Write failing tests (RED)
3. IMPLEMENT: Write minimal code (GREEN)
4. REFACTOR: Clean up (REFACTOR)
5. VERIFY: Run full test suite

#### /finish - Complete Task với Quality Gates
```bash
/finish
/ak_cm_finish task-001
```

**Hard Gates** (tất cả phải pass):
1. `npm run typecheck` - No type errors
2. `npm run test` - All tests pass
3. `npm run lint` - No linting errors
4. `npm run build` - Build succeeds

#### /handoff - Tạo Handoff Bundle
```bash
/handoff
```

**Workflow**:
1. Summarize current progress
2. Document completed, remaining, blockers
3. Save to memory/handoffs/[timestamp].md

#### /resume - Resume từ Handoff
```bash
/resume
```

**Workflow**:
1. Load latest handoff
2. Display summary
3. Propose next actions
4. Continue from where left off

### Quick Action Commands

#### /fix - Quick Fix
```bash
/ak_cm_fix button not clickable
/ak_cm_fix type error in auth.ts
```

#### /fix-types - Fix TypeScript Errors
```bash
/fix-types
/ak_cm_fix-types src/auth.ts
```

#### /fix-ci - Fix CI/CD Failures
```bash
/fix-ci
```

#### /commit - Create Conventional Commit
```bash
/commit
/ak_cm_commit "feat: add login"
```

**Format**: `type(scope): subject`
- Types: feat, fix, docs, refactor, test, chore

#### /pr - Create Pull Request
```bash
/pr
/ak_cm_pr "Add user authentication"
```

#### /refactor - Refactor Code
```bash
/ak_cm_refactor src/utils.ts
/ak_cm_refactor duplicate code
```

#### /test - Run Tests
```bash
/test
/ak_cm_test auth
/ak_cm_test --watch
```

#### /lint - Run Linter
```bash
/lint
/ak_cm_lint --fix
```

### Research & Analysis Commands

#### /research - Deep Research
```bash
/ak_cm_research React Server Components
/ak_cm_research OAuth 2.0 best practices
```

**Output**: Findings saved to memory/research/

#### /analyze-project - Analyze Project Structure
```bash
/analyze-project
```

**Output**: Tech stack, architecture patterns, dependencies documented in AGENTS.md

#### /review-codebase - Review Codebase Quality
```bash
/review-codebase
/ak_cm_review-codebase src/
```

### Design & Planning Commands

#### /design - Design Feature or System
```bash
/ak_cm_design notification system
/ak_cm_design API gateway
```

#### /brainstorm - Brainstorm Ideas
```bash
/ak_cm_brainstorm user retention
/ak_cm_brainstorm performance optimization
```

#### /analyze-figma - Analyze Figma Design
```bash
/ak_cm_analyze-figma https://www.figma.com/design/...
```

**Cấu hình trước**:
```bash
aikit skills figma-analysis config
```

**Workflow**:
1. Extract URL from input
2. Call Figma API
3. Extract design tokens (colors, typography, spacing, components)
4. Save to memory/research/figma-analysis.md

### Git Commands

#### /branch - Create Feature Branch
```bash
/ak_cm_branch feat/auth
/ak_cm_branch fix/navigation-bug
```

**Naming conventions**:
- `feat/*` - Features
- `fix/*` - Bug fixes
- `refactor/*` - Refactoring
- `docs/*` - Documentation

#### /merge - Merge Branch
```bash
/merge
/ak_cm_merge main
```

### Utility Commands

#### /status - Show Status Overview
```bash
/status
```

**Shows**:
- Current task (from Beads)
- Git status
- Active branch
- Pending changes
- Test status
- Recent activity

#### /help - Show Help
```bash
/help
/ak_cm_help plan
```

#### /deploy - Deploy Application
```bash
/deploy
/ak_cm_deploy staging
/ak_cm_deploy production
```

#### /rollback - Rollback Deployment
```bash
/rollback
/ak_cm_rollback v1.2.3
```

#### /logs - View Application Logs
```bash
/logs
/ak_cm_logs --tail 100
/ak_cm_logs --follow
```

**CLI**:
```bash
# List all commands
aikit commands list
```

---

## Custom Tools

Tools là functions mà LLM có thể gọi trong conversation.

### Memory Tools

#### memory-read - Đọc từ Persistent Memory
**Cách sử dụng trong OpenCode**:
```
> memory-read("observations/project-patterns")
> memory-read("research/figma-analysis")
```

**CLI**:
```bash
aikit memory read observations/project-patterns
```

#### memory-update - Cập Nhật Persistent Memory
**Cách sử dụng trong OpenCode**:
```
> memory-update("observations/new-pattern", "Content here")
> memory-update("research/api-design", "Findings...", append=true)
```

**Append mode**: Tự động thêm timestamp

**CLI**:
```bash
aikit memory list
```

### Session Management Tools

#### list_session - Liệt Kê Previous Sessions
**Cách sử dụng trong OpenCode**:
```
> list_session(limit=10)
```

**Output**: Danh sách sessions với timestamps và summaries

#### read_session - Đọc Context từ Session
**Cách sử dụng trong OpenCode**:
```
> read_session("2024-01-15T10-30-00")
```

**Output**: Session summary, user tasks, file changes

**Workflow với /handoff và /resume**:
```
/ak_cm_handoff  # Tạo session handoff
# ... later ...
/ak_cm_resume   # Load latest session
# hoặc
> read_session("session-id")  # Load specific session
```

### Skill Tools

#### find_skills - Tìm Skills
**Cách sử dụng trong OpenCode**:
```
> find_skills("test")
> find_skills("debug")
```

#### use_skill - Sử Dụng Skill
**Cách sử dụng trong OpenCode**:
```
> use_skill("test-driven-development")
> use_skill("systematic-debugging")
```

### Figma Tools

#### read_figma_design - Đọc Figma Design
**Cách sử dụng trong OpenCode**:
```
> read_figma_design("https://www.figma.com/design/...")
```

**Cấu hình**:
```bash
aikit skills figma-analysis config
```

**Extracts**:
- Colors (hex codes)
- Typography (fonts, sizes, weights)
- Spacing system (8px grid)
- Components
- Screens/Frames
- Breakpoints

### Tạo Custom Tools

**Tạo tool mới**:
```bash
aikit tools create my-tool
```

**File structure** (`.aikit/tools/my-tool.ts`):
```typescript
import { defineTool } from 'aikit';

export default defineTool({
  name: 'my-tool',
  description: 'Does something useful',
  args: {
    input: {
      type: 'string',
      description: 'The input',
      required: true,
    },
  },
  async execute({ input }) {
    // Tool logic here
    return `Result for: ${input}`;
  },
});
```

**CLI**:
```bash
# List all tools
aikit tools list
```

---

## 5 Plugins

Plugins hook vào OpenCode event system để react to actions và customize behavior.

### 1. Enforcer Plugin
**Mục đích**: Cảnh báo khi session idle với incomplete TODO items

**Cách hoạt động**:
- Listen for `session.idle` events
- Check for remaining TODOs
- Warn user về abandoned work

**Enable/Disable**:
```bash
# Trong .aikit/aikit.json
{
  "plugins": {
    "enforcer": {
      "enabled": true
    }
  }
}
```

### 2. Compactor Plugin
**Mục đích**: Cảnh báo khi context usage đạt 70%, 85%, 95%

**Cách hoạt động**:
- Monitor context usage
- Warn at thresholds
- Prevent rushed work và context overflow

**Enable/Disable**: Tương tự Enforcer

### 3. Truncator Plugin
**Mục đích**: Tự động truncate large tool outputs

**Cách hoạt động**:
- Monitor tool output size
- Truncate outputs > 50KB
- Preserve context space

**Enable/Disable**: Tương tự Enforcer

### 4. Notification Plugin
**Mục đích**: OS notifications khi OpenCode hoàn thành session

**Cách hoạt động**:
- Listen for `session.idle` events
- Send OS notification với session summary
- Works on macOS, Linux, Windows

**Enable/Disable**: Tương tự Enforcer

**Notification sẽ hiển thị**:
- "OpenCode Session Complete"
- Session summary

### 5. Session Management Plugin
**Mục đích**: Cross-session context transfer

**Cách hoạt động**:
- Integrate với `/handoff` và `/resume` commands
- Provide `list_session` và `read_session` tools
- Keep sessions under 150k tokens

**Enable/Disable**: Tương tự Enforcer

### Tạo Custom Plugin

**Tạo plugin mới**:
```bash
aikit plugins create my-plugin
```

**File structure** (`.aikit/plugins/my-plugin.ts`):
```typescript
import { Plugin } from 'aikit';

export const MyPlugin: Plugin = async ({ project, config, emit }) => {
  return {
    event: async ({ event }) => {
      if (event.type === 'session.idle') {
        console.log('Session idle');
      }
    },
    'tool.execute.before': async (input) => {
      // Modify input before tool execution
      return input;
    },
    'tool.execute.after': async (input, output) => {
      // Modify output after tool execution
      return output;
    },
  };
};

export default MyPlugin;
```

**Available Events**:
- `session.idle` - Session completed
- `session.created` - New session started
- `session.error` - Session error occurred
- `tool.execute.before` - Before tool execution
- `tool.execute.after` - After tool execution
- `file.edited` - File was edited
- `file.watcher.updated` - File watcher updated
- `message.updated` - Message updated
- `message.removed` - Message removed

**CLI**:
```bash
# List all plugins
aikit plugins list
```

---

## Configuration System

### File Structure

```
your-project/
├── .aikit/
│   ├── aikit.json       # Project config
│   ├── AGENTS.md        # Project-specific agent rules
│   ├── skills/          # Project-specific skills
│   ├── commands/        # Custom commands
│   ├── tools/           # Custom tools
│   ├── plugins/         # Custom plugins
│   └── memory/          # Project memory
│       ├── observations/
│       ├── handoffs/
│       └── research/
├── .beads/              # Task tracking
├── spec.md              # Project constraints
└── review.md            # Code review notes
```

### Global Configuration

```
~/.config/aikit/         # or %APPDATA%/aikit on Windows
├── aikit.json           # Global config
├── AGENTS.md            # Global agent rules
├── skills/              # Global skills
├── commands/            # Global commands
├── tools/               # Global tools
├── plugins/             # Global plugins
└── memory/              # Global memory
```

### Config File (aikit.json)

```json
{
  "version": "0.1.0",
  "skills": {
    "enabled": true,
    "directory": "skills"
  },
  "agents": {
    "enabled": true,
    "default": "build"
  },
  "commands": {
    "enabled": true
  },
  "tools": {
    "enabled": true
  },
  "plugins": {
    "enabled": true,
    "autoload": ["enforcer", "compactor", "truncator"]
  },
  "memory": {
    "enabled": true,
    "maxSize": 1000000
  },
  "beads": {
    "enabled": true,
    "autoInit": false
  },
  "antiHallucination": {
    "enabled": true,
    "specFile": "spec.md",
    "reviewFile": "review.md"
  }
}
```

### AGENTS.md - Project Rules

Tạo file `.aikit/AGENTS.md` để định nghĩa project-specific rules:

```markdown
# Project Rules

## Build Commands
- `npm run build` - Build project
- `npm run test` - Run tests
- `npm run lint` - Run linting

## Code Style
- Use 2 spaces for indentation
- Use single quotes for strings
- Add trailing commas

## Naming Conventions
- Components: PascalCase
- Files: kebab-case
- Variables: camelCase
- Constants: SCREAMING_SNAKE_CASE

## Project-Specific Rules
- Always use TypeScript strict mode
- No `any` types allowed
- All functions must have JSDoc
```

**CLI**:
```bash
# Show config status
aikit status

# Initialize config
aikit init [--global]
```

---

## Anti-Hallucination System

Hệ thống 3 lớp để prevent AI từ inventing APIs và losing track of requirements.

### Layer 1: Task Validation

**Mục đích**: Validate task exists trước khi bắt đầu work

**Cách hoạt động**:
- Check `.beads/` directory
- Verify task exists và có status "in-progress"
- Reject work nếu không có task

**Sử dụng**:
```bash
# Tạo task trước
bd create "Add user authentication"

# Hoặc trong OpenCode
/ak_cm_create Add user authentication

# Sau đó implement
/implement
```

### Layer 2: Spec Enforcement

**Mục đích**: Enforce code follows `spec.md` constraints

**Tạo spec.md**:
```bash
aikit init-spec
```

**File spec.md**:
```markdown
# Project Specification

## Constraints

### Naming
- Components: PascalCase
- Files: kebab-case
- Variables: camelCase

### Forbidden
- No inline styles
- No `any` types
- No console.log in production code
- No hardcoded secrets

### Required
- JSDoc on all exported functions
- Input validation on API routes
- Error handling for async operations
```

**Cách hoạt động**:
- Check code against spec constraints
- Report violations
- Prevent forbidden patterns

### Layer 3: Review Gates

**Mục đích**: Document changes trong `review.md`

**Tự động tạo khi**:
- Task completed
- Code changes made
- Quality gates pass

**File review.md**:
```markdown
# Code Review

## What Changed
- Files Modified: src/auth.ts
- Functions Added: login(), logout()
- Tests Added: auth.test.ts

## What Was Skipped
- Feature X (out of scope)

## Verification
- [x] All tests pass
- [x] Type check passes
- [x] Linting passes
- [x] Build succeeds
```

### Verification Gates

**Hard gates** (tất cả phải pass):
1. Type check: `npm run typecheck`
2. Tests: `npm run test`
3. Lint: `npm run lint`
4. Build: `npm run build`

**Sử dụng**:
```bash
/ak_cm_finish  # Run all gates và create review
```

### Recovery Protocol

**Khi context bị mất**:
1. Check for handoff: `/resume`
2. Load previous session: `read_session("session-id")`
3. Continue from handoff

**CLI**:
```bash
# Initialize spec
aikit init-spec

# Check Beads status
aikit beads status
```

---

## Workflows và Best Practices

### Workflow 1: Feature Development

```bash
# 1. Tạo task
/ak_cm_create Add user authentication

# 2. Plan
/ak_cm_plan user authentication system

# 3. Implement với TDD
/implement

# 4. Finish với quality gates
/finish

# 5. Commit và PR
/commit
/ak_cm_pr "Add user authentication"
```

### Workflow 2: Bug Fixing

```bash
# 1. Quick fix
/ak_cm_fix button not clickable

# Hoặc systematic debugging
> use_skill("systematic-debugging")
> Debug the authentication bug
```

### Workflow 3: Code Review

```bash
# Review codebase
/review-codebase

# Hoặc use review skill
> use_skill("code-review")
> Review this pull request
```

### Workflow 4: Research và Design

```bash
# Research
/ak_cm_research React Server Components

# Design
/ak_cm_design notification system

# Analyze Figma
/ak_cm_analyze-figma https://www.figma.com/design/...
```

### Workflow 5: Multi-Session Work

```bash
# Session 1: Start work
/ak_cm_create Implement feature X
/ak_cm_plan feature X
/implement
/ak_cm_handoff  # Save progress

# Session 2: Continue
/ak_cm_resume  # Load handoff
/ak_cm_implement  # Continue
/finish
```

### Best Practices

1. **Luôn tạo task trước khi work**
   ```bash
   /create Task description
   ```

2. **Sử dụng TDD cho mọi implementation**
   ```bash
   > use_skill("test-driven-development")
   ```

3. **Plan trước khi implement**
   ```bash
   /plan Feature description
   ```

4. **Run quality gates trước khi finish**
   ```bash
   /finish  # Automatically runs gates
   ```

5. **Sử dụng handoff cho multi-session work**
   ```bash
   /handoff  # End of session
   /resume   # Start of next session
   ```

6. **Document findings trong memory**
   ```bash
   > memory-update("research/api-design", "Findings...")
   ```

7. **Sử dụng appropriate agents**
   ```bash
   @planner  # For complex planning
   @build    # For implementation
   @review   # For code review
   @scout    # For research
   ```

---

## Quick Reference

### CLI Commands

```bash
# Status
aikit status

# Skills
aikit skills list
aikit skills show <name>
aikit skills create <name>
aikit skills sync

# Agents
aikit agents list

# Commands
aikit commands list

# Tools
aikit tools list
aikit tools create <name>

# Plugins
aikit plugins list

# Memory
aikit memory list
aikit memory read <key>

# Beads
aikit beads status

# Config
aikit init [--global]
aikit install
```

### OpenCode Commands

```
# Core Workflow
/ak_cm_create <task>
/ak_cm_plan <feature>
/ak_cm_implement [task-id]
/ak_cm_finish [task-id]
/handoff
/resume

# Quick Actions
/ak_cm_fix <issue>
/ak_cm_fix-types [file]
/fix-ci
/ak_cm_commit [message]
/ak_cm_pr [title]
/ak_cm_refactor [file]
/ak_cm_test [pattern]
/ak_cm_lint [--fix]

# Research & Analysis
/ak_cm_research <topic>
/analyze-project
/ak_cm_review-codebase [path]

# Design & Planning
/ak_cm_design <feature>
/ak_cm_brainstorm <problem>
/ak_cm_analyze-figma <url>

# Git
/ak_cm_branch <name>
/ak_cm_merge [target]

# Utilities
/status
/ak_cm_help [command]
/ak_cm_deploy [environment]
/ak_cm_rollback [version]
/ak_cm_logs [--tail] [--follow]
```

### Tools trong OpenCode

```
> memory-read("key")
> memory-update("key", "content", append=true)
> list_session(limit=10)
> read_session("session-id")
> find_skills("query")
> use_skill("skill-name")
> read_figma_design("url")
```

### Agents trong OpenCode

```
> @planner <task>
> @build <task>
> @rush <task>
> @review <task>
> @scout <task>
> @explore <task>
> @vision <task>
```

---

## Troubleshooting

### Skills không load được
```bash
# Sync skills từ global
aikit skills sync

# Check skills directory
ls .aikit/skills/
```

### Commands không hiển thị trong OpenCode
```bash
# Reinstall vào OpenCode
aikit install

# Check OpenCode config
ls .opencode/command/
```

### Tools không hoạt động
```bash
# Check tool config
aikit skills list  # Shows tool status

# Configure tool
aikit skills figma-analysis config
```

### Plugins không chạy
```bash
# Check plugin status
aikit plugins list

# Verify plugin enabled trong config
cat .aikit/aikit.json
```

### Memory không persist
```bash
# Check memory directory
ls .aikit/memory/

# List memory entries
aikit memory list
```

---

## Examples

### Example 1: Implement Feature với TDD

```bash
# 1. Tạo task
/ak_cm_create Add user login

# 2. Plan
/ak_cm_plan user login feature

# 3. Implement với TDD skill
> use_skill("test-driven-development")
> Implement login form with email and password

# 4. Finish
/finish

# 5. Commit
/ak_cm_commit "feat: add user login"
```

### Example 2: Debug Bug

```bash
# Use systematic debugging skill
> use_skill("systematic-debugging")
> Debug: Login button not working

# Hoặc quick fix
/ak_cm_fix login button not working
```

### Example 3: Analyze Figma Design

```bash
# 1. Configure Figma tool (one time)
aikit skills figma-analysis config

# 2. Analyze design
/ak_cm_analyze-figma https://www.figma.com/design/abc123/My-Design

# 3. Design tokens saved to memory/research/figma-analysis.md
# 4. Use tokens để implement
> memory-read("research/figma-analysis")
> @build Implement design using extracted tokens
```

### Example 4: Multi-Session Workflow

**Session 1**:
```bash
/ak_cm_create Implement shopping cart
/ak_cm_plan shopping cart feature
/implement
# Work in progress...
/handoff
```

**Session 2**:
```bash
/ak_cm_resume  # Load handoff
# Continue work...
/implement
/finish
```

### Example 5: Code Review

```bash
# Review với skill
> use_skill("code-review")
> Review the authentication PR

# Hoặc command
/ak_cm_review-codebase src/auth/
```

---

## Advanced Usage

### Custom Skills

Tạo custom skill cho project-specific workflows:

```bash
aikit skills create my-workflow
```

Edit `.aikit/skills/my-workflow.md`:
```markdown
---
name: my-workflow
description: Custom workflow for my project
useWhen: When you need to do X
category: custom
tags:
  - custom
---

# My Workflow

## Workflow
1. Step 1
2. Step 2
3. Step 3
```

### Custom Tools

Tạo custom tool:

```bash
aikit tools create my-tool
```

Edit `.aikit/tools/my-tool.ts`:
```typescript
import { defineTool } from 'aikit';

export default defineTool({
  name: 'my-tool',
  description: 'Does something',
  args: {
    input: {
      type: 'string',
      description: 'Input',
      required: true,
    },
  },
  async execute({ input }) {
    return `Result: ${input}`;
  },
});
```

### Custom Plugins

Tạo custom plugin:

```bash
aikit plugins create my-plugin
```

Edit `.aikit/plugins/my-plugin.ts`:
```typescript
import { Plugin } from 'aikit';

export const MyPlugin: Plugin = async ({ project, config, emit }) => {
  return {
    event: async ({ event }) => {
      if (event.type === 'session.idle') {
        // Custom logic
      }
    },
  };
};

export default MyPlugin;
```

---

## Support

- **Documentation**: Xem `docs/` directory
- **Issues**: Report trên GitHub
- **Skills**: `aikit skills list`
- **Commands**: `aikit commands list`
- **Help**: `aikit --help` hoặc `/help` trong OpenCode

---

## Summary

AIKit cung cấp:

- ✅ **23 Skills** - Workflow enforcement
- ✅ **7 Agents** - Specialized AI personas
- ✅ **27 Commands** - Quick shortcuts
- ✅ **Custom Tools** - Extensible tool system
- ✅ **5 Plugins** - Event-driven plugins
- ✅ **Configuration** - Flexible config system
- ✅ **Anti-Hallucination** - 3-layer validation

Tất cả tính năng đã được test và verify. Sẵn sàng sử dụng!






