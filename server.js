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
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  }
});

// =================================================================
// 🚨 CRITICAL FIX: Defined feedsConfig variable
// =================================================================

const feedsConfig = {
  // How many articles to fetch from each feed
  articlesPerFeed: 10,
  
  // Auto-refresh interval on frontend (milliseconds)
  refreshInterval: 180000, // 3 minutes
  
  // HERO CAROUSEL FEEDS (Top full-screen carousel)
  heroFeeds: [
    {
      url: 'https://rss.app/feeds/tUqVtqZPdYfXDvOb.xml',
      category: 'BREAKING NEWS',
      source: 'Hero Feed 1',
      sourceIcon: 'https://www.google.com/s2/favicons?domain=rss.app&sz=32',
      enabled: true
    },
    {
      url: 'https://rss.app/feeds/tUo3SJ8AHWweCZGH.xml',
      category: 'BREAKING NEWS',
      source: 'Hero Feed 2',
      sourceIcon: 'https://www.google.com/s2/favicons?domain=rss.app&sz=32',
      enabled: true
    },
    {
      url: 'https://rss.app/feeds/tBLoUxhBvRIBKfsK.xml',
      category: 'BREAKING NEWS',
      source: 'Hero Feed 3',
      sourceIcon: 'https://www.google.com/s2/favicons?domain=rss.app&sz=32',
      enabled: true
    },
    {
      url: 'https://rss.app/feeds/tN6TfKaJzhcPYYkB.xml',
      category: 'BREAKING NEWS',
      source: 'Hero Feed 4',
      sourceIcon: 'https://www.google.com/s2/favicons?domain=rss.app&sz=32',
      enabled: true
    }
  ],
  
  // REX CAROUSEL FEEDS (Horizontal carousel below hero)
  rexFeeds: [
    {
      url: 'https://rss.app/feeds/t9YE5uF7k6PbmNn7.xml',
      category: 'BREAKING NEWS',
      source: 'Rex Feed 1',
      sourceIcon: 'https://www.google.com/s2/favicons?domain=rss.app&sz=32',
      enabled: true
    },
    {
      url: 'https://rss.app/feeds/t23WWkbxOWm3y6t9.xml',
      category: 'BREAKING NEWS',
      source: 'Rex Feed 2',
      sourceIcon: 'https://www.google.com/s2/favicons?domain=rss.app&sz=32',
      enabled: true
    },
    {
      url: 'https://rss.app/feeds/tFILwOrbAZf3SkTa.xml',
      category: 'BREAKING NEWS',
      source: 'Rex Feed 3',
      sourceIcon: 'https://www.google.com/s2/favicons?domain=rss.app&sz=32',
      enabled: true
    },
    // ABC News feed added to Rex Carousel as requested
    {
      url: 'http://feeds.abcnews.com/abcnews/topstories',
      category: 'ABC NEWS',
      source: 'ABC News',
      sourceIcon: 'https://www.google.com/s2/favicons?domain=abcnews.go.com&sz=32',
      enabled: true
    }
  ]
};

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

console.log('🔍 Checking file system...');
// The log statements below assume index.html is in the root directory
console.log(`📁 Public folder exists: ${fs.existsSync(publicPath)}`);
console.log(`📄 Index.html exists: ${fs.existsSync(indexPath)}`);

// Serve static files from the root directory
app.use(express.static(publicPath));

// Get enabled feeds for both carousels
const heroFeeds = feedsConfig.heroFeeds ? feedsConfig.heroFeeds.filter(f => f.enabled) : [];
const rexFeeds = feedsConfig.rexFeeds ? feedsConfig.rexFeeds.filter(f => f.enabled) : [];

console.log(`📡 Hero Carousel: ${heroFeeds.length} feeds`);
console.log(`📡 Rex Carousel: ${rexFeeds.length} feeds`);


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
    
    // Map common domains to readable names
    const sourceMap = {
      'nytimes.com': 'New York Times',
      'abcnews.go.com': 'ABC News',
      'cnn.com': 'CNN',
      'bbc.com': 'BBC News',
      // Add more as needed
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
  const startTime = Date.now();
  
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
      console.log(`  ✓ ${feedType} - ${actualSource || feed.source}: ${articles.length} articles`);
    } catch (error) {
      console.error(`  ✗ ${feedType} - ${feed.source}: ${error.message}`);
    }
  }
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`✨ ${feedType}: Fetched ${allArticles.length} articles in ${duration}s`);
  
  return allArticles;
}

