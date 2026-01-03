---
name: error-handling
description: Use when implementing error handling, exception handling, or error recovery
useWhen: The user asks to handle errors, add error handling, or implement error recovery
category: development
tags:
  - error-handling
  - exceptions
  - resilience
  - reliability
---

# Error Handling

## Overview
Implement robust error handling that gracefully handles failures and provides useful feedback.

## Workflow

### Step 1: Identify Error Scenarios
1. Network failures
2. Invalid input
3. Resource unavailable
4. Permission denied
5. Timeouts

**Error Categories:**
- **User Errors**: Invalid input, missing data
- **System Errors**: Network, database, file system
- **Program Errors**: Bugs, logic errors
- **External Errors**: Third-party API failures

### Step 2: Choose Error Handling Strategy
1. Try-catch for synchronous code
2. Promises/callbacks for async
3. Error boundaries for React
4. Global error handlers

**Strategies:**
- Try-catch blocks
- Promise.catch()
- Error boundaries (React)
- Global error handlers
- Middleware (Express)

### Step 3: Create Error Types
1. Define custom error classes
2. Include error codes
3. Add context information
4. Make errors serializable

**Error Structure:**
```typescript
class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public code: string = 'VALIDATION_ERROR'
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}
```

### Step 4: Handle Errors Appropriately
1. User-facing errors: Show friendly messages
2. System errors: Log details, show generic message
3. Recoverable errors: Retry with backoff
4. Fatal errors: Log and alert

**Error Handling:**
```typescript
try {
  await processData(data);
} catch (error) {
  if (error instanceof ValidationError) {
    showUserError(error.message);
  } else if (error instanceof NetworkError) {
    retryWithBackoff(() => processData(data));
  } else {
    logError(error);
    showGenericError();
  }
}
```

### Step 5: Provide User Feedback
1. Clear error messages
2. Actionable guidance
3. Appropriate tone
4. Don't expose technical details

**User Messages:**
- ✅ "Please enter a valid email address"
- ❌ "ValidationError: Invalid email format"

### Step 6: Log Errors
1. Log all errors
2. Include context
3. Use appropriate log levels
4. Don't log sensitive data

**Logging:**
```typescript
logger.error('Failed to process payment', {
  userId: user.id,
  orderId: order.id,
  error: error.message,
  stack: error.stack
});
```

### Step 7: Implement Recovery
1. Retry transient failures
2. Fallback to cached data
3. Graceful degradation
4. Circuit breakers for external services

**Recovery Strategies:**
- Retry with exponential backoff
- Fallback to default values
- Use cached data
- Circuit breaker pattern

## Error Handling Patterns
- **Fail Fast**: Detect errors early
- **Fail Safe**: Continue with degraded functionality
- **Retry**: Attempt recovery automatically
- **Circuit Breaker**: Stop calling failing services

## Anti-Patterns
- Swallowing errors silently
- Generic catch-all blocks
- Exposing technical details to users
- Not logging errors
- Not handling async errors
- Catching and ignoring

## Verification
- [ ] All errors handled
- [ ] User-friendly messages
- [ ] Errors logged
- [ ] Recovery implemented
- [ ] No silent failures






