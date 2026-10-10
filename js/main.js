import { currentUser, signOut } from './auth.js';

const LOGO = `
<svg class="logo-mark" viewBox="0 0 48 48" fill="none" aria-hidden="true">
  <defs>
    <linearGradient id="lg" x1="0" y1="0" x2="48" y2="48">
      <stop offset="0" stop-color="#e0607e"/><stop offset="1" stop-color="#d4a373"/>
    </linearGradient>
  </defs>
  <circle cx="24" cy="24" r="22" stroke="url(#lg)" stroke-width="2"/>
  <path d="M24 8c3 7 9 10 16 16-7 6-13 9-16 16-3-7-9-10-16-16 7-6 13-9 16-16Z" fill="url(#lg)"/>
</svg>`;

const NAV = [
  { href: 'index.html', label: 'Home', page: 'home' },
  { href: 'services.html', label: 'Services', page: 'services' },
  { href: 'about.html', label: 'About', page: 'about' },
  { href: 'booking.html', label: 'Book Now', page: 'booking' },
];

export const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

const currentPage = document.body.dataset.page;

function authItem() {
  const user = currentUser();
  if (!user) {
    const next = currentPage === 'login' ? '' : `?next=${encodeURIComponent(location.pathname.split('/').pop() || 'index.html')}`;
    return `<li><a href="login.html${next}" class="nav-login ${currentPage === 'login' ? 'active' : ''}">Login</a></li>`;
  }
  const initials = user.name.split(/\s+/).map((p) => p[0]).join('').slice(0, 2).toUpperCase();
  return `
    <li class="user-chip">
      <span class="avatar">${initials}</span>
      <span class="user-name">Hi, ${escapeHtml(user.name.split(' ')[0])}</span>
      <button type="button" class="logout-btn">Log out</button>
    </li>`;
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

function renderHeader() {
  const header = document.createElement('header');
  header.className = 'site-header';
  header.innerHTML = `
    <div class="container nav">
      <a href="index.html" class="brand" aria-label="Lumière home">
        ${LOGO}
        <span>Lumière<small>Beauty Studio</small></span>
      </a>
      <nav aria-label="Main">
        <ul class="nav-links">
          ${NAV.map((n) => `<li><a href="${n.href}" class="${n.page === currentPage ? 'active' : ''}">${n.label}</a></li>`).join('')}
          ${authItem()}
        </ul>
      </nav>
      <button class="menu-toggle" aria-label="Open menu" aria-expanded="false"><span></span><span></span><span></span></button>
    </div>`;
  document.body.prepend(header);

  const toggle = header.querySelector('.menu-toggle');
  toggle.addEventListener('click', () => {
    const open = document.body.classList.toggle('menu-open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });

  header.querySelector('.logout-btn')?.addEventListener('click', () => {
    signOut();
    toast('You’ve been logged out. See you soon ✦');
    setTimeout(() => location.reload(), 900);
  });

  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 30);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function renderFooter() {
  const footer = document.createElement('footer');
  footer.className = 'site-footer';
  footer.innerHTML = `
    <div class="container">
      <div class="footer-grid">
        <div>
          <a href="index.html" class="brand">${LOGO}<span>Lumière<small>Beauty Studio</small></span></a>
          <p>A calm, light-filled studio for hair, skin, nails and makeup. Thoughtful artistry, clean products, and time that's entirely yours.</p>
        </div>
        <div>
          <h4>Explore</h4>
          <ul>${NAV.map((n) => `<li><a href="${n.href}">${n.label}</a></li>`).join('')}</ul>
        </div>
        <div>
          <h4>Visit</h4>
          <ul>
            <li>24 Rosewood Avenue</li>
            <li>Mon–Fri · 9am – 8pm</li>
            <li>Sat · 9am – 6pm</li>
            <li>Sun · Closed</li>
          </ul>
        </div>
        <div>
          <h4>Glow notes</h4>
          <p style="font-size:.9rem;margin:0">Seasonal offers and beauty tips, twice a month.</p>
          <form class="newsletter" novalidate>
            <input type="email" placeholder="Your email" aria-label="Email address" required />
            <button class="btn btn-sm" type="submit">Join</button>
          </form>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© ${new Date().getFullYear()} Lumière Beauty Studio</span>
        <span>hello@lumierestudio.com · (555) 014-2290</span>
      </div>
    </div>`;
  document.body.append(footer);

  footer.querySelector('.newsletter').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = e.currentTarget.querySelector('input');
    if (!/^\S+@\S+\.\S+$/.test(input.value)) {
      toast('Please enter a valid email address');
      return;
    }
    input.value = '';
    toast('You’re on the list — welcome to Glow notes ✦');
  });
}

function renderChrome() {
  const loader = document.createElement('div');
  loader.className = 'page-loader';
  loader.innerHTML = LOGO;
  const curtain = document.createElement('div');
  curtain.className = 'page-curtain';
  const glow = document.createElement('div');
  glow.className = 'cursor-glow';
  const top = document.createElement('button');
  top.className = 'back-to-top';
  top.setAttribute('aria-label', 'Back to top');
  top.innerHTML = '↑';
  document.body.append(loader, curtain, glow, top);

  window.addEventListener('load', () => setTimeout(() => loader.classList.add('hidden'), 350));
  setTimeout(() => loader.classList.add('hidden'), 2500);
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) {
      curtain.classList.remove('active');
      loader.classList.add('hidden');
    }
  });

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a || a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || (url.pathname === location.pathname && url.hash)) return;
    e.preventDefault();
    document.body.classList.remove('menu-open');
    curtain.classList.add('active');
    setTimeout(() => (location.href = url.href), 450);
  });

  window.addEventListener('mousemove', (e) => {
    glow.style.left = `${e.clientX}px`;
    glow.style.top = `${e.clientY}px`;
  }, { passive: true });

  window.addEventListener('scroll', () => top.classList.toggle('show', window.scrollY > 600), { passive: true });
  top.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

