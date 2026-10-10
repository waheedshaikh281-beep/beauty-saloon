import { SERVICES, formatDuration } from './data.js';
import { initReveal } from './main.js';

const list = document.getElementById('popularList');
list.innerHTML = SERVICES.filter((s) => s.popular)
  .map((s, i) => `
    <a href="booking.html?service=${s.id}" class="popular-item reveal" data-delay="${i * 90}">
      <span class="num">0${i + 1}</span>
      <h3>${s.name}</h3>
      <span class="meta">${formatDuration(s.duration)}</span>
      <span class="price">$${s.price}</span>
    </a>`)
  .join('');
initReveal(list);

const wrap = document.getElementById('testimonials');
const slides = [...wrap.querySelectorAll('.testimonial')];
const dots = wrap.querySelector('.dots');
let index = 0;
let timer;

slides.forEach((_, i) => {
  const b = document.createElement('button');
  b.setAttribute('aria-label', `Show testimonial ${i + 1}`);
  b.addEventListener('click', () => go(i));
  dots.append(b);
});

function go(i) {
  index = (i + slides.length) % slides.length;
  slides.forEach((s, j) => s.classList.toggle('active', j === index));
  [...dots.children].forEach((d, j) => d.classList.toggle('active', j === index));
  clearInterval(timer);
  timer = setInterval(() => go(index + 1), 5500);
}
go(0);

const arch = document.getElementById('heroArch');
const visual = arch.parentElement;
if (!window.matchMedia('(hover: none)').matches) {
  visual.addEventListener('mousemove', (e) => {
    const r = visual.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    arch.style.transform = `perspective(1000px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
  });
  visual.addEventListener('mouseleave', () => (arch.style.transform = ''));
}