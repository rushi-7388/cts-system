#!/usr/bin/env bash
# ==============================================================================
# CTS PostgreSQL Database Restore Utility (Bash / Linux)
# ==============================================================================
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="${DIR}/../backups"

FILE="$1"
if [ -z "$FILE" ]; then
  FILE=$(ls -t "${BACKUP_DIR}"/cts_backup_*.sql.gz 2>/dev/null | head -n 1)
  if [ -z "$FILE" ]; then
    echo "No backup archives found in ${BACKUP_DIR}"
    exit 1
  fi
fi

echo ">>> Restoring from: ${FILE}"
read -p "Proceed with restoring into cts_system? (y/N): " CONFIRM
if [[ "$CONFIRM" != "y" && "$CONFIRM" != "Y" ]]; then
  echo "Restore aborted."
  exit 0
fi

echo ">>> Unpacking and restoring database..."
gunzip -c "${FILE}" | docker exec -i -e PGPASSWORD=cts_password cts-system-db-1 psql -U cts -d cts_system
echo ">>> Database restored successfully!"
