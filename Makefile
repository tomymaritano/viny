# Nototo - Development and Deployment Commands

.PHONY: help dev build start stop clean logs test test-coverage test-watch

# Default target
help: ## Show this help message
	@echo "Nototo - Available Commands:"
	@echo ""
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# Fast Development commands (RECOMMENDED)
dev-fast: ## Start hybrid web development (backend Docker + frontend npm) - FASTEST
	@echo "🚀 Starting hybrid web development mode..."
	@echo "  Backend: Docker container with hot reload"
	@echo "  Frontend: Local npm with instant changes"
	@echo "  Target: Browser at http://localhost:5173"
	@echo ""
	npm run dev:fast

dev-hybrid: ## Alias for dev-fast
	make dev-fast

# Electron Development commands
dev-electron: ## Start traditional Electron development (frontend + electron)
	@echo "🖥️  Starting traditional Electron development..."
	@echo "  Frontend: Local npm server"
	@echo "  Target: Electron desktop app"
	@echo ""
	npm run dev:electron

dev-electron-fast: ## Start hybrid Electron development (backend Docker + frontend + electron) - FASTEST
	@echo "🚀 Starting hybrid Electron development mode..."
	@echo "  Backend: Docker container with hot reload"
	@echo "  Frontend: Local npm with instant changes"
	@echo "  Target: Electron desktop app"
	@echo ""
	npm run dev:electron:fast

dev-electron-local: ## Start local Electron development (frontend + electron, no backend)
	@echo "⚡ Starting local Electron development..."
	@echo "  Frontend: Local npm (localStorage mode)"
	@echo "  Target: Electron desktop app"
	@echo ""
	npm run dev:electron:local

# Traditional Docker Development
dev: ## Start full Docker development environment
	docker-compose -f docker-compose.dev.yml up --build

dev-optimized: ## Start optimized Docker development environment
	@echo "🚀 Starting optimized Docker development..."
	@echo "  ⚡ Better caching and faster builds"
	@echo "  🔄 Enhanced hot reload performance"
	@echo ""
	docker-compose -f docker-compose.dev-optimized.yml up --build

dev-detached: ## Start development environment in background
	docker-compose -f docker-compose.dev.yml up --build -d

dev-logs: ## Show development logs
	docker-compose -f docker-compose.dev.yml logs -f

dev-stop: ## Stop development environment
	docker-compose -f docker-compose.dev.yml down

# Backend-only commands for hybrid development
backend-only: ## Start only backend in Docker (for hybrid mode)
	docker-compose -f docker-compose.hybrid.yml up --build

backend-stop: ## Stop backend container
	docker-compose -f docker-compose.hybrid.yml down

backend-logs: ## Show backend logs only
	docker-compose -f docker-compose.hybrid.yml logs -f

# Local development (no Docker)
dev-local: ## Start completely local development (fastest startup)
	@echo "🏃‍♂️ Starting local development mode..."
	@echo "  ⚠️  Note: Uses localStorage only (no backend API)"
	npm run dev:local

dev-local-full: ## Start full local development (frontend + backend locally)
	@echo "🏃‍♂️ Starting full local development..."
	@echo "  🖥️  Both frontend and backend running locally"
	@echo "  ⚡ Fastest possible development setup"
	npm run dev:local-full

setup-local: ## Setup local development environment
	@echo "🏗️  Setting up local development environment..."
	npm run setup:local

# Production commands
build: ## Build production images
	docker-compose build

start: ## Start production environment
	docker-compose up -d

stop: ## Stop production environment
	docker-compose down

restart: ## Restart production environment
	docker-compose restart

# Utility commands
logs: ## Show production logs
	docker-compose logs -f

logs-backend: ## Show backend logs only
	docker-compose logs -f backend

logs-frontend: ## Show frontend logs only
	docker-compose logs -f frontend

shell-backend: ## Open shell in backend container
	docker-compose exec backend sh

shell-frontend: ## Open shell in frontend container
	docker-compose exec frontend sh

# Database commands
db-push: ## Push database schema (development)
	docker-compose -f docker-compose.dev.yml exec backend npm run db:push

db-studio: ## Open Prisma Studio (development)
	docker-compose -f docker-compose.dev.yml exec backend npm run db:studio

db-backup: ## Backup database
	docker-compose exec backend cp /app/prisma/nototo.db /app/data/backup-$(shell date +%Y%m%d-%H%M%S).db

# Maintenance commands
clean: ## Remove all containers, images, and volumes
	docker-compose down -v --rmi all
	docker-compose -f docker-compose.dev.yml down -v --rmi all
	docker system prune -f

clean-volumes: ## Remove only volumes (keeps images)
	docker-compose down -v
	docker-compose -f docker-compose.dev.yml down -v

update: ## Pull latest images and restart
	docker-compose pull
	docker-compose up -d

# Testing commands
test: ## Run all tests
	@echo "🧪 Running tests..."
	npm run test:run

test-coverage: ## Run tests with coverage report
	@echo "🧪 Running tests with coverage..."
	npm run test:coverage

test-watch: ## Run tests in watch mode
	@echo "🧪 Running tests in watch mode..."
	npm run test:watch

test-ui: ## Open Vitest UI
	@echo "🧪 Opening Vitest UI..."
	npm run test:ui

test-threshold: ## Run tests and check coverage thresholds
	@echo "🧪 Running tests with coverage thresholds..."
	npm run test:coverage:threshold

# Health checks
health: ## Check health of all services
	@echo "Checking service health..."
	@docker-compose ps
	@echo ""
	@echo "Backend health:"
	@curl -f http://localhost:3001/health 2>/dev/null && echo " ✓ Backend OK" || echo " ✗ Backend Failed"
	@echo "Frontend health:"
	@curl -f http://localhost/ 2>/dev/null && echo " ✓ Frontend OK" || echo " ✗ Frontend Failed"

# Installation and setup
install: ## Install and setup everything
	@echo "Setting up Nototo..."
	@echo "1. Building development environment..."
	@make dev-detached
	@echo "2. Waiting for services to start..."
	@sleep 10
	@echo "3. Checking health..."
	@make health
	@echo ""
	@echo "🎉 Nototo is ready!"
	@echo "   Frontend: http://localhost:5173"
	@echo "   Backend:  http://localhost:3001"
	@echo "   API:      http://localhost:3001/api"
	@echo ""
	@echo "Run 'make dev-logs' to see logs"
	@echo "Run 'make help' to see all commands"