/* ═══════════════════════════════════════
   MFN DUALITY STUDIO — main.js
   ═══════════════════════════════════════ */

'use strict';

/* ── PHONE NUMBER — cambiar por el real ── */
const WA_NUMBER = 'TU_NUMERO'; // ej: 5491112345678

/* ── WA URL BUILDER ── */
function waURL(msg) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
}

/* ════════════════════════════════════════
   1. NAVBAR — scroll shadow + active link
   ════════════════════════════════════════ */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');

  // Scroll shadow
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 24);
  }, { passive: true });

  // Hamburger toggle
  hamburger?.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu?.classList.toggle('open');
  });

  // Close mobile menu on link click
  mobileMenu?.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      hamburger?.classList.remove('open');
      mobileMenu.classList.remove('open');
    });
  });

  // Active nav link on scroll
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => link.classList.remove('active'));
        const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
        active?.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => sectionObserver.observe(s));
})();

/* ════════════════════════════════════════
   2. SCROLL ANIMATIONS (fade-up, fade-left, fade-right)
   ════════════════════════════════════════ */
(function initScrollAnimations() {
  const targets = document.querySelectorAll('.fade-up, .fade-left, .fade-right');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger siblings inside .stagger containers
        const parent = entry.target.parentElement;
        let delay = 0;
        if (parent?.classList.contains('stagger')) {
          const siblings = [...parent.children];
          delay = siblings.indexOf(entry.target) * 90;
        }
        setTimeout(() => entry.target.classList.add('visible'), delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(el => observer.observe(el));
})();

/* ════════════════════════════════════════
   3. MENU FILTER
   ════════════════════════════════════════ */
(function initMenuFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const menuCards  = document.querySelectorAll('.menu-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const cat = btn.dataset.filter;

      menuCards.forEach(card => {
        const match = cat === 'all' || card.dataset.cat === cat;
        if (match) {
          card.classList.remove('hidden');
          // Re-trigger fade
          card.classList.remove('visible');
          requestAnimationFrame(() => {
            setTimeout(() => card.classList.add('visible'), 60);
          });
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
})();

/* ════════════════════════════════════════
   4. WA LINKS — inject dynamic URLs
   ════════════════════════════════════════ */
(function injectWALinks() {
  document.querySelectorAll('[data-wa-msg]').forEach(el => {
    const msg = el.getAttribute('data-wa-msg');
    el.href = waURL(msg);
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener noreferrer');
  });
})();

/* ════════════════════════════════════════
   5. SMOOTH SCROLL for anchor links
   ════════════════════════════════════════ */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = 72; // navbar height
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

/* ════════════════════════════════════════
   6. HERO — parallax subtle effect
   ════════════════════════════════════════ */
(function initHeroParallax() {
  const heroRight = document.querySelector('.hero-right img');
  if (!heroRight || window.innerWidth < 900) return;

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    if (scrolled < window.innerHeight) {
      heroRight.style.transform = `scale(1.03) translateY(${scrolled * 0.12}px)`;
    }
  }, { passive: true });
})();

/* ════════════════════════════════════════
   7. COUNTER ANIMATION (hero stats)
   ════════════════════════════════════════ */
(function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el      = entry.target;
      const target  = parseInt(el.dataset.count, 10);
      const suffix  = el.dataset.suffix || '';
      const duration = 1800;
      const start   = performance.now();

      function step(now) {
        const progress = Math.min((now - start) / duration, 1);
        // easeOutExpo
        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        el.textContent = Math.floor(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
})();

/* ════════════════════════════════════════
   8. TESTIMONIALS CAROUSEL (mobile)
   ════════════════════════════════════════ */
(function initTestimonialsCarousel() {
  const grid = document.querySelector('.testimonios-grid');
  if (!grid) return;

  let isDragging = false, startX = 0, scrollLeft = 0;

  function enableCarousel() {
    if (window.innerWidth <= 900) {
      grid.style.overflowX = 'auto';
      grid.style.scrollSnapType = 'x mandatory';
      grid.style.WebkitOverflowScrolling = 'touch';
      grid.querySelectorAll('.testimonio-card').forEach(card => {
        card.style.scrollSnapAlign = 'start';
        card.style.minWidth = '300px';
      });
    } else {
      grid.style.overflowX = '';
      grid.style.scrollSnapType = '';
    }
  }

  enableCarousel();
  window.addEventListener('resize', enableCarousel);
})();

/* ════════════════════════════════════════
   9. LAZY IMAGE LOADING
   ════════════════════════════════════════ */
(function initLazyImages() {
  if (!('IntersectionObserver' in window)) return;

  const images = document.querySelectorAll('img[data-src]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        observer.unobserve(img);
      }
    });
  }, { rootMargin: '200px' });

  images.forEach(img => observer.observe(img));
})();

/* ════════════════════════════════════════
   10. STICKY NAV LINK HIGHLIGHT
   ════════════════════════════════════════ */
(function highlightNavOnLoad() {
  // Highlight current section on page load
  window.dispatchEvent(new Event('scroll'));
})();

console.log('🍵 MFN Duality Studio — JS cargado correctamente');
