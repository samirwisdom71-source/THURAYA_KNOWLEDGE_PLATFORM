#!/bin/sh
set -eu
: "${DATABASE_URL:?DATABASE_URL is required}"
: "${RESTORE_FROM:?RESTORE_FROM must point to a backup directory}"
: "${CONFIRM_RESTORE:?Set CONFIRM_RESTORE=YES to continue}"
[ "$CONFIRM_RESTORE" = "YES" ] || { echo "Restore cancelled: CONFIRM_RESTORE must equal YES"; exit 2; }
STORAGE_DIR="${STORAGE_DIR:-./storage}"
[ -f "$RESTORE_FROM/database.dump" ] || { echo "database.dump not found"; exit 2; }
[ -f "$RESTORE_FROM/storage.tar.gz" ] || { echo "storage.tar.gz not found"; exit 2; }
if [ -f "$RESTORE_FROM/SHA256SUMS" ]; then (cd "$RESTORE_FROM" && sha256sum -c SHA256SUMS); fi
pg_restore --clean --if-exists --no-owner --dbname="$DATABASE_URL" "$RESTORE_FROM/database.dump"
mkdir -p "$STORAGE_DIR"
rm -rf "$STORAGE_DIR/private" "$STORAGE_DIR/public"
tar -C "$STORAGE_DIR" -xzf "$RESTORE_FROM/storage.tar.gz"
echo "Restore completed from: $RESTORE_FROM"
