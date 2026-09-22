/* =========================================================
   bibi rosa — site behavior
   Small, dependency-free enhancements: mobile nav, sticky-header
   shadow, scroll reveal, back-to-top, image fallback, footer year.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Mobile nav toggle ---------- */
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close the mobile menu after tapping a link
    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Sticky header shadow on scroll ---------- */
  const header = document.querySelector('.site-header');
  const toggleHeaderShadow = () => {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 8);
  };
  toggleHeaderShadow();
  window.addEventListener('scroll', toggleHeaderShadow, { passive: true });

  /* ---------- Back-to-top button ---------- */
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    const toggleBackToTop = () => {
      backToTop.classList.toggle('visible', window.scrollY > 480);
    };
    toggleBackToTop();
    window.addEventListener('scroll', toggleBackToTop, { passive: true });

    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- Gentle scroll-reveal for content blocks ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealEls.forEach((el) => observer.observe(el));
  } else {
    // No IntersectionObserver support: just show everything
    revealEls.forEach((el) => el.classList.add('in-view'));
  }

  /* ---------- Image fallback ----------
     If a photo hasn't been added yet (e.g. images/hero.jpg is
     missing), show a soft placeholder with the figure's
     data-fallback text instead of a broken image icon. */
  document.querySelectorAll('.photo img').forEach((img) => {
    img.addEventListener('error', () => {
      const figure = img.closest('.photo');
      if (figure) figure.classList.add('missing');
    }, { once: true });
  });

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Photo carousels ----------
     Simple crossfade carousel, no dependencies. Auto-advances,
     pauses on hover, and builds its own dot nav. Used for both the
     top banner and the closing photo strip. */
  function initCarousel(container, dotsWrap, intervalMs) {
    if (!container) return;
    const slides = Array.from(container.querySelectorAll('.carousel-slide'));
    if (!slides.length) return;

    let current = Math.max(0, slides.findIndex((s) => s.classList.contains('is-active')));
    if (current === -1) current = 0;
    let timer = null;

    if (dotsWrap && slides.length > 1) {
      slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', `Show photo ${i + 1}`);
        if (i === current) dot.classList.add('is-active');
        dot.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(dot);
      });
    }

    function goTo(index) {
      slides[current].classList.remove('is-active');
      dotsWrap?.children[current]?.classList.remove('is-active');
      current = (index + slides.length) % slides.length;
      slides[current].classList.add('is-active');
      dotsWrap?.children[current]?.classList.add('is-active');
    }

    function next() { goTo(current + 1); }

    function start() {
      if (slides.length > 1) timer = setInterval(next, intervalMs);
    }
    function stop() {
      if (timer) clearInterval(timer);
    }

    start();
    container.addEventListener('mouseenter', stop);
    container.addEventListener('mouseleave', start);
  }

  // Top banner: a touch faster, since it's the very first thing visitors see
  initCarousel(
    document.querySelector('[data-carousel="top"]'),
    document.getElementById('topCarouselDots'),
    4500
  );

  // Closing photo strip, just before the footer
  initCarousel(
    document.getElementById('carousel'),
    document.getElementById('carouselDots'),
    5000
  );

});
