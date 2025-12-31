---
name: parallel-execution
description: >-
  Parallel bead execution with async subagents.
  Use when dispatching multiple bead workers, orchestrating
  parallel tasks, or coordinating concurrent agent work.
allowed-tools: Read, Glob, Grep, Bash(bd:*), Task, TaskOutput
---

# Parallel Execution

Parallel bead processing using Claude Code's async Task tool.

## Quick Start

```
User: Work on the top 3 ready beads in parallel

Agent: [Runs `bd ready --limit 5 --json`]
Agent: [Dispatches 3 bead-worker Tasks with run_in_background=true]
Agent: [Monitors with TaskOutput or continues other work]
```

## Subagent Patterns

| Pattern            | Model  | Purpose                | When to Use            |
| ------------------ | ------ | ---------------------- | ---------------------- |
| `bead-worker`      | sonnet | Completes single bead  | Parallel execution     |
| `bead-reviewer`    | sonnet | Reviews completed work | After worker completes |
| `bead-coordinator` | haiku  | Monitors progress      | Background monitoring  |

## Bead-Worker Prompt Template

```
You are a bead-worker agent. Complete bead [ID] autonomously.

1. Query bead: `bd show [ID]`
2. Check verification criteria - add if missing
3. Claim: `bd update [ID] --status in_progress`
4. Write tests FIRST for API features
5. Implement to make tests pass
6. Verify with EVIDENCE:
   - API/logic: `bun test` must pass
   - UI: Chrome MCP read_page verification
7. Close ONLY with evidence:
   `bd close [ID] -r "Summary. VERIFIED: [evidence]"`

If cannot verify, DO NOT close:
`bd update [ID] --labels human-verify -d "Needs human: [reason]"`

WAKE CONDITIONS:
- Task completed with verification
- Blocked by dependency
- Cannot verify - needs human
- Test failures need decision
```

## Orchestration Pattern

1. **Start**: `bd ready --json` to find work
2. **Identify independent beads**: Check file overlap
3. **Dispatch**: Task with `run_in_background: true`
4. **Monitor**: TaskOutput to check progress
5. **Handle completions**: Review or continue
6. **Sync**: `bd sync && git push` before ending

## Rules for Parallel Dispatch

- **File independence**: Only dispatch beads that don't touch same files
- **Dependency check**: `bd dep tree <id>` to avoid blocked beads
- **Max concurrency**: 3-4 workers (context limits)
- **Flat delegation**: Main -> workers only, no sub-workers
- **Discovered work**: New beads appear in `bd ready`

## Ending Parallel Sessions

Before ending:

1. All workers completed (`TaskOutput` with `block: true`)
2. Sync beads: `bd sync`
3. Check orphans: `bd list --status in_progress`
4. Commit and push pending changes
5. Verify: `git status` shows clean tree

## Parallel Work Streams

These areas can be worked independently:

- **Vendor Directory** - Mostly read-only, isolated
- **Parts Inventory** - After vendors, isolated
- **BOM** - Depends on parts, separate pages
- **Dashboard** - Aggregates data, minimal conflicts
- **Deployment** - Infrastructure, no code conflicts

## Conflict Avoidance

```bash
# Before dispatch, check file overlap
bd show <bead-1>  # Note affected files
bd show <bead-2>  # Compare - any overlap?

# If overlap, sequence them instead of parallel
```
