#!/bin/bash
# .claude/hooks/session-start.sh
# Sets up bd (beads issue tracker) using vendored binary or global install

set -e

echo "🔗 Setting up bd (beads issue tracker)..."

BD_INSTALLED=false

# Check if bd is already installed globally
if command -v bd &> /dev/null && bd version &> /dev/null 2>&1; then
    echo "✓ bd already installed: $(bd version 2>/dev/null || echo 'unknown')"
    BD_INSTALLED=true
fi

# Use vendored binary (committed to repo for Claude Code Web)
if [ "$BD_INSTALLED" = false ]; then
    VENDORED_BD="$CLAUDE_PROJECT_DIR/.beads/bin/bd"
    if [ -x "$VENDORED_BD" ]; then
        export PATH="$CLAUDE_PROJECT_DIR/.beads/bin:$PATH"
        if bd version &> /dev/null 2>&1; then
            echo "✓ Using vendored bd: $(bd version 2>/dev/null || echo 'unknown')"
            BD_INSTALLED=true
        fi
    fi
fi

if [ "$BD_INSTALLED" = false ]; then
    echo "✗ bd not available"
    echo "  Install globally: bun install -g @beads/bd"
    exit 0
fi

# Version compatibility check via bd doctor
if [ -d .beads ]; then
    echo ""
    echo "Checking version compatibility..."

    DOCTOR_OUTPUT=$(bd doctor 2>&1 || true)

    # Check for version mismatch (database version != CLI version)
    DB_VERSION=$(echo "$DOCTOR_OUTPUT" | grep -o "Database version [0-9.]*" | grep -o "[0-9.]*" || echo "")
    CLI_VERSION=$(echo "$DOCTOR_OUTPUT" | grep -o "CLI Version [0-9.]*" | grep -o "[0-9.]*" || echo "")

    if [ -n "$DB_VERSION" ] && [ -n "$CLI_VERSION" ] && [ "$DB_VERSION" != "$CLI_VERSION" ]; then
        echo ""
        echo "⚠️  VERSION MISMATCH DETECTED"
        echo "   Database version: $DB_VERSION"
        echo "   CLI version: $CLI_VERSION"
        echo ""
        echo "   To fix: Teleport this session to CLI and run:"
        echo "   .claude/hooks/update-bd-binary.sh"
        echo ""
    fi

    # Check for failures in bd doctor
    if echo "$DOCTOR_OUTPUT" | grep -q "✖.*failed"; then
        FAILURES=$(echo "$DOCTOR_OUTPUT" | grep -c "✖" || echo "0")
        echo "⚠️  bd doctor found $FAILURES issue(s). Run 'bd doctor' for details."
    else
        echo "✓ Version check passed"
    fi

    # Show ready work
    echo ""
    echo "Ready work:"
    bd ready --limit 5 2>/dev/null || echo "  (unable to list ready work)"
fi

echo ""
echo "✓ Beads ready! Use 'bd ready' to see available tasks."
