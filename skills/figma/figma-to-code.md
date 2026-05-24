---
name: figma-to-code
description: Convert Figma designs to pixel-perfect HTML/CSS code
useWhen: The user wants to implement a website from Figma design with 1:1 pixel accuracy
category: figma
tags:
  - figma
  - design
  - html
  - css
  - pixel-perfect
---

# Figma to Code Skill

Workflow to convert Figma designs thành pixel-perfect HTML/CSS code.

## Overview

Skill này guides process implement website from Figma design with 1:1 pixel accuracy, using HTML & CSS thuần.

## Workflow

### Step 1: Analyze Design with @vision Agent

**Action**: Use @vision agent to phân tích Figma design

**IMPORTANT**: User sẽ cung cấp Figma URL in message. Extract URL from user input.

**Workflow**:
1. **Extract Figma URL** from user message/input
   - URL thường bắt đầu with `https://www.figma.com/design/`
   - Hoặc user have thể cung cấp in previous messages
   - Extract ENTIRE URL including query parameters

2. **Immediately call @vision** with URL:

```
@vision Analyze this Figma design: [extracted URL]

Extract and document:
1. **All Screens/Pages**: List tất cả screens in design
2. **Color Palette**: Extract all hex color codes
3. **Typography**: 
   - Font families
   - Font sizes (all variations)
   - Font weights
   - Line heights
4. **Spacing System**: 
   - Margin values
   - Padding values
   - Gap values
   - Verify 8px grid system
5. **Component Structure**: 
   - Header/Navigation
   - Hero sections
   - Content sections
   - Footer
6. **Layout Grid**: 
   - Container widths
   - Column system
   - Breakpoints
7. **Assets**: 
   - Images needed
   - Icons needed
   - Fonts needed
8. **Responsive Breakpoints**: 
   - Mobile (320-767px)
   - Tablet (768-1023px)
   - Desktop (1024px+)

Save findings to: memory/research/figma-analysis.md
```

**Output**: File `memory/research/figma-analysis.md` with tất cả design tokens

**If @vision cannot access**: Ask user to export frames (PNG/JPG) or set link to "Anyone with the link can view"

### Step 2: Create Implementation Plan

**Action**: Use `/plan` command

```
/plan Implement [Website Name] from Figma Design

Requirements:
- HTML & CSS only (no frameworks unless specified)
- 1:1 pixel perfect match with Figma
- Responsive design (mobile-first)
- All screens from Figma
- Clean, semantic HTML5
- CSS with custom properties (variables)
- Accessible (WCAG AA)

Break down into tasks:
1. Setup project structure
2. Extract and setup design tokens (CSS variables)
3. Create base HTML structure
4. Implement Header/Navigation
5. Implement Hero Section
6. Implement [Section 1]
7. Implement [Section 2]
8. ... (list all sections)
9. Implement Footer
10. Add responsive breakpoints
11. Pixel-perfect adjustments
12. Final quality check
```

**Output**: Detailed plan with task breakdown

### Step 3: Setup Project Structure

**Action**: Use @build agent

```
@build Setup project structure:

Create:
- index.html (HTML5 structure)
- styles/
  - variables.css (design tokens)
  - reset.css (CSS reset)
  - base.css (base styles)
  - components.css (reusable components)
  - layout.css (layout utilities)
  - responsive.css (media queries)
- assets/
  - images/
  - icons/
  - fonts/
- README.md (project documentation)

Initialize with:
- Proper HTML5 doctype
- Semantic structure
- CSS reset (normalize.css or custom)
- CSS variables setup
```

**Checklist**:
- [ ] Project structure created
- [ ] HTML5 boilerplate ready
- [ ] CSS files organized
- [ ] Assets folders created

### Step 4: Extract Design Tokens

**Action**: Create CSS variables from Figma analysis

```
@vision Extract exact design tokens from Figma:

For each token category:
1. Colors: Get hex codes (use browser DevTools color picker if needed)
2. Typography: Font names, sizes, weights, line heights
3. Spacing: All margin/padding values (verify 8px grid)
4. Border radius: All radius values
5. Shadows: Box shadow values
6. Breakpoints: Responsive breakpoints

@build Create styles/variables.css with:

:root {
  /* Colors */
  --color-primary: #hex;
  --color-secondary: #hex;
  --color-text: #hex;
  --color-bg: #hex;
  /* ... all colors */
  
  /* Typography */
  --font-family-primary: 'Font Name', sans-serif;
  --font-size-xs: 12px;
  --font-size-sm: 14px;
  --font-size-base: 16px;
  /* ... all sizes */
  
  /* Spacing (8px grid) */
  --spacing-1: 4px;
  --spacing-2: 8px;
  --spacing-3: 16px;
  /* ... all spacing */
  
  /* Layout */
  --container-max-width: 1200px;
  --grid-columns: 12;
  
  /* Breakpoints */
  --breakpoint-mobile: 768px;
  --breakpoint-tablet: 1024px;
  --breakpoint-desktop: 1280px;
}
```

**Checklist**:
- [ ] All colors extracted and added to variables
- [ ] Typography system defined
- [ ] Spacing system follows 8px grid
- [ ] Breakpoints defined

### Step 5: Implement Base Structure

**Action**: Tạo base HTML and CSS

```
@build Create base HTML structure:

1. HTML5 semantic structure
2. Meta tags (viewport, charset, etc.)
3. Link CSS files in order
4. Basic layout structure

@build Create base CSS:

1. CSS reset
2. Base typography styles
3. Base layout utilities
4. Container class
```

**Checklist**:
- [ ] HTML structure semantic and accessible
- [ ] CSS reset applied
- [ ] Base styles working
- [ ] Container layout working

