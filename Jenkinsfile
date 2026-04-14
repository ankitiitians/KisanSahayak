// ============================================================
// KisanSahayak — Jenkinsfile
// Pipeline stages:
//   Checkout → Install → Lint/Type-check → Security Scan
//   → Build Docker → Push DockerHub → Deploy (K8s or Compose)
//
// Required Jenkins Credentials (configure in Manage Jenkins):
//   dockerhub-credentials  → Username/Password (DockerHub)
//   kubeconfig             → Secret File (kubectl config)
//
// Required Jenkins Plugins:
//   Pipeline, Docker Pipeline, Kubernetes CLI, Blue Ocean (optional)
// ============================================================

pipeline {
    agent any

    // ── Pipeline-wide environment ──────────────────────────
    environment {
        APP_NAME       = 'kisansahayak'
        DOCKER_REPO    = "yourdockerhubusername/${APP_NAME}"
        IMAGE_TAG      = "${BUILD_NUMBER}"           // unique per build
        IMAGE_LATEST   = "${DOCKER_REPO}:latest"
        IMAGE_VERSIONED = "${DOCKER_REPO}:${IMAGE_TAG}"
        K8S_NAMESPACE  = 'kisansahayak'
        DOCKER_CREDENTIALS_ID = 'dockerhub-credentials'
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))   // keep last 10 builds
        timeout(time: 30, unit: 'MINUTES')
        disableConcurrentBuilds()                        // prevent overlapping builds
    }

    // ── Trigger: poll SCM every 2 minutes (or use webhook) ─
    triggers {
        pollSCM('H/2 * * * *')
    }

    stages {

        // ── Stage 1: Checkout ──────────────────────────────
        stage('Checkout') {
            steps {
                checkout scm
                echo "Branch: ${env.BRANCH_NAME} | Build: #${BUILD_NUMBER}"
            }
        }

        // ── Stage 2: Install Dependencies ─────────────────
        stage('Install') {
            steps {
                sh 'node --version'
                sh 'npm --version'
                sh 'npm ci'
            }
        }

        // ── Stage 3: Lint & Type-check ─────────────────────
        stage('Lint & Type Check') {
            steps {
                sh 'npm run check'          // tsc --noEmit
            }
        }

        // ── Stage 4: Security Scan (Trivy) ─────────────────
        // Scans the built Docker image for OS + library CVEs
        // Install Trivy on Jenkins agent: https://aquasecurity.github.io/trivy
        stage('Security Scan') {
            steps {
                script {
                    // Build image first so Trivy can scan it
                    sh "docker build -t ${IMAGE_VERSIONED} ."

                    // Fail pipeline on CRITICAL vulnerabilities
                    sh """
                        trivy image \
                          --exit-code 1 \
                          --severity CRITICAL \
                          --no-progress \
                          ${IMAGE_VERSIONED}
                    """
                }
            }
        }

        // ── Stage 5: Build Docker Image ────────────────────
        stage('Build Docker Image') {
            steps {
                script {
                    docker.build("${IMAGE_VERSIONED}", "--file Dockerfile .")
                    // Also tag as latest
                    sh "docker tag ${IMAGE_VERSIONED} ${IMAGE_LATEST}"
                    echo "Built: ${IMAGE_VERSIONED}"
                }
            }
        }

        // ── Stage 6: Push to DockerHub ─────────────────────
        stage('Push to DockerHub') {
            when {
                anyOf {
                    branch 'main'
                    branch 'master'
                }
            }
            steps {
                script {
                    withCredentials([usernamePassword(
                        credentialsId: env.DOCKER_CREDENTIALS_ID,
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )]) {
                        sh "echo ${DOCKER_PASS} | docker login -u ${DOCKER_USER} --password-stdin"
                        sh "docker push ${IMAGE_VERSIONED}"
                        sh "docker push ${IMAGE_LATEST}"
                        echo "Pushed: ${IMAGE_VERSIONED} and ${IMAGE_LATEST}"
                    }
                }
            }
        }

        // ── Stage 7: Deploy ────────────────────────────────
        // Chooses deployment method based on DEPLOY_TARGET param
        stage('Deploy') {
            when {
                anyOf {
                    branch 'main'
                    branch 'master'
                }
            }
            steps {
                script {
                    def target = params.DEPLOY_TARGET ?: 'compose'

                    if (target == 'kubernetes') {
                        echo "Deploying to Kubernetes namespace: ${K8S_NAMESPACE}"
                        withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
                            sh """
                                kubectl set image deployment/kisansahayak \
                                  kisansahayak=${IMAGE_VERSIONED} \
                                  -n ${K8S_NAMESPACE}
                                kubectl rollout status deployment/kisansahayak \
                                  -n ${K8S_NAMESPACE} \
                                  --timeout=120s
                            """
                        }
                    } else {
                        echo "Deploying via Docker Compose on this host"
                        sh """
                            DOCKER_IMAGE=${IMAGE_VERSIONED} docker compose pull app
                            DOCKER_IMAGE=${IMAGE_VERSIONED} docker compose up -d --no-build
                        """
                    }
                }
            }
        }

    } // end stages

    // ── Post-build actions ─────────────────────────────────
    post {
        always {
            // Clean up local images to save disk space on agent
            sh "docker rmi ${IMAGE_VERSIONED} ${IMAGE_LATEST} || true"
            echo "Pipeline finished: ${currentBuild.currentResult}"
        }
        success {
            echo "Build #${BUILD_NUMBER} deployed successfully."
        }
        failure {
            echo "Build #${BUILD_NUMBER} failed. Check logs above."
        }
    }

} // end pipeline

// ── Parameters (shown in Jenkins UI "Build with Parameters") ─
// Add this block inside pipeline{} above agent if you want
// a dropdown in Jenkins to choose deployment target:
//
// parameters {
//     choice(
//         name: 'DEPLOY_TARGET',
//         choices: ['compose', 'kubernetes'],
//         description: 'Where to deploy after a successful build'
//     )
// }
