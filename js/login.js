import { currentUser, signIn, signUp, DEMO_USER } from './auth.js';
import { toast, confetti } from './main.js';

const $ = (id) => document.getElementById(id);
const tabs = [...document.querySelectorAll('.auth-tabs button')];
const pill = document.querySelector('.auth-tab-pill');
const forms = { signin: $('signinForm'), signup: $('signupForm') };
const alertBox = $('authAlert');

const params = new URLSearchParams(location.search);
const rawNext = params.get('next') || 'index.html';
const next = /^[a-z]+\.html([?#].*)?$/i.test(rawNext) && !rawNext.startsWith('login') ? rawNext : 'index.html';

const isEmail = (v) => /^\S+@\S+\.\S+$/.test(v.trim());
const isStrong = (v) => v.length >= 8 && /\d/.test(v);

function showTab(name) {
  tabs.forEach((t) => {
    const on = t.dataset.tab === name;
    t.classList.toggle('active', on);
    t.setAttribute('aria-selected', String(on));
  });
  Object.entries(forms).forEach(([key, form]) => form.classList.toggle('active', key === name));
  $('authDone').classList.remove('active');
  hideAlert();
  movePill();
  history.replaceState(null, '', `${location.pathname}${location.search}${name === 'signup' ? '#signup' : ''}`);
}

function movePill() {
  const active = tabs.find((t) => t.classList.contains('active'));
  pill.style.left = `${active.offsetLeft}px`;
  pill.style.width = `${active.offsetWidth}px`;
}

function showAlert(message) {
  alertBox.textContent = message;
  alertBox.hidden = false;
  alertBox.classList.remove('shake');
  void alertBox.offsetWidth;
  alertBox.classList.add('shake');
}
function hideAlert() { alertBox.hidden = true; }

function setInvalid(input, invalid) {
  input.closest('.field').classList.toggle('invalid', invalid);
  return !invalid;
}

function setLoading(form, loading) {
  const btn = form.querySelector('button[type="submit"]');
  btn.disabled = loading;
  btn.classList.toggle('loading', loading);
}

function finish(user, title) {
  Object.values(forms).forEach((f) => f.classList.remove('active'));
  $('authDone').classList.add('active');
  $('doneTitle').textContent = title;
  $('doneText').textContent = `Welcome, ${user.name.split(' ')[0]}! Taking you to ${next.startsWith('booking') ? 'booking' : 'the studio'}…`;
  confetti();
  setTimeout(() => (location.href = next), 1800);
}

tabs.forEach((t) => t.addEventListener('click', () => showTab(t.dataset.tab)));
document.querySelectorAll('[data-switch]').forEach((b) => b.addEventListener('click', () => showTab(b.dataset.switch)));

document.querySelectorAll('.toggle-password').forEach((btn) => {
  btn.addEventListener('click', () => {
    const input = btn.parentElement.querySelector('input');
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    btn.textContent = show ? 'Hide' : 'Show';
    btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
  });
});

document.querySelectorAll('.auth-form input').forEach((input) => {
  input.addEventListener('input', () => {
    input.closest('.field')?.classList.remove('invalid');
    hideAlert();
  });
});

$('suPassword').addEventListener('input', (e) => {
  const v = e.target.value;
  let score = 0;
  if (v.length >= 8) score++;
  if (/\d/.test(v)) score++;
  if (/[A-Z]/.test(v) && /[a-z]/.test(v)) score++;
  if (/[^A-Za-z0-9]/.test(v) || v.length >= 12) score++;
  const levels = [
    ['Use 8+ characters with a number', '#e57373'],
    ['Weak', '#e57373'],
    ['Okay', '#e0a050'],
    ['Good', '#d4a373'],
    ['Strong', '#4caf7a'],
  ];
  const [label, color] = levels[v ? score : 0];
  $('strengthFill').style.width = `${v ? Math.max(score, 1) * 25 : 0}%`;
  $('strengthFill').style.background = color;
  $('strengthLabel').textContent = label;
});

forms.signin.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = $('siEmail');
  const password = $('siPassword');
  const ok = [setInvalid(email, !isEmail(email.value)), setInvalid(password, !password.value)].every(Boolean);
  if (!ok) return;
  setLoading(forms.signin, true);
  try {
    const user = await signIn({ email: email.value, password: password.value, remember: $('remember').checked });
    finish(user, 'You’re signed in!');
  } catch (err) {
    showAlert(err.message);
  } finally {
    setLoading(forms.signin, false);
  }
});

forms.signup.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = $('suName');
  const email = $('suEmail');
  const phone = $('suPhone');
  const password = $('suPassword');
  const confirm = $('suConfirm');
  const ok = [
    setInvalid(name, name.value.trim().length < 2),
    setInvalid(email, !isEmail(email.value)),
    setInvalid(phone, !!phone.value && phone.value.replace(/\D/g, '').length < 7),
    setInvalid(password, !isStrong(password.value)),
    setInvalid(confirm, !confirm.value || confirm.value !== password.value),
  ].every(Boolean);
  if (!ok) return;
  if (!$('terms').checked) {
    showAlert('Please agree to the booking and cancellation policy to continue.');
    return;
  }
  setLoading(forms.signup, true);
  try {
    const user = await signUp({ name: name.value, email: email.value, phone: phone.value, password: password.value });
    finish(user, 'Account created!');
  } catch (err) {
    showAlert(err.message);
  } finally {
    setLoading(forms.signup, false);
  }
});

$('demoBtn').addEventListener('click', () => {
  showTab('signin');
  $('siEmail').value = DEMO_USER.email;
  $('siPassword').value = DEMO_USER.password;
  forms.signin.requestSubmit();
});

$('forgotBtn').addEventListener('click', () => {
  const email = $('siEmail').value.trim();
  toast(isEmail(email) ? `If ${email} has an account, a reset link is on its way.` : 'Enter your email above, then tap “Forgot password?” again.');
});

const user = currentUser();
if (user) {
  Object.values(forms).forEach((f) => f.classList.remove('active'));
  $('authDone').classList.add('active');
  $('doneTitle').textContent = `You’re already signed in`;
  $('doneText').innerHTML = `Signed in as <strong></strong>. <a class="text-link" href="${next}">Continue</a>`;
  $('doneText').querySelector('strong').textContent = user.email;
} else {
  showTab(location.hash === '#signup' ? 'signup' : 'signin');
}

window.addEventListener('resize', movePill);
document.fonts?.ready.then(movePill);