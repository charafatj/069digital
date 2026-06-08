/* ================================================
   069Digital — Premium Agency JS
   ================================================ */

// ── LANGUAGE / i18n ──────────────────────────
const translations = {
  de: {
    'nav-services': 'Leistungen', 'nav-work': 'Arbeiten', 'nav-about': 'Über uns', 'nav-cta': 'Projekt starten',
    'hero-headline': 'Wir erwecken Ihre<br /><span class="gradient-text">Ideen</span><br />zum Leben.',
    'hero-sub': '069Digital ist deine Agentur für Webdesign, Branding &amp; Performance.<br />Wir verbinden Strategie, Design und Technologie — präzise, modern, wirkungsvoll.',
    'hero-btn-primary': 'Projekt starten', 'hero-btn-ghost': 'Unsere Arbeiten',
    'stat-1': 'Projekte abgeschlossen', 'stat-2': 'Zufriedene Kunden', 'stat-3': 'Jahre Erfahrung', 'stat-4': 'Ø ROI unserer Kunden',
    'svc-label': 'Was wir tun', 'svc-title': 'Unsere Leistungen', 'svc-desc': 'Von der ersten Idee bis zum fertigen Produkt — wir begleiten dich auf dem gesamten digitalen Weg.',
    's1-title': 'Webdesign & Entwicklung', 's1-desc': 'Maßgeschneiderte Websites und Web-Applikationen mit höchstem Anspruch an Design, Performance und Nutzererfahrung.', 's1-li1': 'Corporate Websites', 's1-li2': 'Landing Pages', 's1-li3': 'E-Commerce', 's1-li4': 'Web-Applikationen',
    's2-title': 'Branding & Corporate Design', 's2-desc': 'Wir entwickeln starke Markenidentitäten — von Logo und Farbwelt bis zum vollständigen Corporate Design System.', 's2-li1': 'Logo Design', 's2-li2': 'Brand Strategy', 's2-li3': 'Design System', 's2-li4': 'Brand Guidelines',
    's3-title': 'SEO & Performance', 's3-desc': 'Organische Sichtbarkeit, technische Optimierung und messbare Ergebnisse — wir sorgen dafür, dass du gefunden wirst.', 's3-li1': 'Technisches SEO', 's3-li2': 'Content-Strategie', 's3-li3': 'Core Web Vitals', 's3-li4': 'SEO-Audits',
    's4-title': 'Performance Marketing', 's4-desc': 'Datengetriebene Kampagnen auf Google, Meta & Co. — mit klarem Fokus auf ROAS, Conversions und Wachstum.', 's4-li1': 'Google Ads', 's4-li2': 'Meta Ads', 's4-li3': 'Conversion-Optimierung', 's4-li4': 'Kampagnen-Analyse',
    's5-title': 'Social Media & Content', 's5-desc': 'Authentischer, strategischer Content — der deine Marke auf den richtigen Kanälen sichtbar macht.', 's5-li1': 'Social Media Strategie', 's5-li2': 'Content Creation', 's5-li3': 'Community Management', 's5-li4': 'Influencer Marketing',
    's6-title': 'Strategie & Beratung', 's6-desc': 'Digitale Strategie, Marktanalyse und Transformation — wir denken mit dir langfristig und liefern echten Business-Impact.', 's6-li1': 'Digitalstrategie', 's6-li2': 'Marktanalyse', 's6-li3': 'UX-Beratung', 's6-li4': 'Growth Hacking',
    'proc-label': 'Wie wir arbeiten', 'proc-title': 'Unser Prozess', 'proc-desc': 'Klar strukturiert. Transparent. Ergebnisorientiert.',
    'proc-1-title': 'Discovery', 'proc-1-desc': 'Wir analysieren dein Unternehmen, deine Ziele und den Markt — bevor wir auch nur eine Zeile Code schreiben.',
    'proc-2-title': 'Strategie', 'proc-2-desc': 'Auf Basis der Analyse entwickeln wir eine maßgeschneiderte digitale Strategie mit klaren Meilensteinen.',
    'proc-3-title': 'Design', 'proc-3-desc': 'Wir gestalten intuitive, ästhetische Interfaces — mit Fokus auf Brand, UX und Konversionsrate.',
    'proc-4-title': 'Launch & Wachstum', 'proc-4-desc': 'Sauber implementiert, live gebracht und kontinuierlich optimiert — für nachhaltige Ergebnisse.',
    'port-label': 'Ausgewählte Projekte', 'port-title': 'Unsere Arbeiten', 'port-desc': 'Projekte, auf die wir stolz sind — und Kunden, die noch stolzer sind.',
    'port-sm-desc': 'Von der Plattform bis zur Community — wir haben Smart Market digital aufgebaut und skaliert.',
    'port-ph-desc': 'Wenn Auftreten alles ist. Wir haben sichergestellt, dass Pro Hilfe auf dem Parkett gesehen — und nicht vergessen wird.',
    'port-pb-desc': 'Von Seite 4 auf Position 1 — lokales SEO-Projekt mit messbarem Wachstum für ein Frankfurter Bauunternehmen seit 1994.',
    'port-mc-desc': 'End-to-End Design und Entwicklung einer B2B-SaaS-Plattform für den Gesundheitssektor.',
    'port-link': 'Projekt ansehen →', 'port-cta-label': 'Projekte', 'port-cta-desc': 'Jedes davon einzigartig. Keines dem Zufall überlassen.', 'port-cta-btn': 'Starte jetzt.',
    'test-label': 'Kundenstimmen', 'test-title': 'Was unsere Kunden sagen',
    'test-1': '"069Digital hat Smart Market auf ein neues Level gebracht. Von der ersten Idee bis zur Umsetzung — das Team denkt mit, liefert pünktlich und übertrifft jedes Mal die Erwartungen. Wer echte Ergebnisse will, ist hier genau richtig."',
    'test-1-role': 'Gründer & CEO, Smart Market',
    'test-2': '"Professionell, zuverlässig und kreativ. Das Team von 069Digital hat unser Branding von Grund auf neu gedacht — mit einem Ergebnis, das unsere Kunden begeistert."',
    'test-2-role': 'Gründerin, Nexus Finance',
    'test-3': '"Dank 069Digital sind wir jetzt die Nr. 1 in Frankfurt für unsere Nische. Das SEO-Projekt war eine der besten Investitionen, die wir je gemacht haben."',
    'test-3-role': 'Geschäftsführer, ProBau GmbH',
    'about-label': 'Über uns', 'about-title': 'Wir sind 069Digital',
    'about-p1': 'Gegründet in Frankfurt am Main, arbeiten wir mit Unternehmen zusammen, die digitales Wachstum nicht dem Zufall überlassen wollen.',
    'about-p2': 'Unser Team aus Designern, Entwicklern und Strategisten bringt jahrelange Erfahrung aus Agenturen, Startups und internationalen Konzernen mit.',
    'about-p3': 'Wir glauben: <strong>Jedes Unternehmen verdient einen starken digitalen Auftritt.</strong>',
    'about-v1-title': 'Qualität', 'about-v1-desc': 'Kein Kompromiss bei Details.',
    'about-v2-title': 'Transparenz', 'about-v2-desc': 'Klare Kommunikation, jederzeit.',
    'about-v3-title': 'Wirkung', 'about-v3-desc': 'Ergebnisse, die messbar sind.',
    'about-m1': 'Projekte', 'about-m2': 'Jahre', 'about-m3': 'Ideen',
    'about-card-label': 'Ihr Wachstum ist unser Auftrag.',
    'cta-title': 'Bereit für das nächste Level?', 'cta-desc': 'Lass uns gemeinsam dein nächstes digitales Projekt angehen.', 'cta-btn': 'Jetzt Gespräch vereinbaren',
    'contact-label': 'Kontakt', 'contact-title': 'Lass uns reden.', 'contact-desc': 'Schildere uns dein Projekt — wir melden uns innerhalb von 24 Stunden mit einer ersten Einschätzung.',
    'form-name-label': 'Name', 'form-name-ph': 'Max Mustermann',
    'form-email-label': 'E-Mail', 'form-email-ph': 'max@firma.de',
    'form-company-label': 'Unternehmen', 'form-company-ph': 'Muster GmbH',
    'form-service-label': 'Leistung', 'form-service-ph': 'Bitte auswählen',
    'form-msg-label': 'Nachricht', 'form-msg-ph': 'Beschreibe kurz dein Projekt und deine Ziele…',
    'form-submit': 'Nachricht senden', 'form-note': 'Wir antworten innerhalb von 24 Stunden.',
    'footer-desc': 'Premium Digitalagentur<br />Frankfurt am Main',
    'footer-col1': 'Leistungen', 'footer-col2': 'Agentur',
    'footer-col2-about': 'Über uns', 'footer-col2-projects': 'Projekte', 'footer-col2-contact': 'Kontakt', 'footer-col2-career': 'Karriere',
    'footer-col3': 'Rechtliches', 'footer-col3-imprint': 'Impressum', 'footer-col3-privacy': 'Datenschutz', 'footer-col3-terms': 'AGB',
  },
  en: {
    'nav-services': 'Services', 'nav-work': 'Work', 'nav-about': 'About', 'nav-cta': 'Start Project',
    'hero-headline': 'We bring Your<br /><span class="gradient-text">Ideas</span><br />to Life.',
    'hero-sub': '069Digital is your agency for web design, branding &amp; performance.<br />We connect strategy, design and technology — precise, modern, impactful.',
    'hero-btn-primary': 'Start Project', 'hero-btn-ghost': 'Our Work',
    'stat-1': 'Projects completed', 'stat-2': 'Satisfied clients', 'stat-3': 'Years of experience', 'stat-4': 'Avg. client ROI',
    'svc-label': 'What we do', 'svc-title': 'Our Services', 'svc-desc': 'From the first idea to the finished product — we guide you through the entire digital journey.',
    's1-title': 'Web Design & Development', 's1-desc': 'Tailored websites and web applications with the highest standards in design, performance, and user experience.', 's1-li1': 'Corporate Websites', 's1-li2': 'Landing Pages', 's1-li3': 'E-Commerce', 's1-li4': 'Web Applications',
    's2-title': 'Branding & Corporate Design', 's2-desc': 'We create strong brand identities — from logo and color palette to a complete corporate design system.', 's2-li1': 'Logo Design', 's2-li2': 'Brand Strategy', 's2-li3': 'Design System', 's2-li4': 'Brand Guidelines',
    's3-title': 'SEO & Performance', 's3-desc': 'Organic visibility, technical optimization, and measurable results — we make sure you get found.', 's3-li1': 'Technical SEO', 's3-li2': 'Content Strategy', 's3-li3': 'Core Web Vitals', 's3-li4': 'SEO Audits',
    's4-title': 'Performance Marketing', 's4-desc': 'Data-driven campaigns on Google, Meta & more — with a clear focus on ROAS, conversions, and growth.', 's4-li1': 'Google Ads', 's4-li2': 'Meta Ads', 's4-li3': 'Conversion Optimization', 's4-li4': 'Campaign Analysis',
    's5-title': 'Social Media & Content', 's5-desc': 'Authentic, strategic content — that makes your brand visible on the right channels.', 's5-li1': 'Social Media Strategy', 's5-li2': 'Content Creation', 's5-li3': 'Community Management', 's5-li4': 'Influencer Marketing',
    's6-title': 'Strategy & Consulting', 's6-desc': 'Digital strategy, market analysis, and transformation — we think long-term with you and deliver real business impact.', 's6-li1': 'Digital Strategy', 's6-li2': 'Market Analysis', 's6-li3': 'UX Consulting', 's6-li4': 'Growth Hacking',
    'proc-label': 'How we work', 'proc-title': 'Our Process', 'proc-desc': 'Clearly structured. Transparent. Results-driven.',
    'proc-1-title': 'Discovery', 'proc-1-desc': 'We analyze your company, goals, and market — before we write a single line of code.',
    'proc-2-title': 'Strategy', 'proc-2-desc': 'Based on the analysis, we develop a tailored digital strategy with clear milestones.',
    'proc-3-title': 'Design', 'proc-3-desc': 'We create intuitive, aesthetic interfaces — focused on brand, UX, and conversion rate.',
    'proc-4-title': 'Launch & Growth', 'proc-4-desc': 'Cleanly implemented, launched live, and continuously optimized — for sustainable results.',
    'port-label': 'Selected Projects', 'port-title': 'Our Work', 'port-desc': 'Projects we are proud of — and clients who are even prouder.',
    'port-sm-desc': 'From the platform to the community — we built and scaled Smart Market digitally.',
    'port-ph-desc': 'When presence is everything. We made sure Pro Hilfe gets noticed — and never forgotten.',
    'port-pb-desc': 'From page 4 to position 1 — a local SEO project with measurable growth for a Frankfurt construction company since 1994.',
    'port-mc-desc': 'End-to-end design and development of a B2B SaaS platform for the healthcare sector.',
    'port-link': 'View project →', 'port-cta-label': 'Projects', 'port-cta-desc': 'Each one unique. None left to chance.', 'port-cta-btn': 'Start now.',
    'test-label': 'Client Reviews', 'test-title': 'What our clients say',
    'test-1': '"069Digital took Smart Market to a whole new level. From the first idea to delivery — the team thinks ahead, delivers on time and exceeds expectations every time. If you want real results, this is the place."',
    'test-1-role': 'Founder & CEO, Smart Market',
    'test-2': '"Professional, reliable and creative. The 069Digital team completely rethought our branding — with a result that delights our clients."',
    'test-2-role': 'Founder, Nexus Finance',
    'test-3': '"Thanks to 069Digital we are now #1 in Frankfurt for our niche. The SEO project was one of the best investments we have ever made."',
    'test-3-role': 'Managing Director, ProBau GmbH',
    'about-label': 'About us', 'about-title': 'We are 069Digital',
    'about-p1': "Founded in Frankfurt am Main, we work with companies that don't want to leave digital growth to chance.",
    'about-p2': 'Our team of designers, developers, and strategists brings years of experience from agencies, startups, and international corporations.',
    'about-p3': 'We believe: <strong>Every business deserves a strong digital presence.</strong>',
    'about-v1-title': 'Quality', 'about-v1-desc': 'No compromise on details.',
    'about-v2-title': 'Transparency', 'about-v2-desc': 'Clear communication, always.',
    'about-v3-title': 'Impact', 'about-v3-desc': 'Results that are measurable.',
    'about-m1': 'Projects', 'about-m2': 'Years', 'about-m3': 'Ideas',
    'about-card-label': 'Your growth is our mission.',
    'cta-title': 'Ready for the next level?', 'cta-desc': "Let's tackle your next digital project together.", 'cta-btn': 'Schedule a call now',
    'contact-label': 'Contact', 'contact-title': "Let's talk.", 'contact-desc': "Tell us about your project — we'll get back to you within 24 hours with an initial assessment.",
    'form-name-label': 'Name', 'form-name-ph': 'John Doe',
    'form-email-label': 'E-Mail', 'form-email-ph': 'john@company.com',
    'form-company-label': 'Company', 'form-company-ph': 'Acme Inc.',
    'form-service-label': 'Service', 'form-service-ph': 'Please select',
    'form-msg-label': 'Message', 'form-msg-ph': 'Briefly describe your project and goals…',
    'form-submit': 'Send message', 'form-note': 'We respond within 24 hours.',
    'footer-desc': 'Premium Digital Agency<br />Frankfurt am Main',
    'footer-col1': 'Services', 'footer-col2': 'Agency',
    'footer-col2-about': 'About us', 'footer-col2-projects': 'Projects', 'footer-col2-contact': 'Contact', 'footer-col2-career': 'Careers',
    'footer-col3': 'Legal', 'footer-col3-imprint': 'Imprint', 'footer-col3-privacy': 'Privacy Policy', 'footer-col3-terms': 'Terms & Conditions',
  }
};

