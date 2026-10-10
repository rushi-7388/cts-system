#!/usr/bin/env bash
# ==============================================================================
# CTS Master System Diagnostic Runner (Bash)
# ==============================================================================
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo ">>> Launching CTS Master System Diagnostic Suite..."

node "$SCRIPT_DIR/run-all-diagnostics.js"

if [ $? -eq 0 ]; then
  echo -e "\n>>> [SUCCESS] All CTS diagnostics passed cleanly!"
  exit 0
else
  echo -e "\n>>> [ERROR] Diagnostic suite detected failures."
  exit 1
fi
