#!/bin/bash

# Railway Deployment Script for Sentra Portal
# This script helps deploy the application to Railway

set -e

echo "🚂 Starting Railway deployment..."

# Check if railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Error: Railway CLI is not installed"
    echo "Please install it from: https://docs.railway.app/develop/cli"
    exit 1
fi

# Check if logged in to Railway
if ! railway whoami &> /dev/null; then
    echo "❌ Error: Not logged in to Railway"
    echo "Please run: railway login"
    exit 1
fi

# Configuration
PROJECT_NAME="${RAILWAY_PROJECT_NAME:-sentra-portal}"

# Initialize or link project
echo "🔗 Linking to Railway project..."
if [ ! -f ".railway/config.json" ]; then
    echo "No Railway project linked. Creating new project..."
    railway init -n "$PROJECT_NAME"
else
    echo "✅ Railway project already linked"
fi

# Set environment variables
echo "🔐 Setting environment variables..."
railway vars set NODE_ENV=production
railway vars set PORT=3000

# Check if required variables are set
REQUIRED_VARS=(
    "DATABASE_URL"
    "NEXTAUTH_SECRET"
    "NEXTAUTH_URL"
    "REDIS_URL"
)

echo "📋 Checking required environment variables..."
for var in "${REQUIRED_VARS[@]}"; do
    if ! railway vars get "$var" &> /dev/null; then
        echo "⚠️  Warning: $var is not set. Please set it with:"
        echo "   railway vars set $var=<value>"
    else
        echo "✅ $var is set"
    fi
done

# Deploy the application
echo "🚀 Deploying to Railway..."
railway up --detach

# Wait for deployment to complete
echo "⏳ Waiting for deployment to complete..."
sleep 10

# Get deployment URL
DEPLOYMENT_URL=$(railway status --json | jq -r '.url // empty')

if [ -n "$DEPLOYMENT_URL" ]; then
    echo "✅ Deployment complete!"
    echo "🌐 Your app is available at: https://$DEPLOYMENT_URL"
else
    echo "✅ Deployment initiated!"
    echo "Check deployment status with: railway logs"
fi

echo ""
echo "📝 Useful Railway commands:"
echo "- View logs: railway logs"
echo "- Open dashboard: railway open"
echo "- View status: railway status"
echo "- Set domain: railway domain"