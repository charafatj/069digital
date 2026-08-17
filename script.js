/* =============================================================================
   069Digital

   Every block is independently guarded, so a page that does not contain a
   given component simply skips it. The previous version crashed on
   services.html because it assumed an element that only existed on the
   homepage, and every feature after that line stopped running.

   No scroll listeners: position questions are answered with IntersectionObserver
   sentinels, which cost no layout work.
   ========================================================================== */
(() => {
  'use strict';

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

  /* -- Header state ------------------------------------------------------- */
  const header = document.querySelector('[data-header]');
  if (header) {
    const sentinel = document.createElement('div');
    sentinel.setAttribute('aria-hidden', 'true');
    sentinel.style.cssText = 'position:absolute;top:0;height:1px;width:1px;pointer-events:none;';
    document.body.prepend(sentinel);
    new IntersectionObserver(([e]) => header.toggleAttribute('data-scrolled', !e.isIntersecting)).observe(
      sentinel
    );
  }

  /* -- Mobile menu --------------------------------------------------------
     <dialog> gives focus trapping, Escape-to-close, top-layer stacking and
     background inertness for free. */
  const menu = document.querySelector('[data-menu]');
  const menuOpen = document.querySelector('[data-menu-open]');
  if (menu && menuOpen && typeof menu.showModal === 'function') {
    const setExpanded = (v) => menuOpen.setAttribute('aria-expanded', String(v));
    setExpanded(false);

    const lock = (on) => {
      document.documentElement.style.overflow = on ? 'hidden' : '';
    };

    menuOpen.addEventListener('click', () => {
      menu.showModal();
      setExpanded(true);
      lock(true);
    });

    menu.addEventListener('close', () => {
      setExpanded(false);
      lock(false);
      menuOpen.focus();
    });

    menu.querySelectorAll('[data-menu-close], a[href]').forEach((el) => {
      el.addEventListener('click', () => menu.close());
    });

    // Close if the viewport grows past the breakpoint while the menu is open
    matchMedia('(min-width: 901px)').addEventListener('change', (e) => {
      if (e.matches && menu.open) menu.close();
    });
  }

  /* -- Scroll reveal ------------------------------------------------------
     The animation is a nicety; the content is not. Three things guarantee it
     can never stay hidden: the styles are gated on .js (see style.css), the
     observer unobserves once shown, and the failsafe below reveals anything
     still pending a few seconds after load. */
  const revealTargets = document.querySelectorAll('.reveal, .reveal-group');
  if (revealTargets.length && !reduceMotion.matches && 'IntersectionObserver' in window) {
    const show = (el) => el.setAttribute('data-shown', '');
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          show(e.target);
          io.unobserve(e.target);
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -8% 0px' }
    );
    revealTargets.forEach((el) => io.observe(el));

    const revealAll = () => {
      document.querySelectorAll('.reveal:not([data-shown]), .reveal-group:not([data-shown])').forEach(show);
      io.disconnect();
    };
    addEventListener('load', () => setTimeout(revealAll, 4000), { once: true });
    // A hidden tab suspends rAF and can starve the observer; catch up on return.
    addEventListener('pageshow', (e) => {
      if (e.persisted) revealAll();
    });
  } else {
    revealTargets.forEach((el) => el.setAttribute('data-shown', ''));
  }

  /* -- Poster-first video -------------------------------------------------
     The video ships with preload="none" and no autoplay attribute, so it
     costs nothing until it is actually on screen. */
  document.querySelectorAll('video[data-lazy]').forEach((video) => {
    const play = video.parentElement && video.parentElement.querySelector('[data-play]');
    const saveData = navigator.connection && navigator.connection.saveData;

    const start = () =>
      video.play().then(
        () => {
          if (play) play.hidden = true;
        },
        () => {}
      );

    // Honour the opt-outs: leave the poster up and let the visitor decide.
    if (saveData || reduceMotion.matches) {
      if (play) {
        play.hidden = false;
        play.addEventListener('click', () => {
          video.preload = 'auto';
          start();
        });
      }
      return;
    }

    let armed = false;
    new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            if (!armed) {
              video.preload = 'auto';
              armed = true;
            }
            start();
          } else if (!video.paused) {
            video.pause();
          }
        }
      },
      { threshold: 0.25 }
    ).observe(video);

    if (play) {
      play.addEventListener('click', () => (video.paused ? start() : video.pause()));
    }
  });

  /* -- Contact form ------------------------------------------------------- */
  const form = document.querySelector('[data-form]');
  if (form) {
    const status = form.querySelector('[data-form-status]');
    const submit = form.querySelector('button[type="submit"]');
    const submitLabel = submit ? submit.textContent : '';

    const say = (state, msg) => {
      if (!status) return;
      status.hidden = false;
      status.dataset.state = state;
      status.textContent = msg;
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;

      if (submit) {
        submit.disabled = true;
        submit.textContent = 'Wird gesendet …';
      }
      if (status) status.hidden = true;

      try {
        const res = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' },
        });
        if (res.ok) {
          form.reset();
          say('ok', 'Danke — Ihre Nachricht ist angekommen. Wir melden uns innerhalb eines Werktages.');
        } else {
          let detail = '';
          try {
            const j = await res.json();
            if (j && Array.isArray(j.errors)) detail = ' ' + j.errors.map((x) => x.message).join(' ');
          } catch {}
          say('err', 'Das hat leider nicht geklappt.' + detail + ' Schreiben Sie uns gern direkt an info@069digital.de.');
        }
      } catch {
        say('err', 'Verbindung fehlgeschlagen. Bitte prüfen Sie Ihre Verbindung oder schreiben Sie an info@069digital.de.');
      } finally {
        if (submit) {
          submit.disabled = false;
          submit.textContent = submitLabel;
        }
      }
    });
  }

  /* -- Retract the floating button over the contact section ---------------
     Left in place it sits on top of the submit button on small screens. */
  const fab = document.querySelector('[data-fab]');
  const contact = document.querySelector('#kontakt');
  if (fab && contact) {
    new IntersectionObserver(
      ([e]) => fab.toggleAttribute('data-hidden', e.isIntersecting),
      { threshold: 0.12 }
    ).observe(contact);
  }

  /* -- Mark the current page in the navigation ---------------------------- */
  const here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('[data-nav] a[href]').forEach((a) => {
    const target = a.getAttribute('href').split('#')[0].split('/').pop();
    if (target && target === here) a.setAttribute('aria-current', 'page');
  });
})();
