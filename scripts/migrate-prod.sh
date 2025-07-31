#!/bin/bash

# Production migration script
# This script handles database migrations for production environments

set -e

echo "Running production database migrations..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "Error: DATABASE_URL environment variable is not set"
    exit 1
fi

# Generate Prisma client with production schema
echo "Generating Prisma client..."
npx prisma generate --schema=./prisma/schema.prod.prisma

# Run migrations
echo "Running database migrations..."
npx prisma migrate deploy --schema=./prisma/schema.prod.prisma

echo "Migrations completed successfully!"