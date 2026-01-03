---
name: design-measurement
description: Extract precise measurements from design references for pixel-perfect implementation
useWhen: User provides design image/mockup and needs exact specifications extracted
category: design
tags:
  - design
  - measurement
  - specification
  - ui
---

# Design Measurement & Specification

## Overview
Extract PRECISE measurements from design references. Don't guess - measure like a designer with ruler + color picker.

## Workflow

### Step 0: Layout Structure Recognition (CRITICAL - DO THIS FIRST!)

**Before any measurements, identify the exact layout structure:**

```markdown
## Layout Structure Analysis

**Overall canvas:** [width × height, e.g., 1280×844]

**Layout type:** 
- [ ] Single column centered
- [ ] Two columns (sidebar + main)
- [ ] Three columns (sidebar + main + aside)
- [ ] Grid layout (specify columns/rows)
- [ ] Custom (describe)

**Column breakdown (if multi-column):**
- Left sidebar: x=[start..end] ([width]px), contains: [nav/menu/etc.]
- Main content: x=[start..end] ([width]px), contains: [hero/cards/feed/etc.]
- Right aside: x=[start..end] ([width]px), contains: [profile/activity/etc.]

**Vertical sections (top to bottom):**
1. Header/TopBar: y=[0..[height]] ([height]px) - contains: [search/icons/etc.]
2. Hero: y=[[start]..[end]] ([height]px) - contains: [banner/heading/etc.]
3. Section A: y=[[start]..[end]] ([height]px) - contains: [cards/list/etc.]
4. Section B: y=[[start]..[end]] ([height]px) - contains: [...]
...

**Key spacing measurements:**
- Outer margins: top=[?px], right=[?px], bottom=[?px], left=[?px]
- Column gaps: [?px] between columns
- Section gaps: [?px] between vertical sections
```

**VERIFY THIS STRUCTURE BEFORE PROCEEDING!**

### Step 1: Layout Measurement
Measure pixel dimensions and positions:

```markdown
## Layout Specification
- **Container**: [width, e.g., 1200px max-width] centered? full-width?
- **Header**: [height, e.g., 80px], fixed/sticky/static?
- **Sections**: 
  - Hero: [height, e.g., 600px], layout: [describe, e.g., 2-column 50/50]
  - Section 2: [height], layout: [describe]
- **Grid**: [columns, e.g., 12-column grid] or flexbox?
- **Breakpoints**: Mobile [?px], Tablet [?px], Desktop [?px]
```

**How to measure:**
- Count pixels from edges to elements
- Measure element widths and heights
- Note alignment (centered, left, right, justified)
- Identify grid systems (12-col? CSS Grid? Flexbox?)

### Step 2: Color Extraction (Exact Hex Values)

**CRITICAL: Extract precise hex codes, don't approximate!**

```markdown
## Color Palette
### Primary Colors
- Background primary: #[exact hex] - [where used]
- Background secondary: #[exact hex] - [where used]
- Text primary: #[exact hex] - [body text]
- Text secondary: #[exact hex] - [muted text]

### Accent Colors
- Accent primary: #[exact hex] - [CTA buttons, highlights]
- Accent hover: #[exact hex] - [button hover state]
- Accent secondary: #[exact hex] - [secondary elements]

### UI Colors
- Border: #[exact hex]
- Shadow color: rgba([r, g, b, alpha])
- Success: #[hex]
- Error: #[hex]
- Warning: #[hex]
```

**Extraction method:**
- Sample the brightest pixel of each color area
- For dark backgrounds, sample the darkest pixel
- For gradients, note start and end colors
- For shadows, identify color + opacity

### Step 3: Typography Measurement

**Measure font sizes by comparing to known reference (16px base)**

```markdown
## Typography Scale
### Headings
- **H1**: [size, e.g., 72px], weight: [e.g., 700 bold], line-height: [e.g., 1.1], letter-spacing: [e.g., -1px]
- **H2**: [size, e.g., 48px], weight: [...], line-height: [...], letter-spacing: [...]
- **H3**: [size, e.g., 32px], weight: [...], line-height: [...], letter-spacing: [...]

### Body Text
- **Large**: [size, e.g., 20px], weight: [e.g., 400], line-height: [e.g., 1.6]
- **Medium**: [size, e.g., 16px], weight: [...], line-height: [...]
- **Small**: [size, e.g., 14px], weight: [...], line-height: [...]

### Special
- **Button**: [size, e.g., 16px], weight: [e.g., 500 medium], uppercase?: [yes/no]
- **Caption**: [size, e.g., 12px], weight: [...], color: [#hex]

### Font Family
- Primary: [identify style: geometric sans? humanist? serif?]
- Suggested: Inter, Poppins, SF Pro, Helvetica Neue
- Monospace (if code): [...]
```

