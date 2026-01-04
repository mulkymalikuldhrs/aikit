# AIKit - What It Is & What It Does

## Overview

AIKit is an **Open-source AI coding agent toolkit** that extends OpenCode's capabilities with structured workflows, specialized agents, and integrated tools. It transforms OpenCode from a general-purpose coding assistant into a structured development environment with task tracking, quality enforcement, and cross-session continuity.

## Core Purpose

AIKit solves these problems in OpenCode:

1. **Lack of structured workflows** - OpenCode has agents but no enforced processes
2. **No task tracking** - Work happens without tracking what needs to be done
3. **No quality gates** - Code changes aren't automatically validated
4. **Lost context between sessions** - Previous work gets forgotten
5. **Inconsistent processes** - Different approaches for similar tasks
6. **No persistent memory** - Learnings aren't saved for future use

## What AIKit Provides

### 1. Skills System (23 Built-in Skills)

**What it does:** Enforces structured workflows for common development tasks.

**Built-in skills by category:**

- **Development:** test-driven-development, refactoring, error-handling, state-management
- **Testing:** unit-testing, integration-testing
- **Design:** api-design, component-design, database-design
- **UI/UX:** accessibility, frontend-aesthetics, performance-optimization
- **Debugging:** systematic-debugging
- **Review:** code-review, security-audit
- **Collaboration:** documentation, git-workflow, writing-plans
- **Meta:** using-superpowers, design-measurement
- **Figma:** analyze-figma, figma-to-code

**How it works in OpenCode:**
```
> use_skill("test-driven-development")
> Implement user authentication
# Agent now follows TDD workflow: RED → GREEN → REFACTOR
```

**Why this matters:**
- Ensures consistent processes across tasks
- Prevents skipping important steps
- Embeds best practices into AI behavior
- Reduces AI hallucination by providing structured guidance

### 2. Specialized Agents (8 Agent Types)

**What it does:** Provides AI personas optimized for different types of work.

**Agent types:**

- **@planner** - Strategic planning and multi-agent coordination
- **@build** - Primary execution agent for implementing features
- **@rush** - Fast execution for quick fixes
- **@review** - Code review, security audits, debugging
- **@scout** - External research (docs, GitHub, frameworks)
- **@explore** - Fast codebase navigation and pattern search
- **@vision** - Multimodal analysis (mockups, PDFs, diagrams)
- **@one-shot** - End-to-end autonomous task execution

**How delegation works:**
```
> @planner Design authentication system
# @planner delegates to @scout to research patterns
# Then delegates to @build to implement
# Finally delegates to @review to verify
```

**Why this matters:**
- Right agent for the right task
- Automatic delegation when needed
- Specialized system prompts for each agent type
- Better quality through focused expertise

### 3. Slash Commands (27+ Commands)

**What it does:** Provides shortcuts for common workflows.

**Core workflow commands:**

- `/create <task>` - Create Beads task for tracking
- `/plan <feature>` - Create detailed implementation plan
- `/implement <task>` - Implement with TDD workflow
- `/finish <task>` - Complete with quality gates (typecheck, test, lint, build)
- `/handoff` - Create session handoff
- `/resume` - Resume from handoff

**Quick action commands:**
- `/fix <issue>` - Quick fixes
- `/fix-types [file]` - Fix TypeScript errors
- `/fix-ci` - Fix CI failures
- `/commit [message]` - Create conventional commits
- `/pr [title]` - Create pull request
- `/refactor [file]` - Refactor code
- `/test [pattern]` - Run tests
- `/lint [--fix]` - Run linter

**Research & analysis:**
- `/research <topic>` - Deep research
- `/analyze-project` - Analyze project structure
- `/review-codebase [path]` - Review code quality
- `/design <feature>` - Design features
- `/brainstorm <problem>` - Brainstorm ideas
- `/analyze-figma <url>` - Analyze Figma designs

**Git utilities:**
- `/branch <name>` - Create feature branch
- `/merge [target]` - Merge branch
- `/status` - Show status overview

**Why this matters:**
- Consistent workflows across projects
- One-command execution for complex tasks
- Enforced processes (e.g., quality gates in `/finish`)
- Reduces manual work and context switching

### 4. Built-in Tools

**What it does:** Provides reusable tools that agents can call.

**Memory tools:**
- `memory-read("key")` - Read from persistent memory
- `memory-update("key", "content")` - Update memory (append or overwrite)

**Session management:**
- `list_session(limit=10)` - List previous sessions
- `read_session("session-id")` - Load session context

**Skill tools:**
- `find_skills("query")` - Find available skills
- `use_skill("skill-name")` - Load and use skill

