/**
 * CUSTOM RSS FEEDS CONFIGURATION
 * Separate feeds for Hero Carousel and Rex Carousel
 */

module.exports = {
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
    // *** CHANGE 1: ABC News feed added - replaces Rex Feed 4 ***
    {
      url: 'http://feeds.abcnews.com/abcnews/topstories',
      category: 'ABC NEWS',
      source: 'ABC News',
      sourceIcon: 'https://www.google.com/s2/favicons?domain=abcnews.go.com&sz=32',
      enabled: true
    }
    // *** END CHANGE 1 ***
  ]
};
