---
name: unit-testing
description: Use when writing unit tests for functions and components
useWhen: The user asks to write unit tests, test a function, or add test coverage
category: testing
tags:
  - testing
  - unit-tests
  - coverage
  - jest
---

# Unit Testing

## Overview
Write focused unit tests that verify individual functions and components work correctly in isolation.

## Workflow

### Step 1: Understand What to Test
1. Identify the function/component
2. Understand expected behavior
3. Identify edge cases
4. Identify error cases

**What to Test:**
- Happy path (normal operation)
- Edge cases (boundaries, empty inputs)
- Error cases (invalid inputs, failures)
- Side effects (state changes, API calls)

### Step 2: Write Test Structure
1. Arrange: Set up test data
2. Act: Execute the function
3. Assert: Verify the result

**Test Template:**
```javascript
describe('FunctionName', () => {
  it('should do something when given valid input', () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = functionName(input);
    
    // Assert
    expect(result).toBe('expected');
  });
});
```

### Step 3: Test Happy Path
1. Test with normal inputs
2. Verify expected output
3. Check return types
4. Verify no errors

**Checklist:**
- [ ] Normal inputs work
- [ ] Expected output correct
- [ ] Return type correct
- [ ] No exceptions thrown

### Step 4: Test Edge Cases
1. Empty inputs
2. Null/undefined
3. Boundary values
4. Extreme values

**Edge Cases:**
- Empty strings/arrays
- Null/undefined
- Zero, negative numbers
- Very large numbers
- Special characters

### Step 5: Test Error Cases
1. Invalid inputs
2. Missing required parameters
3. Type mismatches
4. Expected exceptions

**Error Testing:**
- Invalid input types
- Missing parameters
- Out of range values
- Network failures (mocked)

### Step 6: Test Side Effects
1. State changes
2. API calls (mocked)
3. DOM updates
4. Event emissions

**Mocking:**
- Mock external dependencies
- Mock API calls
- Mock timers
- Mock browser APIs

### Step 7: Achieve Coverage
1. Aim for >80% coverage
2. Focus on critical paths
3. Don't obsess over 100%
4. Test what matters

**Coverage Types:**
- Statement coverage
- Branch coverage
- Function coverage
- Line coverage

## Testing Principles
- **Isolation**: Tests don't depend on each other
- **Fast**: Tests run quickly
- **Deterministic**: Same input = same output
- **Clear**: Easy to understand what's tested
- **Maintainable**: Easy to update

## Anti-Patterns
- Testing implementation details
- Over-mocking
- Testing framework code
- Brittle tests (too specific)
- Slow tests (real network/DB)
- Tests that depend on order

## Test Structure
```javascript
describe('Component/Function', () => {
  describe('when given valid input', () => {
    it('should return expected result', () => { ... });
  });
  
  describe('when given invalid input', () => {
    it('should throw error', () => { ... });
  });
  
  describe('edge cases', () => {
    it('should handle empty input', () => { ... });
  });
});
```

## Verification
- [ ] All tests pass
- [ ] Coverage >80%
- [ ] Tests are fast
- [ ] Tests are isolated
- [ ] Edge cases covered






