#!/bin/sh
set -e

echo "Syncing Prisma schema with database..."
npx prisma db push

echo "Seeding database..."
npx prisma db seed || true

echo "Starting application..."
exec "$@"
