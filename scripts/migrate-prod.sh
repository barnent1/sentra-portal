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

# Run migrations
echo "Running database migrations..."
NODE_ENV=production npm run db:migrate:prod

echo "Migrations completed successfully!"