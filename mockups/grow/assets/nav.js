/* ==========================================================================
   GROW Stock · boceto navegable — navegación, shells compartidos y utilidades
   Para agregar una pantalla: sumala en SCREENS (y en MENU o TABS si corresponde).
   Las páginas NO deben redeclarar nada de acá: todo se usa desde el objeto global G.
   ========================================================================== */

const SCREENS = [
  { archivo: 'index.html', n: '00', titulo: 'Portada', disp: 'portada', rol: 'Todos', resumen: 'El problema, la propuesta y el índice del boceto.', probar: [] },
  { archivo: '01-panel.html', etapa: 1, n: '01', titulo: 'Panel general', disp: 'notebook', rol: 'Administración',
    resumen: 'El estado del stock de los dos depósitos de un vistazo.',
    probar: ['Cambiar entre Todos / Misiones / Miami y ver cómo cambian los indicadores', 'Desplegar un envío en tránsito', 'Pasar el mouse por las barras de categorías'] },
  { archivo: '02-inventario.html', etapa: 1, n: '02', titulo: 'Inventario', disp: 'notebook', rol: 'Mostrador',
    resumen: 'Buscador universal: código GROW, referencia de otra marca o modelo de máquina.',
    probar: ['Buscar P959052 (referencia cruzada) o 320D (máquina)', 'Cambiar la lista de precios: público o distribuidor', 'Filtrar por categoría y tocar “Exportar a Excel”'] },
  { archivo: '03-ficha-producto.html', etapa: 1, n: '03', titulo: 'Ficha de producto', disp: 'notebook', rol: 'Mostrador',
    resumen: 'Todo sobre un repuesto: dónde está, cuánto hay, sus 3 precios y sus equivalencias.',
    probar: ['Cambiar el factor de importación y ver cómo se recalculan los dos precios', 'Agregar una foto del producto', 'Ver la etiqueta tal como sale en el rollo GROW'] },
  { archivo: '04-movimiento.html', etapa: 1, n: '04', titulo: 'Registrar movimiento', disp: 'notebook', rol: 'Mostrador / Depósito',
    resumen: 'Ingresos, egresos, ajustes y transferencias con el resultado calculado en vivo.',
    probar: ['Cambiar la cantidad y ver el stock resultante', 'Elegir “Ingreso” y cargar el costo FOB, el factor y el documento del despacho', 'Confirmar y ver la ficha con el costo nuevo'] },
  { archivo: '05-mapa-deposito.html', etapa: 1, n: '05', titulo: 'Mapa del depósito', disp: 'notebook', rol: 'Depósito',
    resumen: 'Las estanterías, estantes, cajas y el mostrador, con lo que hay en cada lugar.',
    probar: ['Buscar un producto y ver dónde se ilumina', 'Tocar “Editar depósito” y agregar una estantería, un estante o una caja', 'Exportar a Excel lo que hay en una ubicación para salir a controlarla'] },
  { archivo: '06-etiquetas-producto.html', etapa: 1, n: '06', titulo: 'Etiquetas de producto', disp: 'notebook', rol: 'Depósito',
    resumen: 'Etiquetas de la Xprinter XP-H500B: Part N con sufijo, descripción y unidades por empaque, desde el sistema o a mano.',
    probar: ['Cambiar el sufijo del Part N (proveedor, .GEN o .ALT) y el tipo de parte', 'Cargar una etiqueta manual', 'Activar “ver solo lo que imprime” y calibrar en mm'] },
  { archivo: '07-despacho.html', etapa: 2, n: '07', titulo: 'Despacho y bultos', disp: 'notebook', rol: 'Depósito',
    resumen: 'Adelanto de la etapa 2: envíos desde el warehouse de Miami o directo al cliente, con etiquetas de bulto en la XP-365B.',
    probar: ['Sumar productos y bultos: el peso y las etiquetas se recalculan', 'Recorrer las etiquetas “Bulto 1 de N”', 'Confirmar y recibir el envío desde el celular'] },
  { archivo: '08-precios.html', etapa: 1, n: '08', titulo: 'Costos y precios', disp: 'notebook', rol: 'Administración',
    resumen: 'Costo FOB, costo nacionalizado y las dos listas de venta, con reglas editables.',
    probar: ['Cambiar un margen de la lista público o de la de distribuidor', 'Ver qué productos todavía no tienen su factor propio', 'Probar el simulador con un factor de importación distinto'] },
  { archivo: '09-migracion.html', etapa: 1, n: '09', titulo: 'Migración del Excel', disp: 'notebook', rol: 'Administración',
    resumen: 'Qué encontramos en el Excel actual y cómo queda ordenado en el sistema.',
    probar: ['Alternar “Excel original / Normalizado”', 'Desplegar cada problema con sus ejemplos reales'] },
  { archivo: '10-app-buscar.html', etapa: 1, n: '10', titulo: 'App · Buscar y escanear', disp: 'celular', rol: 'Depósito',
    resumen: 'Con el celular: escaneás el código y sabés dónde está y cuánto hay.',
    probar: ['Tocar “Escanear” para simular el lector', 'Ver si la pieza es nuestra y de cuándo es la etiqueta', 'Sacar la foto si el producto no tiene'] },
  { archivo: '11-app-recepcion.html', etapa: 2, n: '11', titulo: 'App · Recepción', disp: 'celular', rol: 'Depósito',
    resumen: 'Adelanto de la etapa 2: recibir un envío de Miami contando bulto por bulto y ubicando la mercadería.',
    probar: ['Elegir un envío en tránsito', 'Contar con + / − y ver las diferencias', 'Confirmar y ver el panel actualizado'] },
  { archivo: '12-app-conteo.html', etapa: 1, n: '12', titulo: 'App · Conteo', disp: 'celular', rol: 'Depósito',
    resumen: 'Conteo por ubicación, con modo ciego, diferencias en vivo y la foto de cada producto.',
    probar: ['Sacar la foto de un producto mientras contás', 'Contar y ver las diferencias en unidades y en dólares', 'Confirmar y ver la foto en la ficha'] },
];

const MENU = [
  { grupo: 'Operación', items: ['01-panel.html', '02-inventario.html', '03-ficha-producto.html', '04-movimiento.html', '05-mapa-deposito.html'] },
  { grupo: 'Etiquetas', items: ['06-etiquetas-producto.html', '07-despacho.html'] },
  { grupo: 'Gestión', items: ['08-precios.html', '09-migracion.html'] },
  { grupo: 'App del depósito', items: ['10-app-buscar.html', '11-app-recepcion.html', '12-app-conteo.html'] },
  { grupo: 'Próximas etapas', pronto: ['Ventas', 'Cotizaciones', 'Distribución mayorista', 'Web GROW GLB'] },
];

const TABS = [
  { archivo: '10-app-buscar.html', etiqueta: 'Buscar', icono: 'scan' },
  { archivo: '11-app-recepcion.html', etiqueta: 'Recibir', icono: 'truck' },
  { archivo: '12-app-conteo.html', etiqueta: 'Contar', icono: 'check' },
  { archivo: 'index.html', etiqueta: 'Boceto', icono: 'grid' },
];

const MENU_ICONOS = {
  '01-panel.html': 'dashboard', '02-inventario.html': 'box', '03-ficha-producto.html': 'file', '04-movimiento.html': 'arrows',
  '05-mapa-deposito.html': 'map', '06-etiquetas-producto.html': 'tag', '07-despacho.html': 'truck', '08-precios.html': 'dollar',
  '09-migracion.html': 'sheet', '10-app-buscar.html': 'phone', '11-app-recepcion.html': 'phone', '12-app-conteo.html': 'phone',
};

