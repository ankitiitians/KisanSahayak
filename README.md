# KisanSahayak

A full-stack web application that helps Indian farmers with crop guidance, weather information, and agricultural advisory services.

**Stack:** Node.js 20 · React 18 · PostgreSQL 16 · TypeScript · Express · Drizzle ORM · Docker · Kubernetes · Jenkins

---

## Table of Contents

- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Local Development with Docker](#local-development-with-docker)
- [DockerHub](#dockerhub)
- [Jenkins CI/CD](#jenkins-cicd)
- [Kubernetes Deployment](#kubernetes-deployment)
- [Database Migrations](#database-migrations)
- [Environment Variables](#environment-variables)
- [Make Commands](#make-commands)
- [Troubleshooting](#troubleshooting)

---

## Project Structure

```
KisanSahayak/
├── client/                         # React 18 frontend (Vite, Tailwind CSS, shadcn/ui)
├── server/                         # Express backend (TypeScript, Passport.js auth)
├── shared/                         # Drizzle ORM schema + shared TypeScript types
│
├── nginx/
│   └── nginx.conf                  # Reverse proxy config (rate limiting, headers)
│
├── jenkins/
│   ├── docker-compose.jenkins.yml  # Run Jenkins + agent via Docker
│   └── jenkins-casc.yaml           # Jenkins Configuration as Code (auto-setup)
│
├── k8s/
│   ├── namespace-and-secret.yaml   # Namespace + Secrets template
│   ├── postgres.yaml               # PostgreSQL Deployment, Service, PVC
│   └── app.yaml                    # App Deployment, Service, HPA
│
├── Dockerfile                      # Multi-stage production build
├── docker-compose.yml              # App + DB + Nginx + auto-migration
├── Jenkinsfile                     # Declarative pipeline (build → scan → push → deploy)
├── Makefile                        # Shortcut commands
├── .dockerignore
└── .env.example
```

---

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| Docker | 24+ | https://docs.docker.com/get-docker |
| Docker Compose | v2+ | Included with Docker Desktop |
| Node.js | 20+ | https://nodejs.org (only for local dev without Docker) |
| kubectl | any | https://kubernetes.io/docs/tasks/tools |
| Trivy | any | https://aquasecurity.github.io/trivy (for `make scan`) |
| make | any | Pre-installed on Linux/macOS; Windows: use Git Bash |

---

## Local Development with Docker

### 1. Clone and configure

```bash
git clone https://github.com/ankitiitians/KisanSahayak.git
cd KisanSahayak
cp .env.example .env
```

Open `.env` and set your own values for `POSTGRES_PASSWORD` and `SESSION_SECRET`.

```bash
# Generate a strong SESSION_SECRET:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2. Start all services

```bash
make up
# or: docker compose up --build -d
```

This will:
- Start PostgreSQL 16
- Run `drizzle-kit push` to apply the schema (one-shot container)
- Start the Node.js application
- Start Nginx on port 80

App is available at **http://localhost**

### 3. Useful commands

```bash
make logs       # Stream application logs
make shell      # Open a shell inside the app container
make migrate    # Re-run DB schema migration
make down       # Stop all services
make clean      # Stop all services and delete volumes (data loss)
```

---

## DockerHub

### Build and push

```bash
# Set your username in Makefile: DOCKERHUB_USER ?= yourusername
make push
```

This builds the image, prompts for DockerHub login, and pushes both a versioned tag and `latest`.

Manual equivalent:

```bash
docker build -t yourusername/kisansahayak:latest .
docker login
docker push yourusername/kisansahayak:latest
```

### Pull and run on any machine

```bash
# Set DOCKER_IMAGE in your .env file then:
docker compose up -d
```

### Vulnerability scan before pushing

```bash
make scan
# Trivy scans the image for HIGH and CRITICAL CVEs
```

---

## Jenkins CI/CD

The `Jenkinsfile` at the project root defines a declarative pipeline with these stages:

| Stage | What it does |
|---|---|
| **Checkout** | Pulls latest code from SCM |
| **Install** | Runs `npm ci` |
| **Lint & Type Check** | Runs `tsc` via `npm run check` |
| **Security Scan** | Trivy scans the image — fails on CRITICAL CVEs |
| **Build Docker Image** | Builds versioned + latest Docker image |
| **Push to DockerHub** | Pushes both tags (only on `main`/`master` branch) |
| **Deploy** | Rolls out to Kubernetes or Docker Compose (configurable) |

### Running Jenkins locally

```bash
make jenkins-up
# Jenkins UI available at http://localhost:8080
```

First login password:
```bash
docker exec kisansahayak_jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

### Required Jenkins credentials

Go to **Manage Jenkins → Credentials → (global)** and add:

| ID | Type | Value |
|---|---|---|
| `dockerhub-credentials` | Username / Password | DockerHub username + access token |
| `kubeconfig` | Secret File | Your `~/.kube/config` file |

### Connect your repository

1. Create a new **Pipeline** job in Jenkins
2. Under *Pipeline*, choose **Pipeline script from SCM**
3. Set SCM to Git and enter your repository URL
4. Script Path: `Jenkinsfile`

Jenkins will poll for changes every 2 minutes by default. To use webhooks instead, set up a GitHub/GitLab webhook pointing to `http://<jenkins-host>:8080/github-webhook/`.

### Choosing deploy target

The pipeline accepts a `DEPLOY_TARGET` parameter (`compose` or `kubernetes`). Enable *"This project is parameterised"* in the job configuration or add the `parameters` block at the bottom of `Jenkinsfile`.

---

## Kubernetes Deployment

### Step 1 — Create secrets

Replace placeholder values and apply, or create secrets directly via kubectl:

```bash
kubectl create namespace kisansahayak

kubectl create secret generic kisansahayak-secret \
  --namespace=kisansahayak \
  --from-literal=POSTGRES_USER=kisan \
  --from-literal=POSTGRES_PASSWORD=yourStrongPassword \
  --from-literal=POSTGRES_DB=kisansahayak \
  --from-literal=SESSION_SECRET=yourSessionSecret \
  --from-literal=DATABASE_URL="postgresql://kisan:yourStrongPassword@postgres-service:5432/kisansahayak"
```

### Step 2 — Update image name

In `k8s/app.yaml`, replace `yourusername` with your actual DockerHub username:

```yaml
image: yourusername/kisansahayak:latest
```

### Step 3 — Apply manifests

```bash
make k8s-deploy
```

Manual equivalent:
```bash
kubectl apply -f k8s/namespace-and-secret.yaml
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/app.yaml
```

### Step 4 — Verify

```bash
make k8s-status
# kubectl get pods,svc,hpa -n kisansahayak

make k8s-logs
# kubectl logs -f deployment/kisansahayak -n kisansahayak
```

### Scale manually

```bash
make k8s-scale N=4
```

### What the K8s setup includes

| Feature | Details |
|---|---|
| Zero-downtime deploys | `RollingUpdate` with `maxUnavailable: 0` |
| Auto-scaling | HPA scales 2–10 replicas when CPU exceeds 70% |
| Health checks | Liveness and readiness probes on `/` |
| Resource limits | 128Mi–512Mi RAM, 100m–500m CPU per pod |
| Persistent storage | 5Gi PVC for PostgreSQL data |
| Secret injection | All credentials via Kubernetes Secrets |

---

## Database Migrations

Drizzle ORM is used for schema management.

```bash
# Automatically runs on every `docker compose up`
# To run manually inside the running container:
make migrate

# In Kubernetes (one-off job):
kubectl run db-migrate \
  --image=yourusername/kisansahayak:latest \
  --restart=Never \
  --namespace=kisansahayak \
  --env="DATABASE_URL=postgresql://kisan:password@postgres-service:5432/kisansahayak" \
  -- npx drizzle-kit push
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | Full PostgreSQL connection string |
| `SESSION_SECRET` | Yes | Express session secret — must be 64+ random characters |
| `NODE_ENV` | Yes | `production` or `development` |
| `PORT` | No | Defaults to `5000` |
| `POSTGRES_USER` | Yes | Database username |
| `POSTGRES_PASSWORD` | Yes | Database password |
| `POSTGRES_DB` | Yes | Database name |
| `DOCKER_IMAGE` | No | Full DockerHub image path (used in compose pull mode) |
| `JENKINS_ADMIN_PASSWORD` | Jenkins only | Admin password for Jenkins JCasC setup |
| `DOCKERHUB_USERNAME` | Jenkins only | DockerHub username for Jenkins credential injection |
| `DOCKERHUB_TOKEN` | Jenkins only | DockerHub access token (not your login password) |

---

## Make Commands

```bash
make help           # List all targets
make build          # Build Docker image locally
make up             # Start all services (app + DB + nginx)
make down           # Stop all services
make logs           # Stream app logs
make shell          # Shell into the app container
make migrate        # Run Drizzle schema migration
make push           # Build and push to DockerHub
make pull           # Pull latest image from DockerHub
make scan           # Trivy vulnerability scan
make jenkins-up     # Start Jenkins on port 8080
make jenkins-down   # Stop Jenkins
make k8s-deploy     # Apply all K8s manifests
make k8s-status     # Show pods, services, HPA
make k8s-logs       # Stream K8s deployment logs
make k8s-scale N=3  # Scale to N replicas
make clean          # Remove all containers and volumes
```

---

## Troubleshooting

**App container keeps restarting**
```bash
docker compose logs app
# Check for missing environment variables or DB connection errors
```

**Database connection refused**
```bash
docker compose exec db pg_isready -U kisan
# If not ready, check DB logs:
docker compose logs db
```

**Port 80 already in use**
```bash
# Edit docker-compose.yml — change nginx port mapping:
ports:
  - "8081:80"
```

**Migration fails on startup**
```bash
# Run manually to see the full error:
docker compose run --rm db-migrate
```

**Kubernetes pod in CrashLoopBackOff**
```bash
kubectl describe pod <pod-name> -n kisansahayak
kubectl logs <pod-name> -n kisansahayak --previous
```

**Jenkins cannot push to DockerHub**
```bash
# Verify credentials in Jenkins → Manage Jenkins → Credentials
# Ensure the credential ID matches: dockerhub-credentials
# Use a DockerHub Access Token, not your account password
```

**Trivy not found during `make scan`**
```bash
# Install Trivy: https://aquasecurity.github.io/trivy/latest/getting-started/installation/
# macOS:  brew install trivy
# Linux:  See official install script on Trivy docs
```
