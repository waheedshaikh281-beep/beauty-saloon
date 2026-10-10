const USERS_KEY = 'lumiere.users';
const SESSION_KEY = 'lumiere.session';

export const DEMO_USER = { name: 'Demo Guest', email: 'demo@lumiere.com', phone: '555 014 2290', password: 'glow1234' };

function readUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; } catch { return []; }
}
function writeUsers(users) { localStorage.setItem(USERS_KEY, JSON.stringify(users)); }

async function hashPassword(password) {
  if (!window.crypto?.subtle) return btoa(unescape(encodeURIComponent(password)));
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

const normalise = (email) => email.trim().toLowerCase();

export function currentUser() {
  const raw = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function startSession(user, remember) {
  const session = JSON.stringify({ name: user.name, email: user.email, phone: user.phone || '' });
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
  (remember ? localStorage : sessionStorage).setItem(SESSION_KEY, session);
}

export async function signUp({ name, email, phone, password }) {
  const users = readUsers();
  if (users.some((u) => u.email === normalise(email))) {
    throw new Error('An account with this email already exists. Try signing in instead.');
  }
  const user = { name: name.trim(), email: normalise(email), phone: phone.trim(), hash: await hashPassword(password) };
  writeUsers([...users, user]);
  startSession(user, true);
  return user;
}

export async function signIn({ email, password, remember }) {
  if (normalise(email) === DEMO_USER.email && password === DEMO_USER.password) {
    startSession(DEMO_USER, remember);
    return DEMO_USER;
  }
  const user = readUsers().find((u) => u.email === normalise(email));
  if (!user || user.hash !== (await hashPassword(password))) {
    throw new Error('That email and password don’t match. Please try again.');
  }
  startSession(user, remember);
  return user;
}

export function signOut() {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}