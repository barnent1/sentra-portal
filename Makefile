.PHONY: help dev prod down clean logs shell db-migrate db-seed test build

# Default target
help:
	@echo "Available commands:"
	@echo "  make dev          - Start development environment"
	@echo "  make dev-tools    - Start dev environment with tools (prisma studio, adminer, mailhog)"
	@echo "  make prod         - Start production environment"
	@echo "  make down         - Stop all containers"
	@echo "  make clean        - Stop containers and remove volumes"
	@echo "  make logs         - Show container logs"
	@echo "  make shell        - Open shell in app container"
	@echo "  make db-migrate   - Run database migrations"
	@echo "  make db-seed      - Seed the database"
	@echo "  make test         - Run tests"
	@echo "  make build        - Build production Docker image"

# Development commands
dev:
	docker-compose up -d
	@echo "Development environment started!"
	@echo "App: http://localhost:3000"

dev-tools:
	docker-compose --profile tools up -d
	@echo "Development environment with tools started!"
	@echo "App: http://localhost:3000"
	@echo "Prisma Studio: http://localhost:5555"
	@echo "Adminer: http://localhost:8080"
	@echo "Mailhog: http://localhost:8025"

# Production commands
prod:
	docker-compose -f docker-compose.prod.yml up -d
	@echo "Production environment started!"

# Stop containers
down:
	docker-compose down
	docker-compose -f docker-compose.prod.yml down

# Clean everything
clean:
	docker-compose down -v
	docker-compose -f docker-compose.prod.yml down -v
	@echo "All containers and volumes removed!"

# View logs
logs:
	docker-compose logs -f app

logs-all:
	docker-compose logs -f

# Shell access
shell:
	docker-compose exec app sh

shell-db:
	docker-compose exec postgres psql -U sentra sentra_db

# Database operations
db-migrate:
	docker-compose exec app npx prisma migrate deploy

db-migrate-dev:
	docker-compose exec app npx prisma migrate dev

db-seed:
	docker-compose exec app npx prisma db seed

db-studio:
	docker-compose exec app npx prisma studio

# Testing
test:
	docker-compose exec app npm test

test-watch:
	docker-compose exec app npm run test:watch

# Build production image
build:
	docker build -t sentra-portal:latest --target production .

# Docker system cleanup
docker-clean:
	docker system prune -af --volumes