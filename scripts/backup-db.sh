#!/bin/bash

# Database backup script
# Supports both SQLite and PostgreSQL backups

set -e

# Configuration
BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
MAX_BACKUPS="${MAX_BACKUPS:-10}"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "🔒 Database Backup Script"
echo "========================"
echo "Timestamp: $TIMESTAMP"
echo "Backup directory: $BACKUP_DIR"
echo ""

# Detect database type from DATABASE_URL
if [[ "$DATABASE_URL" == file:* ]]; then
    # SQLite backup
    DB_FILE="${DATABASE_URL#file:}"
    BACKUP_FILE="$BACKUP_DIR/sqlite_backup_$TIMESTAMP.db"
    
    echo "📦 Backing up SQLite database..."
    
    if [ -f "$DB_FILE" ]; then
        cp "$DB_FILE" "$BACKUP_FILE"
        
        # Compress the backup
        gzip "$BACKUP_FILE"
        BACKUP_FILE="$BACKUP_FILE.gz"
        
        echo "✅ SQLite backup created: $BACKUP_FILE"
    else
        echo "❌ Error: SQLite database file not found: $DB_FILE"
        exit 1
    fi
    
elif [[ "$DATABASE_URL" == postgres* ]]; then
    # PostgreSQL backup
    BACKUP_FILE="$BACKUP_DIR/postgres_backup_$TIMESTAMP.sql"
    
    echo "📦 Backing up PostgreSQL database..."
    
    # Extract connection details from DATABASE_URL
    # Format: postgresql://user:password@host:port/database
    if [[ "$DATABASE_URL" =~ postgresql://([^:]+):([^@]+)@([^:]+):([^/]+)/([^?]+) ]]; then
        DB_USER="${BASH_REMATCH[1]}"
        DB_PASS="${BASH_REMATCH[2]}"
        DB_HOST="${BASH_REMATCH[3]}"
        DB_PORT="${BASH_REMATCH[4]}"
        DB_NAME="${BASH_REMATCH[5]}"
        
        # Use pg_dump with connection parameters
        PGPASSWORD="$DB_PASS" pg_dump \
            -h "$DB_HOST" \
            -p "$DB_PORT" \
            -U "$DB_USER" \
            -d "$DB_NAME" \
            -f "$BACKUP_FILE" \
            --verbose \
            --no-owner \
            --no-privileges
        
        # Compress the backup
        gzip "$BACKUP_FILE"
        BACKUP_FILE="$BACKUP_FILE.gz"
        
        echo "✅ PostgreSQL backup created: $BACKUP_FILE"
    else
        echo "❌ Error: Invalid PostgreSQL connection string"
        exit 1
    fi
else
    echo "❌ Error: Unsupported database type. DATABASE_URL must start with 'file:' or 'postgresql:'"
    exit 1
fi

# Calculate backup size
BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo "📊 Backup size: $BACKUP_SIZE"

# Cleanup old backups
echo ""
echo "🧹 Cleaning up old backups..."
BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/*_backup_*.gz 2>/dev/null | wc -l)

if [ "$BACKUP_COUNT" -gt "$MAX_BACKUPS" ]; then
    # Delete oldest backups
    ls -1t "$BACKUP_DIR"/*_backup_*.gz | tail -n +$((MAX_BACKUPS + 1)) | xargs rm -f
    echo "✅ Removed $((BACKUP_COUNT - MAX_BACKUPS)) old backup(s)"
else
    echo "✅ No cleanup needed ($BACKUP_COUNT backups, max: $MAX_BACKUPS)"
fi

echo ""
echo "✅ Backup completed successfully!"
echo "📁 Backup location: $BACKUP_FILE"