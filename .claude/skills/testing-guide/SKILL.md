---
name: testing-guide
description: >-
  Testing patterns with Vitest and Bun test runner.
  Use when writing tests, setting up test fixtures,
  deciding what to test, or debugging test failures.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(bun:*)
---

# Testing Guide

Testing philosophy and patterns for BuildSeason.

## Philosophy

- **Test behavior, not implementation** - Verify what code does, not how
- **Fast feedback** - Unit tests in milliseconds, integration in seconds
- **Realistic data** - Use factories for realistic fixtures
- **Isolated tests** - Each test independent and repeatable

## Test Structure

```
apps/api/src/
└── __tests__/           # Backend tests (Bun test runner)
    ├── unit/            # Pure function tests, no I/O
    ├── integration/     # Database and API tests
    └── fixtures/        # Test data factories

apps/web/src/
└── __tests__/           # Frontend tests (Vitest)
```

## Running Tests

```bash
bun run test             # Run all tests
bun run test:api         # Run API tests only
bun run test:web         # Run frontend tests only
```

## Writing Tests

### Unit tests for pure functions

```typescript
import { describe, expect, test } from "bun:test";
import { calculateOrderTotal } from "../lib/orders";

describe("calculateOrderTotal", () => {
  test("sums line item prices", () => {
    const items = [
      { quantity: 2, unitPriceCents: 1000 },
      { quantity: 1, unitPriceCents: 500 },
    ];
    expect(calculateOrderTotal(items)).toBe(2500);
  });
});
```

## What to Test

| Layer      | What to Test     | Example                             |
| ---------- | ---------------- | ----------------------------------- |
| Utils      | Pure functions   | `formatCurrency(1234)` → `"$12.34"` |
| Schema     | Validation logic | Required fields, constraints        |
| Middleware | Auth, RBAC       | Redirect when unauthorized          |
| Routes     | HTTP behavior    | Status codes, response shape        |
| DB queries | Data integrity   | Relations, cascades                 |

## What NOT to Test

- shadcn/ui component internals
- Better-Auth internals
- Drizzle ORM internals
- Third-party API behavior

## Anti-Patterns

- **Testing implementation details** - Don't test private functions
- **Brittle assertions** - Don't assert on exact error messages
- **Missing edge cases** - Test empty arrays, nulls, boundaries
- **Slow tests** - Mock external services, use in-memory DB
