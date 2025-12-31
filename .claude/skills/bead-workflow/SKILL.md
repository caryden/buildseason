---
name: bead-workflow
description: >-
  Beads issue tracking workflow and verification requirements.
  Use when working with beads, claiming tasks, closing issues,
  creating well-formed beads, or needing verification guidance.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(bd:*), Bash(git:*)
---

# Bead Workflow

Complete workflow for using beads (bd) issue tracking. All work MUST go through beads.

## Core Workflow

1. **Pick a task:** `bd ready` to find unblocked work
2. **Claim it:** `bd update <id> --status in_progress`
3. **Do the work:** Write code, following existing patterns
4. **Verify:** `bun run typecheck && bun run lint && bun test`
5. **Complete:** `bd close <id> -r "Brief summary with verification evidence"`
6. **Checkpoint:** Commit immediately after closing

## Beads-First Rule

- **NEVER** start coding without a bead to track the work
- If no bead exists, create one first: `bd create "Description" -t task`
- Even small fixes should have beads - it takes 5 seconds
- This ensures all work is tracked, discoverable, and parallelizable

## Verification Requirements (MANDATORY)

You CANNOT close a bead without clear, unquestionable evidence of completion.

### Verification Methods

| Method         | When to Use                  | Evidence Required                          |
| -------------- | ---------------------------- | ------------------------------------------ |
| **Unit tests** | API routes, utilities, logic | `bun test` output showing tests pass       |
| **Chrome MCP** | UI components, pages, forms  | `read_page` snapshot proving functionality |
| **Both**       | Full-stack features          | Tests + Chrome MCP                         |

### Verification Process

1. **Before starting**: Check bead has verification criteria. If missing, add them:

   ```bash
   bd update <id> -d "Added verification: [describe how to verify]"
   ```

2. **After implementing**: Run verification and capture evidence

3. **When closing**: Include evidence in close reason:
   ```bash
   bd close <id> -r "Implemented X. Verified: bun test shows 5/5 tests passing"
   ```

### When You Cannot Verify

If you cannot provide clear verification evidence:

1. **DO NOT close the bead**
2. Assign to human:
   ```bash
   bd update <id> --labels human-verify -d "Needs human verification: [reason]"
   ```
3. Common reasons:
   - OAuth flows (need real credentials)
   - Visual design review
   - Performance/load testing
   - External service integrations

## Well-Formed Beads

Every bead SHOULD include verification criteria:

```bash
bd create "Add pagination to parts list" -t task -d "Add pagination controls.

Verification:
- Unit test: GET /api/teams/:id/parts?page=2&limit=10 returns correct slice
- Chrome MCP: Navigate to parts page, verify pagination controls visible"
```

## Git Checkpoint Rule

After each bead is verified and closed, immediately commit:

```bash
git add -A
git commit -m "Complete <bead-id>: <brief description>"
```

This creates recovery points for reverting if needed.

## Spec Ambiguity Rule

If the spec is ambiguous or contradictory, **STOP and ask** before writing code.

This includes:

- Multiple valid approaches without clear decision
- Contradictory requirements in different sections
- Missing details affecting implementation
- Any uncertainty about what "correct" means

**DO NOT:**

- Pick an approach and hope it's right
- "Validate" against an inconsistent spec
- Add features not explicitly specified
- Make design decisions without confirmation

## Recovery from Mistakes

If you get into a bad state, **DO NOT thrash**. Stop and recover:

1. **Assess:**

   ```bash
   git diff      # See what changed
   git status    # See untracked/modified files
   ```

2. **Revert to checkpoint:**

   ```bash
   git checkout -- .    # Discard uncommitted changes
   git clean -fd        # Remove untracked files
   ```

3. **Start fresh** from the last working state

**NEVER** try to fix a mess by making more changes. Revert first.
