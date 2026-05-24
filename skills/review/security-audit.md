---
name: security-audit
description: Use when auditing code for security vulnerabilities
useWhen: The user asks to check for security issues, audit security, or review for vulnerabilities
category: review
tags:
  - security
  - audit
  - vulnerabilities
  - safety
---

# Security Audit

## Overview
Comprehensive security review focusing on common vulnerabilities and best practices.

## Workflow

### Step 1: Authentication & Authorization
Check:
- [ ] Strong password requirements
- [ ] Secure session management
- [ ] Proper logout functionality
- [ ] Role-based access control (RBAC)
- [ ] Token expiration
- [ ] Secure password storage (hashing)

**Red Flags:**
- Plain text passwords
- Weak password requirements
- No session timeout
- Missing authorization checks
- Tokens never expire

### Step 2: Input Validation
Check:
- [ ] All user input validated
- [ ] Server-side validation (not just client)
- [ ] Type checking
- [ ] Length limits
- [ ] Sanitization for XSS
- [ ] SQL injection prevention

**Common Vulnerabilities:**
- SQL injection
- XSS (Cross-Site Scripting)
- Command injection
- Path traversal
- NoSQL injection

### Step 3: Data Protection
Check:
- [ ] Sensitive data encrypted
- [ ] HTTPS everywhere
- [ ] No secrets in code
- [ ] Secure headers (CSP, HSTS)
- [ ] Proper CORS configuration
- [ ] Data at rest encrypted

**Security Headers:**
- Content-Security-Policy
- Strict-Transport-Security
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy

### Step 4: Dependency Security
Check:
- [ ] Dependencies up to date
- [ ] No known vulnerabilities
- [ ] Minimal dependencies
- [ ] Regular security audits

**Tools:**
- `npm audit`
- Snyk
- Dependabot
- OWASP Dependency-Check

### Step 5: API Security
Check:
- [ ] Rate limiting
- [ ] Authentication required
- [ ] Proper error messages (no info leakage)
- [ ] Input validation
- [ ] Output encoding
- [ ] CORS properly configured

**API Best Practices:**
- Rate limiting
- Authentication tokens
- Generic error messages
- Input validation
- Output sanitization

### Step 6: Secrets Management
Check:
- [ ] No secrets in code
- [ ] Environment variables used
- [ ] Secrets rotated regularly
- [ ] Proper access controls
- [ ] No secrets in logs

**Red Flags:**
- API keys in code
- Passwords in config files
- Secrets in git history
- Secrets in logs
- Hardcoded credentials

### Step 7: Error Handling
Check:
- [ ] Generic error messages to users
- [ ] Detailed errors only in logs
- [ ] No stack traces to users
- [ ] Proper error logging
- [ ] No information leakage

## OWASP Top 10 (2021)
1. Broken Access Control
2. Cryptographic Failures
3. Injection
4. Insecure Design
5. Security Misconfiguration
6. Vulnerable Components
7. Authentication Failures
8. Software and Data Integrity Failures
9. Security Logging Failures
10. Server-Side Request Forgery

## Common Vulnerabilities
- SQL Injection
- XSS (Cross-Site Scripting)
- CSRF (Cross-Site Request Forgery)
- Authentication bypass
- Insecure direct object references
- Security misconfiguration
- Sensitive data exposure
- Missing function level access control

## Verification
- [ ] Security audit tools run
- [ ] Dependencies checked
- [ ] No secrets in code
- [ ] Input validation in place
- [ ] Authentication/authorization working
- [ ] Security headers configured







---

> **Contact:** Mulky Malikul Dhaher — [mulkymalikuldhaher@email.com](mailto:mulkymalikuldhaher@email.com)
>
> **Disclaimer:** This project is for Education Purpose only. Risiko apapun tidak kita tanggung. (We are not responsible for any risks or damages.)
