import { SERVICES, CATEGORIES, formatDuration } from './data.js';
import { initTilt } from './main.js';

const filtersEl = document.getElementById('filters');
const pill = filtersEl.querySelector('.filter-pill');
const grid = document.getElementById('serviceGrid');
const search = document.getElementById('search');

const initial = location.hash.slice(1);
let active = CATEGORIES.some((c) => c.id === initial) ? initial : 'all';

CATEGORIES.forEach((c) => {
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = c.label;
  b.dataset.cat = c.id;
  b.setAttribute('role', 'tab');
  b.addEventListener('click', () => setCategory(c.id));
  filtersEl.append(b);
});

function movePill() {
  const btn = filtersEl.querySelector(`[data-cat="${active}"]`);
  pill.style.left = `${btn.offsetLeft}px`;
  pill.style.top = `${btn.offsetTop}px`;
  pill.style.width = `${btn.offsetWidth}px`;
  pill.style.height = `${btn.offsetHeight}px`;
}

function setCategory(id) {
  active = id;
  [...filtersEl.querySelectorAll('button')].forEach((b) => {
    const on = b.dataset.cat === id;
    b.classList.toggle('active', on);
    b.setAttribute('aria-selected', String(on));
  });
  history.replaceState(null, '', id === 'all' ? location.pathname : `#${id}`);
  movePill();
  render();
}

function render() {
  const q = search.value.trim().toLowerCase();
  const items = SERVICES.filter((s) =>
    (active === 'all' || s.category === active) &&
    (!q || s.name.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q)));

  if (!items.length) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="big">✧</div>
        <h3>No treatments match “${escapeHtml(search.value)}”</h3>
        <p>Try a different word, or browse all categories.</p>
        <button class="btn btn-ghost btn-sm" type="button" id="clearSearch">Clear search</button>
      </div>`;
    document.getElementById('clearSearch').addEventListener('click', () => {
      search.value = '';
      setCategory('all');
    });
    return;
  }

  const label = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.label]));
  grid.innerHTML = items.map((s, i) => `
    <article class="service-card" data-tilt="5" style="animation-delay:${i * 60}ms">
      <span class="tag">${label[s.category]}</span>
      ${s.popular ? '<span class="popular-badge">★ Popular</span>' : ''}
      <h3>${s.name}</h3>
      <p>${s.desc}</p>
      <div class="row">
        <span class="price">$${s.price}<small>${formatDuration(s.duration)}</small></span>
        <a class="btn btn-sm" href="booking.html?service=${s.id}">Book</a>
      </div>
    </article>`).join('');
  initTilt('.service-card');
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

search.addEventListener('input', render);
window.addEventListener('resize', movePill);
document.fonts?.ready.then(movePill);
setCategory(active);