#!/bin/bash

# Automated backup script for cron jobs
# Add to crontab: 0 2 * * * /path/to/backup-cron.sh

set -e

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LOG_FILE="$PROJECT_DIR/logs/backup.log"

# Create log directory if it doesn't exist
mkdir -p "$(dirname "$LOG_FILE")"

# Function to log messages
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Start backup
log "Starting automated database backup..."

# Change to project directory
cd "$PROJECT_DIR"

# Run backup script
if ./scripts/backup-db.sh >> "$LOG_FILE" 2>&1; then
    log "Backup completed successfully"
    
    # Optional: Send notification on success
    # You can add email notification, Slack webhook, etc. here
    
else
    log "ERROR: Backup failed!"
    
    # Optional: Send alert on failure
    # You can add email alert, monitoring service ping, etc. here
    
    exit 1
fi

# Optional: Upload to cloud storage
# Example for AWS S3:
# if command -v aws &> /dev/null; then
#     LATEST_BACKUP=$(ls -1t ./backups/*_backup_*.gz | head -1)
#     if [ -n "$LATEST_BACKUP" ]; then
#         log "Uploading backup to S3..."
#         aws s3 cp "$LATEST_BACKUP" "s3://your-bucket/backups/" >> "$LOG_FILE" 2>&1
#         log "Upload completed"
#     fi
# fi

log "Automated backup process completed"