**Measurement technique:**
- Measure character height in pixels
- Count line spacing (line-height = line gap / font size)
- Observe font weight (thin/light/regular/medium/semibold/bold/black)
- Note letter-spacing (tight/normal/wide)

### Step 4: Spacing System

**Identify the spacing unit (usually 4px or 8px grid)**

```markdown
## Spacing System
### Base Unit: [4px or 8px?]

### Component Spacing
- **Header padding**: top: [?px], right: [?px], bottom: [?px], left: [?px]
- **Button padding**: vertical: [?px], horizontal: [?px]
- **Card padding**: [?px] all sides or [specify each]
- **Input padding**: [?px]

### Layout Spacing
- **Section gaps**: [vertical space between sections, e.g., 80px]
- **Container padding**: horizontal: [?px on mobile/tablet/desktop]
- **Grid gap**: [space between grid items, e.g., 24px]

### Text Spacing
- **Heading to body**: [gap, e.g., 16px]
- **Paragraph gap**: [e.g., 16px]
- **List item gap**: [e.g., 12px]

### Scale (based on base unit)
- xs: [?px]
- sm: [?px]
- md: [?px]
- lg: [?px]
- xl: [?px]
- 2xl: [?px]
```

### Step 5: Component Specifications

**Measure EVERY interactive element precisely**

```markdown
## Component Specs

### Buttons
#### Primary Button
- **Dimensions**: height: [?px], width: [auto/fixed ?px], min-width: [?px]
- **Padding**: top/bottom: [?px], left/right: [?px]
- **Border radius**: [?px]
- **Background**: [#hex]
- **Text**: size: [?px], weight: [?], color: [#hex]
- **Border**: [width ?px] [style] [#hex color]
- **Shadow**: [e.g., 0 4px 12px rgba(0,0,0,0.15)]
- **Hover**: background: [#hex], transform: [translateY(-2px)?], shadow: [...]
- **Active**: background: [#hex], transform: [scale(0.98)?]
- **Disabled**: opacity: [0.5?], cursor: not-allowed

#### Secondary Button
[Same format as above]

### Input Fields
- **Height**: [?px]
- **Padding**: [?px]
- **Border**: [width] [style] [color], radius: [?px]
- **Focus**: border-color: [#hex], box-shadow: [...]
- **Placeholder**: color: [#hex]

### Cards
- **Padding**: [?px]
- **Border radius**: [?px]
- **Background**: [#hex]
- **Border**: [if any]
- **Shadow**: [box-shadow value]

### Badges/Pills
- **Height**: [?px]
- **Padding**: horizontal: [?px]
- **Border radius**: [?px] (usually height/2 for pill shape)
- **Background**: [#hex or rgba()]
- **Text**: size: [?px], weight: [?], color: [#hex]

### Images
- **Dimensions**: [width × height]
- **Border radius**: [?px]
- **Shadow**: [if any]
- **Border**: [if any]
- **Object-fit**: cover/contain/fill?
```

### Step 6: Effects & Decorations

```markdown
## Visual Effects

### Shadows
- **Card shadow**: box-shadow: [e.g., 0 2px 8px rgba(0,0,0,0.1)]
- **Button shadow**: [...]
- **Hover shadow**: [...]
- **Text shadow**: [if any]

### Borders
- **Default**: [width] solid [#hex]
- **Focus**: [width] solid [#hex]
- **Subtle**: 1px solid rgba([r,g,b,alpha])

### Gradients
- **Background gradient**: linear-gradient([angle], [#hex] [stop%], [#hex] [stop%])
- **Text gradient**: [if any]
- **Overlay**: [if any, e.g., rgba(0,0,0,0.5)]

### Border Radius
- **Small**: [e.g., 4px] - for buttons, inputs
- **Medium**: [e.g., 8px] - for cards
- **Large**: [e.g., 16px] - for large components
- **Full**: [e.g., 9999px] - for pills, avatars

### Opacity/Transparency
- **Disabled states**: [e.g., 0.5]
- **Overlays**: [e.g., 0.8]
- **Subtle backgrounds**: [e.g., rgba(255,255,255,0.05)]

### Animations (if visible in design)
- **Transition duration**: [e.g., 200ms]
- **Easing**: ease-out / ease-in / cubic-bezier(...)
- **Properties**: transform, opacity, background-color
```

