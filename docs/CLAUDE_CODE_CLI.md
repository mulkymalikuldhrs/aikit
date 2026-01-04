# AIKit with Claude Code CLI

AIKit works seamlessly with Claude Code CLI, providing skills, commands and agents that extend Claude's capabilities.

## Installation

### Option 1: Initialize for Claude Code CLI

```bash
# Initialize AIKit specifically for Claude Code CLI
aikit init claude
```

### Option 2: Install to existing AIKit project

```bash
# If AIKit is already initialized, install Claude Code CLI integration
aikit install claude
```

## Configuration

### Project Structure

After initialization for Claude Code CLI:

```
your-project/
├── .aikit/              # AIKit project configuration
│   ├── aikit.json
│   ├── skills/
│   ├── commands/
│   └── AGENTS.md
├── .claude/             # Claude Code CLI configuration
│   ├── commands/        # AIKit commands (no prefix)
│   │   ├── plan.md
│   │   ├── implement.md
│   │   ├── test.md
│   │   └── ...
│   ├── skills/          # AIKit skills (directory structure)
│   │   ├── test-driven-development/
│   │   │   └── SKILL.md
│   │   ├── code-review/
│   │   │   └── SKILL.md
│   │   └── ...
│   └── agents/          # AIKit agents
│       ├── planner.md
│       ├── build.md
│       └── ...
└── ...
```

### Command Naming

Unlike OpenCode (which uses `ak_cm_*` and `ak_sk_*` prefixes), Claude Code CLI uses simple names:

| OpenCode | Claude Code CLI |
|----------|------------------|
| `/ak_cm_plan` | `/plan` |
| `/ak_cm_implement` | `/implement` |
| `/ak_sk_test-driven-development` | `test-driven-development` skill (auto-invoked) |

### Using Commands

Start Claude Code CLI:

```bash
cd your-project
claude
```

Then type commands:

```
/help                    # List all commands
/plan                     # Create implementation plan
/implement                 # Implement a task
/test                     # Run tests
```

### Using Skills

Skills in Claude Code CLI are **auto-invoked** based on your request. You don't need to prefix them:

```
# Just describe what you need
Can you review this code?            # Auto-uses code-review skill
Test this with TDD                  # Auto-uses test-driven-development skill
Debug this error                   # Auto-uses debugging skill
```

To see available skills, ask Claude:

```
What Skills are available?
```

### Using Agents

Claude Code CLI supports custom subagents. AIKit agents are available as:

```
/planner                  # Strategic planning agent
/build                     # Implementation agent
/review                    # Code review agent
/scout                     # External research agent
/explore                   # Codebase navigation agent
/vision                    # Multimodal analysis agent
/rush                      # Fast execution agent
/one-shot                  # Autonomous task execution (beta)
```

Invoke them:

```
Use @planner agent to help me design this feature
```

## Differences from OpenCode

| Feature | OpenCode | Claude Code CLI |
|---------|-----------|------------------|
| Command prefix | `ak_cm_` / `ak_sk_` | No prefix |
| Command invocation | Type `/command` | Type `/command` |
| Skill invocation | Type `/skill-name` | Auto-invoked (describe need) |
| Agent invocation | Not supported | Type `@agent-name` or ask "Use X agent" |
| Configuration directory | `.opencode/` | `.claude/` |
| Commands location | `.opencode/command/` | `.claude/commands/` |
| Skills location | `.opencode/skill/` | `.claude/skills/skill-name/` |
| Agents location | `.opencode/agent/` | `.claude/agents/` |

## Advanced Features

### Custom Commands

Create custom commands in `.aikit/commands/`:

```bash
mkdir -p .aikit/commands/utility
echo '# Deploy

Deploy to production with quality checks.
' > .aikit/commands/utility/deploy.md

# Install to Claude Code CLI
aikit install claude
```

### Custom Skills

Create custom skills:

```bash
mkdir -p .aikit/skills/my-skill
cat > .aikit/skills/my-skill/SKILL.md << 'EOF'
---
name: my-custom-skill
description: My custom workflow
---

# My Custom Skill

When to use this...

## Workflow
1. Step 1
2. Step 2
EOF

# Install to Claude Code CLI
aikit install claude
```

### Platform Switching

To use both OpenCode and Claude Code CLI:

```bash
# Initialize for OpenCode
aikit init opencode

# Install Claude Code CLI integration
aikit install claude

# Now you can use both CLIs!
```

## Troubleshooting

### Commands not showing in Claude Code CLI

```bash
# Ensure Claude Code CLI is restarted
# Exit and restart claude

# Verify commands exist
ls .claude/commands/

# Reinstall if needed
aikit install claude
```

### Skills not triggering

Skills in Claude Code CLI require clear descriptions. Check:

1. Skill has a clear `description` field
2. Description includes trigger keywords
3. Skill is in correct directory: `.claude/skills/skill-name/SKILL.md`

### Agent not available

Check agent file exists:

```bash
ls .claude/agents/

# Ensure file format is correct with frontmatter
cat .claude/agents/planner.md
```

## Next Steps

- [Create custom commands](./CUSTOM_COMMANDS.md)
- [Create custom skills](./CUSTOM_SKILLS.md)
- [Use MCP tools](./MCP_TOOLS.md)
- [Platform-specific docs](./OPENCODE_CLI.md)