export function initReveal(root = document) {
  const items = root.querySelectorAll('.reveal:not(.visible)');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.style.transitionDelay = `${el.dataset.delay || 0}ms`;
      el.classList.add('visible');
      io.unobserve(el);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  items.forEach((el) => io.observe(el));
}

function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.dataset.count);
      const decimals = (el.dataset.count.split('.')[1] || '').length;
      const suffix = el.dataset.suffix || '';
      const start = performance.now();
      const dur = 1800;
      const tick = (now) => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 4);
        el.textContent = (target * eased).toFixed(decimals) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      io.unobserve(el);
    });
  }, { threshold: 0.6 });
  counters.forEach((c) => io.observe(c));
}

export function initTilt(selector = '[data-tilt]') {
  if (window.matchMedia('(hover: none)').matches) return;
  document.querySelectorAll(selector).forEach((el) => {
    const max = parseFloat(el.dataset.tilt) || 8;
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      el.style.setProperty('--mx', `${x * 100}%`);
      el.style.setProperty('--my', `${y * 100}%`);
      el.style.transform = `perspective(900px) rotateX(${(0.5 - y) * max}deg) rotateY(${(x - 0.5) * max}deg) translateY(-6px)`;
    });
    el.addEventListener('mouseleave', () => (el.style.transform = ''));
  });
}

function initSparkles() {
  document.querySelectorAll('.sparkles').forEach((box) => {
    const n = parseInt(box.dataset.count || '14', 10);
    for (let i = 0; i < n; i++) {
      const s = document.createElement('span');
      s.className = 'sparkle';
      const size = 6 + Math.random() * 10;
      Object.assign(s.style, {
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        width: `${size}px`,
        height: `${size}px`,
        animationDelay: `${Math.random() * 3}s`,
        animationDuration: `${2.5 + Math.random() * 2.5}s`,
      });
      box.append(s);
    }
  });
}

let toastTimer;
export function toast(message) {
  let el = document.querySelector('.toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'toast';
    el.setAttribute('role', 'status');
    document.body.append(el);
  }
  el.textContent = message;
  requestAnimationFrame(() => el.classList.add('show'));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3200);
}

export function confetti() {
  const colors = ['#e0607e', '#d4a373', '#ef8aa2', '#5a1f4c', '#ecc9a0'];
  for (let i = 0; i < 90; i++) {
    const c = document.createElement('span');
    c.className = 'confetti';
    Object.assign(c.style, {
      left: `${Math.random() * 100}vw`,
      background: colors[i % colors.length],
      animationDuration: `${2.2 + Math.random() * 2}s`,
      animationDelay: `${Math.random() * 0.6}s`,
      borderRadius: Math.random() > 0.5 ? '50%' : '2px',
    });
    document.body.append(c);
    setTimeout(() => c.remove(), 5000);
  }
}

renderHeader();
renderFooter();
renderChrome();
initSparkles();
initReveal();
initCounters();
initTilt();