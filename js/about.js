const timeline = document.getElementById('timeline');
const progress = timeline.querySelector('.timeline-progress');

function update() {
  const r = timeline.getBoundingClientRect();
  const viewMid = window.innerHeight * 0.6;
  const filled = Math.min(Math.max(viewMid - r.top, 0), r.height);
  progress.style.height = `${filled}px`;
}

window.addEventListener('scroll', update, { passive: true });
window.addEventListener('resize', update);
update();

document.querySelectorAll('.team-card img').forEach((img) => {
  img.addEventListener('error', () => img.remove());
});