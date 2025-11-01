#!/bin/bash

# Everybody's News - Quick Deploy Script for GCP Cloud Run
# Usage: ./deploy.sh [PROJECT_ID]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}"
echo "╔═══════════════════════════════════════╗"
echo "║   Everybody's News - Quick Deploy    ║"
echo "║        Google Cloud Run              ║"
echo "╚═══════════════════════════════════════╝"
echo -e "${NC}"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Error: gcloud CLI not found. Please install it first.${NC}"
    echo "Visit: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Get project ID from argument or prompt
if [ -z "$1" ]; then
    echo -e "${YELLOW}Enter your GCP Project ID:${NC}"
    read -r PROJECT_ID
else
    PROJECT_ID=$1
fi

if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}Error: Project ID is required${NC}"
    exit 1
fi

echo -e "${GREEN}Using Project: $PROJECT_ID${NC}"

# Set the project
echo -e "${YELLOW}Setting GCP project...${NC}"
gcloud config set project "$PROJECT_ID"

# Enable required APIs
echo -e "${YELLOW}Enabling required GCP APIs...${NC}"
gcloud services enable run.googleapis.com containerregistry.googleapis.com cloudbuild.googleapis.com --quiet

# Choose deployment method
echo ""
echo -e "${YELLOW}Choose deployment method:${NC}"
echo "1) Source-based deploy (Easiest - recommended)"
echo "2) Docker build + deploy"
echo "3) Cloud Build (CI/CD)"
read -r -p "Enter choice [1-3]: " CHOICE

case $CHOICE in
    1)
        echo -e "${GREEN}Deploying from source...${NC}"
        gcloud run deploy everybodys-news \
            --source . \
            --region us-central1 \
            --platform managed \
            --allow-unauthenticated \
            --memory 512Mi \
            --cpu 1 \
            --min-instances 0 \
            --max-instances 10 \
            --port 8080 \
            --quiet
        ;;
    2)
        echo -e "${GREEN}Building Docker image...${NC}"
        docker build -t "gcr.io/$PROJECT_ID/everybodys-news:latest" .
        
        echo -e "${GREEN}Pushing to Container Registry...${NC}"
        docker push "gcr.io/$PROJECT_ID/everybodys-news:latest"
        
        echo -e "${GREEN}Deploying to Cloud Run...${NC}"
        gcloud run deploy everybodys-news \
            --image "gcr.io/$PROJECT_ID/everybodys-news:latest" \
            --region us-central1 \
            --platform managed \
            --allow-unauthenticated \
            --memory 512Mi \
            --cpu 1 \
            --min-instances 0 \
            --max-instances 10 \
            --port 8080 \
            --quiet
        ;;
    3)
        echo -e "${GREEN}Submitting to Cloud Build...${NC}"
        gcloud builds submit --config cloudbuild.yaml
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

# Get the service URL
SERVICE_URL=$(gcloud run services describe everybodys-news \
    --region us-central1 \
    --format 'value(status.url)' 2>/dev/null || echo "")

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════╗${NC}"
echo -e "${GREEN}║        Deployment Successful!        ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════╝${NC}"
echo ""

if [ -n "$SERVICE_URL" ]; then
    echo -e "${GREEN}Your site is live at:${NC}"
    echo -e "${YELLOW}$SERVICE_URL${NC}"
    echo ""
    echo -e "${GREEN}Opening in browser...${NC}"
    sleep 2
    
    # Try to open in browser
    if command -v xdg-open &> /dev/null; then
        xdg-open "$SERVICE_URL"
    elif command -v open &> /dev/null; then
        open "$SERVICE_URL"
    else
        echo -e "${YELLOW}Please open the URL manually in your browser${NC}"
    fi
fi

echo ""
echo -e "${GREEN}Useful commands:${NC}"
echo -e "  View logs:    ${YELLOW}gcloud run services logs read everybodys-news --region us-central1${NC}"
echo -e "  View status:  ${YELLOW}gcloud run services describe everybodys-news --region us-central1${NC}"
echo -e "  Delete:       ${YELLOW}gcloud run services delete everybodys-news --region us-central1${NC}"
echo ""
echo -e "${GREEN}Happy news sharing! 📰${NC}"
