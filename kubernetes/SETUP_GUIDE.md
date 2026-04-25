# KisanSahayak — Complete DevOps Setup Guide
## Kind Cluster + Jenkins CI/CD Pipeline

---

## FILES YOU NEED TO ADD TO YOUR REPO

Add these files to the ROOT of your KisanSahayak GitHub repo:

```
KisanSahayak/
├── Dockerfile                    ← ADD THIS
├── .dockerignore                 ← ADD THIS
├── Jenkinsfile                   ← ADD THIS
├── kind-cluster-config.yaml      ← ADD THIS
├── k8s/
│   ├── 00-namespace.yaml         ← ADD THIS
│   ├── 01-secret.yaml            ← ADD THIS
│   ├── 02-postgres-pvc.yaml      ← ADD THIS
│   ├── 03-postgres.yaml          ← ADD THIS
│   ├── 04-app.yaml               ← ADD THIS
│   └── 05-db-migrate-job.yaml    ← ADD THIS
├── client/
├── server/
├── shared/
├── package.json
└── ... (existing files)
```

---

## PHASE 1 — UBUNTU SERVER SETUP

### Step 1 — Update system

```bash
sudo apt-get update -y && sudo apt-get upgrade -y
sudo apt-get install -y curl git wget apt-transport-https ca-certificates gnupg lsb-release
```

---

### Step 2 — Install Docker

```bash
# Add Docker's GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repo
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] \
  https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install
sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Allow current user to run docker without sudo
sudo usermod -aG docker $USER
newgrp docker

# Verify
docker --version
```

---

### Step 3 — Install kubectl

```bash
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
kubectl version --client
```

---

### Step 4 — Install Kind

```bash
curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.22.0/kind-linux-amd64
chmod +x ./kind
sudo mv ./kind /usr/local/bin/kind
kind --version
```

---

### Step 5 — Install Java 17 (required for Jenkins)

```bash
sudo apt-get install -y openjdk-17-jdk
java -version
```

---

### Step 6 — Install Jenkins

```bash
# Add Jenkins repo key
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | \
  sudo tee /usr/share/keyrings/jenkins-keyring.asc > /dev/null

# Add Jenkins repo
echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/" | \
  sudo tee /etc/apt/sources.list.d/jenkins.list > /dev/null

# Install
sudo apt-get update -y
sudo apt-get install -y jenkins

# Start Jenkins
sudo systemctl enable jenkins
sudo systemctl start jenkins

# Verify
sudo systemctl status jenkins
```

---

### Step 7 — Add Jenkins user to Docker group

```bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins

# Verify jenkins can use docker
sudo su - jenkins -s /bin/bash -c "docker ps"
```

---

### Step 8 — Open firewall ports

```bash
sudo ufw allow 8080   # Jenkins
sudo ufw allow 30500  # KisanSahayak app
sudo ufw allow 30432  # Postgres (optional, for debugging)
sudo ufw enable
sudo ufw status
```

---

## PHASE 2 — KIND CLUSTER SETUP

### Step 9 — Create Kind cluster

```bash
# Create cluster using the config file from your repo
kind create cluster --config kind-cluster-config.yaml

# Verify cluster is running
kubectl cluster-info --context kind-kisansahayak
kubectl get nodes
```

Expected output:
```
NAME                        STATUS   ROLES           AGE   VERSION
kisansahayak-control-plane  Ready    control-plane   30s   v1.29.x
```

---

### Step 10 — Export kubeconfig for Jenkins

```bash
# Export kubeconfig to a file Jenkins can use
kind get kubeconfig --name kisansahayak > /home/$USER/kisansahayak-kubeconfig.yaml

# Make it readable by Jenkins user
sudo cp /home/$USER/kisansahayak-kubeconfig.yaml /var/lib/jenkins/kisansahayak-kubeconfig.yaml
sudo chown jenkins:jenkins /var/lib/jenkins/kisansahayak-kubeconfig.yaml
sudo chmod 600 /var/lib/jenkins/kisansahayak-kubeconfig.yaml

# IMPORTANT: The kubeconfig uses 127.0.0.1 by default.
# Since Jenkins runs on the host, this works fine.
cat /var/lib/jenkins/kisansahayak-kubeconfig.yaml
```

---

### Step 11 — Test kubectl from Jenkins user

```bash
sudo su - jenkins -s /bin/bash -c "kubectl --kubeconfig /var/lib/jenkins/kisansahayak-kubeconfig.yaml get nodes"
```

---

## PHASE 3 — DOCKERHUB SETUP

### Step 12 — Create DockerHub account & repo

1. Go to https://hub.docker.com and sign up / log in
2. Create a new public repository named `kisansahayak`
3. Go to Account Settings → Security → New Access Token
4. Name it `jenkins-token`, copy the token value

---

### Step 13 — Update your files with your DockerHub username

In `Jenkinsfile`:
```groovy
DOCKERHUB_USERNAME = "YOUR_DOCKERHUB_USERNAME"   // ← replace this
```

In `k8s/04-app.yaml` and `k8s/05-db-migrate-job.yaml`:
```yaml
image: YOUR_DOCKERHUB_USERNAME/kisansahayak:latest   // ← replace this
```

---

## PHASE 4 — JENKINS CONFIGURATION

### Step 14 — Initial Jenkins setup

