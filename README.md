<div align="center">

<img src="assets/logo.png" alt="AIKit Logo" width="200"/>

# **AIKit**

### **Open-Source AI Coding Agent Toolkit**

**Works with Claude Code & OpenCode**

[![npm version](https://badge.fury.io/js/%40tdsoft-tech%2Faikit.svg)](https://www.npmjs.com/package/@tdsoft-tech/aikit)
[![License](https://img.shields.io/badge/License-Dual%20License-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/Node-%3E=18.0.0-brightgreen)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)

[![Stars](https://img.shields.io/github/stars/tdsoft-technology/aikit?style=social)](https://github.com/tdsoft-technology/aikit/stargazers)
[![Forks](https://img.shields.io/github/forks/tdsoft-technology/aikit?style=social)](https://github.com/tdsoft-technology/aikit/network/members)
[![Issues](https://img.shields.io/github/issues/tdsoft-technology/aikit)](https://github.com/tdsoft-technology/aikit/issues)

**Skills • Agents • Commands • Tools • Plugins**

[Documentation](https://aikit.tdsoft.tech/docs/intro) • [Quick Start](#-quick-start) • [Features](#-features) • [Contributing](#-contributing)

</div>

---

## ✨ What is AIKit?

**AIKit** is a powerful, open-source toolkit that extends your AI coding experience with reusable **skills**, intelligent **agents**, custom **commands**, and flexible **plugins**. It's designed to supercharge your development workflow with AI-driven automation.

**Works with Claude Code (recommended) and OpenCode.**

Perfect for developers who want to:
- 🚀 **Automate repetitive tasks** with custom commands
- 🧠 **Leverage specialized AI skills** (testing, refactoring, security, etc.)
- 🤖 **Use intelligent agents** for complex workflows
- 🔌 **Extend functionality** with plugins
- 📦 **Share knowledge** across projects

---

### 🎬 Quick Demo

<div align="center">

<img src="assets/202601041506.gif" alt="AIKit Demo" width="800"/>

</div>

---

## 🎯 Key Features

### 🧠 Specialized Skills

23+ skills covering every aspect of development:

**Design & Architecture** • **Development** • **Testing** • **Workflow**

- 🎨 Frontend Aesthetics
- 🏗️ Component Design
- 🗄️ Database Design
- 📐 Design Measurement
- 🔌 API Design
- ⚡ Performance Optimization
- 🔨 Refactoring
- 🛡️ Security Audit
- 🐛 Systematic Debugging
- ✅ Unit Testing
- 🔄 Test-Driven Development
- 🔗 Integration Testing
- 🧪 Frontend Testing
- 📝 Documentation
- 🔀 CI/CD
- 🐳 Docker
- 🌳 Git Best Practices
- 💳 Payments Integration

---

### 🤖 Intelligent Agents

8 specialized agents for different workflows:

| Agent | Mode | Purpose |
|:-----:|:----:|:---------|
| `aikitplanner` | `<tab>` | Plan complex features |
| `aikitbuild` | `<tab>` | Implement features |
| `rush` | `<tab>` | Quick fixes |
| `review` | `<tab>` | Code review |
| `scout` | `<tab>` | Explore codebase |
| `explore` | `<tab>` | Deep analysis |
| `vision` | `<tab>` | Image analysis |
| `one-shot` | `<tab>` | End-to-end automation |

> 💡 **Tip:** Press `<tab>` in Claude Code or OpenCode to switch between agents!

---

### ⚡ Quick Commands

28+ commands at your fingertips:

**Claude Code (simpler):**
```bash
/plan      /implement    /fix
/test      /review       /branch
/session:start
```

**OpenCode (prefixed):**
```bash
/ak_cm_plan    /ak_cm_implement  /ak_cm_fix
/ak_cm_test    /ak_sk_review     /ak_cm_branch
/session:start
```

[View all commands →](https://aikit.tdsoft.tech/docs/commands/intro)

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.0.0
- **Claude Code** (recommended) or **OpenCode** with Claude integration

### Installation

```bash
# Install AIKit globally
npm install -g @tdsoft-tech/aikit

# Or install in your project
npm install -D @tdsoft-tech/aikit

# Initialize AIKit in your project
aikit install
```

That's it! 🎉 AIKit is now ready to use.

### First Steps

**For Claude Code:**
1. Open Claude Code in your project
2. Use commands: `/plan`, `/implement`, `/fix`, `/test`
3. Try a skill: `/test-driven-development` or `/code-review`
4. Read the [documentation](https://aikit.tdsoft.tech/docs/intro)

**For OpenCode:**
1. **Open OpenCode** and press `/` to see available commands
2. Try a skill: `/ak_sk_test-driven-development`
3. Switch agents: Press `<tab>` to cycle through agents
4. Read the [documentation](https://aikit.tdsoft.tech/docs/intro)

---

## 📚 Documentation

**[📖 Full Documentation](https://aikit.tdsoft.tech/docs/intro)**

### Quick Links

- [Installation Guide](https://aikit.tdsoft.tech/docs/installation)
- [Quick Reference](https://aikit.tdsoft.tech/docs/quick-reference)
- [All Skills](https://aikit.tdsoft.tech/docs/skills)
- [Commands](https://aikit.tdsoft.tech/docs/commands)
- [One-Shot Mode](https://aikit.tdsoft.tech/docs/one-shot-mode)
- [Figma Integration](https://aikit.tdsoft.tech/docs/using-analyze-figma)

---

## 🎬 Usage Examples

> 💡 **Note:** Command formats differ between Claude Code and OpenCode

### Session Management

**Claude Code:**
```bash
/session:start "Implement OAuth 2.0"
/session:update
/session:end
```

**OpenCode:**
```bash
/session:start "Implement OAuth 2.0"
/session:update
/session:end
```

### Planning Features

**Claude Code:**
```bash
/plan "Add user authentication with OAuth"
```

**OpenCode:**
```bash
/ak_cm_plan "Add user authentication with OAuth"
```

### Implementing Features

**Claude Code:**
```bash
/implement
# Or use skill directly
/test-driven-development
```

**OpenCode:**
```bash
/ak_cm_implement
/ak_sk_test-driven-development
```

### Fixing Bugs

**Claude Code:**
```bash
/fix "Login fails on Safari"
```

**OpenCode:**
```bash
/ak_cm_fix "Login fails on Safari"
```

### Code Review

**Claude Code:**
```bash
/code-review
```

**OpenCode:**
```bash
/ak_sk_code-review
```

### One-Shot Automation

**Claude Code:**
```bash
/one-shot "Add dark mode toggle to settings"
```

**OpenCode:**
```bash
/ak_cm_one-shot "Add dark mode toggle to settings"
```

### Creating Branches

**Claude Code:**
```bash
/branch "user-oauth"
```

**OpenCode:**
```bash
/ak_cm_branch "user-oauth"
```

---

## 🤝 Contributing

We love contributions! 💜

**[📖 Contributing Guide](CONTRIBUTING.md)**

### Ways to Contribute

- 🐛 [Report bugs](https://github.com/tdsoft-technology/aikit/issues)
- 💡 [Suggest features](https://github.com/tdsoft-technology/aikit/issues)
- 📝 [Improve docs](https://github.com/tdsoft-technology/aikit/pulls)
- 🔧 [Submit PRs](https://github.com/tdsoft-technology/aikit/pulls)
- 🌟 [Star the repo](https://github.com/tdsoft-technology/aikit) ⭐

---

## ❤️ Support AIKit

If you find AIKit useful, please consider supporting us! Your support helps us:
- 🛠️ Maintain and improve AIKit
- 🐛 Fix bugs faster
- ✨ Add new features
- 📚 Keep documentation up to date
- 🌍 Support the community

### Ways to Support

| Support Type | Link | Description |
|--------------|------|-------------|
| ⭐ **Star on GitHub** | [Star this repo](https://github.com/tdsoft-technology/aikit) | It's free and helps others discover AIKit! |
| ☕ **Buy Me a Coffee** | [Support development](https://ko-fi.com) | One-time donation (link coming soon) |
| 💬 **Join Discussions** | [GitHub Discussions](https://github.com/tdsoft-technology/aikit/discussions) | Ask questions, share ideas |

---

## 📊 Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and updates.

### Recent Highlights
- **v0.1.20** - Latest stable release
- **v0.1.18** - Fixed agent tab switching
- **v0.1.15** - Command prefix separation
- **v0.1.11** - One-Shot mode (beta)

---

## 📜 Licensing

AIKit is available under a dual-license model:

### Non-Commercial License (Free)
- Free for personal, educational, and research use
- Open source learning and experimentation
- [View Non-Commercial License](LICENSE)

### Commercial License (Paid)
- Required for any commercial or revenue-generating use
- SaaS platforms, paid APIs, enterprise systems
- [View Commercial License](COMMERCIAL_LICENSE.md)

**For commercial licensing inquiries:**
📧 dev@tdsoft.tech or duypnt23@gmail.com
🌐 https://tdsoft.tech

---

## 🙏 Acknowledgments

Built with ❤️ by the open-source community.
---

<div align="center">

###Built for Developers • Open Source Forever

[🔝 Back to Top](#-aikit)

[Documentation](https://aikit.tdsoft.tech/docs/intro) •
[Issues](https://github.com/tdsoft-technology/aikit/issues) •
[Discussions](https://github.com/tdsoft-technology/aikit/discussions) •
[Releases](https://github.com/tdsoft-technology/aikit/releases)

Made with 💜 by [TDSoft Technology](https://github.com/tdsoft-technology)

</div>
