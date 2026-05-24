---
name: component-design
description: Use when designing React/Vue components or UI components
useWhen: The user asks to design a component, create a reusable component, or structure UI components
category: development
tags:
  - component
  - ui
  - react
  - vue
---

# Component Design

## Overview
Design reusable, maintainable UI components following composition and single responsibility principles.

## Workflow

### Step 1: Analyze Requirements
1. What is the component's purpose?
2. What data does it need?
3. What interactions does it support?
4. Where will it be used?

**Questions:**
- Is this a presentational or container component?
- What props does it need?
- What events does it emit?
- Is it reusable or specific?

### Step 2: Design Component Interface
1. Define props/inputs
2. Define events/callbacks
3. Define slots/children
4. Consider variants and states

**Props Design:**
- Keep props minimal
- Use composition over configuration
- Provide sensible defaults
- Type all props

**Example:**
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}
```

### Step 3: Design Component Structure
1. Break into smaller components if needed
2. Identify reusable parts
3. Design composition pattern
4. Plan for extensibility

**Composition Patterns:**
- Compound components
- Render props
- Higher-order components
- Hooks for shared logic

### Step 4: Design State Management
1. Identify local state
2. Identify shared state
3. Choose state management approach
4. Design state shape

**State Decisions:**
- Local state: Component-specific
- Lifted state: Shared between siblings
- Context: Shared across tree
- External store: Global state

### Step 5: Design Styling Approach
1. Choose styling method (CSS modules, styled-components, Tailwind)
2. Design responsive behavior
3. Plan for theming
4. Consider accessibility

**Styling Principles:**
- Consistent spacing system
- Reusable design tokens
- Mobile-first approach
- Accessible colors and contrast

### Step 6: Write Component
1. Start with types/interfaces
2. Write component structure
3. Add styling
4. Add interactions
5. Write tests

**Component Checklist:**
- [ ] Props are typed
- [ ] Default props provided
- [ ] Handles edge cases
- [ ] Accessible (ARIA labels, keyboard nav)
- [ ] Responsive
- [ ] Tested

## Design Principles
- **Single Responsibility**: One purpose
- **Composition**: Build complex from simple
- **Reusability**: Generic enough to reuse
- **Accessibility**: Works for all users
- **Performance**: Efficient rendering
- **Maintainability**: Easy to modify

## Anti-Patterns
- God components (too many responsibilities)
- Prop drilling (passing through many levels)
- Tight coupling to specific use case
- No error boundaries
- Ignoring accessibility
- No loading/error states

## Verification
- [ ] Component is typed
- [ ] Props documented
- [ ] Tests written
- [ ] Accessible
- [ ] Responsive
- [ ] Styled appropriately







---

> **Contact:** Mulky Malikul Dhaher — [mulkymalikuldhaher@email.com](mailto:mulkymalikuldhaher@email.com)
>
> **Disclaimer:** This project is for Education Purpose only. Risiko apapun tidak kita tanggung. (We are not responsible for any risks or damages.)
