---
name: code-review
description: >-
  Code and security review checklists and audit patterns.
  Use when conducting code reviews, security audits,
  creating review beads, or writing audit reports.
allowed-tools: Read, Glob, Grep, Bash(bd:*), Bash(git:*)
---

# Code Review Guide

Structured approach to code and security reviews.

## Review Philosophy

**Reviews are discovery tasks, not fix-everything tasks.**

- Audit the codebase against a checklist
- Create new beads for each finding with priority
- Use `discovered-from` relationship to link findings
- Close review with full audit report

## Review Labels

- `review:security` - Security audits
- `review:code` - Code quality reviews

Query past reviews:

```bash
bd list --label review:security --status closed
bd show <review-id>  # See audit report in close reason
```

## Security Review Checklist

```markdown
- [ ] OWASP Top 10 check
- [ ] Auth flow (OAuth state, CSRF, session cookies)
- [ ] RBAC enforcement on all endpoints
- [ ] Input validation (forms, query params)
- [ ] SQL injection (parameterized queries)
- [ ] XSS prevention in React components
- [ ] API endpoint authorization
- [ ] Rate limiting status
- [ ] Sensitive data exposure
- [ ] CORS configuration
```

## Code Quality Checklist

```markdown
- [ ] Pattern consistency across routes
- [ ] Dead code and unused imports
- [ ] Error handling completeness
- [ ] Type safety (no any, missing types)
- [ ] Component reusability
- [ ] Query efficiency (N+1 detection)
- [ ] Code duplication
- [ ] Test coverage gaps
```

## Creating Findings

For each issue found:

```bash
# Create finding with priority
bd create "Fix: XSS in order notes field" -t bug -p 1

# Link to review that discovered it
bd dep add <finding-id> <review-id> -t discovered-from
```

## Audit Report Format

Include full report in close reason:

```
## Files Reviewed
- apps/api/src/routes/api.tsx
- apps/api/src/middleware/auth.ts
[list all files]

## Checklist Results

### SQL Injection
- Reviewed: [files]
- Result: PASS (all queries use Drizzle parameterized)

### XSS Prevention
- Reviewed: [files]
- Result: 2 ISSUES FOUND
- Created: buildseason-abc (P1), buildseason-def (P2)

[continue for each item]

## Summary
- Total checks: 8
- Passed: 5
- Issues found: 3 (created 9 beads)

## Created Beads
- buildseason-abc: Fix: [issue] (P1)
[list all]
```

## Review Templates

### Security Review Bead

```bash
bd create "Security review: [area]" -t task -p 2 \
  --labels model:opus,review:security \
  -d "Security audit - create beads for findings, don't fix directly.

Checklist:
- OWASP Top 10
- Auth flow
- RBAC enforcement
- Input validation
- SQL injection
- XSS prevention
- Rate limiting"
```

### Code Quality Review Bead

```bash
bd create "Code review: [area]" -t task -p 2 \
  --labels model:opus,review:code \
  -d "Code audit - create beads for findings.

Checklist:
- Pattern consistency
- Dead code
- Error handling
- Type safety
- N+1 queries
- Code duplication"
```

## When to Schedule Reviews

- After auth changes or new API endpoints
- After major refactoring
- Every ~10-15 feature beads (security)
- Every ~15-20 beads (code quality)
