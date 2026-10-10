import { SERVICES, CATEGORIES, STYLISTS, formatDuration } from './data.js';
import { toast, confetti } from './main.js';
import { currentUser } from './auth.js';

const STORAGE_KEY = 'lumiere.bookings';
const STEP_COUNT = 4;

const state = {
  step: 0,
  services: new Set(),
  stylist: null,
  date: null,
  time: null,
  category: 'all',
  month: startOfMonth(new Date()),
};

const $ = (id) => document.getElementById(id);
const steps = [...document.querySelectorAll('.step')];
const stepperItems = [...$('stepper').children];
const nextBtn = $('nextBtn');
const backBtn = $('backBtn');

const preselect = new URLSearchParams(location.search).get('service');
if (SERVICES.some((s) => s.id === preselect)) {
  state.services.add(preselect);
  state.category = SERVICES.find((s) => s.id === preselect).category;
}

function startOfMonth(d) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function sameDay(a, b) { return a && b && a.toDateString() === b.toDateString(); }
function today() { const t = new Date(); t.setHours(0, 0, 0, 0); return t; }

function loadBookings() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
}
function saveBookings(list) { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }

/* ---------- Step 1: services ---------- */
function renderCategoryTabs() {
  $('catTabs').innerHTML = CATEGORIES.map((c) =>
    `<button type="button" data-cat="${c.id}" class="${c.id === state.category ? 'active' : ''}">${c.label}</button>`).join('');
}
$('catTabs').addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  state.category = b.dataset.cat;
  renderCategoryTabs();
  renderServices();
});

function renderServices() {
  const list = SERVICES.filter((s) => state.category === 'all' || s.category === state.category);
  $('serviceOptions').innerHTML = list.map((s) => `
    <button type="button" class="option ${state.services.has(s.id) ? 'selected' : ''}" data-id="${s.id}" aria-pressed="${state.services.has(s.id)}">
      <div><strong>${s.name}</strong><small>${formatDuration(s.duration)} · $${s.price}</small></div>
      <span class="check">✓</span>
    </button>`).join('');
}
$('serviceOptions').addEventListener('click', (e) => {
  const b = e.target.closest('.option');
  if (!b) return;
  const id = b.dataset.id;
  state.services.has(id) ? state.services.delete(id) : state.services.add(id);
  b.classList.toggle('selected');
  b.setAttribute('aria-pressed', String(state.services.has(id)));
  update();
});

/* ---------- Step 2: stylist ---------- */
function renderStylists() {
  $('stylistOptions').innerHTML = STYLISTS.map((s) => `
    <button type="button" class="option ${state.stylist === s.id ? 'selected' : ''}" data-id="${s.id}" aria-pressed="${state.stylist === s.id}">
      <div class="avatar">${s.initials}</div>
      <div><strong>${s.name}</strong><small>${s.role}</small></div>
      <span class="check">✓</span>
    </button>`).join('');
}
$('stylistOptions').addEventListener('click', (e) => {
  const b = e.target.closest('.option');
  if (!b) return;
  state.stylist = b.dataset.id;
  if (state.time && isSlotTaken(state.date, state.time)) state.time = null;
  renderStylists();
  update();
});

/* ---------- Step 3: calendar & slots ---------- */
const MAX_MONTHS_AHEAD = 3;

function renderCalendar() {
  const m = state.month;
  $('calTitle').textContent = m.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const t = today();
  const first = startOfMonth(t);
  $('prevMonth').disabled = m <= first;
  $('nextMonth').disabled = m >= new Date(first.getFullYear(), first.getMonth() + MAX_MONTHS_AHEAD, 1);

  const offset = (m.getDay() + 6) % 7;
  const days = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate();
  const cells = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => `<div class="dow">${d}</div>`);
  for (let i = 0; i < offset; i++) cells.push('<button type="button" class="cal-day empty" disabled tabindex="-1"></button>');
  for (let d = 1; d <= days; d++) {
    const date = new Date(m.getFullYear(), m.getMonth(), d);
    const closed = date.getDay() === 0 || date < t;
    const cls = ['cal-day', sameDay(date, t) && 'today', sameDay(date, state.date) && 'selected'].filter(Boolean).join(' ');
    cells.push(`<button type="button" class="${cls}" data-day="${d}" ${closed ? 'disabled' : ''} aria-label="${date.toDateString()}${closed ? ' (unavailable)' : ''}">${d}</button>`);
  }
  $('calGrid').innerHTML = cells.join('');
}

