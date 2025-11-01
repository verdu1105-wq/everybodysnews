# Everybody's News - Live News Feed Application

A modern news aggregation web application featuring live news feeds in a dynamic carousel format. This application showcases current breaking news including:
- 2025 World Series (Dodgers vs Blue Jays)
- SNAP Benefits Crisis
- Immigration/Deportation Updates
- Hurricane Melissa Coverage

## Features

- 🎯 **Live News Feeds**: Real-time news updates from multiple sources
- 🎠 **Dynamic Carousel**: Auto-rotating hero carousel with smooth transitions
- 📱 **Responsive Design**: Mobile-first design that works on all devices
- 🔒 **CORS Handling**: Node.js backend handles CORS issues
- ☁️ **Cloud Ready**: Containerized for easy deployment to GCP Cloud Run

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js with Express
- **Container**: Docker
- **Deployment**: Google Cloud Platform (Cloud Run)

## Local Development

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Docker (for containerization)
- Google Cloud SDK (for deployment)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open your browser to:
```
http://localhost:8080
```

## API Endpoints

- `GET /` - Main application
- `GET /api/news` - All news articles
- `GET /api/news/worldseries` - World Series updates
- `GET /api/news/snap` - SNAP benefits news
- `GET /api/news/immigration` - Immigration news
- `GET /api/news/hurricane` - Hurricane Melissa updates
- `GET /health` - Health check endpoint

## Docker Build

Build the Docker image:
```bash
docker build -t everybodys-news-app .
```

Run locally with Docker:
```bash
docker run -p 8080:8080 everybodys-news-app
```

## Deployment to GCP Cloud Run

### Option 1: Using gcloud CLI

1. **Set up Google Cloud Project**:
```bash
# Set your project ID
export PROJECT_ID="your-project-id"
gcloud config set project $PROJECT_ID

# Enable required APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
```

2. **Build and push to Google Container Registry**:
```bash
# Build the image
gcloud builds submit --tag gcr.io/$PROJECT_ID/everybodys-news-app

# Or use Artifact Registry (recommended)
gcloud builds submit --tag us-central1-docker.pkg.dev/$PROJECT_ID/cloud-run-source-deploy/everybodys-news-app
```

3. **Deploy to Cloud Run**:
```bash
gcloud run deploy everybodys-news-app \
  --image gcr.io/$PROJECT_ID/everybodys-news-app \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10 \
  --port 8080
```

### Option 2: Using the Deployment Script

1. Make the script executable:
```bash
chmod +x deploy-to-gcp.sh
```

2. Run the deployment:
```bash
./deploy-to-gcp.sh YOUR_PROJECT_ID
```

### Option 3: Using Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to Cloud Run
3. Click "Create Service"
4. Choose "Continuously deploy from a repository"
5. Connect your GitHub/GitLab repository
6. Configure:
   - Port: 8080
   - Memory: 512 MiB
   - CPU: 1
   - Max instances: 10
   - Allow unauthenticated invocations

## Environment Variables

The application uses the following environment variables (all optional):

- `PORT` - Server port (default: 8080)
- `NODE_ENV` - Environment mode (default: production)

## Project Structure

```
everybodys-news-app/
├── server.js              # Express server with API endpoints
├── package.json           # Node.js dependencies
├── Dockerfile            # Container configuration
├── .dockerignore         # Files to exclude from Docker build
├── deploy-to-gcp.sh      # Deployment automation script
├── public/
│   └── index.html        # Main HTML file with carousel
└── README.md             # This file
```

## News Topics Covered

### 2025 World Series
- Game 7: Los Angeles Dodgers vs Toronto Blue Jays
- Historic matchup with defending champions seeking repeat
- Live updates and scores

### SNAP Benefits Crisis
- 42 million Americans affected by government shutdown
- November benefits suspended
- Federal court rulings and emergency funding

### Immigration & Deportation
- Record deportation numbers (500,000+ removed)
- Supreme Court third-country deportation ruling
- Policy changes and enforcement updates

### Hurricane Melissa
- Category 5 hurricane - tied for strongest Atlantic landfall
- Jamaica, Cuba, and Bahamas devastation
- Recovery efforts and damage assessment

## Performance Optimization

- Compressed assets
- Efficient image loading
- Minimal JavaScript bundle
- Server-side caching (when implemented)
- CDN-ready architecture

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Security Features

- CORS properly configured
- Input sanitization
- No sensitive data exposure
- Health check endpoint
- Container security best practices

## Monitoring & Logging

Cloud Run provides built-in monitoring:
- Request logs
- Error tracking
- Performance metrics
- Automatic scaling metrics

## Troubleshooting

### Port Issues
- Cloud Run automatically sets the PORT environment variable
- Local development uses port 8080 by default

### CORS Errors
- Backend handles CORS with the `cors` middleware
- All origins are allowed in development

### Deployment Fails
- Check that all required GCP APIs are enabled
- Verify Docker image builds successfully locally
- Ensure project ID is correct

## Cost Estimation

Cloud Run pricing (as of 2025):
- Free tier: 2 million requests/month
- After free tier: ~$0.40 per million requests
- Memory: ~$0.0000025 per GB-second
- CPU: ~$0.00002400 per vCPU-second

Expected monthly cost for low-to-medium traffic: **$0-5**

## License

MIT License - feel free to use this project as you wish.

## Support

For issues or questions, please open an issue in the repository.

## Future Enhancements

- [ ] Real-time WebSocket updates
- [ ] User preferences and customization
- [ ] Email/SMS alerts for breaking news
- [ ] Social media integration
- [ ] Advanced filtering and search
- [ ] Multi-language support
