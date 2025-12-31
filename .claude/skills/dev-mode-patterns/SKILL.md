---
name: dev-mode-patterns
description: >-
  Development vs production mode patterns and port configuration.
  Use when debugging dev server issues, port conflicts, OAuth redirects,
  or when production builds interfere with development.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(bun:*), Bash(lsof:*)
---

# Dev Mode Patterns

Patterns for development vs production mode learned from Wave 0.

## The Problem (Wave 0 Learning)

**Issue:** User confused by OAuth redirecting to port 3000 showing old UI instead of dev server at 5173.

**Root cause:** API server served stale production build even in development mode.

```typescript
// BAD: Served production build regardless of mode
const hasFrontendBuild = existsSync(join(frontendDistPath, "index.html"));

// GOOD: Only serve production build in production
const isDevelopment = config.nodeEnv === "development";
const hasFrontendBuild =
  !isDevelopment && existsSync(join(frontendDistPath, "index.html"));
```

## Development Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    DEVELOPMENT                          │
├─────────────────────────────────────────────────────────┤
│  Port 5173 (Vite)     │  Port 3000 (API)               │
│  - React frontend     │  - Hono API routes             │
│  - Hot reload         │  - Shows "run dev:web" message │
│  - Use this for UI    │  - OAuth redirects here        │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    PRODUCTION                           │
├─────────────────────────────────────────────────────────┤
│  Port 3000 (API + Static)                              │
│  - Serves built React from dist/web                    │
│  - API routes                                          │
│  - Single deployment                                   │
└─────────────────────────────────────────────────────────┘
```

## The Rules

### 1. Always check NODE_ENV before serving static files

```typescript
const isDevelopment = config.nodeEnv === "development";
const hasFrontendBuild =
  !isDevelopment && existsSync(join(frontendDistPath, "index.html"));

if (hasFrontendBuild) {
  // Serve production build
} else {
  // Show dev mode guidance
}
```

### 2. Dev mode should show helpful message, not stale build

```typescript
if (!hasFrontendBuild) {
  app.get("*", (c) => {
    if (c.req.path.startsWith("/api/")) {
      return c.json({ error: "Not found" }, 404);
    }
    return c.html(`
      <h1>Development Mode</h1>
      <p>Frontend at <a href="http://localhost:5173">localhost:5173</a></p>
    `);
  });
}
```

### 3. OAuth callbacks go to API port

OAuth providers redirect to configured callback URL (port 3000). In dev:

- User lands on 3000, sees dev guidance
- User navigates to 5173 manually
- Session cookie works across ports (same domain)

## Port Reference

| Service         | Dev Port | Prod Port | Notes                       |
| --------------- | -------- | --------- | --------------------------- |
| Vite (frontend) | 5173     | N/A       | Hot reload, use for UI work |
| API server      | 3000     | 3000      | API + static in prod        |
| OAuth callback  | 3000     | 3000      | Always API port             |

## Debugging Checklist

When dev server seems wrong:

- [ ] Check `NODE_ENV` value: `echo $NODE_ENV`
- [ ] Check what's on port 3000: `lsof -i :3000`
- [ ] Check what's on port 5173: `lsof -i :5173`
- [ ] Clear browser cache (stale assets)
- [ ] Delete `dist/` if stale build interfering

## Anti-Patterns

- **Serving production build in dev** - Confuses hot reload expectations
- **Hardcoding ports** - Use config/env vars
- **Assuming same port** - Dev and prod have different architectures
- **Ignoring OAuth redirect** - It goes to API port, not Vite
