# Cách Sử Dụng /analyze-figma Command

## Cách Sử Dụng

### Bước 1: Reinstall AIKit (Nếu chưa có command mới)

```bash
cd aikit-test-prj
aikit install
```

### Bước 2: Sử Dụng Command trong OpenCode

Chỉ cần gõ:

```
/analyze-figma https://www.figma.com/design/lC34qpTSy2MYalTIOsj8S2/Online-Education-Website-Free-Template--Community-?node-id=0-1&t=70yZa7w5wSyjDhYj-1
```

## Command Sẽ Tự Động:

1. ✅ **Tự động extract URL** từ user input
2. ✅ **Tự động gọi MCP tool** `read_figma_design` với URL
3. ✅ **Sử dụng browser MCP** để:
   - Navigate đến Figma URL
   - Take snapshot của design
   - Extract design tokens từ snapshot
4. ✅ **Tự động extract** tất cả design tokens:
   - All screens/pages
   - Color palette (hex codes)
   - Typography system
   - Spacing system (8px grid)
   - Component structure
   - Layout grid
   - Responsive breakpoints
   - Assets needed
5. ✅ **Tự động lưu** vào `memory/research/figma-analysis.md`
6. ✅ **Báo cáo** những gì đã extract

## Workflow Chi Tiết

### Step 1: Extract URL
Command tự động extract URL từ user input message.

### Step 2: Call MCP Tool
Gọi `read_figma_design` tool (hoặc `tool_read_figma_design` qua MCP) với extracted URL.

### Step 3: Browser MCP
Tool sẽ hướng dẫn sử dụng browser MCP:
- `mcp_cursor-ide-browser_browser_navigate` - Navigate to Figma URL
- `mcp_cursor-ide-browser_browser_snapshot` - Take snapshot

### Step 4: Extract Tokens
Extract design tokens từ snapshot.

### Step 5: Save to Memory
Save formatted tokens to `memory/research/figma-analysis.md`.

## Alternative: Sử Dụng MCP Tool Trực Tiếp

Nếu command không hoạt động, bạn có thể gọi MCP tool trực tiếp:

```
Use tool: read_figma_design
Arguments: { "url": "https://www.figma.com/design/lC34qpTSy2MYalTIOsj8S2/Online-Education-Website-Free-Template--Community-?node-id=0-1&t=70yZa7w5wSyjDhYj-1" }
```

Sau đó follow instructions để sử dụng browser MCP.

## Lưu Ý

Nếu browser MCP không thể access Figma link (cần authentication):
- Command sẽ tự động hướng dẫn bạn export frames
- Hoặc verify link có "Anyone with the link can view"
- Hoặc cung cấp PDF export

## Output

Sau khi chạy command, bạn sẽ có:
- File `memory/research/figma-analysis.md` với tất cả design tokens
- Report về những gì đã extract
- Ready để sử dụng cho implementation

## Next Steps

Sau khi analyze xong:
1. Review `memory/research/figma-analysis.md`
2. Sử dụng `/plan` để tạo implementation plan
3. Bắt đầu implement với design tokens đã extract

## Troubleshooting

### AI Không Nhận Ra URL

**Nguyên nhân**: OpenCode không parse command arguments đúng cách

**Giải pháp**: 
- Thử format: `/analyze-figma [url]` với space
- Hoặc URL trên dòng riêng
- Hoặc gọi MCP tool trực tiếp

### Browser MCP Không Thể Access Figma

**Nguyên nhân**: Figma link cần authentication

**Giải pháp**:
1. Set Figma link thành "Anyone with the link can view"
2. Hoặc export frames (PNG/JPG) và share
3. Hoặc export PDF và share