// Separate caches for hero and rex carousels
let heroArticlesCache = [];
let heroLastFetch = 0;
let rexArticlesCache = [];
let rexLastFetch = 0;
const CACHE_DURATION = 180000; // 3 minutes

// Get cached hero articles
async function getCachedHeroArticles() {
  const now = Date.now();
  
  if (heroArticlesCache.length > 0 && (now - heroLastFetch) < CACHE_DURATION) {
    console.log('📦 Serving cached hero articles');
    return heroArticlesCache;
  }
  
  console.log('🆕 Fetching fresh hero articles...');
  const articles = await fetchRSSFeeds(heroFeeds, 'Hero Feeds');
  
  if (articles.length > 0) {
    heroArticlesCache = articles;
    heroLastFetch = now;
    return articles;
  }
  
  if (heroArticlesCache.length > 0) {
    console.log('⚠️ Hero fetch failed, serving stale cache');
    return heroArticlesCache;
  }
  
  return [];
}

// Get cached rex articles
async function getCachedRexArticles() {
  const now = Date.now();
  
  if (rexArticlesCache.length > 0 && (now - rexLastFetch) < CACHE_DURATION) {
    console.log('📦 Serving cached rex articles');
    return rexArticlesCache;
  }
  
  console.log('🆕 Fetching fresh rex articles...');
  const articles = await fetchRSSFeeds(rexFeeds, 'Rex Feeds');
  
  if (articles.length > 0) {
    rexArticlesCache = articles;
    rexLastFetch = now;
    return articles;
  }
  
  if (rexArticlesCache.length > 0) {
    console.log('⚠️ Rex fetch failed, serving stale cache');
    return rexArticlesCache;
  }
  
  return [];
}


// =================================================================
// API ENDPOINTS
// =================================================================

// Hero carousel endpoint - uses heroFeeds (mapped to /api/news for existing frontend JS)
app.get('/api/news', async (req, res) => {
  try {
    const articles = await getCachedHeroArticles();
    
    if (articles.length > 0) {
      const shuffled = [...articles].sort(() => 0.5 - Math.random());
      const topStories = shuffled.slice(0, 8);
      
      res.json({
        status: 'success',
        articles: topStories,
        totalResults: topStories.length,
        source: 'hero-feeds',
        cached: (Date.now() - heroLastFetch) < CACHE_DURATION,
        cacheAge: Math.floor((Date.now() - heroLastFetch) / 1000)
      });
      return;
    }
    
    res.json({
      status: 'error',
      message: 'No articles available',
      articles: []
    });
  } catch (error) {
    console.error('❌ Error in /api/news:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch news'
    });
  }
});

// Rex carousel endpoint - uses rexFeeds
app.get('/api/rex-carousel', async (req, res) => {
  try {
    const articles = await getCachedRexArticles();
    
    if (articles.length > 0) {
      const sorted = [...articles].sort((a, b) => 
        new Date(b.pubDate) - new Date(a.pubDate)
      );
      const carouselItems = sorted.slice(0, 12);
      
      res.json({
        status: 'success',
        articles: carouselItems,
        totalResults: carouselItems.length,
        source: 'rex-feeds'
      });
      return;
    }
    
    res.json({
      status: 'error',
      message: 'No articles available',
      articles: []
    });
  } catch (error) {
    console.error('❌ Error in /api/rex-carousel:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch carousel news'
    });
  }
});

