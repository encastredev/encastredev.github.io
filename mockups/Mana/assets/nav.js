/* ==========================================================================
   nav.js — la fuente de todo el boceto.
   Arriba: SCREENS, MENU, TABS. Abajo: shells, estado en memoria y helpers.
   Las páginas NO redeclaran nada de acá: todo lo compartido vive en G.
   ========================================================================== */

/* --- SCREENS: una fila por pantalla --------------------------------------- */

var SCREENS = [
  {
    archivo: '01-tablero.html', listo: true, n: '01', titulo: 'Tablero',
    disp: 'notebook', rol: 'Jorge y Administración',
    resumen: 'Todo lo que necesita una decisión hoy, en cuatro números.',
    probar: [
      'Cambiá el período y mirá cómo se recalculan los cuatro números.',
      'Tocá "7 diferencias de IVA" y caés directo en la lista del mes.',
      'Fijate que el resguardo avisa cuando una copia falló.'
    ]
  },
  {
    archivo: '02-iva-mes.html', listo: true, n: '02', titulo: 'Conciliación de IVA',
    disp: 'notebook', rol: 'Administración',
    resumen: 'Compras, ventas y ARCA cruzadas solas, con las diferencias a la vista.',
    probar: [
      'Filtrá por tipo de diferencia y mirá el total del panel cambiar.',
      'Buscá un proveedor por nombre.',
      'Abrí una diferencia para ver qué dice cada sistema.'
    ]
  },
  {
    archivo: '03-iva-comprobante.html', listo: true, n: '03', titulo: 'Detalle de la diferencia',
    disp: 'notebook', rol: 'Administración',
    resumen: 'El mismo comprobante, fuente por fuente, y qué hacer con él.',
    probar: [
      'Marcá la diferencia como resuelta.',
      'Volvé al mes y fijate que el contador bajó.'
    ]
  },
  {
    archivo: '04-precios.html', listo: true, n: '04', titulo: 'Precios y márgenes',
    disp: 'notebook', rol: 'Jorge y Administración',
    resumen: 'Qué productos subieron de costo y quedaron con el precio viejo.',
    probar: [
      'Movéle al margen objetivo y mirá recalcularse todos los precios sugeridos.',
      'Filtrá por rubro.',
      'Sumá productos al lote de cambios.'
    ]
  },
  {
    archivo: '05-orden-cambios.html', listo: true, n: '05', titulo: 'Orden de cambios',
    disp: 'notebook', rol: 'Administración',
    resumen: 'El lote de precios listo para cargar en Todosoft.',
    probar: [
      'Sacá un producto del lote y mirá el resumen cambiar.',
      'Generá el archivo.'
    ]
  },
  {
    archivo: '06-turnos.html', listo: true, n: '06', titulo: 'Turnos de la semana',
    disp: 'notebook', rol: 'Administración',
    resumen: '53 personas, tres franjas, siete días: dónde queda un hueco.',
    probar: [
      'Filtrá por sector y mirá la cobertura de la franja noche.',
      'Cubrí el hueco del sábado a la noche.'
    ]
  },
  {
    archivo: '07-horas.html', listo: true, n: '07', titulo: 'Horas y francos',
    disp: 'notebook', rol: 'Administración',
    resumen: 'Acumulado del mes: nocturnas, feriados y francos adeudados.',
    probar: [
      'Ordená por horas nocturnas.',
      'Cambiá de mes.'
    ]
  },
  {
    archivo: '08-resguardo.html', n: '08', titulo: 'Resguardo de Caja 1',
    disp: 'notebook', rol: 'Jorge',
    resumen: 'La copia de seguridad que hoy depende de que alguien se acuerde.',
    probar: [
      'Abrí el detalle del día que falló.',
      'Dispará una prueba de restauración.'
    ]
  },
  {
    archivo: '09-conexiones.html', listo: true, n: '09', titulo: 'Conexiones',
    disp: 'notebook', rol: 'Administración',
    resumen: 'De dónde sale cada dato y qué pasa el día que una fuente falla.',
    probar: [
      'Poné Holistor en falla y mirá qué avisa el sistema.',
      'Subí el archivo a mano y fijate que el mes se completa igual.',
      'Con Holistor en falla, abrí la app del celular: Jorge ya tiene la alerta.'
    ]
  },
  {
    archivo: '10-alertas.html', listo: true, n: '10', titulo: 'Alertas del día',
    disp: 'celular', rol: 'Jorge',
    resumen: 'Lo que necesita su decisión, en el teléfono.',
    probar: [
      'Abrí una alerta y caé en la pantalla que la resuelve.',
      'Descartá una y mirá el contador. Después deshacelo.',
      'Poné Holistor en falla en Conexiones y volvé: aparece una alerta nueva.'
    ]
  },
  {
    archivo: '11-turno-hoy.html', n: '11', titulo: 'Turno de hoy',
    disp: 'celular', rol: 'Jorge',
    resumen: 'Quién está cubriendo cada franja ahora mismo.',
    probar: [
      'Pasá de mañana a noche y mirá la cobertura.',
      'Tocá un sector para ver quiénes están.'
    ]
  },
  {
    archivo: '12-consulta.html', n: '12', titulo: 'Consulta de producto',
    disp: 'celular', rol: 'Jorge',
    resumen: 'Costo, precio y margen de cualquier producto, desde el mostrador.',
    probar: [
      'Buscá "chipa" y mirá el margen real.',
      'Tocá un producto para ver el detalle.'
    ]
  },
  {
    archivo: '13-encargos.html', n: '13', titulo: 'Pedidos y encargos',
    disp: 'notebook', rol: 'Mostrador', futuro: true,
    resumen: 'Etapa posterior: tortas y encargos por fecha, hoy sueltos en WhatsApp.',
    probar: [
      'Mirá el calendario de encargos de una semana de Pascuas.'
    ]
  }
];

