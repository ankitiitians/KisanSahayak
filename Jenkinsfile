pipeline {
    agent any

    // ── Global env vars ─────────────────────────────────────────────────────
    environment {
        DOCKERHUB_USERNAME = "YOUR_DOCKERHUB_USERNAME"          // ← change this
        IMAGE_NAME         = "${DOCKERHUB_USERNAME}/kisansahayak"
        IMAGE_TAG          = "${BUILD_NUMBER}"                   // unique per build
        IMAGE_LATEST       = "${IMAGE_NAME}:latest"
        IMAGE_VERSIONED    = "${IMAGE_NAME}:${IMAGE_TAG}"
        KUBE_NAMESPACE     = "kisansahayak"

        // Jenkins credential IDs (configure these in Jenkins → Credentials)
        DOCKERHUB_CREDS    = "dockerhub-credentials"
        KUBECONFIG_CRED    = "kubeconfig-kind"
    }

    options {
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
    }

    stages {

        // ── Stage 1: Checkout ────────────────────────────────────────────────
        stage('Checkout') {
            steps {
                echo "=== Checking out source code ==="
                checkout scm
                sh 'echo "Branch: $(git rev-parse --abbrev-ref HEAD)"'
                sh 'echo "Commit: $(git rev-parse --short HEAD)"'
            }
        }

        // ── Stage 2: Build Docker Image ──────────────────────────────────────
        stage('Build Docker Image') {
            steps {
                echo "=== Building Docker image: ${IMAGE_VERSIONED} ==="
                sh """
                    docker build \
                        --no-cache \
                        -t ${IMAGE_VERSIONED} \
                        -t ${IMAGE_LATEST} \
                        .
                """
                sh "docker images | grep kisansahayak"
            }
        }

        // ── Stage 3: Push to DockerHub ───────────────────────────────────────
        stage('Push to DockerHub') {
            steps {
                echo "=== Pushing to DockerHub ==="
                withCredentials([usernamePassword(
                    credentialsId: "${DOCKERHUB_CREDS}",
                    usernameVariable: 'DH_USER',
                    passwordVariable: 'DH_PASS'
                )]) {
                    sh 'echo "$DH_PASS" | docker login -u "$DH_USER" --password-stdin'
                    sh "docker push ${IMAGE_VERSIONED}"
                    sh "docker push ${IMAGE_LATEST}"
                    sh "docker logout"
                }
            }
        }

        // ── Stage 4: Update image tag in k8s manifest ────────────────────────
        stage('Update K8s Manifest') {
            steps {
                echo "=== Patching deployment image to ${IMAGE_VERSIONED} ==="
                sh """
                    sed -i 's|image: .*kisansahayak.*|image: ${IMAGE_VERSIONED}|g' \
                        k8s/04-app.yaml
                    sed -i 's|image: .*kisansahayak.*|image: ${IMAGE_VERSIONED}|g' \
                        k8s/05-db-migrate-job.yaml
                """
            }
        }

        // ── Stage 5: Deploy to Kind Cluster ──────────────────────────────────
        stage('Deploy to Kind') {
            steps {
                echo "=== Deploying to Kind Kubernetes cluster ==="
                withCredentials([file(
                    credentialsId: "${KUBECONFIG_CRED}",
                    variable: 'KUBECONFIG'
                )]) {
                    sh """
                        export KUBECONFIG=\$KUBECONFIG

                        # Apply all manifests in order
                        kubectl apply -f k8s/00-namespace.yaml
                        kubectl apply -f k8s/01-secret.yaml
                        kubectl apply -f k8s/02-postgres-pvc.yaml
                        kubectl apply -f k8s/03-postgres.yaml
                        kubectl apply -f k8s/04-app.yaml

                        # Wait for postgres to be ready
                        echo "Waiting for postgres..."
                        kubectl rollout status deployment/postgres \
                            -n ${KUBE_NAMESPACE} --timeout=120s

                        # Delete previous migrate job (Jobs are immutable)
                        kubectl delete job db-migrate \
                            -n ${KUBE_NAMESPACE} --ignore-not-found=true
                        kubectl apply -f k8s/05-db-migrate-job.yaml

                        # Wait for app rollout
                        echo "Waiting for app rollout..."
                        kubectl rollout status deployment/kisansahayak \
                            -n ${KUBE_NAMESPACE} --timeout=180s

                        # Print status
                        echo "=== Deployment Status ==="
                        kubectl get pods -n ${KUBE_NAMESPACE}
                        kubectl get svc  -n ${KUBE_NAMESPACE}
                    """
                }
            }
        }

        // ── Stage 6: Smoke Test ──────────────────────────────────────────────
        stage('Smoke Test') {
            steps {
                echo "=== Running smoke test ==="
                sh """
                    sleep 10
                    STATUS=\$(curl -s -o /dev/null -w "%{http_code}" http://localhost:30500 || true)
                    echo "HTTP status: \$STATUS"
                    if [ "\$STATUS" != "200" ] && [ "\$STATUS" != "304" ]; then
                        echo "WARNING: App returned \$STATUS — check logs"
                    else
                        echo "SUCCESS: App is responding"
                    fi
                """
            }
        }

    } // end stages

    // ── Post actions ─────────────────────────────────────────────────────────
    post {
        always {
            echo "=== Cleaning up local Docker images ==="
            sh "docker rmi ${IMAGE_VERSIONED} || true"
            sh "docker rmi ${IMAGE_LATEST} || true"
            sh "docker system prune -f || true"
        }
        success {
            echo "✅ Pipeline SUCCESS — Build #${BUILD_NUMBER} deployed"
            echo "   App URL: http://YOUR_SERVER_IP:30500"
        }
        failure {
            echo "❌ Pipeline FAILED — Build #${BUILD_NUMBER}"
            echo "   Check console output above for errors"
        }
    }
}
