# 🌾 KisanSahayak — Docker & Deployment Guide

> AI-powered agricultural assistant for Indian farmers  
> Stack: **Node.js 20 · React 18 · PostgreSQL 16 · TypeScript · Drizzle ORM**

---

## 📁 Repository Structure

```
KisanSahayak/
├── client/                        # React frontend (Vite + Tailwind + shadcn/ui)
├── server/                        # Express backend (TypeScript, Passport auth)
├── shared/                        # Drizzle schema + shared types
├── k8s/
│   ├── namespace-and-secret.yaml  # K8s namespace + secrets template
│   ├── postgres.yaml              # PostgreSQL Deployment + Service + PVC
│   └── app.yaml                   # App Deployment + Service + HPA
├── .github/
│   └── workflows/
│       └── docker-publish.yml     # CI/CD: auto build+push on git push
├── Dockerfile                     # Multi-stage production build
├── docker-compose.yml             # Local run: app + db + auto-migration
├── .dockerignore
├── .env.example
└── Makefile                       # Shortcut commands
```

---

## ⚡ Quick Start — Sirf 3 Commands

```bash
git clone https://github.com/ankitiitians/KisanSahayak.git
cd KisanSahayak
cp .env.example .env        # .env mein apna password daalo
make up                     # ya: docker compose up --build -d
```

App `http://localhost:5000` pe open hogi. DB migration automatically hogi.

---

## 🐳 Local Docker (Detailed)

### Prerequisites
- Docker Desktop installed (Windows/Mac) ya Docker Engine (Linux)
- `docker compose` version 2+ (`docker compose version`)

### Step-by-step

```bash
# 1. Repo clone karo
git clone https://github.com/ankitiitians/KisanSahayak.git
cd KisanSahayak

# 2. Environment setup
cp .env.example .env
# .env file mein ye values change karo:
#   POSTGRES_PASSWORD=apnaStrongPassword
#   SESSION_SECRET=ek64CharRandomString

# 3. Build + start (background mein chalega)
docker compose up --build -d

# 4. Status check
docker compose ps

# 5. Logs dekhna
docker compose logs -f app

# 6. App test karo
curl http://localhost:5000
```

### Common Commands

```bash
make up          # Start karo
make down        # Band karo
make logs        # Logs dekhna
make shell       # Container ke andar bash kholna
make migrate     # DB schema push karna
docker compose down -v   # Sab kuch + data delete karna
```

---

## 🐳 DockerHub pe Upload

### Pehli baar setup

