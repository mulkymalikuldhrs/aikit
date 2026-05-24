# Changelog

## [Unreleased]

### Breaking Changes ⚠️
- 🏷️ **Removed Command & Skill Prefixes** - Reverted to simpler command names for better usability:
  - All commands now use simple names without prefixes (e.g., `/plan`, `/implement`, `/fix`)
  - All skills use simple names (e.g., `/test-driven-development`, `/code-review`)
  - Old prefixed names (`/ak_cm_*` and `/ak_sk_*`) are deprecated
  - Documentation updated to use new simpler naming

### Migration Guide
1. Run `aikit install` to generate new unprefixed commands
2. Use simple command names: `/plan` instead of `/ak_cm_plan`
3. Use simple skill names: `/test-driven-development` instead of `/ak_sk_test-driven-development`

## [0.1.18] - 2026-01-02

### Fixed
- 🔧 **OpenCode Agent Tab Switching** - Fixed `<tab>` key switching between agent modes
  - Renamed `build` and `planner` agents to `aikitbuild` and `aikitplanner`
  - Prevents conflicts with OpenCode's built-in Plan/Build modes
  - All agents now properly have `mode: subagent` for tab switching
  - Users can now switch between: aikitplanner, aikitbuild, rush, review, scout, explore, vision, one-shot

## [0.1.15] - 2026-01-01

### Breaking Changes ⚠️
- 🏷️ **Command & Skill Prefix Separation** - All OpenCode commands now use prefixes to distinguish type:
  - Commands: `/ak_cm_<name>` (e.g., `/ak_cm_plan`, `/ak_cm_implement`, `/ak_cm_fix`)
  - Skills: `/ak_sk_<name>` (e.g., `/ak_sk_test-driven-development`, `/ak_sk_code-review`)
  - Old simple names (e.g., `/plan`, `/test-driven-development`) are **no longer supported**
  - Users must press `/` in OpenCode to see new prefixed commands
  - All documentation updated with new command names

### Added
- Clear visual distinction between commands and skills in OpenCode command picker
- New naming convention: `ak_cm_*` for commands, `ak_sk_*` for skills
- Updated all 28 commands and 23 skills with new prefixes

### Migration Guide
1. Run `aikit install` to generate new prefixed commands
2. Press `/` in OpenCode to see new command structure
3. Use `/ak_cm_` prefix for all slash commands
4. Use `/ak_sk_` prefix for direct skill invocation

## [0.1.12] - 2024-12-28

### Added
- 🎯 **One-Shot as OpenCode Agent** - Now available via `<tab>` key switching
  - Added `one-shot` to the 8 available agents
  - Users can now tab-switch between: plan, planner, build, rush, review, scout, explore, vision, one-shot
  - Full workflow documentation in agent description
  - Delegates to all specialist agents as needed

## [0.1.11] - 2024-12-28

### Added
- 🚀 **One-Shot Mode (Beta)** - End-to-end autonomous task execution
  - `/one-shot <task>` command for fully automated task completion
  - 7-phase workflow: Requirements → Planning → Complexity → Execution → Testing → Verification → Completion
  - Interactive requirements gathering with arrow-key navigation
  - 3-level error recovery (auto-fix → alternative approach → user intervention)
  - Quality gates with 3-attempt retry loop (typecheck, test, lint, build)
  - Multi-level verification (gates + manual + deployment)
  - Automatic task splitting for complex work
  - Completion proof generation
  - Beta feedback collection
- 📚 New documentation: `docs/ONE_SHOT_MODE.md` - Complete user guide

### Fixed
- 🐛 Fix postinstall.js directory copying - now properly handles nested skill directories

## [Unreleased]

### Added
- ✨ CLI tool detection và installation (v0.1.8)
  - Auto-detect OpenCode, Claude CLI, và GitHub CLI
  - Interactive prompt với 3 options rõ ràng:
    - `a` - Install tất cả missing CLI tools (default)
    - `s` - Chọn từng tool cụ thể
    - `n` - Skip CLI tool installation
  - Hỗ trợ cài đặt cho: OpenCode, Claude CLI, GitHub CLI
  - Display status cho từng CLI tool (installed/not installed + version)
  - Cải thiện message để rõ ràng: "Select specific tools to install (use space to select, Enter to confirm)"
- ✨ New command `/analyze-figma` - Tự động phân tích Figma design và extract design tokens
  - Không cần user phải viết prompt dài
  - Tự động gọi @vision agent
  - Tự động extract tất cả design tokens
  - Tự động lưu vào memory/research/figma-analysis.md

### Fixed
- 🐛 Fix `aikit init` không tạo directory `.beads` khi install từ npm
  - Thêm method `initLocal()` để tạo `.beads` directory ngay cả khi beads CLI không được cài global
  - Tự động tạo README.md trong `.beads` directory hướng dẫn sử dụng
- 🐛 Fix lỗi ENOENT khi global skills directory không tồn tại
  - Add error handling trong `syncSkillsToProject()` để graceful skip khi directory không tồn tại
  - Log warning thay vì crash
- 📦 Centralize version configuration
  - Tạo `src/utils/version.ts` để đọc version từ package.json (single source of truth)
  - Remove hardcoded version từ multiple files
  - Update cli.ts, config.ts để sử dụng `getVersion()` function
  - Giờ version chỉ cần cập nhật ở `package.json`

### Improved
- 🔄 Cải thiện OpenCode integration - tự động generate commands từ skills và commands
- 📚 Thêm documentation chi tiết:
  - `QUICK_START_FIGMA.md` - Quick start guide cho Figma workflow
  - `docs/WORKFLOW_FIGMA_TO_CODE.md` - Workflow chi tiết
  - `skills/figma-to-code.md` - Skill chuyên dụng

### Changed
- 📝 Cập nhật workflow để user chỉ cần gõ `/analyze-figma <url>` thay vì viết prompt dài
- 📝 Cải thiện command generation để tự động handle special cases

## [0.1.0] - Initial Release

### Features
- 🎯 Skills Engine - Mandatory workflow enforcement
- 🤖 Agent Delegation - 7 specialized agents
- ⚡ 27+ Commands - Slash commands for workflows
- 🔧 Custom Tools - Extensible tool system
- 🔌 Plugin System - Event-driven plugins
- 🧠 Memory Persistence - Cross-session context
- 🛡️ Anti-Hallucination - 3-layer validation
- 📿 Beads Integration - Task tracking với quality gates
- 🌐 MCP Server - OpenCode integration


---

> **Contact:** Mulky Malikul Dhaher — [mulkymalikuldhaher@email.com](mailto:mulkymalikuldhaher@email.com)
>
> **Disclaimer:** This project is for Education Purpose only. Risiko apapun tidak kita tanggung. (We are not responsible for any risks or damages.)
