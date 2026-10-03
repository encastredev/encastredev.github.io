/* ==========================================================================
   Consultorio · fichas de pacientes, sesiones y documentos
   Los datos viven en una planilla de Google de la profesional (ver apps-script/).
   Cada dispositivo guarda una copia local CIFRADA con su PIN (AES-GCM, clave derivada
   con PBKDF2) para abrir rápido y sin internet. Lo que se anota queda en una cola, también
   cifrada, y se manda a la planilla cuando hay conexión. Nada de esto llega al repo.
   ========================================================================== */
(function () {
  'use strict';

  const COFRE = 'consultorio.cofre';      // { v, sal, iter, iv, ct }: db + conexión + cola, cifrados
  const INTENTOS = 'consultorio.intentos';
  const PERFIL = 'consultorio.perfil';     // { nombre, profesion }: no es dato de pacientes, va sin cifrar
  const ITER = 310000;                     // PBKDF2-SHA256
  const BLOQUEO_OCULTA = 5 * 60e3;         // se bloquea si quedó en segundo plano 5 min
  const BLOQUEO_QUIETA = 20 * 60e3;        // o 20 min sin tocar nada
  const XLSX_JS = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
  const JSZIP = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
  const QR = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
  const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const DIAS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
  const DIAS_LARGOS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const ASIST = { asistio: 'Asistió', falto: 'Faltó', aviso: 'Avisó' };
  const TIPOS_DOC = { propio: 'Mis informes', externo: 'De otros profesionales' };
  const MAX_MB = 25;              // por archivo (Apps Script recibe hasta ~50 MB por pedido)
  const FOTO_MAX = 2000;          // las fotos se achican a 2000 px de lado y JPEG 82 %
  const ROLES = ['Acompañante terapéutico', 'Psicopedagoga', 'Psicóloga', 'Gabinete escolar', 'Maestra', 'Escuela', 'Neurólogo/a', 'Fonoaudióloga', 'Terapista ocupacional', 'Pediatra', 'Otro'];
  const CAMPOS_INFORME = [
    ['nombre', 'Nombre y apellido'], ['apellido', 'Apellido'], ['nombres', 'Nombres'], ['dni', 'DNI'],
    ['fecha_nacimiento', 'Fecha de nacimiento'], ['edad', 'Edad en años y meses'], ['edad_anios', 'Edad en años'],
    ['obra_social', 'Obra social'], ['afiliado', 'N° de afiliado'], ['diagnostico', 'Diagnóstico'],
    ['escuela', 'Escuela'], ['grado', 'Grado o año'], ['responsables', 'Adultos responsables'], ['equipo', 'Equipo externo'],
    ['inicio_tratamiento', 'Primera sesión'], ['sesiones', 'Sesiones a las que asistió'], ['fecha', 'Fecha del informe'],
  ];

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const leerJSON = (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };

  const ICONOS = {
    buscar: '<path d="M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM15.5 15.5L20 20"/>',
    mas: '<path d="M12 5v14M5 12h14"/>', cerrar: '<path d="M6 6l12 12M18 6L6 18"/>',
    subir: '<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>', bajar: '<path d="M12 4v12M7 11l5 5 5-5M4 20h16"/>',
    copia: '<path d="M5 4h10l4 4v12H5zM14 4v5h5M9 14h6M9 17h4"/>', lapiz: '<path d="M4 20h4L19 9l-4-4L4 16zM13 7l4 4"/>',
    alerta: '<path d="M12 4l9 16H3zM12 10v4M12 17v.5"/>', tacho: '<path d="M5 7h14M9 7V4h6v3M7 7l1 13h8l1-13"/>',
    celular: '<path d="M7 3h10v18H7zM11 18h2"/>', persona: '<path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/>',
    sesion: '<path d="M4 6h16v14H4zM4 10h16M8 3v5M16 3v5M8 14h4"/>', informe: '<path d="M6 3h9l4 4v14H6zM14 3v5h5M9 12h7M9 15h7M9 18h4"/>',
    candado: '<path d="M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3"/>', carpeta: '<path d="M3 6h7l2 2h9v11H3z"/>',
    tel: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z"/>',
    wa: '<path d="M4 20l1.3-4A8 8 0 1 1 8 18.7zM9 9c0 3 3 6 6 6l1-1.5-2-1-1 1c-1-.5-2-1.5-2.5-2.5l1-1-1-2z"/>',
    mail: '<path d="M3 6h18v12H3zM3 6l9 7 9-7"/>', izq: '<path d="M15 5l-7 7 7 7"/>', der: '<path d="M9 5l7 7-7 7"/>',
    clip: '<path d="M16 7l-7.5 7.5a2 2 0 0 0 3 3L19 10a4 4 0 0 0-6-6l-7.5 7.5a6 6 0 0 0 8.5 8.5L20 14"/>',
    word: '<path d="M6 3h9l4 4v14H6zM14 3v5h5M8.5 12l1.2 5 1.3-4 1.3 4 1.2-5"/>',
  };
  const ic = (n) => `<svg class="ic" viewBox="0 0 24 24">${ICONOS[n]}</svg>`;

  /* ---------------------------------------------------------------- marca de la profesional */
  let perfil = Object.assign({ nombre: '', profesion: '' }, leerJSON(PERFIL) || {});
  const TITULOS = /^(lic|lic\.|licenciada|dra|dra\.|dr|dr\.|prof|prof\.|psp|psicop\.?)$/i;
  const palabras = (n) => String(n || '').trim().split(/\s+/).filter((w) => w && !TITULOS.test(w));
  const primerNombre = () => palabras(perfil.nombre)[0] || '';
  function iniciales(n) { const w = palabras(n); return ((w[0] || '')[0] || '') + ((w.length > 1 ? w[w.length - 1][0] : '') || ''); }
  function pintarMarca() {
    const ini = (iniciales(perfil.nombre) || 'C').toUpperCase();
    $$('[data-monograma]').forEach((el) => { el.textContent = ini; });
    const m = $('#marca-nombre'); if (m) m.textContent = perfil.nombre || 'Consultorio';
    const s = $('#marca-sub'); if (s) s.textContent = perfil.profesion || 'Consultorio';
  }
  function guardarPerfil(p, enviarlo) {
    perfil = { nombre: String(p.nombre || '').trim(), profesion: String(p.profesion || '').trim() };
    try { localStorage.setItem(PERFIL, JSON.stringify(perfil)); } catch (e) { /* sin lugar */ }
    if (enviarlo) enviar({ op: 'perfil', perfil });
    pintarMarca();
  }
  // Un color pastel fijo para cada paciente, para reconocerlo de un vistazo.
  function avatar(p, clase = '') {
    if (!p) return `<span class="av av-0 ${clase}">?</span>`;
    let h = 0; for (const c of String(p.id)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    const ini = ((p.nombre || '')[0] || '') + ((p.apellido || '')[0] || '');
    return `<span class="av av-${h % 6} ${clase}" aria-hidden="true">${esc(ini.toUpperCase() || '?')}</span>`;
  }

  /* ---------------------------------------------------------------- fechas */
  const dos = (n) => String(n).padStart(2, '0');
  const isoDe = (d) => `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`;
  const hoyISO = () => isoDe(new Date());
  const mesDe = (iso) => iso.slice(0, 7);
  const deISO = (iso) => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d); };
  const fmtDMY = (iso) => { if (!iso) return ''; const [y, m, d] = iso.split('-'); return `${d}/${m}/${y}`; };
  const fmtCorta = (iso) => { const d = deISO(iso); return `${d.getDate()} ${MESES[d.getMonth()].slice(0, 3)}${d.getFullYear() !== new Date().getFullYear() ? ` ${d.getFullYear()}` : ''}`; };
  const fmtDia = (iso) => { const d = deISO(iso); return `${DIAS[d.getDay()]} ${d.getDate()} ${MESES[d.getMonth()].slice(0, 3)}`; };
  const fmtLarga = (iso) => { const d = deISO(iso); return `${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`; };
  const fmtMes = (ym) => { const [y, m] = ym.split('-').map(Number); return `${MESES[m - 1]} ${y}`; };
  const sumarMes = (ym, n) => { const [y, m] = ym.split('-').map(Number); const d = new Date(y, m - 1 + n, 1); return `${d.getFullYear()}-${dos(d.getMonth() + 1)}`; };

  function edad(fn, al = hoyISO()) {
    if (!fn) return null;
    const [y, m, d] = fn.split('-').map(Number); const [y2, m2, d2] = al.split('-').map(Number);
    let meses = (y2 - y) * 12 + (m2 - m); if (d2 < d) meses--;
    return meses < 0 ? null : { a: Math.floor(meses / 12), m: meses % 12 };
  }
  const fmtEdad = (e) => !e ? '' : `${e.a} ${e.a === 1 ? 'año' : 'años'}`;
  const fmtEdadLarga = (e) => !e ? '' : `${fmtEdad(e)}${e.m ? ` y ${e.m} ${e.m === 1 ? 'mes' : 'meses'}` : ''}`;
  const fmtDNI = (d) => String(d || '').replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  /* ---------------------------------------------------------------- cofre (cifrado) */
  const te = new TextEncoder(), td = new TextDecoder();
  const aB64 = (buf) => { const u = new Uint8Array(buf); let s = ''; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); };
  const deB64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
  async function derivar(pin, sal, iter) {
    const base = await crypto.subtle.importKey('raw', te.encode(pin), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: sal, iterations: iter, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  }
  async function cifrar(obj, k, sal, iter) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, k, te.encode(JSON.stringify(obj)));
    return { v: 1, sal: aB64(sal), iter, iv: aB64(iv), ct: aB64(ct) };
  }
  async function descifrar(c, k) {
    const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: deB64(c.iv) }, k, deB64(c.ct));
    return JSON.parse(td.decode(pt));
  }

  // Estado en memoria: solo existe mientras la app está desbloqueada.
  let llave = null, sal = null;   // CryptoKey y sal del cofre
  let db = null, conexion = null, cola = [];

  function vacio() { return { pacientes: [], sesiones: [], documentos: [], plantillas: [], borrador: null, meta: { creado: new Date().toISOString(), respaldo: null } }; }
  let cadena = Promise.resolve();
  function guardar() {
    if (!llave) return cadena;
    const contenido = { db, conexion, cola }; const k = llave, s = sal;
    cadena = cadena.then(async () => {
      try { localStorage.setItem(COFRE, JSON.stringify(await cifrar(contenido, k, s, ITER))); }
      catch (e) { aviso('No se pudo guardar en este dispositivo. Guardá una copia desde Ajustes.'); }
    });
    return cadena;
  }
  let tGuardar;
  const guardarPronto = () => { clearTimeout(tGuardar); tGuardar = setTimeout(guardar, 700); };
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});

  /* ---------------------------------------------------------------- pantalla del PIN */
  const candado = document.createElement('div');
  candado.className = 'candado';
  document.body.appendChild(candado);

  function pantallaPIN() {
    document.body.classList.add('bloqueado');
    cerrarHoja();
    $('#vista').innerHTML = ''; $('#titulo').textContent = 'Consultorio'; document.title = 'Consultorio';
    $$('.toast').forEach((t) => t.remove());
    const hay = !!localStorage.getItem(COFRE);
    const sinCripto = !(window.crypto && crypto.subtle);
    candado.hidden = false;
    candado.innerHTML = `<form class="candado-caja" autocomplete="on">
      <span class="monograma grande" data-monograma></span>
      <h2>${esc(perfil.nombre || 'Consultorio')}</h2>
      ${sinCripto ? '<p class="nota">Este navegador no permite cifrar los datos. Abrí la app desde la dirección https:// o actualizá el navegador.</p>' : hay ? `
        <p class="tinta-2">Ingresá tu PIN para ver las fichas.</p>
        <input type="text" name="usuario" value="consultorio" autocomplete="username" hidden>
        <input class="entrada pin" id="pin" type="password" inputmode="numeric" autocomplete="current-password" aria-label="PIN" required>
        <p class="chico alerta-txt" id="pin-msj" role="status"></p>
        <button class="btn btn-oscuro btn-grande btn-bloque" id="pin-ok">Entrar</button>
        <button class="btn-texto chico" type="button" id="pin-letras">Mi clave tiene letras</button>
        <button class="btn-texto chico tenue" type="button" id="pin-olvido">Me olvidé el PIN</button>` : `
        <p class="tinta-2">Elegí un PIN de al menos 6 números (o una contraseña). Las fichas quedan cifradas en este dispositivo y sin el PIN no se pueden leer.</p>
        <input type="text" name="usuario" value="consultorio" autocomplete="username" hidden>
        <label class="campo"><span class="etq">PIN nuevo</span><input class="entrada pin" id="pin" type="password" inputmode="numeric" autocomplete="new-password" required></label>
        <label class="campo"><span class="etq">Repetilo</span><input class="entrada pin" id="pin2" type="password" inputmode="numeric" autocomplete="new-password" required></label>
        <p class="chico alerta-txt" id="pin-msj" role="status"></p>
        <button class="btn btn-oscuro btn-grande btn-bloque" id="pin-ok">Empezar</button>
        <button class="btn-texto chico" type="button" id="pin-letras">Prefiero una contraseña con letras</button>`}
    </form>`;
    pintarMarca();
    if (sinCripto) return;
    const form = $('form', candado), msj = $('#pin-msj', candado), ok = $('#pin-ok', candado);
    $('#pin-letras', candado).onclick = () => { $$('.pin', candado).forEach((i) => i.setAttribute('inputmode', 'text')); $('#pin', candado).focus(); };
    if ($('#pin-olvido', candado)) $('#pin-olvido', candado).onclick = olvidePIN;
    setTimeout(() => $('#pin', candado).focus(), 60);
    form.onsubmit = async (e) => {
      e.preventDefault();
      const pin = $('#pin', candado).value;
      msj.textContent = '';
      if (!hay) {
        if (pin.length < 6) { msj.textContent = 'Tiene que tener al menos 6 caracteres.'; return; }
        if (pin !== $('#pin2', candado).value) { msj.textContent = 'Los dos no coinciden.'; return; }
        ok.disabled = true; ok.textContent = 'Preparando…';
        sal = crypto.getRandomValues(new Uint8Array(16));
        llave = await derivar(pin, sal, ITER);
        db = vacio(); conexion = null; cola = [];
        await guardar();
        abrirApp();
        return;
      }
      const it = leerJSON(INTENTOS) || { n: 0, hasta: 0 };
      if (Date.now() < it.hasta) { msj.textContent = `Demasiados intentos. Esperá ${Math.ceil((it.hasta - Date.now()) / 1000)} segundos.`; return; }
      ok.disabled = true; ok.textContent = 'Abriendo…';
      try {
        const c = JSON.parse(localStorage.getItem(COFRE));
        const s = deB64(c.sal); const k = await derivar(pin, s, c.iter || ITER);
        const d = await descifrar(c, k);
        llave = k; sal = s; db = Object.assign(vacio(), d.db); conexion = d.conexion || null; cola = d.cola || [];
        localStorage.removeItem(INTENTOS);
        abrirApp();
      } catch (err) {
        it.n++; if (it.n >= 5) it.hasta = Date.now() + 30e3 * 2 ** (it.n - 5);
        try { localStorage.setItem(INTENTOS, JSON.stringify(it)); } catch (e2) { /* sin lugar */ }
        msj.textContent = it.n >= 5 ? `PIN incorrecto. Esperá ${Math.round((it.hasta - Date.now()) / 1000)} segundos.` : 'PIN incorrecto.';
        ok.disabled = false; ok.textContent = 'Entrar';
        $('#pin', candado).select();
      }
    };
  }

  function olvidePIN() {
    candado.innerHTML = `<div class="candado-caja">
      <h2>Me olvidé el PIN</h2>
      <p class="tinta-2">Sin el PIN, las fichas de este dispositivo no se pueden abrir. Se borran de acá y elegís un PIN nuevo.</p>
      <p class="tinta-2">Si la app estaba conectada a la planilla de Google, no se pierde nada: después volvés a conectarla (en la planilla, menú <b>Consultorio → Ver datos de conexión</b>) y se baja todo de nuevo. Lo que no llegó a la planilla sí se pierde.</p>
      <button class="btn btn-peligro btn-grande btn-bloque" id="olv-ok">Borrar este dispositivo</button>
      <button class="btn btn-grande btn-bloque" id="olv-no">Volver</button>
    </div>`;
    $('#olv-no', candado).onclick = pantallaPIN;
    $('#olv-ok', candado).onclick = () => { localStorage.removeItem(COFRE); localStorage.removeItem(INTENTOS); pantallaPIN(); };
  }

  function bloquear() {
    if (!llave) return;
    clearTimeout(tGuardar);
    guardar().then(() => { llave = null; sal = null; db = null; conexion = null; cola = []; pantallaPIN(); });
  }
  function abrirApp() {
    candado.hidden = true; candado.innerHTML = '';
    document.body.classList.remove('bloqueado');
    tocado = Date.now();
    pintarMarca(); render(); pintarSync(conexion ? 'ok' : ''); sincronizar();
    if (!perfil.nombre) setTimeout(() => { if (!hojaAbierta) hojaPerfil(); }, 400);
  }
  let tocado = Date.now(), ocultaDesde = 0;
  ['pointerdown', 'keydown'].forEach((ev) => document.addEventListener(ev, () => { tocado = Date.now(); }, true));
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { ocultaDesde = Date.now(); if (llave) guardar(); return; }
    if (llave && ocultaDesde && Date.now() - ocultaDesde > BLOQUEO_OCULTA) { bloquear(); return; }
    sincronizar();
  });
  setInterval(() => { if (llave && Date.now() - tocado > BLOQUEO_QUIETA) bloquear(); }, 30e3);

  /* ---------------------------------------------------------------- datos */
  const paciente = (id) => db.pacientes.find((p) => p.id === id);
  const nombreCompleto = (p) => [p.nombre, p.apellido].filter(Boolean).join(' ');
  const nombreLista = (p) => [p.apellido, p.nombre].filter(Boolean).join(', ') || 'Sin nombre';
  const sesionesDe = (pid) => db.sesiones.filter((s) => s.pid === pid).sort((a, b) => b.fecha.localeCompare(a.fecha) || String(b.creado).localeCompare(String(a.creado)));
  const validas = (lista) => lista.filter((s) => !s.anulada);
  const ultimaSesion = (pid) => validas(sesionesDe(pid)).find((s) => s.estado === 'asistio');
  const documentosDe = (pid) => db.documentos.filter((d) => d.pid === pid && !d.anulado).sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)) || String(b.creado).localeCompare(String(a.creado)));
  const fmtTam = (b) => !b ? '' : b < 1024 * 1024 ? `${Math.max(1, Math.round(b / 1024))} KB` : `${(b / 1024 / 1024).toFixed(1).replace('.', ',')} MB`;
  const fmtGB = (b) => `${(b / 1024 ** 3).toFixed(1).replace('.', ',')} GB`;
  const ordenNombre = (a, b) => nombreLista(a).localeCompare(nombreLista(b), 'es');

  function guardarPaciente(p) {
    const i = db.pacientes.findIndex((x) => x.id === p.id);
    if (i >= 0) db.pacientes[i] = p; else db.pacientes.push(p);
    enviar({ op: 'paciente', p: datosPaciente(p) });
    guardar();
  }
  function datosPaciente(p) {
    const { id, apellido, nombre, dni, fn, os, afiliado, dx, escuela, grado, tutores, equipo, obs, estado, alta, revisar, creado } = p;
    return { id, apellido, nombre, dni, fn, os, afiliado, dx, escuela, grado, tutores, equipo, obs, estado, alta, revisar, creado };
  }
  function guardarSesion(s) {
    const p = paciente(s.pid);
    Object.assign(s, { paciente: p ? nombreLista(p) : '', os: p ? p.os : '' });
    const i = db.sesiones.findIndex((x) => x.id === s.id);
    if (i >= 0) db.sesiones[i] = s; else db.sesiones.push(s);
    enviar({ op: 'sesion', s });
    guardar();
  }

  /* ------------------------------------------------ planilla de Google */
  let version = 0, sincronizando = false, estadoSync = '', reintento;
  function enviar(op) {
    if (!conexion) return;
    cola.push(op); version++;
    sincronizar();
  }
  async function llamar(cx, cuerpo) {
    const r = await fetch(cx.url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ clave: cx.clave, ...cuerpo }) });
    let j; try { j = await r.json(); } catch (e) { throw new Error('La dirección no responde como la planilla. Revisá que esté bien copiada.'); }
    if (!j.ok) throw new Error(j.error || 'Error de la planilla');
    return j;
  }
  async function sincronizar() {
    if (!llave || !conexion || sincronizando) return;
    sincronizando = true; clearTimeout(reintento);
    pintarSync(cola.length ? 'guardando' : estadoSync);
    const cx = conexion;
    try {
      for (;;) {
        const lote = cola.slice(0, 40); const v0 = version;
        const r = await llamar(cx, { ops: lote, estado: cola.length <= 40 });
        if (!llave || conexion !== cx) return; // se bloqueó o se desconectó mientras tanto
        cola.splice(0, lote.length); guardar();
        if (cola.length) continue;
        if (r.pacientes && version === v0) aplicarEstado(r);
        break;
      }
      pintarSync('ok');
    } catch (e) {
      pintarSync(e.message === 'Clave incorrecta' ? 'clave' : 'error');
      reintento = setTimeout(sincronizar, 30000);
    } finally { sincronizando = false; }
  }
  function aplicarEstado(r) {
    db.pacientes = r.pacientes; db.sesiones = r.sesiones; db.documentos = r.documentos || []; db.plantillas = r.plantillas || [];
    if (r.perfil && r.perfil.nombre && r.perfil.nombre !== perfil.nombre) guardarPerfil(r.perfil, false);
    Object.assign(db.meta, { planilla: r.planilla, carpeta: r.carpeta, carpetaPlantillas: r.carpetaPlantillas, espacio: r.espacio || null, sincro: new Date().toISOString() });
    guardar();
    const ocupado = hojaAbierta || (document.activeElement && /INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName));
    if (!ocupado) render();
  }
  function pintarSync(e) {
    estadoSync = e;
    const el = $('#sync'); if (!el) return;
    el.hidden = !conexion || !llave;
    const txt = { ok: 'Al día', guardando: 'Guardando…', error: `Sin conexión${cola.length ? ` · ${cola.length} sin enviar` : ''}`, clave: 'Clave incorrecta' }[e] || '';
    el.textContent = txt; el.className = `sync sync-${e}`;
  }
  window.addEventListener('online', sincronizar);
  setInterval(() => { if (!document.hidden) sincronizar(); }, 60000);

  const linkConexion = () => `${location.origin}${location.pathname}#/conectar/${btoa(JSON.stringify({ u: conexion.url, k: conexion.clave })).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_')}`;

  function hojaConectar(pre) {
    abrirHoja(`
      <div class="fila entre"><h3>Conectar con la planilla</h3><button class="cerrar" data-cerrar>${ic('cerrar')}</button></div>
      <p class="chico tenue">En la planilla de Google, menú <b>Consultorio → Ver datos de conexión</b>. Copiá la dirección y la clave.</p>
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
          const locales = (db.pacientes.length || db.sesiones.length) && !conexion ? { pacientes: db.pacientes, sesiones: db.sesiones } : null;
          conexion = cx; cola = [];
          cerrar();
          if (locales && !r.pacientes.length) {
            // Planilla nueva y datos en este dispositivo: se suben.
            locales.pacientes.forEach((p) => cola.push({ op: 'paciente', p: datosPaciente(p) }));
            locales.sesiones.forEach((s) => cola.push({ op: 'sesion', s }));
            version++; guardar(); sincronizar();
            aviso(`Conectado. Subiendo ${locales.pacientes.length} pacientes a la planilla…`);
          } else {
            aplicarEstado(r);
            aviso(r.pacientes.length ? `Conectado: ${r.pacientes.length} pacientes en la planilla.` : 'Conectado. La planilla está vacía: importá tu Word o cargá un paciente.');
          }
          if (perfil.nombre && !(r.perfil && r.perfil.nombre)) enviar({ op: 'perfil', perfil });
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
    confirmar('Desconectar este dispositivo', `${pend ? `<b>Hay ${pend} cambio(s) que todavía no llegaron a la planilla y se van a perder.</b> ` : ''}Se borran las fichas de este dispositivo. La planilla y los otros dispositivos no cambian.`, 'Desconectar', () => {
      conexion = null; cola = []; db = vacio(); guardar(); pintarSync(''); ir('#/');
    });
  }

  function hojaCompartir() {
    const link = linkConexion();
    abrirHoja(`
      <div class="fila entre"><h3>Abrir en otro dispositivo</h3><button class="cerrar" data-cerrar>${ic('cerrar')}</button></div>
      <p class="chico">Escaneá este código con la cámara del celular (o abrí el link en la compu). En ese dispositivo elegís un PIN y queda conectado a la misma planilla.</p>
      <div id="qr" style="align-self:center;background:#fff;padding:12px;border:1px solid var(--linea)"></div>
      <div class="fila"><input class="entrada mono chico" value="${esc(link)}" readonly id="cx-link"><button class="btn" data-copiar>Copiar</button></div>
      <p class="nota">Este link da acceso a todas las fichas: no lo mandes por WhatsApp ni se lo pases a nadie. Usalo solo en tus dispositivos.</p>`, (hoja) => {
      cargarScript(QR).then(() => { new QRCode($('#qr', hoja), { text: link, width: 220, height: 220, correctLevel: QRCode.CorrectLevel.M }); })
        .catch(() => { $('#qr', hoja).textContent = 'No se pudo generar el código. Usá el link.'; });
      $('[data-copiar]', hoja).onclick = async () => {
        try { await navigator.clipboard.writeText(link); aviso('Link copiado.'); } catch (e) { $('#cx-link', hoja).select(); }
      };
    });
  }

  /* ------------------------------------------------------------ importar el Word */
  async function importarWord(file) {
    if (!/\.docx$/i.test(file.name)) { aviso('Tiene que ser un .docx. Si es un .doc viejo, abrilo en Word y guardalo como .docx.'); return; }
    try {
      await cargarScript(JSZIP);
      const zip = await JSZip.loadAsync(await file.arrayBuffer());
      const doc = zip.file('word/document.xml');
      if (!doc) throw new Error('No parece un documento de Word.');
      const { pacientes } = window.leerFichasWord(await doc.async('string'));
      if (!pacientes.length) throw new Error('No encontré fichas en el Word. Tiene que tener una tabla con un paciente por fila.');
      const dnis = new Set(db.pacientes.map((p) => p.dni).filter(Boolean));
      const nuevos = pacientes.filter((p) => !p.dni || !dnis.has(p.dni));
      const repetidos = pacientes.length - nuevos.length;
      const aRevisar = nuevos.filter((p) => p.revisar.length).length;
      abrirHoja(`
        <div class="fila entre"><h3>Importar el Word</h3><button class="cerrar" data-cerrar>${ic('cerrar')}</button></div>
        <p>Encontré <b>${pacientes.length} pacientes</b> en <span class="mono chico">${esc(file.name)}</span>.</p>
        ${repetidos ? `<p class="chico tinta-2">${repetidos} ya estaban cargados (mismo DNI) y no se tocan.</p>` : ''}
        ${aRevisar ? `<div class="nota">${aRevisar} tienen algo para revisar (por ejemplo, la edad no coincide con la fecha de nacimiento). Quedan marcados en <b>Pacientes → Para revisar</b>.</div>` : ''}
        <ul class="lista caja lista-chica">${nuevos.slice(0, 60).map((p) => `<li class="item"><span class="txt"><span class="nom">${esc(nombreLista(p))}</span><span class="sub">${esc([fmtEdad(edad(p.fn)), p.os, p.dx.join(' · ')].filter(Boolean).join(' · '))}</span></span>${p.revisar.length ? `<span class="badge b-aviso">revisar</span>` : ''}</li>`).join('')}</ul>
        <button class="btn btn-oscuro btn-grande btn-bloque" data-ok ${nuevos.length ? '' : 'disabled'}>Importar ${nuevos.length} pacientes</button>`, (hoja, cerrar) => {
        $('[data-ok]', hoja).onclick = () => {
          const ahora = new Date().toISOString();
          for (const p of nuevos) guardarPaciente(Object.assign(p, { id: uid(), estado: 'activo', alta: '', creado: ahora }));
          db.meta.archivo = file.name; guardar();
          cerrar(); ir('#/pacientes'); aviso(`Listo: ${nuevos.length} pacientes cargados.`);
        };
      });
    } catch (e) { aviso(e.message === 'script' ? 'No se pudo cargar el lector de Word. Revisá la conexión.' : e.message || 'No se pudo leer el Word.'); }
  }

  /* ------------------------------------------------------------ exportar y copias */
  const fechaArchivo = () => hoyISO();
  async function exportarExcel(mes) {
    try { await cargarScript(XLSX_JS); } catch (e) { aviso('Falta cargar el lector de Excel. Revisá la conexión.'); return; }
    const pac = [...db.pacientes].sort(ordenNombre).map((p) => [p.apellido, p.nombre, p.dni, fmtDMY(p.fn), fmtEdad(edad(p.fn)), p.os, p.afiliado, (p.dx || []).join('. '), p.escuela, p.grado, p.tutores, (p.equipo || []).map((e) => [e.rol, e.nombre, e.contacto].filter(Boolean).join(' · ')).join('\n'), p.estado === 'alta' ? 'Alta' : 'Activo']);
    const ses = validas(db.sesiones).filter((s) => !mes || mesDe(s.fecha) === mes).sort((a, b) => a.fecha.localeCompare(b.fecha)).map((s) => {
      const p = paciente(s.pid) || {};
      return [fmtDMY(s.fecha), p.apellido ? nombreLista(p) : s.paciente, p.os || s.os || '', p.afiliado || '', ASIST[s.estado] || s.estado, s.nota || ''];
    });
    const libro = XLSX.utils.book_new();
    const h1 = XLSX.utils.aoa_to_sheet([['APELLIDO', 'NOMBRE', 'DNI', 'FECHA NAC.', 'EDAD', 'OBRA SOCIAL', 'N° AFILIADO', 'DIAGNÓSTICO', 'ESCUELA', 'GRADO', 'ADULTOS RESPONSABLES', 'EQUIPO', 'ESTADO'], ...pac]);
    h1['!cols'] = [18, 20, 11, 11, 8, 11, 15, 35, 35, 15, 25, 40, 8].map((wch) => ({ wch }));
    const h2 = XLSX.utils.aoa_to_sheet([['FECHA', 'PACIENTE', 'OBRA SOCIAL', 'N° AFILIADO', 'ASISTENCIA', 'NOTA'], ...ses]);
    h2['!cols'] = [11, 30, 11, 15, 10, 70].map((wch) => ({ wch }));
    XLSX.utils.book_append_sheet(libro, h2, mes ? `Sesiones ${mes}` : 'Sesiones');
    if (!mes) XLSX.utils.book_append_sheet(libro, h1, 'Pacientes');
    const datos = XLSX.write(libro, { bookType: 'xlsx', type: 'array' });
    entregar(new Blob([datos], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), mes ? `sesiones-${mes}.xlsx` : `consultorio-${fechaArchivo()}.xlsx`);
  }
  // La copia sale cifrada con el PIN actual: sin el PIN no se puede abrir.
  async function guardarCopia() {
    const c = await cifrar({ pacientes: db.pacientes, sesiones: db.sesiones, documentos: db.documentos }, llave, sal, ITER);
    const blob = new Blob([JSON.stringify({ app: 'consultorio', ...c })], { type: 'application/json' });
    if (await entregar(blob, `consultorio-copia-${fechaArchivo()}.json`)) { db.meta.respaldo = new Date().toISOString(); guardar(); render(); }
  }
  async function recuperarCopia(file) {
    let c; try { c = JSON.parse(await file.text()); if (c.app !== 'consultorio' || !c.ct) throw new Error(); } catch (e) { aviso('Ese archivo no es una copia de esta app.'); return; }
    abrirHoja(`
      <div class="fila entre"><h3>Recuperar copia</h3><button class="cerrar" data-cerrar>${ic('cerrar')}</button></div>
      <p class="chico">La copia está protegida con el PIN que tenías cuando la guardaste.</p>
      <label class="campo"><span class="etq">PIN de la copia</span><input class="entrada" id="rc-pin" type="password" autocomplete="off"></label>
      <p class="chico alerta-txt" id="rc-msj" role="status"></p>
      <div class="nota">Esto reemplaza todo lo que hay cargado ahora${conexion ? ' en la planilla' : ' en este dispositivo'}.</div>
      <button class="btn btn-oscuro btn-grande btn-bloque" data-ok>Recuperar</button>`, (hoja, cerrar) => {
      $('[data-ok]', hoja).onclick = async () => {
        try {
          const k = await derivar($('#rc-pin', hoja).value, deB64(c.sal), c.iter || ITER);
          const d = await descifrar(c, k);
          db.pacientes = d.pacientes || []; db.sesiones = d.sesiones || []; db.documentos = d.documentos || [];
          db.pacientes.forEach((p) => enviar({ op: 'paciente', p: datosPaciente(p) }));
          db.sesiones.forEach((s) => enviar({ op: 'sesion', s }));
          guardar(); cerrar(); ir('#/'); aviso(`Copia recuperada: ${db.pacientes.length} pacientes.`);
        } catch (e) { $('#rc-msj', hoja).textContent = 'PIN incorrecto.'; }
      };
    });
  }
  // En el celular abre "Compartir"; en la compu descarga el archivo.
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
  const filtros = { q: '', estado: 'activos', mes: null };
  const mqPC = matchMedia('(min-width: 960px)');
  const esPC = () => mqPC.matches;
  mqPC.addEventListener('change', () => render());

  function ir(h) { if (location.hash === h) render(); else location.hash = h; }
  window.addEventListener('hashchange', () => { render(); window.scrollTo(0, 0); });

  function render() {
    if (!llave) return;
    const h = location.hash.replace(/^#/, '') || '/';
    const partes = h.split('/').filter(Boolean);
    ruta = partes[0] || 'inicio';
    const activa = ruta === 'p' ? 'pacientes' : ruta;
    $$('.barra [data-ruta]').forEach((a) => a.classList.toggle('activo', a.dataset.ruta === activa));
    const conVolver = ruta === 'p' && !esPC();
    $('#volver').hidden = !conVolver; $('#logo').style.display = conVolver ? 'none' : '';
    pintarMarca();
    if (ruta === 'pacientes') return vPacientes(partes[1]);
    if (ruta === 'p') return vFicha(partes[1]);
    if (ruta === 'sesiones') return vSesiones(partes[1]);
    if (ruta === 'ajustes') return vAjustes();
    if (ruta === 'conectar') { let pre = null; try { pre = JSON.parse(atob((partes[1] || '').replace(/-/g, '+').replace(/_/g, '/'))); } catch (e) { /* link roto */ } history.replaceState(null, '', '#/'); vInicio(); hojaConectar(pre); return; }
    return vInicio();
  }
  function titulo(t) { const casa = perfil.nombre || 'Consultorio'; $('#titulo').textContent = t === 'Inicio' ? casa : t; document.title = t === 'Inicio' ? casa : `${t} · ${casa}`; }

  const activos = () => db.pacientes.filter((p) => p.estado !== 'alta');
  const paraRevisar = () => db.pacientes.filter((p) => (p.revisar || []).length);
  function buscar(lista, q) {
    const t = norm(q).trim().split(/\s+/).filter(Boolean);
    if (!t.length) return lista;
    return lista.filter((p) => { const h = norm(`${p.apellido} ${p.nombre} ${p.dni} ${p.escuela} ${(p.dx || []).join(' ')}`); return t.every((x) => h.includes(x)); });
  }

  function vInicio() {
    titulo('Inicio');
    if (!db.pacientes.length) {
      vista.innerHTML = `
        <section class="caja bienvenida">
          ${conexion ? '<span class="etq">Planilla conectada</span>' : '<span class="etq">Para empezar</span>'}
          <h2>Cargá tus pacientes</h2>
          <p>Importá el Word donde tenés las fichas: la app separa los datos de cada paciente y calcula la edad sola. También podés cargarlos de a uno.</p>
          <button class="btn btn-oscuro btn-grande" data-accion="importar">${ic('word')}Importar mi Word</button>
          <button class="btn btn-grande" data-accion="nuevo-paciente">${ic('persona')}Cargar un paciente</button>
          ${conexion ? '' : `<p class="chico tenue">Para usarla en la compu y en el celular, y que quede guardado en tu Google, primero <button class="btn-texto" data-accion="conectar">conectá la planilla</button>.</p>`}
        </section>`;
      return;
    }
    const mes = mesDe(hoyISO());
    const delMes = validas(db.sesiones).filter((s) => mesDe(s.fecha) === mes);
    const asistidas = delMes.filter((s) => s.estado === 'asistio').length;
    const faltas = delMes.length - asistidas;
    const deHoy = validas(db.sesiones).filter((s) => s.fecha === hoyISO());
    const ultimas = validas(db.sesiones).sort((a, b) => b.fecha.localeCompare(a.fecha) || String(b.creado).localeCompare(String(a.creado))).slice(0, 8);
    const rev = paraRevisar().length;
    const hora = new Date().getHours();
    const saludo = hora < 13 ? 'Buen día' : hora < 20 ? 'Buenas tardes' : 'Buenas noches';
    const fechaHoy = fmtLarga(hoyISO());
    vista.innerHTML = `
      <div class="saludo"><span class="etq">${DIAS_LARGOS[new Date().getDay()]} ${fechaHoy}</span><h2>${saludo}${primerNombre() ? `, ${esc(primerNombre())}` : ''}</h2></div>
      <div class="buscador">${ic('buscar')}<input class="entrada" id="q-inicio" type="search" placeholder="Buscar paciente por nombre, DNI o escuela" autocomplete="off"></div>
      <ul class="lista caja" id="res-inicio" hidden></ul>
      <div class="tareas">
        <button class="tarea" data-accion="sesion"><span class="tarea-ic mas">${ic('sesion')}</span><span class="tarea-txt"><b>Anotar sesión</b><span>Asistencia y nota de evolución</span></span></button>
        <button class="tarea" data-accion="nuevo-paciente"><span class="tarea-ic menos">${ic('persona')}</span><span class="tarea-txt"><b>Paciente nuevo</b><span>Cargar la ficha</span></span></button>
      </div>
      <div class="tablero">
        <a class="cuadro" href="#/pacientes"><span class="etq">Pacientes</span><b>${activos().length}</b><span class="chico">activos</span></a>
        <a class="cuadro" href="#/sesiones"><span class="etq">Sesiones</span><b>${asistidas}</b><span class="chico">en ${MESES[+mes.slice(5) - 1]}</span></a>
        <a class="cuadro${faltas ? ' aviso' : ''}" href="#/sesiones"><span class="etq">Faltas</span><b>${faltas}</b><span class="chico">en ${MESES[+mes.slice(5) - 1]}</span></a>
        <a class="cuadro${rev ? ' aviso' : ''}" href="#/pacientes/revisar"><span class="etq">Para revisar</span><b>${rev}</b><span class="chico">fichas</span></a>
      </div>
      <div class="dos-col">
        <section class="caja">
          <div class="caja-cab"><span class="etq">Hoy · ${fmtDia(hoyISO())}</span><button class="btn-texto chico" data-accion="sesion">${ic('mas')}Anotar</button></div>
          ${deHoy.length ? `<ul class="lista">${deHoy.map((s) => sesionHTML(s, true)).join('')}</ul>` : '<p class="vacio chico">Todavía no anotaste sesiones hoy.</p>'}
        </section>
        <section class="caja">
          <div class="caja-cab"><span class="etq">Últimas sesiones</span><a class="btn-texto chico" href="#/sesiones">Ver todas</a></div>
          ${ultimas.length ? `<ul class="lista">${ultimas.map((s) => sesionHTML(s, true)).join('')}</ul>` : '<p class="vacio chico">Cuando anotes sesiones, aparecen acá.</p>'}
        </section>
      </div>
      ${!conexion ? `<div class="nota">Las fichas están guardadas solo en este dispositivo. <button class="btn-texto" data-accion="conectar">Conectá la planilla</button> para tenerlas en tu Google y en el celular.</div>`
        : ''}`;
    const q = $('#q-inicio'), res = $('#res-inicio');
    q.addEventListener('input', () => {
      const r = q.value.trim() ? buscar(db.pacientes, q.value).sort(ordenNombre).slice(0, 8) : [];
      res.hidden = !q.value.trim();
      res.innerHTML = r.length ? r.map(itemPaciente).join('') : '<li class="vacio chico">No hay pacientes con ese nombre.</li>';
    });
    q.addEventListener('keydown', (e) => { if (e.key === 'Enter') { const a = $('a.item', res); if (a) a.click(); } });
  }

  function itemPaciente(p) {
    const e = edad(p.fn);
    return `<li><a class="item" href="#/p/${p.id}">${avatar(p)}<span class="txt"><span class="nom">${esc(nombreLista(p))}</span>
      <span class="sub">${esc([fmtEdad(e), p.os, (p.dx || [])[0]].filter(Boolean).join(' · '))}</span></span>
      ${(p.revisar || []).length ? '<span class="badge b-aviso">revisar</span>' : p.estado === 'alta' ? '<span class="badge">alta</span>' : ''}</a></li>`;
  }

  function vPacientes(estado) {
    titulo('Pacientes');
    filtros.estado = ['alta', 'revisar', 'todos'].includes(estado) ? estado : 'activos';
    const cuenta = { activos: activos().length, revisar: paraRevisar().length, alta: db.pacientes.length - activos().length, todos: db.pacientes.length };
    const chip = (k, t) => `<a class="chip${filtros.estado === k ? ' si' : ''}" href="#/pacientes${k === 'activos' ? '' : `/${k}`}">${t}<span class="n">${cuenta[k]}</span></a>`;
    vista.innerHTML = `
      <div class="fila entre"><div class="buscador" style="flex:1">${ic('buscar')}<input class="entrada" id="q" type="search" placeholder="Nombre, DNI, escuela o diagnóstico" value="${esc(filtros.q)}" autocomplete="off"></div>
        <button class="btn solo-pc" data-accion="nuevo-paciente">${ic('mas')}Paciente nuevo</button></div>
      <div class="chips">${chip('activos', 'Activos')}${cuenta.revisar ? chip('revisar', 'Para revisar') : ''}${chip('alta', 'De alta')}${chip('todos', 'Todos')}</div>
      <section class="caja" id="resultado"></section>
      <button class="btn btn-bloque solo-cel" data-accion="nuevo-paciente">${ic('mas')}Paciente nuevo</button>`;
    const pintar = () => {
      let lista = filtros.estado === 'activos' ? activos() : filtros.estado === 'alta' ? db.pacientes.filter((p) => p.estado === 'alta') : filtros.estado === 'revisar' ? paraRevisar() : db.pacientes;
      lista = buscar(lista, filtros.q).sort(ordenNombre);
      const el = $('#resultado');
      if (!lista.length) { el.innerHTML = `<p class="vacio">${filtros.q ? 'No hay pacientes con esa búsqueda.' : 'No hay pacientes acá.'}</p>`; return; }
      if (!esPC()) { el.innerHTML = `<ul class="lista">${lista.map(itemPaciente).join('')}</ul>`; return; }
      el.innerHTML = `<table class="tabla"><thead><tr><th>Paciente</th><th>Edad</th><th>Obra social</th><th>Diagnóstico</th><th>Escuela</th><th>Última sesión</th></tr></thead><tbody>
        ${lista.map((p) => { const u = ultimaSesion(p.id); return `<tr data-pid="${p.id}"><td class="nom">${avatar(p)}${esc(nombreLista(p))} ${(p.revisar || []).length ? '<span class="badge b-aviso">revisar</span>' : ''}</td><td class="mono">${esc(fmtEdad(edad(p.fn)))}</td><td>${esc(p.os || '')}</td><td>${esc((p.dx || []).join(' · '))}</td><td>${esc([p.escuela, p.grado].filter(Boolean).join(' · '))}</td><td class="mono">${u ? fmtCorta(u.fecha) : '<span class="tenue">—</span>'}</td></tr>`; }).join('')}
      </tbody></table>`;
    };
    pintar();
    $('#q').addEventListener('input', (e) => { filtros.q = e.target.value; pintar(); });
    $('#resultado').addEventListener('click', (e) => { const tr = e.target.closest('tr[data-pid]'); if (tr) ir(`#/p/${tr.dataset.pid}`); });
  }

  /* ------------------------------------------------------------ ficha */
  function telLinks(contacto) {
    const c = String(contacto || '');
    if (/@/.test(c)) return `<a class="btn btn-chico" href="mailto:${esc(c)}" aria-label="Mandar mail">${ic('mail')}</a>`;
    let d = c.replace(/\D/g, '');
    if (d.length < 8) return '';
    if (d.startsWith('0')) d = d.slice(1);
    const wa = d.startsWith('54') ? d : `549${d}`;
    return `<a class="btn btn-chico" href="tel:+${d.startsWith('54') ? d : `54${d}`}" aria-label="Llamar">${ic('tel')}</a><a class="btn btn-chico" href="https://wa.me/${wa}" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">${ic('wa')}</a>`;
  }
  function dato(et, v) { return v ? `<div class="dato"><span class="etq">${et}</span><span>${v}</span></div>` : ''; }

  function vFicha(id) {
    const p = paciente(id);
    if (!p) { titulo('Paciente'); vista.innerHTML = '<p class="vacio">No encontré ese paciente.</p>'; return; }
    titulo(nombreLista(p));
    vista.dataset.pid = p.id;
    const e = edad(p.fn);
    const ses = sesionesDe(p.id);
    const asist = validas(ses).filter((s) => s.estado === 'asistio');
    const docs = documentosDe(p.id);
    vista.innerHTML = `<div class="ficha">
      <div class="ficha-cab">${avatar(p, 'grande')}<div class="pila">
        <span class="etq">${esc(p.os || 'Paciente')}${p.estado === 'alta' ? ` · alta${p.alta ? ` ${fmtDMY(p.alta)}` : ''}` : ''}</span>
        <h2>${esc(nombreLista(p))}</h2>
        <p class="tinta-2">${esc([fmtEdadLarga(e), p.dni ? `DNI ${fmtDNI(p.dni)}` : ''].filter(Boolean).join(' · ')) || 'Faltan datos'}</p>
        ${(p.dx || []).length ? `<div class="fila" style="flex-wrap:wrap;gap:6px">${p.dx.map((d) => `<span class="badge b-dx">${esc(d)}</span>`).join('')}</div>` : ''}
      </div></div>
      ${(p.revisar || []).length ? `<div class="nota pila"><b>Para revisar</b><ul class="sin-vinetas">${p.revisar.map((r) => `<li>${esc(r)}</li>`).join('')}</ul><div class="fila"><button class="btn btn-chico" data-accion="editar">${ic('lapiz')}Corregir</button><button class="btn btn-chico" data-accion="revisado">Ya está bien</button></div></div>` : ''}
      <div class="acciones">
        <button class="btn btn-acento btn-grande" data-accion="sesion">${ic('sesion')}Anotar sesión</button>
        <button class="btn btn-grande" data-accion="subir">${ic('clip')}Subir documento</button>
      </div>
      <div class="ficha-grid">
        <div class="pila">
          <section class="caja">
            <div class="caja-cab"><span class="etq">Datos</span><button class="btn-texto chico" data-accion="editar">${ic('lapiz')}Editar</button></div>
            <div class="caja-cuerpo datos">
              ${dato('Fecha de nacimiento', p.fn ? `${fmtDMY(p.fn)} <span class="tenue">(${esc(fmtEdadLarga(e))})</span>` : '')}
              ${dato('Obra social', esc([p.os, p.afiliado ? `N° ${p.afiliado}` : ''].filter(Boolean).join(' · ')))}
              ${dato('Escuela', esc([p.escuela, p.grado].filter(Boolean).join(' · ')))}
              ${dato('Adultos responsables', esc(p.tutores || '').replace(/\n/g, '<br>'))}
              ${dato('Observaciones', esc(p.obs || '').replace(/\n/g, '<br>'))}
              ${!p.fn && !p.os && !p.escuela && !p.tutores ? '<p class="tenue chico">Sin datos todavía.</p>' : ''}
            </div>
          </section>
          <section class="caja">
            <div class="caja-cab"><span class="etq">Equipo y contactos</span><button class="btn-texto chico" data-accion="editar">${ic('lapiz')}Editar</button></div>
            ${(p.equipo || []).length ? `<ul class="lista">${p.equipo.map((c) => `<li class="contacto"><span class="txt"><span class="nom">${esc(c.nombre || c.rol)}</span><span class="sub">${esc([c.nombre ? c.rol : '', c.contacto].filter(Boolean).join(' · '))}</span></span><span class="fila">${telLinks(c.contacto)}</span></li>`).join('')}</ul>` : '<p class="vacio chico">Sin contactos cargados.</p>'}
          </section>
          ${['propio', 'externo'].map((t) => { const l = docs.filter((d) => d.tipo === t); return `<section class="caja">
            <div class="caja-cab"><span class="etq">${TIPOS_DOC[t]}</span><button class="btn-texto chico" data-accion="subir" data-tipo="${t}">${ic('mas')}Subir</button></div>
            ${l.length ? `<ul class="lista">${l.map(docHTML).join('')}</ul>` : `<p class="vacio chico">${t === 'propio' ? 'Todavía no subiste informes tuyos.' : 'Acá van los informes del neurólogo, la escuela, la fonoaudióloga…'}</p>`}
            ${t === 'propio' && conexion && db.plantillas.length ? `<div class="caja-cuerpo borde-arriba"><button class="btn-texto chico" data-accion="informe">${ic('informe')}Empezar uno en Google Docs con los datos de la ficha</button></div>` : ''}
          </section>`; }).join('')}
        </div>
        <section class="caja">
          <div class="caja-cab"><span class="etq">Sesiones · ${asist.length} ${asist.length === 1 ? 'asistida' : 'asistidas'}</span><button class="btn-texto chico" data-accion="sesion">${ic('mas')}Anotar</button></div>
          ${ses.length ? `<ul class="lista">${ses.map((s) => sesionHTML(s, false)).join('')}</ul>` : '<p class="vacio chico">Todavía no hay sesiones anotadas.</p>'}
        </section>
      </div>
      <div class="fila" style="flex-wrap:wrap">
        ${p.estado === 'alta' ? `<button class="btn btn-chico" data-accion="reactivar">Volver a activo</button>` : `<button class="btn btn-chico" data-accion="alta">Dar de alta</button>`}
      </div>
    </div>`;
  }

  function docHTML(d) {
    const foto = /^image\//.test(d.mime || '') || /\.(jpe?g|png|heic|webp)$/i.test(d.archivo || '');
    return `<li class="doc"><a class="item" href="${esc(d.url)}" target="_blank" rel="noopener">${ic(foto ? 'copia' : 'informe')}<span class="txt"><span class="nom">${esc(d.titulo || d.archivo || 'Documento')}</span>
      <span class="sub">${esc([d.fecha ? fmtCorta(d.fecha) : '', d.autor, fmtTam(d.tam)].filter(Boolean).join(' · '))}</span></span></a>
      <button class="btn-texto" data-did="${d.id}" aria-label="Editar datos del documento">${ic('lapiz')}</button></li>`;
  }

  function sesionHTML(s, conNombre) {
    const p = paciente(s.pid);
    const est = s.anulada ? '<span class="badge">anulada</span>' : s.estado === 'asistio' ? '<span class="badge b-ok">asistió</span>' : `<span class="badge b-aviso">${s.estado === 'aviso' ? 'avisó' : 'faltó'}</span>`;
    return `<li><button class="sesion${s.anulada ? ' anulada' : ''}" data-sid="${s.id}">
      ${conNombre ? avatar(p) : `<span class="fecha mono">${fmtDia(s.fecha)}</span>`}
      <span class="txt">${conNombre ? `<span class="nom">${esc(p ? nombreLista(p) : s.paciente || 'Paciente')}</span><span class="fecha-l">${fmtDia(s.fecha)}</span>` : ''}
        ${s.nota ? `<span class="nota-ses">${esc(s.nota)}</span>` : conNombre ? '' : '<span class="tenue chico">Sin nota</span>'}</span>
      ${est}</button></li>`;
  }

  /* ------------------------------------------------------------ sesiones del mes */
  function vSesiones(mesRuta) {
    titulo('Sesiones');
    const mes = /^\d{4}-\d{2}$/.test(mesRuta || '') ? mesRuta : mesDe(hoyISO());
    const delMes = db.sesiones.filter((s) => mesDe(s.fecha) === mes).sort((a, b) => b.fecha.localeCompare(a.fecha) || String(b.creado).localeCompare(String(a.creado)));
    const val = validas(delMes);
    const porPac = new Map();
    for (const s of val) {
      const r = porPac.get(s.pid) || { pid: s.pid, a: 0, f: 0, v: 0 };
      if (s.estado === 'asistio') r.a++; else if (s.estado === 'aviso') r.v++; else r.f++;
      porPac.set(s.pid, r);
    }
    const filas = [...porPac.values()].map((r) => ({ ...r, p: paciente(r.pid) })).sort((a, b) => (a.p && b.p ? ordenNombre(a.p, b.p) : 0));
    const dias = []; for (const s of delMes) { const d = dias[dias.length - 1]; if (d && d.f === s.fecha) d.l.push(s); else dias.push({ f: s.fecha, l: [s] }); }
    const tot = { a: val.filter((s) => s.estado === 'asistio').length, f: val.filter((s) => s.estado === 'falto').length, v: val.filter((s) => s.estado === 'aviso').length };
    vista.innerHTML = `
      <div class="mes"><a class="btn" href="#/sesiones/${sumarMes(mes, -1)}" aria-label="Mes anterior">${ic('izq')}</a><h2>${fmtMes(mes)}</h2><a class="btn" href="#/sesiones/${sumarMes(mes, 1)}" aria-label="Mes siguiente">${ic('der')}</a></div>
      <div class="tablero tres">
        <div class="cuadro"><span class="etq">Asistió</span><b>${tot.a}</b></div>
        <div class="cuadro${tot.f ? ' aviso' : ''}"><span class="etq">Faltó</span><b>${tot.f}</b></div>
        <div class="cuadro"><span class="etq">Avisó</span><b>${tot.v}</b></div>
      </div>
      <div class="dos-col">
        <section class="caja">
          <div class="caja-cab"><span class="etq">Por paciente</span>${val.length ? `<button class="btn-texto chico" data-accion="exportar-mes" data-mes="${mes}">${ic('bajar')}Excel</button>` : ''}</div>
          ${filas.length ? `<table class="tabla"><thead><tr><th>Paciente</th><th>O. social</th><th class="num">Asistió</th><th class="num">Faltó</th></tr></thead><tbody>
            ${filas.map((r) => `<tr data-pid="${r.pid}"><td class="nom">${avatar(r.p)}${esc(r.p ? nombreLista(r.p) : 'Paciente borrado')}</td><td>${esc(r.p ? r.p.os || '' : '')}</td><td class="num mono">${r.a}</td><td class="num mono">${r.f + r.v ? `${r.f + r.v}` : '<span class="tenue">0</span>'}</td></tr>`).join('')}
          </tbody></table>` : '<p class="vacio chico">No hay sesiones en este mes.</p>'}
        </section>
        <section class="caja">
          <div class="caja-cab"><span class="etq">Día por día</span><button class="btn-texto chico" data-accion="sesion">${ic('mas')}Anotar</button></div>
          ${dias.length ? dias.map((d) => `<div class="dia etq">${fmtLarga(d.f)}</div><ul class="lista">${d.l.map((s) => sesionHTML(s, true)).join('')}</ul>`).join('') : '<p class="vacio chico">Nada anotado.</p>'}
        </section>
      </div>`;
    $$('tr[data-pid]', vista).forEach((tr) => { tr.onclick = () => ir(`#/p/${tr.dataset.pid}`); });
  }

  /* ------------------------------------------------------------ ajustes */
  function vAjustes() {
    titulo('Ajustes');
    const d = db.meta;
    const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const item = (accion, icono, nom, sub, href) => href
      ? `<li><a class="item" href="${esc(href)}" target="_blank" rel="noopener">${ic(icono)}<span class="txt"><span class="nom">${nom}</span><span class="sub">${sub}</span></span></a></li>`
      : `<li><button class="item" data-accion="${accion}">${ic(icono)}<span class="txt"><span class="nom">${nom}</span><span class="sub">${sub}</span></span></button></li>`;
    vista.innerHTML = `<div class="ajustes">
      <section class="caja">
        <div class="caja-cab"><span class="etq">Tu nombre</span></div>
        <ul class="lista"><li><button class="item" data-accion="perfil"><span class="monograma" data-monograma></span><span class="txt"><span class="nom">${esc(perfil.nombre || 'Poné tu nombre')}</span><span class="sub">${esc(perfil.profesion || 'Aparece arriba en la app y en la pantalla del PIN')}</span></span>${ic('lapiz')}</button></li></ul>
      </section>
      <section class="caja">
        <div class="caja-cab"><span class="etq">Planilla de Google</span>${conexion ? `<span class="sync sync-${estadoSync}">${{ ok: 'Al día', guardando: 'Guardando…', error: 'Sin conexión', clave: 'Clave incorrecta' }[estadoSync] || ''}</span>` : ''}</div>
        ${conexion ? `<ul class="lista">
          ${d.planilla ? item('', 'copia', 'Abrir la planilla', 'Pacientes, sesiones, documentos y el registro de cambios', d.planilla) : ''}
          ${d.carpeta ? item('', 'carpeta', 'Abrir la carpeta en Drive', 'Una carpeta por paciente con sus documentos', d.carpeta) : ''}
          ${d.carpetaPlantillas ? item('', 'informe', 'Plantillas para empezar informes', `${db.plantillas.length} ${db.plantillas.length === 1 ? 'plantilla' : 'plantillas'} · agregá las tuyas en esa carpeta`, d.carpetaPlantillas) : ''}
          ${d.espacio && d.espacio.limite ? `<li class="item espacio"><span class="txt"><span class="nom">Espacio de tu Google</span><span class="sub">${fmtGB(d.espacio.usado)} de ${fmtGB(d.espacio.limite)} usados · los documentos de pacientes ocupan ${fmtTam(db.documentos.filter((x) => !x.anulado).reduce((a, x) => a + (Number(x.tam) || 0), 0)) || '0 KB'}</span><span class="barra-uso"><span style="width:${Math.min(100, Math.round(d.espacio.usado / d.espacio.limite * 100))}%"></span></span></span></li>` : ''}
          ${item('compartir', 'celular', 'Abrir en otro dispositivo', 'Código QR para el celular o link para la compu')}
          ${item('sincronizar', 'bajar', 'Actualizar ahora', cola.length ? `${cola.length} cambio(s) sin enviar` : d.sincro ? `Última vez: ${new Date(d.sincro).toLocaleString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false })}` : 'Traer lo último de la planilla')}
        </ul>` : `<div class="caja-cuerpo pila chico"><p>Con la planilla, las fichas se ven igual en la compu y en el celular, quedan guardadas en tu cuenta de Google y podés subir los informes de cada paciente a tu Drive.</p><button class="btn" data-accion="conectar" style="align-self:flex-start">Conectar con la planilla</button></div>`}
      </section>
      <section class="caja">
        <div class="caja-cab"><span class="etq">Seguridad</span></div>
        <ul class="lista">
          ${item('bloquear', 'candado', 'Bloquear ahora', 'También se bloquea sola si no la usás por un rato')}
          ${item('cambiar-pin', 'lapiz', 'Cambiar el PIN', 'El de este dispositivo')}
        </ul>
      </section>
      <section class="caja">
        <div class="caja-cab"><span class="etq">Word y Excel</span></div>
        <ul class="lista">
          ${item('importar', 'word', 'Importar fichas de un Word', `Agrega los pacientes que no estén cargados${d.archivo ? ` · último: ${esc(d.archivo)}` : ''}`)}
          ${item('exportar', 'bajar', 'Exportar a Excel', 'Todos los pacientes y sesiones')}
        </ul>
      </section>
      <section class="caja">
        <div class="caja-cab"><span class="etq">Copia de seguridad</span></div>
        <ul class="lista">
          ${item('copia', 'copia', 'Guardar una copia', `${d.respaldo ? `Última: ${new Date(d.respaldo).toLocaleDateString('es-AR')}` : 'Todavía no guardaste ninguna'} · queda protegida con tu PIN`)}
          ${item('recuperar', 'subir', 'Recuperar una copia', 'Reemplaza lo que hay cargado')}
        </ul>
      </section>
      ${standalone || esPC() ? '' : `<section class="caja"><div class="caja-cab"><span class="etq">Instalar en el celular</span></div><div class="caja-cuerpo pila chico">
        <p class="fila" style="align-items:flex-start">${ic('celular')}<span>${ios
          ? 'En Safari tocá el botón <b>Compartir</b> y después <b>Agregar a inicio</b>.'
          : 'En Chrome tocá los tres puntitos <b>⋮</b> y después <b>Agregar a la pantalla principal</b> o <b>Instalar app</b>.'} Queda como una app más y abre sin internet.</span></p>
      </div></section>`}
      <section class="caja"><div class="caja-cuerpo pila chico">
        <p class="tinta-2">${db.pacientes.length} pacientes · ${validas(db.sesiones).length} sesiones. ${conexion ? 'Guardados en tu planilla de Google, con una copia cifrada en este dispositivo para usar sin internet.' : 'Guardados solo en este dispositivo, cifrados con tu PIN.'}</p>
        ${conexion ? `<button class="btn btn-chico btn-peligro" data-accion="desconectar" style="align-self:flex-start">Desconectar este dispositivo</button>`
          : `<button class="btn btn-chico btn-peligro" data-accion="borrar-todo" style="align-self:flex-start">${ic('tacho')}Borrar todo de este dispositivo</button>`}
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

  function confirmar(titulo_, texto, boton, fn) {
    abrirHoja(`<div class="fila entre"><h3>${titulo_}</h3><button class="cerrar" data-cerrar>${ic('cerrar')}</button></div><p>${texto}</p>
      <div class="acciones"><button class="btn btn-grande" data-cerrar>Cancelar</button><button class="btn btn-grande btn-peligro" data-ok>${boton}</button></div>`,
    (hoja, cerrar) => { $('[data-ok]', hoja).onclick = () => { cerrar(); fn(); }; });
  }

  // Elegir paciente (para anotar una sesión desde el inicio).
  function hojaElegirPaciente(alElegir) {
    abrirHoja(`
      <div class="fila entre"><h3>¿De quién es la sesión?</h3><button class="cerrar" data-cerrar>${ic('cerrar')}</button></div>
      <div class="buscador">${ic('buscar')}<input class="entrada" id="ep-q" type="search" placeholder="Buscar paciente" autocomplete="off"></div>
      <ul class="lista caja" id="ep-lista"></ul>`, (hoja) => {
      const q = $('#ep-q', hoja), lista = $('#ep-lista', hoja);
      const pintar = () => {
        const r = buscar(activos(), q.value).sort(ordenNombre);
        lista.innerHTML = r.length ? r.map((p) => `<li><button class="item" data-elegir="${p.id}">${avatar(p)}<span class="txt"><span class="nom">${esc(nombreLista(p))}</span><span class="sub">${esc([fmtEdad(edad(p.fn)), p.os].filter(Boolean).join(' · '))}</span></span></button></li>`).join('') : '<li class="vacio chico">No hay pacientes activos con ese nombre.</li>';
      };
      pintar();
      q.addEventListener('input', pintar);
      q.addEventListener('keydown', (e) => { if (e.key === 'Enter') { const b = $('[data-elegir]', lista); if (b) b.click(); } });
      lista.addEventListener('click', (e) => { const b = e.target.closest('[data-elegir]'); if (b) alElegir(paciente(b.dataset.elegir)); });
      if (esPC()) setTimeout(() => q.focus(), 50);
    });
  }

  // Anotar o corregir una sesión. Lo que se escribe queda como borrador (cifrado) hasta guardar.
  function hojaSesion(p, s) {
    if (!p) { if (!activos().length) { aviso('Primero cargá un paciente.'); return; } hojaElegirPaciente((x) => hojaSesion(x)); return; }
    const nueva = !s;
    const b = db.borrador && db.borrador.pid === p.id && (db.borrador.sid || null) === (s ? s.id : null) ? db.borrador : null;
    const v = Object.assign({ fecha: hoyISO(), estado: 'asistio', nota: '' }, s || {}, b || {});
    abrirHoja(`
      <div class="fila entre"><h3>${nueva ? 'Anotar sesión' : 'Corregir sesión'}</h3><button class="cerrar" data-cerrar>${ic('cerrar')}</button></div>
      <p class="tinta-2"><b>${esc(nombreLista(p))}</b>${p.os ? ` · ${esc(p.os)}` : ''}</p>
      ${b ? '<p class="chico tenue">Recuperé lo que habías escrito y no guardaste.</p>' : ''}
      <label class="campo"><span class="etq">Fecha</span><input class="entrada" type="date" id="s-fecha" value="${v.fecha}" max="${hoyISO()}"></label>
      <div class="campo"><span class="etq">Asistencia</span><div class="opciones">${Object.entries(ASIST).map(([k, t]) => `<button type="button" class="chip${v.estado === k ? ' si' : ''}" data-est="${k}">${t}</button>`).join('')}</div></div>
      <label class="campo"><span class="etq">Nota de la sesión</span><textarea class="entrada area" id="s-nota" rows="7" placeholder="Qué se trabajó, cómo estuvo, qué queda para la próxima…">${esc(v.nota)}</textarea></label>
      <button class="btn btn-oscuro btn-grande btn-bloque" data-ok>${nueva ? 'Guardar sesión' : 'Guardar cambios'}</button>
      ${nueva ? '' : s.anulada ? '<p class="chico tenue">Esta sesión está anulada: no cuenta en los totales.</p><button class="btn btn-chico" data-restaurar>Volver a contarla</button>' : '<button class="btn btn-chico btn-peligro" data-anular style="align-self:flex-start">Anular sesión</button>'}`, (hoja, cerrar) => {
      let estado = v.estado;
      const borrador = () => { db.borrador = { pid: p.id, sid: s ? s.id : null, fecha: $('#s-fecha', hoja).value, estado, nota: $('#s-nota', hoja).value }; guardarPronto(); };
      $$('[data-est]', hoja).forEach((c) => { c.onclick = () => { estado = c.dataset.est; $$('[data-est]', hoja).forEach((x) => x.classList.toggle('si', x === c)); borrador(); }; });
      $('#s-nota', hoja).addEventListener('input', borrador);
      $('#s-fecha', hoja).addEventListener('change', borrador);
      $('[data-ok]', hoja).onclick = () => {
        const fecha = $('#s-fecha', hoja).value;
        if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) { aviso('Falta la fecha.'); return; }
        const ahora = new Date().toISOString();
        const nuevaS = nueva ? { id: uid(), pid: p.id, creado: ahora, anulada: false, editado: '' } : Object.assign({}, s, { editado: ahora });
        Object.assign(nuevaS, { fecha, estado, nota: $('#s-nota', hoja).value.trim() });
        db.borrador = null;
        guardarSesion(nuevaS);
        cerrar(); render();
        aviso(nueva ? 'Sesión guardada.' : 'Cambios guardados.');
      };
      const anular = $('[data-anular]', hoja);
      if (anular) anular.onclick = () => confirmar('Anular sesión', 'La sesión queda en el historial tachada y no cuenta en los totales. Se puede volver atrás.', 'Anular', () => { db.borrador = null; guardarSesion(Object.assign({}, s, { anulada: true, editado: new Date().toISOString() })); render(); aviso('Sesión anulada.'); });
      const rest = $('[data-restaurar]', hoja);
      if (rest) rest.onclick = () => { guardarSesion(Object.assign({}, s, { anulada: false, editado: new Date().toISOString() })); cerrar(); render(); aviso('La sesión vuelve a contar.'); };
      if (nueva && !b) setTimeout(() => $('#s-nota', hoja).focus({ preventScroll: true }), 80);
    });
  }

  function filaEquipo(c = {}) {
    return `<div class="eq-fila">
      <select class="entrada entrada-chica" data-k="rol">${[...new Set([...ROLES, c.rol].filter(Boolean))].map((r) => `<option${r === c.rol ? ' selected' : ''}>${esc(r)}</option>`).join('')}</select>
      <input class="entrada entrada-chica" data-k="nombre" placeholder="Nombre" value="${esc(c.nombre || '')}">
      <input class="entrada entrada-chica" data-k="contacto" placeholder="Teléfono o mail" value="${esc(c.contacto || '')}">
      <button type="button" class="cerrar" data-quitar aria-label="Quitar">${ic('cerrar')}</button>
    </div>`;
  }

  function hojaPaciente(p) {
    const nuevo = !p;
    const v = p || { apellido: '', nombre: '', dni: '', fn: '', os: 'IPS', afiliado: '', dx: [], escuela: '', grado: '', tutores: '', equipo: [], obs: '' };
    const campo = (id, et, val, extra = '') => `<label class="campo"><span class="etq">${et}</span><input class="entrada" id="${id}" value="${esc(val || '')}" ${extra}></label>`;
    abrirHoja(`
      <div class="fila entre"><h3>${nuevo ? 'Paciente nuevo' : 'Editar ficha'}</h3><button class="cerrar" data-cerrar>${ic('cerrar')}</button></div>
      <div class="form-grid">
        ${campo('f-apellido', 'Apellido', v.apellido, 'autocapitalize="words"')}
        ${campo('f-nombre', 'Nombres', v.nombre, 'autocapitalize="words"')}
        ${campo('f-dni', 'DNI', v.dni, 'inputmode="numeric"')}
        <label class="campo"><span class="etq">Fecha de nacimiento</span><input class="entrada" type="date" id="f-fn" value="${esc(v.fn || '')}" max="${hoyISO()}"></label>
        ${campo('f-os', 'Obra social', v.os, 'list="obras-sociales" placeholder="IPS, particular…"')}
        ${campo('f-afiliado', 'N° de afiliado', v.afiliado, 'inputmode="numeric"')}
        ${campo('f-escuela', 'Escuela', v.escuela)}
        ${campo('f-grado', 'Grado o año', v.grado, 'placeholder="4° grado, Sala de 5…"')}
      </div>
      <datalist id="obras-sociales">${[...new Set(['IPS', 'Particular', ...db.pacientes.map((x) => x.os).filter(Boolean)])].map((o) => `<option value="${esc(o)}">`).join('')}</datalist>
      <label class="campo"><span class="etq">Diagnóstico · uno por renglón</span><textarea class="entrada area" id="f-dx" rows="3">${esc((v.dx || []).join('\n'))}</textarea></label>
      <label class="campo"><span class="etq">Adultos responsables</span><textarea class="entrada area" id="f-tutores" rows="2" placeholder="Nombre, vínculo y teléfono">${esc(v.tutores || '')}</textarea></label>
      <div class="campo"><span class="etq">Equipo externo y contactos</span><div class="pila" id="f-equipo">${(v.equipo || []).map(filaEquipo).join('')}</div>
        <button type="button" class="btn btn-chico" id="f-eq-mas" style="align-self:flex-start">${ic('mas')}Agregar contacto</button></div>
      <label class="campo"><span class="etq">Observaciones</span><textarea class="entrada area" id="f-obs" rows="3">${esc(v.obs || '')}</textarea></label>
      <button class="btn btn-oscuro btn-grande btn-bloque" data-ok>${nuevo ? 'Guardar paciente' : 'Guardar cambios'}</button>`, (hoja, cerrar) => {
      const eq = $('#f-equipo', hoja);
      $('#f-eq-mas', hoja).onclick = () => { eq.insertAdjacentHTML('beforeend', filaEquipo()); $('.eq-fila:last-child [data-k="nombre"]', eq).focus(); };
      eq.addEventListener('click', (e) => { const q = e.target.closest('[data-quitar]'); if (q) q.closest('.eq-fila').remove(); });
      $('[data-ok]', hoja).onclick = () => {
        const val = (id) => $(id, hoja).value.trim();
        const datos = {
          apellido: val('#f-apellido'), nombre: val('#f-nombre'), dni: val('#f-dni').replace(/\D/g, ''), fn: val('#f-fn'),
          os: val('#f-os'), afiliado: val('#f-afiliado'), escuela: val('#f-escuela'), grado: val('#f-grado'),
          dx: val('#f-dx').split('\n').map((x) => x.trim()).filter(Boolean), tutores: val('#f-tutores'), obs: val('#f-obs'),
          equipo: $$('.eq-fila', eq).map((f) => ({ rol: $('[data-k="rol"]', f).value, nombre: $('[data-k="nombre"]', f).value.trim(), contacto: $('[data-k="contacto"]', f).value.trim() })).filter((c) => c.nombre || c.contacto),
        };
        if (!datos.apellido && !datos.nombre) { aviso('Falta el nombre.'); return; }
        if (datos.dni && db.pacientes.some((x) => x.dni === datos.dni && (!p || x.id !== p.id))) { aviso('Ya hay un paciente con ese DNI.'); return; }
        const final = nuevo ? Object.assign({ id: uid(), estado: 'activo', alta: '', revisar: [], creado: new Date().toISOString() }, datos) : Object.assign({}, p, datos);
        guardarPaciente(final);
        cerrar();
        if (nuevo) ir(`#/p/${final.id}`); else render();
        aviso(nuevo ? 'Paciente guardado.' : 'Ficha actualizada.');
      };
      if (nuevo) setTimeout(() => $('#f-apellido', hoja).focus(), 80);
    });
  }

  function datosInforme(p, fecha) {
    const asist = validas(sesionesDe(p.id)).filter((s) => s.estado === 'asistio' && s.fecha <= fecha);
    const primera = asist[asist.length - 1];
    return {
      nombre: nombreCompleto(p), apellido: p.apellido, nombres: p.nombre, dni: fmtDNI(p.dni),
      fecha_nacimiento: fmtDMY(p.fn), edad: fmtEdadLarga(edad(p.fn, fecha)), edad_anios: fmtEdad(edad(p.fn, fecha)),
      obra_social: p.os || '', afiliado: p.afiliado || '', diagnostico: (p.dx || []).join('. '),
      escuela: p.escuela || '', grado: p.grado || '', responsables: p.tutores || '',
      equipo: (p.equipo || []).map((c) => `${c.rol}: ${[c.nombre, c.contacto].filter(Boolean).join(' · ')}`).join('\n'),
      inicio_tratamiento: primera ? fmtDMY(primera.fecha) : '', sesiones: String(asist.length), fecha: fmtLarga(fecha),
    };
  }

  function hojaInforme(p) {
    if (!conexion) {
      abrirHoja(`<div class="fila entre"><h3>Conectá la planilla</h3><button class="cerrar" data-cerrar>${ic('cerrar')}</button></div>
        <p>Los documentos se guardan en la carpeta del paciente en tu Drive.</p>
        <p class="chico tinta-2">Para eso, primero conectá la app con tu planilla de Google.</p>
        <button class="btn btn-oscuro btn-grande btn-bloque" data-accion="conectar">Conectar con la planilla</button>`);
      return;
    }
    const pl = db.plantillas;
    abrirHoja(`
      <div class="fila entre"><h3>Empezar un informe</h3><button class="cerrar" data-cerrar>${ic('cerrar')}</button></div>
      <p class="tinta-2"><b>${esc(nombreLista(p))}</b> · se crea un documento de Google Docs en <b>Mis informes</b>, con los datos de la ficha ya escritos.</p>
      ${pl.length ? `<div class="campo"><span class="etq">Plantilla</span><div class="pila" id="i-pl">${pl.map((x, i) => `<label class="opcion"><input type="radio" name="pl" value="${esc(x.id)}" ${i === 0 ? 'checked' : ''}><span>${esc(x.nombre)}</span></label>`).join('')}</div></div>`
        : '<div class="nota">No hay plantillas en la carpeta <b>Consultorio → Plantillas</b> de tu Drive. Creá un documento de Google Docs ahí y tocá <b>Actualizar ahora</b> en Ajustes.</div>'}
      <label class="campo"><span class="etq">Fecha del informe</span><input class="entrada" type="date" id="i-fecha" value="${hoyISO()}"></label>
      <details class="chico"><summary class="btn-texto">Qué datos completa solo</summary>
        <p class="tinta-2" style="margin:8px 0">En la plantilla, escribí estos campos entre llaves dobles y la app los reemplaza con los datos de la ficha:</p>
        <table class="tabla tabla-quieta">${CAMPOS_INFORME.map(([k, t]) => `<tr><td class="mono">{{${k}}}</td><td>${t}</td></tr>`).join('')}</table>
      </details>
      <p class="chico" id="i-msj" role="status"></p>
      <button class="btn btn-oscuro btn-grande btn-bloque" data-ok ${pl.length ? '' : 'disabled'}>Crear informe</button>`, (hoja) => {
      const ok = $('[data-ok]', hoja), msj = $('#i-msj', hoja);
      ok.onclick = async () => {
        const plantilla = ($('input[name="pl"]:checked', hoja) || {}).value;
        const fecha = $('#i-fecha', hoja).value || hoyISO();
        const nomPl = (pl.find((x) => x.id === plantilla) || {}).nombre || 'Informe';
        ok.disabled = true; ok.textContent = 'Armando el documento…'; msj.textContent = '';
        try {
          await sincronizar();
          if (cola.length) throw new Error('Hay cambios sin enviar a la planilla. Revisá la conexión.');
          const r = await llamar(conexion, { informe: { id: uid(), pid: p.id, plantilla, fecha, titulo: `Informe · ${nombreLista(p)} · ${fmtDMY(fecha).replace(/\//g, '-')}`, datos: datosInforme(p, fecha) } });
          db.documentos.push(r.documento); guardar();
          hoja.innerHTML = `<div class="fila entre"><h3>Informe listo</h3><button class="cerrar" data-cerrar>${ic('cerrar')}</button></div>
            <p>Quedó guardado en la carpeta de <b>${esc(nombreLista(p))}</b> en tu Drive, con los datos de la ficha completos. Abrilo para escribir el resto.</p>
            <a class="btn btn-acento btn-grande btn-bloque" href="${esc(r.documento.url)}" target="_blank" rel="noopener" data-cerrar>${ic('informe')}Abrir el informe</a>`;
          if (ruta === 'p') render();
        } catch (e) {
          msj.textContent = e.message === 'Failed to fetch' ? 'No hay conexión. Probá de nuevo en un rato.' : e.message;
          ok.disabled = false; ok.textContent = 'Crear informe';
        }
      };
    });
  }

  // Subir un informe propio o de otro profesional (PDF, Word, foto) a la carpeta del paciente.
  function hojaSubir(p, tipo = 'propio') {
    if (!conexion) { hojaInforme(p); return; }
    const autores = [...new Set((p.equipo || []).map((c) => [c.nombre, c.rol].filter(Boolean).join(' · ')).concat(db.documentos.filter((d) => d.pid === p.id && d.autor).map((d) => d.autor)))];
    abrirHoja(`
      <div class="fila entre"><h3>Subir documento</h3><button class="cerrar" data-cerrar>${ic('cerrar')}</button></div>
      <p class="tinta-2"><b>${esc(nombreLista(p))}</b></p>
      <div class="campo"><span class="etq">¿De quién es?</span><div class="opciones dos">${Object.entries(TIPOS_DOC).map(([k, t]) => `<button type="button" class="chip${k === tipo ? ' si' : ''}" data-tipo-doc="${k}">${k === 'propio' ? 'Mío' : 'De otro profesional'}</button>`).join('')}</div></div>
      <label class="archivo-elegir" id="d-elegir">${ic('clip')}<span id="d-nom">Elegir archivo o sacar una foto</span><input type="file" id="d-archivo" accept="application/pdf,image/*,.doc,.docx,.odt,.rtf,.txt,.xls,.xlsx"></label>
      <p class="chico tenue">PDF, Word o fotos (cada página, una foto). Hasta ${MAX_MB} MB. Las fotos se achican solas.</p>
      <label class="campo"><span class="etq">Título</span><input class="entrada" id="d-titulo" placeholder="Informe neurológico, evaluación inicial…"></label>
      <label class="campo" id="d-autor-campo" ${tipo === 'propio' ? 'hidden' : ''}><span class="etq">Profesional o institución</span><input class="entrada" id="d-autor" list="d-autores" placeholder="Dra. …, CENEMI, escuela…"></label>
      <datalist id="d-autores">${autores.map((a) => `<option value="${esc(a)}">`).join('')}</datalist>
      <label class="campo"><span class="etq">Fecha del documento</span><input class="entrada" type="date" id="d-fecha" value="${hoyISO()}" max="${hoyISO()}"></label>
      <p class="chico" id="d-msj" role="status"></p>
      <button class="btn btn-oscuro btn-grande btn-bloque" data-ok disabled>Subir</button>`, (hoja, cerrar) => {
      let archivo = null;
      const ok = $('[data-ok]', hoja), msj = $('#d-msj', hoja), titulo = $('#d-titulo', hoja);
      $$('[data-tipo-doc]', hoja).forEach((c) => { c.onclick = () => { tipo = c.dataset.tipoDoc; $$('[data-tipo-doc]', hoja).forEach((x) => x.classList.toggle('si', x === c)); $('#d-autor-campo', hoja).hidden = tipo === 'propio'; }; });
      $('#d-archivo', hoja).onchange = async (e) => {
        const f = e.target.files[0]; if (!f) return;
        msj.textContent = '';
        archivo = /^image\/(jpeg|png|webp)$/.test(f.type) && f.size > 600 * 1024 ? await achicarFoto(f).catch(() => f) : f;
        if (archivo.size > MAX_MB * 1024 * 1024) { msj.textContent = `Pesa ${fmtTam(archivo.size)}: el máximo es ${MAX_MB} MB.`; archivo = null; ok.disabled = true; return; }
        $('#d-nom', hoja).textContent = `${f.name} · ${fmtTam(archivo.size)}`;
        $('#d-elegir', hoja).classList.add('listo');
        if (!titulo.value) titulo.value = f.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim();
        ok.disabled = false;
      };
      ok.onclick = async () => {
        if (!archivo) return;
        ok.disabled = true; ok.textContent = 'Subiendo…'; msj.textContent = '';
        try {
          await sincronizar();
          if (cola.length) throw new Error('Hay cambios sin enviar a la planilla. Revisá la conexión.');
          const datos = await aBase64(archivo);
          const r = await llamar(conexion, { subir: { id: uid(), pid: p.id, tipo, titulo: titulo.value.trim() || archivo.name, autor: tipo === 'externo' ? $('#d-autor', hoja).value.trim() : '', fecha: $('#d-fecha', hoja).value || hoyISO(), nombre: archivo.name, mime: archivo.type, datos } });
          db.documentos.push(Object.assign(r.documento, { mime: archivo.type })); guardar();
          cerrar(); if (ruta === 'p') render(); aviso('Documento guardado en tu Drive.');
        } catch (e) {
          msj.textContent = e.message === 'Failed to fetch' ? 'No hay conexión. Probá de nuevo en un rato.' : e.message;
          ok.disabled = false; ok.textContent = 'Subir';
        }
      };
    });
  }
  const aBase64 = (f) => new Promise((ok, mal) => { const r = new FileReader(); r.onload = () => ok(String(r.result).split(',')[1]); r.onerror = mal; r.readAsDataURL(f); });
  async function achicarFoto(f) {
    const img = await createImageBitmap(f);
    const k = Math.min(1, FOTO_MAX / Math.max(img.width, img.height));
    const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    const blob = await new Promise((ok) => c.toBlob(ok, 'image/jpeg', 0.82));
    if (!blob || blob.size >= f.size) return f;
    return new File([blob], f.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' });
  }

  // Corregir los datos de un documento o quitarlo (el archivo va a la papelera de Drive).
  function hojaDocumento(d) {
    abrirHoja(`
      <div class="fila entre"><h3>Datos del documento</h3><button class="cerrar" data-cerrar>${ic('cerrar')}</button></div>
      <p class="chico tenue">${esc(d.archivo || '')}${d.tam ? ` · ${fmtTam(d.tam)}` : ''}</p>
      <div class="campo"><span class="etq">¿De quién es?</span><div class="opciones dos">${Object.keys(TIPOS_DOC).map((k) => `<button type="button" class="chip${k === d.tipo ? ' si' : ''}" data-tipo-doc="${k}">${k === 'propio' ? 'Mío' : 'De otro profesional'}</button>`).join('')}</div></div>
      <label class="campo"><span class="etq">Título</span><input class="entrada" id="e-titulo" value="${esc(d.titulo || '')}"></label>
      <label class="campo"><span class="etq">Profesional o institución</span><input class="entrada" id="e-autor" value="${esc(d.autor || '')}"></label>
      <label class="campo"><span class="etq">Fecha del documento</span><input class="entrada" type="date" id="e-fecha" value="${esc(d.fecha || '')}"></label>
      <a class="btn btn-bloque" href="${esc(d.url)}" target="_blank" rel="noopener">${ic('informe')}Abrir</a>
      <button class="btn btn-oscuro btn-grande btn-bloque" data-ok>Guardar</button>
      <p class="chico tenue">Los cambios de acá no modifican el archivo, solo cómo aparece en la lista. El archivo se cambia desde Drive.</p>
      <button class="btn btn-chico btn-peligro" data-quitar style="align-self:flex-start">${ic('tacho')}Quitar documento</button>`, (hoja, cerrar) => {
      let tipo = d.tipo;
      $$('[data-tipo-doc]', hoja).forEach((c) => { c.onclick = () => { tipo = c.dataset.tipoDoc; $$('[data-tipo-doc]', hoja).forEach((x) => x.classList.toggle('si', x === c)); }; });
      const guardarDoc = (cambios) => {
        Object.assign(d, cambios);
        enviar({ op: 'documento', d: { id: d.id, tipo: d.tipo, titulo: d.titulo, autor: d.autor, fecha: d.fecha, anulado: !!d.anulado } });
        guardar(); render();
      };
      $('[data-ok]', hoja).onclick = () => { guardarDoc({ tipo, titulo: $('#e-titulo', hoja).value.trim(), autor: $('#e-autor', hoja).value.trim(), fecha: $('#e-fecha', hoja).value }); cerrar(); aviso('Datos guardados.'); };
      $('[data-quitar]', hoja).onclick = () => confirmar('Quitar documento', `<b>${esc(d.titulo || d.archivo)}</b> deja de aparecer en la ficha y el archivo va a la papelera de tu Drive, donde queda 30 días por si te equivocaste.`, 'Quitar', () => { guardarDoc({ anulado: true }); aviso('Documento quitado.'); });
    });
  }

  function hojaPerfil() {
    abrirHoja(`
      <div class="fila entre"><h3>Tu nombre</h3><button class="cerrar" data-cerrar>${ic('cerrar')}</button></div>
      <p class="chico tinta-2">Aparece arriba en la app y en la pantalla del PIN, en todos tus dispositivos.</p>
      <label class="campo"><span class="etq">Nombre</span><input class="entrada" id="pf-nombre" value="${esc(perfil.nombre)}" placeholder="Lic. Nombre Apellido" autocapitalize="words"></label>
      <label class="campo"><span class="etq">Profesión</span><input class="entrada" id="pf-prof" value="${esc(perfil.profesion)}" placeholder="Psicopedagoga"></label>
      <button class="btn btn-oscuro btn-grande btn-bloque" data-ok>Guardar</button>`, (hoja, cerrar) => {
      $('[data-ok]', hoja).onclick = () => { guardarPerfil({ nombre: $('#pf-nombre', hoja).value, profesion: $('#pf-prof', hoja).value }, true); cerrar(); render(); };
      setTimeout(() => $('#pf-nombre', hoja).focus(), 80);
    });
  }

  function hojaCambiarPIN() {
    abrirHoja(`
      <div class="fila entre"><h3>Cambiar el PIN</h3><button class="cerrar" data-cerrar>${ic('cerrar')}</button></div>
      <input type="text" name="usuario" value="consultorio" autocomplete="username" hidden>
      <label class="campo"><span class="etq">PIN actual</span><input class="entrada" id="cp-1" type="password" autocomplete="current-password"></label>
      <label class="campo"><span class="etq">PIN nuevo (al menos 6)</span><input class="entrada" id="cp-2" type="password" autocomplete="new-password"></label>
      <label class="campo"><span class="etq">Repetilo</span><input class="entrada" id="cp-3" type="password" autocomplete="new-password"></label>
      <p class="chico alerta-txt" id="cp-msj" role="status"></p>
      <p class="chico tenue">Las copias de seguridad que ya guardaste se siguen abriendo con el PIN viejo.</p>
      <button class="btn btn-oscuro btn-grande btn-bloque" data-ok>Cambiar</button>`, (hoja, cerrar) => {
      $('[data-ok]', hoja).onclick = async () => {
        const msj = $('#cp-msj', hoja), n = $('#cp-2', hoja).value;
        try { await derivar($('#cp-1', hoja).value, sal, ITER).then((k) => descifrar(JSON.parse(localStorage.getItem(COFRE)), k)); }
        catch (e) { msj.textContent = 'El PIN actual no es correcto.'; return; }
        if (n.length < 6) { msj.textContent = 'El nuevo tiene que tener al menos 6 caracteres.'; return; }
        if (n !== $('#cp-3', hoja).value) { msj.textContent = 'Los dos no coinciden.'; return; }
        sal = crypto.getRandomValues(new Uint8Array(16));
        llave = await derivar(n, sal, ITER);
        await guardar();
        cerrar(); aviso('PIN cambiado.');
      };
    });
  }

  /* ------------------------------------------------------------ aviso */
  let tAviso;
  function aviso(txt) {
    $$('.toast').forEach((t) => t.remove()); clearTimeout(tAviso);
    const t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status');
    t.innerHTML = `<span>${esc(txt)}</span>`;
    document.body.appendChild(t);
    tAviso = setTimeout(() => t.remove(), 3600);
  }

  const scripts = {};
  function cargarScript(src) {
    return scripts[src] || (scripts[src] = new Promise((ok, mal) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = () => { delete scripts[src]; mal(new Error('script')); }; document.head.appendChild(s); }));
  }

  /* ------------------------------------------------------------ eventos */
  document.addEventListener('click', (e) => {
    if (!llave) return;
    const doc = e.target.closest('[data-did]');
    if (doc) { const d = db.documentos.find((x) => x.id === doc.dataset.did); if (d) hojaDocumento(d); return; }
    const ses = e.target.closest('[data-sid]');
    if (ses && !e.target.closest('.hoja')) { const s = db.sesiones.find((x) => x.id === ses.dataset.sid); if (s) hojaSesion(paciente(s.pid), s); return; }
    const b = e.target.closest('[data-accion]'); if (!b) return;
    const p = ruta === 'p' ? paciente(vista.dataset.pid) : null;
    switch (b.dataset.accion) {
      case 'sesion': hojaSesion(p); break;
      case 'informe': if (p) hojaInforme(p); break;
      case 'subir': if (p) hojaSubir(p, b.dataset.tipo || 'propio'); break;
      case 'nuevo-paciente': hojaPaciente(null); break;
      case 'editar': if (p) hojaPaciente(p); break;
      case 'revisado': if (p) { guardarPaciente(Object.assign({}, p, { revisar: [] })); render(); } break;
      case 'alta': if (p) confirmar('Dar de alta', `<b>${esc(nombreLista(p))}</b> pasa a <b>De alta</b>. La ficha, las sesiones y los documentos quedan guardados.`, 'Dar de alta', () => { guardarPaciente(Object.assign({}, p, { estado: 'alta', alta: hoyISO() })); render(); aviso('Paciente dado de alta.'); }); break;
      case 'reactivar': if (p) { guardarPaciente(Object.assign({}, p, { estado: 'activo', alta: '' })); render(); aviso('El paciente vuelve a estar activo.'); } break;
      case 'importar': $('#archivo-word').click(); break;
      case 'recuperar': $('#archivo-copia').click(); break;
      case 'exportar': exportarExcel(); break;
      case 'exportar-mes': exportarExcel(b.dataset.mes); break;
      case 'copia': guardarCopia(); break;
      case 'bloquear': bloquear(); break;
      case 'cambiar-pin': hojaCambiarPIN(); break;
      case 'perfil': hojaPerfil(); break;
      case 'desconectar': hojaDesconectar(); break;
      case 'conectar': hojaConectar(); break;
      case 'compartir': hojaCompartir(); break;
      case 'sincronizar': sincronizar(); break;
      case 'borrar-todo': confirmar('Borrar todo', 'Se borran todos los pacientes y sesiones de este dispositivo. Si no guardaste una copia, no se pueden recuperar.', 'Borrar todo', () => { db = vacio(); guardar(); ir('#/'); }); break;
    }
  });
  $('#sync').onclick = sincronizar;
  $('#bloquear').onclick = bloquear;
  $('#volver').onclick = () => { if (history.length > 1) history.back(); else ir('#/pacientes'); };
  $('#archivo-word').onchange = (e) => { const f = e.target.files[0]; e.target.value = ''; if (f) importarWord(f); };
  $('#archivo-copia').onchange = (e) => { const f = e.target.files[0]; e.target.value = ''; if (f) recuperarCopia(f); };
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && hojaAbierta) cerrarHoja(); });
  // Otra pestaña cambió el cofre: se vuelve a leer con la misma llave.
  window.addEventListener('storage', async (e) => {
    if (e.key !== COFRE || !llave) return;
    // Sin guardar nada: el cofre nuevo manda (por ejemplo, si se cambió el PIN en la otra pestaña).
    const cerrarSinGuardar = () => { llave = null; sal = null; db = null; conexion = null; cola = []; pantallaPIN(); };
    if (!e.newValue) { cerrarSinGuardar(); return; }
    try { const d = await descifrar(JSON.parse(e.newValue), llave); db = Object.assign(vacio(), d.db); conexion = d.conexion; cola = d.cola || []; if (!hojaAbierta) render(); } catch (err) { cerrarSinGuardar(); }
  });

  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
  pantallaPIN();
})();
