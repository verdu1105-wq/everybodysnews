# Everybody's News

A modern news aggregation website that displays current news from multiple sources using RSS feeds and the MediaStack API, featuring interactive carousels with the Rex theme.

## 🚀 Features

- **Breaking News Carousel**: Live news from CNN and BBC via MediaStack API
- **ABC News Carousel**: Top stories from ABC News RSS feed (Rex carousel with adjusted height/padding)
- **Sports News Carousel**: Latest sports updates from ESPN
- **World News Carousel**: Global news coverage
- **Technology News Carousel**: Tech industry updates
- **Auto-rotating Carousels**: Automatic slide transitions every 5 seconds
- **Touch/Swipe Support**: Mobile-friendly navigation
- **Keyboard Navigation**: Use arrow keys to navigate
- **Responsive Design**: Optimized for all screen sizes
- **Live Updates**: Auto-refresh every 5 minutes

## 📋 Changes Made

### 1. Feed Updates
- ✅ **Removed**: NY Times U.S. News feed
- ✅ **Added**: ABC News Top Stories feed (`http://feeds.abcnews.com/abcnews/topstories`)
- ✅ **Added**: MediaStack API integration for live breaking news

### 2. Rex Carousel Adjustments
The second carousel (ABC News) now features:
- **Height**: Reduced from 600px to 500px (450px on tablets, 400px on mobile)
- **Padding**: Adjusted from 2rem to 1.5rem (1rem on tablets, 0.5rem on mobile)
- **Content Padding**: Optimized spacing for better readability

### 3. MediaStack API Integration
API Key: `96759e8f7a664ec0ee650f1fa7043992`

#### Available Endpoints:
- `/api/live-news` - General live news with custom parameters
- `/api/breaking-news` - Breaking news from CNN and BBC
- `/api/business-news` - Business category news
- `/api/sports-news` - Sports category news from MediaStack

#### Supported Parameters:
- `sources` - News sources (e.g., cnn,bbc)
- `categories` - News categories (e.g., business, sports)
- `countries` - Country codes (e.g., us, au)
- `languages` - Language codes (e.g., en)
- `keywords` - Search keywords
- `sort` - Sort order (published_desc)
- `offset` - Pagination offset
- `limit` - Results limit (max 100)

## 🛠️ Installation

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Docker (for containerization)
- Google Cloud SDK (for deployment)

### Local Development

1. **Clone the repository**:
```bash
git clone https://github.com/verdu1105-wq/everybodysnews.git
cd everybodysnews
```

2. **Install dependencies**:
```bash
npm install
```

3. **Start the development server**:
```bash
npm start
```

4. **Access the application**:
Open your browser to `http://localhost:8080`

## 🐳 Docker Deployment

### Build Docker Image
```bash
docker build -t everybodysnews .
```

### Run Docker Container Locally
```bash
docker run -p 8080:8080 everybodysnews
```

### Test the Container
```bash
curl http://localhost:8080/health
```

## ☁️ Google Cloud Run Deployment

### 1. Build and Push to Google Container Registry
```bash
# Set your project ID
gcloud config set project cybergrid

# Build and push the image
gcloud builds submit --tag gcr.io/cybergrid/everybodysnews

# Alternative: Build locally and push
docker build -t gcr.io/cybergrid/everybodysnews .
docker push gcr.io/cybergrid/everybodysnews
```

### 2. Deploy to Cloud Run
```bash
gcloud run deploy everybodys-news-app \
  --image gcr.io/cybergrid/everybodysnews \
  --platform managed \
  --region us-east1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10
```

### 3. Get the Deployment URL
```bash
gcloud run services describe everybodys-news-app \
  --platform managed \
  --region us-east1 \
  --format 'value(status.url)'
```

## 🔄 Update Deployment

### Push Changes to GitHub
```bash
git add .
git commit -m "Your commit message"
git push origin main
```

### Rebuild and Redeploy
```bash
# Build new image
gcloud builds submit --tag gcr.io/cybergrid/everybodysnews

# Deploy updated image
gcloud run deploy everybodys-news-app \
  --image gcr.io/cybergrid/everybodysnews \
  --platform managed \
  --region us-east1
```

## 📁 Project Structure

```
everybodysnews/
├── server.js           # Node.js Express server
├── index.html          # Main HTML file
├── style.css           # CSS with Rex carousel adjustments
├── carousel.js         # Carousel functionality and API calls
├── package.json        # Node.js dependencies
├── Dockerfile          # Docker configuration
├── .dockerignore       # Docker ignore rules
└── README.md           # This file
```

## 🔌 API Endpoints

### RSS Feed Endpoints
- `GET /api/feeds/all` - All RSS feeds combined
- `GET /api/feeds/sports` - ESPN Sports news
- `GET /api/feeds/world` - World news
- `GET /api/feeds/technology` - Technology news
- `GET /api/feeds/abc` - ABC News top stories

### MediaStack API Endpoints
- `GET /api/live-news` - Live news with custom parameters
- `GET /api/breaking-news` - Breaking news from major sources
- `GET /api/business-news` - Business news
- `GET /api/sports-news` - Sports news

### Health Check
- `GET /health` - Server health status

## 🎨 Rex Carousel Customization

The Rex carousel (second carousel) uses custom CSS with:

```css
.carousel-section.rex-carousel .carousel-wrapper {
  height: 500px;           /* Desktop */
  padding: 1.5rem;
}

/* Tablet: 450px height, 1rem padding */
/* Mobile: 400px height, 0.5rem padding */
```

To further customize, edit the `.rex-carousel` class in `style.css`.

## 🔧 Configuration

### MediaStack API Key
The API key is configured in `server.js`:
```javascript
const MEDIASTACK_API_KEY = '96759e8f7a664ec0ee650f1fa7043992';
```

### RSS Feed URLs
Feed URLs are configured in `server.js`:
```javascript
const RSS_FEEDS = {
  sports: 'https://www.espn.com/espn/rss/news',
  world: 'https://feeds.feedburner.com/daily-news/world',
  technology: 'https://feeds.feedburner.com/daily-news/technology',
  abc: 'http://feeds.abcnews.com/abcnews/topstories'
};
```

## 🐛 Troubleshooting

### CORS Issues
The server includes CORS middleware to handle cross-origin requests. If you encounter CORS errors, check that the server is running correctly.

### Feed Not Loading
- Check internet connectivity
- Verify RSS feed URLs are accessible
- Check server logs for error messages
- Ensure MediaStack API key is valid

### Deployment Issues
- Ensure Docker is installed and running
- Verify Google Cloud SDK is authenticated
- Check Cloud Run service logs: `gcloud run logs read everybodys-news-app`

## 📊 Performance

- **Auto-refresh**: News updates every 5 minutes
- **Carousel rotation**: Automatic slide transition every 5 seconds
- **Pause on hover**: Carousels pause when user hovers
- **Responsive images**: Images optimized for different screen sizes

## 🔐 Security Notes

- MediaStack API key is included in server-side code only
- No API keys exposed to client-side JavaScript
- CORS configured for security
- External links open in new tabs with security attributes

## 📝 License

ISC License

## 👨‍💻 Author

Vern

## 🌐 Live URL

https://everybodys-news-app-974184310088.us-east1.run.app

## 📞 Support

For issues or questions, please open an issue on GitHub.
