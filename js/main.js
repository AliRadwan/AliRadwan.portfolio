// Progressive enhancement only: the page is fully usable without this file.

const root = document.documentElement;
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* Theme toggle ------------------------------------------------------------ */
$('#theme-toggle')?.addEventListener('click', () => {
  const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
  root.dataset.theme = next;
  try { localStorage.setItem('theme', next); } catch {}
});

/* Mobile navigation ------------------------------------------------------- */
const nav = $('#nav');
const navToggle = $('#nav-toggle');

const setNav = (open) => {
  nav.classList.toggle('is-open', open);
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
};

navToggle?.addEventListener('click', () => setNav(!nav.classList.contains('is-open')));
nav?.addEventListener('click', (e) => { if (e.target.closest('a')) setNav(false); });
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && nav.classList.contains('is-open')) {
    setNav(false);
    navToggle.focus();
  }
});

/* Header border once the page scrolls ------------------------------------- */
const header = $('.site-header');
const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* Reveal on scroll -------------------------------------------------------- */
const revealables = $$('[data-reveal]');

// Stagger siblings inside the same grid for a subtle cascade.
revealables.forEach((el) => {
  const siblings = [...el.parentElement.children].filter((c) => c.hasAttribute('data-reveal'));
  const i = siblings.indexOf(el);
  if (i > 0) el.style.setProperty('--delay', `${Math.min(i, 6) * 70}ms`);
});

const revealObserver = new IntersectionObserver((entries, obs) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    obs.unobserve(entry.target);
  });
}, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

revealables.forEach((el) => revealObserver.observe(el));

/* Scroll-spy: highlight the nav link of the section in view --------------- */
const links = new Map($$('.nav a').map((a) => [a.hash.slice(1), a]));

const spy = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    links.forEach((a) => a.removeAttribute('aria-current'));
    links.get(entry.target.id)?.setAttribute('aria-current', 'true');
  });
}, { rootMargin: '-45% 0px -50% 0px' });

links.forEach((_, id) => { const s = document.getElementById(id); if (s) spy.observe(s); });

/* Footer year ------------------------------------------------------------- */
$('#year').textContent = new Date().getFullYear();