/* --- MENU: grupos del menú lateral de la notebook ------------------------- */

var MENU = [
  { grupo: 'Panorama', items: [
    { archivo: '01-tablero.html', icono: 'tablero' }
  ]},
  { grupo: 'Impuestos', items: [
    { archivo: '02-iva-mes.html', icono: 'recibo', texto: 'Conciliación de IVA' },
    { archivo: '03-iva-comprobante.html', icono: 'lupa', texto: 'Detalle' }
  ]},
  { grupo: 'Precios', items: [
    { archivo: '04-precios.html', icono: 'etiqueta', texto: 'Precios y márgenes' },
    { archivo: '05-orden-cambios.html', icono: 'lista', texto: 'Orden de cambios' }
  ]},
  { grupo: 'Personal', items: [
    { archivo: '06-turnos.html', icono: 'personas', texto: 'Turnos' },
    { archivo: '07-horas.html', icono: 'reloj', texto: 'Horas y francos' }
  ]},
  { grupo: 'Sistema', items: [
    { archivo: '08-resguardo.html', icono: 'escudo', texto: 'Resguardo' },
    { archivo: '09-conexiones.html', icono: 'enchufe', texto: 'Conexiones' }
  ]},
  { grupo: 'Próximas etapas', items: [
    { archivo: '13-encargos.html', icono: 'calendario', texto: 'Pedidos y encargos', futuro: true },
    { texto: 'Costeo de recetas', icono: 'balanza', futuro: true },
    { texto: 'Tienda online', icono: 'carrito', futuro: true }
  ]}
];

/* --- TABS: pestañas de la app del celular -------------------------------- */

var TABS = [
  { archivo: '10-alertas.html', texto: 'Alertas', icono: 'campana' },
  { archivo: '11-turno-hoy.html', texto: 'Hoy', icono: 'personas' },
  { archivo: '12-consulta.html', texto: 'Consulta', icono: 'lupa' }
];

/* ==========================================================================
   G — todo lo compartido
   ========================================================================== */