// Get all articles from both carousels
app.get('/api/news/all', async (req, res) => {
  try {
    const heroArticles = await getCachedHeroArticles();
    const rexArticles = await getCachedRexArticles();
    const allArticles = [...heroArticles, ...rexArticles];
    
    res.json({
      status: 'success',
      articles: allArticles,
      totalResults: allArticles.length,
      hero: heroArticles.length,
      rex: rexArticles.length
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch all news'
    });
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
    console.error('Error fetching MediaStack news:', error.message);
    return [];
  }
}

// MediaStack Live News endpoint - supports all parameters
app.get('/api/mediastack/live-news', async (req, res) => {
  try {
    const { sources, categories, countries, languages, keywords, sort, offset, limit } = req.query;
    
    const params = {};
    if (sources) params.sources = sources;
    if (categories) params.categories = categories;
    if (countries) params.countries = countries;
    if (languages) params.languages = languages;
    if (keywords) params.keywords = keywords;
    if (sort) params.sort = sort;
    if (offset) params.offset = parseInt(offset);
    if (limit) params.limit = parseInt(limit);
    
    const news = await fetchMediaStackNews(params);
    res.json({
      status: 'success',
      articles: news,
      totalResults: news.length,
      source: 'mediastack-api'
    });
  } catch (error) {
    console.error('Error in /api/mediastack/live-news:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch live news'
    });
  }
});

// MediaStack Breaking News endpoint - pre-configured
app.get('/api/mediastack/breaking-news', async (req, res) => {
  try {
    const news = await fetchMediaStackNews({
      sources: 'cnn,bbc',
      sort: 'published_desc',
      limit: 20
    });
    res.json({
      status: 'success',
      articles: news,
      totalResults: news.length,
      source: 'mediastack-breaking'
    });
  } catch (error) {
    console.error('Error in /api/mediastack/breaking-news:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch breaking news'
    });
  }
});

// Force refresh cache
app.post('/api/refresh', async (req, res) => {
  console.log('🔄 Manual refresh requested');
  heroArticlesCache = [];
  heroLastFetch = 0;
  rexArticlesCache = [];
  rexLastFetch = 0;
  
  const heroArticles = await getCachedHeroArticles();
  const rexArticles = await getCachedRexArticles();
  
  res.json({
    status: 'success',
    message: 'Cache refreshed',
    heroArticles: heroArticles.length,
    rexArticles: rexArticles.length
  });
});

// Serve the main HTML file
app.get('/', (req, res) => {
  if (!fs.existsSync(indexPath)) {
    console.error('❌ index.html not found!');
    return res.status(404).send(`
      <h1>Error: index.html not found</h1>
      <p>Expected location: ${indexPath}</p>
    `);
  }
  
  res.sendFile(indexPath);
});

// Health check (used by Cloud Run)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    uptime: process.uptime(),
    heroFeeds: heroFeeds.length,
    rexFeeds: rexFeeds.length,
    heroCached: heroArticlesCache.length,
    rexCached: rexArticlesCache.length,
    publicFolderExists: fs.existsSync(publicPath),
    indexExists: fs.existsSync(indexPath)
  });
});

const PORT = process.env.PORT || 8080;

// Start server
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`\n🚀 Everybody's News Server`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`📡 Hero Carousel: ${heroFeeds.length} feeds`);
  console.log(`📡 Rex Carousel: ${rexFeeds.length} feeds`);
  console.log(`🔄 Refresh Interval: ${feedsConfig.refreshInterval / 1000}s`);
  console.log(`📰 Hero API: http://localhost:${PORT}/api/news`);
  console.log(`📰 Rex API: http://localhost:${PORT}/api/rex-carousel\n`);
  
  // Set up background refresh
  const REFRESH_MS = feedsConfig.refreshInterval || 180000;
  
  setInterval(async () => {
    try {
      console.log('⏱️ Background refresh starting…');
      heroArticlesCache = [];
      heroLastFetch = 0;
      rexArticlesCache = [];
      rexLastFetch = 0;
      await Promise.all([ getCachedHeroArticles(), getCachedRexArticles() ]);
      console.log('✅ Background refresh complete');
    } catch (e) {
      console.error('Background refresh failed:', e.message);
    }
  }, REFRESH_MS);
  
  // Initial feed fetch (must happen *after* app.listen or server won't be ready)
  console.log('🔄 Initial feed fetch...');
  await Promise.all([
    getCachedHeroArticles(),
    getCachedRexArticles()
  ]);
  
  console.log(`✅ Server ready at http://localhost:${PORT}\n`);
});