# Agent Army Deployment Plan

## Orchestrating Parallel AI Development at Scale

**Version:** 1.0
**Date:** December 30, 2025
**Status:** Draft
**Purpose:** Define optimal strategy for deploying Claude agents to build BuildSeason

---

## Executive Summary

BuildSeason is a ~1000-2000 bead project. With access to an army of AI agents, we can parallelize development dramatically — but we need orchestration to avoid chaos.

**Key Principles:**

1. **Speed over cost** — Use the fastest capable model, not the cheapest
2. **Parallel where safe** — Independent work streams run concurrently
3. **Human checkpoints** — Review gates at key milestones prevent wasted work
4. **Fresh context per bead** — Avoid context pollution, recycle after each task
5. **Right model for right task** — Opus for architecture, Sonnet for implementation, Haiku for simple tasks

---

## Current State Analysis

### Open Work Summary

| Category            | Epics  | Tasks    | Status      |
| ------------------- | ------ | -------- | ----------- |
| MVP Completion      | 6      | ~15      | 80% done    |
| UI Refocus          | 12     | ~70      | Not started |
| GLaDOS Agent        | 1      | 8        | Not started |
| OnShape Integration | 1      | 6        | Not started |
| Vendor Catalog      | 1      | 5        | Not started |
| Infrastructure      | 3      | ~10      | Partial     |
| **Total**           | **24** | **~114** |             |

### Dependency Graph (Simplified)

```
                    ┌─────────────────────────────────────────────────────────┐
                    │                    WAVE 0: Foundation                    │
                    │         (Complete existing MVP, establish patterns)      │
                    └─────────────────────────┬───────────────────────────────┘
                                              │
                                              ▼
                              ┌───────────────────────────────┐
                              │  CHECKPOINT 1: MVP Review     │
                              │  (Human validates patterns)   │
                              └───────────────────┬───────────┘
                                                  │
                    ┌─────────────────────────────┴─────────────────────────────┐
                    │                                                           │
                    ▼                                                           ▼
    ┌───────────────────────────────┐                       ┌───────────────────────────────┐
    │   WAVE 1: Navigation (b5u.1)  │                       │   WAVE 1: Discord Bot (il2)   │
    │   (New sidebar, routes)       │                       │   (Foundation only)           │
    └───────────────┬───────────────┘                       └───────────────┬───────────────┘
                    │                                                       │
                    ▼                                                       │
    ┌───────────────────────────────┐                                       │
    │  CHECKPOINT 2: Nav Review     │                                       │
    └───────────────┬───────────────┘                                       │
                    │                                                       │
    ┌───────────────┴───────────────┐                                       │
    │                               │                                       │
    ▼                               ▼                                       │
┌─────────────┐             ┌─────────────┐                                 │
│ WAVE 2:     │             │ WAVE 2:     │                                 │
│ Dashboard   │             │ Calendar    │                                 │
│ (b5u.2)     │             │ (b5u.3)     │                                 │
└──────┬──────┘             └──────┬──────┘                                 │
       │                           │                                        │
       └───────────┬───────────────┘                                        │
                   │                                                        │
                   ▼                                                        │
   ┌───────────────────────────────┐                                        │
   │  CHECKPOINT 3: Core UX        │◄───────────────────────────────────────┘
   └───────────────┬───────────────┘
                   │
    ┌──────────────┴──────────────┬──────────────────────────┐
    │                             │                          │
    ▼                             ▼                          ▼
┌─────────────┐           ┌─────────────┐            ┌─────────────┐
│ WAVE 3:     │           │ WAVE 3:     │            │ WAVE 3:     │
│ Robots+BOM  │           │ OnShape     │            │ Vendor      │
│ (b5u.4)     │           │ (kue)       │            │ (84j)       │
└─────────────┘           └─────────────┘            └─────────────┘
                   │
                   ▼
   ┌───────────────────────────────┐
   │  CHECKPOINT 4: Integration    │
   └───────────────┬───────────────┘
                   │
    ┌──────────────┴──────────────┬──────────────────────────┐
    │                             │                          │
    ▼                             ▼                          ▼
┌─────────────┐           ┌─────────────┐            ┌─────────────┐
│ WAVE 4:     │           │ WAVE 4:     │            │ WAVE 4:     │
│ GLaDOS Full │           │ Outreach    │            │ Operations  │
│ (il2)       │           │ (b5u.6)     │            │ (b5u.7)     │
└─────────────┘           └─────────────┘            └─────────────┘
                   │
                   ▼
              [Continue to Phases 8-12...]
```

