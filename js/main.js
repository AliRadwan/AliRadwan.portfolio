// Progressive enhancement only: the page is fully usable without this file.
window.__app = true;

const root = document.documentElement;
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Hero intro: start once the web font is ready so lines don't reflow mid-animation */
Promise.race([document.fonts?.ready, new Promise((r) => setTimeout(r, 600))])
  .then(() => requestAnimationFrame(() => root.classList.add('is-loaded')));

/* Mobile navigation ------------------------------------------------------- */
const nav = $('#nav');
const navToggle = $('#nav-toggle');

const setNav = (open) => {
  nav.classList.toggle('is-open', open);
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
};

navToggle.addEventListener('click', () => setNav(!nav.classList.contains('is-open')));
nav.addEventListener('click', (e) => { if (e.target.closest('a')) setNav(false); });
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && nav.classList.contains('is-open')) {
    setNav(false);
    navToggle.focus();
  }
});

/* Header turns solid once the page scrolls -------------------------------- */
const header = $('.site-header');
const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* Split headings into words that rise from a mask ------------------------- */
$$('[data-split]').forEach((el) => {
  const words = el.textContent.trim().split(/\s+/);
  el.setAttribute('aria-label', el.textContent.trim());
  el.innerHTML = words
    .map((w, i) => `<span class="w" aria-hidden="true"><span style="--wi:${i}">${w}</span></span>`)
    .join(' ');
});

/* Count-up numbers -------------------------------------------------------- */
const countUp = (el) => {
  const end = Number(el.dataset.count);
  const suffix = el.dataset.suffix || '';
  const duration = 1400;
  const start = performance.now();
  const tick = (now) => {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 4);
    el.textContent = Math.round(end * eased) + suffix;
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

/* Reveal on scroll -------------------------------------------------------- */
const revealables = $$('[data-reveal], [data-split]');

// Stagger siblings that share a parent for a subtle cascade.
$$('[data-reveal]').forEach((el) => {
  const siblings = [...el.parentElement.children].filter((c) => c.hasAttribute('data-reveal'));
  const i = siblings.indexOf(el);
  if (i > 0) el.style.setProperty('--delay', `${Math.min(i, 6) * 80}ms`);
});

if (!reduceMotion) $$('[data-count]').forEach((el) => { el.textContent = '0' + (el.dataset.suffix || ''); });

const revealObserver = new IntersectionObserver((entries, obs) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    el.classList.add('is-visible');
    if (!reduceMotion) $$('[data-count]', el).forEach(countUp);
    obs.unobserve(el);
  });
}, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });

revealables.forEach((el) => revealObserver.observe(el));

/* Seamless marquee: duplicate the track once, then animate -50% ----------- */
const marquee = $('.marquee');
if (marquee && !reduceMotion) {
  const track = $('.marquee-track', marquee);
  [...track.children].forEach((li) => {
    const clone = li.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.append(clone);
  });
  marquee.classList.add('is-running');
}

/* Scroll-spy: highlight the nav link of the section in view --------------- */
const links = new Map($$('.nav a').map((a) => [a.hash.slice(1), a]));

const spy = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    links.forEach((a) => a.removeAttribute('aria-current'));
    links.get(entry.target.id)?.setAttribute('aria-current', 'true');
  });
}, { rootMargin: '-45% 0px -50% 0px' });

$$('main section[id]').forEach((s) => spy.observe(s));

/* Copy email -------------------------------------------------------------- */
const copyBtn = $('.copy-btn');
const copyStatus = $('#copy-status');
copyBtn?.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(copyBtn.dataset.copy);
  } catch {
    return; // clipboard blocked: the mailto button is still right there
  }
  copyBtn.classList.add('is-copied');
  $('.copy-label', copyBtn).textContent = 'Copied!';
  copyStatus.textContent = 'Email address copied to clipboard';
  setTimeout(() => {
    copyBtn.classList.remove('is-copied');
    $('.copy-label', copyBtn).textContent = 'Copy email';
    copyStatus.textContent = '';
  }, 2200);
});

/* Footer year ------------------------------------------------------------- */
$('#year').textContent = new Date().getFullYear();
