.PHONY: help build up down restart logs clean dev prod

# Colors for terminal output
GREEN  := \033[0;32m
YELLOW := \033[0;33m
NC     := \033[0m # No Color

help: ## Show this help message
	@echo '$(GREEN)Available commands:$(NC)'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-15s$(NC) %s\n", $$1, $$2}'

build: ## Build Docker images
	@echo "$(GREEN)Building Docker images...$(NC)"
	docker-compose build

up: ## Start all services
	@echo "$(GREEN)Starting all services...$(NC)"
	docker-compose up -d
	@echo "$(GREEN)Services started!$(NC)"
	@echo "App: http://localhost:3000"
	@echo "Studio: http://localhost:54323"
	@echo "API: http://localhost:54321"

down: ## Stop all services
	@echo "$(YELLOW)Stopping all services...$(NC)"
	docker-compose down

restart: down up ## Restart all services

logs: ## Show logs from all services
	docker-compose logs -f

logs-app: ## Show logs from Next.js app only
	docker-compose logs -f app

clean: ## Stop and remove all containers, volumes, and images
	@echo "$(YELLOW)⚠️  Warning: This will delete all data!$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose down -v --remove-orphans; \
		docker-compose rm -f; \
		echo "$(GREEN)Cleaned up!$(NC)"; \
	fi

dev: ## Start in development mode (with hot reload)
	@echo "$(GREEN)Starting in development mode...$(NC)"
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

prod: build up ## Build and start in production mode

status: ## Show status of all services
	docker-compose ps

shell-app: ## Open shell in app container
	docker-compose exec app sh

install: ## Install dependencies in container
	docker-compose exec app npm install

test: ## Run tests in container
	docker-compose exec app npm test

reset: clean up ## Clean everything and start fresh
