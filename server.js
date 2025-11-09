const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const Parser = require('rss-parser');
const axios = require('axios');
const feedsConfig = require('./feeds-config-custom');

const app = express();
const PORT = process.env.PORT || 8080;
const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'media'],
      ['media:thumbnail', 'thumbnail'],
      ['enclosure', 'enclosure'],
      ['dc:creator', 'creator']
    ]
  }
});

// MediaStack API Configuration
const MEDIASTACK_API_KEY = '96759e8f7a664ec0ee650f1fa7043992';
const MEDIASTACK_BASE_URL = 'http://api.mediastack.com/v1/news';

// CORS configuration
app.use(cors());
app.use(express.json());

// Verify public folder exists
const publicPath = path.join(__dirname, 'public');
const indexPath = path.join(publicPath, 'index.html');

console.log('🔍 Checking file system...');
console.log(`📁 Public folder exists: ${fs.existsSync(publicPath)}`);
console.log(`📄 Index.html exists: ${fs.existsSync(indexPath)}`);

// Serve static files from public directory
app.use(express.static(publicPath));

// Get enabled feeds for both carousels
const heroFeeds = feedsConfig.heroFeeds ? feedsConfig.heroFeeds.filter(f => f.enabled) : [];
const rexFeeds = feedsConfig.rexFeeds ? feedsConfig.rexFeeds.filter(f => f.enabled) : [];

console.log(`📡 Hero Carousel: ${heroFeeds.length} feeds`);
console.log(`📡 Rex Carousel: ${rexFeeds.length} feeds`);

// Helper to extract image from RSS item
function extractImage(item) {
  if (item.media && item.media.$) {
    return item.media.$.url;
  }
  if (item.thumbnail && item.thumbnail.$) {
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
      'espn.com': 'ESPN',
      'nbcsports.com': 'NBC Sports',
      'cbssports.com': 'CBS Sports',
      'foxsports.com': 'Fox Sports',
      'nytimes.com': 'New York Times',
      'washingtonpost.com': 'Washington Post',
      'cnn.com': 'CNN',
      'bbc.com': 'BBC News',
      'bbc.co.uk': 'BBC News',
      'msnbc.com': 'MSNBC',
      'reuters.com': 'Reuters',
      'apnews.com': 'AP News',
      'npr.org': 'NPR',
      'foxnews.com': 'Fox News',
      'abcnews.go.com': 'ABC News',
      'cbsnews.com': 'CBS News',
      'nbcnews.com': 'NBC News',
      'usatoday.com': 'USA Today',
      'theguardian.com': 'The Guardian',
      'wsj.com': 'Wall Street Journal',
      'bloomberg.com': 'Bloomberg',
      'forbes.com': 'Forbes',
      'techcrunch.com': 'TechCrunch',
      'theverge.com': 'The Verge',
      'wired.com': 'WIRED',
      'arstechnica.com': 'Ars Technica',
      'sportskeeda.com': 'Sportskeeda',
      'wildcat.arizona.edu': 'Arizona Wildcat',
      'profootballnetwork.com': 'Pro Football Network',
      'atozsports.com': 'A to Z Sports',
      'devilsindetail.com': 'Devils in Detail',
      'hollywoodreporter.com': 'Hollywood Reporter',
      'variety.com': 'Variety',
      'deadline.com': 'Deadline',
      'tmz.com': 'TMZ',
      'eonline.com': 'E! Online'
    };
    
    // Check if we have a mapping for this domain
    for (const [key, value] of Object.entries(sourceMap)) {
      if (domain.includes(key)) {
        return value;
      }
    }
    
    // If no mapping, return a cleaned version of the domain
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
          // Extract actual source from the article link
          const actualSource = extractSourceFromLink(item.link);
          const actualSourceIcon = getFaviconForLink(item.link);
          
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

// MediaStack API integration
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

// MediaStack API endpoints
app.get('/api/mediastack/live-news', async (req, res) => {
  try {
    const {
      sources,
      categories,
      countries,
      languages,
      keywords,
      sort,
      offset,
      limit
    } = req.query;
    
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

// Hero carousel endpoint - uses heroFeeds
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

// Get feed configuration
app.get('/api/config', (req, res) => {
  res.json({
    status: 'success',
    config: {
      refreshInterval: feedsConfig.refreshInterval,
      articlesPerFeed: feedsConfig.articlesPerFeed,
      heroFeeds: heroFeeds.length,
      rexFeeds: rexFeeds.length,
      totalFeeds: heroFeeds.length + rexFeeds.length
    }
  });
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

// Health check
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

// Start server
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`\n🚀 Everybody's News Server`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`📡 Hero Carousel: ${heroFeeds.length} feeds`);
  console.log(`📡 Rex Carousel: ${rexFeeds.length} feeds`);
  console.log(`🔄 Refresh Interval: ${feedsConfig.refreshInterval / 1000}s`);
  console.log(`📰 Hero API: http://localhost:${PORT}/api/news`);
  console.log(`📰 Rex API: http://localhost:${PORT}/api/rex-carousel\n`);
  
  // Initial feed fetch for both carousels
  console.log('🔄 Initial feed fetch...');
  await Promise.all([
    getCachedHeroArticles(),
    getCachedRexArticles()
  ]);
  
  console.log(`✅ Server ready at http://localhost:${PORT}\n`);
});