var G = (function () {

  var D = window.DATOS || {};

  /* --- estado en memoria: al recargar vuelve al inicio -------------------- */
  var estado = {
    periodo: (D.meta && D.meta.periodoActual) || '2026-09',
    resueltas: {},       // id de diferencia -> true
    lote: {},            // id de producto -> precio nuevo
    margenObjetivo: {},  // rubro -> override puntual
    ajusteMargen: 0,     // puntos que se suman al objetivo de todos los rubros
    conexiones: {},      // id -> estado forzado
    turnosCubiertos: {}, // clave de bloque -> ids sumados
    alertasDescartadas: {}
  };

  /* --- formato ----------------------------------------------------------- */
  var fmt = {
    moneda: function (n, dec) {
      if (n === null || n === undefined || isNaN(n)) return '—';
      return '$' + Number(n).toLocaleString('es-AR', {
        minimumFractionDigits: dec || 0, maximumFractionDigits: dec || 0
      });
    },
    monedaCorta: function (n) {
      if (n === null || n === undefined || isNaN(n)) return '—';
      var a = Math.abs(n);
      /* espacio duro: "$47,8 M" nunca se parte en dos renglones */
      if (a >= 1e6) return '$' + (n / 1e6).toLocaleString('es-AR', { maximumFractionDigits: 1 }) + ' M';
      if (a >= 1e3) return '$' + (n / 1e3).toLocaleString('es-AR', { maximumFractionDigits: 0 }) + ' mil';
      return fmt.moneda(n);
    },
    num: function (n, dec) {
      if (n === null || n === undefined || isNaN(n)) return '—';
      return Number(n).toLocaleString('es-AR', {
        minimumFractionDigits: dec || 0, maximumFractionDigits: dec === undefined ? 0 : dec
      });
    },
    pct: function (n, dec) {
      if (n === null || n === undefined || isNaN(n)) return '—';
      return fmt.num(n, dec === undefined ? 1 : dec) + '%';
    },
    fecha: function (iso) {
      if (!iso) return '—';
      var p = String(iso).slice(0, 10).split('-');
      return p[2] + '/' + p[1] + '/' + p[0];
    },
    fechaCorta: function (iso) {
      if (!iso) return '—';
      var p = String(iso).slice(0, 10).split('-');
      return p[2] + '/' + p[1];
    },
    periodo: function (p) {
      var meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
        'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
      return meses[parseInt(p.slice(5, 7), 10) - 1] + ' de ' + p.slice(0, 4);
    },
    periodoCorto: function (p) {
      return p.slice(5, 7) + '/' + p.slice(0, 4);
    }
  };

  /* --- texto y búsqueda -------------------------------------------------- */
  function normalizar(t) {
    return String(t || '').toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/\s+/g, ' ').trim();
  }
  function contiene(texto, aguja) {
    if (!aguja) return true;
    return normalizar(texto).indexOf(normalizar(aguja)) !== -1;
  }

  /* --- URL: los flujos pasan los datos por la query ---------------------- */
  function params() {
    return new URLSearchParams(location.search);
  }
  function param(nombre, porDefecto) {
    var v = params().get(nombre);
    return v === null ? (porDefecto === undefined ? null : porDefecto) : v;
  }
  /* El estado vive en memoria y se pierde al recargar. Para que un flujo
     sobreviva el salto de una pantalla a otra, lo que el cliente tocó viaja
     en la query: periodo, ajuste de margen, lote de precios y diferencias
     resueltas. queryEstado() lo arma desde el estado vivo, no desde la URL
     anterior, así un link renderizado hace rato igual sale actualizado. */
  function queryEstado(base) {
    var q = new URLSearchParams(base || '');
    if (estado.periodo) q.set('periodo', estado.periodo); else q.delete('periodo');
    if (estado.ajusteMargen) q.set('aj', estado.ajusteMargen); else q.delete('aj');
    var lote = Object.keys(estado.lote);
    if (lote.length) q.set('lote', lote.join(',')); else q.delete('lote');
    var res = Object.keys(estado.resueltas);
    if (res.length) q.set('res', res.join(',')); else q.delete('res');
    var cub = [];
    Object.keys(estado.turnosCubiertos).forEach(function (clave) {
      estado.turnosCubiertos[clave].forEach(function (id) {
        cub.push(clave.replace(/\|/g, '~') + '~' + id);
      });
    });
    if (cub.length) q.set('cub', cub.join(',')); else q.delete('cub');
    var cx = Object.keys(estado.conexiones).map(function (id) {
      return id + '.' + estado.conexiones[id];
    });
    if (cx.length) q.set('cx', cx.join(',')); else q.delete('cx');
    var desc = Object.keys(estado.alertasDescartadas);
    if (desc.length) q.set('desc', desc.join(',')); else q.delete('desc');
    return q;
  }

  function href(archivo, extra) {
    var q = queryEstado();
    if (extra) {
      Object.keys(extra).forEach(function (k) {
        if (extra[k] === null || extra[k] === undefined) q.delete(k);
        else q.set(k, extra[k]);
      });
    }
    var s = q.toString();
    return archivo + (s ? '?' + s : '');
  }
  function ir(archivo, extra) { location.href = href(archivo, extra); }

  /* lee de la URL lo que dejó la pantalla anterior */
  function leerEstadoDeURL() {
    var p = params();
    if (p.get('periodo') && D.iva && D.iva[p.get('periodo')]) estado.periodo = p.get('periodo');
    if (p.get('aj')) estado.ajusteMargen = parseInt(p.get('aj'), 10) || 0;
    (p.get('res') || '').split(',').filter(Boolean).forEach(function (id) {
      estado.resueltas[id] = true;
    });
    /* sólo se restauran productos que hoy siguen atrasados: si no, un link
       viejo puede meter en el lote una "baja de precio" que la pantalla de
       precios nunca habría ofrecido */
    (p.get('lote') || '').split(',').filter(Boolean).forEach(function (id) {
      var prod = (D.productos || []).find(function (x) { return x.id === id; });
      if (prod && sugerido(prod) > prod.precio) estado.lote[id] = sugerido(prod);
    });
    /* conexiones forzadas desde la pantalla 09: holistor.falla / holistor.manual */
    (p.get('cx') || '').split(',').filter(Boolean).forEach(function (t) {
      var partes = t.split('.');
      var existe = (D.conexiones || []).some(function (c) { return c.id === partes[0]; });
      if (existe && (partes[1] === 'falla' || partes[1] === 'manual')) {
        estado.conexiones[partes[0]] = partes[1];
      }
    });
    (p.get('desc') || '').split(',').filter(Boolean).forEach(function (id) {
      estado.alertasDescartadas[id] = true;
    });
    (p.get('cub') || '').split(',').filter(Boolean).forEach(function (t) {
      var partes = t.split('~');
      if (partes.length !== 4) return;
      var clave = partes[0] + '|' + partes[1] + '|' + partes[2];
      if (!estado.turnosCubiertos[clave]) estado.turnosCubiertos[clave] = [];
      if (estado.turnosCubiertos[clave].indexOf(partes[3]) === -1) {
        estado.turnosCubiertos[clave].push(partes[3]);
      }
    });
  }

  /* --- pseudoaleatorio con semilla fija ---------------------------------- */
  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  /* --- íconos SVG inline por data-i -------------------------------------- */
  var ICONOS = {
    tablero: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
    recibo: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
    etiqueta: '<path d="M3 12.5V4a1 1 0 0 1 1-1h8.5L21 11.5 12.5 20z"/><circle cx="7.5" cy="7.5" r="1.3"/>',
    lista: '<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>',
    personas: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5"/><path d="M16 11.2A3.2 3.2 0 0 0 16 5"/><path d="M18 20c0-2.3-.9-4-2.3-5"/>',
    reloj: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5.2l3.2 2"/>',
    escudo: '<path d="M12 3l7.5 3v6c0 4.6-3.1 7.7-7.5 9-4.4-1.3-7.5-4.4-7.5-9V6z"/><path d="M9 12l2.2 2.2L15.5 10"/>',
    enchufe: '<path d="M9 3v6M15 3v6"/><path d="M6 9h12v3a6 6 0 0 1-12 0z"/><path d="M12 18v3"/>',
    calendario: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    balanza: '<path d="M12 4v16M6 8l-3 6h6zM18 8l-3 6h6z"/><path d="M5 20h14"/><path d="M6 8l6-2 6 2"/>',
    carrito: '<circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M3 4h2l2.6 11.2a1.5 1.5 0 0 0 1.5 1.2h8.5a1.5 1.5 0 0 0 1.5-1.2L21 8H6"/>',
    campana: '<path d="M18 9a6 6 0 1 0-12 0c0 5-2 6-2 6h16s-2-1-2-6"/><path d="M10.5 19a1.8 1.8 0 0 0 3 0"/>',
    lupa: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
    alerta: '<path d="M12 4.5 2.8 20h18.4z"/><path d="M12 10v4M12 17h.01"/>',
    check: '<path d="M4.5 12.5 9.5 17.5 19.5 6.5"/>',
    cruz: '<path d="M6 6l12 12M18 6L6 18"/>',
    subir: '<path d="M12 19V5"/><path d="M6 11l6-6 6 6"/><path d="M4 21h16"/>',
    bajar: '<path d="M12 5v14"/><path d="M6 13l6 6 6-6"/><path d="M4 3h16"/>',
    izq: '<path d="M14 6l-6 6 6 6"/>',
    der: '<path d="M10 6l6 6-6 6"/>',
    indice: '<path d="M4 6h16M4 12h16M4 18h10"/>',
    fuego: '<path d="M12 3s5 4.2 5 9a5 5 0 0 1-10 0c0-1.7.7-3 1.5-4 .2 1.2 1 2 1.8 2 1.2 0 1.7-1.4 1.7-3 0-1.6-.4-3-.4-4z"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    casa: '<path d="M4 11l8-6.5L20 11"/><path d="M6 10v10h12V10"/>'
  };

  function icono(nombre, tam) {
    var d = ICONOS[nombre];
    if (!d) return '';
    var s = tam || 17;
    return '<svg class="ico" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" ' +
      'fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" ' +
      'stroke-linejoin="round" aria-hidden="true">' + d + '</svg>';
  }

  function pintarIconos(raiz) {
    (raiz || document).querySelectorAll('[data-i]').forEach(function (el) {
      if (el.dataset.pintado) return;
      el.innerHTML = icono(el.dataset.i, el.dataset.tam) + el.innerHTML;
      el.dataset.pintado = '1';
    });
  }

  /* --- logo -------------------------------------------------------------- */
  function logoSVG(tam) {
    var s = tam || 38;
    return '<svg class="logo-marca" width="' + s + '" height="' + s + '" viewBox="0 0 48 48" aria-hidden="true">' +
      '<circle cx="24" cy="24" r="23" fill="#96ac80"/>' +
      '<g stroke="#f6f2e9" stroke-width="1.5" stroke-linecap="round" fill="none">' +
      '<path d="M24 10v7"/><path d="M24 12.5c-2 0-3.2-1-3.2-2.6C22 9.4 23.4 10.4 24 12.5z"/>' +
      '<path d="M24 12.5c2 0 3.2-1 3.2-2.6C26 9.4 24.6 10.4 24 12.5z"/>' +
      '<path d="M24 16c-2.2 0-3.6-1.1-3.6-2.9 1.4-.6 3 .5 3.6 2.9z"/>' +
      '<path d="M24 16c2.2 0 3.6-1.1 3.6-2.9-1.4-.6-3 .5-3.6 2.9z"/></g>' +
      '<text x="24" y="31.5" text-anchor="middle" font-family="Fraunces, Georgia, serif" ' +
      'font-size="14.5" font-style="italic" fill="#f6f2e9">maná</text>' +
      '<text x="24" y="38.5" text-anchor="middle" font-family="ui-monospace, monospace" ' +
      'font-size="4.1" letter-spacing="0.9" fill="#f6f2e9" opacity=".85">EL ORIGEN DEL PAN</text>' +
      '</svg>';
  }

  function logoHTML(tam) {
    return '<span class="logo">' + logoSVG(tam) +
      '<span class="logo-texto"><span class="logo-nombre">Maná</span>' +
      '<span class="logo-bajada">Sistema de gestión</span></span></span>';
  }

  /* --- toast ------------------------------------------------------------- */
  var toastTimer = null;
  function toast(mensaje) {
    var viejo = document.querySelector('.toast');
    if (viejo) viejo.remove();
    var el = document.createElement('div');
    el.className = 'toast';
    el.setAttribute('role', 'status');
    el.textContent = mensaje;
    document.body.appendChild(el);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.remove(); }, 2600);
  }

  /* --- datos derivados --------------------------------------------------- */

  function periodo() { return estado.periodo; }

  function ivaDelPeriodo(p) {
    return (D.iva && D.iva[p || periodo()]) || { diferencias: [] };
  }

  function diferenciasAbiertas(p) {
    return ivaDelPeriodo(p).diferencias.filter(function (d) {
      return !estado.resueltas[d.id];
    });
  }

  function objetivoBase(rubro) {
    if (estado.margenObjetivo[rubro] !== undefined) return estado.margenObjetivo[rubro];
    var p = (D.productos || []).find(function (x) { return x.rubro === rubro; });
    return p ? p.margenObjetivo : 45;
  }

  /* el objetivo de cada rubro más el ajuste que se mueve desde la pantalla 04 */
  function objetivoDe(rubro) {
    var v = objetivoBase(rubro) + estado.ajusteMargen;
    return Math.max(10, Math.min(80, v));
  }

  function nombreRubro(id) {
    var r = (D.rubros || []).find(function (x) { return x.id === id; });
    return r ? r.nombre : id;
  }

  /* lo que se deja de ganar por mes mientras el precio siga viejo */
  function impactoMensual(prod) {
    return Math.max(0, (sugerido(prod) - prod.precio)) * prod.ventaMes;
  }

  function sugerido(prod) {
    var obj = objetivoDe(prod.rubro);
    return Math.round(prod.costo / (1 - obj / 100) / 10) * 10;
  }

  function margenDe(prod) {
    return (prod.precio - prod.costo) / prod.precio * 100;
  }

  /* productos cuyo margen quedó por debajo del objetivo */
  function productosDesactualizados() {
    return (D.productos || []).filter(function (p) {
      return margenDe(p) < objetivoDe(p.rubro) - 1.5;
    });
  }

  function empleado(id) {
    return (D.empleados || []).find(function (e) { return e.id === id; });
  }

  function claveBloque(b) {
    return b.fecha + '|' + b.franja + '|' + b.sector;
  }

  function cubiertos(b) {
    var extra = estado.turnosCubiertos[claveBloque(b)] || [];
    return b.empleados.length + extra.length;
  }

  function huecos() {
    return ((D.semana && D.semana.grilla) || []).filter(function (b) {
      return cubiertos(b) < b.requeridos;
    });
  }

  function conexionEstado(c) {
    return estado.conexiones[c.id] || c.estado;
  }

  /* Holistor sin respuesta anoche: las compras del mes en curso quedan
     incompletas hasta que alguien suba el export a mano (pantalla 09). */
  function comprasIncompletas(p) {
    var h = (D.conexiones || []).find(function (c) { return c.id === 'holistor'; });
    return !!h && conexionEstado(h) === 'falla' && (p || periodo()) === D.meta.periodoActual;
  }
  function comprasPorArchivo(p) {
    var h = (D.conexiones || []).find(function (c) { return c.id === 'holistor'; });
    return !!h && conexionEstado(h) === 'manual' && (p || periodo()) === D.meta.periodoActual;
  }

  function ultimaCopia() {
    return ((D.resguardo && D.resguardo.copias) || [])[0] || null;
  }

  function pantalla(archivo) {
    return SCREENS.find(function (s) { return s.archivo === archivo; });
  }

  /* Una pantalla declarada en SCREENS pero todavía no escrita no se linkea:
     mejor un cartel que un 404 en el medio de la reunión. Cuando el archivo
     existe, se le pone listo: true arriba y el link se enciende solo. */
  function listo(archivo) {
    if (archivo === 'index.html') return true;
    var s = pantalla(archivo);
    return !!(s && s.listo);
  }

  /* --- componentes compartidos ------------------------------------------- */

  var ui = {
    kpi: function (o) {
      if (o.href && !listo(String(o.href).split('?')[0])) o.href = null;
      var clase = 'kpi' + (o.tono ? ' ' + o.tono : '');
      var interior =
        '<span class="rotulo">' + o.rotulo + '</span>' +
        '<span class="kpi-valor num">' + o.valor + '</span>' +
        '<span class="kpi-pie">' + o.pie + '</span>';
      if (o.href) return '<a class="' + clase + '" href="' + o.href + '">' + interior + '</a>';
      return '<div class="' + clase + '">' + interior + '</div>';
    },
    marca: function (texto, tono) {
      return '<span class="marca marca-' + (tono || 'neutra') + '">' + texto + '</span>';
    },
    barrita: function (parte, total) {
      var pct = total ? Math.min(100, Math.round(parte / total * 100)) : 0;
      var clase = pct >= 100 ? '' : (pct >= 75 ? ' media' : ' baja');
      return '<span class="barrita' + clase + '"><span style="width:' + pct + '%"></span></span>';
    },
    vacio: function (colspan, texto) {
      return '<tr class="vacio"><td colspan="' + colspan + '">' + texto + '</td></tr>';
    },
    /* el cartel que aparece en tablero e IVA cuando Holistor no contestó */
    avisoConexion: function (p) {
      if (comprasIncompletas(p)) {
        var ir = listo('09-conexiones.html')
          ? '<a class="btn btn-chico" href="' + href('09-conexiones.html') + '">Subir el archivo</a>' : '';
        return '<div class="aviso aviso-alerta" id="aviso-conexion"><span class="ico" data-i="alerta"></span>' +
          '<div style="flex:1;min-width:0"><strong>Faltan las compras de ' + fmt.periodo(D.meta.periodoActual) +
          '.</strong> Holistor no contestó anoche y el sistema no inventa números: el IVA de compras ' +
          'queda incompleto hasta que se suba el export a mano.</div>' + ir + '</div>';
      }
      if (comprasPorArchivo(p)) {
        return '<div class="aviso aviso-ok" id="aviso-conexion"><span class="ico" data-i="check"></span>' +
          '<div><strong>Mes completo.</strong> Las compras de ' + fmt.periodo(D.meta.periodoActual) +
          ' se cargaron desde el archivo que subió administración. Holistor se vuelve a leer ' +
          'solo esta noche.</div></div>';
      }
      return '';
    },
    avisoSimulado: function () {
      return '<div class="aviso"><span class="ico" data-i="info"></span><div>' +
        '<strong>Datos simulados.</strong> La estructura es la real de Maná — rubros, ' +
        'sectores, dotación, horarios —, pero los números no salen de Holistor ni de ' +
        'Todosoft. Se reemplazan por los de verdad en una tarde.</div></div>';
    }
  };

  leerEstadoDeURL();

  /* --- API pública ------------------------------------------------------- */
  return {
    queryEstado: queryEstado,
    D: D, datos: D, estado: estado, fmt: fmt,
    normalizar: normalizar, contiene: contiene,
    params: params, param: param, href: href, ir: ir,
    mulberry32: mulberry32, icono: icono, pintarIconos: pintarIconos,
    logoSVG: logoSVG, logoHTML: logoHTML, toast: toast,
    periodo: periodo, ivaDelPeriodo: ivaDelPeriodo,
    diferenciasAbiertas: diferenciasAbiertas,
    objetivoDe: objetivoDe, objetivoBase: objetivoBase, sugerido: sugerido,
    margenDe: margenDe, nombreRubro: nombreRubro, impactoMensual: impactoMensual,
    productosDesactualizados: productosDesactualizados,
    empleado: empleado, claveBloque: claveBloque, cubiertos: cubiertos,
    huecos: huecos, conexionEstado: conexionEstado, ultimaCopia: ultimaCopia,
    comprasIncompletas: comprasIncompletas, comprasPorArchivo: comprasPorArchivo,
    pantalla: pantalla, listo: listo, ui: ui,
    SCREENS: SCREENS, MENU: MENU, TABS: TABS
  };
})();