---

## Wave Definitions

### WAVE 0: Foundation Completion

**Goal:** Complete existing MVP work to establish solid patterns

**Parallel Groups:**
| Group | Beads | Model | Can Parallelize? |
|-------|-------|-------|------------------|
| UI Framework | 8o9._ remaining | sonnet | Yes (1 agent) |
| Auth & Team | 5pw._ remaining | sonnet | Yes (1 agent) |
| Vendor Directory | ck0._, jxl | sonnet | Yes (1 agent) |
| BOM | 03y._, 9rw, xd9 | sonnet | Yes (1 agent) |
| Robots | 8mf.\*, nz1, nty, oyj, p1y | sonnet | Yes (1 agent) |

**Estimated Agents:** 5 parallel
**Estimated Duration:** 2-4 hours

---

### CHECKPOINT 1: MVP Review

**Type:** Human gate
**Reviewer:** @caryden
**Criteria:**

- [ ] App runs without errors
- [ ] All pages render correctly
- [ ] Data flows work (create, read, update, delete)
- [ ] Patterns are consistent and extensible
- [ ] Code quality meets standards

**Bead:** `buildseason-6ea`
**Blocks:** Wave 1 (b5u.1, il2.1)

---

### WAVE 1: Navigation + Discord Foundation

**Goal:** New team-centric nav structure + Discord bot skeleton

**Parallel Groups:**
| Group | Beads | Model | Notes |
|-------|-------|-------|-------|
| Navigation Restructure | b5u.1.\* | sonnet | New sidebar, routes |
| Discord Bot Setup | il2.1 | sonnet | discord.js foundation |

**Estimated Agents:** 2 parallel
**Estimated Duration:** 2-3 hours

---

### CHECKPOINT 2: Navigation Review

**Type:** Human gate
**Reviewer:** @caryden
**Criteria:**

- [ ] New navigation structure matches spec
- [ ] All routes exist (even if placeholder)
- [ ] Breadcrumbs work correctly
- [ ] Mobile responsive
- [ ] Discord bot connects and responds

**Bead:** `buildseason-2zlp`
**Blocks:** Wave 2 (b5u.2, b5u.3, il2.2)

---

### WAVE 2: Dashboard + Calendar

**Goal:** Core UX differentiators

**Parallel Groups:**
| Group | Beads | Model | Notes |
|-------|-------|-------|-------|
| Action Center Dashboard | b5u.2._ | opus | Complex UX, needs careful design |
| Team Calendar | b5u.3._ | sonnet | Standard calendar patterns |
| Claude SDK Integration | il2.2, il2.3 | sonnet | Agent intelligence layer |

**Estimated Agents:** 3 parallel
**Estimated Duration:** 4-6 hours

---

### CHECKPOINT 3: Core UX Review

**Type:** Human gate
**Reviewer:** @caryden
**Criteria:**

- [ ] Action Center shows meaningful items
- [ ] "This Week" layout works as designed
- [ ] Calendar displays events correctly
- [ ] GLaDOS personality is engaging
- [ ] Agent responds appropriately to queries

**Bead:** `buildseason-z942`
**Blocks:** Wave 3 (b5u.4, kue, 84j, il2.4)

---

### WAVE 3: Robots + Integrations

**Goal:** Robot/BOM with OnShape, Vendor link-drop

**Parallel Groups:**
| Group | Beads | Model | Notes |
|-------|-------|-------|-------|
| Robots & BOM Enhanced | b5u.4._ | sonnet | Per-robot BOMs |
| OnShape Integration | kue._ | sonnet | OAuth, BOM sync |
| Vendor Link-Drop | 84j.\* | sonnet | URL extraction |
| Agent Tools | il2.4 | sonnet | Inventory, budget, etc. |

**Estimated Agents:** 4 parallel
**Estimated Duration:** 4-6 hours

---

### CHECKPOINT 4: Integration Review

**Type:** Human gate
**Reviewer:** @caryden
**Criteria:**

- [ ] OnShape OAuth flow works
- [ ] BOM sync pulls correct data
- [ ] Link-drop extracts product info
- [ ] Agent tools query data correctly
- [ ] Cross-system integration is solid

**Bead:** `buildseason-4a5n`
**Blocks:** Wave 4 (b5u.5, b5u.6, b5u.7, il2.5)

---

