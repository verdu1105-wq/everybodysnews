// API Configuration
const API_BASE_URL = window.location.origin;

// Carousel State Management
const carousels = {
  breaking: { currentSlide: 0, items: [], autoplayInterval: null },
  abc: { currentSlide: 0, items: [], autoplayInterval: null },
  sports: { currentSlide: 0, items: [], autoplayInterval: null },
  world: { currentSlide: 0, items: [], autoplayInterval: null },
  tech: { currentSlide: 0, items: [], autoplayInterval: null }
};

// Format date for display
function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffHours < 1) {
    return 'Just now';
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }
}

// Strip HTML tags from description
function stripHtml(html) {
  const temp = document.createElement('div');
  temp.innerHTML = html;
  return temp.textContent || temp.innerText || '';
}

// Truncate text
function truncateText(text, maxLength = 200) {
  const cleanText = stripHtml(text);
  if (cleanText.length <= maxLength) return cleanText;
  return cleanText.substr(0, maxLength).trim() + '...';
}

// Create slide HTML
function createSlide(item, category = '') {
  const title = item.title || 'No title available';
  const description = truncateText(item.description || 'No description available', 200);
  const imageUrl = item.imageUrl || item.image || 'https://via.placeholder.com/800x400/333/fff?text=News';
  const link = item.link || '#';
  const date = formatDate(item.pubDate || new Date());
  const source = item.source || '';
  const sourceIcon = item.sourceIcon || `https://www.google.com/s2/favicons?domain=${new URL(link).hostname}&sz=32`;

  return `
    <div class="carousel-slide" style="background-image: url('${imageUrl}');">
      <div class="slide-content">
        <div>
          ${category ? `<span class="slide-category">${category}</span>` : ''}
          <div class="slide-date">
            <span>📅</span> ${date}
            ${source ? `
              <span class="news-source">
                <img src="${sourceIcon}" alt="${source}" class="source-favicon" onerror="this.style.display='none'">
                ${source}
              </span>
            ` : ''}
          </div>
          <a href="${link}" target="_blank" rel="noopener noreferrer" class="slide-title-link">
            <h3 class="slide-title">${title}</h3>
          </a>
          <p class="slide-description">${description}</p>
        </div>
        <a href="${link}" target="_blank" rel="noopener noreferrer" class="read-more-btn">
          Read Full Article →
        </a>
      </div>
    </div>
  `;
}

// Create indicators
function createIndicators(carouselId, count) {
  const indicatorsContainer = document.getElementById(`${carouselId}-indicators`);
  if (!indicatorsContainer) return;
  
  indicatorsContainer.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const indicator = document.createElement('div');
    indicator.className = `indicator ${i === 0 ? 'active' : ''}`;
    indicator.addEventListener('click', () => goToSlide(carouselId, i));
    indicatorsContainer.appendChild(indicator);
  }
}

// Update indicators
function updateIndicators(carouselId) {
  const indicators = document.querySelectorAll(`#${carouselId}-indicators .indicator`);
  const currentSlide = carousels[carouselId].currentSlide;
  
  indicators.forEach((indicator, index) => {
    indicator.classList.toggle('active', index === currentSlide);
  });
}

// Initialize carousel
function initCarousel(carouselId, items, category = '') {
  const container = document.getElementById(`${carouselId}-carousel`);
  if (!container || !items || items.length === 0) {
    if (container) {
      container.innerHTML = `
        <div class="carousel-error">
          <span>❌</span> Failed to load news. Please try again later.
        </div>
      `;
    }
    return;
  }
  
  carousels[carouselId].items = items;
  
  const track = document.createElement('div');
  track.className = 'carousel-track';
  track.innerHTML = items.map(item => createSlide(item, category)).join('');
  
  container.innerHTML = '';
  container.appendChild(track);
  
  createIndicators(carouselId, items.length);
  startAutoplay(carouselId);
}

// Navigate carousel
function goToSlide(carouselId, slideIndex) {
  const carousel = carousels[carouselId];
  const track = document.querySelector(`#${carouselId}-carousel .carousel-track`);
  
  if (!track || !carousel.items.length) return;
  
  carousel.currentSlide = slideIndex;
  const offset = -slideIndex * 100;
  track.style.transform = `translateX(${offset}%)`;
  
  updateIndicators(carouselId);
  resetAutoplay(carouselId);
}

// Next slide
function nextSlide(carouselId) {
  const carousel = carousels[carouselId];
  const nextIndex = (carousel.currentSlide + 1) % carousel.items.length;
  goToSlide(carouselId, nextIndex);
}

// Previous slide
function prevSlide(carouselId) {
  const carousel = carousels[carouselId];
  const prevIndex = (carousel.currentSlide - 1 + carousel.items.length) % carousel.items.length;
  goToSlide(carouselId, prevIndex);
}

