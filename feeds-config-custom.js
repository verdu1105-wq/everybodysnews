// feeds-config-custom.js
module.exports = {
  refreshInterval: 180000, // 3 minutes
  articlesPerFeed: 12,

  heroFeeds: [
    { source: 'Reuters', category: 'Top', enabled: true, url: 'https://www.reuters.com/rssFeed/topNews' },
    { source: 'BBC',     category: 'Top', enabled: true, url: 'http://feeds.bbci.co.uk/news/rss.xml' },
    { source: 'AP',      category: 'Top', enabled: true, url: 'https://apnews.com/hub/apf-topnews?utm_source=apnews.com&utm_medium=referral&utm_campaign=rss' }
  ],

  rexFeeds: [
    { source: 'ESPN',      category: 'Sports', enabled: true, url: 'https://www.espn.com/espn/rss/news' },
    { source: 'The Verge', category: 'Tech',   enabled: true, url: 'https://www.theverge.com/rss/index.xml' },
    { source: 'TechCrunch',category: 'Tech',   enabled: true, url: 'https://techcrunch.com/feed/' }
  ]
};