1. [hub.docker.com](https://hub.docker.com) pe account banao
2. `.env` mein apna username daalo: `DOCKER_IMAGE=yourusername/kisansahayak:latest`
3. Makefile mein bhi: `DOCKERHUB_USER ?= yourusername`

### Build + Push karo

```bash
# Login
docker login

# Build + push ek command mein (Makefile)
make push

# Ya manually:
docker build -t yourusername/kisansahayak:latest .
docker push yourusername/kisansahayak:latest

# Version tag bhi lagao
docker tag yourusername/kisansahayak:latest yourusername/kisansahayak:v1.0
docker push yourusername/kisansahayak:v1.0
```

DockerHub par image: `https://hub.docker.com/r/yourusername/kisansahayak`

### DockerHub se pull karke run karna (kisi bhi machine pe)

```bash
# .env mein DOCKER_IMAGE set karo aur run karo:
DOCKER_IMAGE=yourusername/kisansahayak:latest docker compose up -d
```

---

## 🔄 CI/CD — GitHub Actions (Auto Deploy)

Jab bhi `main` branch pe code push karoge, GitHub Actions automatically:
1. Docker image build karega
2. DockerHub pe push kar dega (latest + git SHA tag)

### Setup (ek baar karna hai)

1. GitHub repo → **Settings → Secrets and variables → Actions**
2. Do secrets add karo:
   - `DOCKERHUB_USERNAME` → tera DockerHub username
   - `DOCKERHUB_TOKEN` → DockerHub → Account Settings → Security → New Access Token

Ab se har `git push origin main` pe automatic build + push hoga.

---

## ☸️ Kubernetes Orchestration

### Prerequisites

```bash
kubectl version --client    # kubectl installed hona chahiye
# Local testing ke liye: minikube ya kind install karo
```

### Step 1 — Secrets set karo

`k8s/namespace-and-secret.yaml` file mein values ko base64 encode karke daalo:

```bash
# Values encode karo:
echo -n "yourStrongPassword" | base64
echo -n "yourSessionSecret64Chars" | base64
echo -n "postgresql://kisan:yourStrongPassword@postgres-service:5432/kisansahayak" | base64
```

Ya directly kubectl se secret banao (zyada safe tarika):

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

### Step 2 — k8s/app.yaml mein image update karo

```yaml
image: yourusername/kisansahayak:latest   # apna DockerHub username daalo
```

### Step 3 — Deploy karo

```bash
# Sab ek saath (Makefile se):
make k8s-deploy

# Ya manually:
kubectl apply -f k8s/namespace-and-secret.yaml
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/app.yaml
```

### Step 4 — Status check

```bash
make k8s-status
# Ya:
kubectl get pods,svc,hpa -n kisansahayak

# Logs
kubectl logs -f deployment/kisansahayak -n kisansahayak

# Scale karna (5 replicas)
make k8s-scale N=5
```

### Kubernetes Features jo include hain

| Feature | Detail |
|---|---|
| **Zero-downtime deploy** | RollingUpdate strategy (maxUnavailable: 0) |
| **Auto-scaling** | HPA — CPU 70% pe automatically 2–10 replicas |
| **Health checks** | Liveness + Readiness probes |
| **Resource limits** | Memory/CPU requests + limits set hain |
| **Persistent storage** | 5Gi PVC for PostgreSQL data |
| **Secrets** | Kubernetes Secrets se credentials inject |

---

## 🗄️ Database Migration (Drizzle ORM)

```bash
# Docker Compose ke saath (automatic hoti hai startup pe)
# Manually chalana ho toh:
make migrate

# Ya:
docker compose exec app npx drizzle-kit push

# Kubernetes mein (ek baar run karo):
kubectl run db-migrate \
  --image=yourusername/kisansahayak:latest \
  --restart=Never \
  --namespace=kisansahayak \
  --env="DATABASE_URL=postgresql://..." \
  -- npx drizzle-kit push
```

---

## 🌍 Environment Variables Reference

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | ✅ | — | Full PostgreSQL connection string |
| `SESSION_SECRET` | ✅ | — | Express session secret (64+ char random string) |
| `NODE_ENV` | ✅ | `production` | Environment mode |
| `PORT` | ❌ | `5000` | App ka port |
| `POSTGRES_USER` | ✅ | `kisan` | DB username |
| `POSTGRES_PASSWORD` | ✅ | — | DB password |
| `POSTGRES_DB` | ✅ | `kisansahayak` | DB name |
| `DOCKER_IMAGE` | ❌ | `kisansahayak:latest` | DockerHub image path |

> ⚠️ **SESSION_SECRET** kabhi bhi default value pe mat rehne do production mein!  
> Generate karo: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

---

## 🔧 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, shadcn/ui, Radix UI |
| Backend | Node.js 20, Express 4, TypeScript |
| Database | PostgreSQL 16, Drizzle ORM |
| Auth | Passport.js (local strategy), express-session |
| Container | Docker multi-stage (Alpine), docker compose |
| CI/CD | GitHub Actions |
| Orchestration | Kubernetes (Deployment + HPA + PVC + Secrets) |

---

## 🛠️ Troubleshooting

### App start nahi ho raha
```bash
docker compose logs app          # Error message dekho
docker compose logs db           # DB healthy hai ya nahi
docker compose ps                # Sab services ka status
```

### DB connection error aa raha hai
```bash
# DATABASE_URL sahi hai?
docker compose exec app printenv DATABASE_URL

# DB running hai?
docker compose exec db pg_isready -U kisan
```

### Port 5000 pehle se use mein hai
```bash
# docker-compose.yml mein port change karo:
ports:
  - "8080:5000"   # 5000 ki jagah 8080 use karo
```

### Migration fail ho raha hai
```bash
# Manually chalao aur error dekho:
docker compose run --rm db-migrate
```

### Kubernetes pod CrashLoopBackOff
```bash
kubectl describe pod <pod-name> -n kisansahayak   # Event logs dekho
kubectl logs <pod-name> -n kisansahayak           # App logs dekho
```

### DockerHub push permission denied
```bash
docker login   # Dobara login karo
# Ya GitHub Actions mein DOCKERHUB_TOKEN regenerate karo
```

---

## 📋 Makefile Commands Summary

```bash
make help         # Sab commands ki list
make build        # Local Docker image build
make up           # App start karo
make down         # App band karo
make logs         # Logs dekhna
make shell        # Container bash
make migrate      # DB migration
make push         # DockerHub pe build+push
make pull         # DockerHub se pull
make k8s-deploy   # Kubernetes pe deploy
make k8s-status   # K8s status
make k8s-scale N=3 # Replicas set karna
make clean        # Sab kuch delete
```

---

## 📞 Support & Links

- 🐛 GitHub Issues: [github.com/ankitiitians/KisanSahayak/issues](https://github.com/ankitiitians/KisanSahayak/issues)
- 🚀 Replit Live Demo: [replit.com/@ankitsriv20/KisanSahayak](https://replit.com/@ankitsriv20/KisanSahayak)
- 🐳 DockerHub: `https://hub.docker.com/r/yourusername/kisansahayak`
