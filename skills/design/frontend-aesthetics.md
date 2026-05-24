---
name: frontend-aesthetics
description: Use when building UI components to ensure visual quality
useWhen: The user asks to create UI, build components, or work on frontend aesthetics
category: design
tags:
  - ui
  - design
  - frontend
  - css
---

# Frontend Aesthetics

## Overview
Ensure visual consistency and quality when building UI components.

## Workflow

### Step 1: Gather Design Context
Before writing any code:

**If a design reference (image/Figma/mockup) is provided, ANALYZE IT CAREFULLY:**

**Visual Analysis (examine the design image 1:1):**
- [ ] **Layout Structure**: Header? Sidebar? Grid? Flexbox? Absolute positioning?
- [ ] **Colors** (extract exact values): Background (#000000?), Text (#ffffff?), Accents (#b7f205?)
- [ ] **Typography**: Font families? Heading sizes (48px? 72px?)? Weights (bold/normal)?
- [ ] **Spacing**: Padding between elements? Section gaps? Component spacing?
- [ ] **Components Visible**: Buttons, badges, cards, images, icons - list them ALL
- [ ] **Button Styles**: Shape? Border radius? Padding? Colors? Hover states?
- [ ] **Images/Assets**: What images are shown? Logos? Icons? Photos? Illustrations?
- [ ] **Effects**: Shadows? Gradients? Blur? Opacity? Animations?
- [ ] **Responsive Clues**: Any mobile/tablet elements visible?

**Write detailed observations:**
```markdown
## Design Analysis (from reference image)
- Layout: [Exact structure, e.g., "Fixed header, two-column hero, services ribbon"]
- Background: [Color, e.g., "#0a0a0a dark with subtle gradient"]  
- Header: [Logo position, nav items, CTA button style]
- Hero: [Title size/weight, subtitle, CTA buttons, image placement]
- Colors: Primary: #color1, Accent: #color2, Text: #color3
- Typography: Headings: [size/weight], Body: [size/weight]
- Spacing: [Pattern, e.g., "8px grid, 64px section gaps"]
- Components: [List every element: badge, buttons, image container, etc.]
- Assets needed: [logo.svg, hero-image.png, icons, etc.]
```

**Then check for existing patterns:**
1. Check for existing design system/components
2. Look for style guides or theme files
3. Identify color palette, typography, spacing
4. Note existing UI patterns

**Commands:**
```bash
# Find style files
find src -name "*.css" -o -name "*.scss" -o -name "theme*"

# Find component library
ls src/components/ui/ 2>/dev/null || ls src/components/

# Check for Tailwind config
cat tailwind.config.* 2>/dev/null
```

### Step 2: Review Design Requirements
Ask or identify:
- [ ] What is the component's purpose?
- [ ] What states does it need? (hover, active, disabled, loading)
- [ ] What sizes/variants are needed?
- [ ] What is the responsive behavior?
- [ ] Any animations/transitions?

### Step 3: Build Component Structure
1. Start with semantic HTML
2. Add accessibility attributes (ARIA)
3. Structure for all states
4. Plan responsive breakpoints

**Template:**
```tsx
interface ComponentProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}

export function Component({ 
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  children 
}: ComponentProps) {
  return (
    <div 
      role="region"
      aria-busy={loading}
      aria-disabled={disabled}
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        disabled && disabledStyles
      )}
    >
      {loading ? <Spinner /> : children}
    </div>
  );
}
```

### Step 4: Apply Styles
Follow these principles:
1. Use existing design tokens
2. Maintain consistent spacing (4px grid)
3. Ensure sufficient contrast
4. Add smooth transitions

**Spacing scale:**
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px

**Typography:**
- Consistent font family
- Clear hierarchy
- Readable line height (1.5)
- Appropriate font sizes

### Step 5: Add Interactivity
1. Hover states
2. Focus states (keyboard accessibility)
3. Active states
4. Disabled states
5. Loading states

**Focus checklist:**
- [ ] Visible focus ring
- [ ] Focus within (for compound components)
- [ ] Skip link if needed

### Step 6: Test Responsively
Check at breakpoints:
- Mobile: 320px, 375px
- Tablet: 768px
- Desktop: 1024px, 1440px

### Step 7: Accessibility Check
- [ ] Color contrast ≥ 4.5:1
- [ ] Focus visible
- [ ] Screen reader friendly
- [ ] Keyboard navigable
- [ ] No motion issues

## Design Principles
1. **Consistency**: Match existing patterns
2. **Hierarchy**: Clear visual importance
3. **Affordance**: Interactive elements look clickable
4. **Feedback**: State changes are visible
5. **Accessibility**: Works for everyone

## Anti-Patterns
- Inline styles
- Magic numbers (use tokens)
- Missing hover/focus states
- Breaking existing patterns
- Ignoring mobile

---

> **Contact:** Mulky Malikul Dhaher — [mulkymalikuldhaher@email.com](mailto:mulkymalikuldhaher@email.com)
>
> **Disclaimer:** This project is for Education Purpose only. Risiko apapun tidak kita tanggung. (We are not responsible for any risks or damages.)
