const express = require('express');
const Parser = require('rss-parser');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const fs = require('fs');
const { URL } = require('url'); 

const app = express();
const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit=537.36'
  }
});

// =================================================================
// FEEDS CONFIGURATION & DEFINITIONS (CRASH FIX: Defined in file)
// =================================================================
const feedsConfig = {
  articlesPerFeed: 20, 
  refreshInterval: 21600000, // 6 hours
  
  heroFeeds: [
    { url: 'https://rss.app/feeds/tUqVtqZPdYfXDvOb.xml', category: 'BREAKING NEWS', source: 'Hero Feed 1', sourceIcon: 'https://www.google.com/s2/favicons?domain=rss.app&sz=32', enabled: true },
    { url: 'https://rss.app/feeds/tUo3SJ8AHWweCZGH.xml', category: 'BREAKING NEWS', source: 'Hero Feed 2', sourceIcon: 'https://www.google.com/s2/favicons?domain=rss.app&sz=32', enabled: true },
    { url: 'https://rss.app/feeds/tzd0p7jgUZ0rydym.xml', category: 'TRENDING NEWS', source: 'Trending News Wire', sourceIcon: 'https://www.google.com/s2/favicons?domain=rss.app&sz=32', enabled: true },
    { url: 'https://rss.app/feeds/tN6TfKaJzhcPYYkB.xml', category: 'BREAKING NEWS', source: 'Hero Feed 4', sourceIcon: 'https://www.google.com/s2/favicons?domain=rss.app&sz=32', enabled: true }
  ],
  
  rexFeeds: [
    { url: 'https://rss.app/feeds/t9YE5uF7k6PbmNn7.xml', category: 'SPORTS NEWS', source: 'Rex Feed 1', sourceIcon: 'https://www.google.com/s2/favicons?domain=rss.app&sz=32', enabled: true },
    { url: 'https://rss.app/feeds/tOMVwoo9puEGj8Fe.xml', category: 'COLLEGE SPORTS', source: 'College Sports', sourceIcon: 'https://www.google.com/s2/favicons?domain=rss.app&sz=32', enabled: true },
    { url: 'https://www.espn.com/espn/rss/news', category: 'GENERAL SPORTS', source: 'ESPN Sports', sourceIcon: 'https://www.google.com/s2/favicons?domain=espn.com&sz=32', enabled: true },
    { url: 'http://feeds.abcnews.com/abcnews/topstories', category: 'ABC NEWS', source: 'ABC News', sourceIcon: 'https://www.google.com/s2/favicons?domain=abcnews.go.com&sz=32', enabled: true }
  ]
};
const CACHE_DURATION = feedsConfig.refreshInterval;
// =================================================================


// =================================================================
// MediaStack API Configuration
// =================================================================
const MEDIASTACK_API_KEY = '96759e8f7a664ec0ee650f1fa7043992';
const MEDIASTACK_BASE_URL = 'http://api.mediastack.com/v1/news';

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Set correct paths for Cloud Run deployment (using root directory)
const publicPath = path.join(__dirname, '.'); 
const indexPath = path.join(publicPath, 'index.html');

// Serve static files from the root directory
app.use(express.static(publicPath));

// Get enabled feeds for both carousels
const heroFeeds = feedsConfig.heroFeeds ? feedsConfig.heroFeeds.filter(f => f.enabled) : [];
const rexFeeds = feedsConfig.rexFeeds ? feedsConfig.rexFeeds.filter(f => f.enabled) : [];

// =================================================================
// HELPER FUNCTIONS 
// =================================================================

// Helper to extract image from RSS item
function extractImage(item) {
  if (item.media && item.media.$ && item.media.$.url) {
    return item.media.$.url;
  }
  if (item.thumbnail && item.thumbnail.$ && item.thumbnail.$.url) {
    return item.thumbnail.$.url;
  }
  if (item.enclosure && item.enclosure.url) {
    return item.enclosure.url;
  }
  const content = item['content:encoded'] || item.content || item.description || '';
  const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
  if (imgMatch) {
    return imgMatch[1];
  }
  return null;
}