### WAVE 4: Agent Complete + Expansion Start

**Goal:** Full GLaDOS + begin expansion phases

**Parallel Groups:**
| Group | Beads | Model | Notes |
|-------|-------|-------|-------|
| GLaDOS Workflows | il2.5, il2.6, il2.7 | sonnet | Temporal workflows |
| Outreach Hub | b5u.6._ | sonnet | Events, hours |
| Operations | b5u.7._ | sonnet | Competitions, travel |
| Sponsorships | b5u.8.\* | sonnet | Relationships |

**Estimated Agents:** 4-6 parallel
**Estimated Duration:** 6-8 hours

---

### WAVE 5+: Remaining Phases

**Goal:** Complete expansion

**Phases:** Marketing (b5u.9), Finance (b5u.10), Settings (b5u.11), Chat Interface (b5u.12)

**Estimated Agents:** 4 parallel per wave
**Estimated Duration:** 4-6 hours per wave

---

## Model Routing Strategy

### Model Selection Criteria

| Model      | Use When                                                                             | Speed   | Cost | Examples                                         |
| ---------- | ------------------------------------------------------------------------------------ | ------- | ---- | ------------------------------------------------ |
| **opus**   | Architecture decisions, complex UX design, code review, integration design, planning | Slower  | $$$  | Dashboard design, agent behavior, system prompts |
| **sonnet** | Core implementation, debugging, refactoring, most coding tasks                       | Fast    | $$   | Components, API routes, database queries         |
| **haiku**  | Simple components, tests, docs, well-specified CRUD, boilerplate                     | Fastest | $    | Unit tests, type definitions, simple forms       |

### Bead Label Schema

```
Labels:
  model:opus     - Use Claude Opus 4.5
  model:sonnet   - Use Claude Sonnet 4.5
  model:haiku    - Use Claude Haiku 3.5

  parallel:<group>  - Can run with other beads in same group
  sequential        - Must complete before next bead starts

  checkpoint        - Human review gate
  human             - Requires human action (not AI)

  foundation        - Must complete before parallel work begins
```

---

## Tooling Requirements

### 1. Bead Orchestrator Skill

**Purpose:** Launch parallel agents for a wave of beads

**Command:** `/army deploy <wave>`

**Behavior:**

1. Query beads for specified wave (by label or list)
2. Check dependencies are satisfied
3. Launch subagent per bead with fresh context
4. Each subagent:
   - Reads bead description
   - Loads relevant files (from bead metadata or auto-detected)
   - Executes task
   - Updates bead status
   - Commits changes to feature branch
5. Orchestrator monitors completion
6. Reports summary to human

**Implementation:** Claude Code skill + subagents

---

### 2. Model Router Hook

**Purpose:** Automatically select model based on bead label

**Hook Type:** `PreToolCall` or custom

**Behavior:**

```typescript
// .claude/hooks/model-router.ts
export async function routeModel(bead: Bead): Promise<ModelId> {
  const labels = bead.labels || [];

  if (labels.includes("model:opus")) return "claude-opus-4-5";
  if (labels.includes("model:haiku")) return "claude-haiku-3-5";
  return "claude-sonnet-4-5"; // default
}
```

**Note:** May require Claude Code configuration or wrapper script.

---

### 3. Context Loader

**Purpose:** Load relevant files for a bead without polluting context

**Command:** `/bead load <bead-id>`

**Behavior:**

1. Read bead description
2. Extract file paths mentioned
3. Use Explore agent to find related files
4. Load into context (Read tool)
5. Summarize what's loaded

**Implementation:** Skill that invokes Explore subagent

---

### 4. Checkpoint Gate System

**Purpose:** Block downstream work until human approves

**Bead Structure:**

```yaml
id: buildseason-cp1
type: checkpoint
title: "CHECKPOINT 1: MVP Review"
assignee: human
blocks:
  - buildseason-b5u.1
  - buildseason-il2.1
criteria:
  - App runs without errors
  - All pages render correctly
  - Data flows work
  - Patterns are consistent
```

**Behavior:**

- `/army deploy wave1` checks if checkpoint-blocking beads are closed
- If checkpoint open, refuses to deploy and shows what's blocking
- Human closes checkpoint bead when satisfied
- Downstream waves become deployable

---

### 5. Branch Strategy

**Purpose:** Avoid merge conflicts between parallel agents

**Strategy:**