**Figma tools:**
- `read_figma_design("url")` - Extract design tokens (colors, typography, spacing, components)
- `develop_figma_screen(figmaUrl, screenId)` - Smart workflow: check code, download assets, plan, develop

**Beads (task tracking) tools:**
- `bead-create(title, description)` - Create new task
- `bead-update-status(id, status)` - Update task status
- `bead-complete(id)` - Complete with quality gates
- `bead-list([filter])` - List all tasks
- `bead-update-type(id, type)` - Update task type

**Custom tools:**
- `websearch(query, numResults)` - Web search (requires configuration)
- `codesearch(query, language)` - GitHub code search (requires configuration)

**Why this matters:**
- Persistent memory across sessions
- Cross-session context transfer
- Integrated Figma design analysis
- Task tracking with quality enforcement
- Extensible - create custom tools

### 5. Plugins System (5 Built-in Plugins)

**What it does:** Hooks into OpenCode events to provide automatic behaviors.

**Built-in plugins:**

- **Enforcer** - Warns when session ends with incomplete TODOs
- **Compactor** - Warns at 70%/85%/95% context usage
- **Truncator** - Auto-truncates large tool outputs (>50KB)
- **Notification** - OS notifications on session completion
- **Session Management** - Cross-session context transfer

**How plugins work:**
```typescript
// Hooks into events:
- session.idle - Session completed
- session.created - New session started
- session.error - Session error occurred
- tool.execute.before - Before tool execution
- tool.execute.after - After tool execution
- file.edited - File was edited
- message.updated - Message updated
```

**Why this matters:**
- Prevents abandoned work
- Manages context limits
- Provides notifications
- Enables custom behaviors

### 6. Beads Integration

**What it does:** Task tracking system integrated with AI workflows.

**Features:**

- Task creation and tracking
- Status management (todo, in-progress, completed, blocked)
- Task types (feature, pattern, decision, knowledge)
- Quality gates on completion
- Git integration (bd sync)

**How it works:**
```
/ak_cm_create Add user authentication
# Creates bead in .beads/ directory
/implement
# Updates bead status to in-progress
/finish
# Runs quality gates, completes bead
```

**Why this matters:**
- Tracks all work in one place
- Prevents lost tasks
- Enforces completion criteria
- Git-based tracking

### 7. Anti-Hallucination System (3 Layers)

**What it does:** Prevents AI from inventing APIs and losing track of requirements.

**Layer 1: Task Validation**
- Validates task exists before starting work
- Checks `.beads/` directory
- Requires "in-progress" status

**Layer 2: Spec Enforcement**
- Enforces code follows `spec.md` constraints
- Defines naming conventions
- Lists forbidden patterns
- Specifies required practices

**Layer 3: Review Gates**
- Documents changes in `review.md`
- Records what changed
- Records what was skipped
- Lists verification steps

**Quality Gates (hard requirements):**
1. `npm run typecheck` - No type errors
2. `npm run test` - All tests pass
3. `npm run lint` - No linting errors
4. `npm run build` - Build succeeds

**Why this matters:**
- Reduces AI errors
- Enforces project standards
- Prevents work on undefined tasks
- Ensures quality before completion

### 8. Persistent Memory System

**What it does:** Stores learnings, handoffs, and research for future sessions.

**Memory types:**

