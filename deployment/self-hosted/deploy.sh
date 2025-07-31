#!/bin/bash

# Self-Hosted Deployment Script for Sentra Portal
# This script deploys the application to a self-hosted server

set -e

# Configuration
REMOTE_USER="${DEPLOY_USER:-deploy}"
REMOTE_HOST="${DEPLOY_HOST}"
REMOTE_PATH="${DEPLOY_PATH:-/opt/sentra-portal}"
APP_NAME="${APP_NAME:-sentra-portal}"
DOCKER_REGISTRY="${DOCKER_REGISTRY:-}"
IMAGE_TAG="${IMAGE_TAG:-latest}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
error() {
    echo -e "${RED}❌ Error: $1${NC}" >&2
    exit 1
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

info() {
    echo -e "ℹ️  $1"
}

# Check required environment variables
if [ -z "$REMOTE_HOST" ]; then
    error "DEPLOY_HOST environment variable is not set"
fi

echo "🚀 Starting self-hosted deployment..."
echo "📍 Target: $REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH"

# Build Docker image
info "Building Docker image..."
docker build -t "$APP_NAME:$IMAGE_TAG" --target production .
success "Docker image built"

# Tag and push to registry if specified
if [ -n "$DOCKER_REGISTRY" ]; then
    info "Pushing to Docker registry: $DOCKER_REGISTRY"
    docker tag "$APP_NAME:$IMAGE_TAG" "$DOCKER_REGISTRY/$APP_NAME:$IMAGE_TAG"
    docker push "$DOCKER_REGISTRY/$APP_NAME:$IMAGE_TAG"
    success "Image pushed to registry"
    IMAGE_NAME="$DOCKER_REGISTRY/$APP_NAME:$IMAGE_TAG"
else
    # Save image to tar file for transfer
    info "Saving Docker image to tar file..."
    docker save -o "/tmp/$APP_NAME-$IMAGE_TAG.tar" "$APP_NAME:$IMAGE_TAG"
    success "Image saved"
    IMAGE_NAME="$APP_NAME:$IMAGE_TAG"
fi

# Create deployment directory on remote server
info "Preparing remote server..."
ssh "$REMOTE_USER@$REMOTE_HOST" "mkdir -p $REMOTE_PATH"

# Copy necessary files to remote server
info "Copying deployment files..."
scp docker-compose.prod.yml "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/docker-compose.yml"
scp .env.example "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/.env.example"

# Copy nginx configuration if it exists
if [ -d "nginx" ]; then
    scp -r nginx "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/"
fi

# Transfer Docker image if not using registry
if [ -z "$DOCKER_REGISTRY" ]; then
    info "Transferring Docker image to remote server..."
    scp "/tmp/$APP_NAME-$IMAGE_TAG.tar" "$REMOTE_USER@$REMOTE_HOST:/tmp/"
    ssh "$REMOTE_USER@$REMOTE_HOST" "docker load -i /tmp/$APP_NAME-$IMAGE_TAG.tar && rm /tmp/$APP_NAME-$IMAGE_TAG.tar"
    rm "/tmp/$APP_NAME-$IMAGE_TAG.tar"
    success "Image transferred"
fi

# Deploy on remote server
info "Deploying application..."
ssh "$REMOTE_USER@$REMOTE_HOST" << EOF
    cd $REMOTE_PATH
    
    # Check if .env file exists
    if [ ! -f .env ]; then
        cp .env.example .env
        echo "⚠️  Warning: .env file created from .env.example"
        echo "Please update it with production values"
    fi
    
    # Update image in docker-compose.yml
    export APP_IMAGE="$IMAGE_NAME"
    
    # Pull latest images (if using registry)
    if [ -n "$DOCKER_REGISTRY" ]; then
        docker-compose pull
    fi
    
    # Stop existing containers
    docker-compose down
    
    # Start new containers
    docker-compose up -d
    
    # Run migrations
    docker-compose exec -T app npx prisma migrate deploy
    
    # Check deployment status
    docker-compose ps
EOF

success "Deployment complete!"

# Show application logs
info "Recent application logs:"
ssh "$REMOTE_USER@$REMOTE_HOST" "cd $REMOTE_PATH && docker-compose logs --tail=50 app"

echo ""
echo "📝 Post-deployment checklist:"
echo "1. Update .env file with production values: ssh $REMOTE_USER@$REMOTE_HOST"
echo "2. Set up SSL certificates if using nginx"
echo "3. Configure firewall rules"
echo "4. Set up monitoring and backups"
echo "5. View logs: ssh $REMOTE_USER@$REMOTE_HOST 'cd $REMOTE_PATH && docker-compose logs -f'"