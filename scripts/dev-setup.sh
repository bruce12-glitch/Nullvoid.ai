#!/usr/bin/env bash
# ============================================================
# NullVoid AI — local development bootstrap
#
# Provisions a local PostgreSQL database and applies migrations.
# Safe to re-run; skips anything that already exists.
# Usage:  bash scripts/dev-setup.sh
# ============================================================
set -euo pipefail

echo "▸ Checking PostgreSQL..."
if ! command -v psql >/dev/null 2>&1; then
  echo "  Installing PostgreSQL..."
  sudo apt-get update -qq && sudo apt-get install -y -qq postgresql postgresql-contrib
fi

sudo service postgresql start 2>/dev/null || true
sleep 2

echo "▸ Ensuring database user + database..."
sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='nullvoid'" | grep -q 1 \
  || sudo -u postgres psql -c "CREATE USER nullvoid WITH PASSWORD 'nullvoid' CREATEDB;"
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='nullvoid'" | grep -q 1 \
  || sudo -u postgres psql -c "CREATE DATABASE nullvoid OWNER nullvoid;"

echo "▸ Installing dependencies..."
[ -d node_modules ] || npm install --no-audit --no-fund

echo "▸ Applying database migrations..."
npx prisma migrate deploy

echo ""
echo "✓ Ready. Start the app with:  npm run dev"
echo "  (Solo mode works without Clerk/Liveblocks/Trigger.dev keys — see .env.example)"
