# Everybody's News - Deployment Guide

A modern news aggregator that pulls breaking news from multiple RSS feeds and displays them in a beautiful, responsive interface.

## Features

✅ **Breaking News Hero Section** - Double-wide carousel with auto-rotating stories from all feeds
✅ **Multi-Source RSS Integration** - ESPN Sports, and two custom RSS feeds
✅ **Real-time Updates** - Feeds refresh every 5 minutes automatically
✅ **Responsive Design** - Mobile-friendly layout
✅ **Auto-deployed to GCP Cloud Run** - Scalable, serverless hosting

## RSS Feeds Integrated

1. **ESPN Sports** - `https://www.espn.com/espn/rss/news`
2. **News Feed 1** - `https://rss.app/feeds/tN6TfKaJzhcPYYkB.xml`
3. **News Feed 2** - `https://rss.app/feeds/tUo3SJ8AHWweCZGH.xml`

## Prerequisites

Before deploying, ensure you have:

- Google Cloud Platform account
- `gcloud` CLI installed and configured
- Docker installed (for local testing)
- Git (optional, for version control)

## Quick Start - Deploy to GCP Cloud Run

### Option 1: Manual Deployment (Fastest)

```bash
# 1. Set your GCP project
gcloud config set project YOUR_PROJECT_ID

# 2. Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# 3. Build and deploy in one command
gcloud run deploy everybodys-news \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --port 8080

# 4. Your site will be live at the URL provided!
```

### Option 2: Docker Build + Deploy

```bash
# 1. Set your GCP project
export PROJECT_ID=your-project-id
gcloud config set project $PROJECT_ID

# 2. Build the Docker image
docker build -t gcr.io/$PROJECT_ID/everybodys-news:latest .

# 3. Push to Google Container Registry
docker push gcr.io/$PROJECT_ID/everybodys-news:latest

# 4. Deploy to Cloud Run
gcloud run deploy everybodys-news \
  --image gcr.io/$PROJECT_ID/everybodys-news:latest \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1
```

### Option 3: Automated CI/CD with Cloud Build

```bash
# 1. Connect your repository to Cloud Build
gcloud builds submit --config cloudbuild.yaml

# 2. Set up automatic deployments (optional)
# Connect your GitHub/GitLab repo in GCP Console > Cloud Build > Triggers
```

## Local Development

Test the site locally before deploying:

```bash
# 1. Install dependencies
npm install

# 2. Start the server
npm start

# 3. Open browser to http://localhost:8080
```

For development with auto-reload:
```bash
npm run dev
```

## Project Structure

```
everybodys-news/
├── everybodys-news.html    # Main HTML file with RSS integration
├── server.js               # Express server for Cloud Run
├── package.json            # Node.js dependencies
├── Dockerfile              # Container configuration
├── cloudbuild.yaml         # GCP Cloud Build config
├── .dockerignore          # Docker build optimization
└── README.md              # This file
```

## Configuration

### Customizing RSS Feeds

Edit the `RSS_FEEDS` object in `everybodys-news.html`:

```javascript
const RSS_FEEDS = {
  espn: 'https://www.espn.com/espn/rss/news',
  feed1: 'https://rss.app/feeds/YOUR_FEED_1.xml',
  feed2: 'https://rss.app/feeds/YOUR_FEED_2.xml'
};
```

### Adjusting Refresh Rate

Change the interval (in milliseconds) at the bottom of the HTML:

```javascript
// Refresh every 5 minutes (300000ms)
setInterval(async () => {
  // ... refresh code
}, 300000);
```

### Styling Customization

All styles are embedded in `<style>` tags in the HTML. Key sections:

- `#double-cover` - Hero carousel styles
- `.breaking-badge` - Breaking news badge
- `@media` queries - Responsive breakpoints

## Cloud Run Configuration

Current settings (modify in `cloudbuild.yaml` or deployment command):

- **Memory**: 512Mi
- **CPU**: 1 vCPU
- **Min Instances**: 0 (scales to zero when not in use)
- **Max Instances**: 10
- **Timeout**: 60s
- **Port**: 8080
- **Concurrency**: 80 requests per instance

### Cost Optimization

Cloud Run only charges when your site is processing requests:
- First 2 million requests/month: FREE
- 400,000 GB-seconds/month: FREE
- Beyond that: ~$0.40 per million requests

With these settings, most small to medium sites run completely free!

## Troubleshooting

### RSS Feeds Not Loading

**Issue**: Breaking news not appearing  
**Solution**: Check browser console for CORS errors. The site uses `rss2json.com` as a CORS proxy. If issues persist:

1. Verify feed URLs are accessible
2. Check feed format (must be valid RSS/Atom)
3. Consider using alternative CORS proxy or backend API

### Cloud Run Deployment Failed

**Issue**: Build or deployment errors  
**Solution**: 

```bash
# Check Cloud Build logs
gcloud builds list --limit=5

# View specific build
gcloud builds log [BUILD_ID]

# Check Cloud Run logs
gcloud run services logs read everybodys-news --region us-central1
```

### Site Not Loading

**Issue**: Cloud Run service returns errors  
**Solution**:

```bash
# Check service status
gcloud run services describe everybodys-news --region us-central1

# View recent logs
gcloud run services logs read everybodys-news --region us-central1 --limit 50
```

## Custom Domain Setup

To use your own domain:

```bash
# 1. Verify domain ownership in GCP Console
# 2. Map domain to Cloud Run service
gcloud run domain-mappings create \
  --service everybodys-news \
  --domain news.yourdomain.com \
  --region us-central1

# 3. Update DNS records as instructed
```

## Security Features

- ✅ CORS headers configured
- ✅ XSS protection enabled
- ✅ Content Security Policy ready
- ✅ HTTPS enforced (Cloud Run default)
- ✅ No sensitive data stored

## Performance Optimizations

- Gzip compression enabled
- Static asset caching (1 day)
- ETags for cache validation
- Optimized Docker image (Alpine Linux)
- Auto-scaling based on traffic

## Monitoring

View real-time metrics in GCP Console:
- **Cloud Run Dashboard** - Request count, latency, errors
- **Cloud Logging** - Application logs
- **Cloud Monitoring** - Custom metrics and alerts

Set up alerts:
```bash
# Example: Alert on high error rate
gcloud monitoring policies create \
  --notification-channels=YOUR_CHANNEL_ID \
  --display-name="High Error Rate" \
  --condition-display-name="Error rate > 5%" \
  ...
```

## Support & Updates

### Updating the Site

```bash
# Make changes to files, then redeploy
gcloud run deploy everybodys-news \
  --source . \
  --region us-central1 \
  --platform managed
```

### Rolling Back

```bash
# List revisions
gcloud run revisions list --service everybodys-news --region us-central1

# Route traffic to previous revision
gcloud run services update-traffic everybodys-news \
  --to-revisions REVISION_NAME=100 \
  --region us-central1
```

## License

MIT License - Free to use and modify

## Credits

Built with:
- Express.js
- Google Cloud Run
- RSS2JSON API
- Unsplash (placeholder images)

---

**Questions?** Check the [GCP Cloud Run documentation](https://cloud.google.com/run/docs) or [open an issue](https://github.com/yourusername/everybodys-news/issues).

## Next Steps After Deployment

1. ✅ Test all RSS feeds are loading
2. ✅ Verify mobile responsiveness
3. ✅ Set up custom domain (optional)
4. ✅ Configure monitoring alerts
5. ✅ Share your news site! 🎉
