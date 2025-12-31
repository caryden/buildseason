---
name: session-completion
description: >-
  Session completion checklist and handoff protocol.
  Use when ending a work session, preparing handoff notes,
  or ensuring all work is properly committed and pushed.
allowed-tools: Read, Glob, Grep, Bash(bd:*), Bash(git:*), Bash(bun:*)
---

# Session Completion

Work is NOT complete until `git push` succeeds.

## Mandatory Workflow

When ending a work session, complete ALL steps:

### 1. File issues for remaining work

Create beads for anything needing follow-up:

```bash
bd create "Continue: [description]" -t task
```

### 2. Run quality gates (if code changed)

```bash
bun run typecheck     # Type checking
bun run lint          # ESLint
bun test              # All tests
```

### 3. Update issue status

```bash
bd close <id> -r "Completed with verification"
bd update <id> --status blocked -d "Blocked by: [reason]"
```

### 4. Push to remote (MANDATORY)

```bash
git pull --rebase
bd sync
git push
git status  # MUST show "up to date with origin"
```

### 5. Clean up

- Clear stashes: `git stash clear`
- Prune branches: `git remote prune origin`

### 6. Verify

- All changes committed AND pushed
- No orphaned in_progress beads: `bd list --status in_progress`

### 7. Hand off

Provide context for next session:

- What was completed
- What's blocked and why
- Recommended next steps

## Critical Rules

- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds

## Quick Checklist

```
[ ] 1. git status              (check changes)
[ ] 2. git add <files>         (stage code)
[ ] 3. bd sync                 (commit beads)
[ ] 4. git commit -m "..."     (commit code)
[ ] 5. bd sync                 (sync beads)
[ ] 6. git push                (push to remote)
```

## Handoff Template

```markdown
## Session Summary

### Completed

- [bead-id]: Description of what was done

### In Progress

- [bead-id]: What's left, current state

### Blocked

- [bead-id]: Why blocked, what's needed

### Recommended Next Steps

1. First priority task
2. Second priority task
```
