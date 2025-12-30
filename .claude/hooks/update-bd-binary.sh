#!/bin/bash
# .claude/hooks/update-bd-binary.sh
# Updates the vendored bd binary to the latest version
# Run this from CLI (not Claude Code Web) when bd doctor reports version mismatch

set -e

BEADS_BIN_DIR="$(cd "$(dirname "$0")/../../.beads/bin" && pwd)"
TEMP_DIR=$(mktemp -d)

echo "🔄 Updating vendored bd binary..."
echo "   Target: $BEADS_BIN_DIR"

# Get latest version
echo "   Fetching latest release info..."
LATEST_VERSION=$(curl -s https://api.github.com/repos/steveyegge/beads/releases/latest | grep '"tag_name"' | sed -E 's/.*"v([^"]+)".*/\1/')

if [ -z "$LATEST_VERSION" ]; then
    echo "✗ Failed to fetch latest version"
    exit 1
fi

echo "   Latest version: v$LATEST_VERSION"

# Check current version
if [ -x "$BEADS_BIN_DIR/bd" ]; then
    CURRENT_VERSION=$("$BEADS_BIN_DIR/bd" version 2>/dev/null | head -1 || echo "unknown")
    echo "   Current version: $CURRENT_VERSION"
fi

# Download Linux amd64 binary (for Claude Code Web)
ARCHIVE_NAME="beads_${LATEST_VERSION}_linux_amd64.tar.gz"
DOWNLOAD_URL="https://github.com/steveyegge/beads/releases/download/v${LATEST_VERSION}/${ARCHIVE_NAME}"

echo "   Downloading $ARCHIVE_NAME..."
curl -L -o "$TEMP_DIR/$ARCHIVE_NAME" "$DOWNLOAD_URL"

# Extract
echo "   Extracting..."
tar -xzf "$TEMP_DIR/$ARCHIVE_NAME" -C "$TEMP_DIR"

# Replace binary
echo "   Installing to $BEADS_BIN_DIR..."
mkdir -p "$BEADS_BIN_DIR"
cp "$TEMP_DIR/bd" "$BEADS_BIN_DIR/bd"
chmod +x "$BEADS_BIN_DIR/bd"

# Copy docs if present
for f in CHANGELOG.md LICENSE README.md; do
    if [ -f "$TEMP_DIR/$f" ]; then
        cp "$TEMP_DIR/$f" "$BEADS_BIN_DIR/"
    fi
done

# Cleanup
rm -rf "$TEMP_DIR"

# Verify
NEW_VERSION=$("$BEADS_BIN_DIR/bd" version 2>/dev/null | head -1 || echo "unknown")
echo ""
echo "✓ Updated vendored bd to: $NEW_VERSION"
echo ""
echo "Next steps:"
echo "  1. Run 'bd doctor' to verify compatibility"
echo "  2. Commit the updated binary: git add .beads/bin && git commit -m 'Update vendored bd to v$LATEST_VERSION'"
echo "  3. Push to remote"
