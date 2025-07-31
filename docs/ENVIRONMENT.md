# Environment Variables Documentation

This document describes all environment variables used by Sentra Portal.

## Table of Contents

- [Quick Start](#quick-start)
- [Core Configuration](#core-configuration)
- [Database Configuration](#database-configuration)
- [Authentication](#authentication)
- [Security](#security)
- [Email Configuration](#email-configuration)
- [Storage](#storage)
- [Monitoring](#monitoring)
- [Feature Flags](#feature-flags)

## Quick Start

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Generate secure secrets:
   ```bash
   # Generate a secure NEXTAUTH_SECRET
   openssl rand -base64 32

   # Generate other secrets
   openssl rand -hex 32
   ```

3. Validate your configuration:
   ```bash
   npm run validate:env
   ```

## Core Configuration

### NODE_ENV
- **Type**: `string`
- **Required**: Yes
- **Values**: `development`, `production`, `test`
- **Description**: Application environment

### PORT
- **Type**: `number`
- **Default**: `3000`
- **Description**: Port number for the application

## Database Configuration

### DATABASE_URL
- **Type**: `string`
- **Required**: Yes
- **Format**: `postgresql://[user]:[password]@[host]:[port]/[database]`
- **Example**: `postgresql://user:pass@localhost:5432/sentra_db`

### Database Pool Settings
- **DB_POOL_SIZE**: Maximum database connections (default: 10)
- **DB_CONNECTION_TIMEOUT**: Connection timeout in ms (default: 5000)
- **DB_IDLE_TIMEOUT**: Idle connection timeout (default: 10000)
- **DB_MAX_LIFETIME**: Maximum connection lifetime (default: 1800000)

## Authentication

### NEXTAUTH_URL
- **Type**: `string`
- **Required**: Yes
- **Description**: Canonical URL of your site
- **Example**: `https://sentra.com`

### NEXTAUTH_SECRET
- **Type**: `string`
- **Required**: Yes
- **Description**: Secret used to encrypt JWT tokens
- **Generation**: `openssl rand -base64 32`

### OAuth Providers (Optional)
- **GITHUB_CLIENT_ID**: GitHub OAuth app client ID
- **GITHUB_CLIENT_SECRET**: GitHub OAuth app client secret
- **GOOGLE_CLIENT_ID**: Google OAuth client ID
- **GOOGLE_CLIENT_SECRET**: Google OAuth client secret

## Security

### API_KEY_SALT
- **Type**: `string`
- **Required**: Yes (production)
- **Description**: Salt for hashing API keys
- **Length**: Minimum 32 characters

### JWT_SECRET
- **Type**: `string`
- **Required**: Yes (production)
- **Description**: Secret for signing JWTs
- **Length**: Minimum 32 characters

### ENCRYPTION_KEY
- **Type**: `string`
- **Required**: Yes (production)
- **Description**: Key for encrypting sensitive data
- **Length**: Exactly 32 characters

### CORS_ALLOWED_ORIGINS
- **Type**: `string`
- **Format**: Comma-separated URLs
- **Example**: `https://app.sentra.com,https://sentra.com`

## Email Configuration

### SMTP Settings
- **EMAIL_FROM**: Default sender email address
- **SMTP_HOST**: SMTP server hostname
- **SMTP_PORT**: SMTP server port (587 for TLS, 465 for SSL)
- **SMTP_USER**: SMTP username
- **SMTP_PASSWORD**: SMTP password
- **SMTP_SECURE**: Use SSL/TLS (true/false)

### Email Service Providers
Alternative to SMTP:
- **RESEND_API_KEY**: Resend.com API key
- **SENDGRID_API_KEY**: SendGrid API key

## Storage

### Local Storage
- **UPLOAD_DIR**: Directory for file uploads (default: `./uploads`)
- **MAX_FILE_SIZE**: Maximum file size in bytes (default: 10MB)

### S3-Compatible Storage
- **S3_ENDPOINT**: S3 endpoint URL
- **S3_REGION**: AWS region
- **S3_ACCESS_KEY_ID**: Access key
- **S3_SECRET_ACCESS_KEY**: Secret key
- **S3_BUCKET_NAME**: Bucket name

## Monitoring

### Sentry Error Tracking
- **SENTRY_DSN**: Sentry project DSN
- **SENTRY_ENVIRONMENT**: Environment name for Sentry
- **SENTRY_TRACES_SAMPLE_RATE**: Performance monitoring sample rate (0-1)

### Analytics
- **GOOGLE_ANALYTICS_ID**: Google Analytics measurement ID
- **POSTHOG_API_KEY**: PostHog project API key
- **POSTHOG_API_HOST**: PostHog instance URL

## Feature Flags

Control application features:
- **FEATURE_REGISTRATION_ENABLED**: Allow new user registration
- **FEATURE_EMAIL_VERIFICATION**: Require email verification
- **FEATURE_SOCIAL_AUTH**: Enable OAuth providers
- **FEATURE_API_KEYS**: Enable API key management
- **FEATURE_WEBHOOKS**: Enable webhook functionality

## Environment-Specific Files

- `.env.local`: Local development (gitignored)
- `.env.development`: Development defaults (committed)
- `.env.test`: Test environment (committed)
- `.env.production`: Production (never commit)

## Security Best Practices

1. **Never commit** `.env.local` or `.env.production`
2. **Rotate secrets** regularly
3. **Use strong secrets** (minimum 32 characters)
4. **Limit access** to production environment variables
5. **Audit logs** for environment variable access

## Troubleshooting

### Common Issues

1. **"Missing required variable" error**
   - Ensure all required variables are set
   - Run `npm run validate:env`

2. **Database connection errors**
   - Verify DATABASE_URL format
   - Check network connectivity
   - Ensure database is running

3. **Authentication errors**
   - Verify NEXTAUTH_URL matches your domain
   - Ensure NEXTAUTH_SECRET is set correctly

### Validation Script

Use the validation script to check your configuration:

```bash
# Validate current environment
npm run validate:env

# Generate .env.local from .env.example
npm run env:generate
```