/* =============================================
   MUSEO VIRTUAL DE PALEOPATOLOGÍA
   script.js · Clara · TFG 2024–2025
   ============================================= */

/* ── NAVBAR: scroll effect + mobile toggle ── */
(function initNavbar() {
  const navbar   = document.getElementById('navbar');
  const toggle   = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  const links    = navLinks.querySelectorAll('.nav-link');

  // Scrolled state
  function onScroll() {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    updateActiveLink();
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu toggle
  toggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen);
    // Animate hamburger → X
    const spans = toggle.querySelectorAll('span');
    if (isOpen) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity   = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity   = '';
      spans[2].style.transform = '';
    }
  });

  // Close menu when a link is clicked
  links.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      const spans = toggle.querySelectorAll('span');
      spans[0].style.transform = '';
      spans[1].style.opacity   = '';
      spans[2].style.transform = '';
    });
  });

  // Close menu on outside click
  document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target) && navLinks.classList.contains('open')) {
      navLinks.classList.remove('open');
    }
  });
})();

/* ── ACTIVE NAV LINK on scroll ── */
function updateActiveLink() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  let current = '';

  sections.forEach(section => {
    const sectionTop = section.offsetTop - 120;
    if (window.scrollY >= sectionTop) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    const href = link.getAttribute('href');
    if (href === `#${current}`) {
      link.classList.add('active');
    }
  });
}

/* ── SCROLL REVEAL ANIMATION ── */
(function initScrollReveal() {
  // Add reveal class to key elements
  const targets = [
    '.section-header',
    '.anatomy-card',
    '.pathology-card',
    '.aula-card',
    '.news-card',
    '.artifact-main',
    '.artifact-info',
    '.stat-item',
  ];

  targets.forEach((selector, selectorIndex) => {
    document.querySelectorAll(selector).forEach((el, i) => {
      el.classList.add('reveal');
      // Stagger delay within same group
      if (i < 4) {
        el.classList.add(`reveal-delay-${i + 1}`);
      }
    });
  });

  // IntersectionObserver
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();

/* ── ANATOMY SECTION: region hover sync ── */
(function initAnatomyInteraction() {
  const cards = document.querySelectorAll('.anatomy-card[data-region]');
  const shapes = document.querySelectorAll('.region-shape[data-region]');

  function activate(region) {
    // Highlight SVG shapes
    shapes.forEach(shape => {
      if (shape.dataset.region === region) {
        shape.classList.add('active');
      } else {
        shape.classList.remove('active');
      }
    });
  }

  function deactivate() {
    shapes.forEach(shape => shape.classList.remove('active'));
  }

  // Card hover triggers SVG highlight
  cards.forEach(card => {
    card.addEventListener('mouseenter', () => activate(card.dataset.region));
    card.addEventListener('mouseleave', deactivate);
    card.addEventListener('focus', () => activate(card.dataset.region));
    card.addEventListener('blur', deactivate);
  });

  // SVG shape hover triggers card highlight
  shapes.forEach(shape => {
    shape.addEventListener('mouseenter', () => {
      activate(shape.dataset.region);
      // Highlight matching card
      cards.forEach(card => {
        if (card.dataset.region === shape.dataset.region) {
          card.style.borderColor = 'var(--green-pale)';
          card.style.boxShadow = '0 8px 32px rgba(61, 92, 71, 0.12)';
        }
      });
    });
    shape.addEventListener('mouseleave', () => {
      deactivate();
      cards.forEach(card => {
        card.style.borderColor = '';
        card.style.boxShadow = '';
      });
    });
  });
})();

/* ── 3D MODEL LOAD SIMULATION ── */
function loadModel(btn) {
  const modelInner = btn.closest('.model-inner');
  btn.textContent = 'Cargando…';
  btn.disabled = true;

  // Simulate loading
  setTimeout(() => {
    modelInner.innerHTML = `
      <div class="model-icon" style="color: var(--gold-light); opacity: 0.9;">⬡</div>
      <p class="model-label" style="color: var(--gold-light);">Modelo cargado</p>
      <p class="model-sublabel">MVP-2024-FEM-047 · Fémur derecho</p>
      <p style="font-size: 0.75rem; color: rgba(245,240,232,0.35); margin-top: 0.5rem; letter-spacing: 0.08em;">
        [Integración Sketchfab disponible en versión completa]
      </p>
    `;
  }, 1800);
}

/* ── SMOOTH ANCHOR SCROLL (override for offset) ── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offsetTop = target.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: offsetTop, behavior: 'smooth' });
  });
});

/* ── PATHOLOGY CARD: subtle tilt on hover ── */
(function initTiltEffect() {
  const cards = document.querySelectorAll('.pathology-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width  / 2;
      const cy = rect.height / 2;
      const dx = (x - cx) / cx;
      const dy = (y - cy) / cy;
      card.style.transform = `translateY(-4px) rotateX(${-dy * 3}deg) rotateY(${dx * 3}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();
