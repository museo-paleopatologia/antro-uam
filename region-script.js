/* =============================================================
   REGIÓN ANATÓMICA — region-script.js
   ============================================================= */

(function () {
  'use strict';

  // ── Configuración de regiones ──
  const REGIONES = {
    craneo: {
      tag: 'R.01',
      titulo: 'Cráneo',
      descripcion: 'Neurocráneo, viscerocráneo, mandíbula y estructuras faciales. Patologías traumáticas, infecciosas y trepanaciones.',
      color: 'var(--color-anatomica)'
    },
    tronco: {
      tag: 'R.02',
      titulo: 'Tronco',
      descripcion: 'Columna vertebral, costillas, esternón y pelvis. Patologías degenerativas, infecciosas y traumáticas de alta prevalencia.',
      color: 'var(--color-patologica)'
    },
    superiores: {
      tag: 'R.03',
      titulo: 'Miembros superiores',
      descripcion: 'Húmero, radio, cúbito, carpo y mano. Fracturas consolidadas, patologías degenerativas y marcadores de actividad.',
      color: 'var(--color-aula)'
    },
    inferiores: {
      tag: 'R.04',
      titulo: 'Miembros inferiores',
      descripcion: 'Fémur, tibia, peroné, tarso y pie. Patologías metabólicas, traumáticas y marcadores de movilidad.',
      color: 'var(--color-actualidad)'
    }
  };

  const PATOLOGIAS_LABELS = {
    traumatica:   'Traumática',
    infecciosa:   'Infecciosa',
    degenerativa: 'Degenerativa',
    metabolica:   'Metabólica',
    neoplasica:   'Neoplásica',
    dental:       'Dental',
    congenita:    'Congénita'
  };

  const PATOLOGIAS_COLORES = {
    traumatica:   'var(--color-anatomica)',
    infecciosa:   'var(--color-burdeos)',
    degenerativa: 'var(--color-uam-azul)',
    metabolica:   'var(--color-patologica)',
    neoplasica:   'var(--color-uam-verde)',
    dental:       'var(--color-aula)',
    congenita:    'var(--color-actualidad)'
  };

  // ── Leer parámetro de URL ──
  const params = new URLSearchParams(window.location.search);
  const regionId = params.get('region') || 'craneo';
  const region = REGIONES[regionId] || REGIONES.craneo;

  // ── Actualizar hero ──
  document.getElementById('breadcrumb-region').textContent = region.titulo;
  document.getElementById('region-tag').textContent = region.tag;
  document.getElementById('region-titulo').textContent = region.titulo;
  document.getElementById('region-descripcion').textContent = region.descripcion;
  document.title = region.titulo + ' — Museo Virtual de Paleopatología';

  // Color del hero según región
  const heroEl = document.getElementById('region-hero');
  if (heroEl) {
    heroEl.style.setProperty('--region-color', region.color);
  }

  // ── Cargar piezas ──
  let todasLasPiezas = [];
  let filtroActivo = 'todas';

  fetch('piezas.json')
    .then(function (res) { return res.json(); })
    .then(function (piezas) {
      todasLasPiezas = piezas.filter(function (p) {
        return p.region === regionId;
      });

      // Stats
      const patologiasUnicas = [...new Set(todasLasPiezas.map(function (p) { return p.patologia; }))];
      document.getElementById('stat-piezas').textContent = todasLasPiezas.length;
      document.getElementById('stat-patologias').textContent = patologiasUnicas.length;

      renderPiezas(todasLasPiezas);
    })
    .catch(function (err) {
      console.error('Error cargando piezas:', err);
    });

  // ── Render de cards ──
  function renderPiezas(piezas) {
    const grid = document.getElementById('piezas-grid');
    const empty = document.getElementById('piezas-empty');

    if (piezas.length === 0) {
      grid.innerHTML = '';
      empty.style.display = 'block';
      return;
    }

    empty.style.display = 'none';
    grid.innerHTML = piezas.map(function (pieza) {
      return crearCard(pieza);
    }).join('');
  }

  function crearCard(pieza) {
    const colorPato = PATOLOGIAS_COLORES[pieza.patologia] || 'var(--color-text-muted)';
    const labelPato = PATOLOGIAS_LABELS[pieza.patologia] || pieza.patologia;

    return '<article class="pieza-card" data-patologia="' + pieza.patologia + '">' +
      '<div class="pieza-card-header">' +
        '<span class="pieza-cod">' + pieza.codigo + '</span>' +
        '<span class="pieza-pato-tag" style="--pato-color:' + colorPato + '">' + labelPato + '</span>' +
      '</div>' +
      '<div class="pieza-card-body">' +
        '<h3 class="pieza-nombre">' + pieza.nombre + '</h3>' +
        '<p class="pieza-diagnostico">' + pieza.diagnostico + '</p>' +
        '<p class="pieza-desc">' + pieza.descripcion + '</p>' +
      '</div>' +
      '<div class="pieza-card-footer">' +
        '<div class="pieza-meta">' +
          '<span class="pieza-meta-item">' +
            '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="currentColor" stroke-width="1.2"/><path d="M6 3v3l2 2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>' +
            pieza.cronologia +
          '</span>' +
          '<span class="pieza-meta-item">' +
            '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1C3.8 1 2 2.8 2 5c0 3 4 7 4 7s4-4 4-7c0-2.2-1.8-4-4-4z" stroke="currentColor" stroke-width="1.2"/></svg>' +
            pieza.contexto +
          '</span>' +
        '</div>' +
        '<a href="pieza.html?id=' + pieza.id + '" class="pieza-ver-btn">Ver ficha →</a>' +
      '</div>' +
    '</article>';
  }

  // ── Filtros ──
  const filtrosBtns = document.querySelectorAll('.filtro-btn');

  filtrosBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filtroActivo = this.dataset.filtro;

      filtrosBtns.forEach(function (b) { b.classList.remove('filtro-btn--active'); });
      this.classList.add('filtro-btn--active');

      const piezasFiltradas = filtroActivo === 'todas'
        ? todasLasPiezas
        : todasLasPiezas.filter(function (p) { return p.patologia === filtroActivo; });

      renderPiezas(piezasFiltradas);
    });
  });

})();
