# Hướng Dẫn Sử Dụng /analyze-figma Command

## Cách Sử Dụng

### Bước 1: Reinstall AIKit (Nếu chưa có command mới)

```bash
cd aikit-test-prj
aikit install
```

### Bước 2: Sử Dụng Command trong OpenCode

Chỉ cần gõ:

```
/ak_cm_analyze-figma https://www.figma.com/design/lC34qpTSy2MYalTIOsj8S2/Online-Education-Website-Free-Template--Community-?node-id=0-1&t=70yZa7w5wSyjDhYj-1
```

## Command Sẽ Tự Động:

1. ✅ **Tự động gọi @vision agent** với URL bạn cung cấp
2. ✅ **Tự động extract** tất cả design tokens:
   - All screens/pages
   - Color palette (hex codes)
   - Typography system
   - Spacing system (8px grid)
   - Component structure
   - Layout grid
   - Responsive breakpoints
   - Assets needed
3. ✅ **Tự động lưu** vào `memory/research/figma-analysis.md`
4. ✅ **Báo cáo** những gì đã extract

## Lưu Ý

Nếu @vision không thể access Figma link (cần authentication):
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

