/* ==========================================================================
   Stock regional · control de productos para demos y regalos
   Los datos viven en una planilla de Google (ver apps-script/). Cada dispositivo guarda
   una copia local para abrir rápido y sin internet; lo que se anota queda en una cola
   y se manda a la planilla cuando hay conexión. Sin planilla, funciona solo en el dispositivo.
   ========================================================================== */
(function () {
  'use strict';

  const CLAVE = 'stockRegional.v1';
  const CLAVE_CONEXION = 'stockRegional.conexion';
  const CLAVE_COLA = 'stockRegional.cola';
  const ZXING = 'https://cdn.jsdelivr.net/npm/@zxing/browser@0.1.5/umd/zxing-browser.min.js';
  const QR = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
  const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const MOTIVOS = ['Demo', 'Regalo', 'Premio', 'Venta', 'Vencido', 'Otro'];
  const MESES_ALERTA = 3; // "vence pronto" = dentro de 3 meses

  // Prefijo del nombre en su Excel → categoría. El prefijo se oculta al mostrar el nombre.
  const CATEGORIAS = [
    ['MAKE UP ', 'Maquillaje'], ['MALE UP ', 'Maquillaje'], ['MAKE ', 'Maquillaje'],
    ['BODY SPLASH ', 'Body splash'], ['PERF ', 'Perfumes'], ['CUERPO ', 'Cuerpo'],
    ['ROSTRO ', 'Rostro'], ['JAB ', 'Jabones'], ['CABELLOS ', 'Cabellos'], ['MANOS ', 'Manos'],
    ['DEO ', 'Desodorantes'], ['REGALABLE ', 'Regalables'], ['FRESCOR ', 'Frescor'], ['PIES ', 'Pies'],
  ];

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const hoy = new Date();
  const mesActual = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`;
  const sumarMeses = (ym, n) => { const [y, m] = ym.split('-').map(Number); const d = new Date(y, m - 1 + n, 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; };
  const limitePronto = sumarMeses(mesActual, MESES_ALERTA);

  const ICONOS = {
    buscar: '<path d="M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM15.5 15.5L20 20"/>',
    escanear: '<path d="M3 8V4h4M17 4h4v4M21 16v4h-4M7 20H3v-4M7 8v8M10 8v8M13 8v8M16 8v8"/>',
    menos: '<path d="M5 12h14"/>', mas: '<path d="M12 5v14M5 12h14"/>',
    cerrar: '<path d="M6 6l12 12M18 6L6 18"/>',
    subir: '<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>', bajar: '<path d="M12 4v12M7 11l5 5 5-5M4 20h16"/>',
    copia: '<path d="M5 4h10l4 4v12H5zM14 4v5h5M9 14h6M9 17h4"/>',
    lapiz: '<path d="M4 20h4L19 9l-4-4L4 16zM13 7l4 4"/>',
    alerta: '<path d="M12 4l9 16H3zM12 10v4M12 17v.5"/>',
    tacho: '<path d="M5 7h14M9 7V4h6v3M7 7l1 13h8l1-13"/>',
    celular: '<path d="M7 3h10v18H7zM11 18h2"/>',
    salida: '<path d="M3 13v7h18v-7M12 15V3M7 8l5-5 5 5"/>',
    entrada: '<path d="M3 13v7h18v-7M12 3v12M7 10l5 5 5-5"/>',
  };
  const ic = (n) => `<svg class="ic" viewBox="0 0 24 24">${ICONOS[n]}</svg>`;

  /* ---------------------------------------------------------------- datos */
  let db = cargar();

  function vacio() { return { productos: [], movs: [], meta: { creado: new Date().toISOString(), respaldo: null } }; }
  function cargar() {
    try { const d = JSON.parse(localStorage.getItem(CLAVE)); if (d && Array.isArray(d.productos)) return d; } catch (e) { /* sin datos */ }
    return vacio();
  }
  function guardar() {
    try { localStorage.setItem(CLAVE, JSON.stringify(db)); }
    catch (e) { aviso('No se pudo guardar en el celular. Guardá una copia desde "Más".'); }
  }
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});

  const producto = (id) => db.productos.find((p) => p.id === id);
  const total = (p) => p.tandas.reduce((a, t) => a + t.c, 0);
  const tandasConStock = (p) => p.tandas.filter((t) => t.c > 0).sort(ordenVenc);
  function ordenVenc(a, b) { return (a.v || '9999-99').localeCompare(b.v || '9999-99'); }
  const proxVenc = (p) => { const t = tandasConStock(p)[0]; return t ? t.v : null; };
  const estadoVenc = (v) => !v ? null : v < mesActual ? 'vencido' : v <= limitePronto ? 'pronto' : 'ok';
  const fmtVenc = (v) => { if (!v) return 'sin fecha'; const [y, m] = v.split('-'); return `${MESES[+m - 1]} ${y}`; };
  const fmtVencCorto = (v) => { if (!v) return 's/f'; const [y, m] = v.split('-'); return `${m}/${y}`; };

  function categoriaDe(nombre) {
    const n = nombre.toUpperCase();
    for (const [pre, cat] of CATEGORIAS) if (n.startsWith(pre)) return cat;
    return 'Otros';
  }
  function nombreCorto(p) {
    const n = p.nombre;
    for (const [pre] of CATEGORIAS) if (n.toUpperCase().startsWith(pre) && n.length > pre.length + 2) return n.slice(pre.length);
    return n;
  }
  function badgeVenc(v, conTexto = true) {
    const e = estadoVenc(v);
    if (!v) return '<span class="badge">sin fecha</span>';
    if (e === 'vencido') return `<span class="badge b-alerta">${conTexto ? 'vencido · ' : ''}${fmtVencCorto(v)}</span>`;
    if (e === 'pronto') return `<span class="badge b-aviso">${conTexto ? 'vence ' : ''}${fmtVencCorto(v)}</span>`;
    return `<span class="badge">${fmtVencCorto(v)}</span>`;
  }

  function registrar(mov) {
    const m = { id: uid(), t: new Date().toISOString(), ...mov };
    db.movs.unshift(m);
    enviar({ op: 'mov', m });
    return m;
  }

  /* ------------------------------------------------ planilla de Google */
  const leerJSON = (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
  let conexion = leerJSON(CLAVE_CONEXION);
  let cola = leerJSON(CLAVE_COLA) || [];
  let version = 0, sincronizando = false, estadoSync = conexion ? 'ok' : '', reintento;

  function guardarCola() { try { localStorage.setItem(CLAVE_COLA, JSON.stringify(cola)); } catch (e) { /* lleno */ } }
  function enviar(op) {
    if (!conexion) return;
    cola.push(op); version++; guardarCola();
    sincronizar();
  }
  // Manda los datos del producto (no el stock: el stock cambia solo con movimientos).
  function tocar(p) {
    enviar({ op: 'producto', p: { id: p.id, nombre: p.nombre, cat: p.cat, codigos: p.codigos || [], obs: p.obs || [], estimado: !!p.estimado, tandas: p.tandas } });
  }
  async function llamar(cx, cuerpo) {
    const r = await fetch(cx.url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ clave: cx.clave, ...cuerpo }) });
    let j; try { j = await r.json(); } catch (e) { throw new Error('La dirección no responde como la planilla. Revisá que esté bien copiada.'); }
    if (!j.ok) throw new Error(j.error || 'Error de la planilla');
    return j;
  }
  async function sincronizar() {
    if (!conexion || sincronizando) return;
    sincronizando = true; clearTimeout(reintento);
    pintarSync(cola.length ? 'guardando' : estadoSync);
    try {
      for (;;) {
        const lote = cola.slice(0, 40); const v0 = version;
        const r = await llamar(conexion, { ops: lote, estado: cola.length <= 40 });
        cola.splice(0, lote.length); guardarCola();
        if (cola.length) continue;
        if (r.productos && version === v0) aplicarEstado(r);
        break;
      }
      pintarSync('ok');
    } catch (e) {
      pintarSync(e.message === 'Clave incorrecta' ? 'clave' : 'error');
      reintento = setTimeout(sincronizar, 30000);
    } finally { sincronizando = false; }
  }
  function aplicarEstado(r) {
    db.productos = r.productos; db.movs = r.movs;
    db.meta.planilla = r.planilla; db.meta.sincro = new Date().toISOString();
    guardar();
    const ocupado = hojaAbierta || esc_ || (document.activeElement && /INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName));
    if (!ocupado) render();
  }
  function pintarSync(e) {
    estadoSync = e;
    const el = $('#sync'); if (!el) return;
    el.hidden = !conexion;
    const txt = { ok: 'Al día', guardando: 'Guardando…', error: `Sin conexión${cola.length ? ` · ${cola.length} sin enviar` : ''}`, clave: 'Clave incorrecta' }[e] || '';
    el.textContent = txt; el.className = `sync sync-${e}`;
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden) sincronizar(); });
  window.addEventListener('online', sincronizar);
  setInterval(() => { if (!document.hidden) sincronizar(); }, 60000);

  const linkConexion = () => `${location.origin}${location.pathname}#/conectar/${btoa(JSON.stringify({ u: conexion.url, k: conexion.clave })).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_')}`;

  function hojaConectar(pre) {
    abrirHoja(`
      <div class="fila entre"><h3>Conectar con la planilla</h3><button class="cerrar" data-cerrar>${ic('cerrar')}</button></div>
      <p class="chico tenue">En la planilla de Google, menú <b>Stock app → Ver datos de conexión</b>. Copiá la dirección y la clave.</p>
      <label class="campo"><span class="etq">Dirección</span><input class="entrada" id="cx-url" placeholder="https://script.google.com/macros/s/…/exec" value="${esc(pre ? pre.u : '')}" autocomplete="off" autocapitalize="off" spellcheck="false"></label>
      <label class="campo"><span class="etq">Clave</span><input class="entrada mono" id="cx-clave" value="${esc(pre ? pre.k : '')}" autocomplete="off" autocapitalize="off" spellcheck="false"></label>
      <p class="chico" id="cx-msj" role="status"></p>
      <button class="btn btn-oscuro btn-grande btn-bloque" data-ok>Conectar</button>`, (hoja, cerrar) => {
      const ok = $('[data-ok]', hoja); const msj = $('#cx-msj', hoja);
      const probar = async () => {
        const cx = { url: $('#cx-url', hoja).value.trim(), clave: $('#cx-clave', hoja).value.trim() };
        if (!/^https:\/\/script\.google(usercontent)?\.com\//.test(cx.url) && !/^http:\/\/localhost[:/]/.test(cx.url)) { msj.textContent = 'La dirección tiene que empezar con https://script.google.com/'; return; }
        if (!cx.clave) { msj.textContent = 'Falta la clave.'; return; }
        ok.disabled = true; ok.textContent = 'Probando…'; msj.textContent = '';
        try {
          const r = await llamar(cx, { estado: true });
          const locales = db.productos.length && !conexion ? { productos: db.productos, movs: db.movs } : null;
          conexion = cx; localStorage.setItem(CLAVE_CONEXION, JSON.stringify(cx));
          cola = []; guardarCola();
          cerrar();
          if (!r.productos.length && locales) {
            // Planilla nueva y datos en este dispositivo: se suben.
            enviar({ op: 'importar', productos: locales.productos, movs: locales.movs });
            aviso(`Conectado. Subiendo ${locales.productos.length} productos a la planilla…`);
          } else {
            aplicarEstado(r);
            aviso(r.productos.length ? `Conectado: ${r.productos.length} productos en la planilla.` : 'Conectado. La planilla está vacía: importá tu Excel.');
          }
          pintarSync('ok'); ir('#/');
        } catch (e) {
          msj.textContent = e.message === 'Clave incorrecta' ? 'La clave no coincide con la de la planilla.' : e.message === 'Failed to fetch' ? 'No se pudo conectar. Revisá la dirección y que haya internet.' : e.message;
          ok.disabled = false; ok.textContent = 'Conectar';
        }
      };
      ok.onclick = probar;
      if (pre && pre.u && pre.k) probar();
    });
  }

  function hojaDesconectar() {
    const pend = cola.length;
    confirmar('Desconectar este dispositivo', `${pend ? `<b>Hay ${pend} cambio(s) que todavía no llegaron a la planilla y se van a perder.</b> ` : ''}Se borra la copia de este dispositivo. La planilla y los otros dispositivos no cambian.`, 'Desconectar', () => {
      conexion = null; cola = []; localStorage.removeItem(CLAVE_CONEXION); guardarCola();
      db = vacio(); guardar(); pintarSync(''); ir('#/');
    });
  }

  function hojaCompartir() {
    const link = linkConexion();
    abrirHoja(`
      <div class="fila entre"><h3>Abrir en otro dispositivo</h3><button class="cerrar" data-cerrar>${ic('cerrar')}</button></div>
      <p class="chico">Escaneá este código con la cámara del celular (o abrí el link en la compu) y queda conectado a la misma planilla.</p>
      <div id="qr" style="align-self:center;background:#fff;padding:12px;border:1px solid var(--linea)"></div>
      <div class="fila"><input class="entrada mono chico" value="${esc(link)}" readonly id="cx-link"><button class="btn" data-copiar>Copiar</button></div>
      <p class="chico tenue">Este link da acceso al stock: no lo compartas con nadie más.</p>`, (hoja) => {
      cargarScript(QR).then(() => { new QRCode($('#qr', hoja), { text: link, width: 220, height: 220, correctLevel: QRCode.CorrectLevel.M }); })
        .catch(() => { $('#qr', hoja).textContent = 'No se pudo generar el código. Usá el link.'; });
      $('[data-copiar]', hoja).onclick = async () => {
        try { await navigator.clipboard.writeText(link); aviso('Link copiado.'); } catch (e) { $('#cx-link', hoja).select(); }
      };
    });
  }

  // Descuenta cant unidades empezando por lo que vence antes (o por la tanda elegida).
  function sacar(p, cant, motivo, detalle, tandaV) {
    let resta = cant; const partes = [];
    const orden = tandasConStock(p);
    if (tandaV !== undefined) orden.sort((a, b) => (a.v === tandaV ? -1 : b.v === tandaV ? 1 : ordenVenc(a, b)));
    for (const t of orden) {
      if (!resta) break;
      const n = Math.min(t.c, resta); t.c -= n; resta -= n; partes.push({ v: t.v, c: n });
    }
    p.tandas = p.tandas.filter((t) => t.c > 0);
    const movs = partes.map((x) => registrar({ pid: p.id, nombre: p.nombre, tipo: 'sale', cant: x.c, v: x.v, motivo, detalle }));
    guardar();
    return movs;
  }
  function entrar(p, cant, v, detalle) {
    const t = p.tandas.find((x) => (x.v || null) === (v || null));
    if (t) t.c += cant; else p.tandas.push({ v: v || null, c: cant });
    const m = registrar({ pid: p.id, nombre: p.nombre, tipo: 'entra', cant, v: v || null, detalle });
    guardar();
    return [m];
  }
  function deshacer(movs) {
    for (const m of movs) {
      const p = producto(m.pid);
      if (p) {
        const signo = m.tipo === 'sale' ? 1 : -1;
        const cant = m.tipo === 'ajuste' ? -m.cant : signo * m.cant;
        const t = p.tandas.find((x) => (x.v || null) === (m.v || null));
        if (t) t.c = Math.max(0, t.c + cant); else if (cant > 0) p.tandas.push({ v: m.v || null, c: cant });
        p.tandas = p.tandas.filter((x) => x.c > 0);
      }
      db.movs = db.movs.filter((x) => x.id !== m.id);
      enviar({ op: 'deshacer', id: m.id });
    }
    guardar();
  }

  /* ------------------------------------------------------ códigos de barras */
  function normCodigo(c) {
    c = String(c).trim().replace(/\s+/g, '');
    if (/^\d{12}$/.test(c)) c = '0' + c; // UPC-A → EAN-13
    return c;
  }
  function codigoValido(c) {
    if (!/^\d+$/.test(c) || ![8, 13, 14].includes(c.length)) return c.length >= 4; // otros formatos: aceptar
    const d = c.split('').map(Number); const ctrl = d.pop();
    const s = d.reverse().reduce((a, n, i) => a + n * (i % 2 === 0 ? 3 : 1), 0);
    return (10 - (s % 10)) % 10 === ctrl;
  }
  const porCodigo = (c) => db.productos.find((p) => (p.codigos || []).includes(c));

  /* ------------------------------------------------------------ importar */
  function fechaDeCelda(v) {
    if (v == null || v === '') return null;
    if (typeof v === 'number') {
      if (v < 20000 || v > 80000) return null;
      const d = XLSX.SSF.parse_date_code(v); return `${d.y}-${String(d.m).padStart(2, '0')}`;
    }
    if (v instanceof Date) return `${v.getFullYear()}-${String(v.getMonth() + 1).padStart(2, '0')}`;
    const s = String(v).trim();
    let m = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/); // dd/mm/aaaa
    if (m) { const y = m[3].length === 2 ? 2000 + +m[3] : +m[3]; return `${y}-${String(+m[2]).padStart(2, '0')}`; }
    m = s.match(/^(\d{1,2})[\/\-.](\d{4})$/); // mm/aaaa
    if (m) return `${m[2]}-${String(+m[1]).padStart(2, '0')}`;
    m = s.match(/^(\d{4})-(\d{2})/);
    if (m) return `${m[1]}-${m[2]}`;
    return null;
  }

  function leerExcel(buffer) {
    const libro = XLSX.read(buffer, { type: 'array' });
    const hoja = libro.Sheets['Stock'] || libro.Sheets[libro.SheetNames[0]];
    const filas = XLSX.utils.sheet_to_json(hoja, { header: 1, raw: true, defval: '' });
    const iCab = filas.findIndex((f) => f.some((c) => norm(c).trim() === 'producto'));
    if (iCab < 0) throw new Error('No encontré la columna PRODUCTO en la primera hoja.');
    const cab = filas[iCab].map((c) => norm(c).trim());
    const iProd = cab.indexOf('producto');
    const iCod = cab.findIndex((c) => c.startsWith('codigo'));
    const iCat = cab.indexOf('categoria');
    // Formato exportado por esta app: VENCIMIENTO 1 / CANT 1 / VENCIMIENTO 2 / CANT 2 ...
    const pares = [];
    cab.forEach((c, i) => { const m = c.match(/^vencimiento (\d+)$/); if (m) pares.push([i, cab.indexOf(`cant ${m[1]}`)]); });
    // Formato de su Excel: FECHA DE VENCIMIENTO + columnas sin título, y CANT
    const iCant = cab.findIndex((c) => c === 'cant' || c === 'cantidad');
    const iFecha = cab.findIndex((c) => c.startsWith('fecha') || c.startsWith('venc'));
    const colsFecha = [];
    if (!pares.length && iFecha >= 0) for (let i = iFecha; i < cab.length && i !== iCant; i++) if (i === iFecha || cab[i] === '') colsFecha.push(i);

    const porNombre = new Map(); const problemas = [];
    for (const f of filas.slice(iCab + 1)) {
      const nombre = String(f[iProd] ?? '').replace(/\s+/g, ' ').trim();
      if (!nombre) continue;
      let tandas = []; const obs = [];
      if (pares.length) {
        for (const [iv, ic] of pares) { const v = fechaDeCelda(f[iv]); const c = Math.max(0, parseInt(f[ic], 10) || 0); if (c) tandas.push({ v, c }); }
      } else {
        const fechas = colsFecha.map((i) => f[i]).filter((x) => x !== '' && x != null);
        const vs = fechas.map(fechaDeCelda);
        const cantTxt = iCant >= 0 ? f[iCant] : '';
        const cant = Math.max(0, parseInt(cantTxt, 10) || 0);
        const validas = vs.filter(Boolean).sort();
        if (fechas.length && validas.length < fechas.length) obs.push('Tiene una fecha que no se pudo leer.');
        if (cantTxt === '' || cantTxt == null) obs.push('No tenía cantidad en el Excel.');
        if (!fechas.length) obs.push('No tenía fecha de vencimiento en el Excel.');
        if (validas.some((v) => v < '2020-01')) obs.push('Tiene una fecha muy vieja: puede ser un error de tipeo.');
        if (!validas.length) { if (cant) tandas.push({ v: null, c: cant }); }
        else if (validas.length === 1) { if (cant) tandas.push({ v: validas[0], c: cant }); }
        else {
          // Varias fechas y una sola cantidad: 1 unidad a cada fecha posterior y el resto a la más próxima.
          if (cant < validas.length) obs.push(`Tenía ${validas.length} fechas y ${cant} unidad(es).`);
          const resto = validas.slice(1).slice(0, Math.max(0, cant - 1));
          const primera = cant - resto.length;
          if (primera > 0) tandas.push({ v: validas[0], c: primera });
          resto.forEach((v) => tandas.push({ v, c: 1 }));
        }
        if (validas.length > 1 && cant >= validas.length) tandas.est = true;
      }
      const clave = norm(nombre);
      const cod = iCod >= 0 ? String(f[iCod] ?? '').split(/[,;\s]+/).map(normCodigo).filter(Boolean) : [];
      const prev = porNombre.get(clave);
      if (prev) {
        for (const t of tandas) { const x = prev.tandas.find((y) => y.v === t.v); if (x) x.c += t.c; else prev.tandas.push(t); }
        prev.codigos = [...new Set([...prev.codigos, ...cod])];
        prev.obs.push('Estaba repetido en el Excel: se sumaron las dos filas.');
        continue;
      }
      const p = {
        id: uid(), nombre, cat: (iCat >= 0 && f[iCat]) ? String(f[iCat]) : categoriaDe(nombre),
        codigos: cod, tandas: tandas.map((t) => ({ v: t.v, c: t.c })), obs, estimado: !!tandas.est,
      };
      porNombre.set(clave, p);
    }
    const productos = [...porNombre.values()];
    productos.forEach((p) => { if (p.obs.length) problemas.push(p); });
    return { productos, problemas };
  }

  async function importarArchivo(file) {
    if (!window.XLSX) { aviso('Falta cargar el lector de Excel. Revisá la conexión y probá de nuevo.'); return; }
    let r;
    try { r = leerExcel(await file.arrayBuffer()); }
    catch (e) { aviso(e.message || 'No se pudo leer el archivo.'); return; }
    const unidades = r.productos.reduce((a, p) => a + total(p), 0);
    const hayDatos = db.productos.length > 0;
    abrirHoja(`
      <div class="fila entre"><h3>Importar Excel</h3><button class="cerrar" data-cerrar>${ic('cerrar')}</button></div>
      <p>Encontré <b>${r.productos.length} productos</b> con <b>${unidades} unidades</b> en <span class="mono chico">${esc(file.name)}</span>.</p>
      ${r.problemas.length ? `<div class="nota">${r.problemas.length} producto(s) tienen algo para revisar (sin fecha, sin cantidad, etc.). Te los marco en la lista <b>Para revisar</b>.</div>` : ''}
      ${hayDatos ? `<div class="nota">Esto <b>reemplaza</b> todo lo que hay cargado ahora${conexion ? ' en la planilla' : ''} (${db.productos.length} productos y ${db.movs.length} movimientos). Los códigos de barras que ya asociaste se mantienen si el nombre del producto es el mismo.</div>` : ''}
      <button class="btn btn-oscuro btn-grande btn-bloque" data-ok>Importar</button>`, (hoja, cerrar) => {
      $('[data-ok]', hoja).onclick = () => {
        if (hayDatos) {
          const viejos = new Map(db.productos.map((p) => [norm(p.nombre), p]));
          for (const p of r.productos) { const v = viejos.get(norm(p.nombre)); if (v) p.codigos = [...new Set([...p.codigos, ...(v.codigos || [])])]; }
        }
        db = { productos: r.productos, movs: [], meta: { ...db.meta, importado: new Date().toISOString(), archivo: file.name } };
        guardar(); cerrar();
        enviar({ op: 'importar', productos: r.productos, movs: [] }); ir('#/'); aviso(`Listo: ${r.productos.length} productos importados.`);
      };
    });
  }

  /* ------------------------------------------------------------ exportar */
  const fechaArchivo = () => new Date().toISOString().slice(0, 10);
  function exportarExcel() {
    if (!window.XLSX) { aviso('Falta cargar el lector de Excel. Revisá la conexión.'); return; }
    const maxT = Math.max(1, ...db.productos.map((p) => tandasConStock(p).length));
    const cab = ['PRODUCTO', 'CATEGORIA', 'CODIGO DE BARRAS'];
    for (let i = 1; i <= maxT; i++) cab.push(`VENCIMIENTO ${i}`, `CANT ${i}`);
    cab.push('TOTAL');
    const filas = [...db.productos].sort((a, b) => a.nombre.localeCompare(b.nombre)).map((p) => {
      const ts = tandasConStock(p); const f = [p.nombre, p.cat, (p.codigos || []).join(', ')];
      for (let i = 0; i < maxT; i++) f.push(ts[i] ? fmtVencCorto(ts[i].v) : '', ts[i] ? ts[i].c : '');
      f.push(total(p)); return f;
    });
    const movs = db.movs.map((m) => [new Date(m.t).toLocaleString('es-AR'), m.tipo === 'sale' ? 'Salió' : m.tipo === 'entra' ? 'Entró' : 'Corrección', m.nombre, m.tipo === 'sale' ? -m.cant : m.cant, m.v ? fmtVencCorto(m.v) : '', m.motivo || '', m.detalle || '']);
    const libro = XLSX.utils.book_new();
    const h1 = XLSX.utils.aoa_to_sheet([cab, ...filas]); h1['!cols'] = [{ wch: 55 }, { wch: 14 }, { wch: 16 }];
    const h2 = XLSX.utils.aoa_to_sheet([['FECHA', 'TIPO', 'PRODUCTO', 'CANT', 'VENCIMIENTO', 'MOTIVO', 'DETALLE'], ...movs]); h2['!cols'] = [{ wch: 18 }, { wch: 11 }, { wch: 55 }, { wch: 6 }, { wch: 12 }, { wch: 10 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(libro, h1, 'Stock');
    XLSX.utils.book_append_sheet(libro, h2, 'Movimientos');
    const datos = XLSX.write(libro, { bookType: 'xlsx', type: 'array' });
    entregar(new Blob([datos], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `stock-${fechaArchivo()}.xlsx`);
  }
  function guardarCopia() {
    const blob = new Blob([JSON.stringify({ app: 'stock-regional', version: 1, ...db })], { type: 'application/json' });
    entregar(blob, `stock-copia-${fechaArchivo()}.json`).then((ok) => { if (ok) { db.meta.respaldo = new Date().toISOString(); guardar(); render(); } });
  }
  async function recuperarCopia(file) {
    try {
      const d = JSON.parse(await file.text());
      if (!Array.isArray(d.productos) || !Array.isArray(d.movs)) throw new Error();
      abrirHoja(`
        <div class="fila entre"><h3>Recuperar copia</h3><button class="cerrar" data-cerrar>${ic('cerrar')}</button></div>
        <p>La copia tiene <b>${d.productos.length} productos</b> y <b>${d.movs.length} movimientos</b>.</p>
        <div class="nota">Esto reemplaza todo lo que hay cargado ahora${conexion ? ' en la planilla' : ' en este dispositivo'}.</div>
        <button class="btn btn-oscuro btn-grande btn-bloque" data-ok>Recuperar</button>`, (hoja, cerrar) => {
        $('[data-ok]', hoja).onclick = () => {
          db = { productos: d.productos, movs: d.movs, meta: d.meta || vacio().meta }; guardar();
          enviar({ op: 'importar', productos: d.productos, movs: d.movs });
          cerrar(); ir('#/'); aviso('Copia recuperada.');
        };
      });
    } catch (e) { aviso('Ese archivo no es una copia de esta app.'); }
  }
  // En el celular abre "Compartir" (WhatsApp, Drive, mail…); en la compu descarga el archivo.
  async function entregar(blob, nombre) {
    const file = new File([blob], nombre, { type: blob.type });
    const movil = matchMedia('(pointer: coarse)').matches;
    if (movil && navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], title: nombre }); return true; }
      catch (e) { if (e.name === 'AbortError') return false; }
    }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nombre;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    return true;
  }

  /* ------------------------------------------------------------ interfaz */
  const vista = $('#vista');
  let ruta = '';
  const filtros = { q: '', estado: 'todos', cat: '', orden: 'nombre', limite: 150 };
  const mqPC = matchMedia('(min-width: 960px)');
  const esPC = () => mqPC.matches;
  mqPC.addEventListener('change', () => render());

  function ir(h) { if (location.hash === h) render(); else location.hash = h; }
  window.addEventListener('hashchange', () => {
    const antes = ruta; const ahora = location.hash.split('/')[1] || '';
    render();
    // En la compu, abrir o cambiar la ficha no mueve la lista.
    if (!(esPC() && ['p', 'stock'].includes(antes) && ['p', 'stock'].includes(ahora))) window.scrollTo(0, 0);
  });

  function render() {
    const h = location.hash.replace(/^#/, '') || '/';
    const partes = h.split('/').filter(Boolean);
    ruta = partes[0] || 'inicio';
    const activa = ruta === 'p' ? 'stock' : ruta;
    $$('.barra [data-ruta]').forEach((a) => a.classList.toggle('activo', a.dataset.ruta === activa));
    const conVolver = ruta === 'p' && !esPC();
    $('#volver').hidden = !conVolver; $('#logo').style.display = conVolver ? 'none' : '';
    if (ruta !== 'p') cerrarPanel();
    if (ruta === 'stock') return vStock(partes[1]);
    if (ruta === 'p') return vProducto(partes[1]);
    if (ruta === 'salida' || ruta === 'entrada') return vLote(ruta);
    if (ruta === 'historial') return vMovimientos();
    if (ruta === 'ajustes') return vMas();
    if (ruta === 'conectar') { let pre = null; try { pre = JSON.parse(atob((partes[1] || '').replace(/-/g, '+').replace(/_/g, '/'))); } catch (e) { /* link roto */ } history.replaceState(null, '', '#/'); vInicio(); hojaConectar(pre); return; }
    return vInicio();
  }
  function titulo(t) { $('#titulo').textContent = t; document.title = t === 'Inicio' || t === 'Stock' ? 'Stock' : `${t} · Stock`; }

  // Indicadores
  function resumen() {
    let vencidos = 0, vencU = 0, pronto = 0, prontoU = 0, sinStock = 0, unidades = 0, revisar = 0;
    for (const p of db.productos) {
      const tot = total(p); unidades += tot; if (!tot) sinStock++;
      if (p.obs && p.obs.length) revisar++;
      for (const t of p.tandas) {
        if (!t.c) continue;
        const e = estadoVenc(t.v);
        if (e === 'vencido') { vencidos++; vencU += t.c; } else if (e === 'pronto') { pronto++; prontoU += t.c; }
      }
    }
    return { vencidos, vencU, pronto, prontoU, sinStock, unidades, revisar };
  }
  function cumple(p, estado) {
    if (estado === 'con') return total(p) > 0;
    if (estado === 'sin') return total(p) === 0;
    if (estado === 'vencidos') return tandasConStock(p).some((t) => estadoVenc(t.v) === 'vencido');
    if (estado === 'pronto') return tandasConStock(p).some((t) => estadoVenc(t.v) === 'pronto');
    if (estado === 'revisar') return !!(p.obs && p.obs.length);
    return true;
  }

  function vInicio() {
    titulo('Inicio');
    if (!db.productos.length) {
      vista.innerHTML = `
        <section class="caja bienvenida">
          ${conexion ? `<span class="etq">Planilla conectada</span>
          <h2>La planilla está vacía.</h2>
          <p>Importá el Excel que ya tenés: los productos se cargan en la planilla y los vas a ver desde la compu y desde el celular.</p>
          <button class="btn btn-oscuro btn-grande btn-bloque" data-accion="importar">${ic('subir')}Importar mi Excel</button>
          <button class="btn btn-bloque" data-accion="sincronizar">Ya lo importé en otro dispositivo: actualizar</button>` : `<span class="etq">Primer uso</span>
          <h2>Tu stock de demos y regalos, en el celular y en la compu.</h2>
          <p>Conectá la planilla de Google donde se guarda todo. Si ya la usás en otro dispositivo, abrí el link o escaneá el código QR desde ahí (<b>Ajustes → Abrir en otro dispositivo</b>).</p>
          <button class="btn btn-oscuro btn-grande btn-bloque" data-accion="conectar">Conectar con la planilla</button>
          <button class="btn btn-bloque" data-accion="importar">${ic('subir')}Usar sin planilla: importar Excel</button>
          <p class="chico tenue">Sin planilla, los datos quedan solo en este dispositivo.</p>`}
        </section>`;
      return;
    }
    const r = resumen();
    const diasResp = db.meta.respaldo ? Math.floor((Date.now() - new Date(db.meta.respaldo)) / 864e5) : null;
    const pedirCopia = !conexion && db.movs.length > 0 && (diasResp === null || diasResp >= 7);
    const atender = [];
    for (const p of db.productos) for (const t of tandasConStock(p)) { const e = estadoVenc(t.v); if (e === 'vencido' || e === 'pronto') atender.push({ p, t, e }); }
    atender.sort((a, b) => a.t.v.localeCompare(b.t.v));
    const ultimos = db.movs.slice(0, 6);
    const pend = (k) => { const n = lotes[k].items.length; return n ? `<span class="badge b-ok">${n} en la lista</span>` : ''; };
    vista.innerHTML = `
      <div class="buscador">${ic('buscar')}<input class="entrada" type="search" id="buscar-inicio" placeholder="Buscar un producto por nombre o código" autocomplete="off"></div>
      <section class="tareas">
        <a class="tarea" href="#/salida"><span class="tarea-ic menos">${ic('salida')}</span><span class="tarea-txt"><b>Sacar productos</b><span>Para demos, regalos o premios</span>${pend('salida')}</span></a>
        <a class="tarea" href="#/entrada"><span class="tarea-ic mas">${ic('entrada')}</span><span class="tarea-txt"><b>Cargar lo que llegó</b><span>Sumá stock con su vencimiento</span>${pend('entrada')}</span></a>
      </section>
      ${pedirCopia ? `<div class="nota fila entre" style="gap:12px"><span>${diasResp === null ? 'Todavía no guardaste una copia.' : `Tu última copia es de hace ${diasResp} días.`} Si se pierde o se cambia el celular, con la copia recuperás todo.</span><button class="btn btn-chico" data-accion="copia">Guardar</button></div>` : ''}
      <section class="tablero">
        <a class="cuadro" href="#/stock/con"><span class="etq">En stock</span><b>${r.unidades}</b><span class="chico">unidades de ${db.productos.length - r.sinStock} productos</span></a>
        <a class="cuadro ${r.vencidos ? 'alerta' : ''}" href="#/stock/vencidos"><span class="etq">Vencidos</span><b>${r.vencU}</b><span class="chico">unidades para retirar</span></a>
        <a class="cuadro ${r.pronto ? 'aviso' : ''}" href="#/stock/pronto"><span class="etq">Vencen pronto</span><b>${r.prontoU}</b><span class="chico">unidades en ${MESES_ALERTA} meses</span></a>
        <a class="cuadro" href="#/stock/sin"><span class="etq">Agotados</span><b>${r.sinStock}</b><span class="chico">productos sin stock</span></a>
      </section>
      ${r.revisar ? `<a class="caja fila entre" style="padding:12px 14px;text-decoration:none" href="#/stock/revisar"><span class="fila">${ic('alerta')}<span><b>${r.revisar} producto${r.revisar === 1 ? '' : 's'} para revisar</b><span class="chico tenue" style="display:block">Filas del Excel sin fecha, sin cantidad o con datos raros</span></span></span><span class="tenue">›</span></a>` : ''}
      <div class="dos-col">
        <section class="caja">
          <div class="caja-cab"><span class="etq">Usar antes de que venza</span>${atender.length > 6 ? `<a class="btn-texto" href="#/stock/${r.vencidos ? 'vencidos' : 'pronto'}">Ver todos</a>` : ''}</div>
          ${atender.length ? `<ul class="lista">${atender.slice(0, 6).map(({ p, t, e }) => `<li><a class="item" href="#/p/${p.id}"><span class="txt"><span class="nom">${esc(nombreCorto(p))}</span><span class="sub">${e === 'vencido' ? `<span class="badge b-alerta">venció ${fmtVencCorto(t.v)}</span>` : `<span class="badge b-aviso">vence ${fmtVencCorto(t.v)}</span>`}</span></span><span class="cant">${t.c}<small>u.</small></span></a></li>`).join('')}</ul>`
            : `<p class="vacio chico">Nada vence en los próximos ${MESES_ALERTA} meses.</p>`}
        </section>
        <section class="caja">
          <div class="caja-cab"><span class="etq">Últimos movimientos</span>${db.movs.length ? '<a class="btn-texto" href="#/historial">Ver todos</a>' : ''}</div>
          ${ultimos.length ? `<ul class="lista">${ultimos.map((m) => `<li>${movHTML(m)}</li>`).join('')}</ul>` : '<p class="vacio chico">Todavía no registraste movimientos.<br>Empezá con <b>Sacar productos</b> o <b>Cargar lo que llegó</b>.</p>'}
        </section>
      </div>`;
    const b = $('#buscar-inicio');
    const buscarYa = () => { filtros.q = b.value; filtros.estado = 'todos'; ir('#/stock'); };
    b.addEventListener('keydown', (e) => { if (e.key === 'Enter') buscarYa(); });
    b.addEventListener('input', () => { if (b.value.length >= 2) buscarYa(); });
  }

  function buscar(lista, q) {
    const pal = norm(q).split(/\s+/).filter(Boolean);
    if (!pal.length) return lista;
    const cod = normCodigo(q);
    return lista.filter((p) => {
      if ((p.codigos || []).includes(cod)) return true;
      const txt = norm(p.nombre + ' ' + p.cat);
      return pal.every((w) => txt.includes(w));
    });
  }

  function vStock(estado, sel) {
    titulo('Stock');
    if (estado) filtros.estado = estado;
    const cats = [...new Set(db.productos.map((p) => p.cat))].sort();
    const r = resumen();
    const estados = [['todos', 'Todos', db.productos.length], ['con', 'Con stock', db.productos.length - r.sinStock], ['vencidos', 'Vencidos', r.vencidos], ['pronto', 'Vencen pronto', r.pronto], ['sin', 'Agotados', r.sinStock], ['revisar', 'Para revisar', r.revisar]]
      .filter(([k, , n]) => n || k === 'todos' || k === filtros.estado);
    vista.innerHTML = `
      <div class="filtros">
        <div class="buscador">${ic('buscar')}<input class="entrada" type="search" id="q" placeholder="Buscar por nombre o código" value="${esc(filtros.q)}" autocomplete="off"></div>
        <select class="entrada" id="cat"><option value="">Todas las categorías</option>${cats.map((c) => `<option ${c === filtros.cat ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select>
        <select class="entrada" id="orden"><option value="nombre">Ordenar: A → Z</option><option value="venc" ${filtros.orden === 'venc' ? 'selected' : ''}>Ordenar: vence antes</option><option value="cant" ${filtros.orden === 'cant' ? 'selected' : ''}>Ordenar: más unidades</option></select>
      </div>
      <div class="chips" id="estados">${estados.map(([k, t, n]) => `<button class="chip ${filtros.estado === k ? 'si' : ''}" data-estado="${k}">${t}<span class="n">${n}</span></button>`).join('')}</div>
      <section class="caja" id="resultado"></section>`;
    const pintar = () => {
      let lista = db.productos.filter((p) => cumple(p, filtros.estado) && (!filtros.cat || p.cat === filtros.cat));
      lista = buscar(lista, filtros.q);
      if (filtros.orden === 'venc') lista.sort((a, b) => (proxVenc(a) || '9999').localeCompare(proxVenc(b) || '9999'));
      else if (filtros.orden === 'cant') lista.sort((a, b) => total(b) - total(a));
      else lista.sort((a, b) => nombreCorto(a).localeCompare(nombreCorto(b)));
      const cont = $('#resultado');
      if (!lista.length) {
        cont.innerHTML = `<p class="vacio">No hay productos${filtros.q ? ` que coincidan con “${esc(filtros.q)}”` : ''}.</p>${filtros.q ? `<div style="padding:0 14px 14px;text-align:center"><button class="btn" data-accion="nuevo">${ic('mas')}Agregar “${esc(filtros.q)}” como producto nuevo</button></div>` : ''}`;
        return;
      }
      const vis = lista.slice(0, filtros.limite);
      const cab = `<div class="caja-cab"><span class="etq">${lista.length} producto${lista.length === 1 ? '' : 's'}</span><span class="etq">${lista.reduce((a, p) => a + total(p), 0)} unidades</span></div>`;
      const mas = lista.length > vis.length ? `<div style="padding:12px 14px;border-top:1px solid var(--linea)"><button class="btn btn-bloque" id="mas-items">Ver ${Math.min(150, lista.length - vis.length)} más</button></div>` : '';
      cont.innerHTML = cab + (esPC() ? tablaHTML(vis, sel) : `<ul class="lista">${vis.map((p) => `<li>${itemHTML(p)}</li>`).join('')}</ul>`) + mas;
      const m = $('#mas-items'); if (m) m.onclick = () => { filtros.limite += 150; pintar(); };
    };
    $('#q').addEventListener('input', (e) => { filtros.q = e.target.value; filtros.limite = 150; pintar(); });
    $('#cat').onchange = (e) => { filtros.cat = e.target.value; pintar(); };
    $('#orden').onchange = (e) => { filtros.orden = e.target.value; pintar(); };
    $('#estados').onclick = (e) => { const b = e.target.closest('[data-estado]'); if (!b) return; filtros.estado = b.dataset.estado; filtros.limite = 150; ir(filtros.estado === 'todos' ? '#/stock' : `#/stock/${filtros.estado}`); };
    $('#resultado').addEventListener('click', (e) => { const tr = e.target.closest('tr[data-pid]'); if (tr) ir(`#/p/${tr.dataset.pid}`); });
    pintar();
    if (filtros.q && !sel) { const q = $('#q'); q.focus(); q.setSelectionRange(q.value.length, q.value.length); }
  }

  function tablaHTML(lista, sel) {
    return `<table class="tabla"><thead><tr><th>Producto</th><th>Categoría</th><th>Vence</th><th class="opc">Otras fechas</th><th class="opc">Código</th><th class="num">Cant.</th></tr></thead><tbody>
      ${lista.map((p) => {
        const tot = total(p); const ts = tandasConStock(p);
        return `<tr data-pid="${p.id}" class="${p.id === sel ? 'sel' : ''}">
          <td><span class="nom">${esc(nombreCorto(p))}</span>${p.obs && p.obs.length ? ' <span class="badge b-aviso">revisar</span>' : ''}</td>
          <td><span class="etq" style="font-size:10.5px">${esc(p.cat)}</span></td>
          <td>${tot ? badgeVenc(ts[0].v, false) : '<span class="tenue">—</span>'}</td>
          <td class="opc chico tinta-2">${ts.slice(1).map((t) => `${fmtVencCorto(t.v)} (${t.c})`).join(', ') || '<span class="tenue">—</span>'}</td>
          <td class="opc mono chico tinta-2">${(p.codigos || [])[0] || '<span class="tenue">—</span>'}</td>
          <td class="num cant ${tot ? '' : 'cero'}">${tot}</td></tr>`;
      }).join('')}</tbody></table>`;
  }

  function itemHTML(p) {
    const tot = total(p); const v = proxVenc(p);
    const marcas = [];
    if (tot) marcas.push(badgeVenc(v, false));
    if (tandasConStock(p).length > 1) marcas.push(`<span>+${tandasConStock(p).length - 1} fecha${tandasConStock(p).length > 2 ? 's' : ''}</span>`);
    if (p.obs && p.obs.length) marcas.push(`<span class="badge b-aviso">revisar</span>`);
    return `<a class="item" href="#/p/${p.id}"><span class="txt"><span class="nom">${esc(nombreCorto(p))}</span><span class="sub"><span class="etq" style="font-size:10px">${esc(p.cat)}</span>${marcas.join('')}</span></span><span class="cant ${tot ? '' : 'cero'}">${tot}<small>u.</small></span></a>`;
  }

  function vProducto(id) {
    const p = producto(id);
    if (esPC()) { vStock(undefined, id); if (p) abrirPanel(p); else cerrarPanel(); return; }
    if (!p) { vista.innerHTML = '<p class="vacio">Ese producto no existe más.</p>'; titulo('Producto'); return; }
    titulo(p.cat);
    vista.innerHTML = fichaHTML(p);
  }

  // En la compu la ficha se abre en un panel a la derecha de la tabla.
  let panel = null;
  function abrirPanel(p) {
    if (!panel) { panel = document.createElement('aside'); panel.className = 'panel'; document.body.appendChild(panel); }
    document.body.classList.add('con-panel');
    panel.innerHTML = `<div class="fila entre"><span class="etq">${esc(p.cat)}</span><button class="cerrar" data-cerrar-panel aria-label="Cerrar">${ic('cerrar')}</button></div>${fichaHTML(p)}`;
    $('[data-cerrar-panel]', panel).onclick = cerrarFicha;
  }
  function cerrarPanel() { if (panel) { panel.remove(); panel = null; } document.body.classList.remove('con-panel'); }
  function cerrarFicha() { ir(filtros.estado === 'todos' ? '#/stock' : `#/stock/${filtros.estado}`); }

  function fichaHTML(p) {
    const tot = total(p); const ts = tandasConStock(p);
    const movs = db.movs.filter((m) => m.pid === p.id);
    return `<div class="ficha" data-pid="${p.id}">
      <section class="ficha-cab">
        <h2>${esc(p.nombre)}</h2>
        <div class="total"><b>${tot}</b><span class="tinta-2">${tot === 1 ? 'unidad' : 'unidades'}</span>${ts[0] ? badgeVenc(ts[0].v) : ''}</div>
      </section>
      <div class="acciones">
        <button class="btn btn-oscuro btn-grande" data-accion="sacar" ${tot ? '' : 'disabled'}>${ic('menos')}Sacar</button>
        <button class="btn btn-grande" data-accion="entro">${ic('mas')}Agregar</button>
      </div>
      ${p.obs && p.obs.length ? `<div class="nota pila" style="gap:6px"><b>Para revisar</b>${p.obs.map((o) => `<span>${esc(o)}</span>`).join('')}<button class="btn btn-chico" data-accion="revisado" style="align-self:flex-start">Ya está revisado</button></div>` : ''}
      <section class="caja">
        <div class="caja-cab"><span class="etq">Vencimientos</span><button class="btn-texto" data-accion="corregir">${ic('lapiz')} Corregir</button></div>
        ${ts.length ? ts.map((t) => `<div class="tanda"><span class="fila"><span class="v">${fmtVenc(t.v)}</span>${estadoVenc(t.v) !== 'ok' && t.v ? badgeVenc(t.v) : ''}</span><span class="mono" style="font-size:18px">${t.c} u.</span></div>`).join('') : '<p class="vacio chico">No quedan unidades.</p>'}
        ${p.estimado && ts.length > 1 ? '<p class="chico tenue" style="padding:0 14px 12px">En el Excel había una sola cantidad para varias fechas: repartí las unidades. Si no es así, tocá <b>Corregir</b>.</p>' : ''}
      </section>
      <section class="caja">
        <div class="caja-cab"><span class="etq">Código de barras</span><button class="btn-texto" data-accion="asociar">${ic('escanear')} ${p.codigos && p.codigos.length ? 'Agregar otro' : 'Asociar'}</button></div>
        ${p.codigos && p.codigos.length ? p.codigos.map((c) => `<div class="tanda"><span class="codigo">${esc(c)}</span><button class="btn btn-chico" data-quitar="${esc(c)}" aria-label="Quitar código">${ic('cerrar')}</button></div>`).join('') : '<p class="caja-cuerpo chico tenue">Todavía no tiene código. Escaneá la caja una vez y queda asociado: la próxima vez lo encontrás escaneando.</p>'}
      </section>
      <section class="caja">
        <div class="caja-cab"><span class="etq">Historial</span></div>
        ${movs.length ? `<ul class="lista">${movs.slice(0, 30).map((m) => `<li>${movHTML(m, true)}</li>`).join('')}</ul>` : '<p class="caja-cuerpo chico tenue">Sin movimientos todavía.</p>'}
      </section>
      <div class="fila" style="justify-content:center;gap:8px">
        <button class="btn btn-chico" data-accion="editar">${ic('lapiz')}Nombre y categoría</button>
        <button class="btn btn-chico btn-peligro" data-accion="borrar">${ic('tacho')}Borrar</button>
      </div>
    </div>`;
  }

  /* ---------------------------------------- sacar / cargar varios productos */
  const CLAVE_LOTES = 'stockRegional.lotes';
  const loteVacio = () => ({ items: [], motivo: '', detalle: '' });
  const lotes = Object.assign({ salida: loteVacio(), entrada: loteVacio() }, leerJSON(CLAVE_LOTES) || {});
  function guardarLotes() { try { localStorage.setItem(CLAVE_LOTES, JSON.stringify(lotes)); } catch (e) { /* lleno */ } }

  function agregarAlLote(tipo, p) {
    const L = lotes[tipo]; const it = L.items.find((x) => x.pid === p.id);
    if (tipo === 'salida') {
      const max = total(p);
      if (!max) { aviso(`“${nombreCorto(p)}” no tiene stock.`); return false; }
      if (it && it.c >= max) { aviso(`De “${nombreCorto(p)}” hay ${max}: ya están todas en la lista.`); return false; }
      if (it) it.c++; else L.items.unshift({ pid: p.id, c: 1 });
    } else if (it) it.c++;
    else L.items.unshift({ pid: p.id, c: 1, v: null });
    guardarLotes();
    return true;
  }

  function loteItemHTML(tipo, it, i) {
    const p = producto(it.pid); const tot = total(p); const sal = tipo === 'salida';
    const prox = tandasConStock(p)[0];
    const [y, m] = (it.v || '').split('-');
    const anios = []; for (let a = hoy.getFullYear() - 1; a <= hoy.getFullYear() + 6; a++) anios.push(a);
    return `<li class="lote-item" data-i="${i}">
      <div class="fila entre" style="align-items:flex-start">
        <div style="min-width:0"><div class="nom">${esc(nombreCorto(p))}</div>
          <div class="sub">${esc(p.cat)} · hay ${tot}${sal && prox ? ` · sale primero la que vence ${fmtVencCorto(prox.v)}` : ''}</div></div>
        <button class="cerrar" type="button" data-quitar-item="${i}" aria-label="Quitar de la lista">${ic('cerrar')}</button>
      </div>
      <div class="fila" style="flex-wrap:wrap">
        <span class="stepper chico" data-step><button type="button" data-d="-1" aria-label="Restar">−</button><input type="number" inputmode="numeric" min="1" ${sal ? `max="${tot}"` : ''} value="${it.c}" aria-label="Cantidad"><button type="button" data-d="1" aria-label="Sumar">+</button></span>
        ${sal ? '' : `<span class="fila" style="gap:6px"><span class="chico tinta-2">Vence</span>
          <select class="entrada entrada-chica" data-vm aria-label="Mes de vencimiento"><option value="">mes</option>${MESES.map((n, k) => { const v = String(k + 1).padStart(2, '0'); return `<option value="${v}" ${m === v ? 'selected' : ''}>${n}</option>`; }).join('')}</select>
          <select class="entrada entrada-chica" data-va aria-label="Año de vencimiento"><option value="">año</option>${anios.map((a) => `<option ${String(a) === y ? 'selected' : ''}>${a}</option>`).join('')}</select></span>`}
      </div>
    </li>`;
  }

  function vLote(tipo) {
    const sal = tipo === 'salida'; const L = lotes[tipo];
    L.items = L.items.filter((it) => producto(it.pid));
    titulo(sal ? 'Sacar productos' : 'Cargar lo que llegó');
    if (!db.productos.length) { vista.innerHTML = '<section class="caja"><p class="vacio">Primero cargá tus productos desde <a href="#/ajustes">Ajustes</a>.</p></section>'; return; }
    const unidades = () => L.items.reduce((a, it) => a + it.c, 0);
    const cabTxt = () => `${sal ? 'Vas a sacar' : 'Llegaron'} · ${L.items.length} producto${L.items.length === 1 ? '' : 's'} · ${unidades()} u.`;
    const okTxt = () => `${sal ? 'Confirmar salida' : 'Confirmar ingreso'} de ${unidades()} unidad${unidades() === 1 ? '' : 'es'}`;
    vista.innerHTML = `
      <p class="intro">${sal ? 'Escaneá o buscá cada producto que te llevás. Cuando estén todos, confirmá.' : 'Escaneá o buscá cada producto que llegó, y poné cuántos son y cuándo vencen.'}</p>
      <div class="lote">
        <div class="lote-buscar pila">
          <button class="btn btn-acento btn-grande btn-bloque solo-cel" data-accion="escanear-lote">${ic('escanear')}Escanear productos</button>
          <div class="buscador">${ic('buscar')}<input class="entrada" id="lq" type="search" placeholder="Buscar por nombre o escribir el código" autocomplete="off"></div>
          <div class="caja" id="lres" hidden></div>
          <p class="chico tenue solo-pc">Con un lector de códigos USB, escaneá directamente: el producto se agrega solo a la lista.</p>
        </div>
        <div class="lote-lista pila">
          <section class="caja">
            <div class="caja-cab"><span class="etq" id="lcab">${cabTxt()}</span>${L.items.length ? '<button class="btn-texto" data-accion="vaciar-lote">Vaciar</button>' : ''}</div>
            ${L.items.length ? `<ul class="lista" id="litems">${L.items.map((it, i) => loteItemHTML(tipo, it, i)).join('')}</ul>`
              : `<p class="vacio chico">La lista está vacía.<br>${esPC() ? 'Buscá un producto a la izquierda.' : 'Escaneá o buscá un producto.'}</p>`}
          </section>
          ${L.items.length ? `
            ${sal ? `<div class="campo"><span class="etq">Para qué (opcional)</span><div class="opciones" id="lmotivos">${MOTIVOS.map((m) => `<button type="button" class="chip ${L.motivo === m ? 'si' : ''}" data-m="${m}">${m}</button>`).join('')}</div></div>` : ''}
            <label class="campo"><span class="etq">Detalle (opcional)</span><input class="entrada" id="ldetalle" list="detalles" value="${esc(L.detalle)}" placeholder="${sal ? 'Ej.: reunión de campaña, para Marta' : 'Ej.: envío campaña 14'}" autocomplete="off"><datalist id="detalles">${detallesRecientes().map((d) => `<option value="${esc(d)}">`).join('')}</datalist></label>
            <button class="btn btn-oscuro btn-grande btn-bloque" data-accion="confirmar-lote" id="lok">${okTxt()}</button>` : ''}
        </div>
      </div>`;

    const q = $('#lq'); const res = $('#lres');
    const pintarRes = () => {
      const t = q.value.trim();
      if (t.length < 2) { res.hidden = true; res.innerHTML = ''; return; }
      const l = buscar(db.productos, t).slice(0, 8);
      res.hidden = false;
      res.innerHTML = l.length ? `<ul class="lista">${l.map((p) => {
        const tot = total(p); const no = sal && !tot; const en = L.items.find((x) => x.pid === p.id);
        return `<li><button class="item" data-agregar="${p.id}" ${no ? 'disabled' : ''}><span class="txt"><span class="nom">${esc(nombreCorto(p))}</span><span class="sub"><span class="etq" style="font-size:10px">${esc(p.cat)}</span><span>${no ? 'sin stock' : `hay ${tot}`}</span>${en ? `<span class="badge b-ok">${en.c} en la lista</span>` : ''}</span></span><span class="btn btn-chico">${ic('mas')}Agregar</span></button></li>`;
      }).join('')}</ul>`
        : `<p class="vacio chico">No encontré “${esc(t)}”.</p>${sal ? '' : `<div style="padding:0 14px 14px;text-align:center"><button class="btn" data-accion="nuevo-lote">${ic('mas')}Es un producto nuevo</button></div>`}`;
    };
    q.addEventListener('input', pintarRes);
    q.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      const t = q.value.trim();
      if (/^\d{6,}$/.test(t)) { q.value = ''; pintarRes(); procesarCodigo(t, { tipo: 'lote', lote: tipo }); return; }
      const primero = $('[data-agregar]:not([disabled])', res); if (primero) primero.click();
    });
    res.onclick = (e) => {
      const b = e.target.closest('[data-agregar]'); if (!b) return;
      if (agregarAlLote(tipo, producto(b.dataset.agregar))) { vLote(tipo); $('#lq').focus(); }
    };

    const lista = $('#litems');
    if (lista) {
      activarSteppers(lista);
      lista.addEventListener('input', (e) => {
        const li = e.target.closest('[data-i]'); if (!li || !e.target.matches('[data-step] input')) return;
        const it = L.items[+li.dataset.i]; const max = e.target.max ? +e.target.max : Infinity;
        it.c = Math.min(max, Math.max(1, parseInt(e.target.value, 10) || 1));
        guardarLotes(); $('#lcab').textContent = cabTxt(); const ok = $('#lok'); if (ok) ok.textContent = okTxt();
      });
      lista.addEventListener('change', (e) => {
        const li = e.target.closest('[data-i]'); if (!li || !e.target.matches('select')) return;
        const it = L.items[+li.dataset.i]; const mm = $('[data-vm]', li).value, aa = $('[data-va]', li).value;
        it.v = mm && aa ? `${aa}-${mm}` : null; guardarLotes();
      });
      lista.addEventListener('click', (e) => {
        const b = e.target.closest('[data-quitar-item]'); if (!b) return;
        L.items.splice(+b.dataset.quitarItem, 1); guardarLotes(); vLote(tipo);
      });
    }
    const mot = $('#lmotivos');
    if (mot) mot.onclick = (e) => { const b = e.target.closest('[data-m]'); if (!b) return; L.motivo = L.motivo === b.dataset.m ? '' : b.dataset.m; guardarLotes(); $$('[data-m]', mot).forEach((x) => x.classList.toggle('si', x.dataset.m === L.motivo)); };
    const det = $('#ldetalle');
    if (det) det.addEventListener('input', () => { L.detalle = det.value; guardarLotes(); });
    if (esPC()) q.focus();
  }

  function confirmarLote(tipo) {
    const L = lotes[tipo]; const movs = []; let u = 0;
    if (tipo === 'entrada' && L.items.some((it) => !it.v) && !L.avisado) {
      L.avisado = true;
      confirmar('Hay productos sin vencimiento', 'Algunos productos no tienen fecha de vencimiento. Si la tienen, completala; si no, podés seguir igual.', 'Seguir sin fecha', () => confirmarLote(tipo));
      return;
    }
    for (const it of L.items) {
      const p = producto(it.pid); if (!p) continue;
      if (tipo === 'salida') { const n = Math.min(it.c, total(p)); if (n) { movs.push(...sacar(p, n, L.motivo, L.detalle.trim())); u += n; } }
      else { movs.push(...entrar(p, it.c, it.v, L.detalle.trim())); u += it.c; }
    }
    const np = L.items.length;
    lotes[tipo] = loteVacio(); guardarLotes();
    ir('#/');
    aviso(`${tipo === 'salida' ? 'Sacaste' : 'Cargaste'} ${u} unidad${u === 1 ? '' : 'es'} de ${np} producto${np === 1 ? '' : 's'}.`, () => { deshacer(movs); render(); });
  }

  function movHTML(m, sinNombre) {
    const signo = m.tipo === 'sale' ? `−${m.cant}` : m.tipo === 'entra' ? `+${m.cant}` : (m.cant > 0 ? `+${m.cant}` : `−${-m.cant}`);
    const clase = (m.tipo === 'sale' || (m.tipo === 'ajuste' && m.cant < 0)) ? 'menos' : 'mas';
    const f = new Date(m.t);
    const cuando = f.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }) + ' ' + f.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });
    const que = m.tipo === 'sale' ? (m.motivo || 'Salió') : m.tipo === 'entra' ? 'Entró' : 'Corrección';
    const p = producto(m.pid);
    const nom = p ? nombreCorto(p) : m.nombre;
    return `<a class="mov" ${p && !sinNombre ? `href="#/p/${p.id}"` : ''} style="text-decoration:none"><span class="signo ${clase}">${signo}</span><span class="txt">${sinNombre ? '' : `<span class="nom" style="display:block">${esc(nom)}</span>`}<span class="sub">${esc(que)}${m.detalle ? ` · ${esc(m.detalle)}` : ''}${m.v ? ` · vence ${fmtVencCorto(m.v)}` : ''}</span></span><span class="sub mono" style="white-space:nowrap">${cuando}</span></a>`;
  }

  function vMovimientos() {
    titulo('Historial');
    if (!db.movs.length) { vista.innerHTML = '<section class="caja"><p class="vacio">Todavía no hay movimientos.<br><span class="chico">Cada vez que sacás o cargás productos, queda anotado acá.</span></p></section>'; return; }
    const motivos = ['Todos', 'Entró', ...MOTIVOS, 'Corrección'];
    const sel = filtros.mov || 'Todos';
    const lista = db.movs.filter((m) => sel === 'Todos' || (sel === 'Entró' ? m.tipo === 'entra' : sel === 'Corrección' ? m.tipo === 'ajuste' : m.tipo === 'sale' && m.motivo === sel));
    const salidas = lista.filter((m) => m.tipo === 'sale').reduce((a, m) => a + m.cant, 0);
    const entradas = lista.filter((m) => m.tipo === 'entra').reduce((a, m) => a + m.cant, 0);
    let html = '';
    if (esPC()) {
      html = `<table class="tabla tabla-quieta"><thead><tr><th>Fecha</th><th>Movimiento</th><th>Producto</th><th class="num">Cant.</th><th>Vence</th><th>Detalle</th></tr></thead><tbody>${lista.slice(0, 500).map((m) => {
        const f = new Date(m.t); const p = producto(m.pid);
        const n = m.tipo === 'sale' ? -m.cant : m.cant;
        return `<tr><td class="mono chico tinta-2" style="white-space:nowrap">${f.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' })} ${f.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })}</td>
          <td>${esc(m.tipo === 'sale' ? (m.motivo || 'Salió') : m.tipo === 'entra' ? 'Entró' : 'Corrección')}</td>
          <td>${p ? `<a href="#/p/${p.id}">${esc(nombreCorto(p))}</a>` : esc(m.nombre)}</td>
          <td class="num cant ${n < 0 ? 'menos' : 'mas'}">${n > 0 ? '+' : '−'}${Math.abs(n)}</td>
          <td class="mono chico">${m.v ? fmtVencCorto(m.v) : ''}</td><td class="chico tinta-2">${esc(m.detalle || '')}</td></tr>`;
      }).join('')}</tbody></table>`;
    } else {
      let dia = '';
      for (const m of lista.slice(0, 300)) {
        const d = new Date(m.t).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
        if (d !== dia) { if (dia) html += '</ul>'; html += `<div class="dia etq">${d}</div><ul class="lista">`; dia = d; }
        html += `<li>${movHTML(m)}</li>`;
      }
      html += '</ul>';
    }
    vista.innerHTML = `
      <div class="chips" id="motivos">${motivos.map((k) => `<button class="chip ${sel === k ? 'si' : ''}" data-mot="${k}">${k}</button>`).join('')}</div>
      <p class="chico tinta-2">${lista.length} movimiento(s) · salieron <b>${salidas}</b> u. · entraron <b>${entradas}</b> u.</p>
      <section class="caja">${html}</section>`;
    $('#motivos').onclick = (e) => { const b = e.target.closest('[data-mot]'); if (b) { filtros.mov = b.dataset.mot; vMovimientos(); } };
  }

  function vMas() {
    titulo('Ajustes');
    const d = db.meta;
    const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    vista.innerHTML = `<div class="ajustes">
      <section class="caja">
        <div class="caja-cab"><span class="etq">Planilla de Google</span>${conexion ? `<span class="sync sync-${estadoSync}">${{ ok: 'Al día', guardando: 'Guardando…', error: 'Sin conexión', clave: 'Clave incorrecta' }[estadoSync] || ''}</span>` : ''}</div>
        ${conexion ? `<ul class="lista">
          ${d.planilla ? `<li><a class="item" href="${esc(d.planilla)}" target="_blank" rel="noopener">${ic('copia')}<span class="txt"><span class="nom">Abrir la planilla</span><span class="sub">Ver el stock y los movimientos en Google Sheets</span></span></a></li>` : ''}
          <li><button class="item" data-accion="compartir">${ic('celular')}<span class="txt"><span class="nom">Abrir en otro dispositivo</span><span class="sub">Código QR para el celular o link para la compu</span></span></button></li>
          <li><button class="item" data-accion="sincronizar">${ic('bajar')}<span class="txt"><span class="nom">Actualizar ahora</span><span class="sub">${cola.length ? `${cola.length} cambio(s) sin enviar` : d.sincro ? `Última vez: ${new Date(d.sincro).toLocaleString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false })}` : 'Traer lo último de la planilla'}</span></span></button></li>
        </ul>` : `<div class="caja-cuerpo pila chico"><p>Con la planilla, el stock se ve igual en la compu y en el celular, y queda guardado en tu cuenta de Google.</p><button class="btn" data-accion="conectar" style="align-self:flex-start">Conectar con la planilla</button></div>`}
      </section>
      <section class="caja">
        <div class="caja-cab"><span class="etq">Excel</span></div>
        <ul class="lista">
          <li><button class="item" data-accion="exportar">${ic('bajar')}<span class="txt"><span class="nom">Exportar a Excel</span><span class="sub">El stock actual y todos los movimientos</span></span></button></li>
          <li><button class="item" data-accion="importar">${ic('subir')}<span class="txt"><span class="nom">Importar un Excel</span><span class="sub">Reemplaza lo cargado${d.archivo ? ` · último: ${esc(d.archivo)}` : ''}</span></span></button></li>
        </ul>
      </section>
      ${conexion ? '' : `<section class="caja">
        <div class="caja-cab"><span class="etq">Copia de seguridad</span></div>
        <ul class="lista">
          <li><button class="item" data-accion="copia">${ic('copia')}<span class="txt"><span class="nom">Guardar una copia</span><span class="sub">${d.respaldo ? `Última: ${new Date(d.respaldo).toLocaleDateString('es-AR')}` : 'Todavía no guardaste ninguna'} · mandala a tu WhatsApp o Drive</span></span></button></li>
          <li><button class="item" data-accion="recuperar">${ic('subir')}<span class="txt"><span class="nom">Recuperar una copia</span><span class="sub">Para pasar todo a otro celular</span></span></button></li>
        </ul>
      </section>`}
      ${standalone || esPC() ? '' : `<section class="caja"><div class="caja-cab"><span class="etq">Instalar en el celular</span></div><div class="caja-cuerpo pila chico">
        <p class="fila" style="align-items:flex-start">${ic('celular')}<span>${ios
          ? 'En Safari tocá el botón <b>Compartir</b> y después <b>Agregar a inicio</b>.'
          : 'En Chrome tocá los tres puntitos <b>⋮</b> y después <b>Agregar a la pantalla principal</b> o <b>Instalar app</b>.'} Queda como una app más, abre sin internet y los datos se cuidan mejor.</span></p>
      </div></section>`}
      <section class="caja"><div class="caja-cuerpo pila chico">
        <p class="tinta-2">${db.productos.length} productos · ${db.movs.length} movimientos. ${conexion ? 'Guardados en la planilla, con una copia en este dispositivo para usar sin internet.' : 'Los datos están guardados solo en este dispositivo.'}</p>
        ${conexion ? `<button class="btn btn-chico btn-peligro" data-accion="desconectar" style="align-self:flex-start">Desconectar este dispositivo</button>`
          : `<button class="btn btn-chico btn-peligro" data-accion="borrar-todo" style="align-self:flex-start">${ic('tacho')}Borrar todo</button>`}
      </div></section>
    </div>
    <p class="pie chico"><a href="https://encastredev.github.io" target="_blank" rel="noopener">Hecho por Encastre</a></p>`;
  }

  /* ------------------------------------------------------------ hojas */
  let hojaAbierta = null;
  function abrirHoja(html, alAbrir) {
    cerrarHoja();
    const velo = document.createElement('div'); velo.className = 'velo';
    velo.innerHTML = `<div class="hoja" role="dialog" aria-modal="true">${html}</div>`;
    document.body.appendChild(velo); hojaAbierta = velo;
    const hoja = $('.hoja', velo);
    velo.addEventListener('click', (e) => { if (e.target === velo || e.target.closest('[data-cerrar]')) cerrarHoja(); });
    if (alAbrir) alAbrir(hoja, cerrarHoja);
    return hoja;
  }
  function cerrarHoja() { if (hojaAbierta) { hojaAbierta.remove(); hojaAbierta = null; } }

  function stepper(id, valor, max) {
    return `<span class="stepper" data-step="${id}"><button type="button" data-d="-1" aria-label="Restar">−</button><input type="number" inputmode="numeric" min="1" ${max ? `max="${max}"` : ''} value="${valor}" id="${id}"><button type="button" data-d="1" aria-label="Sumar">+</button></span>`;
  }
  function activarSteppers(el) {
    $$('[data-step]', el).forEach((s) => {
      const inp = $('input', s);
      s.addEventListener('click', (e) => {
        const b = e.target.closest('[data-d]'); if (!b) return;
        const min = +(inp.min || 0); const max = inp.max ? +inp.max : Infinity;
        inp.value = Math.min(max, Math.max(min, (parseInt(inp.value, 10) || 0) + +b.dataset.d));
        inp.dispatchEvent(new Event('input', { bubbles: true }));
      });
    });
  }
  function selectorVenc(pre, v) {
    const [y, m] = (v || '').split('-');
    const anioHoy = hoy.getFullYear();
    const anios = []; for (let a = anioHoy - 1; a <= anioHoy + 6; a++) anios.push(a);
    return `<div class="fila"><select class="entrada" id="${pre}-m"><option value="">Mes</option>${MESES.map((n, i) => `<option value="${String(i + 1).padStart(2, '0')}" ${m === String(i + 1).padStart(2, '0') ? 'selected' : ''}>${n}</option>`).join('')}</select>
      <select class="entrada" id="${pre}-a"><option value="">Año</option>${anios.map((a) => `<option ${String(a) === y ? 'selected' : ''}>${a}</option>`).join('')}</select></div>`;
  }
  const leerVenc = (hoja, pre) => { const m = $(`#${pre}-m`, hoja).value, a = $(`#${pre}-a`, hoja).value; return m && a ? `${a}-${m}` : null; };

  function detallesRecientes() { return [...new Set(db.movs.filter((m) => m.detalle).map((m) => m.detalle))].slice(0, 12); }

  function hojaSacar(p) {
    const ts = tandasConStock(p); const tot = total(p);
    let motivo = '';
    abrirHoja(`
      <div class="fila entre"><div><span class="etq">Sacar</span><h3>${esc(nombreCorto(p))}</h3></div><button class="cerrar" data-cerrar>${ic('cerrar')}</button></div>
      <div class="fila entre"><span>¿Cuántas?</span>${stepper('cant', 1, tot)}</div>
      ${ts.length > 1 ? `<label class="campo"><span class="etq">De cuál</span><select class="entrada" id="tanda">${ts.map((t, i) => `<option value="${i}">Vence ${fmtVenc(t.v)} · hay ${t.c}${i === 0 ? ' (la más próxima)' : ''}</option>`).join('')}</select></label>` : ''}
      <div class="campo"><span class="etq">Para qué (opcional)</span><div class="opciones" id="motivos">${MOTIVOS.map((m) => `<button type="button" class="chip" data-m="${m}">${m}</button>`).join('')}</div></div>
      <label class="campo"><span class="etq">Detalle (opcional)</span><input class="entrada" id="detalle" list="detalles" placeholder="Ej.: reunión de campaña, para Marta" autocomplete="off"><datalist id="detalles">${detallesRecientes().map((d) => `<option value="${esc(d)}">`).join('')}</datalist></label>
      <button class="btn btn-oscuro btn-grande btn-bloque" data-ok>Sacar 1</button>`, (hoja, cerrar) => {
      activarSteppers(hoja);
      const ok = $('[data-ok]', hoja); const cant = $('#cant', hoja);
      cant.addEventListener('input', () => { ok.textContent = `Sacar ${parseInt(cant.value, 10) || 0}`; });
      $('#motivos', hoja).onclick = (e) => { const b = e.target.closest('[data-m]'); if (!b) return; motivo = motivo === b.dataset.m ? '' : b.dataset.m; $$('[data-m]', hoja).forEach((x) => x.classList.toggle('si', x.dataset.m === motivo)); };
      ok.onclick = () => {
        const n = Math.min(tot, parseInt(cant.value, 10) || 0); if (!n) return;
        const sel = $('#tanda', hoja);
        const movs = sacar(p, n, motivo, $('#detalle', hoja).value.trim(), sel ? ts[+sel.value].v : undefined);
        cerrar(); render();
        aviso(`Salieron ${n}. Quedan ${total(p)}.`, () => { deshacer(movs); render(); });
      };
    });
  }

  function hojaEntro(p) {
    abrirHoja(`
      <div class="fila entre"><div><span class="etq">Agregar stock</span><h3>${esc(nombreCorto(p))}</h3></div><button class="cerrar" data-cerrar>${ic('cerrar')}</button></div>
      <div class="fila entre"><span>¿Cuántas?</span>${stepper('cant', 1)}</div>
      <label class="campo"><span class="etq">Vencimiento</span>${selectorVenc('ve', null)}<span class="chico tenue">Si no tiene fecha, dejalo vacío.</span></label>
      <label class="campo"><span class="etq">Detalle (opcional)</span><input class="entrada" id="detalle" placeholder="Ej.: envío campaña 14" autocomplete="off"></label>
      <button class="btn btn-oscuro btn-grande btn-bloque" data-ok>Guardar</button>`, (hoja, cerrar) => {
      activarSteppers(hoja);
      $('[data-ok]', hoja).onclick = () => {
        const n = parseInt($('#cant', hoja).value, 10) || 0; if (n < 1) return;
        const movs = entrar(p, n, leerVenc(hoja, 've'), $('#detalle', hoja).value.trim());
        cerrar(); render();
        aviso(`Entraron ${n}. Hay ${total(p)}.`, () => { deshacer(movs); render(); });
      };
    });
  }

  function hojaCorregir(p) {
    let filas = tandasConStock(p).map((t) => ({ v: t.v, c: t.c }));
    const pintar = (hoja) => {
      $('#tandas', hoja).innerHTML = filas.map((t, i) => `<div class="pila" style="gap:8px;padding:12px 0;border-bottom:1px solid var(--linea)">
        ${selectorVenc(`t${i}`, t.v)}
        <div class="fila entre">${stepper(`c${i}`, t.c)}<button class="btn btn-chico btn-peligro" data-borrar="${i}">${ic('tacho')}Quitar</button></div></div>`).join('') || '<p class="chico tenue">Sin unidades.</p>';
      $$('[data-step] input', hoja).forEach((x) => { x.min = 0; });
      activarSteppers($('#tandas', hoja));
    };
    const leer = (hoja) => { filas = filas.map((t, i) => ({ v: leerVenc(hoja, `t${i}`), c: parseInt($(`#c${i}`, hoja).value, 10) || 0 })); };
    abrirHoja(`
      <div class="fila entre"><div><span class="etq">Corregir vencimientos</span><h3>${esc(nombreCorto(p))}</h3></div><button class="cerrar" data-cerrar>${ic('cerrar')}</button></div>
      <p class="chico tenue">Dejá cada fecha con las unidades que tenés de verdad. Queda anotado como corrección.</p>
      <div id="tandas"></div>
      <button class="btn btn-bloque" data-agregar>${ic('mas')}Agregar otra fecha</button>
      <button class="btn btn-oscuro btn-grande btn-bloque" data-ok>Guardar</button>`, (hoja, cerrar) => {
      pintar(hoja);
      hoja.addEventListener('click', (e) => {
        const b = e.target.closest('[data-borrar]'); if (b) { leer(hoja); filas.splice(+b.dataset.borrar, 1); pintar(hoja); }
      });
      $('[data-agregar]', hoja).onclick = () => { leer(hoja); filas.push({ v: null, c: 1 }); pintar(hoja); };
      $('[data-ok]', hoja).onclick = () => {
        leer(hoja);
        const nuevas = new Map();
        for (const t of filas) if (t.c > 0) nuevas.set(t.v || null, (nuevas.get(t.v || null) || 0) + t.c);
        const antes = new Map(); for (const t of p.tandas) antes.set(t.v || null, (antes.get(t.v || null) || 0) + t.c);
        const claves = new Set([...antes.keys(), ...nuevas.keys()]);
        for (const k of claves) { const dif = (nuevas.get(k) || 0) - (antes.get(k) || 0); if (dif) registrar({ pid: p.id, nombre: p.nombre, tipo: 'ajuste', cant: dif, v: k, motivo: '', detalle: '' }); }
        p.tandas = [...nuevas].map(([v, c]) => ({ v, c }));
        p.estimado = false; tocar(p);
        guardar(); cerrar(); render(); aviso('Vencimientos corregidos.');
      };
    });
  }

  function hojaEditar(p, alGuardar) {
    const cats = [...new Set([...CATEGORIAS.map((c) => c[1]), ...db.productos.map((x) => x.cat), 'Otros'])].sort();
    const nuevo = !p;
    abrirHoja(`
      <div class="fila entre"><h3>${nuevo ? 'Producto nuevo' : 'Nombre y categoría'}</h3><button class="cerrar" data-cerrar>${ic('cerrar')}</button></div>
      <label class="campo"><span class="etq">Nombre</span><input class="entrada" id="nombre" value="${esc(p ? p.nombre : (alGuardar && alGuardar.nombre) || '')}" autocomplete="off" style="text-transform:uppercase"></label>
      <label class="campo"><span class="etq">Categoría</span><select class="entrada" id="categoria">${cats.map((c) => `<option ${p && p.cat === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select></label>
      ${nuevo ? `<div class="fila entre"><span>¿Cuántas hay?</span>${stepper('cant', 1)}</div><label class="campo"><span class="etq">Vencimiento</span>${selectorVenc('ve', null)}</label>${alGuardar && alGuardar.codigo ? `<p class="chico">Código: <span class="codigo">${esc(alGuardar.codigo)}</span></p>` : ''}` : ''}
      <button class="btn btn-oscuro btn-grande btn-bloque" data-ok>Guardar</button>`, (hoja, cerrar) => {
      activarSteppers(hoja);
      const nom = $('#nombre', hoja);
      if (nuevo) { const cat = categoriaDe(nom.value); $('#categoria', hoja).value = cat; nom.addEventListener('input', () => { $('#categoria', hoja).value = categoriaDe(nom.value); }); }
      $('[data-ok]', hoja).onclick = () => {
        const nombre = nom.value.replace(/\s+/g, ' ').trim().toUpperCase(); if (!nombre) { nom.focus(); return; }
        if (nuevo) {
          const np = { id: uid(), nombre, cat: $('#categoria', hoja).value, codigos: alGuardar && alGuardar.codigo ? [alGuardar.codigo] : [], tandas: [], obs: [] };
          db.productos.push(np); tocar(np);
          const n = parseInt($('#cant', hoja).value, 10) || 0;
          if (n) entrar(np, n, leerVenc(hoja, 've'), 'Alta de producto'); else guardar();
          cerrar();
          if (alGuardar && alGuardar.quedarse) { render(); aviso(n ? `Producto agregado con ${n} unidad(es).` : 'Producto agregado.'); }
          else { ir(`#/p/${np.id}`); aviso('Producto agregado.'); }
        } else {
          p.nombre = nombre; p.cat = $('#categoria', hoja).value; tocar(p); guardar(); cerrar(); render();
        }
      };
    });
  }

  function confirmar(titulo_, texto, boton, fn) {
    abrirHoja(`<div class="fila entre"><h3>${titulo_}</h3><button class="cerrar" data-cerrar>${ic('cerrar')}</button></div><p>${texto}</p>
      <div class="acciones"><button class="btn btn-grande" data-cerrar>Cancelar</button><button class="btn btn-grande btn-peligro" data-ok>${boton}</button></div>`,
    (hoja, cerrar) => { $('[data-ok]', hoja).onclick = () => { cerrar(); fn(); }; });
  }

  /* ------------------------------------------------------------ escáner */
  let esc_ = null; // estado del escáner abierto

  // modo: { tipo: 'buscar' } · { tipo: 'asociar', pid } · { tipo: 'lote', lote: 'salida' | 'entrada' }
  async function abrirEscaner(modo = { tipo: 'buscar' }) {
    cerrarHoja();
    const lote = modo.tipo === 'lote';
    const el = document.createElement('div'); el.className = 'escaner';
    el.innerHTML = `<video playsinline muted></video><div class="marco"></div>
      <div class="arriba"><span class="etq" style="color:#fff">${modo.tipo === 'asociar' ? 'Asociar código' : lote ? (modo.lote === 'salida' ? 'Escaneando para sacar' : 'Escaneando lo que llegó') : 'Escanear'}</span><button class="btn btn-chico" data-x>${ic('cerrar')}Cerrar</button></div>
      <div class="abajo"><p class="msj" id="esc-msj">${lote ? 'Apuntá a cada código, uno por uno. Se van sumando a la lista.' : 'Apuntá al código de barras de la caja'}</p>
        <form class="fila" id="esc-form"><input class="entrada" id="esc-manual" inputmode="numeric" placeholder="O escribí el número" autocomplete="off"><button class="btn" type="submit">OK</button></form>
        ${lote ? `<button class="btn btn-acento btn-grande btn-bloque" data-listo>Listo · <span id="esc-cuenta">${lotes[modo.lote].items.length}</span> en la lista</button>` : ''}</div>`;
    document.body.appendChild(el);
    const video = $('video', el); const msj = $('#esc-msj', el);
    esc_ = { el, modo, stream: null, timer: null, controls: null, listo: false };
    const salir = () => { cerrarEscaner(); if (lote) render(); };
    $('[data-x]', el).onclick = salir;
    if (lote) $('[data-listo]', el).onclick = salir;
    $('#esc-form', el).onsubmit = (e) => { e.preventDefault(); const v = $('#esc-manual', el).value.trim(); if (v) leido(v, true); };
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { msj.textContent = 'Este navegador no deja usar la cámara. Escribí el número del código.'; return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
      if (!esc_ || esc_.el !== el) { stream.getTracks().forEach((t) => t.stop()); return; }
      esc_.stream = stream; video.srcObject = stream; await video.play();
      let formatos = [];
      if ('BarcodeDetector' in window) { try { formatos = await BarcodeDetector.getSupportedFormats(); } catch (e) { formatos = []; } }
      const quiero = ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'itf'].filter((f) => formatos.includes(f));
      if (quiero.length) {
        const det = new BarcodeDetector({ formats: quiero });
        const ciclo = async () => {
          if (!esc_ || esc_.el !== el) return;
          try { const r = await det.detect(video); if (r.length && leido(r[0].rawValue)) return; } catch (e) { /* cuadro sin leer */ }
          esc_.timer = setTimeout(ciclo, 120);
        };
        ciclo();
      } else {
        await cargarScript(ZXING);
        if (!esc_ || esc_.el !== el) return;
        const lector = new ZXingBrowser.BrowserMultiFormatReader();
        esc_.controls = await lector.decodeFromVideoElement(video, (res) => { if (res) leido(res.getText()); });
      }
    } catch (e) {
      msj.textContent = e && e.name === 'NotAllowedError'
        ? 'No hay permiso para usar la cámara. Habilitalo en el navegador o escribí el número.'
        : 'No se pudo abrir la cámara. Escribí el número del código.';
    }
  }
  function cerrarEscaner() {
    if (!esc_) return;
    clearTimeout(esc_.timer);
    try { esc_.controls && esc_.controls.stop(); } catch (e) { /* ya parado */ }
    if (esc_.stream) esc_.stream.getTracks().forEach((t) => t.stop());
    esc_.el.remove(); esc_ = null;
  }
  const scripts = {};
  function cargarScript(src) {
    return scripts[src] || (scripts[src] = new Promise((ok, mal) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = () => { delete scripts[src]; mal(new Error('script')); }; document.head.appendChild(s); }));
  }

  // Devuelve true si el escáner tiene que dejar de leer.
  function leido(crudo, manual) {
    if (!esc_ || esc_.listo) return true;
    const c = normCodigo(crudo);
    if (!manual && !codigoValido(c)) return false;
    const modo = esc_.modo;
    if (modo.tipo === 'lote') {
      // Sigue escaneando: cada código se suma a la lista.
      const ahora = Date.now();
      if (!manual && esc_.ultimo === c && ahora - esc_.tUltimo < 2500) return false;
      esc_.ultimo = c; esc_.tUltimo = ahora;
      const p = porCodigo(c);
      if (p) {
        if (navigator.vibrate) navigator.vibrate(60);
        const ok = agregarAlLote(modo.lote, p);
        const it = lotes[modo.lote].items.find((x) => x.pid === p.id);
        $('#esc-msj', esc_.el).innerHTML = ok ? `✓ <b>${esc(nombreCorto(p))}</b> · ${it.c} en la lista` : `<b>${esc(nombreCorto(p))}</b>: no hay más stock`;
        $('#esc-cuenta', esc_.el).textContent = lotes[modo.lote].items.length;
        $('#esc-manual', esc_.el).value = '';
        return false;
      }
      esc_.listo = true; cerrarEscaner(); render();
      hojaCodigoNuevo(c, (q) => { if (agregarAlLote(modo.lote, q)) render(); });
      return true;
    }
    esc_.listo = true;
    if (navigator.vibrate) navigator.vibrate(60);
    cerrarEscaner();
    if (modo.tipo === 'asociar') {
      const p = producto(modo.pid); const ya = porCodigo(c);
      if (ya && ya.id !== p.id) { aviso(`Ese código ya está en “${nombreCorto(ya)}”.`); ir(`#/p/${ya.id}`); return true; }
      p.codigos = [...new Set([...(p.codigos || []), c])]; tocar(p); guardar(); render(); aviso('Código asociado.');
      return true;
    }
    procesarCodigo(c);
    return true;
  }

  // Un código leído con la cámara, escrito o del lector USB.
  function procesarCodigo(crudo, modo) {
    const c = normCodigo(crudo); const p = porCodigo(c);
    if (modo && modo.tipo === 'lote') {
      if (p) { if (agregarAlLote(modo.lote, p)) { render(); aviso(`Agregado: ${nombreCorto(p)}`); } return; }
      hojaCodigoNuevo(c, (q) => { if (agregarAlLote(modo.lote, q)) render(); });
      return;
    }
    if (p) { ir(`#/p/${p.id}`); return; }
    hojaCodigoNuevo(c);
  }

  function hojaCodigoNuevo(c, alElegir) {
    abrirHoja(`
      <div class="fila entre"><div><span class="etq">Código nuevo</span><h3 class="codigo" style="font-size:18px">${esc(c)}</h3></div><button class="cerrar" data-cerrar>${ic('cerrar')}</button></div>
      <p class="chico">Todavía no está asociado. Buscá qué producto es y tocalo: la próxima vez lo reconoce solo.</p>
      <div class="buscador">${ic('buscar')}<input class="entrada" id="bq" type="search" placeholder="Ej.: tododia frutos rojos" autocomplete="off"></div>
      <div class="caja" style="max-height:44vh;overflow-y:auto"><ul class="lista" id="bres"></ul></div>
      <button class="btn btn-bloque" data-nuevo>${ic('mas')}No está en la lista: agregarlo</button>`, (hoja, cerrar) => {
      const q = $('#bq', hoja); const res = $('#bres', hoja);
      const pintar = () => {
        const l = q.value.trim().length >= 2 ? buscar(db.productos, q.value).slice(0, 40) : [];
        res.innerHTML = l.map((p) => `<li><button class="item" data-elegir="${p.id}"><span class="txt"><span class="nom">${esc(nombreCorto(p))}</span><span class="sub"><span class="etq" style="font-size:10px">${esc(p.cat)}</span>${p.codigos && p.codigos.length ? '<span>ya tiene código</span>' : ''}</span></span><span class="cant ${total(p) ? '' : 'cero'}">${total(p)}<small>u.</small></span></button></li>`).join('')
          || `<li class="vacio chico">${q.value.trim().length >= 2 ? 'No encontré nada con eso.' : 'Escribí parte del nombre.'}</li>`;
      };
      q.addEventListener('input', pintar); pintar(); setTimeout(() => q.focus(), 50);
      res.onclick = (e) => {
        const b = e.target.closest('[data-elegir]'); if (!b) return;
        const p = producto(b.dataset.elegir); p.codigos = [...new Set([...(p.codigos || []), c])]; tocar(p); guardar();
        cerrar();
        if (alElegir) { alElegir(p); aviso('Código asociado y agregado a la lista.'); }
        else { ir(`#/p/${p.id}`); aviso('Código asociado. La próxima vez lo encontrás escaneando.'); }
      };
      $('[data-nuevo]', hoja).onclick = () => hojaEditar(null, { codigo: c, nombre: q.value, quedarse: !!alElegir });
    });
  }

  /* ------------------------------------------------------------ aviso */
  let tAviso;
  function aviso(txt, alDeshacer) {
    $$('.toast').forEach((t) => t.remove()); clearTimeout(tAviso);
    const t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status');
    t.innerHTML = `<span>${esc(txt)}</span>${alDeshacer ? '<button type="button">Deshacer</button>' : ''}`;
    document.body.appendChild(t);
    if (alDeshacer) $('button', t).onclick = () => { alDeshacer(); t.remove(); aviso('Listo, se deshizo.'); };
    tAviso = setTimeout(() => t.remove(), alDeshacer ? 6000 : 3200);
  }

  /* ------------------------------------------------------------ eventos */
  const sinDatos = () => { aviso(conexion ? 'La planilla está vacía: primero importá tu Excel.' : 'Primero conectá la planilla o importá tu Excel.'); };
  document.addEventListener('click', (e) => {
    const conPid = e.target.closest('[data-pid]');
    const p = producto(conPid ? conPid.dataset.pid : vista.dataset.pid);
    const quitar = e.target.closest('[data-quitar]');
    if (quitar && p) { p.codigos = p.codigos.filter((c) => c !== quitar.dataset.quitar); tocar(p); guardar(); render(); return; }
    const b = e.target.closest('[data-accion]'); if (!b) return;
    switch (b.dataset.accion) {
      case 'escanear': if (db.productos.length) abrirEscaner(); else sinDatos(); break;
      case 'escanear-lote': abrirEscaner({ tipo: 'lote', lote: ruta }); break;
      case 'vaciar-lote': lotes[ruta] = loteVacio(); guardarLotes(); render(); break;
      case 'confirmar-lote': confirmarLote(ruta); break;
      case 'nuevo-lote': hojaEditar(null, { nombre: ($('#lq') || {}).value || '', quedarse: true }); break;
      case 'importar': $('#archivo-excel').click(); break;
      case 'recuperar': $('#archivo-copia').click(); break;
      case 'exportar': exportarExcel(); break;
      case 'copia': guardarCopia(); break;
      case 'sacar': hojaSacar(p); break;
      case 'entro': hojaEntro(p); break;
      case 'corregir': hojaCorregir(p); break;
      case 'asociar': abrirEscaner({ tipo: 'asociar', pid: p.id }); break;
      case 'editar': hojaEditar(p); break;
      case 'nuevo': hojaEditar(null, { nombre: filtros.q }); break;
      case 'revisado': p.obs = []; tocar(p); guardar(); render(); break;
      case 'borrar': confirmar('Borrar producto', `Se borra <b>${esc(p.nombre)}</b> de la lista. Su historial de movimientos queda.`, 'Borrar', () => { db.productos = db.productos.filter((x) => x.id !== p.id); enviar({ op: 'borrarProducto', id: p.id }); guardar(); ir('#/stock'); aviso('Producto borrado.'); }); break;
      case 'desconectar': hojaDesconectar(); break;
      case 'conectar': hojaConectar(); break;
      case 'compartir': hojaCompartir(); break;
      case 'sincronizar': sincronizar(); break;
      case 'borrar-todo': confirmar('Borrar todo', 'Se borran todos los productos y movimientos de este dispositivo. Si no guardaste una copia, no se pueden recuperar.', 'Borrar todo', () => { db = vacio(); guardar(); ir('#/'); }); break;
    }
  });
  $('#btn-escanear').onclick = () => {
    if (!db.productos.length) { sinDatos(); return; }
    abrirEscaner(ruta === 'salida' || ruta === 'entrada' ? { tipo: 'lote', lote: ruta } : { tipo: 'buscar' });
  };
  $('#sync').onclick = sincronizar;
  $('#volver').onclick = () => { if (history.length > 1) history.back(); else ir('#/stock'); };
  $('#archivo-excel').onchange = (e) => { const f = e.target.files[0]; e.target.value = ''; if (f) importarArchivo(f); };
  $('#archivo-copia').onchange = (e) => { const f = e.target.files[0]; e.target.value = ''; if (f) recuperarCopia(f); };

  // Teclado: Escape cierra; un lector de códigos USB "escribe" los números rápido y termina con Enter.
  let tecleado = '', tTecla = 0;
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { if (esc_) cerrarEscaner(); else if (hojaAbierta) cerrarHoja(); else if (panel) cerrarFicha(); return; }
    if (esc_ || hojaAbierta || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    const ahora = performance.now();
    if (ahora - tTecla > 80) tecleado = '';
    tTecla = ahora;
    if (/^\d$/.test(e.key)) { tecleado += e.key; return; }
    if (e.key === 'Enter' && tecleado.length >= 6) {
      e.preventDefault(); const c = tecleado; tecleado = '';
      if (!db.productos.length) return;
      procesarCodigo(c, ruta === 'salida' || ruta === 'entrada' ? { tipo: 'lote', lote: ruta } : null);
    }
  });
  window.addEventListener('storage', (e) => { if (e.key === CLAVE) { db = cargar(); render(); } });

  // Para probar desde la consola: importar un Excel por URL.
  window.__stock = { importarURL: async (url) => importarArchivo(new File([await (await fetch(url)).arrayBuffer()], url.split('/').pop())), db: () => db };

  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
  render();
  pintarSync(estadoSync);
  sincronizar();
})();
