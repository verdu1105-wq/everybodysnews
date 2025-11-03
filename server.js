const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// CORS configuration
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Mock news data based on current events (November 1, 2025)
const mockNewsData = {
  worldSeries: [
    {
      title: "Dodgers Force Game 7 with Dramatic Victory Over Blue Jays",
      description: "Los Angeles Dodgers defeat Toronto Blue Jays 3-1 in Game 6, forcing decisive Game 7 tonight at Rogers Centre.",
      category: "SPORTS",
      author: "MLB News Wire",
      pubDate: new Date().toISOString(),
      imageUrl: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=1920&q=80",
      source: "ESPN",
      sourceIcon: "https://www.google.com/s2/favicons?domain=espn.com&sz=32"
    },
    {
      title: "World Series Game 7: Dodgers vs Blue Jays Tonight at 8 PM ET",
      description: "Historic Game 7 showdown as defending champion Dodgers face Blue Jays seeking first title in 32 years.",
      category: "SPORTS",
      author: "Sports Desk",
      pubDate: new Date(Date.now() - 3600000).toISOString(),
      imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1920&q=80",
      source: "ESPN",
      sourceIcon: "https://www.google.com/s2/favicons?domain=espn.com&sz=32"
    }
  ],
  snap: [
    {
      title: "42 Million Americans Face SNAP Benefits Delay Amid Government Shutdown",
      description: "Federal judges order emergency funding as November food assistance payments remain suspended for millions of families.",
      category: "US NEWS",
      author: "Policy Reporter",
      pubDate: new Date(Date.now() - 7200000).toISOString(),
      imageUrl: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1920&q=80",
      source: "New York Times",
      sourceIcon: "https://www.google.com/s2/favicons?domain=nytimes.com&sz=32"
    },
    {
      title: "Food Banks Brace for Crisis as SNAP Cliff Takes Effect",
      description: "Emergency food assistance networks prepare for surge in demand as government shutdown disrupts benefit payments.",
      category: "US NEWS",
      author: "Social Services Beat",
      pubDate: new Date(Date.now() - 10800000).toISOString(),
      imageUrl: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1920&q=80",
      source: "New York Times",
      sourceIcon: "https://www.google.com/s2/favicons?domain=nytimes.com&sz=32"
    }
  ],
  immigration: [
    {
      title: "DHS Announces Record Deportation Numbers: Over 500,000 Removed",
      description: "Trump administration reports historic deportation figures with 1.6 million self-deportations since January.",
      category: "US NEWS",
      author: "Immigration Correspondent",
      pubDate: new Date(Date.now() - 14400000).toISOString(),
      imageUrl: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1920&q=80",
      source: "World News Network",
      sourceIcon: "https://www.google.com/s2/favicons?domain=rss.app&sz=32"
    },
    {
      title: "Supreme Court Allows Third-Country Deportations to Continue",
      description: "High court permits administration to expedite deportations to countries other than migrants' home nations.",
      category: "US NEWS",
      author: "Legal Affairs",
      pubDate: new Date(Date.now() - 18000000).toISOString(),
      imageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1920&q=80",
      source: "World News Network",
      sourceIcon: "https://www.google.com/s2/favicons?domain=rss.app&sz=32"
    }
  ],
  hurricane: [
    {
      title: "Hurricane Melissa Devastates Jamaica as Category 5 Storm",
      description: "Historic hurricane ties 1935 Labor Day storm as strongest Atlantic landfall, leaving trail of destruction across Caribbean.",
      category: "WORLD NEWS",
      author: "Weather Center",
      pubDate: new Date(Date.now() - 21600000).toISOString(),
      imageUrl: "https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=1920&q=80",
      source: "World News Network",
      sourceIcon: "https://www.google.com/s2/favicons?domain=rss.app&sz=32"
    },
    {
      title: "Death Toll Rises in Jamaica After Hurricane Melissa's Catastrophic Strike",
      description: "At least 59 deaths reported across Caribbean as communities begin recovery from one of strongest hurricanes on record.",
      category: "WORLD NEWS",
      author: "International Desk",
      pubDate: new Date(Date.now() - 25200000).toISOString(),
      imageUrl: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1920&q=80",
      source: "World News Network",
      sourceIcon: "https://www.google.com/s2/favicons?domain=rss.app&sz=32"
    }
  ]
};

// News feed endpoint
app.get('/api/news', async (req, res) => {
  try {
    // Combine all news categories
    const allNews = [
      ...mockNewsData.worldSeries,
      ...mockNewsData.snap,
      ...mockNewsData.immigration,
      ...mockNewsData.hurricane
    ];

    // Shuffle and limit to top stories
    const shuffled = allNews.sort(() => 0.5 - Math.random());
    const topStories = shuffled.slice(0, 8);

    res.json({
      status: 'success',
      articles: topStories,
      totalResults: topStories.length
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch news'
    });
  }
});

// Category-specific endpoints
app.get('/api/news/worldseries', (req, res) => {
  res.json({ status: 'success', articles: mockNewsData.worldSeries });
});

app.get('/api/news/snap', (req, res) => {
  res.json({ status: 'success', articles: mockNewsData.snap });
});

app.get('/api/news/immigration', (req, res) => {
  res.json({ status: 'success', articles: mockNewsData.immigration });
});

app.get('/api/news/hurricane', (req, res) => {
  res.json({ status: 'success', articles: mockNewsData.hurricane });
});

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check endpoint for Cloud Run
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Everybody's News server running on port ${PORT}`);
  console.log(`📰 News feeds available at http://localhost:${PORT}/api/news`);
});
