# Quick Start Deployment Guide

## What's Included

This application includes:
✅ Live news feeds for 2025 World Series, SNAP benefits, immigration, and Hurricane Melissa
✅ Node.js server with CORS handling
✅ Responsive carousel design
✅ Docker containerization
✅ GCP Cloud Run deployment scripts

## Files Structure

```
everybodys-news-app/
├── server.js              # Main Node.js server
├── package.json           # Dependencies
├── Dockerfile            # Container config
├── deploy-to-gcp.sh      # Automated deployment script
├── cloudbuild.yaml       # CI/CD configuration
├── README.md             # Full documentation
├── public/
│   └── index.html        # Updated HTML with API integration
```

## Fastest Deployment (5 minutes)

### Prerequisites
- Google Cloud account
- gcloud CLI installed
- A GCP project created

### Steps

1. **Download and extract all files**

2. **Navigate to the project directory:**
```bash
cd everybodys-news-app
```

3. **Install dependencies (optional - for local testing):**
```bash
npm install
```

4. **Deploy to GCP Cloud Run:**
```bash
./deploy-to-gcp.sh YOUR_PROJECT_ID
```

That's it! The script will:
- Enable required APIs
- Build the Docker image
- Deploy to Cloud Run
- Provide you with the live URL

## Test Locally First (Optional)

```bash
npm install
npm start
```

Then open: http://localhost:8080

## What's Different from Original

### Backend (NEW)
- Node.js Express server handles CORS
- API endpoints for news feeds
- Mock news data for dev/testing
- Health check endpoint

### Frontend (MODIFIED)
- Connects to `/api/news` instead of RSS feeds
- Updated fallback content with current news
- Same carousel functionality maintained
- Layout integrity preserved

## News Topics Included

1. **2025 World Series** - Game 7 tonight (Dodgers vs Blue Jays)
2. **SNAP Benefits Crisis** - 42M Americans affected by shutdown
3. **Immigration/Deportation** - 500K+ removed, new policies
4. **Hurricane Melissa** - Category 5, Jamaica devastation

## Cost
- **Free tier**: 2M requests/month
- **Low traffic**: $0-5/month
- **Auto-scaling**: Scales to zero when not in use

## Support

Need help? Check:
- Full README.md for detailed docs
- GCP Cloud Run documentation
- Open an issue if you encounter problems

## Quick Commands

```bash
# Local development
npm start

# Build Docker image locally
docker build -t everybodys-news-app .

# Run Docker locally
docker run -p 8080:8080 everybodys-news-app

# Deploy to GCP
./deploy-to-gcp.sh YOUR_PROJECT_ID

# Check logs (after deployment)
gcloud run logs read everybodys-news-app --region us-central1
```

## Troubleshooting

**"gcloud: command not found"**
- Install Google Cloud SDK: https://cloud.google.com/sdk/docs/install

**"Permission denied: ./deploy-to-gcp.sh"**
```bash
chmod +x deploy-to-gcp.sh
```

**"API not enabled"**
- The script automatically enables APIs
- If it fails, enable manually in GCP Console

**Port errors locally**
- Change port in server.js if 8080 is in use
- Or set: `PORT=3000 npm start`

## Next Steps After Deployment

1. Get your app URL from deployment output
2. Test all endpoints:
   - Main app: `https://your-url.run.app`
   - News API: `https://your-url.run.app/api/news`
   - Health: `https://your-url.run.app/health`

3. Optional: Set up custom domain in Cloud Run
4. Optional: Configure CI/CD with cloudbuild.yaml

---

**Ready to deploy? Run:**
```bash
./deploy-to-gcp.sh YOUR_PROJECT_ID
```

🚀 Your news app will be live in minutes!