```bash
# Get initial admin password
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

1. Open browser: `http://YOUR_SERVER_IP:8080`
2. Paste the admin password
3. Click "Install suggested plugins" and wait
4. Create your admin user
5. Click "Save and Finish"

---

### Step 15 — Install extra Jenkins plugins

Go to: **Manage Jenkins → Plugins → Available plugins**

Search and install these:
- `Docker Pipeline`
- `Kubernetes CLI`
- `Git`
- `Credentials Binding`
- `Pipeline`

Click "Install" → "Restart Jenkins when installation is complete"

---

### Step 16 — Add DockerHub credentials

Go to: **Manage Jenkins → Credentials → System → Global credentials → Add Credentials**

| Field | Value |
|---|---|
| Kind | Username with password |
| Username | your DockerHub username |
| Password | your DockerHub Access Token |
| ID | `dockerhub-credentials` |
| Description | DockerHub credentials |

Click **Save**

---

### Step 17 — Add Kubeconfig credentials

Go to: **Manage Jenkins → Credentials → System → Global credentials → Add Credentials**

| Field | Value |
|---|---|
| Kind | Secret file |
| File | Upload `/var/lib/jenkins/kisansahayak-kubeconfig.yaml` |
| ID | `kubeconfig-kind` |
| Description | Kind kubeconfig |

Click **Save**

---

### Step 18 — Create Jenkins Pipeline job

1. Go to Jenkins dashboard → **New Item**
2. Name: `KisanSahayak-Pipeline`
3. Type: **Pipeline**
4. Click **OK**

In the pipeline configuration:
- Scroll to **Pipeline** section
- Definition: `Pipeline script from SCM`
- SCM: `Git`
- Repository URL: `https://github.com/ankitiitians/KisanSahayak`
- Branch: `*/main`
- Script Path: `Jenkinsfile`

Click **Save**

---

## PHASE 5 — PUSH FILES & FIRST RUN

### Step 19 — Add DevOps files to your repo

On your LOCAL machine (or directly on the server):

```bash
# Clone your repo
git clone https://github.com/ankitiitians/KisanSahayak.git
cd KisanSahayak

# Create k8s directory
mkdir -p k8s

# Copy all the files provided in this guide into the correct locations:
# - Dockerfile          → root
# - .dockerignore       → root
# - Jenkinsfile         → root
# - kind-cluster-config.yaml → root
# - k8s/00-namespace.yaml through k8s/05-db-migrate-job.yaml → k8s/

# Update YOUR_DOCKERHUB_USERNAME in Jenkinsfile and k8s/04-app.yaml and k8s/05-db-migrate-job.yaml

# Commit and push
git add .
git commit -m "Add DevOps: Dockerfile, Jenkinsfile, k8s manifests"
git push origin main
```

---

### Step 20 — Trigger the Jenkins pipeline

1. Go to Jenkins → `KisanSahayak-Pipeline`
2. Click **Build Now**
3. Click the build number → **Console Output**
4. Watch the stages: Checkout → Build → Push → Deploy → Smoke Test

---

### Step 21 — Verify deployment

```bash
# Check pods
kubectl get pods -n kisansahayak

# Should show:
# postgres-xxx       1/1  Running
# kisansahayak-xxx   1/1  Running
# kisansahayak-xxx   1/1  Running

# Check services
kubectl get svc -n kisansahayak

# Check logs if something fails
kubectl logs -n kisansahayak deployment/kisansahayak
kubectl logs -n kisansahayak deployment/postgres
```

Access your app:
```
http://YOUR_SERVER_IP:30500
```

---

## PHASE 6 — WEBHOOK (AUTO TRIGGER ON GIT PUSH)

### Step 22 — Configure GitHub Webhook

1. Go to your GitHub repo → **Settings → Webhooks → Add webhook**
2. Payload URL: `http://YOUR_SERVER_IP:8080/github-webhook/`
3. Content type: `application/json`
4. Events: **Just the push event**
5. Click **Add webhook**

In Jenkins → KisanSahayak-Pipeline → **Configure**:
- Check ✅ `GitHub hook trigger for GITScm polling`
- Click **Save**

Now every `git push` to main will automatically trigger the pipeline! 🎉

---

## TROUBLESHOOTING

### Pod stuck in `Pending`
```bash
kubectl describe pod <pod-name> -n kisansahayak
# Usually a resource or PVC issue — check Events section
```

### App pod `CrashLoopBackOff`
```bash
kubectl logs <pod-name> -n kisansahayak --previous
# Check DATABASE_URL is correct in secret
```

### Jenkins can't connect to Docker
```bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

### Kind cluster lost after server reboot
```bash
# Kind clusters don't survive reboots — recreate:
kind create cluster --config kind-cluster-config.yaml
# Then re-trigger Jenkins pipeline to redeploy everything
```

### Check DB migration ran successfully
```bash
kubectl logs job/db-migrate -n kisansahayak
```

---

## QUICK REFERENCE COMMANDS

```bash
# Cluster status
kubectl get all -n kisansahayak

# App logs (live)
kubectl logs -f deployment/kisansahayak -n kisansahayak

# Postgres logs
kubectl logs -f deployment/postgres -n kisansahayak

# Restart app
kubectl rollout restart deployment/kisansahayak -n kisansahayak

# Delete everything and redeploy
kubectl delete namespace kisansahayak
kubectl apply -f k8s/

# Jenkins service status
sudo systemctl status jenkins

# Kind cluster info
kind get clusters
kubectl cluster-info --context kind-kisansahayak
```
