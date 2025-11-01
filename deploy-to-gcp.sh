#!/bin/bash

# Deployment script for Everybody's News App to Google Cloud Run
# Usage: ./deploy-to-gcp.sh YOUR_PROJECT_ID [REGION]

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if project ID is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: Project ID is required${NC}"
    echo "Usage: ./deploy-to-gcp.sh YOUR_PROJECT_ID [REGION]"
    exit 1
fi

PROJECT_ID=$1
REGION=${2:-us-central1}
SERVICE_NAME="everybodys-news-app"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deploying Everybody's News App${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Project ID: ${YELLOW}$PROJECT_ID${NC}"
echo -e "Region: ${YELLOW}$REGION${NC}"
echo -e "Service Name: ${YELLOW}$SERVICE_NAME${NC}"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Error: gcloud CLI is not installed${NC}"
    echo "Please install from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Set the project
echo -e "${YELLOW}Setting GCP project...${NC}"
gcloud config set project $PROJECT_ID

# Enable required APIs
echo -e "${YELLOW}Enabling required APIs...${NC}"
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Build the Docker image using Cloud Build
echo -e "${YELLOW}Building Docker image with Cloud Build...${NC}"
gcloud builds submit --tag $IMAGE_NAME

# Deploy to Cloud Run
echo -e "${YELLOW}Deploying to Cloud Run...${NC}"
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10 \
  --min-instances 0 \
  --port 8080 \
  --timeout 300 \
  --concurrency 80 \
  --cpu-boost \
  --quiet

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)')

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment Successful!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Service URL: ${GREEN}$SERVICE_URL${NC}"
echo ""
echo -e "Available endpoints:"
echo -e "  Main App:      ${GREEN}$SERVICE_URL${NC}"
echo -e "  All News:      ${GREEN}$SERVICE_URL/api/news${NC}"
echo -e "  World Series:  ${GREEN}$SERVICE_URL/api/news/worldseries${NC}"
echo -e "  SNAP Benefits: ${GREEN}$SERVICE_URL/api/news/snap${NC}"
echo -e "  Immigration:   ${GREEN}$SERVICE_URL/api/news/immigration${NC}"
echo -e "  Hurricane:     ${GREEN}$SERVICE_URL/api/news/hurricane${NC}"
echo -e "  Health Check:  ${GREEN}$SERVICE_URL/health${NC}"
echo ""
echo -e "${YELLOW}Testing the deployment...${NC}"
curl -s -o /dev/null -w "Health Check Status: %{http_code}\n" "$SERVICE_URL/health"

echo ""
echo -e "${GREEN}Done! Your app is live! 🚀${NC}"
