# Workflow: Implement Website từ Figma Design với AIKit

Hướng dẫn chi tiết cách sử dụng AIKit + OpenCode để implement website từ Figma design với độ chính xác 1:1 pixel.

## Prerequisites

- ✅ AIKit đã được cài đặt và init
- ✅ OpenCode đã được cài đặt
- ✅ Model: codex-5.1-max (hoặc model tương tự)
- ✅ Figma design link: [Online Education Website Template](https://www.figma.com/design/lC34qpTSy2MYalTIOsj8S2/Online-Education-Website-Free-Template--Community-?node-id=0-1&p=f&t=70yZa7w5wSyjDhYj-0)

## Workflow Chi Tiết

### Bước 1: Khởi Tạo Project

```bash
# Trong terminal
cd your-project-folder
aikit init
aikit install
```

### Bước 2: Tạo Task trong Beads

Trong OpenCode, gõ:

```
/create Implement Online Education Website from Figma design - 1:1 pixel perfect HTML/CSS
```

Hoặc sử dụng command:

```
/ak_cm_plan Implement Online Education Website
```

### Bước 3: Phân Tích Design (Tự Động)

Sử dụng command đơn giản - AIKit sẽ tự động làm tất cả:

```
/ak_cm_analyze-figma https://www.figma.com/design/lC34qpTSy2MYalTIOsj8S2/Online-Education-Website-Free-Template--Community-?node-id=0-1&p=f&t=70yZa7w5wSyjDhYj-0
```

**Command này tự động:**
- ✅ Gọi @vision agent để phân tích design
- ✅ Extract tất cả design tokens:
  - All screens/pages
  - Color palette (hex codes)
  - Typography (fonts, sizes, weights, line heights)
  - Spacing system (8px grid)
  - Component structure
  - Layout grid
  - Responsive breakpoints
  - Assets needed
- ✅ Lưu vào `memory/research/figma-analysis.md`

**Không cần viết prompt dài!** Chỉ cần gõ command và URL.

### Bước 4: Tạo Implementation Plan

Sử dụng `/plan` command:

```
/ak_cm_plan Implement Online Education Website from Figma

Requirements:
- HTML & CSS only (no frameworks)
- 1:1 pixel perfect match với Figma design
- Responsive design
- All screens from Figma
- Clean, semantic HTML
- CSS với variables cho colors và spacing
- Mobile-first approach

Break down into tasks:
1. Setup project structure
2. Extract design tokens (colors, typography, spacing)
3. Create base HTML structure
4. Implement each screen/section
5. Add responsive breakpoints
6. Final pixel-perfect adjustments
```

### Bước 5: Setup Project Structure

Sử dụng @build agent:

```
@build Setup project structure for HTML/CSS website:

Create:
- index.html
- styles/
  - main.css
  - variables.css
  - components.css
  - responsive.css
- assets/
  - images/
  - icons/
- README.md

Initialize with proper HTML5 structure and CSS reset.
```

### Bước 6: Extract Design Tokens

Sử dụng @vision để extract design tokens:

```
@vision Extract design tokens from Figma:

1. Colors - get all hex codes
2. Typography - font families, sizes, line heights, weights
3. Spacing - margin, padding values (should follow 8px grid)
4. Border radius values
5. Shadow values
6. Breakpoints

Create CSS variables in styles/variables.css
```

### Bước 7: Implement từng Section

Sử dụng `/implement` command với @vision để reference design:

```
/ak_cm_implement Homepage Hero Section

@vision Reference Figma design for hero section:
- Extract exact dimensions
- Extract colors, fonts, spacing
- Note any animations or interactions

@build Implement hero section with:
- Exact pixel measurements from Figma
- CSS variables for colors
- Semantic HTML structure
- Mobile responsive
```

Lặp lại cho từng section:
- Header/Navigation
- Hero Section
- Features Section
- Courses Section
- Testimonials
- Footer

### Bước 8: Pixel-Perfect Adjustments

Sử dụng `/review` để check và `/fix` để adjust:

```
/ak_sk_code-review Check pixel-perfect accuracy:

Compare với Figma:
- Spacing (margins, paddings)
- Font sizes và line heights
- Colors (use browser dev tools to verify hex codes)
- Border radius
- Shadows
- Image dimensions

@build Make pixel-perfect adjustments based on review
```

### Bước 9: Responsive Design

```
@build Implement responsive breakpoints:

1. Mobile (320px - 767px)
2. Tablet (768px - 1023px)
3. Desktop (1024px+)

Use CSS media queries
Test at each breakpoint
Ensure design matches Figma at all sizes
```

### Bước 10: Final Quality Check

```
/finish

This will run:
- Type check (if applicable)
- Lint check
- Build verification
- Final review
```

## Commands Hữu Ích

### Core Commands
- `/plan` - Tạo implementation plan
- `/implement` - Implement với TDD
- `/finish` - Complete với quality gates
- `/review` - Code review checklist

### Skills
- `/frontend-aesthetics` - UI/UX guidelines (quan trọng cho pixel-perfect)
- `/tdd` - Test-driven development
- `/plan` - Planning workflow

### Agents
- `@vision` - Phân tích Figma designs, images
- `@build` - Implementation
- `@review` - Code review
- `@planner` - Strategic planning

## Best Practices cho Pixel-Perfect

### 1. Sử dụng Browser DevTools

```
@build When implementing, use browser DevTools to:
- Inspect Figma design elements
- Get exact pixel values
- Verify colors (use color picker)
- Check font sizes
- Measure spacing
```

### 2. CSS Variables

```css
:root {
  /* Colors from Figma */
  --color-primary: #hex-from-figma;
  --color-secondary: #hex-from-figma;
  
  /* Typography */
  --font-family-primary: 'Font Name';
  --font-size-base: 16px;
  
  /* Spacing (8px grid) */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
}
```

### 3. Measurement Tools

```
@vision Help me measure these elements in Figma:
- Component width/height
- Gap between elements
- Padding inside components
- Font sizes
- Line heights
```

### 4. Screenshot Comparison

```
@review Compare implementation với Figma:
1. Take screenshot of Figma design
2. Take screenshot of implemented page
3. Overlay them to check alignment
4. List any discrepancies
5. Fix pixel by pixel
```

## Example Workflow trong OpenCode

```
> /create Implement Online Education Website - Pixel Perfect

> @vision Analyze Figma: [link]
Extract all design tokens and save to memory

> /plan Break down into sections

> @build Setup project structure

> @vision Extract hero section specs from Figma

> @build Implement hero section - pixel perfect

> /review Check hero section accuracy

> @build Fix any pixel misalignments

> [Repeat for each section]

> /finish Final quality check
```

## Tips

1. **Work Section by Section**: Implement từng section một, verify trước khi tiếp tục
2. **Use @vision Frequently**: Reference Figma design thường xuyên
3. **Save Findings**: Use memory để lưu design tokens và decisions
4. **Test Responsive**: Check ở nhiều screen sizes
5. **Browser DevTools**: Essential tool để verify pixel values

## Troubleshooting

### Design không match

```
@review Compare với Figma và list discrepancies
@build Fix each discrepancy one by one
```

### Colors không đúng

```
@vision Extract exact color hex codes from Figma
@build Update CSS variables với correct colors
```

### Spacing không đúng

```
@vision Measure spacing in Figma (use 8px grid)
@build Update margins/paddings to match
```

## Next Steps

Sau khi hoàn thành:
1. `/review` - Final code review
2. `/commit` - Create commit
3. `/pr` - Create pull request (nếu cần)
4. Document trong README.md

