---
name: integration-testing
description: Use when testing how multiple components work together
useWhen: The user asks to test integration, test API endpoints, or test component interactions
category: testing
tags:
  - testing
  - integration
  - api
  - e2e
---

# Integration Testing

## Overview
Test how different parts of the system work together - components, APIs, databases, external services.

## Workflow

### Step 1: Identify Integration Points
1. Component interactions
2. API endpoints
3. Database operations
4. External service calls
5. File system operations

**Integration Points:**
- Component → Component
- Frontend → Backend API
- Backend → Database
- Backend → External API
- System → File system

### Step 2: Set Up Test Environment
1. Use test database
2. Mock external services
3. Set up test data
4. Configure test environment

**Test Environment:**
- Separate test database
- Mock external APIs
- Test configuration
- Clean state for each test

### Step 3: Test API Endpoints
1. Test request/response
2. Test authentication
3. Test error handling
4. Test data persistence

**API Testing:**
```javascript
describe('POST /api/users', () => {
  it('should create a user', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ name: 'Test', email: 'test@example.com' })
      .expect(201);
    
    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe('Test');
  });
});
```

### Step 4: Test Component Integration
1. Test component interactions
2. Test state management
3. Test event handling
4. Test data flow

**Component Integration:**
- Parent → Child communication
- Sibling communication
- State management
- Event propagation

### Step 5: Test Database Operations
1. Test CRUD operations
2. Test transactions
3. Test relationships
4. Test constraints

**Database Testing:**
- Create, Read, Update, Delete
- Foreign key relationships
- Transactions
- Constraints and validations

### Step 6: Test Error Scenarios
1. Network failures
2. Database errors
3. Invalid data
4. Authentication failures

**Error Testing:**
- Mock failures
- Test error handling
- Verify error responses
- Check error logging

### Step 7: Clean Up
1. Reset test database
2. Clear test data
3. Restore mocks
4. Clean up resources

**Cleanup:**
- After each test
- After test suite
- Reset to known state
- Remove test data

## Testing Strategies
- **Top-Down**: Test from UI down
- **Bottom-Up**: Test from data up
- **Big Bang**: Test everything together
- **Sandwich**: Combine top-down and bottom-up

## Mocking Strategy
- **Real Database**: Use test DB
- **Mock External APIs**: Don't call real services
- **Mock File System**: Use in-memory or temp files
- **Mock Time**: Control time-dependent tests

## Anti-Patterns
- Testing everything as integration
- Not cleaning up test data
- Using production database
- Calling real external services
- Slow tests
- Flaky tests

## Verification
- [ ] All integration tests pass
- [ ] Test environment isolated
- [ ] External services mocked
- [ ] Test data cleaned up
- [ ] Tests are reliable






