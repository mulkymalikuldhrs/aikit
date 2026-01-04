# AIKit Quick Reference

## 🚀 Quick Start

```bash
# Install
npm install
npm run build
npm link

# Initialize
aikit init --global
cd your-project
aikit init
aikit install
```

## 📋 Commands Cheat Sheet

### Core Workflow
```
/ak_cm_create <task>           # Create Beads task
/ak_cm_plan <feature>          # Create implementation plan
/ak_cm_implement [task-id]     # Implement with TDD
/ak_cm_finish [task-id]        # Complete with quality gates
/ak_cm_handoff                 # Create session handoff
/ak_cm_resume                  # Resume from handoff
```

### Quick Actions
```
/ak_cm_fix <issue>             # Quick fix
/ak_cm_fix-types [file]        # Fix TypeScript errors
/ak_cm_fix-ci                  # Fix CI failures
/ak_cm_commit [message]        # Create commit
/ak_cm_pr [title]              # Create PR
/ak_cm_refactor [file]         # Refactor code
/ak_cm_test [pattern]          # Run tests
/ak_cm_lint [--fix]           # Run linter
```

### Research & Design
```
/ak_cm_research <topic>        # Deep research
/ak_cm_analyze-project         # Analyze project
/ak_cm_review-codebase [path]  # Review codebase
/ak_cm_design <feature>        # Design feature
/ak_cm_brainstorm <problem>    # Brainstorm ideas
/ak_cm_analyze-figma <url>     # Analyze Figma design
```

### Git & Utilities
```
/ak_cm_branch <name>          # Create branch
/ak_cm_merge [target]         # Merge branch
/ak_cm_status                 # Show status
/ak_cm_help [command]         # Show help
/ak_cm_deploy [env]           # Deploy
/ak_cm_rollback [version]     # Rollback
/ak_cm_logs [--tail]          # View logs
```

## 🤖 Agents

```
@planner    # Strategic planning
@build      # Implementation
@rush       # Quick fixes
@review     # Code review
@scout      # External research
@explore    # Codebase navigation
@vision     # Visual analysis
```

## 🎯 Top 10 Skills

```
ak_sk_test-driven-development    # TDD workflow
ak_sk_systematic-debugging       # Debug workflow
ak_sk_code-review                # Review workflow
ak_sk_refactoring                # Refactor workflow
ak_sk_api-design                 # API design
ak_sk_component-design           # Component design
ak_sk_accessibility              # A11y guidelines
ak_sk_performance-optimization   # Performance
ak_sk_security-audit             # Security
ak_sk_documentation              # Documentation
```

## 🔧 Tools

```
memory-read("key")                    # Read memory
memory-update("key", "content")       # Update memory
list_session(limit=10)                # List sessions
read_session("session-id")            # Read session
find_skills("query")                  # Find skills
use_skill("skill-name")               # Use skill
read_figma_design("url")              # Analyze Figma (use /ak_cm_analyze-figma)
```

## 📝 Common Workflows

### Feature Development
```
/ak_cm_create Add feature
/ak_cm_plan feature
/ak_cm_implement
/ak_cm_finish
/ak_cm_commit
/ak_cm_pr
```

### Bug Fixing
```
/ak_cm_fix bug description
# hoặc
> use_skill("systematic-debugging")
> Debug this issue
```

### Code Review
```
/ak_cm_review-codebase
# hoặc
> use_skill("code-review")
> Review this PR
```

### Multi-Session
```
# Session 1
/ak_cm_handoff

# Session 2
/ak_cm_resume
```
/create Add feature
/plan feature
/implement
/finish
/commit
/pr
```

### Bug Fixing
```
/fix bug description
# hoặc
> use_skill("systematic-debugging")
> Debug the issue
```

### Code Review
```
/review-codebase
# hoặc
> use_skill("code-review")
> Review this PR
```

### Multi-Session
```
# Session 1
/handoff

# Session 2
/resume
```

## ⚙️ Configuration

### aikit.json
```json
{
  "version": "0.1.0",
  "agents": { "default": "build" },
  "skills": { "enabled": true },
  "plugins": { "enabled": true }
}
```

### AGENTS.md
```markdown
# Project Rules
## Build Commands
- `npm run build`
## Code Style
- 2 spaces indentation
```

## 🔌 Plugins

- **Enforcer**: Warns about abandoned work
- **Compactor**: Warns at 70%/85%/95% context
- **Truncator**: Auto-truncates large outputs
- **Notification**: OS notifications on completion
- **Session Management**: Cross-session context

## 🛡️ Anti-Hallucination

1. **Task Validation**: Work must have Beads task
2. **Spec Enforcement**: Code follows spec.md
3. **Review Gates**: Changes documented in review.md

## 📚 CLI Commands

```bash
aikit status              # Show status
aikit skills list         # List skills (ak_sk_*)
aikit agents list         # List agents
aikit commands list       # List commands (ak_cm_*)
aikit tools list          # List tools
aikit plugins list        # List plugins
aikit memory list         # List memory
aikit beads status        # Beads status
```

## 💡 Tips

1. **Luôn tạo task trước**: `/ak_cm_create` hoặc `bd create`
2. **Plan trước implement**: `/ak_cm_plan` trước `/ak_cm_implement`
3. **Sử dụng TDD**: `use_skill("test-driven-development")`
4. **Handoff cho multi-session**: `/ak_cm_handoff` và `/ak_cm_resume`
5. **Document trong memory**: `memory-update("key", "content")`
6. **Sử dụng agents**: `@planner`, `@build`, `@review`
7. **Quality gates**: `/ak_cm_finish` tự động chạy gates

## 🆘 Troubleshooting

```bash
# Skills không load
aikit skills sync

# Commands không hiện
aikit install

# Tools không hoạt động
aikit skills figma-analysis config

# Check status
aikit status
```

## 📖 Full Documentation

Xem `docs/FULL_FEATURE_GUIDE.md` để biết chi tiết đầy đủ.






