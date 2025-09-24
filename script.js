/* =========================
   Gurpreet Portfolio Script
   ========================= */

// ---------- Helpers ----------
const $ = (q, root = document) => root.querySelector(q);
const $$ = (q, root = document) => Array.from(root.querySelectorAll(q));

function getNavOffset() {
  // Prefer CSS var, fallback to measuring header
  const css = getComputedStyle(document.documentElement).getPropertyValue('--nav-offset');
  const cssVal = parseInt(css, 10);
  if (!isNaN(cssVal) && cssVal > 0) return cssVal;

  const header = $('header.nav');
  return header ? Math.round(header.getBoundingClientRect().height + 12) : 96;
}

function setNavOffsetVar() {
  const header = $('header.nav');
  const h = header ? Math.round(header.getBoundingClientRect().height + 12) : 96;
  document.documentElement.style.setProperty('--nav-offset', `${h}px`);
}

// ---------- Footer year ----------
const yr = $('#yr');
if (yr) yr.textContent = new Date().getFullYear();

// Keep --nav-offset in sync with layout
setNavOffsetVar();
window.addEventListener('resize', setNavOffsetVar);

// ---------- Nav blur on scroll ----------
const header = $('header.nav');
function applyScrolledClass() {
  if (!header) return;
  if (window.scrollY > 10) header.classList.add('scrolled');
  else header.classList.remove('scrolled');
}
applyScrolledClass();
window.addEventListener('scroll', applyScrolledClass, { passive: true });

// ---------- Smooth anchor scroll with fixed-header offset ----------
function smoothScrollToId(id) {
  const target = document.getElementById(id);
  if (!target) return;
  const offset = getNavOffset();
  const y = target.getBoundingClientRect().top + window.pageYOffset - offset + 1;
  window.scrollTo({ top: y, behavior: 'smooth' });
}

function wireSmoothLinks(scope = document) {
  $$('a[href^="#"]', scope).forEach(a => {
    a.addEventListener('click', e => {
      const hash = a.getAttribute('href');
      const id = hash && hash.slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;

      e.preventDefault();
      smoothScrollToId(id);

      // reflect the hash without jump
      if (history.replaceState) history.replaceState(null, '', `#${id}`);

      // close mobile drawer if open
      document.body.classList.remove('menu-open');
    });
  });
}
wireSmoothLinks(); // top nav
// drawer links wired after drawer exists (below)

// ---------- Mobile drawer ----------
const menuBtn = $('.menu-toggle');
const drawer = $('#nav-drawer');

function setDrawer(open) {
  document.body.classList.toggle('menu-open', open);
  menuBtn?.setAttribute('aria-expanded', open ? 'true' : 'false');
}

if (menuBtn && drawer) {
  menuBtn.addEventListener('click', () => {
    setDrawer(!document.body.classList.contains('menu-open'));
  });

  // Clicks inside drawer to sections
  wireSmoothLinks(drawer);

  // Close on outside click
  document.addEventListener('click', e => {
    if (!document.body.classList.contains('menu-open')) return;
    const within =
      e.target.closest('#nav-drawer') ||
      e.target.closest('.menu-toggle') ||
      e.target.closest('.navbar');
    if (!within) setDrawer(false);
  });

  // Close on Esc
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') setDrawer(false);
  });
}

// ---------- Active link highlight ----------
const sections = $$('main section[id]');
const topLinks = $$('.links a[href^="#"]');

function markActiveLink() {
  const offset = getNavOffset();
  let best = null;
  let bestDist = Infinity;

  sections.forEach(sec => {
    const rect = sec.getBoundingClientRect();
    if (rect.bottom < offset) return; // section fully above viewport top
    const dist = Math.abs(rect.top - offset);
    if (dist < bestDist) { best = sec; bestDist = dist; }
  });

  topLinks.forEach(a => a.classList.remove('active'));
  if (best) {
    const active = $(`.links a[href="#${best.id}"]`);
    active?.classList.add('active');
  }
}
markActiveLink();
window.addEventListener('scroll', markActiveLink, { passive: true });
window.addEventListener('resize', markActiveLink);

// ---------- Reveal-on-scroll for .reveal ----------
(function revealOnScroll(){
  const els = $$('.reveal');

  function show(el){ el.classList.add('show'); }

  if ('IntersectionObserver' in window){
    const io = new IntersectionObserver((entries, obs)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          show(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    els.forEach(el => io.observe(el));
  } else {
    els.forEach(show);
  }
})();

// ---------- Optional: Skill tiles tooltip/level fill (safe if not present) ----------
(function skillsUI(){
  const levelToPct = {
    Basics: 40, Beginner: 50, Learning: 60,
    Intermediate: 72, Comfortable: 80, Advanced: 90
  };
  $$('.skill').forEach(el => {
    const lvl = el.dataset.level || 'Basics';
    const pct = levelToPct[lvl] ?? 50;
    const bar = el.querySelector('.bar > span');
    if (bar) requestAnimationFrame(() => (bar.style.width = pct + '%'));

    const notes = el.dataset.notes || '';
    if (!el.querySelector('.tooltip')) {
      const tip = document.createElement('div');
      tip.className = 'tooltip';
      tip.textContent = `${lvl}${notes ? ' • ' + notes : ''}`;
      el.appendChild(tip);
    }
  });
})();
