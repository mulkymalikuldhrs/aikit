---
name: accessibility
description: Use when building accessible UI that works for all users
useWhen: The user asks to make UI accessible, add ARIA labels, or ensure WCAG compliance
category: design
tags:
  - accessibility
  - a11y
  - wcag
  - inclusive-design
---

# Accessibility (a11y)

## Overview
Build interfaces that are usable by everyone, including people with disabilities. Follow WCAG 2.1 guidelines.

## Workflow

### Step 1: Semantic HTML
1. Use correct HTML elements
2. Use heading hierarchy (h1 → h2 → h3)
3. Use proper form labels
4. Use landmarks (nav, main, aside)

**Checklist:**
- [ ] Buttons use `<button>`, not `<div>`
- [ ] Links use `<a>`, not clickable divs
- [ ] Forms have `<label>` elements
- [ ] Headings are in order (no skipping)
- [ ] Lists use `<ul>` or `<ol>`

### Step 2: Keyboard Navigation
1. Ensure all interactive elements are keyboard accessible
2. Provide visible focus indicators
3. Implement logical tab order
4. Handle keyboard shortcuts

**Checklist:**
- [ ] All interactive elements reachable via Tab
- [ ] Focus indicators are visible
- [ ] Tab order is logical
- [ ] Escape closes modals/dropdowns
- [ ] Enter/Space activate buttons
- [ ] Arrow keys work in menus/lists

### Step 3: ARIA Attributes
1. Add ARIA labels where needed
2. Use ARIA roles appropriately
3. Manage ARIA states
4. Provide ARIA descriptions

**Common ARIA:**
- `aria-label`: Descriptive label
- `aria-labelledby`: Reference to label element
- `aria-describedby`: Additional description
- `aria-hidden`: Hide decorative elements
- `aria-live`: Announce dynamic changes
- `role`: Define element role

**Example:**
```html
<button aria-label="Close dialog">
  <span aria-hidden="true">×</span>
</button>
```

### Step 4: Color and Contrast
1. Ensure sufficient color contrast (WCAG AA: 4.5:1)
2. Don't rely on color alone
3. Provide alternative indicators
4. Test with color blindness simulators

**Checklist:**
- [ ] Text contrast meets WCAG AA (4.5:1)
- [ ] Large text contrast meets WCAG AA (3:1)
- [ ] Interactive elements have 3:1 contrast
- [ ] Information not conveyed by color alone
- [ ] Focus indicators are visible

### Step 5: Images and Media
1. Provide alt text for images
2. Provide captions for videos
3. Provide transcripts for audio
4. Mark decorative images appropriately

**Alt Text Guidelines:**
- Descriptive and concise
- Conveys same information as image
- Empty alt="" for decorative images
- Include text in images in alt text

### Step 6: Forms
1. Associate labels with inputs
2. Provide error messages
3. Indicate required fields
4. Provide helpful instructions

**Checklist:**
- [ ] All inputs have labels
- [ ] Labels are associated (for/id)
- [ ] Required fields indicated
- [ ] Error messages are clear
- [ ] Errors are announced to screen readers

### Step 7: Testing
1. Test with keyboard only
2. Test with screen reader
3. Use automated tools (axe, Lighthouse)
4. Test with real users when possible

**Tools:**
- axe DevTools
- Lighthouse
- WAVE
- Screen readers (NVDA, JAWS, VoiceOver)

## WCAG Principles
1. **Perceivable**: Information must be presentable to users
2. **Operable**: Interface components must be operable
3. **Understandable**: Information and UI operation must be understandable
4. **Robust**: Content must be robust enough for assistive technologies

## Common Issues
- Missing alt text
- Poor color contrast
- Missing focus indicators
- Non-semantic HTML
- Missing ARIA labels
- Keyboard traps
- Missing form labels

## Verification
- [ ] Keyboard navigation works
- [ ] Screen reader tested
- [ ] Color contrast passes
- [ ] All images have alt text
- [ ] Forms are accessible
- [ ] Automated tools pass