### Step 7: Asset Requirements

```markdown
## Assets Needed

### Images (use placeholders during development)
- hero-banner.png: [dimensions], **PLACEHOLDER: Use solid gradient or blank colored rectangle**
- card-image-1.png: [dimensions], **PLACEHOLDER: Use solid color block**
- profile-avatar.png: [dimensions], **PLACEHOLDER: Use circular gradient or user icon**
- illustration-1.svg: [dimensions], **PLACEHOLDER: Use geometric shape**

### Icons (use icon library)
**Icon library to use:** Material Icons / Heroicons / Lucide / Font Awesome
- home-icon: 24×24px, **USE: home icon from library**
- search-icon: 20×20px, **USE: magnifying-glass icon**
- bell-icon: 24×24px, **USE: bell/notification icon**
- settings-icon: 24×24px, **USE: gear/settings icon**
- user-icon: 24×24px, **USE: user-circle icon**

### Fonts
- Primary font: [identify characteristics, suggest: Inter/Poppins/etc.]
- Weights needed: [300, 400, 500, 700?]
- Fallback: system-ui, sans-serif
- Loading: Google Fonts / self-hosted / system

**CRITICAL NOTES FOR IMPLEMENTATION:**
- All images should be **temporary placeholders** (solid colors, gradients, or simple shapes)
- All icons should use **built-in icon library** (Material Icons, Heroicons, Lucide)
- Focus on **layout accuracy**, not asset accuracy
- Real assets can be swapped in later
```

### Step 8: Component Placement Map

**Create a precise component map showing EXACT positions:**

```markdown
## Component Placement Map

**Left Sidebar (x=[start]-[end], [width]px wide):**
- Logo: y=[?], height=[?px], **PLACEHOLDER: circle with initial**
- Nav item 1: y=[?], height=[44px], **ICON: home + text**
- Nav item 2: y=[?], height=[44px], **ICON: music + text**
...

**Top Bar (y=0-[height], full width):**
- Search: x=[?], y=[?], width=[?px], height=[36px], **ICON: search**
- Icon 1: x=[?], y=[?], size=[24×24], **ICON: bell**
...

**Hero (x=[?]-[?], y=[?]-[?]):**
- Background: **PLACEHOLDER: gradient from #[color1] to #[color2]**
- Heading: centered, y=[?]
- **PLACEHOLDER IMAGE: 3D illustration → use gradient rectangle**

**Main Content Cards:**
Card 1: x=[?], y=[?], width=[?px], height=[?px]
  - Background: **PLACEHOLDER: gradient**
  - Avatar: **PLACEHOLDER: circle with icon**
  - Image: **PLACEHOLDER: colored rectangle**
  - Title: [text]
  - Stats: [icons + numbers]
...
```

## Verification Checklist

After extraction, verify:
- [ ] All hex colors are exact (not approximated)
- [ ] All measurements are in pixels (not guessed)
- [ ] Spacing follows consistent system (4px/8px grid)
- [ ] Typography scale is proportional
- [ ] All interactive states documented (hover/focus/active/disabled)
- [ ] Shadow values are complete (offset, blur, spread, color)
- [ ] Border radius values noted for all components
- [ ] Asset dimensions specified
- [ ] Responsive breakpoints identified

## Output Format

**Generate a complete design specification document:**

```markdown
# Design Specification: [Project Name]
*Generated from: image.png*

[Include all sections above with PRECISE measurements]

## Implementation Notes
- Grid system: [8px base]
- CSS variables recommended: Yes
- Mobile-first approach: Yes/No
- Browser support: Modern browsers (last 2 versions)
```

## Anti-Patterns

❌ **Don't do this:**
- "Colors look dark, maybe #333"
- "Font size seems large, probably 48px"
- "Some padding, around 20px or so"
- "Button has rounded corners"

✅ **Do this:**
- "Background: #0a0a0a (sampled from darkest pixel)"
- "H1: 72px (measured by comparing to 16px base)"
- "Button padding: 14px vertical, 32px horizontal (measured from edge to text)"
- "Button border-radius: 8px (measured corner arc)"

## Checklist

- [ ] Layout measured with pixel dimensions
- [ ] Colors extracted with exact hex codes
- [ ] Typography sizes measured precisely
- [ ] Spacing system identified (4px/8px grid)
- [ ] All components specs documented
- [ ] Effects and shadows specified
- [ ] Assets list created
- [ ] Verification completed
