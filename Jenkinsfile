pipeline {
  agent any

  environment {
    APP_NAME = "event-management-webapp"
    IMAGE_NAME = "event-management-webapp"
    AWS_REGION = "ap-south-1"
    REGISTRY = "CHANGE_ME"
    DEPLOY_HOST = ""
  }

  stages {
    stage("Checkout") {
      steps {
        checkout scm
      }
    }

    stage("Install") {
      steps {
        sh "npm install"
      }
    }

    stage("Test") {
      steps {
        sh "npm test"
      }
    }

    stage("Build Docker Image") {
      steps {
        sh "docker build -t ${IMAGE_NAME}:latest ."
      }
    }

    stage("Push to ECR") {
      when {
        expression { return env.REGISTRY != "CHANGE_ME" }
      }
      steps {
        sh "aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${REGISTRY}"
        sh "docker tag ${IMAGE_NAME}:latest ${REGISTRY}/${IMAGE_NAME}:latest"
        sh "docker push ${REGISTRY}/${IMAGE_NAME}:latest"
      }
    }

    stage("Deploy with Ansible") {
      when {
        expression { return env.DEPLOY_HOST?.trim() }
      }
      steps {
        sh "ansible-playbook -i ansible/inventory.ini ansible/deploy.yml"
      }
    }
  }
}
