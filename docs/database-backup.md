# Database Backup and Restore Procedures

## Overview

This document describes the database backup and restore procedures for the Sentra Portal application. The backup system supports both SQLite (development) and PostgreSQL (production) databases.

## Backup Scripts

### Manual Backup

Run a manual backup using:

```bash
./scripts/backup-db.sh
```

This script:
- Automatically detects database type from DATABASE_URL
- Creates timestamped backups in the `./backups` directory
- Compresses backups using gzip
- Maintains a rolling window of backups (default: 10)

### Automated Backups

For production environments, set up automated backups using cron:

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /path/to/sentra-portal/scripts/backup-cron.sh
```

### Backup Configuration

Environment variables for backup configuration:

```bash
BACKUP_DIR="./backups"      # Backup directory location
MAX_BACKUPS="10"            # Maximum number of backups to retain
```

## Restore Procedures

### Restore from Backup

To restore a database from backup:

```bash
# List available backups
ls -la ./backups/

# Restore specific backup
./scripts/restore-db.sh ./backups/postgres_backup_20240731_120000.sql.gz
```

**Warning**: Restoration will overwrite the current database!

### Emergency Recovery

If the main database is corrupted:

1. **SQLite Recovery**:
   ```bash
   # Check for auto-backup
   ls -la dev.db.before-restore
   
   # Restore from auto-backup
   cp dev.db.before-restore dev.db
   ```

2. **PostgreSQL Recovery**:
   ```bash
   # Connect to PostgreSQL as superuser
   psql -U postgres
   
   # Drop corrupted database
   DROP DATABASE sentra_portal;
   
   # Create new database
   CREATE DATABASE sentra_portal;
   
   # Restore from backup
   ./scripts/restore-db.sh ./backups/latest_backup.sql.gz
   ```

## Backup Storage

### Local Storage

Backups are stored locally in the `./backups` directory with the naming convention:
- SQLite: `sqlite_backup_YYYYMMDD_HHMMSS.db.gz`
- PostgreSQL: `postgres_backup_YYYYMMDD_HHMMSS.sql.gz`

### Cloud Storage (Optional)

For production environments, consider uploading backups to cloud storage:

**AWS S3 Example**:
```bash
# Install AWS CLI
apt-get install awscli

# Configure AWS credentials
aws configure

# Modify backup-cron.sh to include S3 upload
# See commented section in the script
```

**Google Cloud Storage Example**:
```bash
# Install gsutil
curl https://sdk.cloud.google.com | bash

# Authenticate
gcloud auth login

# Upload backup
gsutil cp ./backups/latest_backup.gz gs://your-bucket/backups/
```

## Backup Verification

Regularly verify backup integrity:

```bash
# Test restore to temporary database
DATABASE_URL="file:./test.db" ./scripts/restore-db.sh ./backups/latest_backup.gz

# Verify data
npx prisma studio

# Clean up
rm test.db
```

## Disaster Recovery Plan

1. **Regular Backups**: Ensure automated daily backups are running
2. **Off-site Storage**: Store backups in at least two locations
3. **Test Restores**: Monthly test restoration to verify backup integrity
4. **Documentation**: Keep this documentation updated
5. **Access Control**: Limit backup access to authorized personnel

## Monitoring

Monitor backup health:

```bash
# Check backup logs
tail -f logs/backup.log

# Verify recent backups
ls -la ./backups/ | head -10

# Check backup sizes
du -h ./backups/*
```

## Security Considerations

1. **Encryption**: Consider encrypting backups at rest
2. **Access Control**: Restrict backup directory permissions
3. **Retention**: Follow data retention policies
4. **Sanitization**: Remove sensitive data from development backups

```bash
# Encrypt backup
gpg --symmetric --cipher-algo AES256 backup.sql.gz

# Decrypt backup
gpg --decrypt backup.sql.gz.gpg > backup.sql.gz
```