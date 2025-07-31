#!/bin/bash

# Fly.io Deployment Script for Sentra Portal
# This script deploys the application to Fly.io

set -e

echo "🚀 Starting Fly.io deployment..."

# Check if fly CLI is installed
if ! command -v flyctl &> /dev/null; then
    echo "❌ Error: flyctl CLI is not installed"
    echo "Please install it from: https://fly.io/docs/getting-started/installing-flyctl/"
    exit 1
fi

# Check if logged in to Fly
if ! flyctl auth whoami &> /dev/null; then
    echo "❌ Error: Not logged in to Fly.io"
    echo "Please run: flyctl auth login"
    exit 1
fi

# Configuration
APP_NAME="${FLY_APP_NAME:-sentra-portal}"
REGION="${FLY_REGION:-iad}"
ORG="${FLY_ORG:-personal}"

# Check if app exists
if ! flyctl apps list | grep -q "$APP_NAME"; then
    echo "📱 Creating new Fly app: $APP_NAME"
    flyctl apps create "$APP_NAME" --org "$ORG"
else
    echo "✅ App $APP_NAME already exists"
fi

# Set secrets if they don't exist
echo "🔐 Setting secrets..."
flyctl secrets set \
    NODE_ENV=production \
    NEXTAUTH_URL="https://$APP_NAME.fly.dev" \
    --app "$APP_NAME" \
    --stage

# Check if other required secrets are set
REQUIRED_SECRETS=(
    "DATABASE_URL"
    "NEXTAUTH_SECRET"
    "REDIS_URL"
)

for secret in "${REQUIRED_SECRETS[@]}"; do
    if ! flyctl secrets list --app "$APP_NAME" | grep -q "$secret"; then
        echo "⚠️  Warning: $secret is not set. Please set it with:"
        echo "   flyctl secrets set $secret=<value> --app $APP_NAME"
    fi
done

# Deploy the application
echo "🚀 Deploying to Fly.io..."
flyctl deploy --app "$APP_NAME" --region "$REGION"

# Scale the application
echo "📊 Scaling application..."
flyctl scale count 2 --app "$APP_NAME"

# Show deployment status
echo "✅ Deployment complete!"
flyctl status --app "$APP_NAME"

echo ""
echo "🌐 Your app is available at: https://$APP_NAME.fly.dev"
echo ""
echo "📝 Next steps:"
echo "1. Set up custom domain: flyctl certs add <your-domain> --app $APP_NAME"
echo "2. View logs: flyctl logs --app $APP_NAME"
echo "3. SSH into app: flyctl ssh console --app $APP_NAME"