```
main
 └── wave-0-foundation
      ├── agent-1-ui-framework
      ├── agent-2-auth
      ├── agent-3-vendor
      ├── agent-4-bom
      └── agent-5-robots
```

**Merge Order:**

1. Each agent works on feature branch
2. On completion, agent creates PR
3. Human (or orchestrator) merges in dependency order
4. Conflicts resolved before next wave

**Alternative:** Trunk-based with careful file allocation (each agent owns specific files)

---

### 6. Progress Dashboard

**Purpose:** Visualize army progress

**Command:** `/army status`

**Output:**

```
WAVE 0: Foundation [████████░░] 80%
  ├─ UI Framework    [██████████] 100% ✓
  ├─ Auth & Team     [████████░░] 83%
  ├─ Vendor          [██████░░░░] 67%
  ├─ BOM             [███░░░░░░░] 33%
  └─ Robots          [░░░░░░░░░░] 0%

CHECKPOINT 1: MVP Review [PENDING]
  Blocked by: Auth, Vendor, BOM, Robots

WAVE 1: Navigation [BLOCKED]
  Waiting for: CHECKPOINT 1
```

---

## Implementation Priority

### Phase 1: Manual Orchestration (Now)

- Create checkpoint beads
- Add model labels to existing beads
- Add parallel group labels
- Human manually launches agents per wave
- Human manages branches and merges

### Phase 2: Basic Tooling (This Week)

- `/army status` skill for progress view
- `/bead load` skill for context loading
- Branch naming conventions
- Basic orchestration documentation

### Phase 3: Automated Orchestration (Next Week)

- `/army deploy` skill for parallel launch
- Model router hook
- Automated PR creation
- Checkpoint gate enforcement

### Phase 4: Advanced Features (Future)

- Progress dashboard (web UI)
- Automatic conflict detection
- Cost tracking per wave
- Performance analytics

---

## Estimated Timeline

| Wave    | Duration       | Agents | Checkpoint         |
| ------- | -------------- | ------ | ------------------ |
| Wave 0  | 2-4 hours      | 5      | MVP Review         |
| Wave 1  | 2-3 hours      | 2      | Nav Review         |
| Wave 2  | 4-6 hours      | 3      | Core UX Review     |
| Wave 3  | 4-6 hours      | 4      | Integration Review |
| Wave 4  | 6-8 hours      | 6      | Agent Review       |
| Wave 5+ | 4-6 hours each | 4      | Per-phase          |

**Total Estimated Time:** 24-40 hours of parallel agent work
**With Human Review:** 2-3 days calendar time

**Traditional Estimate:** 2-3 months

---

## Slash Commands (Implemented)

### `/army` Command

**Location:** `.claude/commands/army.md`

```
/army status              # Show wave progress and checkpoint gates
/army deploy <wave>       # Launch parallel agents for a wave
/army review <wave>       # Review completed work before closing checkpoint
```

**Usage Flow:**

1. `/army status` — See current state
2. `/army deploy 0` — Launch agents for Wave 0
3. Wait for agents to complete
4. `/army review 0` — Review the work
5. `bd close buildseason-6ea` — Close checkpoint to unblock next wave
6. Repeat for next wave

### `/bead` Command

**Location:** `.claude/commands/bead.md`

```
/bead work <id>           # Pick up a bead, load context, start working
/bead show <id>           # Show bead details
/bead close <id>          # Mark a bead complete
```

**Usage:**

- Use `/bead work xyz` when you want to manually work on a specific bead
- The command loads relevant files and specs into context

---

## Next Steps

1. [x] Create checkpoint beads (cp1, cp2, cp3, cp4)
2. [ ] Label existing beads with model recommendations
3. [ ] Label existing beads with parallel groups
4. [x] Implement `/army` command
5. [x] Implement `/bead` command
6. [ ] Document branch strategy
7. [ ] Deploy Wave 0

---

## Appendix: Bead Labeling Commands

```bash
# Add model labels
bd label buildseason-b5u.2 model:opus    # Dashboard needs careful design
bd label buildseason-il2.3 model:sonnet  # Personality is implementation
bd label buildseason-26d model:haiku     # Simple test task

# Add parallel groups
bd label buildseason-8o9 parallel:wave0-ui
bd label buildseason-5pw parallel:wave0-auth
bd label buildseason-ck0 parallel:wave0-vendor

# Add checkpoint label
bd label buildseason-cp1 checkpoint human
```

---

_Document maintained at: buildseason/docs/agent-army-deployment.md_