/* ==========================================================================
   Shells — nav.js inyecta todo lo que rodea a <main id="pagina">
   ========================================================================== */

(function () {

  function entradaIndice(s) {
    var cuerpo = s.n + ' · ' + s.titulo + '<small>' + s.resumen + '</small>';
    if (!G.listo(s.archivo)) {
      return '<span class="pendiente" style="display:block;padding:7px 9px;font-size:13px">' +
        cuerpo + '</span>';
    }
    return '<a href="' + G.href(s.archivo) + '">' + cuerpo + '</a>';
  }

  function indiceHTML() {
    var html = '<div class="indice-caja oculto" id="indice-caja">';
    html += '<span class="rotulo">Notebook</span>';
    G.SCREENS.filter(function (s) { return s.disp === 'notebook' && !s.futuro; })
      .forEach(function (s) { html += entradaIndice(s); });
    html += '<span class="rotulo">Celular</span>';
    G.SCREENS.filter(function (s) { return s.disp === 'celular'; })
      .forEach(function (s) { html += entradaIndice(s); });
    html += '<span class="rotulo">Etapa posterior</span>';
    G.SCREENS.filter(function (s) { return s.futuro; })
      .forEach(function (s) { html += entradaIndice(s); });
    html += '<a href="index.html">Volver a la portada</a>';
    return html + '</div>';
  }

  function probarHTML(s) {
    if (!s || !s.probar || !s.probar.length) return '';
    var html = '<div class="indice-caja oculto" id="probar-caja">';
    html += '<span class="rotulo">Qué probar en esta pantalla</span>';
    s.probar.forEach(function (t) {
      html += '<a href="#" onclick="return false" style="cursor:default">' + t + '</a>';
    });
    return html + '</div>';
  }

  function menuHTML(actual) {
    var html = '<div class="menu-cabecera">' + G.logoHTML(36) + '</div>';
    G.MENU.forEach(function (g) {
      html += '<div class="menu-grupo"><span class="rotulo">' + g.grupo + '</span>';
      g.items.forEach(function (it) {
        var s = it.archivo ? G.pantalla(it.archivo) : null;
        var texto = it.texto || (s ? s.titulo : '');
        var clases = [];
        if (it.archivo === actual) clases.push('activo');
        if (it.futuro) clases.push('futuro');
        if (it.archivo && !G.listo(it.archivo)) clases.push('pendiente');
        if (it.archivo && G.listo(it.archivo)) {
          html += '<a class="' + clases.join(' ') + '" href="' + G.href(it.archivo) + '">' +
            G.icono(it.icono) + '<span>' + texto + '</span></a>';
        } else if (it.archivo) {
          html += '<span class="' + clases.join(' ') + '" title="Todavía no está armada" ' +
            'style="display:flex;align-items:center;gap:9px;padding:7px 8px;' +
            'border-radius:8px;font-size:13.5px">' +
            G.icono(it.icono) + '<span>' + texto + '</span></span>';
        } else {
          html += '<span class="' + clases.join(' ') + '" style="display:flex;align-items:center;' +
            'gap:9px;padding:7px 8px;border-radius:8px;font-size:13.5px">' +
            G.icono(it.icono) + '<span>' + texto + '</span></span>';
        }
      });
      html += '</div>';
    });
    return html;
  }

  function navPieHTML(s) {
    /* anterior/siguiente sólo entre pantallas que existen */
    var lista = G.SCREENS.filter(function (x) {
      return x.disp === s.disp && G.listo(x.archivo);
    });
    var i = lista.findIndex(function (x) { return x.archivo === s.archivo; });
    var ant = lista[i - 1], sig = lista[i + 1];
    var html = '';
    html += ant
      ? '<a class="btn" href="' + G.href(ant.archivo) + '">' + G.icono('izq') + ant.titulo + '</a>'
      : '<a class="btn" href="index.html">' + G.icono('casa') + 'Portada</a>';
    html += sig
      ? '<a class="btn" href="' + G.href(sig.archivo) + '">' + sig.titulo + G.icono('der') + '</a>'
      : '<a class="btn" href="index.html">Volver a la portada' + G.icono('der') + '</a>';
    return html;
  }

  function armarEscritorio(main, s) {
    var shell = document.createElement('div');
    shell.className = 'shell';
    shell.innerHTML =
      '<nav class="menu">' + menuHTML(s.archivo) + '</nav>' +
      '<div class="cuerpo">' +
        '<header class="barra">' +
          '<div class="barra-titulo">' +
            '<span class="rotulo">' + s.n + ' · ' + s.rol +
              (s.futuro ? ' · etapa posterior' : '') + '</span>' +
            '<h1>' + s.titulo + '</h1>' +
          '</div>' +
          '<div class="barra-acciones">' +
            '<div class="indice"><button class="btn btn-chico" id="btn-probar">' +
              G.icono('info', 15) + 'Qué probar</button>' + probarHTML(s) + '</div>' +
            '<div class="indice"><button class="btn btn-chico" id="btn-indice">' +
              G.icono('indice', 15) + 'Pantallas</button>' + indiceHTML() + '</div>' +
          '</div>' +
        '</header>' +
        '<div class="hueco-main"></div>' +
        '<nav class="pie-nav">' + navPieHTML(s) + '</nav>' +
      '</div>';
    document.body.appendChild(shell);
    var hueco = shell.querySelector('.hueco-main');
    hueco.parentNode.replaceChild(main, hueco);
    main.classList.add('pagina');
  }

  function armarTelefono(main, s) {
    var tabs = G.TABS.map(function (t) {
      var act = t.archivo === s.archivo ? ' class="activo"' : '';
      return '<a' + act + ' href="' + G.href(t.archivo) + '">' +
        G.icono(t.icono, 19) + '<span>' + t.texto + '</span></a>';
    }).join('');

    var escena = document.createElement('div');
    escena.className = 'escena-telefono';
    escena.innerHTML =
      '<div class="escena-cabecera">' +
        '<span class="rotulo">' + s.n + ' · celular · ' + s.rol + '</span>' +
        '<h1>' + s.titulo + '</h1>' +
        '<p>' + s.resumen + '</p>' +
      '</div>' +
      '<div class="telefono">' +
        '<div class="telefono-estado"><span>7:42</span><span>Maná</span><span>100%</span></div>' +
        '<div class="telefono-barra">' +
          '<span class="rotulo">' + s.rol + '</span><h1>' + s.titulo + '</h1>' +
        '</div>' +
        '<div class="hueco-main"></div>' +
        '<nav class="telefono-tabs">' + tabs + '</nav>' +
      '</div>' +
      '<div class="telefono-pie">' + navPieHTML(s) +
        '<div class="indice"><button class="btn btn-chico" id="btn-indice">' +
          G.icono('indice', 15) + 'Pantallas</button>' + indiceHTML() + '</div>' +
      '</div>';
    document.body.appendChild(escena);
    var hueco = escena.querySelector('.hueco-main');
    hueco.parentNode.replaceChild(main, hueco);
    main.classList.add('telefono-pantalla');
  }

  function desplegable(boton, caja) {
    if (!boton || !caja) return;
    boton.addEventListener('click', function (e) {
      e.stopPropagation();
      var abierto = !caja.classList.contains('oculto');
      document.querySelectorAll('.indice-caja').forEach(function (c) { c.classList.add('oculto'); });
      if (!abierto) caja.classList.remove('oculto');
    });
  }

  /* Un link dibujado al cargar la página no sabe lo que el cliente tocó
     después. Antes de navegar le reescribimos la query con el estado vivo,
     así el lote de precios y las diferencias resueltas viajan siempre,
     incluso desde el menú lateral. */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var h = a.getAttribute('href');
    if (!h || /^(https?:|mailto:|tel:|#)/.test(h) || a.target === '_blank') return;
    var partes = h.split('?');

    /* nada de 404 delante del cliente */
    if (!G.listo(partes[0])) {
      e.preventDefault();
      e.stopPropagation();
      var s = G.pantalla(partes[0]);
      G.toast(s
        ? '“' + s.titulo + '” todavía no está armada en el boceto'
        : 'Esa pantalla todavía no está armada en el boceto');
      return;
    }

    var q = G.queryEstado(partes[1] || '').toString();
    a.setAttribute('href', partes[0] + (q ? '?' + q : ''));
  }, true);

  document.addEventListener('DOMContentLoaded', function () {
    var shell = document.body.dataset.shell;
    var archivo = document.body.dataset.pantalla;
    var main = document.getElementById('pagina');

    if (shell === 'escritorio' || shell === 'telefono') {
      var s = G.pantalla(archivo);
      if (!s) { console.error('Pantalla no declarada en SCREENS: ' + archivo); return; }
      if (shell === 'escritorio') armarEscritorio(main, s);
      else armarTelefono(main, s);
      desplegable(document.getElementById('btn-indice'), document.getElementById('indice-caja'));
      desplegable(document.getElementById('btn-probar'), document.getElementById('probar-caja'));
      document.addEventListener('click', function () {
        document.querySelectorAll('.indice-caja').forEach(function (c) { c.classList.add('oculto'); });
      });
    }

    G.pintarIconos(document);
    if (typeof window.iniciar === 'function') window.iniciar();
    G.pintarIconos(document);
    marcarPendientes(document);
  });

  /* Le saca el href a cualquier link que apunte a una pantalla que todavía no
     existe y lo deja marcado. Así el boceto nunca ofrece un camino que termina
     en 404, ni siquiera desde la portada. */
  function marcarPendientes(raiz) {
    (raiz || document).querySelectorAll('a[href]').forEach(function (a) {
      var h = a.getAttribute('href');
      if (!h || /^(https?:|mailto:|tel:|#)/.test(h)) return;
      var destino = h.split('?')[0];
      if (G.listo(destino)) return;
      a.removeAttribute('href');
      a.classList.add('pendiente');
      a.setAttribute('aria-disabled', 'true');
      a.setAttribute('title', 'Todavía no está armada en el boceto');
      a.addEventListener('click', function () {
        var s = G.pantalla(destino);
        G.toast(s ? '“' + s.titulo + '” todavía no está armada en el boceto'
                  : 'Esa pantalla todavía no está armada en el boceto');
      });
    });
  }
})();
