const express = require('express');
const cors = require('cors');
const axios = require('axios');
const xml2js = require('xml2js');

const app = express();
const PORT = process.env.PORT || 8080;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MediaStack API Configuration
const MEDIASTACK_API_KEY = '96759e8f7a664ec0ee650f1fa7043992';
const MEDIASTACK_BASE_URL = 'http://api.mediastack.com/v1/news';

// RSS Feed URLs
const RSS_FEEDS = {
  sports: 'https://www.espn.com/espn/rss/news',
  world: 'https://feeds.feedburner.com/daily-news/world',
  technology: 'https://feeds.feedburner.com/daily-news/technology',
  abc: 'http://feeds.abcnews.com/abcnews/topstories'
};

// Parse RSS feed
async function parseRSSFeed(url) {
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const parser = new xml2js.Parser({
      explicitArray: false,
      ignoreAttrs: false
    });
    
    const result = await parser.parseStringPromise(response.data);
    
    // Handle different RSS formats
    const items = result.rss?.channel?.item || result.feed?.entry || [];
    const itemArray = Array.isArray(items) ? items : [items];
    
    return itemArray.slice(0, 10).map(item => ({
      title: item.title?._text || item.title || 'No title',
      description: item.description?._text || item.description || item.summary || 'No description',
      link: item.link?._ || item.link?.href || item.link || '#',
      pubDate: item.pubDate || item.published || new Date().toISOString(),
      image: extractImage(item)
    }));
  } catch (error) {
    console.error(`Error parsing RSS feed ${url}:`, error.message);
    return [];
  }
}

// Extract image from RSS item
function extractImage(item) {
  // Try different image fields
  if (item['media:content']?.$ && item['media:content'].$.url) {
    return item['media:content'].$.url;
  }
  if (item['media:thumbnail']?.$ && item['media:thumbnail'].$.url) {
    return item['media:thumbnail'].$.url;
  }
  if (item.enclosure?.$ && item.enclosure.$.url) {
    return item.enclosure.$.url;
  }
  
  // Try to extract image from description
  const description = item.description || item.content || '';
  const imgMatch = description.match(/<img[^>]+src="([^">]+)"/);
  if (imgMatch) {
    return imgMatch[1];
  }
  
  return 'https://via.placeholder.com/800x400/333/fff?text=News';
}

// Fetch MediaStack API news
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
        pubDate: article.published_at || new Date().toISOString(),
        image: article.image || 'https://via.placeholder.com/800x400/333/fff?text=News',
        source: article.source || 'Unknown',
        category: article.category || 'general'
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching MediaStack news:', error.message);
    return [];
  }
}

// API Endpoints

// Get all RSS feeds
app.get('/api/feeds/all', async (req, res) => {
  try {
    const [sports, world, technology, abc] = await Promise.all([
      parseRSSFeed(RSS_FEEDS.sports),
      parseRSSFeed(RSS_FEEDS.world),
      parseRSSFeed(RSS_FEEDS.technology),
      parseRSSFeed(RSS_FEEDS.abc)
    ]);
    
    res.json({
      sports,
      world,
      technology,
      abc
    });
  } catch (error) {
    console.error('Error fetching all feeds:', error);
    res.status(500).json({ error: 'Failed to fetch feeds' });
  }
});

// Get Sports news
app.get('/api/feeds/sports', async (req, res) => {
  try {
    const news = await parseRSSFeed(RSS_FEEDS.sports);
    res.json(news);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sports news' });
  }
});

// Get World news
app.get('/api/feeds/world', async (req, res) => {
  try {
    const news = await parseRSSFeed(RSS_FEEDS.world);
    res.json(news);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch world news' });
  }
});

// Get Technology news
app.get('/api/feeds/technology', async (req, res) => {
  try {
    const news = await parseRSSFeed(RSS_FEEDS.technology);
    res.json(news);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch technology news' });
  }
});

// Get ABC News
app.get('/api/feeds/abc', async (req, res) => {
  try {
    const news = await parseRSSFeed(RSS_FEEDS.abc);
    res.json(news);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch ABC news' });
  }
});

// Get Live news from MediaStack
app.get('/api/live-news', async (req, res) => {
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
    res.json(news);
  } catch (error) {
    console.error('Error fetching live news:', error);
    res.status(500).json({ error: 'Failed to fetch live news' });
  }
});

// Get Breaking news (MediaStack with specific parameters)
app.get('/api/breaking-news', async (req, res) => {
  try {
    const news = await fetchMediaStackNews({
      sources: 'cnn,bbc',
      sort: 'published_desc',
      limit: 20
    });
    res.json(news);
  } catch (error) {
    console.error('Error fetching breaking news:', error);
    res.status(500).json({ error: 'Failed to fetch breaking news' });
  }
});

// Get Business news
app.get('/api/business-news', async (req, res) => {
  try {
    const news = await fetchMediaStackNews({
      categories: 'business',
      countries: 'us',
      limit: 15
    });
    res.json(news);
  } catch (error) {
    console.error('Error fetching business news:', error);
    res.status(500).json({ error: 'Failed to fetch business news' });
  }
});

// Get Sports news from MediaStack
app.get('/api/sports-news', async (req, res) => {
  try {
    const news = await fetchMediaStackNews({
      categories: 'sports',
      countries: 'us',
      limit: 15
    });
    res.json(news);
  } catch (error) {
    console.error('Error fetching sports news:', error);
    res.status(500).json({ error: 'Failed to fetch sports news' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access at http://localhost:${PORT}`);
});
