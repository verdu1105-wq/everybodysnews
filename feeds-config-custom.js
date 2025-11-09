// feeds-config-custom.js
module.exports = {
  refreshInterval: 180000,         // 3 minutes
  articlesPerFeed: 8,
  heroFeeds: [
    { enabled: true, category: 'TOP',  source: 'BBC',    url: 'https://feeds.bbci.co.uk/news/rss.xml' },
    { enabled: true, category: 'US',   source: 'AP',     url: 'https://apnews.com/hub/ap-top-news?utm_source=apnews.com&utm_medium=referral' },
    { enabled: true, category: 'TECH', source: 'Verge',  url: 'https://www.theverge.com/rss/index.xml' }
  ],
  rexFeeds: [
    { enabled: true, category: 'BIZ',  source: 'WSJ',    url: 'https://feeds.a.dj.com/rss/RSSWorldNews.xml' },
    { enabled: true, category: 'SPORT',source: 'ESPN',   url: 'https://www.espn.com/espn/rss/news' }
  ]
};
