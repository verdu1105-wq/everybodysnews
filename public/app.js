const heroMain = document.getElementById('hero-main');
const heroSide = document.getElementById('hero-side');
const laneA = document.getElementById('rex-lane-a');
const laneB = document.getElementById('rex-lane-b');

const fmt = (s, n=120) => (s || '').replace(/\s+/g,' ').trim().slice(0,n) + ((s||'').length>n?'…':'');

function card(article){
  const img = article.imageUrl ? `style="background-image:url('${article.imageUrl}');"` : '';
  return `
    <a class="card" href="${article.link || '#'}" target="_blank" rel="noopener">
      <div class="img" ${img}></div>
      <div class="body">
        <div class="src"><img src="${article.sourceIcon || ''}" alt=""><span>${article.source || 'Source'}</span></div>
        <div class="ttl">${fmt(article.title, 90)}</div>
        <div class="meta">${new Date(article.pubDate||Date.now()).toLocaleString()}</div>
      </div>
    </a>
  `;
}

function mini(article){
  const img = article.imageUrl ? `style="background-image:url('${article.imageUrl}');"` : '';
  return `
    <a class="mini" href="${article.link || '#'}" target="_blank" rel="noopener">
      <div class="body">
        <div class="ttl">${fmt(article.title, 80)}</div>
        <div class="meta">${article.source || 'Source'}</div>
      </div>
      <div class="img" ${img}></div>
    </a>
  `;
}

async function loadHero(){
  const r = await fetch('/api/news', {cache:'no-store'});
  const data = await r.json().catch(()=>({articles:[]}));
  const items = data.articles || [];
  if(!items.length){ return; }

  // Main (first item)
  const a0 = items[0];
  heroMain.innerHTML = `
    <a href="${a0.link || '#'}" target="_blank" rel="noopener" class="hero-card">
      <div class="hero-img" style="background-image:${a0.imageUrl?`url('${a0.imageUrl}')`:'linear-gradient(180deg,#0f1524,#0b101a)'}"></div>
      <div class="hero-body">
        <div class="hero-meta">
          <img src="${a0.sourceIcon || ''}" alt="" width="16" height="16" style="border-radius:4px" />
          <span>${a0.source || 'Source'}</span>
          <span>•</span>
          <span>${new Date(a0.pubDate||Date.now()).toLocaleString()}</span>
        </div>
        <h1 class="hero-title">${fmt(a0.title, 160)}</h1>
        <p class="hero-desc">${fmt(a0.description, 220)}</p>
      </div>
    </a>
  `;

  // Side minis (rest)
  heroSide.innerHTML = items.slice(1, 7).map(mini).join('');
}

async function loadRex(){
  const r = await fetch('/api/rex-carousel', {cache:'no-store'});
  const data = await r.json().catch(()=>({articles:[]}));
  const items = data.articles || [];
  if(!items.length){ return; }

  // split into two lanes
  const half = Math.ceil(items.length/2);
  const a = items.slice(0, half);
  const b = items.slice(half);

  laneA.innerHTML = a.map(card).join('');
  laneB.innerHTML = b.map(card).join('');
}

async function init(){
  try {
    await Promise.all([loadHero(), loadRex()]);
  } catch(e) {
    console.error(e);
  }
}
init();
