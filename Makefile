.PHONY: dev build test lint deploy down logs

APP_DIR := apps
WEB_DIR := $(APP_DIR)/web
API_DIR := $(APP_DIR)/api
AI_ENGINE_DIR := $(APP_DIR)/ai-engine

# --- Development ---
dev:
	docker compose up -d
	docker compose -f docker-compose.yml -f docker-compose.override.yml up

# --- Build ---
build:
	docker compose build --parallel

# --- Test ---
test:
	@echo "Running tests in containers..."
	docker compose run --rm api pnpm test
	docker compose run --rm ai-engine pnpm test
	docker compose run --rm web pnpm test

lint:
	@echo "Running linter..."
	pnpm lint

# --- Deploy ---
deploy: build
	docker compose up -d --no-deps web api ai-engine nginx
	@echo "Deployment complete. Services are starting..."
	@echo "Web:      http://localhost"
	@echo "API:      http://localhost/api"
	@echo "AI Engine: http://localhost/ai"

# --- Utility ---
down:
	docker compose down

logs:
	docker compose logs -f

clean:
	docker compose down --volumes --remove-orphans
	docker image prune -f