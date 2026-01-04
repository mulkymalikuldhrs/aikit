# AIKit Installation Guide

Hướng dẫn cài đặt AIKit - Open-source alternative to OpenCodeKit với đầy đủ tính năng 1:1.

## Yêu Cầu Hệ Thống

- **Node.js**: 18.0.0 hoặc cao hơn
- **OpenCode**: Đã cài đặt và cấu hình
- **Beads CLI** (tùy chọn): Để sử dụng task tracking (`npm install -g @beads/bd`)

## Cài Đặt

### Bước 1: Cài Đặt AIKit

```bash
# Clone repository
git clone https://github.com/yourusername/aikit.git
cd aikit

# Install dependencies
npm install

# Build project
npm run build

# Link globally (optional)
npm link
```

### Bước 2: Khởi Tạo Global Configuration

```bash
# Khởi tạo cấu hình global (một lần duy nhất)
aikit init --global
```

Điều này sẽ tạo cấu hình tại:
- **Windows**: `%APPDATA%/aikit/`
- **macOS/Linux**: `~/.config/aikit/`

### Bước 3: Khởi Tạo Project Configuration

Trong thư mục project của bạn:

```bash
cd your-project

# Khởi tạo AIKit cho project
aikit init

# Khởi tạo Beads (nếu chưa có)
bd init

# Cài đặt AIKit vào OpenCode
aikit install
```

## Cấu Trúc Thư Mục

Sau khi cài đặt, cấu trúc sẽ như sau:

```
your-project/
├── .aikit/                    # AIKit project config
│   ├── aikit.json              # Project configuration
│   ├── AGENTS.md               # Agent rules và guidelines
│   ├── skills/                 # Project-specific skills
│   ├── commands/               # Custom commands
│   ├── tools/                  # Custom tools
│   ├── plugins/                # Custom plugins
│   └── memory/                 # Persistent memory
│       ├── handoffs/           # Session handoffs
│       ├── observations/       # Project observations
│       └── research/           # Research findings
├── .beads/                     # Beads task tracking
│   └── bead-*.md               # Task files
├── .opencode/                  # OpenCode integration
│   └── command/                # Generated commands
│       ├── skills.md
│       ├── plan.md
│       ├── tdd.md
│       └── ...
├── spec.md                     # Project constraints (anti-hallucination)
└── review.md                   # Code review notes
```

## Verification

Kiểm tra cài đặt:

```bash
# Kiểm tra status
aikit status

# Liệt kê skills
aikit skills list

# Liệt kê agents
aikit agents list

# Liệt kê tools và status
aikit skills list

# Liệt kê commands
aikit commands list
```

## Cấu Hình

### Project Configuration (`.aikit/aikit.json`)

```json
{
  "version": "0.1.0",
  "skills": {
    "enabled": true
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
    "autoload": []
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

### Tool Configuration

AIKit hỗ trợ các tools cần configuration (như Figma API). Để configure tools:

```bash
# List all tools và status
aikit skills list

# Configure a specific tool
aikit skills <tool-name> config
```

**Ví dụ: Configure Figma Tool**

```bash
# Configure Figma analysis tool
aikit skills figma-analysis config
```

OAuth flow sẽ:
1. Mở browser đến Figma token creation page
2. Hướng dẫn bạn tạo Personal Access Token
3. Bạn paste token vào terminal
4. Token được validate và lưu vào `.aikit/config/tools.json`

**Tool Status**:
- `✓ (ready)`: Tool đã được configure và sẵn sàng sử dụng
- `⚠ (needs config)`: Tool cần configuration
- `✗ (error)`: Tool có lỗi trong configuration

### Agent Rules (`.aikit/AGENTS.md`)

File này chứa các quy tắc và guidelines cho AI agents:

```markdown
# AIKit Agent Rules

## Build Commands
- `npm run build` - Build the project
- `npm run test` - Run tests
- `npm run lint` - Run linting

## Code Style
- Use 2 spaces for indentation
- Use single quotes for strings
- Add trailing commas

## Naming Conventions
- Variables: camelCase
- Components: PascalCase
- Files: kebab-case
```

## Sử Dụng Trong OpenCode

Sau khi cài đặt, bạn có thể sử dụng trong OpenCode:

1. **Mở Command Picker**: Nhấn `Ctrl+K` (hoặc `Cmd+K` trên Mac)
2. **Gõ command**: Ví dụ `/plan`, `/tdd`, `/review`
3. **Sử dụng skills**: Gõ `/skills` để xem tất cả skills

### Ví Dụ Commands

- `/plan` - Tạo implementation plan
- `/tdd` - Test-driven development workflow
- `/debug` - Systematic debugging
- `/review` - Code review checklist
- `/finish` - Complete task với quality gates
- `/handoff` - Tạo session handoff

## Troubleshooting

### Lỗi: "AIKit not initialized"

```bash
# Chạy lại init
aikit init
```

### Lỗi: "OpenCode commands not found"

```bash
# Reinstall commands
aikit install
```

### Lỗi: "Beads not found"

```bash
# Install Beads CLI
npm install -g @beads/bd

# Initialize in project
bd init
```

## Next Steps

- Xem [SKILLS.md](./SKILLS.md) để tìm hiểu về skills
- Xem [AGENTS.md](./AGENTS.md) để tìm hiểu về agents
- Xem [COMMANDS.md](./COMMANDS.md) để tìm hiểu về commands
- Xem [CUSTOM_TOOLS.md](./CUSTOM_TOOLS.md) để tạo custom tools
- Xem [PLUGINS.md](./PLUGINS.md) để tạo plugins

## So Sánh Với OpenCodeKit

AIKit cung cấp đầy đủ tính năng tương tự OpenCodeKit:

| Tính Năng | OpenCodeKit | AIKit | Status |
|-----------|-------------|-------|--------|
| Skills Engine | ✅ | ✅ | ✅ |
| Agents | ✅ | ✅ | ✅ |
| Commands | ✅ | ✅ | ✅ |
| Custom Tools | ✅ | ✅ | ✅ |
| Plugins | ✅ | ✅ | ✅ |
| Configuration | ✅ | ✅ | ✅ |
| Anti-Hallucination | ✅ | ✅ | ✅ |
| Database Support | ✅ | ⚠️ File-based | ⚠️ |
| Price | $79 | Free | ✅ |

**Lưu ý**: AIKit sử dụng file-based storage thay vì database, nhưng vẫn đảm bảo đầy đủ tính năng và hiệu suất tốt.

