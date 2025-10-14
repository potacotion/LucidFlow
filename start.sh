#!/bin/bash
#
# LucidFlow Start Script for Linux/macOS
# Installs dependencies and starts backend & frontend services in new terminals.
#

set -e # Exit immediately if a command exits with a non-zero status.

echo "[LucidFlow] Installing backend dependencies..."
(cd backend && pnpm install)

echo "[LucidFlow] Installing frontend dependencies..."
(cd frontend && pnpm install)

# --- Terminal Detection ---
TERMINAL_CMD=""
if command -v gnome-terminal &> /dev/null; then
    TERMINAL_CMD="gnome-terminal --"
elif command -v konsole &> /dev/null; then
    TERMINAL_CMD="konsole -e"
elif command -v xterm &> /dev/null; then
    TERMINAL_CMD="xterm -e"
fi

if [ -z "$TERMINAL_CMD" ]; then
    echo ""
    echo "#####################################################################"
    echo "# Warning: Could not find a supported terminal emulator.            #"
    echo "# Please start the services manually in two separate terminals:   #"
    echo "#   - In './backend', run: pnpm run dev                           #"
    echo "#   - In './frontend', run: pnpm run dev                          #"
    echo "#####################################################################"
    exit 1
fi

echo "[LucidFlow] Starting backend and frontend servers in new terminal windows..."

# Start Backend
$TERMINAL_CMD bash -c "echo '--- Starting LucidFlow Backend ---'; cd backend; pnpm run dev; exec bash" &

# Start Frontend
$TERMINAL_CMD bash -c "echo '--- Starting LucidFlow Frontend ---'; cd frontend; pnpm run dev; exec bash" &

echo "[LucidFlow] Services are launching."