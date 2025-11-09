// feeds-config-custom.js
module.exports = {
  refreshInterval: 180000,        // 3 minutes
  articlesPerFeed: 10,
  heroFeeds: [
    { enabled: true, source: 'Reuters', category: 'Top', url: 'https://www.reuters.com/rssFeed/topNews' },
    { enabled: true, source: 'BBC',     category: 'World', url: 'https://feeds.bbci.co.uk/news/world/rss.xml' }
  ],
  rexFeeds: [
    { enabled: true, source: 'AP',      category: 'Top', url: 'https://apnews.com/hub/apf-topnews?utm_source=rss' },
    { enabled: true, source: 'NPR',     category: 'US',  url: 'https://feeds.npr.org/1001/rss.xml' }
  ]
};
