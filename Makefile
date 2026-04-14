# ============================================================
# KisanSahayak — Makefile
# Usage: make <target>
# Run `make help` to see all available commands
# ============================================================

DOCKERHUB_USER  ?= yourusername
IMAGE_NAME      := kisansahayak
IMAGE_TAG       ?= latest
FULL_IMAGE      := $(DOCKERHUB_USER)/$(IMAGE_NAME):$(IMAGE_TAG)
NAMESPACE       := kisansahayak

.PHONY: help build up down logs shell push pull migrate \
        jenkins-up jenkins-down \
        k8s-deploy k8s-status k8s-logs k8s-scale \
        scan clean

# ── Help ──────────────────────────────────────────────────
help:
	@printf "\n  KisanSahayak — Available Make Targets\n"
	@printf "  ──────────────────────────────────────────────\n"
	@printf "  %-22s %s\n" "build"          "Build Docker image locally"
	@printf "  %-22s %s\n" "up"             "Start app + DB via docker compose"
	@printf "  %-22s %s\n" "down"           "Stop all services"
	@printf "  %-22s %s\n" "logs"           "Stream app logs"
	@printf "  %-22s %s\n" "shell"          "Open shell inside app container"
	@printf "  %-22s %s\n" "migrate"        "Run Drizzle DB migration"
	@printf "  %-22s %s\n" "push"           "Build and push image to DockerHub"
	@printf "  %-22s %s\n" "pull"           "Pull latest image from DockerHub"
	@printf "  %-22s %s\n" "scan"           "Scan image for vulnerabilities (Trivy)"
	@printf "  %-22s %s\n" "jenkins-up"     "Start Jenkins CI server"
	@printf "  %-22s %s\n" "jenkins-down"   "Stop Jenkins CI server"
	@printf "  %-22s %s\n" "k8s-deploy"     "Deploy all manifests to Kubernetes"
	@printf "  %-22s %s\n" "k8s-status"     "Show pod / service / HPA status"
	@printf "  %-22s %s\n" "k8s-logs"       "Stream logs from K8s deployment"
	@printf "  %-22s %s\n" "k8s-scale N=3"  "Scale app to N replicas"
	@printf "  %-22s %s\n" "clean"          "Remove all containers and volumes"
	@printf "\n"

# ── Local Docker ──────────────────────────────────────────
build:
	docker build -t $(FULL_IMAGE) .

up:
	docker compose up --build -d
	@echo "App is running at http://localhost"

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
	docker login
	docker push $(FULL_IMAGE)
	@echo "Pushed $(FULL_IMAGE)"

pull:
	docker pull $(FULL_IMAGE)

# ── Security Scan (Trivy) ─────────────────────────────────
scan: build
	trivy image --severity HIGH,CRITICAL $(FULL_IMAGE)

# ── Jenkins ───────────────────────────────────────────────
jenkins-up:
	docker compose -f jenkins/docker-compose.jenkins.yml up -d
	@echo "Jenkins running at http://localhost:8080"

jenkins-down:
	docker compose -f jenkins/docker-compose.jenkins.yml down

# ── Kubernetes ────────────────────────────────────────────
k8s-deploy:
	kubectl apply -f k8s/namespace-and-secret.yaml
	kubectl apply -f k8s/postgres.yaml
	kubectl apply -f k8s/app.yaml
	@echo "Deployed to namespace: $(NAMESPACE)"

k8s-status:
	kubectl get pods,svc,hpa -n $(NAMESPACE)

k8s-logs:
	kubectl logs -f deployment/kisansahayak -n $(NAMESPACE)

k8s-scale:
	kubectl scale deployment kisansahayak --replicas=$(N) -n $(NAMESPACE)
	@echo "Scaled to $(N) replicas"

# ── Cleanup ───────────────────────────────────────────────
clean:
	docker compose down -v --remove-orphans
	@echo "All containers and volumes removed"
