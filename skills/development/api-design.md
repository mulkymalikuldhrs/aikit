---
name: api-design
description: Use when designing APIs, endpoints, or interfaces
useWhen: The user asks to design an API, create endpoints, or define interfaces
category: development
tags:
  - api
  - design
  - architecture
---

# API Design

## Overview
Design RESTful APIs following best practices for consistency, usability, and maintainability.

## Workflow

### Step 1: Understand Requirements
1. Identify use cases
2. Define resources and entities
3. Understand relationships
4. Identify operations needed

**Questions:**
- What resources are we working with?
- What operations are needed (CRUD)?
- Who are the consumers?
- What are the constraints?

### Step 2: Design Resource Model
1. Identify resources (nouns)
2. Define resource relationships
3. Design data models
4. Consider versioning

**Principles:**
- Resources are nouns (users, posts, comments)
- Use plural nouns for collections
- Hierarchical resources: `/users/{id}/posts`
- Avoid deep nesting (>2 levels)

### Step 3: Design Endpoints
1. Map operations to HTTP methods
2. Design URL structure
3. Define request/response formats
4. Consider pagination, filtering, sorting

**RESTful Mapping:**
- GET /resources - List all
- GET /resources/{id} - Get one
- POST /resources - Create
- PUT /resources/{id} - Update (full)
- PATCH /resources/{id} - Update (partial)
- DELETE /resources/{id} - Delete

**Best Practices:**
- Use nouns, not verbs
- Use HTTP status codes correctly
- Support filtering: `?status=active&limit=10`
- Support pagination: `?page=1&per_page=20`
- Use consistent naming (camelCase or snake_case)

### Step 4: Design Request/Response
1. Define request body structure
2. Define response structure
3. Design error responses
4. Consider content negotiation

**Response Format:**
```json
{
  "data": { ... },
  "meta": {
    "pagination": { ... }
  },
  "errors": [ ... ]
}
```

**Error Format:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [ ... ]
  }
}
```

### Step 5: Document API
1. Write OpenAPI/Swagger spec
2. Document all endpoints
3. Provide examples
4. Document authentication

**Documentation includes:**
- Endpoint URLs and methods
- Request/response schemas
- Status codes
- Authentication requirements
- Rate limits
- Examples

## Design Principles
- **Consistency**: Same patterns throughout
- **Simplicity**: Easy to understand and use
- **Discoverability**: Self-documenting
- **Versioning**: Plan for changes
- **Security**: Authentication, authorization, validation
- **Performance**: Efficient, cacheable

## Anti-Patterns
- Using verbs in URLs (`/getUsers`)
- Ignoring HTTP status codes
- Inconsistent naming
- No error handling
- No versioning strategy
- Exposing internal structure
- No rate limiting

## Verification
- [ ] All endpoints documented
- [ ] OpenAPI spec created
- [ ] Examples provided
- [ ] Error handling defined
- [ ] Authentication documented