$('calGrid').addEventListener('click', (e) => {
  const b = e.target.closest('.cal-day');
  if (!b || b.disabled) return;
  state.date = new Date(state.month.getFullYear(), state.month.getMonth(), +b.dataset.day);
  state.time = null;
  renderCalendar();
  renderSlots();
  update();
});
$('prevMonth').addEventListener('click', () => { state.month = new Date(state.month.getFullYear(), state.month.getMonth() - 1, 1); renderCalendar(); });
$('nextMonth').addEventListener('click', () => { state.month = new Date(state.month.getFullYear(), state.month.getMonth() + 1, 1); renderCalendar(); });

function slotsFor(date) {
  const close = date.getDay() === 6 ? 17.5 : 19.5;
  const out = [];
  for (let h = 9; h <= close; h += 0.5) out.push(`${String(Math.floor(h)).padStart(2, '0')}:${h % 1 ? '30' : '00'}`);
  return out;
}

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function isSlotTaken(date, time) {
  if (!date) return false;
  const key = `${date.toDateString()}|${time}`;
  if (hash(`${key}|${state.stylist || 'any'}`) % 4 === 0) return true;
  if (loadBookings().some((b) => b.dateKey === date.toDateString() && b.time === time)) return true;
  if (sameDay(date, new Date())) {
    const [h, m] = time.split(':').map(Number);
    const now = new Date();
    if (h * 60 + m <= now.getHours() * 60 + now.getMinutes() + 30) return true;
  }
  return false;
}

function renderSlots() {
  const box = $('slots');
  if (!state.date) {
    $('slotsTitle').textContent = 'Available times';
    box.innerHTML = '<p class="hint">Pick a date above to see open times.</p>';
    return;
  }
  $('slotsTitle').textContent = `Available times · ${state.date.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' })}`;
  const slots = slotsFor(state.date).map((t) => ({ t, taken: isSlotTaken(state.date, t) }));
  if (slots.every((s) => s.taken)) {
    box.innerHTML = '<p class="hint">Fully booked on this day — please try another date.</p>';
    return;
  }
  box.innerHTML = `<div class="slots">${slots.map(({ t, taken }) =>
    `<button type="button" class="slot ${state.time === t ? 'selected' : ''}" data-time="${t}" ${taken ? 'disabled' : ''}>${formatTime(t)}</button>`).join('')}</div>`;
}

$('slots').addEventListener('click', (e) => {
  const b = e.target.closest('.slot');
  if (!b || b.disabled) return;
  state.time = b.dataset.time;
  renderSlots();
  update();
});

function formatTime(t) {
  const [h, m] = t.split(':').map(Number);
  return new Date(2000, 0, 1, h, m).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

/* ---------- Step 4: details ---------- */
const validators = {
  name: (v) => v.trim().length >= 2,
  phone: (v) => v.replace(/\D/g, '').length >= 7,
  email: (v) => /^\S+@\S+\.\S+$/.test(v.trim()),
};

function validateDetails() {
  let ok = true;
  Object.entries(validators).forEach(([id, fn]) => {
    const input = $(id);
    const valid = fn(input.value);
    input.closest('.field').classList.toggle('invalid', !valid);
    if (!valid && ok) { input.focus(); ok = false; }
  });
  return ok;
}

Object.keys(validators).forEach((id) => {
  $(id).addEventListener('input', () => {
    if (validators[id]($(id).value)) $(id).closest('.field').classList.remove('invalid');
  });
});

/* ---------- Navigation & summary ---------- */
function canContinue() {
  if (state.step === 0) return state.services.size > 0;
  if (state.step === 1) return !!state.stylist;
  if (state.step === 2) return !!(state.date && state.time);
  return true;
}

function goTo(step) {
  state.step = step;
  steps.forEach((s, i) => s.classList.toggle('active', i === step));
  stepperItems.forEach((li, i) => {
    li.classList.toggle('done', i < step);
    li.classList.toggle('current', i === step);
  });
  $('stepActions').style.display = step >= STEP_COUNT ? 'none' : '';
  $('stepper').style.display = step >= STEP_COUNT ? 'none' : '';
  backBtn.style.visibility = step === 0 ? 'hidden' : 'visible';
  nextBtn.firstChild.textContent = step === STEP_COUNT - 1 ? 'Confirm booking ' : 'Continue ';
  update();
  const panel = document.querySelector('.booking-panel');
  if (panel.getBoundingClientRect().top < 0) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

nextBtn.addEventListener('click', () => {
  if (!canContinue()) return;
  if (state.step === STEP_COUNT - 1) {
    if (!validateDetails()) return;
    confirmBooking();
    return;
  }
  goTo(state.step + 1);
});
backBtn.addEventListener('click', () => goTo(Math.max(0, state.step - 1)));

function selectedServices() { return SERVICES.filter((s) => state.services.has(s.id)); }

function setSummary(id, text) {
  const el = $(id);
  el.classList.toggle('placeholder', !text);
  el.textContent = text || el.dataset.empty;
}

function update() {
  nextBtn.disabled = !canContinue();
  const chosen = selectedServices();
  setSummary('sumServices', chosen.map((s) => s.name).join(', '));
  setSummary('sumStylist', STYLISTS.find((s) => s.id === state.stylist)?.name);
  setSummary('sumWhen', state.date && state.time
    ? `${state.date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'long' })} at ${formatTime(state.time)}`
    : state.date ? state.date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'long' }) + ' · pick a time' : '');
  const mins = chosen.reduce((a, s) => a + s.duration, 0);
  setSummary('sumDuration', mins ? formatDuration(mins) : '');
  animateTotal(chosen.reduce((a, s) => a + s.price, 0));
}

