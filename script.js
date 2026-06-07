/* ================================================
   069Digital — Premium Agency JS
   ================================================ */

// ── NAV SCROLL ───────────────────────────────
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// ── MOBILE MENU ──────────────────────────────
const burger     = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');
const mobileLinks = document.querySelectorAll('.mobile-link');

burger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
  const spans = burger.querySelectorAll('span');
  const open  = mobileMenu.classList.contains('open');
  spans[0].style.transform = open ? 'rotate(45deg) translate(5px, 5px)' : '';
  spans[1].style.opacity   = open ? '0' : '';
  spans[2].style.transform = open ? 'rotate(-45deg) translate(5px, -5px)' : '';
  // prevent body scroll when menu open
  document.body.style.overflow = open ? 'hidden' : '';
});

mobileLinks.forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
    const spans = burger.querySelectorAll('span');
    spans[0].style.transform = '';
    spans[1].style.opacity   = '';
    spans[2].style.transform = '';
  });
});

// ── SCROLL REVEAL ────────────────────────────
// Lower threshold on mobile for faster reveals
const isMobile = window.innerWidth <= 768;
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, {
  threshold: isMobile ? 0.05 : 0.1,
  rootMargin: isMobile ? '0px 0px -30px 0px' : '0px 0px -60px 0px'
});

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── COUNTER ANIMATION ────────────────────────
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.stat__number').forEach(el => counterObserver.observe(el));

function animateCounter(el) {
  const target   = parseInt(el.dataset.target, 10);
  if (isNaN(target)) return;
  const duration = 1800;
  const start    = performance.now();

  function step(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ── TOUCH: Portfolio tap to show overlay ─────
if ('ontouchstart' in window) {
  document.querySelectorAll('.portfolio-item__img').forEach(item => {
    item.addEventListener('touchstart', () => {
      // remove active from all others
      document.querySelectorAll('.portfolio-item__img').forEach(i => i.classList.remove('touch-active'));
      item.classList.add('touch-active');
    }, { passive: true });
  });
}

// ── CONTACT FORM ─────────────────────────────
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    btn.textContent     = 'Nachricht gesendet ✓';
    btn.style.background = '#22c55e';
    btn.disabled        = true;

    setTimeout(() => {
      btn.textContent     = 'Nachricht senden';
      btn.style.background = '';
      btn.disabled        = false;
      contactForm.reset();
    }, 4000);
  });
}

// ── SMOOTH SCROLL OFFSET (fixed nav) ─────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = isMobile ? 65 : 80;
    window.scrollTo({
      top: target.getBoundingClientRect().top + window.scrollY - offset,
      behavior: 'smooth'
    });
  });
});

// ── PARALLAX HERO GLOW (desktop only) ────────
if (!isMobile) {
  const glow = document.querySelector('.hero__glow');
  if (glow) {
    window.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth  - 0.5) * 40;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      glow.style.transform = `translateX(calc(-50% + ${x}px)) translateY(${y}px)`;
    }, { passive: true });
  }
}
