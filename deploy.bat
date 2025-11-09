@echo off
REM Deployment script for Everybody's News to Google Cloud Run (Windows)
REM Usage: deploy.bat

echo Starting deployment to Google Cloud Run...
echo.

REM Configuration
set PROJECT_ID=cybergrid
set SERVICE_NAME=everybodys-news-app
set REGION=us-east1
set IMAGE_NAME=everybodysnews

REM Set Google Cloud project
echo Setting Google Cloud project to %PROJECT_ID%...
gcloud config set project %PROJECT_ID%
echo.

REM Build and submit to Google Cloud Build
echo Building Docker image...
gcloud builds submit --tag gcr.io/%PROJECT_ID%/%IMAGE_NAME%
echo.

REM Deploy to Cloud Run
echo Deploying to Cloud Run...
gcloud run deploy %SERVICE_NAME% --image gcr.io/%PROJECT_ID%/%IMAGE_NAME% --platform managed --region %REGION% --allow-unauthenticated --port 8080 --memory 512Mi --cpu 1 --max-instances 10 --timeout 60
echo.

REM Get the service URL
echo Deployment complete!
echo Service URL:
gcloud run services describe %SERVICE_NAME% --platform managed --region %REGION% --format "value(status.url)"
echo.

echo Deployment successful! Your news site is now live.
pause
