pipeline {
    agent any
    
    environment {
        // Thay 'your-dockerhub-username' bằng username Docker Hub của bạn
        DOCKER_HUB_USERNAME = 'dinhtrieuxtnd'
        DOCKER_IMAGE = "${DOCKER_HUB_USERNAME}/do-an-server"
        DOCKER_TAG = "${BUILD_NUMBER}"
        // ID của credentials đã tạo trong Jenkins (bước hướng dẫn bên dưới)
        DOCKER_HUB_CREDENTIALS = 'dockerhub-credentials'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out code from repository...'
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            steps {
                echo 'Installing dependencies...'
                script {
                    docker.image('node:18-alpine').inside {
                        sh 'npm ci'
                    }
                }
            }
        }
        
        stage('Generate Prisma Client') {
            steps {
                echo 'Generating Prisma Client...'
                script {
                    docker.image('node:18-alpine').inside {
                        sh 'npx prisma generate'
                    }
                }
            }
        }
        
        stage('Run Tests') {
            steps {
                echo 'Running tests...'
                script {
                    docker.image('node:18-alpine').inside {
                        sh 'npm run test'
                    }
                }
            }
        }
        
        stage('Build Application') {
            steps {
                echo 'Building application...'
                script {
                    docker.image('node:18-alpine').inside {
                        sh 'npm run build'
                    }
                }
            }
        }
        
        stage('Build Docker Image') {
            steps {
                echo 'Building Docker image...'
                script {
                    // Build image với tag BUILD_NUMBER và latest
                    dockerImage = docker.build("${DOCKER_IMAGE}:${DOCKER_TAG}")
                    docker.build("${DOCKER_IMAGE}:latest")
                }
            }
        }
        
        stage('Login to Docker Hub') {
            steps {
                echo 'Logging in to Docker Hub...'
                script {
                    // Login vào Docker Hub sử dụng credentials đã lưu
                    docker.withRegistry('https://registry.hub.docker.com', "${DOCKER_HUB_CREDENTIALS}") {
                        echo 'Successfully logged in to Docker Hub'
                    }
                }
            }
        }
        
        stage('Push to Docker Hub') {
            steps {
                echo 'Pushing Docker image to Docker Hub...'
                script {
                    docker.withRegistry('https://registry.hub.docker.com', "${DOCKER_HUB_CREDENTIALS}") {
                        // Push cả 2 tags: BUILD_NUMBER và latest
                        dockerImage.push("${DOCKER_TAG}")
                        dockerImage.push("latest")
                        echo "Successfully pushed ${DOCKER_IMAGE}:${DOCKER_TAG} and ${DOCKER_IMAGE}:latest"
                    }
                }
            }
        }
        
        stage('Deploy to Development') {
            when {
                branch 'develop'
            }
            steps {
                echo 'Deploying to development environment...'
                script {
                    sh """
                        docker-compose -f docker-compose.dev.yml down || true
                        docker-compose -f docker-compose.dev.yml up -d
                    """
                }
            }
        }
        
        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                echo 'Deploying to production environment...'
                script {
                    sh """
                        docker-compose -f docker-compose.prod.yml down || true
                        docker-compose -f docker-compose.prod.yml up -d
                    """
                }
            }
        }
    }
    
    post {
        success {
            echo 'Pipeline executed successfully!'
            // Có thể thêm notification ở đây (Slack, Email, etc.)
        }
        failure {
            echo 'Pipeline failed!'
            // Có thể thêm notification ở đây
        }
        always {
            echo 'Cleaning up workspace...'
            cleanWs()
        }
    }
}
