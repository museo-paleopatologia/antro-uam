/* =============================================================
   MUSEO VIRTUAL DE PALEOPATOLOGÍA — UAM
   script.js
   ============================================================= */

(function () {
  'use strict';

  // ─────────────────────────────────────────
  // 1. HEADER — efecto scroll
  // ─────────────────────────────────────────
  const header = document.getElementById('site-header');

  function handleHeaderScroll() {
    if (window.scrollY > 40) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  window.addEventListener('scroll', handleHeaderScroll, { passive: true });
  handleHeaderScroll();

  // ─────────────────────────────────────────
  // 2. MENÚ MÓVIL — toggle hamburguesa
  // ─────────────────────────────────────────
  const navToggle = document.getElementById('nav-toggle');
  const mainNav   = document.getElementById('main-nav');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
      const isOpen = mainNav.classList.toggle('is-open');
      navToggle.classList.toggle('is-open', isOpen);
      navToggle.setAttribute('aria-expanded', isOpen);
      navToggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
    });

    mainNav.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
        mainNav.classList.remove('is-open');
        navToggle.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Abrir menú');
      });
    });
  }

  // ─────────────────────────────────────────
  // 3. NAV ACTIVO — resalta sección visible
  // ─────────────────────────────────────────
  const sections  = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-link');
  const sectionMap = {
    'hero':      'inicio',
    'inicio':    'inicio',
    'anatomica': 'anatomica',
    'patologica':'patologica',
    'coleccion': 'coleccion',
    'aula':      'aula',
    'actualidad':'actualidad',
  };

  function updateActiveNav() {
    let current = '';
    sections.forEach(function (section) {
      if (section.getBoundingClientRect().top <= 100) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(function (link) {
      link.classList.remove('active');
      const href = link.getAttribute('href').replace('#', '');
      if (sectionMap[current] === href || href === current) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav();

  // ─────────────────────────────────────────
  // 4. SCROLL SUAVE — anclas internas
  // ─────────────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const offset = 68;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
      }
    });
  });

  // ─────────────────────────────────────────
  // 5. SCROLL REVEAL — aparición al desplazar
  // ─────────────────────────────────────────
  const revealTargets = [
    { selector: '.region-card',       stagger: true  },
    { selector: '.pato-card',         stagger: true  },
    { selector: '.aula-card',         stagger: true  },
    { selector: '.noticia-card',      stagger: true  },
    { selector: '.section-title',     stagger: false },
    { selector: '.section-desc',      stagger: false },
    { selector: '.coleccion-panel',   stagger: false },
    { selector: '.anatomica-header',  stagger: false },
    { selector: '.patologica-header', stagger: false },
  ];

  revealTargets.forEach(function (group) {
    document.querySelectorAll(group.selector).forEach(function (el, i) {
      el.classList.add('reveal');
      if (group.stagger && i < 4) {
        el.classList.add('reveal-delay-' + (i + 1));
      }
    });
  });

  const revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  document.querySelectorAll('.reveal').forEach(function (el) {
    revealObserver.observe(el);
  });

  // ─────────────────────────────────────────
  // 6. EXPLORACIÓN ANATÓMICA
  //    Sincroniza hotspots del esqueleto
  //    con las tarjetas de región
  // ─────────────────────────────────────────
  const skHotspots  = document.querySelectorAll('.sk-hotspot');
  const regionCards = document.querySelectorAll('.region-card');

  function activateRegion(region) {
    regionCards.forEach(function (card) {
      card.style.background = '';
      card.style.borderColor = '';
    });
    skHotspots.forEach(function (hs) {
      hs.classList.remove('is-active');
    });

    const targetCard = document.querySelector('.region-card[data-region="' + region + '"]');
    if (targetCard) {
      targetCard.style.background = 'rgba(255,255,255,0.12)';
      targetCard.style.borderColor = 'rgba(255,255,255,0.28)';
      targetCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    const targetHotspot = document.querySelector('.sk-hotspot[data-region="' + region + '"]');
    if (targetHotspot) {
      targetHotspot.classList.add('is-active');
    }
  }

  skHotspots.forEach(function (hs) {
    hs.addEventListener('click',      function () { activateRegion(this.dataset.region); });
    hs.addEventListener('mouseenter', function () { activateRegion(this.dataset.region); });
  });

  regionCards.forEach(function (card) {
    card.addEventListener('mouseenter', function () {
      activateRegion(this.dataset.region);
    });
    card.addEventListener('mouseleave', function () {
      card.style.background = '';
      card.style.borderColor = '';
      skHotspots.forEach(function (hs) { hs.classList.remove('is-active'); });
    });
  });

  // ─────────────────────────────────────────
  // 7. TILT EN TARJETAS — efecto parallax
  //    al mover el cursor sobre las cards
  // ─────────────────────────────────────────
  const tiltCards = document.querySelectorAll('.pato-card, .region-card');

  tiltCards.forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      const rect = card.getBoundingClientRect();
      const dx = (e.clientX - rect.left - rect.width  / 2) / rect.width;
      const dy = (e.clientY - rect.top  - rect.height / 2) / rect.height;
      card.style.transform  = 'translateY(-4px) rotateX(' + (dy * 4) + 'deg) rotateY(' + (-dx * 4) + 'deg)';
      card.style.transition = 'transform 0.05s linear, box-shadow 0.28s ease';
    });
    card.addEventListener('mouseleave', function () {
      card.style.transform  = '';
      card.style.transition = 'transform 0.28s cubic-bezier(0.25,0.46,0.45,0.94), box-shadow 0.28s ease';
    });
  });

  // ─────────────────────────────────────────
  // 8. PARALLAX HERO — imagen de fondo
  //    se desplaza más lento que el scroll
  // ─────────────────────────────────────────
  const heroBgImg = document.querySelector('.hero-bg-img');

  if (heroBgImg) {
    window.addEventListener('scroll', function () {
      heroBgImg.style.transform = 'translateY(' + window.scrollY * 0.3 + 'px)';
    }, { passive: true });
  }

  // ─────────────────────────────────────────
  // 9. BARRA DE PROGRESO DE LECTURA
  // ─────────────────────────────────────────
  const readingProgress = document.getElementById('reading-progress');

  if (readingProgress) {
    window.addEventListener('scroll', function () {
      const scrollTop  = window.scrollY;
      const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
      readingProgress.style.width = ((scrollTop / docHeight) * 100) + '%';
    }, { passive: true });
  }

  // ─────────────────────────────────────────
  // 10. ACCESIBILIDAD — skip link de teclado
  // ─────────────────────────────────────────
  const skipLink = document.createElement('a');
  skipLink.href        = '#inicio';
  skipLink.textContent = 'Ir al contenido principal';
  skipLink.style.cssText = [
    'position:fixed',
    'top:-100px',
    'left:1rem',
    'z-index:9999',
    'background:var(--color-uam-azul)',
    'color:#fff',
    'padding:.5rem 1rem',
    'border-radius:4px',
    'font-size:.85rem',
    'transition:top .2s ease',
    'outline:none'
  ].join(';');
  skipLink.addEventListener('focus', function () { skipLink.style.top = '1rem'; });
  skipLink.addEventListener('blur',  function () { skipLink.style.top = '-100px'; });
  document.body.prepend(skipLink);

})();