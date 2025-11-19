#!/bin/bash

# Deployment script for Service1
# This script can be run manually on the VM where Service1 should be deployed

set -e

SERVICE_NAME="service1"
DOCKER_REGISTRY="docker.io"
DOCKER_USERNAME="wrakash"
KUBERNETES_NAMESPACE="${KUBERNETES_NAMESPACE:-default}"
IMAGE_TAG="${IMAGE_TAG:-latest}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Deploying $SERVICE_NAME ===${NC}"

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}Error: kubectl is not installed${NC}"
    exit 1
fi

# Check if helm is installed
if ! command -v helm &> /dev/null; then
    echo -e "${RED}Error: helm is not installed${NC}"
    exit 1
fi

# Check if Docker is installed (for building)
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}Warning: Docker is not installed. Skipping image build.${NC}"
    BUILD_IMAGE=false
else
    BUILD_IMAGE=true
fi

# Build Docker image (optional, if not using CI/CD)
if [ "$BUILD_IMAGE" = true ] && [ "${BUILD_LOCAL:-false}" = "true" ]; then
    echo -e "${GREEN}Building Docker image...${NC}"
    docker build -t $DOCKER_REGISTRY/$DOCKER_USERNAME/$SERVICE_NAME:$IMAGE_TAG .
    
    if [ "${PUSH_IMAGE:-false}" = "true" ]; then
        echo -e "${GREEN}Pushing Docker image...${NC}"
        docker push $DOCKER_REGISTRY/$DOCKER_USERNAME/$SERVICE_NAME:$IMAGE_TAG
    fi
fi

# Check Kubernetes connection
echo -e "${GREEN}Checking Kubernetes connection...${NC}"
if ! kubectl cluster-info &> /dev/null; then
    echo -e "${RED}Error: Cannot connect to Kubernetes cluster${NC}"
    exit 1
fi

# Create namespace if it doesn't exist
echo -e "${GREEN}Ensuring namespace exists...${NC}"
kubectl create namespace $KUBERNETES_NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# Deploy using Helm
echo -e "${GREEN}Deploying $SERVICE_NAME using Helm...${NC}"
helm upgrade --install $SERVICE_NAME ./helm \
    --namespace $KUBERNETES_NAMESPACE \
    --create-namespace \
    --set image.tag=$IMAGE_TAG \
    --wait \
    --timeout 5m

# Verify deployment
echo -e "${GREEN}Verifying deployment...${NC}"
kubectl get pods -n $KUBERNETES_NAMESPACE -l app=$SERVICE_NAME
kubectl rollout status deployment/$SERVICE_NAME -n $KUBERNETES_NAMESPACE

echo -e "${GREEN}=== Deployment completed successfully ===${NC}"
echo -e "${YELLOW}To check logs: kubectl logs -n $KUBERNETES_NAMESPACE -l app=$SERVICE_NAME${NC}"
echo -e "${YELLOW}To port forward: kubectl port-forward -n $KUBERNETES_NAMESPACE svc/$SERVICE_NAME 3001:3001${NC}"

