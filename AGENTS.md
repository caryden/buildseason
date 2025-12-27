# Agent Instructions

This project uses **bd** (beads) for issue tracking. Run `bd onboard` to get started.

## Project Overview

BuildSeason is an open-source team management platform for FTC robotics teams.

**Stack:**
- Runtime: Bun
- Server: Hono with JSX templates (NO React)
- Database: Turso (libSQL) + Drizzle ORM
- Interactivity: HTMX + Alpine.js (via CDN)
- Styling: Tailwind CSS (via CDN)
- Auth: Better-Auth

**Key principle:** Server-side rendering only. No client-side build step. HTMX swaps HTML fragments for interactivity.

## Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --status in_progress  # Claim work
bd close <id>         # Complete work
bd sync               # Sync with git
```

## Environment Setup

Before starting work, ensure your environment is ready:

```bash
# Install dependencies
bun install

# Set up local database
cp .env.example .env
bun run db:push
bun run db:seed

# Verify everything works
bun run typecheck
bun run dev
```

## Development Workflow

1. **Pick a task:** `bd ready` to find unblocked work
2. **Claim it:** `bd update <id> --status in_progress`
3. **Do the work:** Write code, following existing patterns
4. **Verify:** `bun run typecheck` (must pass)
5. **Complete:** `bd close <id> --reason "Brief summary"`

## Code Patterns

### Adding a new page

```typescript
// src/routes/example.tsx
import { Hono } from "hono";
import { Layout } from "../components/Layout";
import { requireAuth } from "../middleware/auth";

const app = new Hono();

app.use("*", requireAuth);

app.get("/", (c) => {
  const user = c.get("user");
  return c.html(
    <Layout title="Example">
      <div>Hello {user?.name}</div>
    </Layout>
  );
});

export default app;
```

### HTMX patterns

```tsx
// Trigger partial reload
<button hx-get="/api/items" hx-target="#item-list" hx-swap="innerHTML">
  Refresh
</button>

// Form submission
<form hx-post="/api/items" hx-target="#result" hx-swap="innerHTML">
  <input name="name" />
  <button type="submit">Add</button>
</form>
```

### Database queries

```typescript
import { db } from "../db";
import { parts } from "../db/schema";
import { eq } from "drizzle-orm";

// Query with relations
const items = await db.query.parts.findMany({
  where: eq(parts.teamId, teamId),
  with: { vendor: true },
});
```

## Landing the Plane (Session Completion)

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed):
   ```bash
   bun run typecheck
   ```
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd sync
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds

## Parallel Session Guidelines

Multiple agents may work on this project simultaneously. To avoid conflicts:

1. **Always claim work first:** `bd update <id> --status in_progress` before starting
2. **Pull before starting:** `git pull --rebase` at session start
3. **Stay in your lane:** Only modify files related to your claimed issue
4. **Small, focused commits:** Commit and push frequently
5. **Check for conflicts:** If you see merge conflicts, resolve them carefully

### Recommended parallel work streams

These epic areas are designed to be worked on independently:
- **Vendor Directory** - Mostly read-only, isolated
- **Parts Inventory** - After vendors, can be isolated
- **BOM** - Depends on parts, but separate pages
- **Dashboard** - Aggregates data, minimal write conflicts
- **Deployment** - Infrastructure, no code conflicts
