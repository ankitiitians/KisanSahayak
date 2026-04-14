# ============================================================
# KisanSahayak — Makefile
# Shortcut commands for common Docker & K8s tasks
# Usage: make <command>
# ============================================================

# Apna DockerHub username yahan daalo
DOCKERHUB_USER ?= yourusername
IMAGE_NAME     := kisansahayak
IMAGE_TAG      ?= latest
FULL_IMAGE     := $(DOCKERHUB_USER)/$(IMAGE_NAME):$(IMAGE_TAG)
NAMESPACE      := kisansahayak

.PHONY: help build up down logs shell push pull migrate k8s-deploy k8s-status k8s-scale clean

# Default: help dikhao
help:
	@echo ""
	@echo "  🌾 KisanSahayak — Available Commands"
	@echo "  ─────────────────────────────────────"
	@echo "  make build        → Docker image build karo (local)"
	@echo "  make up           → docker compose se app start karo"
	@echo "  make down         → app band karo"
	@echo "  make logs         → app logs dekhna"
	@echo "  make shell        → app container mein bash kholna"
	@echo "  make migrate      → Drizzle DB migration chalana"
	@echo "  make push         → DockerHub pe push karo"
	@echo "  make pull         → DockerHub se latest pull karo"
	@echo "  make k8s-deploy   → Kubernetes pe deploy karo"
	@echo "  make k8s-status   → K8s pods/services status dekhna"
	@echo "  make k8s-scale    → Replicas scale karna (N=3 make k8s-scale)"
	@echo "  make clean        → Sab containers + volumes delete karo"
	@echo ""

# ── Local Docker ──────────────────────────────────────────

build:
	docker build -t $(FULL_IMAGE) .

up:
	docker compose up --build -d
	@echo "✅ App running at http://localhost:5000"

down:
	docker compose down

logs:
	docker compose logs -f app

shell:
	docker compose exec app sh

migrate:
	docker compose exec app npx drizzle-kit push

# ── DockerHub ─────────────────────────────────────────────

push: build
	docker push $(FULL_IMAGE)
	@echo "✅ Pushed: $(FULL_IMAGE)"

pull:
	docker pull $(FULL_IMAGE)

# ── Kubernetes ────────────────────────────────────────────

k8s-deploy:
	kubectl apply -f k8s/namespace-and-secret.yaml
	kubectl apply -f k8s/postgres.yaml
	kubectl apply -f k8s/app.yaml
	@echo "✅ Deployed to Kubernetes namespace: $(NAMESPACE)"

k8s-status:
	kubectl get pods,svc,hpa -n $(NAMESPACE)

k8s-logs:
	kubectl logs -f deployment/kisansahayak -n $(NAMESPACE)

k8s-scale:
	kubectl scale deployment kisansahayak --replicas=$(N) -n $(NAMESPACE)
	@echo "✅ Scaled to $(N) replicas"

# ── Cleanup ───────────────────────────────────────────────

clean:
	docker compose down -v --remove-orphans
	@echo "🧹 Sab containers aur volumes delete ho gaye"
