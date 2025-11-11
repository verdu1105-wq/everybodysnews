
/**
 * Everybody's News – Frontend renderer
 * Drop this file in: /public/app.js (replace the existing one)
 * What this fixes:
 *  - Hero (first carousel card) now uses the FULL article image (cover) + title + description with a link.
 *  - Side hero items use thumbnails; falls back to cover if thumb missing.
 *  - Lanes/cards show images correctly with background-size: cover.
 *  - Auto-refresh the page every 6 hours (21600000 ms).
 */

// ===== DOM Targets =====
const heroMain = document.getElementById('hero-main');
const heroSide = document.getElementById('hero-side');
const laneA = document.getElementById('rex-lane-a');
const laneB = document.getElementById('rex-lane-b');

// ===== Helpers =====
const fmt = (s, n = 120) => (s || '').replace(/\s+/g, ' ').trim().slice(0, n) + ((s || '').length > n ? '…' : '');

// Prefer a full cover image, otherwise fall back to thumbnail, otherwise null.
function pickCover(raw) {
  return raw.imageUrl || raw.cover || raw.fullImage || raw.thumbnailUrl || raw.thumbnail || null;
}
// Prefer a thumbnail; if missing use the cover so something shows.
function pickThumb(raw) {
  return raw.thumbnailUrl || raw.thumbnail || raw.thumb || raw.imageUrl || raw.cover || raw.fullImage || null;
}

// Card HTML for lanes
function card(article) {
  const imgUrl = pickThumb(article);
  const bg = imgUrl ? ` style="background-image:url('${imgUrl}');"` : '';
  const pub = article.pubDate ? new Date(article.pubDate).toLocaleString() : '';
  return `
    <a class="card" href="${article.link || '#'}" target="_blank" rel="noopener">
      <div class="img"${bg}></div>
      <div class="body">
        <div class="src">
          ${article.sourceIcon ? `<img src="${article.sourceIcon}" alt="" />` : ''}
          <span>${article.source || 'Source'}</span>
        </div>
        <div class="ttl">${fmt(article.title, 90)}</div>
        <div class="meta">${pub}</div>
      </div>
    </a>
  `;
}

// Mini HTML for side hero list
function mini(article) {
  const imgUrl = pickThumb(article);
  const bg = imgUrl ? ` style="background-image:url('${imgUrl}');"` : '';
  return `
    <a class="mini" href="${article.link || '#'}" target="_blank" rel="noopener">
      <div class="body">
        <div class="ttl">${fmt(article.title, 80)}</div>
        <div class="meta">${article.source || ''}</div>
      </div>
      <div class="img"${bg}></div>
    </a>
  `;
}

// Render the hero block (main + 3 side items)
function renderHero(items) {
  if (!items.length) {
    heroMain.innerHTML = '';
    heroSide.innerHTML = '';
    return;
  }

  const a0 = items[0];
  const cover = pickCover(a0);
  const pub = a0.pubDate ? new Date(a0.pubDate).toLocaleString() : '';

  heroMain.innerHTML = `
    <a href="${a0.link || '#'}" target="_blank" rel="noopener" class="hero-card">
      <div class="hero-img" style="${cover ? `background-image:url('${cover}');` : ''}"></div>
      <div class="hero-body">
        <div class="hero-meta">
          ${a0.sourceIcon ? `<img src="${a0.sourceIcon}" alt="" width="16" height="16" style="border-radius:4px" />` : ''}
          <span>${a0.source || 'Source'}</span>
          <span>•</span>
          <span>${pub}</span>
        </div>
        <h1 class="hero-title">${fmt(a0.title, 160)}</h1>
        <p class="hero-desc">${fmt(a0.description || a0.summary, 220)}</p>
      </div>
    </a>
  `;

  const side = items.slice(1, 4);
  heroSide.innerHTML = side.map(mini).join('');
}

async function loadHero() {
  const r = await fetch('/api/news?ts=' + Date.now(), { cache: 'no-store' });
  const data = await r.json().catch(() => ({ articles: [] }));
  const items = data.articles || [];
  renderHero(items);
}

async function loadLanes() {
  const r = await fetch('/api/news?ts=' + Date.now(), { cache: 'no-store' });
  const data = await r.json().catch(() => ({ articles: [] }));
  const items = data.articles || [];
  if (!items.length) {
    laneA.innerHTML = '';
    laneB.innerHTML = '';
    return;
  }
  const half = Math.ceil(items.length / 2);
  const a = items.slice(0, half);
  const b = items.slice(half);
  laneA.innerHTML = a.map(card).join('');
  laneB.innerHTML = b.map(card).join('');
}

async function init() {
  try {
    await Promise.all([loadHero(), loadLanes()]);
  } catch (e) {
    console.error(e);
  }
  // Auto-refresh every 6 hours
  setInterval(() => window.location.reload(), 21600000);
}

document.addEventListener('DOMContentLoaded', init);
