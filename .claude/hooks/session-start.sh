#!/bin/bash
# .claude/hooks/session-start.sh
# Installs bd (beads issue tracker) with fallbacks for restricted environments

set -e

echo "🔗 Setting up bd (beads issue tracker)..."

BD_INSTALLED=false

# Check if bd is already installed globally
if command -v bd &> /dev/null && bd version &> /dev/null 2>&1; then
    echo "✓ bd already installed: $(bd version 2>/dev/null || echo 'unknown')"
    BD_INSTALLED=true
fi

# Option 1: Use vendored binary (committed to repo for Claude Code Web)
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

# Option 2: Try npm install
if [ "$BD_INSTALLED" = false ]; then
    echo "Installing @beads/bd via npm..."
    if npm install -g @beads/bd 2>/dev/null; then
        if bd version &> /dev/null 2>&1; then
            echo "✓ bd installed via npm"
            BD_INSTALLED=true
        fi
    fi
fi

# Option 3: Fallback to bd-shim.js (pure JS implementation)
if [ "$BD_INSTALLED" = false ]; then
    SHIM_PATH="$CLAUDE_PROJECT_DIR/.claude/hooks/bd-shim.js"
    if [ -f "$SHIM_PATH" ]; then
        echo "⚠ Native bd unavailable, using bd-shim fallback"
        chmod +x "$SHIM_PATH"
        # Create alias function for this session
        bd() {
            node "$SHIM_PATH" "$@"
        }
        export -f bd
        BD_INSTALLED=true
    fi
fi

if [ "$BD_INSTALLED" = false ]; then
    echo "✗ bd installation failed - no fallback available"
    echo "  You can still work with .beads/issues.jsonl directly"
    exit 0  # Don't fail the hook, just warn
fi

# Initialize if needed
if [ ! -d .beads ]; then
    echo "Note: No .beads directory found. Run 'bd init' to initialize."
else
    echo ""
    echo "Ready work:"
    bd ready --limit 5 2>/dev/null || echo "  (unable to list ready work)"
fi

echo ""
echo "✓ Beads ready! Use 'bd ready' to see available tasks."
