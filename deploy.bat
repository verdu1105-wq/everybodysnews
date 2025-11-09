@echo off
echo ========================================
echo Deploying Everybody's News to Cloud Run
echo ========================================
echo.

echo Checking gcloud authentication...
gcloud auth list
echo.

echo Current project:
gcloud config get-value project
echo.

echo Starting deployment...
gcloud run deploy everybodys-news-app ^
  --source . ^
  --region us-east1 ^
  --platform managed ^
  --allow-unauthenticated ^
  --memory 512Mi ^
  --port 8080 ^
  --project cybergrid

echo.
echo ========================================
echo Deployment complete!
echo Your app: https://everybodys-news-app-974184310088.us-east1.run.app/
echo ========================================
pause