- **observations/** - Project patterns and learnings
- **handoffs/** - Session continuity bundles
- **research/** - Research findings
- **_templates/** - Memory templates

**How it works:**
```bash
# Save learning
> memory-update("observations/authentication-pattern", "Always use JWT with refresh tokens")

# Save research
> memory-update("research/figma-analysis", "# Design tokens...")

# Create handoff
/handoff
# Saves to memory/handoffs/[timestamp].md

# Resume later
/resume
# Loads latest handoff
```

**Why this matters:**
- Learnings persist across sessions
- Research findings are preserved
- Context transfer between sessions
- Collective intelligence over time

### 9. Figma Integration

**What it does:** Extracts design tokens and automates screen development.

**Features:**

- Extract design tokens (colors, typography, spacing, components)
- Analyze structure hierarchy
- Download assets automatically
- Compare with existing code
- Generate development plans

**Workflow:**
```
1. /analyze-figma https://www.figma.com/design/...
   # Extracts design tokens, saves to memory

2. User confirms screen to develop

3. develop_figma_screen(figmaUrl, screenId)
   # Checks current code
   # Downloads assets
   # Generates plan
   # Uses downloaded assets (not placeholders)
```

**Why this matters:**
- Pixel-perfect implementation
- Automated asset management
- Design consistency
- Faster development

### 10. Configuration System

**What it does:** Flexible configuration at global and project levels.

**Config file structure (.aikit/aikit.json):**
```json
{
  "version": "0.1.0",
  "skills": { "enabled": true },
  "agents": { "default": "build" },
  "commands": { "enabled": true },
  "tools": { "enabled": true },
  "plugins": { "enabled": true },
  "memory": { "enabled": true },
  "beads": { "enabled": true },
  "antiHallucination": {
    "enabled": true,
    "specFile": "spec.md",
    "reviewFile": "review.md"
  }
}
```

**Project rules (.aikit/AGENTS.md):**
- Build commands
- Code style
- Naming conventions
- Project-specific rules

**Why this matters:**
- Global vs project-level configs
- Project-specific behaviors
- Customizable per team
- Extensible

### 11. One-Shot Mode (Beta)

**What it does:** End-to-end autonomous task execution.

**Features:**

- Interactive requirements gathering
- Automatic complexity analysis
- Dynamic agent selection
- Parallel task execution
- Multi-level verification
- Auto-recovery from failures
- Completion proof generation

**Workflow:**
```
Requirements → Planning → Execution → Testing → Verification → Completion
```

**Why this matters:**
- Hands-off for simple tasks
- Autonomous execution
- Quality enforced
- Recovery built-in

## How AIKit Makes OpenCode Better

### Without AIKit:

**Issues:**
- No structured workflows
- Agents make inconsistent choices
- No task tracking
- No quality enforcement
- Work lost between sessions
- No persistent memory
- Manual git operations
- No enforced processes

**Example workflow without AIKit:**
```
> Implement user authentication
# AI picks random approach
# May skip tests
# No tracking
# No quality check
# Next session: forgot what was done
```

### With AIKit:

**Benefits:**
- Structured workflows via skills
- Specialized agents with clear roles
- Task tracking with Beads
- Quality gates enforced
- Session handoffs preserved
- Persistent memory system
- Integrated git workflows
- Anti-hallucination checks

**Example workflow with AIKit:**
```
/ak_cm_create Add user authentication
# Creates bead for tracking

/ak_cm_plan user authentication system
# Creates detailed plan with sub-tasks

> use_skill("test-driven-development")
/implement
# Follows TDD: RED → GREEN → REFACTOR
# Updates bead status

/finish
# Runs quality gates (typecheck, test, lint, build)
# Only completes if all pass
# Creates commit message

/handoff
# Saves context for next session
```

## Key Differences

| Feature | Without AIKit | With AIKit |
|---------|---------------|------------|
| Workflow Enforcement | None | 23 built-in skills |
| Task Tracking | Manual | Beads integration |
| Quality Gates | Manual | Automatic in /finish |
| Session Continuity | None | Handoffs + /resume |
| Persistent Memory | None | Memory system |
| Agent Specialization | Default only | 8 specialized agents |
| Command Shortcuts | None | 27+ slash commands |
| Anti-Hallucination | None | 3-layer system |
| Figma Integration | None | Design tokens + assets |
| Git Workflows | Manual | Integrated (/branch, /pr, etc.) |
| Code Review | Manual | /review + @review agent |

## Real-World Impact

**Without AIKit:**
- Tasks take longer due to lack of structure
- Inconsistent code quality
- Work forgotten between sessions
- No enforcement of best practices
- Manual quality checks

**With AIKit:**
- Faster development with enforced workflows
- Consistent code quality via skills and gates
- Work continues seamlessly across sessions
- Best practices embedded in skills
- Automatic quality validation

## Installation & Setup

```bash
# Install
cd aikit
npm install
npm run build
npm link

# Initialize global config
aikit init --global

# In your project
cd your-project
aikit init

# Install into OpenCode
aikit install

# Initialize Beads (recommended)
bd init
```

## Quick Start

```bash
# Start a new task
/ak_cm_create Add user authentication

# Plan the work
/ak_cm_plan user authentication system

# Implement with TDD
> use_skill("test-driven-development")
/implement

# Complete with quality gates
/finish

# End session
/handoff

# Resume later
/resume
```

## Summary

AIKit transforms OpenCode from a general-purpose AI coding assistant into a **structured development environment** by providing:

1. **Structured workflows** via skills (23 built-in)
2. **Specialized agents** (8 types with automatic delegation)
3. **Task tracking** with Beads integration
4. **Quality enforcement** via anti-hallucination and quality gates
5. **Session continuity** via handoffs and memory system
6. **Integrated tools** for Figma, git, testing, etc.
7. **Plugin system** for custom behaviors
8. **Slash commands** for common workflows

**Bottom line:** AIKit adds structure, tracking, and quality enforcement to OpenCode, making it more reliable, consistent, and efficient for real-world development workflows.