/* ------------------------------------------------------------------------ */
window.G = (function () {
  const DATA = window.GROW_DATA;

  /* ---------------- íconos ---------------- */
  const ICONOS = {
    dashboard: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
    box: '<path d="M21 8 12 3 3 8v8l9 5 9-5Z"/><path d="m3 8 9 5 9-5"/><path d="M12 13v8"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    scan: '<path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M7 8v8M10.5 8v8M14 8v8M17 8v8"/>',
    arrows: '<path d="M7 4 3 8l4 4"/><path d="M3 8h14"/><path d="m17 20 4-4-4-4"/><path d="M21 16H7"/>',
    map: '<path d="M3 6.5 9 4l6 2.5L21 4v13.5L15 20l-6-2.5L3 20Z"/><path d="M9 4v13.5M15 6.5V20"/>',
    tag: '<path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9Z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
    dollar: '<path d="M12 2v20"/><path d="M17 6.5c-.8-1.4-2.6-2.5-5-2.5-2.8 0-4.5 1.5-4.5 3.5 0 4.8 10 2.5 10 7.5 0 2-2 3.5-5 3.5-2.6 0-4.5-1.1-5.3-2.8"/>',
    sheet: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z"/><path d="M14 3v6h6"/><path d="M8 13h8M8 17h8M12 11v8"/>',
    file: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>',
    printer: '<path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M6 14h12v7H6Z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7"/>',
    alert: '<path d="M10.3 3.9 2.4 17.5A2 2 0 0 0 4.1 20.5h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    truck: '<path d="M2 6h11v10H2Z"/><path d="M13 9h4.5l3.5 3.5V16h-8"/><circle cx="6.5" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
    refresh: '<path d="M20 11A8 8 0 0 0 5.3 6.7L3 9"/><path d="M3 4v5h5"/><path d="M4 13a8 8 0 0 0 14.7 4.3L21 15"/><path d="M21 20v-5h-5"/>',
    back: '<path d="M19 12H5"/><path d="m11 18-6-6 6-6"/>',
    next: '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
    chevron: '<path d="m9 6 6 6-6 6"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    in: '<path d="M12 4v12"/><path d="m6 10 6 6 6-6"/><path d="M4 20h16"/>',
    out: '<path d="M12 20V8"/><path d="m6 14 6-6 6 6"/><path d="M4 4h16"/>',
    adjust: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
    pin: '<path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12Z"/><circle cx="12" cy="9" r="2.5"/>',
    link: '<path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>',
    wrench: '<path d="M14.7 6.3a4 4 0 0 0 5 5L21 13l-8 8-2.5-2.5 1.3-1.3-4.5-4.5-1.3 1.3L3.5 11.5l8-8Z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l3 2"/>',
    phone: '<rect x="6" y="2.5" width="12" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
    laptop: '<rect x="4" y="4" width="16" height="11" rx="1.5"/><path d="M2 19h20"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    eyeoff: '<path d="M3 3l18 18"/><path d="M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.2M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7a9.6 9.6 0 0 0 4.4-1"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
    bluetooth: '<path d="m7 7 10 10-5 4V3l5 4L7 17"/>',
    usb: '<path d="M12 3v14"/><circle cx="12" cy="19" r="2"/><path d="m9 6 3-3 3 3"/><path d="M7 10v2l5 3"/><path d="M17 9v3l-5 3"/>',
    cart: '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.5 12h11l2-8H6.2"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M21.5 20a6.5 6.5 0 0 0-4-6"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5Z"/><path d="m3 13 9 5 9-5"/>',
    sparkle: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
    weight: '<path d="M6 8h12l2 12H4Z"/><circle cx="12" cy="5" r="2"/>',
    camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4Z"/><circle cx="12" cy="13" r="3.5"/>',
  };
  const icono = (nombre, cls) => `<span class="i${cls ? ' ' + cls : ''}" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONOS[nombre] || ICONOS.info}</svg></span>`;
  function hidratar(raiz) {
    (raiz || document).querySelectorAll('i[data-i]').forEach((el) => { el.outerHTML = icono(el.dataset.i, el.className); });
  }

  /* ---------------- formato ---------------- */
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const nfInt = new Intl.NumberFormat('es-AR');
  const nfDec = new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const nfComp = new Intl.NumberFormat('es-AR', { notation: 'compact', maximumFractionDigits: 1 });
  const fmt = {
    int: (n) => nfInt.format(Math.round(n || 0)),
    dec: (n) => nfDec.format(n || 0),
    usd: (n) => (n == null || isNaN(n) ? '—' : 'US$ ' + nfDec.format(n)),
    ars: (n) => (n == null || isNaN(n) ? '—' : '$ ' + nfInt.format(Math.round(n))),
    usdCorto: (n) => 'US$ ' + nfComp.format(n || 0),
    mult: (n) => (n == null ? '—' : 'x' + String(n).replace('.', ',')),
    pad2: (n) => String(Math.max(0, Math.round(n))).padStart(2, '0'),
    kg: (n) => (n == null ? '—' : nfDec.format(n) + ' kg'),
    hace(iso) {
      const min = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
      if (min < 1) return 'recién';
      if (min < 60) return `hace ${min} min`;
      const h = Math.round(min / 60);
      if (h < 24) return `hace ${h} h`;
      const d = Math.round(h / 24);
      return d === 1 ? 'ayer' : `hace ${d} días`;
    },
    fechaHora: (iso) => new Date(iso).toLocaleString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
    fecha: (iso) => new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
  };
  const norm = (s) => String(s == null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/\s+/g, ' ').trim();
  const compacto = (s) => norm(s).replace(/[\s.\-_/]/g, '');
  function resaltar(texto, q) {
    const t = String(texto == null ? '' : texto);
    const nq = norm(q);
    if (!nq) return esc(t);
    const i = norm(t).indexOf(nq);
    if (i < 0 || norm(t).length !== t.length) return esc(t);
    return esc(t.slice(0, i)) + '<mark>' + esc(t.slice(i, i + nq.length)) + '</mark>' + esc(t.slice(i + nq.length));
  }
  function azar(semilla) {
    let a = semilla >>> 0;
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  const demorar = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

  /* ---------------- URL y flujo entre pantallas ---------------- */
  const params = new URLSearchParams(location.search);
  const CLAVES_FLUJO = ['envio', 'eitems', 'eorigen', 'edestino', 'ebultos', 'ecliente', 'recibido', 'ritems', 'mov', 'mid', 'mdep', 'mubic', 'mcant', 'mnueva', 'mdest', 'mref', 'mfob', 'mfac', 'mdoc', 'msal', 'etq', 'ajustes', 'nuevas'];
  const qs = (k, def) => (params.has(k) ? params.get(k) : def);
  // La foto sacada con el celular viaja en el #hash: no llega al servidor, así que su largo no molesta
  const FOTO_FLUJO = new URLSearchParams(location.hash.slice(1)).get('foto') || '';
  function paramsFlujo() {
    const p = new URLSearchParams();
    CLAVES_FLUJO.forEach((k) => { if (params.has(k)) p.set(k, params.get(k)); });
    return p;
  }
  /** Link a otra pantalla conservando el flujo de la demo (+ parámetros propios) */
  function href(archivo, extra) {
    const p = paramsFlujo();
    if (NUEVAS.length) p.set('nuevas', NUEVAS.join(',')); else p.delete('nuevas');
    let foto = FOTO_FLUJO;
    Object.entries(extra || {}).forEach(([k, v]) => {
      if (k === 'foto') { foto = v || ''; return; }
      if (v == null || v === '') p.delete(k); else p.set(k, v);
    });
    const s = p.toString();
    return archivo + (s ? '?' + s : '') + (foto ? '#foto=' + encodeURIComponent(foto) : '');
  }

  /* ---------------- datos y estado en memoria ---------------- */
  const DEPOSITOS = [
    { id: 'MIS', nombre: 'Misiones', pais: 'Argentina', corto: 'AR' },
    { id: 'MIA', nombre: 'Miami', pais: 'Estados Unidos', corto: 'US' },
  ];
  const UBIC_MIAMI = [];
  for (let r = 1; r <= 6; r++) for (const n of ['A', 'B', 'C', 'D']) UBIC_MIAMI.push({ id: `R${r}${n}`, zona: 'rack', nombre: `Rack ${r} · Nivel ${n}` });
  UBIC_MIAMI.push({ id: 'RECEP', zona: 'especial', nombre: 'Recepción' });

  const productos = DATA.productos;
  const porId = new Map(productos.map((p) => [p.id, p]));
  const ubicMis = new Map(DATA.ubicaciones.map((u) => [u.id, u]));
  const ubicMia = new Map(UBIC_MIAMI.map((u) => [u.id, u]));
  const CONFIG = {
    tipoCambio: 1450,
    // Factor FOB → ARG por defecto. Solo se usa cuando el producto no tiene el suyo:
    // según Walter el costo de nacionalizar va de x2 a x10 y se define en cada importación.
    factorNac: 2.2,
    margenes: { 'Filtros': 45, 'Sellos y Juntas': 60, 'Sistema Eléctrico': 50, 'Componentes de Motor': 45, 'Sistema de Enfriamiento': 45, 'Piezas Hidráulicas': 45, 'Sistemas de Inyección': 50, 'Unidad de Fuerza': 40, 'Accesorios': 60, 'Rodaje': 40, 'Otros Productos': 50 },
    margenesDist: { 'Filtros': 30, 'Sellos y Juntas': 40, 'Sistema Eléctrico': 35, 'Componentes de Motor': 30, 'Sistema de Enfriamiento': 30, 'Piezas Hidráulicas': 30, 'Sistemas de Inyección': 35, 'Unidad de Fuerza': 28, 'Accesorios': 40, 'Rodaje': 28, 'Otros Productos': 35 },
    minimo: { 'Filtros': 2 },
    minimoDef: 1,
  };
  /* Dos listas de precios (pedido de Walter: consumidor final y distribuidor) */
  const LISTAS = [
    { id: 'publico', nombre: 'Venta público ARG', corto: 'Público', campo: 'margenes' },
    { id: 'distribuidor', nombre: 'Venta distribuidor', corto: 'Distribuidor', campo: 'margenesDist' },
  ];
  /* Depósitos de proveedor (China): no son stock propio, es lo que tiene el proveedor. Etapa 2 */
  const DEP_PROVEEDOR = [{ id: 'CHN1', nombre: 'China 1', pais: 'Proveedor', corto: 'CN' }];

  /* ---------------- estructura del depósito creada en la demo ----------------
     Formato (viaja en ?nuevas=): R:M:5 = estantería M con 5 niveles · E:6 = estante 6 · C:4:7:FF9900 = caja Nº7 en el estante 4 */
  const NUEVAS = (params.get('nuevas') || '').split(',').filter(Boolean);
  function idsDeEstructura(spec) {
    const [tipo, a, b] = spec.split(':');
    if (tipo === 'R') return Array.from({ length: Math.min(20, Math.max(1, parseInt(b, 10) || 1)) }, (_, i) => `${a}${i}`);
    if (tipo === 'E') return [`EST${a}`];
    if (tipo === 'C') return [`EST${a}-C${b}`];
    return [];
  }
  function crearEstructura(spec) {
    const [tipo, a, b, c] = spec.split(':');
    const creadas = [];
    const agregar = (u) => { if (!ubicMis.has(u.id)) { DATA.ubicaciones.push(u); ubicMis.set(u.id, u); creadas.push(u); } };
    if (tipo === 'R' && /^[A-Z]{1,3}$/.test(a)) {
      idsDeEstructura(spec).forEach((id, i) => agregar({ id, zona: 'rack', nombre: `Estantería ${a} · Nivel ${i}`, nueva: true }));
    } else if (tipo === 'E' && /^\d{1,2}$/.test(a)) {
      agregar({ id: `EST${a}`, zona: 'estante', nombre: `Estante ${a}`, nueva: true });
    } else if (tipo === 'C' && /^\d{1,2}$/.test(a) && /^\d{1,2}$/.test(b) && /^[0-9A-F]{6}$/i.test(c || '')) {
      const id = `EST${a}-C${b}`;
      if (!DATA.cajas.some((x) => x.id === id)) DATA.cajas.push({ id, estante: `EST${a}`, numero: +b, nombre: `Caja Nº${b}`, colorExcel: '#' + c, nueva: true });
      agregar({ id, zona: 'caja', nombre: `Estante ${a} › Caja Nº${b}`, nueva: true });
    }
    return creadas;
  }
  /** Agrega una estantería / estante / caja y la recuerda para las otras pantallas */
  function agregarEstructura(spec) {
    const creadas = crearEstructura(spec);
    if (creadas.length) NUEVAS.push(spec);
    return creadas;
  }
  /** Da de baja algo creado en la demo, solo si está vacío (como en el sistema real) */
  function quitarEstructura(spec) {
    const ids = idsDeEstructura(spec);
    const conStock = productos.some((p) => stockItems(p.id, 'MIS').some((s) => ids.includes(s.ubic) && s.cant > 0));
    if (conStock) throw new Error('No se puede dar de baja: todavía tiene productos. Primero reubicalos.');
    // se sacan en el lugar (sin reasignar) para que G.cajas y G.ubicaciones sigan apuntando a la misma lista
    for (let i = DATA.ubicaciones.length - 1; i >= 0; i--) if (ids.includes(DATA.ubicaciones[i].id)) DATA.ubicaciones.splice(i, 1);
    for (let i = DATA.cajas.length - 1; i >= 0; i--) if (ids.includes(DATA.cajas[i].id)) DATA.cajas.splice(i, 1);
    ids.forEach((id) => ubicMis.delete(id));
    const i = NUEVAS.indexOf(spec);
    if (i >= 0) NUEVAS.splice(i, 1);
  }

  let E = null; // estado
  function sembrar() {
    const rnd = azar(20260917);
    const ahora = Date.now();
    const DIA = 86400000;
    const stock = {};
    productos.forEach((p) => { stock[p.id] = p.stock.map((s) => Object.assign({}, s)); });

    productos.filter((p) => ['DONALDSON', 'CTP', 'CATERPILLAR', 'FLEETGUARD', 'SRP'].includes(p.marca)).forEach((p) => {
      if (rnd() < 0.28) stock[p.id].push({ dep: 'MIA', ubic: UBIC_MIAMI[Math.floor(rnd() * 24)].id, cant: 2 + Math.floor(rnd() * (p.categoria === 'Filtros' ? 16 : 6)) });
    });

    // etiquetados: guardamos la fecha para poder responder "¿esta pieza es nuestra y de cuándo?"
    const etiquetados = {};
    productos.forEach((p) => { if ((hash(p.codigo) % 100) < 64) etiquetados[p.id] = new Date(ahora - ((hash(p.codigo) % 400) + 10) * DIA).toISOString(); });

    const conStock = productos.filter((p) => stock[p.id].some((s) => s.cant > 0));
    const usuarios = ['Mostrador', 'Depósito', 'Administración'];
    const movimientos = [];
    for (let i = 0; i < 110; i++) {
      const p = conStock[Math.floor(rnd() * conStock.length)];
      const loc = stock[p.id].find((s) => s.cant > 0);
      const t = rnd();
      const fecha = new Date(ahora - Math.floor(rnd() * 30 * DIA) - 3600000).toISOString();
      if (t < 0.52) movimientos.push({ tipo: 'egreso', pid: p.id, dep: loc.dep, ubic: loc.ubic, cant: -(1 + Math.floor(rnd() * 2)), motivo: rnd() < 0.7 ? 'Venta mostrador' : 'Envío a cliente', ref: `R-${String(4200 + i).padStart(6, '0')}`, usuario: usuarios[0], fecha });
      else if (t < 0.84) movimientos.push({ tipo: 'ingreso', pid: p.id, dep: loc.dep, ubic: loc.ubic, cant: 2 + Math.floor(rnd() * 10), motivo: loc.dep === 'MIS' ? 'Importación desde Miami' : 'Compra a proveedor', ref: `IMP-2026-0${30 + Math.floor(i / 9)}`, usuario: usuarios[1], fecha });
      else movimientos.push({ tipo: 'ajuste', pid: p.id, dep: loc.dep, ubic: loc.ubic, cant: rnd() < 0.5 ? -1 : 1, motivo: 'Conteo cíclico', ref: 'Conteo', usuario: usuarios[2], fecha });
    }

    // envíos en tránsito Miami -> Misiones
    const transitos = [];
    const candidatosMia = productos.filter((p) => stock[p.id].some((s) => s.dep === 'MIA' && s.cant >= 5));
    [['ENV-0041', 4, 3, 3], ['ENV-0042', 1, 2, 2]].forEach(([envio, dias, cuantos, bultos], k) => {
      const items = candidatosMia.slice(k * 3, k * 3 + cuantos).map((p, j) => {
        const loc = stock[p.id].find((s) => s.dep === 'MIA' && s.cant >= 5);
        const cant = 2 + ((j + k) % 3);
        loc.cant -= cant;
        return { pid: p.id, cant, ubicOrigen: loc.ubic };
      });
      const fecha = new Date(ahora - dias * DIA).toISOString();
      transitos.push({ envio, origen: 'MIA', destino: 'MIS', items, bultos, fecha, estado: 'transito', transporte: 'Aéreo · Miami → Posadas' });
      items.forEach((it) => movimientos.push({ tipo: 'transferencia', pid: it.pid, dep: 'MIA', ubic: it.ubicOrigen, cant: -it.cant, destino: 'MIS', motivo: `Envío ${envio} a Misiones`, ref: envio, usuario: 'Depósito', fecha }));
    });

    movimientos.sort((a, b) => b.fecha.localeCompare(a.fecha));
    E = { stock, etiquetados, movimientos, transitos, fotos: {}, factores: {}, config: JSON.parse(JSON.stringify(CONFIG)), eventos: [], seq: 1 };
    NUEVAS.forEach(crearEstructura);
    aplicarFlujo();
    return E;
  }
  const estado = () => E || sembrar();

  function parsearItems(txt) {
    return String(txt || '').split(',').map((x) => x.split(':')).filter((a) => porId.has(a[0]))
      .map(([pid, cant, ubic]) => ({ pid, cant: Math.max(0, parseInt(cant, 10) || 0), ubic }));
  }

  /** Aplica lo que viene por URL desde otras pantallas (flujo punta a punta) */
  function aplicarFlujo() {
    const ahora = new Date().toISOString();
    // 07 · despacho
    if (params.get('envio') && params.get('eitems') && !E.transitos.some((t) => t.envio === params.get('envio'))) {
      const origen = params.get('eorigen') || 'MIA';
      const destino = params.get('edestino') || 'MIS';
      const cliente = params.get('ecliente') || '';
      const items = parsearItems(params.get('eitems')).map((it) => {
        const loc = E.stock[it.pid].filter((s) => s.dep === origen).sort((a, b) => b.cant - a.cant)[0];
        if (loc) loc.cant = Math.max(0, loc.cant - it.cant);
        E.movimientos.unshift({ tipo: cliente ? 'egreso' : 'transferencia', pid: it.pid, dep: origen, ubic: loc ? loc.ubic : 'RECEP', cant: -it.cant, destino: cliente ? '' : destino, motivo: cliente ? `Despacho ${params.get('envio')} a ${cliente}` : `Envío ${params.get('envio')} a ${depo(destino).nombre}`, ref: params.get('envio'), usuario: 'Depósito', fecha: ahora, nuevo: true });
        return { pid: it.pid, cant: it.cant, ubicOrigen: loc ? loc.ubic : '' };
      });
      const bultos = parseInt(params.get('ebultos'), 10) || 1;
      E.transitos.unshift({ envio: params.get('envio'), origen, destino: cliente ? '' : destino, cliente, items, bultos, fecha: ahora, estado: cliente ? 'despachado' : 'transito', transporte: cliente ? 'Expreso' : 'Aéreo · Miami → Posadas', nuevo: true });
      const u = items.reduce((a, i) => a + i.cant, 0);
      E.eventos.push({ desde: '07 · Despacho', icono: 'truck', texto: cliente ? `Despacho <b>${esc(params.get('envio'))}</b> a ${esc(cliente)}: ${u} u. en ${bultos} bulto(s)` : `Envío <b>${esc(params.get('envio'))}</b> creado: ${u} u. en ${bultos} bulto(s), en tránsito ${depo(origen).nombre} → ${depo(destino).nombre}` });
    }
    // 11 · recepción
    const rec = params.get('recibido');
    const t = rec && E.transitos.find((x) => x.envio === rec && x.estado === 'transito');
    if (t) {
      const contados = parsearItems(params.get('ritems'));
      let total = 0;
      t.items.forEach((it) => {
        const c = contados.find((x) => x.pid === it.pid);
        const cant = c ? c.cant : it.cant;
        const ubic = (c && c.ubic) || 'MOST';
        if (cant > 0) {
          let loc = E.stock[it.pid].find((s) => s.dep === t.destino && s.ubic === ubic);
          if (!loc) { loc = { dep: t.destino, ubic, cant: 0 }; E.stock[it.pid].push(loc); }
          loc.cant += cant;
          delete E.etiquetados[it.pid];
          total += cant;
          E.movimientos.unshift({ tipo: 'ingreso', pid: it.pid, dep: t.destino, ubic, cant, motivo: `Recepción ${t.envio} desde ${depo(t.origen).nombre}`, ref: t.envio, usuario: 'Depósito', fecha: ahora, nuevo: true });
        }
      });
      t.estado = 'recibido';
      t.recibidoEn = ahora;
      t.nuevo = true;
      E.eventos.push({ desde: '11 · Recepción (celular)', icono: 'check', texto: `Envío <b>${esc(rec)}</b> recibido en ${depo(t.destino).nombre}: ${total} u. ubicadas, etiquetas pendientes` });
    }
    // 04 / 12 · movimiento
    const mov = params.get('mov');
    const p = porId.get(params.get('mid'));
    if (mov && p) {
      try {
        const r = aplicarMovimiento({ tipo: mov, pid: p.id, dep: params.get('mdep') || 'MIS', ubic: params.get('mubic'), cant: params.get('mcant'), nueva: params.get('mnueva'), destinoUbic: params.get('mdest'), ref: params.get('mref') || '', fob: params.get('mfob'), factor: params.get('mfac'), doc: params.get('mdoc') || '', salida: params.get('msal') || '' }, true);
        const txt = { ingreso: `Ingreso de ${r.cant} u.`, egreso: `Egreso de ${Math.abs(r.cant)} u.`, ajuste: `Ajuste por conteo (${r.cant > 0 ? '+' : ''}${r.cant} u.)`, transferencia: `Reubicación de ${Math.abs(r.cant)} u.` }[mov];
        E.eventos.push({ desde: mov === 'ajuste' ? '12 · Conteo (celular)' : '04 · Movimiento', icono: 'arrows', texto: `${txt} de <b>${esc(p.codigo)}</b> · ${esc(p.descripcion)}`, pid: p.id });
      } catch (ex) { /* parámetros inválidos: se ignoran */ }
    }
    // 12 · conteo (varios ajustes: pid:ubic:cantidadContada)
    if (params.get('ajustes')) {
      let n = 0, delta = 0, ubicConteo = '';
      params.get('ajustes').split(',').map((x) => x.split(':')).forEach(([pid, u, contada]) => {
        if (!porId.has(pid)) return;
        try {
          const r = aplicarMovimiento({ tipo: 'ajuste', pid, dep: 'MIS', ubic: u, nueva: contada }, true);
          r.motivo = 'Conteo por ubicación (celular)';
          n++; delta += r.cant; ubicConteo = u;
        } catch (ex) { /* se ignora */ }
      });
      if (n) E.eventos.push({ desde: '12 · Conteo (celular)', icono: 'check', texto: `Conteo de <b>${esc(ubic(ubicConteo, 'MIS').nombre)}</b>: ${n} ajuste(s), ${delta > 0 ? '+' : ''}${delta} u. en total` });
    }
    // 10 / 12 · foto sacada con el celular: "P0061~data:image/jpeg;base64,..."
    if (FOTO_FLUJO) {
      const corte = FOTO_FLUJO.indexOf('~');
      const pid = FOTO_FLUJO.slice(0, corte);
      const url = FOTO_FLUJO.slice(corte + 1);
      if (porId.has(pid) && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(url)) {
        E.fotos[pid] = [url];
        E.eventos.push({ desde: 'App del depósito (celular)', icono: 'camera', texto: `<img class="foto foto-evento" src="${url}" alt=""> Foto de <b>${esc(porId.get(pid).codigo)}</b> sacada con el celular` });
      }
    }
    // 06 · etiquetas
    if (params.get('etq')) {
      const ids = params.get('etq').split(',').filter((id) => porId.has(id));
      ids.forEach((id) => { E.etiquetados[id] = new Date().toISOString(); });
      if (ids.length) E.eventos.push({ desde: '06 · Etiquetas', icono: 'tag', texto: `${ids.length} producto(s) etiquetados con el rollo GROW` });
    }
  }

  function depo(id) { return DEPOSITOS.find((d) => d.id === id) || { id, nombre: id, corto: id }; }
  function ubicaciones(dep) { return dep === 'MIA' ? UBIC_MIAMI : DATA.ubicaciones; }
  function ubic(id, dep) { return (dep === 'MIA' ? ubicMia : ubicMis).get(id) || { id, zona: 'especial', nombre: id }; }
  function stockItems(pid, dep) { return (estado().stock[pid] || []).filter((s) => !dep || dep === 'ALL' || s.dep === dep); }
  function stock(pid, dep) { return stockItems(pid, dep).reduce((a, s) => a + s.cant, 0); }
  function presente(p, dep) { return stockItems(p.id, dep).length > 0; }
  function minimo(p) { return estado().config.minimo[p.categoria] || estado().config.minimoDef; }
  function estadoStock(p, dep) {
    const items = stockItems(p.id, dep);
    if (items.some((s) => s.aContar)) return 'contar';
    const n = items.reduce((a, s) => a + s.cant, 0);
    if (n <= 0) return 'sin';
    if (n < minimo(p)) return 'bajo';
    return 'ok';
  }
  const etiquetado = (pid) => !!estado().etiquetados[pid];
  /** Cuándo se le puso la etiqueta GROW: con eso se sabe si una pieza salió de acá y de cuándo es */
  const etiquetadoEn = (pid) => { const v = estado().etiquetados[pid]; return typeof v === 'string' ? v : null; };
  const enTransito = (pid) => estado().transitos.filter((t) => t.estado === 'transito').reduce((a, t) => a + t.items.filter((i) => i.pid === pid).reduce((b, i) => b + i.cant, 0), 0);

  /** Factor de importación del producto: el que se cargó en el ingreso, el del Excel, o el de la configuración */
  function factorDe(p) {
    const propio = estado().factores[p.id];
    if (propio) return { factor: propio.factor, origen: 'ingreso', fecha: propio.fecha, ref: propio.ref };
    if (p.costoFob && p.costoArg && p.multiplicador) return { factor: p.multiplicador, origen: 'excel' };
    return { factor: estado().config.factorNac, origen: 'defecto' };
  }
  /** Costo FOB: el último cargado en un ingreso o el del Excel */
  function costoFob(p) {
    const propio = estado().factores[p.id];
    return (propio && propio.fob) || p.costoFob || null;
  }
  /** Los precios del negocio (definidos por Walter): FOB (venta USA), ARG nacionalizado y las dos listas de venta.
      El costo ARG sale del factor del producto, que se carga en cada ingreso de mercadería. */
  function precios(p, cfg) {
    const c = cfg || estado().config;
    const f = factorDe(p);
    const fob = costoFob(p);
    let arg = null;
    if (f.origen === 'ingreso' && fob) arg = Math.round(fob * f.factor * 100) / 100;
    else if (p.costoArg) arg = p.costoArg;
    else if (fob) arg = Math.round(fob * c.factorNac * 100) / 100;
    const argEstimado = arg != null && f.origen === 'defecto';
    const margen = c.margenes[p.categoria] != null ? c.margenes[p.categoria] : 50;
    const margenDist = c.margenesDist[p.categoria] != null ? c.margenesDist[p.categoria] : 35;
    const conMargen = (m) => (arg ? Math.round(arg * (1 + m / 100) * 100) / 100 : null);
    const venta = conMargen(margen);
    const ventaDist = conMargen(margenDist);
    return {
      fob, arg, argEstimado, factor: f.factor, factorOrigen: f.origen, factorFecha: f.fecha, factorRef: f.ref,
      margen, margenDist, venta, ventaDist,
      ventaArs: venta ? venta * c.tipoCambio : null, ventaDistArs: ventaDist ? ventaDist * c.tipoCambio : null,
      factorReal: p.multiplicador || null, sinCosto: !fob && !arg,
    };
  }
  /** Precio de venta según la lista elegida ('publico' o 'distribuidor') */
  const ventaDeLista = (pr, lista) => (lista === 'distribuidor' ? pr.ventaDist : pr.venta);

  function aplicarMovimiento(m, desdeUrl) {
    const e = estado();
    const p = porId.get(m.pid);
    const items = e.stock[p.id];
    const cant = Math.abs(parseInt(m.cant, 10) || 0);
    const buscarLoc = (dep, u) => items.find((s) => s.dep === dep && s.ubic === u);
    const reg = { pid: p.id, dep: m.dep, ubic: m.ubic, fecha: new Date().toISOString(), usuario: 'Mostrador', ref: m.ref || '', nuevo: true };
    if (m.tipo === 'ingreso') {
      if (!cant) throw new Error('Ingresá una cantidad mayor a cero');
      let loc = buscarLoc(m.dep, m.ubic);
      if (!loc) { loc = { dep: m.dep, ubic: m.ubic, cant: 0 }; items.push(loc); }
      loc.cant += cant;
      delete loc.aContar;
      delete e.etiquetados[p.id];
      // costo de esta importación: el factor va por ítem, como pidió Walter
      const fac = Math.round((parseFloat(m.factor) || 0) * 100) / 100;
      const fob = Math.round((parseFloat(m.fob) || 0) * 100) / 100;
      if (fac > 0) e.factores[p.id] = { factor: fac, fob: fob || costoFob(p), fecha: reg.fecha, ref: m.ref || '' };
      Object.assign(reg, { tipo: 'ingreso', cant, motivo: 'Ingreso de mercadería', usuario: 'Depósito', doc: m.doc || '', salida: m.salida || '', factor: fac > 0 ? fac : null });
    } else if (m.tipo === 'egreso') {
      const loc = buscarLoc(m.dep, m.ubic);
      if (!cant) throw new Error('Ingresá una cantidad mayor a cero');
      if (!loc || loc.cant < cant) throw new Error(`No alcanza el stock en esa ubicación (hay ${loc ? loc.cant : 0})`);
      loc.cant -= cant;
      Object.assign(reg, { tipo: 'egreso', cant: -cant, motivo: 'Venta mostrador' });
    } else if (m.tipo === 'ajuste') {
      let loc = buscarLoc(m.dep, m.ubic);
      if (!loc) { loc = { dep: m.dep, ubic: m.ubic, cant: 0 }; items.push(loc); }
      const nueva = Math.max(0, parseInt(m.nueva, 10) || 0);
      const delta = nueva - loc.cant;
      loc.cant = nueva;
      delete loc.aContar;
      Object.assign(reg, { tipo: 'ajuste', cant: delta, motivo: 'Conteo físico', usuario: 'Depósito' });
    } else if (m.tipo === 'transferencia') {
      const loc = buscarLoc(m.dep, m.ubic);
      if (!cant) throw new Error('Ingresá una cantidad mayor a cero');
      if (!loc || loc.cant < cant) throw new Error(`No alcanza el stock en esa ubicación (hay ${loc ? loc.cant : 0})`);
      if (!m.destinoUbic || m.destinoUbic === m.ubic) throw new Error('Elegí una ubicación de destino distinta');
      loc.cant -= cant;
      let dst = buscarLoc(m.dep, m.destinoUbic);
      if (!dst) { dst = { dep: m.dep, ubic: m.destinoUbic, cant: 0 }; items.push(dst); }
      dst.cant += cant;
      Object.assign(reg, { tipo: 'transferencia', cant: -cant, destinoUbic: m.destinoUbic, motivo: `Reubicación a ${ubic(m.destinoUbic, m.dep).nombre}`, usuario: 'Depósito' });
    } else {
      throw new Error('Tipo de movimiento desconocido');
    }
    e.movimientos.unshift(reg);
    return reg;
  }

  /* ---------------- búsqueda ---------------- */
  let indexado = false;
  function indexar() {
    if (indexado) return;
    productos.forEach((p) => {
      p._c = compacto(p.codigo);
      p._r = p.refs.map(compacto);
      p._d = norm(p.descripcion + ' ' + (p.variantesDesc || []).join(' '));
      p._m = norm(p.marca);
      p._k = norm(p.categoria + ' ' + (p.subcategoria || ''));
      p._x = ' ' + norm(p.compat.join(' ')) + ' ';
    });
    indexado = true;
  }
  function puntaje(p, w) {
    const c = w.replace(/[\s.\-_/]/g, '');
    if (c && p._c === c) return { s: 100, via: 'código', match: p.codigo };
    if (c.length >= 3 && p._c.startsWith(c)) return { s: 80, via: 'código', match: p.codigo };
    if (c.length >= 3) { const i = p._r.indexOf(c); if (i >= 0) return { s: 75, via: 'referencia cruzada', match: p.refs[i] }; }
    if (c.length >= 5 && p._c.includes(c)) return { s: 60, via: 'código', match: p.codigo };
    if (c.length >= 5) { const i = p._r.findIndex((r) => r.includes(c)); if (i >= 0) return { s: 50, via: 'referencia cruzada', match: p.refs[i] }; }
    if (/\d/.test(w) && w.length >= 2 && p._x.includes(' ' + w + ' ')) return { s: 45, via: 'máquina compatible', match: w };
    if (p._d.includes(w)) return { s: 40, via: 'descripción', match: w };
    if (p._m && p._m.includes(w)) return { s: 30, via: 'marca', match: p.marca };
    if (p._k.includes(w)) return { s: 25, via: 'categoría', match: p.categoria };
    if (/\d/.test(w) && w.length >= 3 && p._x.includes(' ' + w)) return { s: 22, via: 'máquina compatible', match: w };
    return { s: 0 };
  }
  function buscar(q) {
    indexar();
    const palabras = norm(q).split(' ').filter(Boolean);
    if (!palabras.length) return [];
    const out = [];
    for (const p of productos) {
      let total = 0, mejor = { s: 0 }, ok = true;
      for (const w of palabras) {
        const r = puntaje(p, w);
        if (!r.s) { ok = false; break; }
        total += r.s;
        if (r.s > mejor.s) mejor = r;
      }
      if (ok) out.push({ p, puntos: total, via: mejor.via, match: mejor.match });
    }
    return out.sort((a, b) => b.puntos - a.puntos || stock(b.p.id) - stock(a.p.id));
  }
  function porCodigo(code) {
    indexar();
    const c = compacto(code);
    return productos.find((p) => p._c === c) || productos.find((p) => p._r.includes(c)) || null;
  }

  /* ---------------- fotos (en memoria: la demo no guarda nada) ---------------- */
  function fotos(pid) { return estado().fotos[pid] || []; }
  function agregarFoto(pid, url) { const e = estado(); (e.fotos[pid] = e.fotos[pid] || []).push(url); }
  /** Lee una imagen elegida o sacada con la cámara y la achica en el navegador (lado mayor = max px) */
  function reducirImagen(fuente, max, calidad) {
    return new Promise((ok, mal) => {
      const cargar = (src) => {
        const img = new Image();
        img.onerror = () => mal(new Error('El archivo no es una imagen'));
        img.onload = () => {
          const k = Math.min(1, max / Math.max(img.width, img.height));
          const c = document.createElement('canvas');
          c.width = Math.max(1, Math.round(img.width * k));
          c.height = Math.max(1, Math.round(img.height * k));
          const ctx = c.getContext('2d');
          ctx.fillStyle = '#fff';
          ctx.fillRect(0, 0, c.width, c.height);
          ctx.drawImage(img, 0, 0, c.width, c.height);
          ok(c.toDataURL('image/jpeg', calidad || 0.82));
        };
        img.src = src;
      };
      if (typeof fuente === 'string') { cargar(fuente); return; }
      const lector = new FileReader();
      lector.onerror = () => mal(new Error('No se pudo leer la imagen'));
      lector.onload = () => cargar(lector.result);
      lector.readAsDataURL(fuente);
    });
  }
  /** Foto principal del producto o, si no tiene, un marcador "sin foto" */
  function fotoHTML(p, clase) {
    const f = fotos(p.id)[0];
    return f
      ? `<img class="foto ${clase || ''}" src="${f}" alt="Foto de ${esc(p.codigo)}">`
      : `<span class="foto sin-foto ${clase || ''}" title="Sin foto todavía">${icono('camera')}</span>`;
  }

  /* ---------------- exportar a Excel ----------------
     Walter: "necesito poder bajar fragmentadamente toda la información". Se baja lo que se está viendo,
     con las columnas elegidas, en CSV con punto y coma: Excel en español lo abre en columnas sin preguntar nada. */
  function exportarCSV(nombre, columnas, filas) {
    const celda = (v) => {
      const s = v == null ? '' : String(v);
      return /[";\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    };
    const lineas = [columnas.map((c) => celda(c.t)).join(';')];
    filas.forEach((f) => lineas.push(columnas.map((c) => celda(c.v(f))).join(';')));
    const blob = new Blob(['﻿' + lineas.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = String(nombre).replace(/[\\/:*?"<>|]+/g, '-') + '.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    return filas.length;
  }

  /** Ventana modal simple (se cierra con Escape, con la X o tocando afuera) */
  function modal(titulo, cuerpo, pie) {
    const fondo = document.createElement('div');
    fondo.className = 'modal-fondo';
    fondo.innerHTML = `<div class="modal" role="dialog" aria-modal="true" aria-label="${esc(titulo)}">
        <div class="modal-cab"><b>${esc(titulo)}</b><button class="btn btn-icono btn-fantasma" type="button" data-cerrar aria-label="Cerrar">${icono('x')}</button></div>
        <div class="modal-cuerpo">${cuerpo}</div>
        ${pie ? `<div class="modal-pie">${pie}</div>` : ''}
      </div>`;
    document.body.appendChild(fondo);
    hidratar(fondo);
    const alTeclado = (e) => { if (e.key === 'Escape') cerrar(); };
    function cerrar() { fondo.remove(); document.removeEventListener('keydown', alTeclado); }
    document.addEventListener('keydown', alTeclado);
    fondo.addEventListener('click', (e) => { if (e.target === fondo || e.target.closest('[data-cerrar]')) cerrar(); });
    return { el: fondo, cerrar };
  }

  /** Diálogo "Exportar a Excel".
      o = { nombre, resumen, columnas: [{k,t,v,def}], filas, todas, etiquetaFiltro } */
  function dialogoExportar(o) {
    const cols = o.columnas.map((c, i) => Object.assign({ i }, c));
    const alcances = [{ v: 'vista', t: o.etiquetaFiltro || 'Lo que estoy viendo', n: o.filas.length }];
    if (o.todas && o.todas.length !== o.filas.length) alcances.push({ v: 'todo', t: 'Todo el inventario', n: o.todas.length });
    const m = modal('Exportar a Excel', `
      <p class="chico tinta-2" style="margin-bottom:12px">${o.resumen || ''}</p>
      <div class="campo" style="margin-bottom:14px"><span>Qué bajar</span>
        <div class="pila" style="gap:6px">${alcances.map((a, i) => `<label class="check"><input type="radio" name="alcance" value="${a.v}"${i === 0 ? ' checked' : ''}><span>${esc(a.t)} <b class="num">${fmt.int(a.n)}</b> producto(s)</span></label>`).join('')}</div>
      </div>
      <div class="campo"><span>Columnas</span>
        <div class="grilla" style="grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:6px 14px">
          ${cols.map((c) => `<label class="check"><input type="checkbox" data-col="${c.i}"${c.def === false ? '' : ' checked'}><span>${esc(c.t)}</span></label>`).join('')}
        </div>
      </div>`,
      `<span class="chico tenue">Se baja un archivo .csv que Excel abre directo.</span>
       <button class="btn btn-acento" type="button" data-bajar>${icono('sheet')}Bajar el Excel</button>`);
    m.el.querySelector('[data-bajar]').addEventListener('click', () => {
      const elegidas = cols.filter((c) => m.el.querySelector(`[data-col="${c.i}"]`).checked);
      if (!elegidas.length) { toast('Elegí al menos una columna', 'alert'); return; }
      const alcance = m.el.querySelector('[name="alcance"]:checked').value;
      const filas = alcance === 'todo' ? o.todas : o.filas;
      const n = exportarCSV(o.nombre, elegidas, filas);
      m.cerrar();
      toast(`${fmt.int(n)} producto(s) exportados a Excel`, 'sheet');
    });
    return m;
  }

  function kpis(dep) {
    let conStock = 0, unidades = 0, valor = 0, sin = 0, bajo = 0, pendientes = 0, registrados = 0, sinFoto = 0;
    for (const p of productos) {
      if (!presente(p, dep)) continue;
      registrados++;
      const n = stock(p.id, dep);
      const est = estadoStock(p, dep);
      if (n > 0) { conStock++; unidades += n; }
      const pr = precios(p);
      if (pr.arg && n > 0) valor += pr.arg * n;
      if (est === 'sin') sin++;
      if (est === 'bajo') bajo++;
      if (n > 0 && !etiquetado(p.id)) pendientes++;
      if (n > 0 && !fotos(p.id).length) sinFoto++;
    }
    const tr = estado().transitos.filter((t) => t.estado === 'transito' && (dep === 'ALL' || t.origen === dep || t.destino === dep));
    return { conStock, unidades, valor, sin, bajo, pendientes, registrados, sinFoto, transitos: tr.length, transitoU: tr.reduce((a, t) => a + t.items.reduce((b, i) => b + i.cant, 0), 0) };
  }

  /* ---------------- Code128-B ---------------- */
  const PATRONES = ['212222', '222122', '222221', '121223', '121322', '131222', '122213', '122312', '132212', '221213', '221312', '231212', '112232', '122132', '122231', '113222', '123122', '123221', '223211', '221132', '221231', '213212', '223112', '312131', '311222', '321122', '321221', '312212', '322112', '322211', '212123', '212321', '232121', '111323', '131123', '131321', '112313', '132113', '132311', '211313', '231113', '231311', '112133', '112331', '132131', '113123', '113321', '133121', '313121', '211331', '231131', '213113', '213311', '213131', '311123', '311321', '331121', '312113', '312311', '332111', '314111', '221411', '431111', '111224', '111422', '121124', '121421', '141122', '141221', '112214', '112412', '122114', '122411', '142112', '142211', '241211', '221114', '413111', '241112', '134111', '111242', '121142', '121241', '114212', '124112', '124211', '411212', '421112', '421211', '212141', '214121', '412121', '111143', '111341', '131141', '114113', '114311', '411113', '411311', '113141', '114131', '311141', '411131', '211412', '211214', '211232', '2331112'];
  function code128Valores(texto) {
    const limpio = String(texto).replace(/[^\x20-\x7E]/g, '');
    const v = [104];
    for (const ch of limpio) v.push(ch.charCodeAt(0) - 32);
    let suma = v[0];
    for (let i = 1; i < v.length; i++) suma += v[i] * i;
    v.push(suma % 103, 106);
    return v;
  }
  function codigoBarras(texto, alto) {
    const h = alto || 40;
    const mods = [];
    for (let q = 0; q < 10; q++) mods.push(0);
    code128Valores(texto).forEach((val) => {
      const pat = PATRONES[val];
      for (let i = 0; i < pat.length; i++) for (let k = 0; k < +pat[i]; k++) mods.push(i % 2 === 0 ? 1 : 0);
    });
    for (let q = 0; q < 10; q++) mods.push(0);
    let rects = '';
    for (let x = 0; x < mods.length;) {
      if (mods[x]) { let w = 1; while (mods[x + w]) w++; rects += `<rect x="${x}" width="${w}" height="${h}"/>`; x += w; } else x++;
    }
    return `<svg viewBox="0 0 ${mods.length} ${h}" preserveAspectRatio="none" shape-rendering="crispEdges" role="img" aria-label="Código de barras ${esc(texto)}"><g fill="#000">${rects}</g></svg>`;
  }

  /* ---------------- etiquetas ---------------- */
  /* Tipos de parte según GROW. Solo "alternativa" tiene rollo pre-impreso: las otras se imprimen completas en rollo blanco */
  const TIPOS_PARTE = {
    alternativa: { nombre: 'Alternativa', titulo: 'PARTES ALTERNATIVAS', rollo: 'pre', sufijo: 'ALT' },
    genuina: { nombre: 'Original', titulo: 'PARTES ORIGINALES', rollo: 'blanco', sufijo: 'GEN' },
    obsoleta: { nombre: 'Obsoleta', titulo: 'PARTES OBSOLETAS', rollo: 'blanco', sufijo: 'ALT' },
  };
  /** Iniciales del proveedor para el sufijo (ej. KO), tomadas del código o de la ficha */
  function sufijoProveedor(p) {
    const enCodigo = p.codigo.match(/\.([A-Z]{1,3})$/);
    if (enCodigo) return enCodigo[1];
    return (p.proveedores || []).find((x) => /^[A-Z]{1,3}$/.test(x)) || null;
  }
  /** Sufijo por defecto: GEN si es original; las iniciales del proveedor si se conoce; si no, ALT */
  function sufijoDefecto(p) {
    if (p.tipoParte === 'genuina') return 'GEN';
    return sufijoProveedor(p) ? 'PROV' : 'ALT';
  }
  /** Part N como lo imprime GROW: número de pieza + "." + sufijo (proveedor, GEN o ALT). Ej. 1779953.KO */
  function partN(p, sufijo) {
    const s = sufijo === undefined ? sufijoDefecto(p) : sufijo;
    const base = p.codigo.replace(/\.[A-Z]{1,3}$/, '');
    const suf = s === 'PROV' ? sufijoProveedor(p) : s;
    return suf ? `${base}.${suf}` : base;
  }
  function descEtiqueta(texto) {
    const d = String(texto || '').replace(/\s*\(.*?\)\s*/g, ' ').trim();
    return d.length > 16 ? d.slice(0, 15).trim() + '…' : d;
  }
  /** Etiqueta de producto (XP-H500B). datos: { partN, descripcion, cant, tipo } — sirve para productos y para carga manual */
  function etiqueta(datos, o) {
    const op = Object.assign({ soloImpresion: false, codigo: true, dx: 0, dy: 0, guia: false }, o || {});
    const tipo = TIPOS_PARTE[datos.tipo] || TIPOS_PARTE.alternativa;
    const preImpreso = tipo.rollo === 'pre';
    // desplazamiento en mm sobre una etiqueta de 100×70 mm
    const tx = (op.dx / 100) * 100, ty = (op.dy / 70) * 100;
    const cabecera = `<div class="franja"><div class="logo-grow"><span class="g">G</span>R<span class="o">O</span>W</div><div class="lema">PARTES &amp; MÁQUINAS</div></div>
        <div class="tipo">${tipo.titulo}</div>
        <div class="cols"><span>PART N</span><span>DESCRIPCION</span><span>QTY</span></div>`;
    const pn = datos.partN || '—';
    return `<div class="etq-pre${preImpreso ? '' : ' en-blanco'}${op.soloImpresion ? ' solo-impresion' : ''}" role="img" aria-label="Etiqueta GROW ${esc(tipo.titulo)} de ${esc(pn)}" data-tipo="${esc(datos.tipo || 'alternativa')}">
      ${preImpreso ? `<div class="capa-pre">${cabecera}</div>` : ''}
      <div class="capa-imp" style="transform: translate(${tx}%, ${ty}%)">
        ${preImpreso ? '' : cabecera}
        ${op.codigo && datos.partN ? `<div class="cb">${codigoBarras(datos.partN, 30)}</div>` : ''}
        <div class="datos"><span>${esc(pn)}</span><span>${esc(descEtiqueta(datos.descripcion).toUpperCase())}</span><span>${fmt.pad2(datos.cant || 1)}</span></div>
      </div>
      ${op.guia ? '<div class="guia"></div>' : ''}
    </div>`;
  }
  function etiquetaProducto(p, o) {
    const op = o || {};
    return etiqueta({ partN: partN(p, op.sufijo), descripcion: p.descripcion, cant: op.cant || p.empaque || 1, tipo: op.tipo || p.tipoParte }, op);
  }
  function etiquetaDespacho(o) {
    return `<div class="etq-desp" role="img" aria-label="Etiqueta de despacho ${esc(o.envio)} bulto ${o.bulto} de ${o.total}"><div class="d-in">
      <div class="d-cab"><span class="d-logo">GROW</span><span class="d-tipo">DESPACHO<br>${esc(o.envio)}</span></div>
      <div><div class="d-para">Para</div><div class="d-nombre">${esc(o.nombre)}</div></div>
      <div class="d-dir">${esc(o.direccion)}<br>${esc(o.transporte)}</div>
      <div class="d-pie">
        <div class="d-bulto"><small>BULTO</small><b>${o.bulto}/${o.total}</b><small>${esc(fmt.dec(o.peso))} KG</small></div>
        <div class="d-cb">${codigoBarras(`${o.envio}-${o.bulto}`, 40)}<span>${esc(o.envio)}-${o.bulto}</span></div>
      </div>
    </div></div>`;
  }

  /* ---------------- piezas de UI ---------------- */
  const ui = {
    estado(p, dep) {
      const e = estadoStock(p, dep);
      if (e === 'sin') return `<span class="badge b-alerta">${icono('x')}Sin stock</span>`;
      if (e === 'bajo') return `<span class="badge b-aviso">${icono('alert')}Bajo mínimo</span>`;
      if (e === 'contar') return `<span class="badge b-aviso">${icono('clock')}A contar</span>`;
      return `<span class="badge b-ok">${icono('check')}OK</span>`;
    },
    etiqueta(p) {
      if (stock(p.id) <= 0) return '<span class="tenue">—</span>';
      return etiquetado(p.id) ? `<span class="badge b-neutro">${icono('tag')}Etiquetado</span>` : `<span class="badge b-acento">${icono('tag')}Pendiente</span>`;
    },
    tipoParte(p) {
      const t = TIPOS_PARTE[p.tipoParte] || TIPOS_PARTE.alternativa;
      const cls = p.tipoParte === 'genuina' ? 'b-info' : p.tipoParte === 'obsoleta' ? 'b-aviso' : 'b-borde';
      return `<span class="badge ${cls}" title="Asignado automáticamente, a confirmar">Parte ${t.nombre.toLowerCase()}</span>`;
    },
    ubicCorta(s) { return `<span class="badge ${s.dep === 'MIA' ? 'b-info' : 'b-borde'}">${depo(s.dep).corto} · <span class="mono">${esc(s.ubic === 'SIN' ? 'S/U' : s.ubic)}</span></span>`; },
    movIcono(m) {
      const ic = { ingreso: 'in', egreso: 'out', ajuste: 'adjust', transferencia: 'truck' }[m.tipo] || 'adjust';
      return `<span class="mov-ic mov-${m.tipo}">${icono(ic)}</span>`;
    },
    movTipo(m) { return { ingreso: 'Ingreso', egreso: 'Egreso', ajuste: 'Ajuste', transferencia: m.destino ? 'Transferencia' : 'Reubicación' }[m.tipo] || m.tipo; },
    cant(n) { return n > 0 ? `<span class="cant-mas num">+${n}</span>` : n < 0 ? `<span class="cant-menos num">${n}</span>` : '<span class="num tenue">0</span>'; },
    /** Segmentos genéricos: devuelve HTML; escuchar clicks en [data-seg] */
    segmentos(nombre, opciones, actual) {
      return `<div class="segmentos" role="group" data-grupo="${nombre}">${opciones.map((o) => (o.pronto
        ? `<button type="button" class="seg-pronto" disabled title="${esc(o.titulo || 'Se implementa en la etapa 2')}">${o.icono ? icono(o.icono) : ''}${esc(o.t)}<span class="tag-seg">etapa 2</span></button>`
        : `<button type="button" data-seg="${nombre}" data-v="${esc(o.v)}" aria-pressed="${o.v === actual}">${o.icono ? icono(o.icono) : ''}${esc(o.t)}</button>`)).join('')}</div>`;
    },
    /** Marca para lo que es de la etapa 2 (Miami) cuando aparece en una pantalla de la etapa 1 */
    etapa2(texto) {
      return `<span class="badge b-etapa2" title="Se implementa en la etapa 2 (multi-depósito con Miami)">${icono('clock')}${esc(texto || 'Etapa 2')}</span>`;
    },
    depositos(actual, conTodos, conProveedor) {
      const ops = (conTodos ? [{ v: 'ALL', t: 'Todos' }] : []).concat(DEPOSITOS.map((d) => ({ v: d.id, t: d.nombre })));
      // los depósitos de proveedor (China) se muestran apagados: es stock que no es propio
      if (conProveedor) DEP_PROVEEDOR.forEach((d) => ops.push({ v: d.id, t: d.nombre, pronto: true, titulo: 'Stock del proveedor, no es propio. Se implementa en la etapa 2.' }));
      const seg = ui.segmentos('dep', ops, actual);
      // en las pantallas de la etapa 1, Miami queda aclarado como etapa 2
      return pantalla.etapa === 1 ? `<div class="fila" style="gap:8px">${seg}${ui.etapa2('Miami: etapa 2')}</div>` : seg;
    },
    /** Selector de lista de precios: público o distribuidor */
    listas(actual) {
      return ui.segmentos('lista', LISTAS.map((l) => ({ v: l.id, t: l.corto })), actual);
    },
    /** "¿Esta pieza es nuestra?": la etiqueta GROW con su fecha y el último movimiento */
    trazabilidad(p) {
      const f = etiquetadoEn(p.id);
      if (!f) return `<div class="alerta aviso">${icono('alert')}<span>Todavía no tiene etiqueta GROW: no se puede saber si salió de acá.</span></div>`;
      const ult = estado().movimientos.find((m) => m.pid === p.id);
      return `<div class="alerta ok">${icono('check')}<span>Etiqueta GROW <b class="mono">${esc(partN(p))}</b> impresa el <b>${fmt.fecha(f)}</b> (${fmt.hace(f)})${ult ? ` · último movimiento: ${ui.movTipo(ult).toLowerCase()} del ${fmt.fecha(ult.fecha)}` : ''}</span></div>`;
    },
  };

  let tip = null;
  const tooltip = {
    mostrar(html, ev) {
      if (!tip) { tip = document.createElement('div'); tip.className = 'tooltip'; document.body.appendChild(tip); }
      tip.innerHTML = html; tip.hidden = false; tooltip.mover(ev);
    },
    mover(ev) {
      if (!tip) return;
      let x = ev.clientX + 14, y = ev.clientY + 14;
      if (x + tip.offsetWidth > innerWidth - 8) x = ev.clientX - tip.offsetWidth - 14;
      if (y + tip.offsetHeight > innerHeight - 8) y = ev.clientY - tip.offsetHeight - 14;
      tip.style.left = x + 'px'; tip.style.top = y + 'px';
    },
    ocultar() { if (tip) tip.hidden = true; },
  };

  function toast(msg, ic) {
    let caja = document.querySelector('.toast-caja');
    if (!caja) { caja = document.createElement('div'); caja.className = 'toast-caja'; caja.setAttribute('aria-live', 'polite'); document.body.appendChild(caja); }
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = `${icono(ic || 'check')}<span>${msg}</span>`;
    caja.appendChild(t);
    setTimeout(() => t.remove(), 3600);
  }

  /* ---------------- shells ---------------- */
  const archivoActual = (location.pathname.split('/').pop() || 'index.html');
  const pantalla = SCREENS.find((s) => s.archivo === (document.body.dataset.pantalla || archivoActual)) || SCREENS[0];
  const idx = SCREENS.indexOf(pantalla);

  function marcaHTML(sub) {
    return `<a class="marca" href="${href('index.html')}"><span class="marca-logo">GR<b>O</b>W</span><span class="marca-sub">${sub || 'Stock'}</span></a>`;
  }

  function navPantallas() {
    const prev = SCREENS[idx - 1];
    const sig = SCREENS[idx + 1];
    const lista = SCREENS.map((s) => `<a href="${href(s.archivo)}" class="${s === pantalla ? 'activo' : ''}"><span class="n">${s.n}</span><span class="corta">${esc(s.titulo)}</span><span class="disp">${s.disp === 'celular' ? icono('phone', 'i-sm') : s.disp === 'notebook' ? icono('laptop', 'i-sm') : ''}</span></a>`).join('');
    return `<nav class="nav-pantallas" aria-label="Pantallas del boceto">
      ${prev ? `<a class="paso ant" href="${href(prev.archivo)}"><small>← Anterior</small><span>${prev.n} · ${esc(prev.titulo)}</span></a>` : '<span class="vacio"></span>'}
      <details class="indice-desplegable"><summary class="btn btn-chico">${icono('grid')}Pantalla ${pantalla.n} de ${SCREENS.length - 1}</summary><div class="indice-lista">${lista}</div></details>
      ${sig ? `<a class="paso sig" href="${href(sig.archivo)}"><small>Siguiente →</small><span>${sig.n} · ${esc(sig.titulo)}</span></a>` : '<span class="vacio"></span>'}
    </nav>`;
  }

  function flujoHTML() {
    const ev = estado().eventos;
    if (!ev.length) return '';
    return `<div class="flujo">${ev.map((e) => `<div class="flujo-item">${icono(e.icono)}<div style="min-width:0"><div class="desde">Viene de ${esc(e.desde)}</div><div>${e.texto}</div></div></div>`).join('')}
      <div class="chico tenue">Los datos viajan entre pantallas por la URL. <a href="${location.pathname.split('/').pop()}">Volver al estado inicial</a></div></div>`;
  }

  function shellEscritorio(pagina) {
    const menu = MENU.map((g) => {
      if (g.pronto) return `<div class="menu-grupo">${g.grupo}</div>${g.pronto.map((t) => `<span class="menu-item pronto">${icono({ Ventas: 'cart', Cotizaciones: 'file', 'Distribución mayorista': 'users' }[t] || 'globe')}<span>${t}</span><span class="tag">Próx.</span></span>`).join('')}`;
      return `<div class="menu-grupo">${g.grupo}</div>` + g.items.map((a) => {
        const s = SCREENS.find((x) => x.archivo === a);
        return `<a class="menu-item${s === pantalla ? ' activo' : ''}" href="${href(a)}"><span class="n">${s.n}</span>${icono(MENU_ICONOS[a])}<span>${esc(s.titulo.replace('App · ', ''))}</span>${s.etapa === 2 ? '<span class="tag">etapa 2</span>' : s.disp === 'celular' ? '<span class="tag">celu</span>' : ''}</a>`;
      }).join('');
    }).join('');
    const app = document.createElement('div');
    app.className = 'app';
    app.innerHTML = `
      <aside class="lateral">${marcaHTML('Stock')}<nav class="menu" aria-label="Menú">${menu}</nav>
        <div class="lateral-pie"><strong>Boceto</strong><span>Productos reales del Excel de GROW. Costos alterados y movimientos simulados.</span><a href="${location.pathname.split('/').pop()}">Reiniciar esta pantalla</a></div>
      </aside>
      <div class="principal">
        <header class="barra-sup"><div class="titulo-sup"><span class="n">${pantalla.n}</span><span class="corta">${esc(pantalla.titulo)}</span>${pantalla.etapa ? `<span class="badge ${pantalla.etapa === 1 ? 'b-etapa1' : 'b-etapa2'}">Etapa ${pantalla.etapa}${pantalla.etapa === 2 ? ' · adelanto' : ''}</span>` : ''}</div><span class="espacio"></span>
          <div class="usuario"><span class="avatar">${pantalla.rol.slice(0, 2).toUpperCase()}</span><div><strong>${esc(pantalla.rol)}</strong><small>GROW · Misiones</small></div></div></header>
        <div class="contenido">${flujoHTML()}</div>
        ${navPantallas()}
      </div>`;
    document.body.prepend(app);
    app.querySelector('.contenido').appendChild(pagina);
  }

  function shellTelefono(pagina) {
    const hora = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    const cont = document.createElement('div');
    cont.innerHTML = `
      <div class="escenario">
        <div class="escenario-info">
          ${marcaHTML('Depósito')}
          <div><div class="antetitulo">${icono('phone', 'i-sm')} Pantalla ${pantalla.n} · App del depósito · Etapa ${pantalla.etapa}${pantalla.etapa === 2 ? ' (adelanto)' : ''}</div><h1>${esc(pantalla.titulo.replace('App · ', ''))}</h1></div>
          <p class="tinta-2">${esc(pantalla.resumen)}</p>
          <div class="panel"><div class="fuerte" style="margin-bottom:6px">Qué probar</div><ul>${pantalla.probar.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></div>
          ${flujoHTML()}
        </div>
        <div class="telefono">
          <div class="estado-tel"><span>${hora}</span><span class="iconos">${icono('bluetooth', 'i-sm')}<span class="bateria"></span></span></div>
          <div class="barra-app"><div class="t"><small>GROW · Depósito Misiones</small>${esc(document.body.dataset.appTitulo || pantalla.titulo.replace('App · ', ''))}</div><span class="avatar">DP</span></div>
          <div class="cuerpo-app"></div>
          <nav class="pestanas" aria-label="Pestañas de la app">${TABS.map((t) => `<a class="pestana${t.archivo === pantalla.archivo ? ' activa' : ''}" href="${href(t.archivo)}">${icono(t.icono)}<span>${t.etiqueta}</span></a>`).join('')}</nav>
        </div>
      </div>
      ${navPantallas()}`;
    document.body.prepend(...cont.children);
    document.querySelector('.cuerpo-app').appendChild(pagina);
  }

  function shellPortada(pagina) {
    const top = document.createElement('header');
    top.className = 'portada-top';
    top.innerHTML = `${marcaHTML('Stock · Boceto')}<a class="btn btn-acento" href="${href('01-panel.html')}">Empezar el recorrido ${icono('next')}</a>`;
    document.body.prepend(top);
    top.after(pagina);
    pagina.insertAdjacentHTML('afterend', navPantallas());
  }

  function iniciar() {
    const pagina = document.getElementById('pagina');
    if (!pagina) return;
    estado();
    const tipo = document.body.dataset.shell;
    if (tipo === 'telefono') shellTelefono(pagina);
    else if (tipo === 'portada') shellPortada(pagina);
    else shellEscritorio(pagina);
    hidratar(document);
    // cerrar el índice desplegable al hacer clic afuera
    document.addEventListener('click', (e) => {
      document.querySelectorAll('.indice-desplegable[open]').forEach((d) => { if (!d.contains(e.target)) d.removeAttribute('open'); });
    });
  }

  const api = {
    SCREENS, DEPOSITOS, UBIC_MIAMI, datos: DATA, productos, resumen: DATA.resumen, cajas: DATA.cajas,
    icono, hidratar, esc, fmt, norm, compacto, resaltar, azar, hash, demorar,
    params, qs, href, paramsFlujo,
    estado, producto: (id) => porId.get(id), porCodigo, depo, ubicaciones, ubic, stockItems, stock, presente, minimo, estadoStock, etiquetado, etiquetadoEn, enTransito,
    precios, factorDe, costoFob, ventaDeLista, LISTAS, DEP_PROVEEDOR, aplicarMovimiento, buscar, kpis, fotos, agregarFoto, reducirImagen, fotoHTML,
    exportarCSV, dialogoExportar, modal,
    agregarEstructura, quitarEstructura, idsDeEstructura, nuevas: () => NUEVAS.slice(),
    codigoBarras, code128Valores, TIPOS_PARTE, sufijoProveedor, sufijoDefecto, partN, etiqueta, etiquetaProducto, etiquetaDespacho,
    ui, tooltip, toast, pantalla,
  };
  window.G = api;
  iniciar();
  return api;
})();
