#!/bin/sh
set -eu
: "${DATABASE_URL:?DATABASE_URL is required}"
BACKUP_ROOT="${BACKUP_ROOT:-./backups}"
STORAGE_DIR="${STORAGE_DIR:-./storage}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
OUT="$BACKUP_ROOT/thuraya-$STAMP"
mkdir -p "$OUT"
pg_dump "$DATABASE_URL" --format=custom --no-owner --file="$OUT/database.dump"
if [ -d "$STORAGE_DIR" ]; then tar -C "$STORAGE_DIR" -czf "$OUT/storage.tar.gz" .; else tar -czf "$OUT/storage.tar.gz" --files-from /dev/null; fi
cp .env.example "$OUT/env.schema.example" 2>/dev/null || true
( cd "$OUT" && sha256sum database.dump storage.tar.gz > SHA256SUMS )
echo "Backup created: $OUT"
