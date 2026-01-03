---
name: documentation
description: Use when writing code documentation, API docs, or user guides
useWhen: The user asks to document code, write README, or create API documentation
category: documentation
tags:
  - documentation
  - docs
  - api-docs
  - comments
---

# Documentation

## Overview
Write clear, comprehensive documentation that helps users and developers understand and use the code.

## Workflow

### Step 1: Identify Documentation Needs
1. What needs to be documented?
2. Who is the audience?
3. What format is appropriate?
4. Where should it live?

**Documentation Types:**
- Code comments (inline)
- API documentation
- README files
- User guides
- Architecture docs
- Contributing guides

### Step 2: Write Code Comments
1. Document complex logic
2. Explain "why" not "what"
3. Document public APIs
4. Add JSDoc/TSDoc comments

**Comment Guidelines:**
- Explain why, not what
- Keep comments up to date
- Remove commented-out code
- Use clear language

**JSDoc Example:**
```typescript
/**
 * Calculates the total price including tax.
 * 
 * @param price - The base price before tax
 * @param taxRate - The tax rate as a decimal (e.g., 0.1 for 10%)
 * @returns The total price including tax
 * @throws {Error} If price is negative or taxRate is invalid
 */
function calculateTotal(price: number, taxRate: number): number {
  if (price < 0) throw new Error('Price cannot be negative');
  return price * (1 + taxRate);
}
```

### Step 3: Write README
1. Project overview
2. Installation instructions
3. Usage examples
4. Configuration options
5. Contributing guidelines

**README Structure:**
- Title and description
- Features
- Installation
- Quick start
- Usage examples
- Configuration
- API reference
- Contributing
- License

### Step 4: Write API Documentation
1. Document all endpoints
2. Request/response examples
3. Authentication
4. Error codes
5. Rate limits

**API Doc Structure:**
- Endpoint URL and method
- Description
- Parameters
- Request body
- Response format
- Status codes
- Examples
- Error responses

### Step 5: Write User Guides
1. Getting started
2. Common tasks
3. Troubleshooting
4. FAQ
5. Examples

**User Guide Structure:**
- Introduction
- Prerequisites
- Installation
- Basic usage
- Advanced features
- Troubleshooting
- FAQ

### Step 6: Keep Documentation Updated
1. Update with code changes
2. Review regularly
3. Remove outdated info
4. Add examples

**Maintenance:**
- Update on every change
- Review quarterly
- Remove deprecated info
- Add new examples

## Documentation Principles
- **Clear**: Easy to understand
- **Complete**: Covers all aspects
- **Current**: Up to date
- **Concise**: No unnecessary words
- **Examples**: Show, don't just tell

## Documentation Types
- **Inline Comments**: Explain complex code
- **API Docs**: Document public interfaces
- **README**: Project overview and setup
- **Guides**: Step-by-step instructions
- **Architecture**: System design
- **Contributing**: How to contribute

## Anti-Patterns
- Outdated documentation
- Missing documentation
- Over-commenting obvious code
- Commented-out code
- No examples
- Jargon without explanation

## Verification
- [ ] Code comments added
- [ ] README complete
- [ ] API documented
- [ ] Examples provided
- [ ] Documentation reviewed