let shownTotal = 0;
function animateTotal(target) {
  const from = shownTotal;
  const start = performance.now();
  const el = $('sumTotal');
  const step = (now) => {
    const p = Math.min((now - start) / 500, 1);
    shownTotal = Math.round(from + (target - from) * (1 - Math.pow(1 - p, 3)));
    el.textContent = `$${shownTotal}`;
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* ---------- Confirm & upcoming ---------- */
function confirmBooking() {
  const chosen = selectedServices();
  const stylist = STYLISTS.find((s) => s.id === state.stylist);
  const booking = {
    ref: `LUM-${Date.now().toString(36).toUpperCase().slice(-6)}`,
    services: chosen.map((s) => s.name),
    stylist: stylist.name,
    dateKey: state.date.toDateString(),
    iso: state.date.toISOString(),
    time: state.time,
    total: chosen.reduce((a, s) => a + s.price, 0),
    name: $('name').value.trim(),
    email: $('email').value.trim(),
  };
  saveBookings([...loadBookings(), booking]);

  $('bookingRef').textContent = booking.ref;
  $('successText').textContent = `Thank you, ${booking.name.split(' ')[0]}! We’ve reserved ${booking.services.join(' + ')} with ${booking.stylist} on ${state.date.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })} at ${formatTime(booking.time)}. A confirmation is on its way to ${booking.email}.`;
  goTo(STEP_COUNT);
  confetti();
  renderUpcoming();
}

$('newBooking').addEventListener('click', () => {
  state.services.clear();
  state.stylist = null;
  state.date = null;
  state.time = null;
  $('bookingForm').reset();
  renderServices();
  renderStylists();
  renderCalendar();
  renderSlots();
  goTo(0);
});

function renderUpcoming() {
  const t = today();
  const list = loadBookings()
    .filter((b) => new Date(b.iso) >= t)
    .sort((a, b) => new Date(a.iso) - new Date(b.iso) || a.time.localeCompare(b.time));
  const box = $('upcoming');
  if (!list.length) { box.innerHTML = ''; return; }
  box.innerHTML = `<h3>Your upcoming visits</h3>${list.map((b) => {
    const d = new Date(b.iso);
    return `
      <div class="appt">
        <div class="date-chip"><b>${d.getDate()}</b><span>${d.toLocaleDateString(undefined, { month: 'short' })}</span></div>
        <div class="info"><strong>${b.services.join(' + ')}</strong><small>${formatTime(b.time)} · ${b.stylist} · ${b.ref}</small></div>
        <button type="button" data-ref="${b.ref}">Cancel</button>
      </div>`;
  }).join('')}`;
}

$('upcoming').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-ref]');
  if (!b) return;
  saveBookings(loadBookings().filter((x) => x.ref !== b.dataset.ref));
  renderUpcoming();
  renderSlots();
  toast('Appointment cancelled');
});

['sumServices', 'sumStylist', 'sumWhen', 'sumDuration'].forEach((id) => { $(id).dataset.empty = $(id).textContent; });

function prefillUser() {
  const user = currentUser();
  const note = $('accountNote');
  if (!user) {
    note.innerHTML = 'Have an account? <a class="text-link" href="login.html?next=booking.html">Log in</a> to fill these in automatically.';
    return;
  }
  $('name').value = user.name;
  $('email').value = user.email;
  if (user.phone) $('phone').value = user.phone;
  note.textContent = `Signed in as ${user.email} — we’ve filled in your details.`;
}

$('bookingForm').addEventListener('reset', () => setTimeout(prefillUser));
prefillUser();

renderCategoryTabs();
renderServices();
renderStylists();
renderCalendar();
renderSlots();
renderUpcoming();
goTo(0);