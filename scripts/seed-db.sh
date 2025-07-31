#!/bin/bash

# Database seeding script
# Usage: ./scripts/seed-db.sh [minimal|development|performance]

set -e

SEED_TYPE=${1:-development}

echo "🌱 Database Seeding Script"
echo "========================="
echo "Seed type: $SEED_TYPE"
echo ""

# Export seed type for the seed script
export SEED_TYPE=$SEED_TYPE

# Check if we should reset the database first
if [ "$2" == "--reset" ]; then
    echo "⚠️  Resetting database..."
    npm run db:reset -- --force
fi

# Run the seed script
echo "🌱 Running seed script..."
npm run db:seed

echo ""
echo "✅ Database seeded successfully!"