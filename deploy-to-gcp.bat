@echo off
REM Deployment script for Everybody's News App to Google Cloud Run (Windows)
REM Usage: deploy-to-gcp.bat YOUR_PROJECT_ID [REGION]

if "%1"=="" (
    echo Error: Project ID is required
    echo Usage: deploy-to-gcp.bat YOUR_PROJECT_ID [REGION]
    exit /b 1
)

set PROJECT_ID=%1
set REGION=%2
if "%REGION%"=="" set REGION=us-central1
set SERVICE_NAME=everybodys-news-app
set IMAGE_NAME=gcr.io/%PROJECT_ID%/%SERVICE_NAME%

echo ========================================
echo Deploying Everybody's News App
echo ========================================
echo.
echo Project ID: %PROJECT_ID%
echo Region: %REGION%
echo Service Name: %SERVICE_NAME%
echo.

REM Check if gcloud is installed
where gcloud >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: gcloud CLI is not installed
    echo Please install from: https://cloud.google.com/sdk/docs/install
    exit /b 1
)

REM Set the project
echo Setting GCP project...
gcloud config set project %PROJECT_ID%

REM Enable required APIs
echo Enabling required APIs...
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

REM Build the Docker image using Cloud Build
echo Building Docker image with Cloud Build...
gcloud builds submit --tag %IMAGE_NAME%

REM Deploy to Cloud Run
echo Deploying to Cloud Run...
gcloud run deploy %SERVICE_NAME% --image %IMAGE_NAME% --platform managed --region %REGION% --allow-unauthenticated --memory 512Mi --cpu 1 --max-instances 10 --min-instances 0 --port 8080 --timeout 300 --concurrency 80 --quiet

REM Get the service URL
for /f "delims=" %%i in ('gcloud run services describe %SERVICE_NAME% --platform managed --region %REGION% --format "value(status.url)"') do set SERVICE_URL=%%i

echo.
echo ========================================
echo Deployment Successful!
echo ========================================
echo.
echo Service URL: %SERVICE_URL%
echo.
echo Available endpoints:
echo   Main App:      %SERVICE_URL%
echo   All News:      %SERVICE_URL%/api/news
echo   Rex Carousel:  %SERVICE_URL%/api/rex-carousel
echo   Health Check:  %SERVICE_URL%/health
echo.
echo Done! Your app is live! 🚀
