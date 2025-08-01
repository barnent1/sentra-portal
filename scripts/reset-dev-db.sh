#!/bin/bash

# Development database reset script
# WARNING: This will delete all data in the development database

set -e

echo "⚠️  Warning: This will reset your development database and delete all data!"
echo "Press Ctrl+C to cancel, or Enter to continue..."
read

echo "Resetting development database..."

# Reset the database
npm run db:reset

# Seed the database (if seed script exists)
if [ -f "db/seed.ts" ]; then
    echo "Seeding database..."
    npm run db:seed
fi

echo "Database reset completed!"