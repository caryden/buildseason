#!/bin/bash
# Army Status - Display deployment wave progress
# Usage: ./army-status.sh [--ready|--blocked|--wave N]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Progress bar function
progress_bar() {
    local percent=$1
    local width=10
    local filled=$((percent * width / 100))
    local empty=$((width - filled))

    printf "["
    printf "%0.s█" $(seq 1 $filled 2>/dev/null) || true
    printf "%0.s░" $(seq 1 $empty 2>/dev/null) || true
    printf "] %3d%%" "$percent"
}

# Get issue counts for an epic
get_epic_progress() {
    local epic_id=$1
    local total=$(bd show "$epic_id" 2>/dev/null | grep -c "↳" || echo "0")
    local closed=$(bd show "$epic_id" 2>/dev/null | grep "↳" | grep -c "closed" || echo "0")

    if [ "$total" -eq 0 ]; then
        echo "0 0 0"
    else
        local percent=$((closed * 100 / total))
        echo "$closed $total $percent"
    fi
}

# Check if a bead is closed
is_closed() {
    local bead_id=$1
    bd show "$bead_id" 2>/dev/null | grep -q "Status: closed"
}

# Check if a bead is blocked
is_blocked() {
    local bead_id=$1
    bd blocked 2>/dev/null | grep -q "$bead_id"
}

echo ""
echo -e "${BOLD}============================================================${NC}"
echo -e "${BOLD}                    AGENT ARMY STATUS${NC}"
echo -e "${BOLD}============================================================${NC}"
echo ""

# WAVE 0: Foundation
echo -e "${CYAN}${BOLD}WAVE 0: Foundation (Complete Existing MVP)${NC}"

# Get stats for each epic in Wave 0
for epic in "8o9:UI Framework" "5pw:Auth & Team" "ck0:Vendor Directory" "03y:BOM" "8mf:Robots & Seasons"; do
    id=$(echo "$epic" | cut -d: -f1)
    name=$(echo "$epic" | cut -d: -f2)

    read closed total percent <<< $(get_epic_progress "buildseason-$id")

    if [ "$percent" -eq 100 ]; then
        status="${GREEN}✓${NC}"
    elif [ "$percent" -gt 0 ]; then
        status="${YELLOW}⏳${NC}"
    else
        status="${RED}○${NC}"
    fi

    printf "  ├─ %-25s $(progress_bar $percent) %s\n" "$name ($id)" "$status"
done

echo ""
echo -e "${BOLD}------------------------------------------------------------${NC}"

# CHECKPOINT 1
cp1_status="PENDING"
cp1_icon="⏳"
if is_closed "buildseason-6ea"; then
    cp1_status="${GREEN}COMPLETE${NC}"
    cp1_icon="✓"
else
    cp1_status="${YELLOW}PENDING${NC}"
fi
echo -e "${BOLD}CHECKPOINT 1: MVP Review${NC}              [$cp1_status] $cp1_icon"
echo "  Bead: buildseason-6ea"
if ! is_closed "buildseason-6ea"; then
    echo "  Status: Open - Waiting for Wave 0 completion"
    echo "  Blocks: Wave 1 (Navigation, Discord)"
fi
echo -e "${BOLD}------------------------------------------------------------${NC}"
echo ""

# WAVE 1
echo -e "${CYAN}${BOLD}WAVE 1: Navigation + Discord${NC}"
if is_blocked "buildseason-b5u.1"; then
    echo -e "  Status: ${RED}BLOCKED${NC} by Checkpoint 1"
    echo "  ├─ Navigation (b5u.1)          Blocked by CP1"
    echo "  └─ Discord Bot (il2.1)         Blocked by CP1"
else
    echo -e "  Status: ${GREEN}READY${NC}"
fi

echo ""
echo -e "${BOLD}------------------------------------------------------------${NC}"

# CHECKPOINT 2
if is_closed "buildseason-2zlp"; then
    echo -e "${BOLD}CHECKPOINT 2: Navigation Review${NC}       [${GREEN}COMPLETE${NC}] ✓"
else
    echo -e "${BOLD}CHECKPOINT 2: Navigation Review${NC}       [${RED}BLOCKED${NC}] 🚫"
fi
echo -e "${BOLD}------------------------------------------------------------${NC}"
echo ""

# WAVE 2
echo -e "${CYAN}${BOLD}WAVE 2: Dashboard + Calendar + Claude SDK${NC}"
if is_blocked "buildseason-b5u.2"; then
    echo -e "  Status: ${RED}BLOCKED${NC} by Checkpoint 2"
