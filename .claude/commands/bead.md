---
description: Work on individual beads - pick up, show details, load context
argument-hint: <work|show|close> <bead-id>
---

# Bead Command

Work on individual beads with full context loading.

## Subcommands

| Subcommand | Usage              | Description                                 |
| ---------- | ------------------ | ------------------------------------------- |
| `work`     | `/bead work <id>`  | Pick up a bead, load context, start working |
| `show`     | `/bead show <id>`  | Show bead details without loading context   |
| `close`    | `/bead close <id>` | Mark a bead as complete                     |

---

## SUBCOMMAND: work

**Usage:** `/bead work <bead-id>`

Pick up a bead and load all relevant context to work on it.

### Instructions

1. **Normalize bead ID:**
   - If doesn't start with `buildseason-`, prepend it
   - `xyz` → `buildseason-xyz`

2. **Fetch bead details:**

```bash
bd show <bead-id>
```

3. **Check if blocked:**
   - Run `bd blocked | grep <bead-id>`
   - If blocked, warn user but allow proceeding (blocker may be human checkpoint)

4. **Extract file references from description:**
   - Look for patterns like `apps/web/src/...`, `packages/...`
   - Look for `.tsx`, `.ts`, `.md` extensions

5. **Load context:**
   - Read each referenced file that exists
   - Note files that will be created
   - Load relevant spec docs based on task type:
     - UI work → `docs/ui-refocus-spec.md`
     - Agent work → `docs/agentic-spec.md`
     - OnShape → `docs/onshape-spec.md`
     - Vendor → `docs/vendor-stock-harvesting-spec.md`

6. **Extract and load skills:**

   Skills can be specified in bead description with a "Skills:" section:

   ```
   Skills:
   - brand-guidelines
   - chrome-mcp-testing
   ```

   Or via labels with `skill:` prefix (e.g., `skill:brand-guidelines`).

   For each skill found:
   - Check if `.claude/skills/<skill-name>/SKILL.md` exists
   - If exists, read the skill file to load context
   - If not exists, warn: "⚠️ Skill '<name>' not found"

   Skills provide domain-specific patterns and anti-patterns for the task.

7. **Check for model label:**
   - `model:opus` → Suggest extended thinking for complex work
   - `model:haiku` → Note this is a simple task
   - No label → Default sonnet is appropriate

8. **Display work summary:**

```
============================================================
              BEAD: <bead-id>
============================================================

Title: <title>
Priority: <priority> | Type: <type> | Status: <status>

Description:
<full description>

------------------------------------------------------------
CONTEXT LOADED:
------------------------------------------------------------
FILES:
  ✓ apps/web/src/foo.tsx (exists)
  ✓ apps/web/src/bar.tsx (exists)
  ○ apps/web/src/new.tsx (will create)

SPECS:
  📄 docs/ui-refocus-spec.md

SKILLS:
  🎯 brand-guidelines (loaded)
  🎯 chrome-mcp-testing (loaded)
  ⚠️  unknown-skill (not found)

------------------------------------------------------------
READY TO WORK
------------------------------------------------------------
Model: sonnet (or opus if model:opus label)
Branch: git checkout -b feat/<bead-id-short>

When done:
  1. Commit: git commit -m "feat: ...\n\nCloses: <bead-id>"
  2. Close: bd close <bead-id>
============================================================
```

---

## SUBCOMMAND: show

**Usage:** `/bead show <bead-id>`

Show bead details without loading full context.

### Instructions

```bash
bd show <bead-id>
```

Display the output formatted nicely.

---

## SUBCOMMAND: close

**Usage:** `/bead close <bead-id> [--message "completion notes"]`

Mark a bead as complete.

### Instructions

1. **Close the bead:**

```bash
bd close <bead-id>
```

2. **Show confirmation:**

```
✓ Closed: <bead-id>
  Title: <title>

Check if this unblocks other work:
  bd blocked
```

3. **Check if this was a checkpoint:**
   - If closing a checkpoint (6ea, 2zlp, z942, 4a5n), note what wave is now unblocked

---

## Quick Reference

Common bead operations via bd CLI:

```bash
bd show <id>          # Show details
bd ready              # List ready work
bd blocked            # List blocked work
bd close <id>         # Close a bead
bd update <id> --priority <0-4>  # Change priority
bd label <id> <label> # Add a label
```

$ARGUMENTS
