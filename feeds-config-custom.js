// feeds-config-custom.js
module.exports = {
  refreshInterval: 180000, // 3 minutes
  articlesPerFeed: 12,

  // MediaStack API Configuration
  mediastackApiKey: '96759e8f7a664ec0ee650f1fa7043992',
  mediastackEnabled: true,

  heroFeeds: [
    { source: 'Reuters', category: 'Top', enabled: true, url: 'https://www.reuters.com/rssFeed/topNews' },
    { source: 'BBC',     category: 'Top', enabled: true, url: 'http://feeds.bbci.co.uk/news/rss.xml' },
    { source: 'AP',      category: 'Top', enabled: true, url: 'https://apnews.com/hub/apf-topnews?utm_source=apnews.com&utm_medium=referral&utm_campaign=rss' }
  ],

  // Rex Carousel Feeds - Updated with ABC News and diverse sources
  rexFeeds: [
    { source: 'ABC News', category: 'News', enabled: true, url: 'http://feeds.abcnews.com/abcnews/topstories' },
    { source: 'ESPN',      category: 'Sports', enabled: true, url: 'https://www.espn.com/espn/rss/news' },
    { source: 'The Verge', category: 'Tech',   enabled: true, url: 'https://www.theverge.com/rss/index.xml' },
    { source: 'TechCrunch',category: 'Tech',   enabled: true, url: 'https://techcrunch.com/feed/' }
  ]
};
