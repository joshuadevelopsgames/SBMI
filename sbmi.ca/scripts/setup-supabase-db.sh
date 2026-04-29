#!/usr/bin/env bash
# Build DATABASE_URL for Supabase (pooler) and run Prisma migrate + seed.
# Requires: SUPABASE_DB_PASSWORD (set after resetting password in Supabase Dashboard).
# Project ref: wuahhpkrzkcydxezczgz, region: ca-central-1

set -e
REF="wuahhpkrzkcydxezczgz"
REGION="ca-central-1"
if [[ -z "$SUPABASE_DB_PASSWORD" ]]; then
  echo "Set SUPABASE_DB_PASSWORD (reset at https://supabase.com/dashboard/project/${REF}/settings/database)"
  exit 1
fi
# URL-encode password for URI
PW_ENCODED=$(node -e "console.log(encodeURIComponent(process.env.SUPABASE_DB_PASSWORD))" SUPABASE_DB_PASSWORD="$SUPABASE_DB_PASSWORD")
export DATABASE_URL="postgresql://postgres.${REF}:${PW_ENCODED}@aws-0-${REGION}.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require"
cd "$(dirname "$0")/.."
npx prisma migrate deploy
npm run db:seed
echo "Done. Add DATABASE_URL to Vercel: vercel env add DATABASE_URL production (paste the same URL)."
echo "DATABASE_URL (for copy): $DATABASE_URL"
