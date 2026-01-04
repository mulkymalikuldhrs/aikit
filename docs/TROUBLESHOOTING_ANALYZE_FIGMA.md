# Troubleshooting /analyze-figma Command

## Vấn Đề: AI Không Nhận Ra URL Trong Command

### Triệu Chứng
Khi bạn gõ:
```
/ak_cm_analyze-figma https://www.figma.com/design/...
```

AI trả lời: "I can't start the analysis because no Figma URL was provided"

### Giải Pháp

**Cách 1: Đảm Bảo URL Đúng Format**

Command phải có format:
```
/ak_cm_analyze-figma <space> <url>
```

Ví dụ đúng:
```
/ak_cm_analyze-figma https://www.figma.com/design/lC34qpTSy2MYalTIOsj8S2/Online-Education-Website-Free-Template--Community-?node-id=0-1&t=70yZa7w5wSyjDhYj-1
```

**Cách 2: Nếu Vẫn Không Hoạt Động**

Thử format này:
```
/analyze-figma
https://www.figma.com/design/lC34qpTSy2MYalTIOsj8S2/Online-Education-Website-Free-Template--Community-?node-id=0-1&t=70yZa7w5wSyjDhYj-1
```

**Cách 3: Sử Dụng @vision Trực Tiếp**

Nếu command không hoạt động, bạn có thể gọi @vision trực tiếp:

```
@vision Analyze this Figma design: https://www.figma.com/design/lC34qpTSy2MYalTIOsj8S2/Online-Education-Website-Free-Template--Community-?node-id=0-1&t=70yZa7w5wSyjDhYj-1

Extract:
- All screens/pages
- Color palette (hex codes)
- Typography system
- Spacing system (8px grid)
- Component structure
- Layout grid
- Responsive breakpoints
- Assets needed

Save to memory/research/figma-analysis.md
```

## Vấn Đề: @vision Không Thể Access Figma Link

### Triệu Chứng
@vision báo: "I tried opening the Figma link, but it requires interactive access/authentication"

### Giải Pháp

**Bước 1: Verify Link Permission**
1. Mở Figma design
2. Click "Share" button
3. Set permission to "Anyone with the link can view"
4. Copy link mới

**Bước 2: Export Frames**
1. Trong Figma, select frames bạn muốn analyze
2. Right-click → Export
3. Export as PNG hoặc JPG
4. Share images với AI

**Bước 3: Sử Dụng PDF Export**
1. Trong Figma, File → Export → PDF
2. Share PDF với AI

## Vấn Đề: Command Không Tồn Tại

### Triệu Chứng
OpenCode không nhận ra `/analyze-figma` command

### Giải Pháp

**Bước 1: Reinstall AIKit**
```bash
cd aikit-test-prj
aikit install
```

**Bước 2: Verify Command Created**
Check file: `.opencode/command/analyze-figma.md`

**Bước 3: Restart OpenCode**
Đóng và mở lại OpenCode để reload commands

## Best Practices

1. **Luôn có space** giữa command và URL
2. **Copy full URL** từ Figma (bao gồm query parameters)
3. **Verify link permission** trước khi analyze
4. **Use @vision directly** nếu command không hoạt động

## Alternative: Manual Analysis

Nếu command không hoạt động, bạn có thể:

1. **Sử dụng @vision trực tiếp** (như trên)
2. **Export frames** và analyze từng frame
3. **Sử dụng Figma Dev Mode** để extract tokens manually