let currentLang = localStorage.getItem('lang') || 'de';

function applyLang(lang) {
  const t = translations[lang];
  document.documentElement.lang = lang;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (t[key] !== undefined) el.textContent = t[key];
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.dataset.i18nHtml;
    if (t[key] !== undefined) el.innerHTML = t[key];
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    const key = el.dataset.i18nPh;
    if (t[key] !== undefined) el.placeholder = t[key];
  });

  document.querySelectorAll('.lang-flag').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  localStorage.setItem('lang', lang);
  currentLang = lang;
}

document.querySelectorAll('.lang-flag').forEach(btn => {
  btn.addEventListener('click', () => applyLang(btn.dataset.lang));
});

applyLang(currentLang);

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

// ── CONTACT FORM (Formspree AJAX) ────────────
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    btn.textContent = 'Wird gesendet…';
    btn.disabled    = true;

    try {
      const res = await fetch(contactForm.action, {
        method:  'POST',
        body:    new FormData(contactForm),
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        btn.textContent      = 'Nachricht gesendet ✓';
        btn.style.background = '#22c55e';
        contactForm.reset();
        setTimeout(() => {
          btn.textContent      = 'Nachricht senden';
          btn.style.background = '';
          btn.disabled         = false;
        }, 4000);
      } else {
        btn.textContent      = 'Fehler – bitte erneut versuchen';
        btn.style.background = '#ef4444';
        btn.disabled         = false;
        setTimeout(() => {
          btn.textContent      = 'Nachricht senden';
          btn.style.background = '';
        }, 4000);
      }
    } catch {
      btn.textContent      = 'Fehler – bitte erneut versuchen';
      btn.style.background = '#ef4444';
      btn.disabled         = false;
      setTimeout(() => {
        btn.textContent      = 'Nachricht senden';
        btn.style.background = '';
      }, 4000);
    }
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


// ── TESTIMONIAL DOTS (mobile) ────────────────
const testimonialsGrid = document.getElementById('testimonialsGrid');
const testimonialDots  = document.querySelectorAll('#testimonialDots .carousel-dot');
if (testimonialsGrid && testimonialDots.length) {
  const cards = testimonialsGrid.querySelectorAll('.testimonial');
  const updateDots = () => {
    const center = testimonialsGrid.scrollLeft + testimonialsGrid.offsetWidth / 2;
    let closest = 0, minDist = Infinity;
    cards.forEach((c, i) => {
      const dist = Math.abs(c.offsetLeft + c.offsetWidth / 2 - center);
      if (dist < minDist) { minDist = dist; closest = i; }
    });
    testimonialDots.forEach((d, i) => d.classList.toggle('active', i === closest));
  };
  testimonialsGrid.addEventListener('scroll', updateDots, { passive: true });
  testimonialDots.forEach(dot => {
    dot.addEventListener('click', () => {
      const i = parseInt(dot.dataset.index);
      cards[i].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
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
