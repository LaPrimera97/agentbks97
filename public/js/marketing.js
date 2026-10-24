/* ═══════════════════════════════════════════════════
   AGENT BKS97 — marketing.js
   Interactions for index.html (marketing page)
═══════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── BG PARTICLES ─────────────────────────────── */
  Particles.init('bg-canvas');

  /* ── NAV SCROLL ───────────────────────────────── */
  const nav = document.getElementById('mkt-nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  });

  /* ── MOBILE MENU ──────────────────────────────── */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
    document.body.style.overflow =
      mobileMenu.classList.contains('open') ? 'hidden' : '';
  });
  document.querySelectorAll('.mm-link').forEach(a => {
    a.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  /* ── SCROLL REVEAL ────────────────────────────── */
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        revealObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  /* ── TEMPLATE CARDS ───────────────────────────── */
  document.querySelectorAll('[data-template]').forEach(card => {
    card.addEventListener('click', () => {
      const key = card.dataset.template;
      const prompt = TEMPLATES[key];
      if (prompt) {
        sessionStorage.setItem('agentbks97_prompt', prompt);
      }
      window.location.href = CONFIG.BUILDER_URL;
    });
  });

  /* ── LAUNCH BUILDER BUTTONS ───────────────────── */
  document.querySelectorAll('[data-launch-builder]').forEach(btn => {
    btn.addEventListener('click', () => {
      window.location.href = CONFIG.BUILDER_URL;
    });
  });

});
