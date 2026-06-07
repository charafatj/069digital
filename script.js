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

// ── PORTFOLIO CAROUSEL (mobile) ──────────────
const track = document.getElementById('carouselTrack');
const dots  = document.querySelectorAll('.carousel-dot');

if (track) {
  // Update active dot + slide on scroll
  const slides = track.querySelectorAll('.carousel-slide');
  const updateCarousel = () => {
    const center = track.scrollLeft + track.offsetWidth / 2;
    let closest = 0, minDist = Infinity;
    slides.forEach((slide, i) => {
      const dist = Math.abs(slide.offsetLeft + slide.offsetWidth / 2 - center);
      if (dist < minDist) { minDist = dist; closest = i; }
    });
    slides.forEach((s, i) => s.classList.toggle('active-slide', i === closest));
    dots.forEach((d, i) => d.classList.toggle('active', i === closest));
  };

  track.addEventListener('scroll', updateCarousel, { passive: true });
  updateCarousel();

  // Dot click → scroll to slide
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const i = parseInt(dot.dataset.index);
      slides[i].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    });
  });

  // Mouse drag support
  let isDragging = false, startX = 0, scrollStart = 0;
  track.addEventListener('mousedown', e => {
    isDragging = true; startX = e.pageX; scrollStart = track.scrollLeft;
    track.classList.add('grabbing');
  });
  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    track.scrollLeft = scrollStart - (e.pageX - startX);
  });
  window.addEventListener('mouseup', () => {
    isDragging = false;
    track.classList.remove('grabbing');
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

// ── SCROLL PROGRESS BAR ───────────────────────
const progressBar = document.getElementById('scrollProgress');
if (progressBar) {
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const total    = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = (scrolled / total * 100) + '%';
  }, { passive: true });
}

// ── CUSTOM CURSOR (desktop only) ─────────────
const cursor     = document.getElementById('cursor');
const cursorRing = document.getElementById('cursorRing');
if (cursor && cursorRing && !isMobile) {
  let cx = 0, cy = 0, rx = 0, ry = 0;

  window.addEventListener('mousemove', e => {
    cx = e.clientX; cy = e.clientY;
    cursor.style.left = cx + 'px';
    cursor.style.top  = cy + 'px';
  }, { passive: true });

  // Ring follows with lag
  (function animateRing() {
    rx += (cx - rx) * 0.12;
    ry += (cy - ry) * 0.12;
    cursorRing.style.left = rx + 'px';
    cursorRing.style.top  = ry + 'px';
    requestAnimationFrame(animateRing);
  })();

  // Hover state on interactive elements
  document.querySelectorAll('a, button, .carousel-slide, .service-card, .portfolio-item').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('cursor--hover');
      cursorRing.classList.add('cursor-ring--hover');
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('cursor--hover');
      cursorRing.classList.remove('cursor-ring--hover');
    });
  });
}

// ── STICKY MOBILE CTA ────────────────────────
const stickyCta = document.getElementById('stickyCta');
if (stickyCta && isMobile) {
  const hero = document.getElementById('hero');
  const contact = document.getElementById('kontakt');
  window.addEventListener('scroll', () => {
    const heroBottom    = hero ? hero.getBoundingClientRect().bottom : 0;
    const contactTop    = contact ? contact.getBoundingClientRect().top : window.innerHeight;
    const pastHero      = heroBottom < 0;
    const beforeContact = contactTop > window.innerHeight;
    stickyCta.classList.toggle('visible', pastHero && beforeContact);
  }, { passive: true });
}