### Step 6: Implement Sections (One by One)

**Action**: Implement fromng section with pixel-perfect accuracy

**Workflow for mỗi section**:

```
@vision Analyze [Section Name] in Figma:

Extract:
- Exact dimensions (width, height)
- Colors used
- Typography (font, size, weight)
- Spacing (margins, paddings)
- Any special effects (shadows, gradients)
- Responsive behavior

@build Implement [Section Name]:

Requirements:
- Exact pixel measurements from Figma
- Use CSS variables
- Semantic HTML
- Mobile responsive
- Match design 1:1

Code structure:
1. HTML markup (semantic)
2. CSS styling (use variables)
3. Responsive adjustments
4. Verify with browser DevTools
```

**Sections thường have**:
1. Header/Navigation
2. Hero Section
3. Features Section
4. Content Sections
5. Testimonials
6. Footer

**Checklist for mỗi section**:
- [ ] HTML structure semantic
- [ ] CSS matches Figma exactly
- [ ] Colors correct (verify hex codes)
- [ ] Typography matches (font, size, weight)
- [ ] Spacing matches (margins, paddings)
- [ ] Responsive working
- [ ] Cross-browser tested

### Step 7: Pixel-Perfect Adjustments

**Action**: Fine-tune to đạt 1:1 accuracy

```
/review Check pixel-perfect accuracy:

For each section:
1. Open Figma design
2. Open implemented page in browser
3. Use browser DevTools to inspect
4. Compare measurements:
   - Width/Height
   - Margins/Paddings
   - Font sizes
   - Line heights
   - Colors (use color picker)
   - Border radius
   - Shadows
5. List all discrepancies

@build Fix discrepancies:

For each discrepancy:
1. Identify exact value needed
2. Update CSS
3. Verify in browser
4. Compare again with Figma
```

**Tools**:
- Browser DevTools (Chrome/Firefox)
- Figma Dev Mode (if have)
- Pixel measurement tools

**Checklist**:
- [ ] All measurements match Figma
- [ ] Colors verified (use color picker)
- [ ] Typography matches exactly
- [ ] Spacing matches (8px grid verified)
- [ ] Shadows match
- [ ] Border radius matches

### Step 8: Responsive Design

**Action**: Implement responsive breakpoints

```
@build Implement responsive design:

1. Mobile (320px - 767px):
   - Stack elements vertically
   - Adjust font sizes
   - Adjust spacing
   - Hide/show elements as needed

2. Tablet (768px - 1023px):
   - 2-column layouts where appropriate
   - Adjusted spacing
   - Medium font sizes

3. Desktop (1024px+):
   - Full layout
   - Maximum container width
   - All features visible

Use CSS media queries:
@media (min-width: 768px) { ... }
@media (min-width: 1024px) { ... }

Test at each breakpoint
```

**Checklist**:
- [ ] Mobile layout working
- [ ] Tablet layout working
- [ ] Desktop layout working
- [ ] Tested at multiple screen sizes
- [ ] No horizontal scroll
- [ ] Touch targets adethroughte (44x44px minimum)

### Step 9: Final Quality Check

**Action**: Run throughlity gates

```
/finish

This runs:
- Code review
- Browser testing
- Responsive testing
- Accessibility check
- Performance check
```

**Manual Checks**:
- [ ] All sections implemented
- [ ] Pixel-perfect match with Figma
- [ ] Responsive at all breakpoints
- [ ] Cross-browser compatible
- [ ] Accessible (WCAG AA)
- [ ] Performance optimized
- [ ] Code clean and maintainable

### Step 10: Documentation

**Action**: Document implementation

```
@build Update README.md:

Include:
- Project description
- Design source (Figma link)
- Setup instructions
- File structure
- Design tokens reference
- Browser support
- Notes on implementation decisions
```

## Best Practices

### 1. Measurement Accuracy
- Always use browser DevTools to verify measurements
- Use Figma's measurement tools
- Double-check with screenshot comparison

### 2. CSS Variables
- Use variables for tất cả design tokens
- Makes updates easier
- Ensures consistency

### 3. Semantic HTML
- Use proper HTML5 semantic elements
- Accessible by default
- Better SEO

### 4. Mobile-First
- Start with mobile layout
- Add complexity for larger screens
- Better performance

### 5. Testing
- Test frequently during development
- Use browser DevTools
- Test on real devices if possible

## Common Issues & Solutions

### Colors not match
**Solution**: Use browser color picker to get exact hex code from Figma

### Spacing not đúng
**Solution**: Verify 8px grid, use DevTools to measure exact values

### Font sizes not match
**Solution**: Check line-height, font-weight, and exact pixel size

### Responsive breaks
**Solution**: Test at exact breakpoints, adjust media queries

## Checklist Summary

- [ ] Figma design analyzed
- [ ] Design tokens extracted
- [ ] Project structure setup
- [ ] CSS variables created
- [ ] Base HTML/CSS ready
- [ ] All sections implemented
- [ ] Pixel-perfect adjustments done
- [ ] Responsive design working
- [ ] Quality checks passed
- [ ] Documentation complete

## Output

- ✅ Pixel-perfect HTML/CSS website
- ✅ Responsive design
- ✅ Clean, maintainable code
- ✅ Design tokens documented
- ✅ README with setup instructions


---

> **Contact:** Mulky Malikul Dhaher — [mulkymalikuldhaher@email.com](mailto:mulkymalikuldhaher@email.com)
>
> **Disclaimer:** This project is for Education Purpose only. Risiko apapun tidak kita tanggung. (We are not responsible for any risks or damages.)