else
    echo -e "  Status: ${GREEN}READY${NC}"
fi

echo ""
echo -e "${BOLD}------------------------------------------------------------${NC}"

# CHECKPOINT 3
if is_closed "buildseason-z942"; then
    echo -e "${BOLD}CHECKPOINT 3: Core UX Review${NC}          [${GREEN}COMPLETE${NC}] ✓"
else
    echo -e "${BOLD}CHECKPOINT 3: Core UX Review${NC}          [${RED}BLOCKED${NC}] 🚫"
fi
echo -e "${BOLD}------------------------------------------------------------${NC}"
echo ""

# WAVE 3
echo -e "${CYAN}${BOLD}WAVE 3: Robots + Integrations${NC}"
if is_blocked "buildseason-b5u.4"; then
    echo -e "  Status: ${RED}BLOCKED${NC} by Checkpoint 3"
else
    echo -e "  Status: ${GREEN}READY${NC}"
fi

echo ""
echo -e "${BOLD}------------------------------------------------------------${NC}"

# CHECKPOINT 4
if is_closed "buildseason-4a5n"; then
    echo -e "${BOLD}CHECKPOINT 4: Integration Review${NC}      [${GREEN}COMPLETE${NC}] ✓"
else
    echo -e "${BOLD}CHECKPOINT 4: Integration Review${NC}      [${RED}BLOCKED${NC}] 🚫"
fi
echo -e "${BOLD}------------------------------------------------------------${NC}"
echo ""

# WAVE 4+
echo -e "${CYAN}${BOLD}WAVE 4+: Expansion Phases${NC}"
if is_blocked "buildseason-b5u.5"; then
    echo -e "  Status: ${RED}BLOCKED${NC} by Checkpoint 4"
else
    echo -e "  Status: ${GREEN}READY${NC}"
fi

echo ""
echo -e "${BOLD}============================================================${NC}"
echo -e "${BOLD}                       SUMMARY${NC}"
echo -e "${BOLD}============================================================${NC}"

# Get overall counts
total_open=$(bd list --status open 2>/dev/null | wc -l | tr -d ' ')
total_closed=$(bd list --status closed 2>/dev/null | wc -l | tr -d ' ')
total=$((total_open + total_closed))
if [ "$total" -gt 0 ]; then
    overall_percent=$((total_closed * 100 / total))
else
    overall_percent=0
fi

ready_count=$(bd ready 2>/dev/null | grep -c "^\[P" || echo "0")
blocked_count=$(bd blocked 2>/dev/null | grep -c "^\[P" || echo "0")

echo ""
echo "  Total Open Issues:    $total_open"
echo "  Total Closed Issues:  $total_closed"
echo -e "  Overall Progress:     $(progress_bar $overall_percent)"
echo ""
echo -e "  ${GREEN}Ready to Work:${NC}        $ready_count issues"
echo -e "  ${RED}Currently Blocked:${NC}    $blocked_count issues"
echo ""

# Next action recommendation
echo -e "${BOLD}Next Action:${NC}"
if ! is_closed "buildseason-6ea"; then
    echo "  → Complete Wave 0 remaining tasks"
    echo "  → Then close CHECKPOINT 1 (buildseason-6ea) to unblock Wave 1"
elif ! is_closed "buildseason-2zlp"; then
    echo "  → Complete Wave 1 (Navigation + Discord)"
    echo "  → Then close CHECKPOINT 2 (buildseason-2zlp) to unblock Wave 2"
elif ! is_closed "buildseason-z942"; then
    echo "  → Complete Wave 2 (Dashboard + Calendar + Claude SDK)"
    echo "  → Then close CHECKPOINT 3 (buildseason-z942) to unblock Wave 3"
elif ! is_closed "buildseason-4a5n"; then
    echo "  → Complete Wave 3 (Robots + Integrations)"
    echo "  → Then close CHECKPOINT 4 (buildseason-4a5n) to unblock Wave 4"
else
    echo "  → All checkpoints complete! Continue with expansion phases."
fi

echo ""
echo -e "${BOLD}============================================================${NC}"
echo ""

# Show ready work if requested or by default
if [ "$1" != "--no-ready" ]; then
    echo -e "${BOLD}READY TO WORK (no blockers):${NC}"
    echo ""
    bd ready 2>/dev/null | head -20
    echo ""
fi
