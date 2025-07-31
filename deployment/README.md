# Deployment Guide

This directory contains deployment scripts and configurations for deploying Sentra Portal to various platforms.

## Supported Platforms

### 1. Fly.io
Fly.io is a platform for running full-stack apps close to your users.

```bash
cd deployment/fly
chmod +x deploy.sh
./deploy.sh
```

**Prerequisites:**
- Install [flyctl CLI](https://fly.io/docs/getting-started/installing-flyctl/)
- Create a Fly.io account and login: `flyctl auth login`

**Configuration:**
- Edit `fly.toml` in the project root to customize deployment settings
- Set required secrets using `flyctl secrets set`

### 2. Railway
Railway is a deployment platform that makes it easy to deploy apps with minimal configuration.

```bash
cd deployment/railway
chmod +x deploy.sh
./deploy.sh
```

**Prerequisites:**
- Install [Railway CLI](https://docs.railway.app/develop/cli)
- Create a Railway account and login: `railway login`

**Configuration:**
- Edit `railway.json` in the project root to customize deployment settings
- Set environment variables in the Railway dashboard or via CLI

### 3. Self-Hosted
Deploy to your own server using Docker and Docker Compose.

```bash
cd deployment/self-hosted
chmod +x deploy.sh

# Set required environment variables
export DEPLOY_HOST=your-server.com
export DEPLOY_USER=deploy
export DEPLOY_PATH=/opt/sentra-portal

./deploy.sh
```

**Prerequisites:**
- Docker and Docker Compose installed on the target server
- SSH access to the target server
- Nginx (optional, for SSL and reverse proxy)

**Configuration:**
- Copy and edit `.env.example` to `.env` on the target server
- Configure Nginx using the provided configuration files
- Set up SSL certificates using Let's Encrypt

## Environment Variables

All deployment methods require the following environment variables:

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Authentication
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secret-key

# Redis (optional but recommended)
REDIS_URL=redis://user:password@host:6379

# Email (optional)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user@example.com
SMTP_PASSWORD=password
EMAIL_FROM=noreply@example.com
```

## SSL/TLS Configuration

### Fly.io
SSL is automatically handled. To add a custom domain:
```bash
flyctl certs add your-domain.com
```

### Railway
SSL is automatically handled. Custom domains can be added via the dashboard.

### Self-Hosted
Use the provided Nginx configuration with Let's Encrypt:
```bash
# Install certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com
```

## Database Migrations

All deployment scripts automatically run database migrations. To run manually:

```bash
# Fly.io
flyctl ssh console -a your-app-name
npx prisma migrate deploy

# Railway
railway run npx prisma migrate deploy

# Self-hosted
docker-compose exec app npx prisma migrate deploy
```

## Monitoring and Logs

### Fly.io
```bash
flyctl logs -a your-app-name
flyctl monitoring -a your-app-name
```

### Railway
```bash
railway logs
railway open  # Opens dashboard
```

### Self-Hosted
```bash
docker-compose logs -f app
docker-compose ps
```

## Scaling

### Fly.io
```bash
flyctl scale count 3 -a your-app-name
flyctl scale vm shared-cpu-1x -a your-app-name
```

### Railway
Scale via the dashboard or:
```bash
railway vars set RAILWAY_REPLICA_COUNT=3
```

### Self-Hosted
Edit `docker-compose.yml` and update the replica count:
```yaml
deploy:
  replicas: 3
```

## Backup and Recovery

### Database Backups
```bash
# Create backup
pg_dump $DATABASE_URL > backup.sql

# Restore backup
psql $DATABASE_URL < backup.sql
```

### Application Backups
- Store your `.env` files securely
- Keep your Docker images in a registry
- Backup uploaded files if using local storage

## Troubleshooting

### Common Issues

1. **Build failures**: Check Node.js version and dependencies
2. **Database connection errors**: Verify DATABASE_URL and network connectivity
3. **SSL errors**: Ensure certificates are valid and properly configured
4. **Memory issues**: Increase container/VM memory limits

### Debug Commands

```bash
# Check application health
curl https://your-domain.com/api/health

# Test database connection
docker-compose exec app npx prisma db push --preview-feature

# Check environment variables
docker-compose exec app env | grep -E "(DATABASE|REDIS|NEXT)"
```

## Security Checklist

- [ ] Use strong, unique passwords for all services
- [ ] Enable 2FA on deployment platforms
- [ ] Regularly update dependencies
- [ ] Configure firewall rules
- [ ] Use environment variables for secrets
- [ ] Enable HTTPS/SSL
- [ ] Set up monitoring and alerts
- [ ] Regular backups
- [ ] Review and rotate API keys/secrets