// Helper to extract actual source from article link
function extractSourceFromLink(link) {
  if (!link) return 'News Source';
  
  try {
    const url = new URL(link);
    const domain = url.hostname.replace('www.', '');
    
    const sourceMap = {
      'nytimes.com': 'New York Times',
      'abcnews.go.com': 'ABC News',
      'cnn.com': 'CNN',
      'bbc.com': 'BBC News',
      'foxsports.com': 'Fox Sports',
      'espn.com': 'ESPN'
    };
    
    for (const [key, value] of Object.entries(sourceMap)) {
      if (domain.includes(key)) {
        return value;
      }
    }
    
    const parts = domain.split('.');
    if (parts.length >= 2) {
      const name = parts[parts.length - 2];
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
    
    return domain;
  } catch (error) {
    return 'News Source';
  }
}

// Helper to get favicon for a link
function getFaviconForLink(link) {
  if (!link) return 'https://www.google.com/s2/favicons?domain=rss.app&sz=32';
  
  try {
    const url = new URL(link);
    const domain = url.hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch (error) {
    return 'https://www.google.com/s2/favicons?domain=rss.app&sz=32';
  }
}

// Fetch RSS feeds from a specific list
async function fetchRSSFeeds(feedsList, feedType = 'feeds') {
  console.log(`🔄 Fetching ${feedType}...`);
  const allArticles = [];
  
  for (const feed of feedsList) {
    try {
      const feedData = await parser.parseURL(feed.url);
      
      const articles = feedData.items
        .slice(0, feedsConfig.articlesPerFeed)
        .map(item => {
          const actualSource = extractSourceFromLink(item.link || feed.url);
          const actualSourceIcon = getFaviconForLink(item.link || feed.url);
          
          return {
            title: item.title,
            description: item.contentSnippet || item.description || '',
            link: item.link,
            category: feed.category,
            author: item.creator || actualSource,
            pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
            imageUrl: extractImage(item),
            source: actualSource,
            sourceIcon: actualSourceIcon
          };
        });
      
      allArticles.push(...articles);
    } catch (error) {
      console.error(`  ✗ ${feedType} - ${feed.source}: ${error.message}`);
    }
  }
  
  return allArticles;
}

// Separate caches for hero and rex carousels
let heroArticlesCache = [];
let heroLastFetch = 0;
let rexArticlesCache = [];
let rexLastFetch = 0;
const CACHE_DURATION = 21600000; // 6 hours

// Get cached hero articles
async function getCachedHeroArticles() {
  const now = Date.now();
  if (heroArticlesCache.length > 0 && (now - heroLastFetch) < CACHE_DURATION) {
    return heroArticlesCache;
  }
  const articles = await fetchRSSFeeds(heroFeeds, 'Hero Feeds');
  if (articles.length > 0) {
    heroArticlesCache = articles;
    heroLastFetch = now;
    return articles;
  }
  return heroArticlesCache.length > 0 ? heroArticlesCache : [];
}

// Get cached rex articles
async function getCachedRexArticles() {
  const now = Date.now();
  if (rexArticlesCache.length > 0 && (now - rexLastFetch) < CACHE_DURATION) {
    return rexArticlesCache;
  }
  const articles = await fetchRSSFeeds(rexFeeds, 'Rex Feeds');
  if (articles.length > 0) {
    rexArticlesCache = articles;
    rexLastFetch = now;
    return articles;
  }
  return rexArticlesCache.length > 0 ? rexArticlesCache : [];
}


// =================================================================
// API ENDPOINTS
// =================================================================

// Hero carousel endpoint 
app.get('/api/news', async (req, res) => {
  try {
    const articles = await getCachedHeroArticles();
    if (articles.length > 0) {
      const shuffled = [...articles].sort(() => 0.5 - Math.random());
      const topStories = shuffled.slice(0, 8);
      return res.json({ status: 'success', articles: topStories, source: 'hero-feeds' });
    }
    res.json({ status: 'error', message: 'No articles available', articles: [] });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch news' });
  }
});

// Rex carousel endpoint (Used for Rex Carousel AND Sports Section)
app.get('/api/rex-carousel', async (req, res) => {
  try {
    const articles = await getCachedRexArticles();
    if (articles.length > 0) {
      const sorted = [...articles].sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
      const carouselItems = sorted.slice(0, 12);
      return res.json({ status: 'success', articles: carouselItems, source: 'rex-feeds' });
    }
    res.json({ status: 'error', message: 'No articles available', articles: [] });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch carousel news' });
  }
});

// MediaStack API Integration - Function and Endpoints
async function fetchMediaStackNews(params = {}) {
  try {
    const defaultParams = {
      access_key: MEDIASTACK_API_KEY,
      languages: 'en',
      sort: 'published_desc',
      limit: 10,
      ...params
    };
    
    const response = await axios.get(MEDIASTACK_BASE_URL, {
      params: defaultParams,
      timeout: 10000
    });
    
    if (response.data && response.data.data) {
      return response.data.data.map(article => ({
        title: article.title || 'No title',
        description: article.description || 'No description',
        link: article.url || '#',
        category: article.category ? article.category.toUpperCase() : 'NEWS',
        author: article.source || 'MediaStack',
        pubDate: article.published_at || new Date().toISOString(),
        imageUrl: article.image || null,
        source: article.source || 'Unknown',
        sourceIcon: article.source ? `https://www.google.com/s2/favicons?domain=${article.source}&sz=32` : null
      }));
    }
    return [];
  } catch (error) {
    return [];
  }
}

// MediaStack Live News endpoint - supports all parameters
app.get('/api/mediastack/live-news', async (req, res) => {
  try {
    const news = await fetchMediaStackNews(req.query);
    res.json({ status: 'success', articles: news, source: 'mediastack-api' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch live news' });
  }
});

// Serve the main HTML file
app.get('/', (req, res) => {
  if (!fs.existsSync(indexPath)) {
    return res.status(404).send(`<h1>Error: index.html not found</h1>`);
  }
  res.sendFile(indexPath);
});

// Health check (includes MediaStack check)
app.get('/health', async (req, res) => {
  let mediastackStatus = 'n/a';
  try {
    const testResponse = await axios.get(MEDIASTACK_BASE_URL, {
      params: { access_key: MEDIASTACK_API_KEY, limit: 1 },
      timeout: 2000
    });
    mediastackStatus = (testResponse.status === 200) ? 'ok' : `Error: ${testResponse.status}`;
  } catch (e) {
    mediastackStatus = `Failed: ${e.code}`;
  }
  
  res.status(200).json({ 
    status: 'healthy',
    uptime: process.uptime(),
    mediastackStatus: mediastackStatus,
    heroCached: heroArticlesCache.length,
    rexCached: rexArticlesCache.length,
  });
});

const PORT = process.env.PORT || 8080;

// Start server (Final working setup)
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`\n🚀 Everybody's News Server running on port: ${PORT}\n`);
  
  // Set up background refresh
  const REFRESH_MS = feedsConfig.refreshInterval || 180000;
  
  setInterval(async () => {
    try {
      await Promise.all([ getCachedHeroArticles(), getCachedRexArticles() ]);
    } catch (e) {
      console.error('Background refresh failed:', e.message);
    }
  }, REFRESH_MS);
  
  // Initial feed fetch (must happen *after* app.listen or server won't be ready)
  await Promise.all([ getCachedHeroArticles(), getCachedRexArticles() ]);
  console.log(`✅ Server ready.\n`);
});