// Start autoplay
function startAutoplay(carouselId) {
  const carousel = carousels[carouselId];
  
  if (carousel.autoplayInterval) {
    clearInterval(carousel.autoplayInterval);
  }
  
  carousel.autoplayInterval = setInterval(() => {
    nextSlide(carouselId);
  }, 5000);
}

// Reset autoplay
function resetAutoplay(carouselId) {
  startAutoplay(carouselId);
}

// Stop autoplay
function stopAutoplay(carouselId) {
  const carousel = carousels[carouselId];
  if (carousel.autoplayInterval) {
    clearInterval(carousel.autoplayInterval);
    carousel.autoplayInterval = null;
  }
}

// Fetch RSS feed data
async function fetchFeed(endpoint) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/feeds/${endpoint}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${endpoint} feed:`, error);
    return [];
  }
}

// Fetch MediaStack API data
async function fetchLiveNews(params = {}) {
  try {
    const queryParams = new URLSearchParams(params);
    const response = await fetch(`${API_BASE_URL}/api/live-news?${queryParams}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching live news:', error);
    return [];
  }
}

// Fetch breaking news (HERO carousel with ABC News + MediaStack)
async function fetchBreakingNews() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/news`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data.articles || [];
  } catch (error) {
    console.error('Error fetching breaking news:', error);
    return [];
  }
}

// Fetch Rex carousel news (ESPN, Tech, CNN + MediaStack combined)
async function fetchRexCarousel() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/rex-carousel`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data.articles || [];
  } catch (error) {
    console.error('Error fetching rex carousel:', error);
    return [];
  }
}

// Initialize all carousels
async function initAllCarousels() {
  try {
    // Fetch HERO Carousel (ABC News, Reuters, BBC, AP + MediaStack API)
    const breakingNews = await fetchBreakingNews();
    console.log('Hero carousel articles:', breakingNews.length);
    if (breakingNews.length > 0) {
      initCarousel('breaking', breakingNews, 'BREAKING');
    } else {
      console.error('No articles returned from /api/news');
    }

    // Fetch REX Carousel (ESPN, Tech, CNN + MediaStack)
    const rexNews = await fetchRexCarousel();
    console.log('Rex carousel articles:', rexNews.length);
    if (rexNews.length > 0) {
      initCarousel('abc', rexNews, 'LATEST NEWS');
    } else {
      console.error('No articles returned from /api/rex-carousel');
    }
  } catch (error) {
    console.error('Error initializing carousels:', error);
  }
}

// Setup navigation buttons
function setupNavigation() {
  document.querySelectorAll('.carousel-nav').forEach(button => {
    button.addEventListener('click', function() {
      const carouselId = this.getAttribute('data-carousel');
      
      if (this.classList.contains('prev')) {
        prevSlide(carouselId);
      } else if (this.classList.contains('next')) {
        nextSlide(carouselId);
      }
    });
  });
}

// Setup keyboard navigation
function setupKeyboardNavigation() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      Object.keys(carousels).forEach(id => prevSlide(id));
    } else if (e.key === 'ArrowRight') {
      Object.keys(carousels).forEach(id => nextSlide(id));
    }
  });
}

// Setup touch/swipe navigation
function setupTouchNavigation() {
  let touchStartX = 0;
  let touchEndX = 0;
  
  document.querySelectorAll('.carousel-container').forEach(container => {
    container.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });
    
    container.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe(container.id);
    });
  });
  
  function handleSwipe(containerId) {
    const carouselId = containerId.replace('-carousel', '');
    const swipeThreshold = 50;
    
    if (touchEndX < touchStartX - swipeThreshold) {
      nextSlide(carouselId);
    } else if (touchEndX > touchStartX + swipeThreshold) {
      prevSlide(carouselId);
    }
  }
}

// Pause autoplay on hover
function setupHoverPause() {
  document.querySelectorAll('.carousel-wrapper').forEach(wrapper => {
    const carouselId = wrapper.querySelector('.carousel-container').id.replace('-carousel', '');
    
    wrapper.addEventListener('mouseenter', () => {
      stopAutoplay(carouselId);
    });
    
    wrapper.addEventListener('mouseleave', () => {
      startAutoplay(carouselId);
    });
  });
}

// Refresh news data periodically
function setupAutoRefresh() {
  // Refresh news every 5 minutes
  setInterval(() => {
    console.log('Refreshing news data...');
    initAllCarousels();
  }, 5 * 60 * 1000);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  console.log('Initializing Everybody\'s News...');
  
  setupNavigation();
  setupKeyboardNavigation();
  setupTouchNavigation();
  setupHoverPause();
  setupAutoRefresh();
  
  initAllCarousels();
});

// Handle visibility change (pause when tab is hidden)
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    Object.keys(carousels).forEach(id => stopAutoplay(id));
  } else {
    Object.keys(carousels).forEach(id => startAutoplay(id));
  }
});
