---
name: ui-design-review
description: >-
  Conduct UI/UX design reviews using Chrome MCP browser automation.
  Use when reviewing UI implementations, auditing design compliance,
  verifying accessibility, or validating against design specs.
allowed-tools: Read, Glob, Grep, mcp__claude-in-chrome__*, Bash(bd:*)
---

# UI Design Review

Visually verify UI implementations using Chrome MCP browser automation.

## Related Skills

- **brand-guidelines** - Typography, colors, design patterns to enforce
- **chrome-mcp-testing** - Browser automation tools and workflows

## Review Philosophy

**This is a VISUAL review, not a code review.**

- Navigate to actual pages in the browser
- Take screenshots to verify rendered UI
- Test real interactions (clicks, forms, navigation)
- Check responsive behavior by resizing

## Setup

1. Ensure dev server is running at `http://localhost:5173`
2. Get tab context: `tabs_context_mcp`
3. Create or use existing tab for testing

## Specs to Reference

Before reviewing, read these files:

- `docs/ui-refocus-spec.md` - Primary UI spec
- `docs/ui-ux-design-spec.md` - Design system
- `.claude/skills/brand-guidelines/SKILL.md` - Colors, fonts, elements

## Review Checklist

### 1. Navigation & Routes

- [ ] Navigate to each page via sidebar links
- [ ] Verify all sidebar links work (no 404s)
- [ ] Check breadcrumbs show correct path
- [ ] Test browser back/forward behavior

### 2. Page Content

- [ ] Screenshot each page and verify against spec
- [ ] Check headers, labels, and copy match spec
- [ ] Verify data displays correctly (or appropriate empty states)
- [ ] Confirm CTAs and buttons are present and labeled correctly

### 3. Interactions

- [ ] Click buttons and verify responses
- [ ] Test form inputs and validation
- [ ] Check dropdowns, modals, and dialogs work
- [ ] Verify loading states appear during async operations

### 4. Brand Compliance (per brand-guidelines skill)

**Typography:**

- [ ] Headings use Oxanium (`font-display`)
- [ ] Body text uses IBM Plex Sans (`font-body`)
- [ ] Data values use JetBrains Mono (`font-mono`) with `tabular-nums`
- [ ] Status badges are uppercase with wide tracking

**Colors:**

- [ ] Primary accent is Electric Cyan (`oklch(75% 0.18 195)`)
- [ ] Background is dark industrial (not pure black)
- [ ] Text has proper contrast (foreground vs muted-foreground)

**Design Elements:**

- [ ] Cards use `border-border bg-card`
- [ ] Primary buttons have glow effect on hover
- [ ] Data displays use metric-box or monospace styling
- [ ] Section headers have cyan bar accent

### 5. Accessibility

- [ ] Focus indicators visible when tabbing
- [ ] Text has sufficient contrast
- [ ] Interactive elements are clearly clickable
- [ ] Error messages are visible and helpful
- [ ] ARIA labels on interactive elements

### 6. Responsive Design

Use `resize_window` to test breakpoints:

- [ ] Mobile layout (375px width) - no horizontal scroll
- [ ] Tablet layout (768px width) - proper stacking
- [ ] Desktop layout (1280px+) - full sidebar visible

### 7. Error Scenarios

- [ ] Invalid routes show 404 or redirect appropriately
- [ ] Logged out state handled (redirect to login)
- [ ] Error states display properly
- [ ] Empty states are helpful (not just blank)

## Issue Creation

For each issue found, create a bead:

```bash
# UI bug
bd create --title="UI: <specific issue>" --type=bug --priority=<1-3> --label="review:ux"

# Spec ambiguity or question
bd create --title="Question: <UI/UX question>" --type=task --priority=2 --label="human" --label="review:ux"
```

**Priority guide:**

- P1: Spec violation, broken functionality
- P2: Accessibility issue, brand inconsistency
- P3: Polish, minor improvements

## Example Workflow

```
# 1. Setup
tabs_context_mcp -> get or create tab
navigate -> http://localhost:5173

# 2. Check each page
navigate -> /team/FTC/12345/dashboard
computer(screenshot) -> capture current state
read_page -> get accessibility tree

# 3. Test interactions
find -> "Add Part" button
computer(left_click) -> click it
read_page -> verify modal/response

# 4. Check responsive
resize_window(375, 812) -> mobile
computer(screenshot) -> verify layout

# 5. Log issues
bd create --title="UI: Sidebar overlaps content on mobile" --type=bug --priority=2 --label="review:ux"
```

## Anti-Patterns

- **Code-only review** - Must actually render pages in browser
- **Skipping empty states** - Test with no data, not just happy path
- **Ignoring mobile** - Always check responsive breakpoints
- **Missing brand checks** - Verify fonts, colors, design elements
- **No screenshots** - Capture visual evidence of issues

## Closing the Review

When complete:

1. Create beads for all issues found
2. Close review bead with summary:
   ```bash
   bd close <review-bead-id> --reason="Found N issues: X P1, Y P2, Z P3"
   ```
3. Report summary of pages reviewed and issues created
