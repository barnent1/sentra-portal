#!/bin/bash

# Database restore script
# Restores database from backup file

set -e

# Check if backup file is provided
if [ $# -eq 0 ]; then
    echo "❌ Error: No backup file specified"
    echo "Usage: $0 <backup-file>"
    echo ""
    echo "Available backups:"
    ls -1t ./backups/*_backup_*.gz 2>/dev/null || echo "No backups found in ./backups/"
    exit 1
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Error: Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "🔄 Database Restore Script"
echo "========================="
echo "Backup file: $BACKUP_FILE"
echo ""

# Warning
echo "⚠️  WARNING: This will overwrite your current database!"
echo "Press Ctrl+C to cancel, or Enter to continue..."
read

# Create temp directory
TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

# Decompress backup if needed
if [[ "$BACKUP_FILE" == *.gz ]]; then
    echo "📦 Decompressing backup..."
    gunzip -c "$BACKUP_FILE" > "$TEMP_DIR/backup"
    RESTORE_FILE="$TEMP_DIR/backup"
else
    RESTORE_FILE="$BACKUP_FILE"
fi

# Detect database type
if [[ "$DATABASE_URL" == file:* ]]; then
    # SQLite restore
    DB_FILE="${DATABASE_URL#file:}"
    
    echo "📥 Restoring SQLite database..."
    
    # Backup current database
    if [ -f "$DB_FILE" ]; then
        cp "$DB_FILE" "$DB_FILE.before-restore"
        echo "📋 Current database backed up to: $DB_FILE.before-restore"
    fi
    
    # Restore from backup
    cp "$RESTORE_FILE" "$DB_FILE"
    
    echo "✅ SQLite database restored successfully!"
    
elif [[ "$DATABASE_URL" == postgres* ]]; then
    # PostgreSQL restore
    echo "📥 Restoring PostgreSQL database..."
    
    # Extract connection details
    if [[ "$DATABASE_URL" =~ postgresql://([^:]+):([^@]+)@([^:]+):([^/]+)/([^?]+) ]]; then
        DB_USER="${BASH_REMATCH[1]}"
        DB_PASS="${BASH_REMATCH[2]}"
        DB_HOST="${BASH_REMATCH[3]}"
        DB_PORT="${BASH_REMATCH[4]}"
        DB_NAME="${BASH_REMATCH[5]}"
        
        # Drop and recreate database
        echo "🗑️  Dropping existing database..."
        PGPASSWORD="$DB_PASS" psql \
            -h "$DB_HOST" \
            -p "$DB_PORT" \
            -U "$DB_USER" \
            -d postgres \
            -c "DROP DATABASE IF EXISTS $DB_NAME;"
        
        echo "🆕 Creating new database..."
        PGPASSWORD="$DB_PASS" psql \
            -h "$DB_HOST" \
            -p "$DB_PORT" \
            -U "$DB_USER" \
            -d postgres \
            -c "CREATE DATABASE $DB_NAME;"
        
        # Restore from backup
        echo "📥 Restoring data..."
        PGPASSWORD="$DB_PASS" psql \
            -h "$DB_HOST" \
            -p "$DB_PORT" \
            -U "$DB_USER" \
            -d "$DB_NAME" \
            -f "$RESTORE_FILE"
        
        echo "✅ PostgreSQL database restored successfully!"
    else
        echo "❌ Error: Invalid PostgreSQL connection string"
        exit 1
    fi
else
    echo "❌ Error: Unsupported database type"
    exit 1
fi

# Run migrations to ensure schema is up to date
echo ""
echo "🔄 Running migrations..."
npm run db:migrate

echo ""
echo "✅ Database restore completed successfully!"