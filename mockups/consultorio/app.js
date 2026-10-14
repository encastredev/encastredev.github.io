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
  const PERFIL = 'consultorio.perfil';     // datos de la profesional: no son datos de pacientes, van sin cifrar
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
  // Códigos que pide a IPS en el recetario (código y cantidad de sesiones). El primero va marcado por defecto.
  const CODIGOS = [{ cod: '450105', cant: 8 }, { cod: '450102', cant: 1 }];
  const POR_HOJA = 4; // recetarios por hoja A4, para cortar
  const LOGO_RECETARIO = 'logo-recetario.jpg'; // va solo en el recetario impreso
  // Agenda: avisos que se ofrecen (minutos antes; '' = sin aviso) y duración por defecto de un turno nuevo.
  const AVISOS = [['', 'Sin aviso'], ['0', 'A la hora'], ['15', '15 minutos antes'], ['30', '30 minutos antes'], ['60', '1 hora antes'], ['1440', '1 día antes']];
  const DUR_DEFECTO = 45;
  // Tests para el informe. Escalas: etiqueta en la tabla e índice en el análisis; total = fila final en negrita.
  // Los rangos y textos son de ejemplo hasta que ella cargue los suyos (Ajustes → Tests y rangos).
  const RANGOS_EJEMPLO = [[130, 999, 'Muy superior'], [120, 129, 'Superior'], [110, 119, 'Promedio alto'], [90, 109, 'Promedio'], [80, 89, 'Promedio bajo'], [70, 79, 'Límite'], [0, 69, 'Muy bajo']].map(([min, max, cat]) => ({ min, max, cat }));
  const E = (id, etiqueta, indice, total) => ({ id, etiqueta, indice, total: !!total });
  const I_ICV = E('icv', 'Comprensión Verbal', 'ÍNDICE DE COMPRENSIÓN VERBAL (ICV)'), I_IMT = E('imt', 'Memoria de trabajo', 'ÍNDICE DE MEMORIA DE TRABAJO (IMT)');
  const I_CIT = E('cit', 'ESCALA TOTAL', 'COEFICIENTE INTELECTUAL TOTAL (CIT)', true), I_ICG = E('icg', 'Capacidad General', 'ÍNDICE DE CAPACIDAD GENERAL (ICG)');
  const I_INV = E('inv', 'No Verbal', 'ÍNDICE NO VERBAL (INV)'), I_ICC = E('icc', 'Competencia Cognitiva', 'ÍNDICE DE COMPETENCIA COGNITIVA (ICC)');
  const PRIMARIO = (escalas) => ({ id: 'primario', titulo: 'ANÁLISIS PRIMARIO', tituloIndices: 'ANÁLISIS DE LOS ÍNDICES PRINCIPALES', escalas });
  const SECUNDARIO = (escalas) => ({ id: 'secundario', titulo: 'ANÁLISIS SECUNDARIO', tituloIndices: 'ANÁLISIS DE LOS ÍNDICES SECUNDARIOS', escalas });
  const TESTS_BASE = [
    { id: 'wppsi4', nombre: 'WPPSI-IV', titulo: 'INTERPRETACIÓN TEST WPPSI IV', ejemplo: true, rangos: RANGOS_EJEMPLO, textos: {}, grupos: [
      PRIMARIO([I_ICV, E('ive', 'Visoespacial', 'ÍNDICE VISOESPACIAL (IVE)'), E('irf', 'Razonamiento fluido', 'ÍNDICE DE RAZONAMIENTO FLUIDO (IRF)'), I_IMT, E('ivp', 'Velocidad de pensamiento', 'ÍNDICE DE VELOCIDAD DE PROCESAMIENTO (IVP)'), I_CIT]),
      SECUNDARIO([E('iav', 'Adquisición de vocabulario', 'ÍNDICE DE ADQUISICIÓN DE VOCABULARIO (IAV)'), I_INV, I_ICG, I_ICC])] },
    { id: 'wisc5', nombre: 'WISC-V', titulo: 'INTERPRETACIÓN TEST WISC V', ejemplo: true, rangos: RANGOS_EJEMPLO, textos: {}, grupos: [
      PRIMARIO([I_ICV, E('ive', 'Visoespacial', 'ÍNDICE VISOESPACIAL (IVE)'), E('irf', 'Razonamiento fluido', 'ÍNDICE DE RAZONAMIENTO FLUIDO (IRF)'), I_IMT, E('ivp', 'Velocidad de procesamiento', 'ÍNDICE DE VELOCIDAD DE PROCESAMIENTO (IVP)'), I_CIT]),
      SECUNDARIO([E('irc', 'Razonamiento cuantitativo', 'ÍNDICE DE RAZONAMIENTO CUANTITATIVO (IRC)'), E('imta', 'Memoria de trabajo auditiva', 'ÍNDICE DE MEMORIA DE TRABAJO AUDITIVA (IMTA)'), I_INV, I_ICG, I_ICC])] },
    { id: 'wais4', nombre: 'WAIS-IV', titulo: 'INTERPRETACIÓN TEST WAIS IV', ejemplo: true, rangos: RANGOS_EJEMPLO, textos: {}, grupos: [
      PRIMARIO([I_ICV, E('irp', 'Razonamiento perceptivo', 'ÍNDICE DE RAZONAMIENTO PERCEPTIVO (IRP)'), I_IMT, E('ivp', 'Velocidad de procesamiento', 'ÍNDICE DE VELOCIDAD DE PROCESAMIENTO (IVP)'), I_CIT]),
      SECUNDARIO([I_ICG])] },
  ];
  const SECCIONES = [
    ['motivo', 'Motivo de consulta'], ['entrevista', 'Entrevista con la madre'],
    ['conducta', 'Descripción de estructura de la conducta del niño durante la evaluación, con relación a la tarea y la entrevistadora'],
  ];
  const TIPOS_DOC = { propio: 'Mis informes', externo: 'De otros profesionales' };
  const MAX_MB = 25;              // por archivo (Apps Script recibe hasta ~50 MB por pedido)
  const FOTO_MAX = 2000;          // las fotos se achican a 2000 px de lado y JPEG 82 %
  const ROLES = ['Acompañante terapéutico', 'Psicopedagoga', 'Psicóloga', 'Gabinete escolar', 'Maestra', 'Escuela', 'Neurólogo/a', 'Fonoaudióloga', 'Terapista ocupacional', 'Pediatra', 'Otro'];
  const CAMPOS_INFORME = [
    ['nombre', 'Nombre y apellido'], ['apellido_nombre', 'APELLIDO, NOMBRES (en mayúscula)'], ['apellido', 'Apellido'], ['nombres', 'Nombres'], ['dni', 'DNI'],
    ['fecha_nacimiento', 'Fecha de nacimiento'], ['edad', 'Edad en años y meses'], ['edad_anios', 'Edad en años'],
    ['obra_social', 'Obra social'], ['afiliado', 'N° de afiliado'], ['diagnostico', 'Diagnóstico'],
    ['escuela', 'Escuela'], ['grado', 'Grado o año'], ['responsables', 'Adultos responsables'], ['equipo', 'Equipo externo'],
    ['inicio_tratamiento', 'Primera sesión'], ['sesiones', 'Sesiones a las que asistió'], ['fecha', 'Fecha del informe'], ['mes_anio', 'Mes y año del informe'], ['anio', 'Año del informe'],
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
    receta: '<path d="M6 3h12v18H6zM9 8h6M9 12h6M9 16h3"/>', imprimir: '<path d="M7 9V3h10v6M7 17H4v-7h16v7h-3M7 14h10v7H7z"/>',
    agenda: '<path d="M4 6h16v14H4zM4 10h16M8 3v5M16 3v5"/>', campana: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 20a2 2 0 0 0 4 0"/>',
    reloj: '<path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2"/>', repetir: '<path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3M18 3v4h-4M6 21v-4h4"/>',
    word: '<path d="M6 3h9l4 4v14H6zM14 3v5h5M8.5 12l1.2 5 1.3-4 1.3 4 1.2-5"/>',
  };
  const ic = (n) => `<svg class="ic" viewBox="0 0 24 24">${ICONOS[n]}</svg>`;

  /* ---------------------------------------------------------------- marca de la profesional */
  const PERFIL_VACIO = { nombre: '', profesion: '', matricula: '', email: '', telefono: '', direccion: '' };
  let perfil = Object.assign({}, PERFIL_VACIO, leerJSON(PERFIL) || {});
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
    const nuevo = Object.assign({}, PERFIL_VACIO);
    Object.keys(PERFIL_VACIO).forEach((k) => { nuevo[k] = String((p[k] ?? perfil[k]) || '').trim(); });
    perfil = nuevo;
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

  function vacio() { return { pacientes: [], sesiones: [], documentos: [], solicitudes: [], hoja: [], agenda: [], informes: [], tests: [], plantillas: [], borrador: null, meta: { creado: new Date().toISOString(), respaldo: null } }; }
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
  const solicitudesDe = (pid) => (db.solicitudes || []).filter((x) => x.pid === pid).sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)) || String(b.creado).localeCompare(String(a.creado)));
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
  let version = 0, enCurso = null, ultimoError = '', estadoSync = '', reintento;
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
  // Si ya hay un envío en curso, devuelve ese mismo (así quien espera, espera de verdad).
  function sincronizar() {
    if (!llave || !conexion) return Promise.resolve();
    if (!enCurso) enCurso = enviarCola().finally(() => { enCurso = null; });
    return enCurso;
  }
  // Antes de pedirle algo a la planilla (armar un informe, subir un archivo) espera a que no quede nada sin enviar.
  async function vaciarCola() {
    for (let k = 0; k < 5 && cola.length; k++) { await sincronizar(); if (cola.length && ultimoError) break; }
    if (cola.length) throw new Error(ultimoError ? `No se pudo guardar en la planilla: ${ultimoError}` : 'Hay cambios sin enviar a la planilla. Revisá la conexión.');
  }
  async function enviarCola() {
    clearTimeout(reintento);
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
      ultimoError = ''; pintarSync('ok');
    } catch (e) {
      ultimoError = e.message === 'Failed to fetch' ? 'no hay conexión' : e.message;
      pintarSync(e.message === 'Clave incorrecta' ? 'clave' : 'error');
      reintento = setTimeout(sincronizar, 30000);
    }
  }
  function aplicarEstado(r) {
    db.pacientes = r.pacientes; db.sesiones = r.sesiones; db.documentos = r.documentos || []; db.solicitudes = r.solicitudes || []; db.agenda = r.agenda || []; db.informes = unirInformes(r.informes || []); db.tests = r.tests || []; db.plantillas = r.plantillas || [];
    if (r.perfil && r.perfil.nombre) {
      const distinto = Object.keys(PERFIL_VACIO).some((k) => String(r.perfil[k] || '') !== String(perfil[k] || ''));
      if (distinto) guardarPerfil(r.perfil, false);
    }
    Object.assign(db.meta, { planilla: r.planilla, carpeta: r.carpeta, carpetaPlantillas: r.carpetaPlantillas, espacio: r.espacio || null, sincro: new Date().toISOString() });
    guardar();
    const ocupado = hojaAbierta || (document.activeElement && /INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName));
    if (!ocupado) render();
  }
  // Los borradores se mandan con unos segundos de demora: si el de este dispositivo es más nuevo, gana.
  function unirInformes(remotos) {
    const locales = db.informes || [];
    const r = remotos.map((x) => { const l = locales.find((y) => y.id === x.id); return l && String(l.editado) > String(x.editado) ? l : x; });
    return r.concat(locales.filter((l) => !remotos.some((x) => x.id === l.id)));
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
            (db.agenda || []).forEach((a) => cola.push({ op: 'agenda', a }));
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
    const c = await cifrar({ pacientes: db.pacientes, sesiones: db.sesiones, documentos: db.documentos, solicitudes: db.solicitudes, agenda: db.agenda, informes: db.informes, tests: db.tests }, llave, sal, ITER);
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
          db.pacientes = d.pacientes || []; db.sesiones = d.sesiones || []; db.documentos = d.documentos || []; db.solicitudes = d.solicitudes || []; db.agenda = d.agenda || []; db.informes = d.informes || []; db.tests = d.tests || [];
          db.pacientes.forEach((p) => enviar({ op: 'paciente', p: datosPaciente(p) }));
          db.sesiones.forEach((s) => enviar({ op: 'sesion', s }));
          db.solicitudes.forEach((x) => enviar({ op: 'solicitud', s: x }));
          db.agenda.forEach((a) => enviar({ op: 'agenda', a }));
          db.informes.forEach((i) => enviar({ op: 'informe', i }));
          db.tests.forEach((t) => enviar({ op: 'test', t }));
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
    const conVolver = ['p', 'informe', 'tests'].includes(ruta) && !esPC();
    $('#volver').hidden = !conVolver; $('#logo').style.display = conVolver ? 'none' : '';
    pintarMarca();
    if (ruta === 'pacientes') return vPacientes(partes[1]);
    if (ruta === 'p') return vFicha(partes[1]);
    if (ruta === 'sesiones') return vSesiones(partes[1]);
    if (ruta === 'agenda') return vAgenda(partes[1]);
    if (ruta === 'informe') return vInforme(partes[1]);
    if (ruta === 'tests') return vTests(partes[1]);
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
    const turnosHoy = ocurrenciasDia(hoyISO());
    const deHoy = validas(db.sesiones).filter((s) => s.fecha === hoyISO() && !(s.turno && turnosHoy.some((o) => o.a.id === s.turno)));
    const ultimas = validas(db.sesiones).sort((a, b) => b.fecha.localeCompare(a.fecha) || String(b.creado).localeCompare(String(a.creado))).slice(0, 8);
    const rev = paraRevisar().length;
    const hora = new Date().getHours();
    const saludo = hora < 13 ? 'Buen día' : hora < 20 ? 'Buenas tardes' : 'Buenas noches';
    const fechaHoy = fmtLarga(hoyISO());
    vista.innerHTML = `
      <div class="saludo"><span class="etq">${DIAS_LARGOS[new Date().getDay()]} ${fechaHoy}</span><h2>${saludo}${primerNombre() ? `, ${esc(primerNombre())}` : ''}</h2></div>
      <div class="buscador">${ic('buscar')}<input class="entrada" id="q-inicio" type="search" placeholder="Buscar paciente por nombre, DNI o escuela" autocomplete="off"></div>
      <ul class="lista caja" id="res-inicio" hidden></ul>
      ${hojaPendiente()}
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
          <div class="caja-cab"><span class="etq">Hoy · ${fmtDia(hoyISO())}</span><a class="btn-texto chico" href="#/agenda">${ic('agenda')}Agenda</a></div>
          ${turnosHoy.length || deHoy.length ? `<ul class="lista">${turnosHoy.map((o) => ocurrenciaHTML(o)).join('')}${deHoy.map((s) => sesionHTML(s, true)).join('')}</ul>` : '<p class="vacio chico">No tenés turnos hoy.</p>'}
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
          <section class="caja">
            <div class="caja-cab"><span class="etq">Próximos turnos</span><button class="btn-texto chico" data-accion="turno">${ic('mas')}Nuevo</button></div>
            ${(() => { const prox = proximosDe(p.id, 4); return prox.length ? `<ul class="lista">${prox.map((o) => ocurrenciaHTML(o, true)).join('')}</ul>` : '<p class="vacio chico">Sin turnos agendados.</p>'; })()}
          </section>
          <section class="caja">
            <div class="caja-cab"><span class="etq">Solicitudes a ${esc(p.os || 'la obra social')}</span><button class="btn-texto chico" data-accion="solicitud">${ic('mas')}Nueva</button></div>
            ${solicitudesDe(p.id).length ? `<ul class="lista">${solicitudesDe(p.id).map(solicitudHTML).join('')}</ul>` : '<p class="vacio chico">El recetario con los códigos y las sesiones, listo para imprimir y firmar.</p>'}
          </section>
          ${['propio', 'externo'].map((t) => { const l = docs.filter((d) => d.tipo === t); return `<section class="caja">
            <div class="caja-cab"><span class="etq">${TIPOS_DOC[t]}</span><span class="fila" style="gap:4px">${t === 'propio' ? `<button class="btn-texto chico" data-accion="nuevo-informe">${ic('lapiz')}Escribir</button>` : ''}<button class="btn-texto chico" data-accion="subir" data-tipo="${t}">${ic('mas')}Subir</button></span></div>
            ${t === 'propio' && informesDe(p.id).length ? `<ul class="lista">${informesDe(p.id).map(informeHTML).join('')}</ul>` : ''}
            ${l.length ? `<ul class="lista">${l.map(docHTML).join('')}</ul>` : `<p class="vacio chico">${t === 'propio' ? 'Todavía no subiste informes tuyos.' : 'Acá van los informes del neurólogo, la escuela, la fonoaudióloga…'}</p>`}
            ${t === 'propio' && conexion && db.plantillas.length ? `<div class="caja-cuerpo borde-arriba"><button class="btn-texto chico tenue" data-accion="informe">${ic('informe')}O empezar uno directo en Google Docs</button></div>` : ''}
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

  const textoItems = (items) => (items || []).map((x) => `${x.cod} × ${x.cant}`).join(' · ');
  function solicitudHTML(x) {
    const enHoja = (db.hoja || []).includes(x.id);
    return `<li><button class="item${x.anulada ? ' anulada' : ''}" data-solid="${x.id}">${ic('receta')}<span class="txt"><span class="nom">${esc(textoItems(x.items))}</span>
      <span class="sub">${fmtCorta(x.fecha)}${x.dx ? ` · ${esc(x.dx)}` : ''}</span></span>${x.anulada ? '<span class="badge">anulada</span>' : enHoja ? '<span class="badge b-dx">en la hoja</span>' : ''}</button></li>`;
  }
  function hojaPendiente() {
    const n = (db.hoja || []).length;
    if (!n) return '';
    return `<div class="nota fila entre" style="flex-wrap:wrap"><span>${ic('receta')} Hoja de solicitudes: <b>${n} de ${POR_HOJA}</b> lugares ocupados.</span>
      <span class="fila"><button class="btn btn-chico" data-accion="vaciar-hoja">Vaciar</button><button class="btn btn-chico btn-acento" data-accion="imprimir-hoja">${ic('imprimir')}Imprimir</button></span></div>`;
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

  /* ------------------------------------------------------------ agenda */
  const sumarDias = (iso, n) => { const d = deISO(iso); d.setDate(d.getDate() + n); return isoDe(d); };
  const lunesDe = (iso) => { const d = deISO(iso); return sumarDias(iso, -((d.getDay() + 6) % 7)); };
  const finTurno = (a) => { const [h, m] = (a.hora || '00:00').split(':').map(Number); const t = h * 60 + m + (Number(a.dur) || 0); return `${dos(Math.floor(t / 60) % 24)}:${dos(t % 60)}`; };
  const vigentes = () => (db.agenda || []).filter((a) => !a.anulado);
  // ¿El turno (o alerta) cae en esa fecha? Semanal: mismo día de la semana desde su fecha, hasta "hasta", sin las excepciones.
  function caeEn(a, iso) {
    if (a.repite !== 'semanal') return a.fecha === iso;
    if (iso < a.fecha || (a.hasta && iso > a.hasta) || (a.excepciones || []).includes(iso)) return false;
    return Math.round((deISO(iso) - deISO(a.fecha)) / 864e5) % 7 === 0;
  }
  const ocurrenciasDia = (iso) => vigentes().filter((a) => caeEn(a, iso)).map((a) => ({ a, fecha: iso })).sort((x, y) => (x.a.hora || '').localeCompare(y.a.hora || ''));
  function proximosDe(pid, n) {
    const r = []; const hoy = hoyISO();
    for (let i = 0; i < 120 && r.length < n; i++) { const f = sumarDias(hoy, i); vigentes().filter((a) => a.pid === pid && caeEn(a, f)).forEach((a) => r.push({ a, fecha: f })); }
    return r.slice(0, n);
  }
  const sesionDeTurno = (o) => db.sesiones.find((s) => s.turno === o.a.id && s.fecha === o.fecha && !s.anulada);
  const tituloTurno = (a) => { if (a.tipo === 'alerta') return a.titulo; const p = a.pid && paciente(a.pid); return p ? `Sesión · ${nombreCompleto(p)}` : a.titulo || 'Turno'; };

  function ocurrenciaHTML(o, conFecha) {
    const { a } = o;
    const p = a.pid && paciente(a.pid);
    const ses = a.tipo === 'turno' && p ? sesionDeTurno(o) : null;
    const pasado = o.fecha <= hoyISO();
    const estado = ses ? `<span class="badge ${ses.estado === 'asistio' ? 'b-ok' : 'b-aviso'}">${ASIST[ses.estado].toLowerCase()}</span>`
      : a.tipo === 'alerta' ? (a.hecha ? '<span class="badge b-ok">hecha</span>' : '') : '';
    const rapido = !ses && pasado && a.tipo === 'turno' && p ? `<span class="rapido">${Object.entries(ASIST).map(([k, t]) => `<button type="button" class="chip" data-marcar="${k}" data-ag="${a.id}" data-f="${o.fecha}">${t}</button>`).join('')}</span>` : '';
    return `<li class="ocurrencia${a.tipo === 'alerta' ? ' es-alerta' : ''}${a.hecha ? ' hecha' : ''}"><button class="item" data-ag="${a.id}" data-f="${o.fecha}">
      <span class="hora mono">${conFecha ? `${fmtDia(o.fecha)}<br>` : ''}${esc(a.hora || '')}${a.tipo === 'turno' && a.dur ? `<small>${finTurno(a)}</small>` : ''}</span>
      ${a.tipo === 'alerta' ? `<span class="av av-alerta">${ic('campana')}</span>` : p ? avatar(p) : `<span class="av av-3">${ic('agenda')}</span>`}
      <span class="txt"><span class="nom">${esc(p ? nombreLista(p) : a.titulo || 'Turno')}</span>
        <span class="sub">${a.repite === 'semanal' ? `${ic('repetir')}cada ${DIAS_LARGOS[deISO(a.fecha).getDay()].toLowerCase()}` : ''}${a.aviso !== '' && a.aviso != null ? `${ic('campana')}${esc((AVISOS.find((x) => x[0] === String(a.aviso)) || ['', `${a.aviso} min antes`])[1].toLowerCase())}` : ''}${a.nota ? ` · ${esc(a.nota)}` : ''}</span></span>
      ${estado}</button>${rapido}</li>`;
  }

  function vAgenda(diaRuta) {
    titulo('Agenda');
    const dia = /^\d{4}-\d{2}-\d{2}$/.test(diaRuta || '') ? diaRuta : hoyISO();
    const lunes = lunesDe(dia);
    const semana = Array.from({ length: 7 }, (_, i) => sumarDias(lunes, i));
    const lista = ocurrenciasDia(dia);
    const sueltas = validas(db.sesiones).filter((s) => s.fecha === dia && !(s.turno && lista.some((o) => o.a.id === s.turno)));
    vista.innerHTML = `
      <div class="fila entre"><a class="btn-texto chico" href="#/sesiones">${ic('sesion')}Sesiones del mes</a>${dia !== hoyISO() ? `<a class="btn btn-chico" href="#/agenda">Hoy</a>` : ''}</div>
      <div class="semana">
        <a class="btn" href="#/agenda/${sumarDias(lunes, -7)}" aria-label="Semana anterior">${ic('izq')}</a>
        <div class="dias">${semana.map((f) => { const n = ocurrenciasDia(f).length; const d = deISO(f); return `<a class="dia-sem${f === dia ? ' si' : ''}${f === hoyISO() ? ' hoy' : ''}" href="#/agenda/${f}"><span>${DIAS[d.getDay()]}</span><b>${d.getDate()}</b><i>${n ? '•'.repeat(Math.min(n, 3)) : ''}</i></a>`; }).join('')}</div>
        <a class="btn" href="#/agenda/${sumarDias(lunes, 7)}" aria-label="Semana siguiente">${ic('der')}</a>
      </div>
      <div class="fila entre"><h2 class="dia-titulo">${DIAS_LARGOS[deISO(dia).getDay()]} ${fmtLarga(dia)}</h2></div>
      <section class="caja">
        ${lista.length || sueltas.length ? `<ul class="lista">${lista.map((o) => ocurrenciaHTML(o)).join('')}${sueltas.map((x) => sesionHTML(x, true)).join('')}</ul>` : '<p class="vacio">Nada agendado este día.</p>'}
      </section>
      <div class="acciones">
        <button class="btn btn-acento btn-grande" data-accion="turno" data-fecha="${dia}">${ic('agenda')}Nuevo turno</button>
        <button class="btn btn-grande" data-accion="alerta" data-fecha="${dia}">${ic('campana')}Nueva alerta</button>
      </div>
      ${conexion ? '<p class="chico tenue">Los turnos y alertas se copian a tu Google Calendar, en el calendario "Consultorio", con el aviso que elijas.</p>' : '<p class="chico tenue">Conectá la planilla para que los turnos y alertas te avisen desde Google Calendar.</p>'}`;
  }

  function guardarAgenda(a) {
    db.agenda = db.agenda || [];
    a.titulo = tituloTurno(a);
    const i = db.agenda.findIndex((x) => x.id === a.id);
    if (i >= 0) db.agenda[i] = a; else db.agenda.push(a);
    enviar({ op: 'agenda', a });
    guardar();
  }
  const opcionesAviso = (v) => AVISOS.map(([k, t]) => `<option value="${k}"${String(v ?? '') === k ? ' selected' : ''}>${t}</option>`).join('');

  // Turno nuevo o cambiar uno. o = { a, fecha } si se abre desde un día puntual de un turno que se repite.
  function hojaTurno(o, pre = {}) {
    const a = o ? o.a : null;
    const nuevo = !a;
    const conPac = nuevo ? pre.pid !== '' : !!a.pid;
    const ultimo = (pid) => (db.agenda || []).filter((x) => x.tipo === 'turno' && (!pid || x.pid === pid)).sort((x, y) => String(y.creado).localeCompare(String(x.creado)))[0];
    const base = a || { tipo: 'turno', pid: pre.pid || '', fecha: pre.fecha || hoyISO(), hora: '', dur: (ultimo(pre.pid) || {}).dur || DUR_DEFECTO, repite: '', hasta: '', aviso: (ultimo() || { aviso: '60' }).aviso, nota: '', titulo: '' };
    const fechaVista = o ? o.fecha : base.fecha;
    abrirHoja(`
      <div class="fila entre"><h3>${nuevo ? 'Nuevo turno' : 'Turno'}</h3><button class="cerrar" data-cerrar>${ic('cerrar')}</button></div>
      <div class="opciones dos"><button type="button" class="chip${conPac ? ' si' : ''}" data-con="1">Con un paciente</button><button type="button" class="chip${conPac ? '' : ' si'}" data-con="0">Otro (reunión, entrevista…)</button></div>
      <label class="campo" id="t-pac-c" ${conPac ? '' : 'hidden'}><span class="etq">Paciente</span><select class="entrada" id="t-pac"><option value="">Elegí un paciente</option>${activos().sort(ordenNombre).map((x) => `<option value="${x.id}"${x.id === base.pid ? ' selected' : ''}>${esc(nombreLista(x))}</option>`).join('')}</select></label>
      <label class="campo" id="t-tit-c" ${conPac ? 'hidden' : ''}><span class="etq">Qué es</span><input class="entrada" id="t-tit" value="${esc(base.pid ? '' : base.titulo)}" placeholder="Reunión con la escuela de…"></label>
      <div class="form-grid">
        <label class="campo"><span class="etq">Fecha</span><input class="entrada" type="date" id="t-fecha" value="${fechaVista}"></label>
        <label class="campo"><span class="etq">Hora</span><input class="entrada" type="time" id="t-hora" value="${esc(base.hora)}"></label>
        <label class="campo"><span class="etq">Duración (minutos)</span><input class="entrada" type="number" min="5" max="480" step="5" inputmode="numeric" id="t-dur" value="${esc(base.dur)}"></label>
        <label class="campo"><span class="etq">Aviso</span><select class="entrada" id="t-aviso">${opcionesAviso(base.aviso)}</select></label>
      </div>
      <label class="opcion"><input type="checkbox" id="t-rep" ${base.repite === 'semanal' ? 'checked' : ''}><span>Se repite todas las semanas</span></label>
      <label class="campo" id="t-hasta-c" ${base.repite === 'semanal' ? '' : 'hidden'}><span class="etq">Hasta (opcional)</span><input class="entrada" type="date" id="t-hasta" value="${esc(base.hasta)}"></label>
      <label class="campo"><span class="etq">Nota</span><input class="entrada" id="t-nota" value="${esc(base.nota)}"></label>
      <p class="chico alerta-txt" id="t-msj" role="status"></p>
      <button class="btn btn-oscuro btn-grande btn-bloque" data-ok>${nuevo ? 'Agendar' : 'Guardar cambios'}</button>
      ${nuevo ? '' : `<div class="acciones">${a.pid && fechaVista <= hoyISO() && !sesionDeTurno(o) ? '<button class="btn" data-ses>Anotar la sesión</button>' : '<span></span>'}<button class="btn btn-peligro" data-cancelar>Cancelar turno</button></div>`}`, (hoja, cerrar) => {
      let con = conPac;
      $$('[data-con]', hoja).forEach((c) => { c.onclick = () => { con = c.dataset.con === '1'; $$('[data-con]', hoja).forEach((x) => x.classList.toggle('si', x === c)); $('#t-pac-c', hoja).hidden = !con; $('#t-tit-c', hoja).hidden = con; }; });
      $('#t-rep', hoja).onchange = (e) => { $('#t-hasta-c', hoja).hidden = !e.target.checked; };
      $('#t-pac', hoja).onchange = (e) => { const u = ultimo(e.target.value); if (u && nuevo) { $('#t-dur', hoja).value = u.dur; if (u.hora && !$('#t-hora', hoja).value) $('#t-hora', hoja).value = u.hora; } };
      const leer = () => {
        const d = { tipo: 'turno', pid: con ? $('#t-pac', hoja).value : '', titulo: con ? '' : $('#t-tit', hoja).value.trim(), fecha: $('#t-fecha', hoja).value, hora: $('#t-hora', hoja).value, dur: String(parseInt($('#t-dur', hoja).value, 10) || DUR_DEFECTO), aviso: $('#t-aviso', hoja).value, repite: $('#t-rep', hoja).checked ? 'semanal' : '', hasta: $('#t-rep', hoja).checked ? $('#t-hasta', hoja).value : '', nota: $('#t-nota', hoja).value.trim() };
        const msj = $('#t-msj', hoja);
        if (con && !d.pid) { msj.textContent = 'Elegí el paciente.'; return null; }
        if (!con && !d.titulo) { msj.textContent = 'Escribí qué es.'; return null; }
        if (!d.fecha || !d.hora) { msj.textContent = 'Falta la fecha o la hora.'; return null; }
        if (d.hasta && d.hasta < d.fecha) { msj.textContent = 'La fecha "hasta" es anterior al turno.'; return null; }
        return d;
      };
      $('[data-ok]', hoja).onclick = () => {
        const d = leer(); if (!d) return;
        if (nuevo) { guardarAgenda(Object.assign({ id: uid(), excepciones: [], hecha: false, anulado: false, creado: new Date().toISOString() }, d)); cerrar(); ir(`#/agenda/${d.fecha}`); aviso(d.repite ? 'Turno agendado todas las semanas.' : 'Turno agendado.'); return; }
        if (a.repite === 'semanal') { cerrar(); preguntarAlcance('Cambiar el turno', (alcance) => cambiarSerie(a, fechaVista, d, alcance)); return; }
        guardarAgenda(Object.assign({}, a, d)); cerrar(); render(); aviso('Turno cambiado.');
      };
      const ses = $('[data-ses]', hoja);
      if (ses) ses.onclick = () => { const p = paciente(a.pid); cerrar(); hojaSesion(p, null, { fecha: fechaVista, turno: a.id }); };
      const can = $('[data-cancelar]', hoja);
      if (can) can.onclick = () => {
        cerrar();
        if (a.repite === 'semanal') preguntarAlcance('Cancelar el turno', (alcance) => cancelarSerie(a, fechaVista, alcance));
        else confirmar('Cancelar turno', 'Se saca de la agenda y de tu Google Calendar. Queda en el registro.', 'Cancelar turno', () => { guardarAgenda(Object.assign({}, a, { anulado: true })); render(); aviso('Turno cancelado.'); });
      };
    });
  }
  function preguntarAlcance(tituloH, fn) {
    abrirHoja(`<div class="fila entre"><h3>${tituloH}</h3><button class="cerrar" data-cerrar>${ic('cerrar')}</button></div>
      <p>Este turno se repite todas las semanas.</p>
      <button class="btn btn-grande btn-bloque" data-al="uno">Solo este día</button>
      <button class="btn btn-oscuro btn-grande btn-bloque" data-al="siguientes">Este y los que siguen</button>`, (hoja, cerrar) => {
      $$('[data-al]', hoja).forEach((b) => { b.onclick = () => { cerrar(); fn(b.dataset.al); }; });
    });
  }
  function cambiarSerie(a, dia, d, alcance) {
    if (alcance === 'uno') {
      guardarAgenda(Object.assign({}, a, { excepciones: [...new Set([...(a.excepciones || []), dia])] }));
      guardarAgenda(Object.assign({ id: uid(), excepciones: [], hecha: false, anulado: false, creado: new Date().toISOString() }, d, { repite: '', hasta: '' }));
    } else if (dia <= a.fecha) {
      guardarAgenda(Object.assign({}, a, d, { excepciones: (a.excepciones || []).filter((f) => f >= d.fecha) }));
    } else {
      guardarAgenda(Object.assign({}, a, { hasta: sumarDias(dia, -1) }));
      guardarAgenda(Object.assign({ id: uid(), hecha: false, anulado: false, creado: new Date().toISOString() }, d, { excepciones: (a.excepciones || []).filter((f) => f > dia), hasta: d.hasta || a.hasta || '' }));
    }
    render(); aviso('Turno cambiado.');
  }
  function cancelarSerie(a, dia, alcance) {
    if (alcance === 'uno') guardarAgenda(Object.assign({}, a, { excepciones: [...new Set([...(a.excepciones || []), dia])] }));
    else if (dia <= a.fecha) guardarAgenda(Object.assign({}, a, { anulado: true }));
    else guardarAgenda(Object.assign({}, a, { hasta: sumarDias(dia, -1) }));
    render(); aviso(alcance === 'uno' ? 'Turno de ese día cancelado.' : 'Turnos cancelados desde ese día.');
  }

  function hojaAlerta(a, pre = {}) {
    const nueva = !a;
    const v = a || { titulo: '', fecha: pre.fecha || hoyISO(), hora: '09:00', aviso: '0', nota: '' };
    abrirHoja(`
      <div class="fila entre"><h3>${nueva ? 'Nueva alerta' : 'Alerta'}</h3><button class="cerrar" data-cerrar>${ic('cerrar')}</button></div>
      <label class="campo"><span class="etq">Qué te recuerdo</span><input class="entrada" id="al-tit" value="${esc(v.titulo)}" placeholder="Mandar el informe a la escuela"></label>
      <div class="form-grid">
        <label class="campo"><span class="etq">Fecha</span><input class="entrada" type="date" id="al-fecha" value="${v.fecha}"></label>
        <label class="campo"><span class="etq">Hora</span><input class="entrada" type="time" id="al-hora" value="${esc(v.hora)}"></label>
      </div>
      <label class="campo"><span class="etq">Aviso</span><select class="entrada" id="al-aviso">${opcionesAviso(v.aviso)}</select></label>
      <label class="campo"><span class="etq">Nota</span><input class="entrada" id="al-nota" value="${esc(v.nota)}"></label>
      <p class="chico alerta-txt" id="al-msj" role="status"></p>
      <button class="btn btn-oscuro btn-grande btn-bloque" data-ok>${nueva ? 'Crear alerta' : 'Guardar cambios'}</button>
      ${nueva ? '' : `<div class="acciones"><button class="btn" data-hecha>${a.hecha ? 'Marcar pendiente' : 'Ya está hecha'}</button><button class="btn btn-peligro" data-borrar>Borrar alerta</button></div>`}`, (hoja, cerrar) => {
      $('[data-ok]', hoja).onclick = () => {
        const d = { tipo: 'alerta', pid: '', titulo: $('#al-tit', hoja).value.trim(), fecha: $('#al-fecha', hoja).value, hora: $('#al-hora', hoja).value, aviso: $('#al-aviso', hoja).value, nota: $('#al-nota', hoja).value.trim(), dur: '15', repite: '', hasta: '' };
        if (!d.titulo) { $('#al-msj', hoja).textContent = 'Escribí qué te recuerdo.'; return; }
        if (!d.fecha || !d.hora) { $('#al-msj', hoja).textContent = 'Falta la fecha o la hora.'; return; }
        guardarAgenda(nueva ? Object.assign({ id: uid(), excepciones: [], hecha: false, anulado: false, creado: new Date().toISOString() }, d) : Object.assign({}, a, d));
        cerrar(); if (ruta === 'agenda') ir(`#/agenda/${d.fecha}`); else render(); aviso(nueva ? 'Alerta creada.' : 'Alerta guardada.');
      };
      const h = $('[data-hecha]', hoja);
      if (h) h.onclick = () => { guardarAgenda(Object.assign({}, a, { hecha: !a.hecha })); cerrar(); render(); };
      const b = $('[data-borrar]', hoja);
      if (b) b.onclick = () => { cerrar(); confirmar('Borrar alerta', 'Se saca de la agenda y de tu Google Calendar.', 'Borrar', () => { guardarAgenda(Object.assign({}, a, { anulado: true })); render(); }); };
      if (nueva) setTimeout(() => $('#al-tit', hoja).focus(), 80);
    });
  }

  function hojaNuevo() {
    abrirHoja(`<div class="fila entre"><h3>¿Qué querés cargar?</h3><button class="cerrar" data-cerrar>${ic('cerrar')}</button></div>
      <ul class="lista caja">
        <li><button class="item" data-n="sesion">${ic('sesion')}<span class="txt"><span class="nom">Anotar sesión</span><span class="sub">Asistencia y nota de evolución</span></span></button></li>
        <li><button class="item" data-n="turno">${ic('agenda')}<span class="txt"><span class="nom">Nuevo turno</span><span class="sub">Agendar una sesión o una reunión</span></span></button></li>
        <li><button class="item" data-n="alerta">${ic('campana')}<span class="txt"><span class="nom">Nueva alerta</span><span class="sub">Un recordatorio con aviso en el celular</span></span></button></li>
      </ul>`, (hoja, cerrar) => {
      $$('[data-n]', hoja).forEach((b) => { b.onclick = () => { cerrar(); const p = ruta === 'p' ? paciente(vista.dataset.pid) : null; if (b.dataset.n === 'sesion') hojaSesion(p); else if (b.dataset.n === 'turno') hojaTurno(null, { pid: p ? p.id : undefined, fecha: ruta === 'agenda' ? ($('[data-accion="turno"]') || {}).dataset?.fecha : undefined }); else hojaAlerta(null); }; });
    });
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
      <div class="fila entre solo-cel"><a class="btn-texto chico" href="#/agenda">${ic('izq')}Agenda</a></div>
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
        <div class="caja-cab"><span class="etq">Tus datos</span></div>
        <ul class="lista"><li><button class="item" data-accion="perfil"><span class="monograma" data-monograma></span><span class="txt"><span class="nom">${esc(perfil.nombre || 'Poné tu nombre')}</span><span class="sub">${esc([perfil.profesion, perfil.matricula ? `Mat. ${perfil.matricula}` : ''].filter(Boolean).join(' · ') || 'Nombre, matrícula y contacto para el recetario')}</span></span>${ic('lapiz')}</button></li></ul>
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
        <div class="caja-cab"><span class="etq">Informes</span></div>
        <ul class="lista">${testsActuales().map((t) => `<li><a class="item" href="#/tests/${t.id}">${ic('informe')}<span class="txt"><span class="nom">${esc(t.nombre)}</span><span class="sub">${t.ejemplo ? 'Rangos de ejemplo: cargá los tuyos' : `${t.rangos.length} rangos · ${Object.keys(t.textos || {}).length} textos guardados`}</span></span>${ic('der')}</a></li>`).join('')}</ul>
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
  // pre: { fecha, turno } cuando la sesión sale de un turno de la agenda.
  function hojaSesion(p, s, pre) {
    if (!p) { if (!activos().length) { aviso('Primero cargá un paciente.'); return; } hojaElegirPaciente((x) => hojaSesion(x)); return; }
    const nueva = !s;
    const b = db.borrador && db.borrador.pid === p.id && (db.borrador.sid || null) === (s ? s.id : null) ? db.borrador : null;
    const v = Object.assign({ fecha: (pre && pre.fecha) || hoyISO(), estado: 'asistio', nota: '' }, s || {}, b || {});
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
        const nuevaS = nueva ? { id: uid(), pid: p.id, creado: ahora, anulada: false, editado: '', turno: (pre && pre.turno) || '' } : Object.assign({}, s, { editado: ahora });
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

  /* ------------------------------------------------------------ informes escritos en la app */
  const clonar = (x) => JSON.parse(JSON.stringify(x));
  function testsActuales() { return TESTS_BASE.map((b) => (db.tests || []).find((t) => t.id === b.id) || b).concat((db.tests || []).filter((t) => !TESTS_BASE.some((b) => b.id === t.id))); }
  const testDe = (id) => testsActuales().find((t) => t.id === id);
  const categoriaDe = (t, n) => { const v = Number(n); if (!t || String(n).trim() === '' || isNaN(v)) return ''; const r = (t.rangos || []).find((x) => v >= Number(x.min) && v <= Number(x.max)); return r ? r.cat : ''; };
  const informesDe = (pid) => (db.informes || []).filter((i) => i.pid === pid && i.estado !== 'borrado').sort((a, b) => String(b.editado || b.creado).localeCompare(String(a.editado || a.creado)));
  function informeHTML(i) {
    const t = testDe(i.contenido && i.contenido.test);
    return `<li><a class="item" href="#/informe/${i.id}">${ic('lapiz')}<span class="txt"><span class="nom">Informe${t ? ` · ${esc(t.nombre)}` : ''}</span><span class="sub">${fmtCorta(i.fecha)}</span></span>${i.estado === 'generado' ? '<span class="badge b-ok">listo</span>' : '<span class="badge b-aviso">borrador</span>'}</a></li>`;
  }
  function nuevoInforme(p) {
    const ultimo = (db.informes || []).filter((i) => i.contenido && i.contenido.test).sort((a, b) => String(b.creado).localeCompare(String(a.creado)))[0];
    const i = {
      id: uid(), pid: p.id, paciente: nombreLista(p), fecha: hoyISO(), estado: 'borrador', creado: new Date().toISOString(), editado: new Date().toISOString(),
      contenido: { test: ultimo ? ultimo.contenido.test : 'wppsi4', escolaridad: [p.grado, p.escuela].filter(Boolean).join('. '), dx: (p.dx || []).join('. '), titulos: {}, secciones: {}, puntajes: {}, conclusion: '', sugerencias: '' },
    };
    i.test = i.contenido.test;
    db.informes.push(i); enviar({ op: 'informe', i }); guardar();
    ir(`#/informe/${i.id}`);
  }
  let tInforme;
  function guardarInforme(i, ya) {
    i.editado = new Date().toISOString(); i.test = i.contenido.test;
    guardarPronto();
    clearTimeout(tInforme);
    const mandar = () => enviar({ op: 'informe', i: clonar(i) });
    if (ya) mandar(); else tInforme = setTimeout(mandar, 2500);
  }

  function vInforme(id) {
    const i = (db.informes || []).find((x) => x.id === id);
    const p = i && paciente(i.pid);
    if (!i || !p) { titulo('Informe'); vista.innerHTML = '<p class="vacio">No encontré ese informe.</p>'; return; }
    titulo(`Informe · ${nombreLista(p)}`);
    const c = i.contenido;
    c.titulos = c.titulos || {}; c.secciones = c.secciones || {}; c.puntajes = c.puntajes || {};
    const t = testDe(c.test);
    const area = (k, v, ph = '', filas = 5) => `<textarea class="entrada area crece" data-k="${k}" rows="${filas}" placeholder="${esc(ph)}">${esc(v || '')}</textarea>`;
    const e = edad(p.fn, i.fecha);
    vista.innerHTML = `<div class="informe-editor">
      <div class="fila entre" style="flex-wrap:wrap"><a class="btn-texto chico" href="#/p/${p.id}">${ic('izq')}${esc(nombreLista(p))}</a>
        <span class="chico tenue" id="inf-estado">${i.estado === 'generado' ? 'Generado · si cambiás algo, generalo de nuevo' : 'Borrador · se guarda solo'}</span></div>
      <section class="caja"><div class="caja-cab"><span class="etq">Datos</span></div><div class="caja-cuerpo pila">
        <p class="chico tinta-2"><b>${esc(nombreLista(p).toLocaleUpperCase('es-AR'))}</b> · DNI ${esc(fmtDNI(p.dni) || '—')} · ${esc(fmtDMY(p.fn) || 'sin fecha de nac.')} · ${esc(fmtEdadLarga(e) || '')}</p>
        <div class="form-grid"><label class="campo"><span class="etq">Fecha del informe</span><input class="entrada" type="date" data-k="fecha" value="${i.fecha}"></label>
          <label class="campo"><span class="etq">Test</span><select class="entrada" data-k="test"><option value="">Sin test</option>${testsActuales().map((x) => `<option value="${x.id}"${x.id === c.test ? ' selected' : ''}>${esc(x.nombre)}</option>`).join('')}</select></label></div>
        <label class="campo"><span class="etq">Escolaridad · un renglón por dato</span>${area('escolaridad', c.escolaridad, 'Sala de 5. Escuela…', 2)}</label>
        <label class="campo"><span class="etq">Diagnóstico · un renglón por diagnóstico</span>${area('dx', c.dx, 'Diagnóstico neurología: …', 2)}</label>
      </div></section>
      ${SECCIONES.map(([k, tit]) => `<section class="caja"><div class="caja-cab"><input class="titulo-sec" data-titulo="${k}" value="${esc(c.titulos[k] || tit)}" aria-label="Título de la sección"></div><div class="caja-cuerpo">${area(`sec.${k}`, c.secciones[k])}</div></section>`).join('')}
      ${t ? `<section class="caja"><div class="caja-cab"><span class="etq">${esc(t.titulo)}</span><a class="btn-texto chico" href="#/tests/${t.id}">${ic('lapiz')}Rangos y textos</a></div>
        ${t.ejemplo ? '<div class="caja-cuerpo"><div class="nota chico">Las categorías se sugieren con rangos de ejemplo. Cargá tus rangos en <b>Ajustes → Informes</b>.</div></div>' : ''}
        ${t.grupos.map((g) => `<div class="grupo-test"><div class="etq grupo-tit">${esc(g.titulo)}</div>
          ${g.escalas.map((es) => { const v = c.puntajes[es.id] || {}; return `<div class="escala${es.total ? ' total' : ''}" data-esc="${es.id}">
            <div class="escala-nom"><b>${esc(es.etiqueta)}</b><span class="chico tenue">${esc(es.indice)}</span></div>
            <div class="escala-num"><label><span class="etq">Escalar</span><input class="entrada entrada-chica" inputmode="numeric" data-p="e" value="${esc(v.e || '')}"></label>
              <label><span class="etq">Compuesta</span><input class="entrada entrada-chica" inputmode="numeric" data-p="c" value="${esc(v.c || '')}"></label>
              <label class="cat"><span class="etq">Categoría</span><input class="entrada entrada-chica" list="cats-${t.id}" data-p="cat" value="${esc(v.cat || '')}"></label></div>
            <label class="campo"><span class="etq">Significado</span><textarea class="entrada area crece" rows="2" data-p="sig">${esc(v.sig || '')}</textarea></label>
            <button type="button" class="btn-texto chico" data-guardar-texto="${es.id}">${ic('copia')}Usar siempre este texto para esta categoría</button>
          </div>`; }).join('')}</div>`).join('')}
        <datalist id="cats-${t.id}">${[...new Set((t.rangos || []).map((r) => r.cat))].map((x) => `<option value="${esc(x)}">`).join('')}</datalist>
      </section>` : ''}
      <section class="caja"><div class="caja-cab"><span class="etq">Conclusión diagnóstica</span></div><div class="caja-cuerpo">${area('conclusion', c.conclusion, '', 6)}</div></section>
      <section class="caja"><div class="caja-cab"><span class="etq">Sugerencias de trabajo · una por renglón</span></div><div class="caja-cuerpo">${area('sugerencias', c.sugerencias, 'Soporte visual constante: …', 6)}</div></section>
      <div class="acciones">
        <button class="btn btn-grande" data-accion="vista-informe">${ic('informe')}Vista previa</button>
        <button class="btn btn-acento btn-grande" data-accion="generar-informe">${ic('copia')}Generar Word y PDF</button>
      </div>
      ${i.estado === 'generado' && i.pdfUrl ? `<div class="fila" style="flex-wrap:wrap"><a class="btn" href="${esc(i.pdfUrl)}" target="_blank" rel="noopener">${ic('bajar')}Abrir el PDF</a><a class="btn" href="${esc(i.docUrl)}" target="_blank" rel="noopener">${ic('lapiz')}Abrir en Google Docs</a></div>` : ''}
      <button class="btn btn-chico btn-peligro" data-accion="borrar-informe" style="align-self:flex-start">${ic('tacho')}Borrar este informe</button>
    </div>`;
    vista.dataset.inf = i.id;
    const ed = $('.informe-editor', vista);
    ed.addEventListener('input', (ev) => {
      const el = ev.target;
      if (el.dataset.titulo) { c.titulos[el.dataset.titulo] = el.value; return guardarInforme(i); }
      const k = el.dataset.k;
      if (k === 'fecha') i.fecha = el.value;
      else if (k === 'test') { c.test = el.value; guardarInforme(i, true); render(); return; }
      else if (k && k.startsWith('sec.')) c.secciones[k.slice(4)] = el.value;
      else if (k) c[k] = el.value;
      const esc_ = el.closest('[data-esc]');
      if (esc_ && el.dataset.p) {
        const v = c.puntajes[esc_.dataset.esc] = c.puntajes[esc_.dataset.esc] || {};
        v[el.dataset.p] = el.value;
        if (el.dataset.p === 'cat') v.catAuto = false;
        if (el.dataset.p === 'sig') v.sigAuto = false;
        if (el.dataset.p === 'c' || el.dataset.p === 'cat') sugerir(t, esc_, v, el.dataset.p === 'c');
      }
      guardarInforme(i);
    });
    ed.addEventListener('change', (ev) => { if (ev.target.dataset.k === 'test') return; guardarInforme(i, true); });
  }
  // Con la compuesta sugiere la categoría (si no la escribió ella) y con la categoría, su texto guardado.
  function sugerir(t, fila, v, porNumero) {
    if (porNumero && (v.catAuto !== false || !v.cat)) { v.cat = categoriaDe(t, v.c); v.catAuto = true; $('[data-p="cat"]', fila).value = v.cat; }
    const texto = (t.textos || {})[`${fila.dataset.esc}|${v.cat}`];
    if (texto != null && (v.sigAuto !== false || !v.sig)) { v.sig = texto; v.sigAuto = true; $('[data-p="sig"]', fila).value = texto; }
  }
  function guardarTextoHabitual(escalaId) {
    const i = db.informes.find((x) => x.id === vista.dataset.inf); if (!i) return;
    const v = (i.contenido.puntajes || {})[escalaId] || {};
    if (!v.cat || !v.sig) { aviso('Escribí la categoría y el significado primero.'); return; }
    const t = clonar(testDe(i.contenido.test));
    t.textos = t.textos || {}; t.textos[`${escalaId}|${v.cat}`] = v.sig;
    guardarTest(t);
    aviso(`Guardado: la próxima vez que salga "${v.cat}" se completa solo.`);
  }
  function guardarTest(t) {
    db.tests = (db.tests || []).filter((x) => x.id !== t.id).concat([t]);
    enviar({ op: 'test', t });
    guardar();
  }

  // El informe como lista de bloques: lo usan la vista previa y el script que arma el documento.
  function bloquesInforme(i) {
    const p = paciente(i.pid) || {};
    const c = i.contenido;
    const t = testDe(c.test);
    const lineas = (x) => String(x || '').split('\n').map((l) => l.trim()).filter(Boolean);
    const bl = [{ t: 'titulo', texto: 'INFORME PSICOPEDAGÓGICO' }, { t: 'espacio' }];
    bl.push({ t: 'dato', etiqueta: 'Apellido y Nombre', valor: nombreLista(p).toLocaleUpperCase('es-AR') });
    if (p.dni) bl.push({ t: 'dato', etiqueta: 'DNI', valor: fmtDNI(p.dni) });
    if (p.fn) bl.push({ t: 'dato', etiqueta: 'Fecha de Nacimiento', valor: fmtDMY(p.fn) });
    if (p.fn) bl.push({ t: 'dato', etiqueta: 'Edad', valor: fmtEdadLarga(edad(p.fn, i.fecha)) });
    lineas(c.escolaridad).forEach((l, k) => bl.push(k === 0 ? { t: 'dato', etiqueta: 'Escolaridad', valor: l } : { t: 'lista', items: [l] }));
    lineas(c.dx).forEach((l) => { const m = l.match(/^([^:]{3,40}):\s*(.+)$/); bl.push(m ? { t: 'dato', etiqueta: m[1], valor: m[2] } : { t: 'dato', etiqueta: 'Diagnóstico', valor: l }); });
    bl.push({ t: 'dato', etiqueta: 'Fecha de Informe', valor: fmtMes(mesDe(i.fecha)) });
    SECCIONES.forEach(([k, tit]) => { const txt = (c.secciones || {})[k]; if (!String(txt || '').trim()) return; bl.push({ t: 'espacio' }, { t: 'seccion', texto: `${(c.titulos || {})[k] || tit}:` }, { t: 'texto', texto: txt.trim() }); });
    if (t) {
      const pts = c.puntajes || {};
      const usados = t.grupos.map((g) => ({ g, es: g.escalas.filter((e) => { const v = pts[e.id] || {}; return v.e || v.c || v.cat || v.sig; }) })).filter((x) => x.es.length);
      if (usados.length) {
        bl.push({ t: 'espacio' }, { t: 'seccion', texto: 'Resultados obtenidos de la evaluación neurocognitiva aplicada:' }, { t: 'subtitulo', texto: `${t.titulo}:` });
        usados.forEach(({ g }) => {
          const filas = [['ESCALAS', 'Puntuaciones escalares', 'Puntuación compuesta', 'CATEGORÍA']].concat(g.escalas.map((e) => { const v = pts[e.id] || {}; return [e.etiqueta, v.e || '', v.c || '', v.cat || '']; }));
          bl.push({ t: 'espacio' }, { t: 'centro', texto: `${g.titulo}:` }, { t: 'tabla', filas, ultimaNegrita: g.escalas.some((e) => e.total) }, { t: 'espacio' }, { t: 'centro', texto: g.tituloIndices, negrita: true });
          g.escalas.forEach((e) => {
            const v = pts[e.id] || {};
            if (!v.c && !v.cat && !v.sig) return;
            bl.push({ t: 'espacio' }, { t: 'subtitulo', texto: `${e.indice}: ${v.c || ''}`.trim() });
            bl.push({ t: 'lista', negrita: true, items: [v.cat ? `Categoría: ${v.cat}.` : '', v.sig ? `Significado: ${v.sig}` : ''] });
          });
        });
      }
    }
    if (String(c.conclusion || '').trim()) bl.push({ t: 'espacio' }, { t: 'seccion', texto: 'CONCLUSION DIAGNÓSTICA:' }, { t: 'texto', texto: c.conclusion.trim() });
    if (lineas(c.sugerencias).length) bl.push({ t: 'espacio' }, { t: 'seccion', texto: 'Sugerencias de trabajo:' }, { t: 'lista', items: lineas(c.sugerencias) });
    return bl;
  }
  function bloquesHTML(bl) {
    return bl.map((b) => {
      if (b.t === 'espacio') return '<div class="b-esp"></div>';
      if (b.t === 'titulo') return `<p class="b-titulo">${esc(b.texto)}</p>`;
      if (b.t === 'centro') return `<p class="b-centro${b.negrita ? ' n' : ''}">${esc(b.texto)}</p>`;
      if (b.t === 'seccion') return `<p class="b-sec">❖ <span>${esc(b.texto)}</span></p>`;
      if (b.t === 'subtitulo') return `<p class="b-sec">➢ <span>${esc(b.texto)}</span></p>`;
      if (b.t === 'dato') return `<p class="b-dato">• <span>${esc(b.etiqueta)}:</span> ${esc(b.valor)}</p>`;
      if (b.t === 'texto') return b.texto.split('\n').map((l) => `<p class="b-texto">${esc(l) || '&nbsp;'}</p>`).join('');
      if (b.t === 'lista') return b.items.filter(Boolean).map((l) => `<p class="b-dato${b.negrita ? ' n' : ''}">• ${esc(l)}</p>`).join('');
      if (b.t === 'tabla') return `<table class="b-tabla">${b.filas.map((f, r) => `<tr>${f.map((x, k) => `<td class="${r === 0 || k === 0 || (b.ultimaNegrita && r === b.filas.length - 1) ? 'n' : ''}">${esc(x)}</td>`).join('')}</tr>`).join('')}</table>`;
      return '';
    }).join('');
  }
  function hojaVistaInforme(i) {
    abrirHoja(`<div class="fila entre"><h3>Vista previa</h3><button class="cerrar" data-cerrar>${ic('cerrar')}</button></div>
      <p class="chico tenue">Así queda el texto. El membrete, el pie y el número de página salen de tu plantilla cuando lo generás.</p>
      <div class="papel">${bloquesHTML(bloquesInforme(i))}</div>`);
  }
  async function generarInforme(i) {
    if (!conexion) { hojaInforme(paciente(i.pid)); return; }
    const pl = db.plantillas.find((x) => /psicopedag/i.test(x.nombre)) || db.plantillas[0];
    if (!pl) { aviso('No hay plantilla en la carpeta Consultorio → Plantillas de tu Drive.'); return; }
    const p = paciente(i.pid);
    const btn = $('[data-accion="generar-informe"]');
    if (btn) { btn.disabled = true; btn.textContent = 'Armando el documento…'; }
    try {
      clearTimeout(tInforme); enviar({ op: 'informe', i: clonar(i) });
      await vaciarCola();
      const t = testDe(i.contenido.test);
      const r = await llamar(conexion, { generar: { id: i.id, plantilla: pl.id, titulo: `Informe${t ? ` ${t.nombre}` : ''} · ${nombreLista(p)} · ${fmtDMY(i.fecha).replace(/\//g, '-')}`, datos: datosInforme(p, i.fecha), cuerpo: bloquesInforme(i) } });
      if (!r.informe) throw new Error('El script de la planilla está desactualizado: pegá el Codigo.gs nuevo y publicalo como nueva versión.');
      Object.assign(i, { estado: 'generado', docUrl: r.informe.docUrl, pdfUrl: r.informe.pdfUrl });
      db.documentos = db.documentos.filter((d) => d.id !== r.informe.docuId).concat([r.documento]);
      guardar(); render();
      abrirHoja(`<div class="fila entre"><h3>Informe listo</h3><button class="cerrar" data-cerrar>${ic('cerrar')}</button></div>
        <p>Quedó en la carpeta de <b>${esc(nombreLista(p))}</b>, en <b>Mis informes</b>, con tu membrete. Está en PDF para mandar o imprimir, y en Google Docs por si querés retocar algo.</p>
        <a class="btn btn-acento btn-grande btn-bloque" href="${esc(i.pdfUrl)}" target="_blank" rel="noopener">${ic('bajar')}Abrir el PDF</a>
        <a class="btn btn-grande btn-bloque" href="${esc(i.docUrl)}" target="_blank" rel="noopener">${ic('lapiz')}Abrir en Google Docs</a>`);
    } catch (e) {
      aviso(e.message === 'Failed to fetch' ? 'No hay conexión. Probá de nuevo en un rato.' : e.message);
      if (btn) { btn.disabled = false; btn.textContent = 'Generar Word y PDF'; }
    }
  }

  // Ajustes → Tests: rangos, escalas y textos guardados.
  function vTests(id) {
    const base_ = testDe(id);
    if (!base_) { titulo('Tests'); vista.innerHTML = '<p class="vacio">No encontré ese test.</p>'; return; }
    const t = clonar(base_);
    titulo(t.nombre);
    const filaRango = (r) => `<div class="rango"><input class="entrada entrada-chica" inputmode="numeric" data-r="min" value="${esc(r.min)}" aria-label="Desde"><span class="tenue">a</span><input class="entrada entrada-chica" inputmode="numeric" data-r="max" value="${esc(r.max)}" aria-label="Hasta"><input class="entrada entrada-chica" data-r="cat" value="${esc(r.cat)}" placeholder="Categoría" aria-label="Categoría"><button type="button" class="cerrar" data-quitar aria-label="Quitar">${ic('cerrar')}</button></div>`;
    const filaEscala = (e) => `<div class="escala-cfg" data-id="${esc(e.id)}"><input class="entrada entrada-chica" data-e="etiqueta" value="${esc(e.etiqueta)}" placeholder="En la tabla" aria-label="Nombre en la tabla"><input class="entrada entrada-chica" data-e="indice" value="${esc(e.indice)}" placeholder="Nombre del índice" aria-label="Nombre del índice"><label class="chico"><input type="checkbox" data-e="total" ${e.total ? 'checked' : ''}> total</label><button type="button" class="cerrar" data-quitar aria-label="Quitar">${ic('cerrar')}</button></div>`;
    const textos = Object.entries(t.textos || {});
    const nombreEsc = (eid) => { for (const g of t.grupos) { const e = g.escalas.find((x) => x.id === eid); if (e) return e.etiqueta; } return eid; };
    vista.innerHTML = `<div class="ajustes-test pila">
      <a class="btn-texto chico" href="#/ajustes">${ic('izq')}Ajustes</a>
      <section class="caja"><div class="caja-cab"><span class="etq">Rangos de puntuación compuesta</span></div><div class="caja-cuerpo pila">
        ${t.ejemplo ? '<div class="nota chico">Estos rangos son de ejemplo. Cambialos por los que usás para este test.</div>' : ''}
        <div id="rangos" class="pila">${t.rangos.map(filaRango).join('')}</div>
        <button type="button" class="btn btn-chico" id="mas-rango" style="align-self:flex-start">${ic('mas')}Agregar rango</button></div></section>
      ${t.grupos.map((g, gi) => `<section class="caja" data-g="${gi}"><div class="caja-cab"><input class="titulo-sec" data-gt="titulo" value="${esc(g.titulo)}" aria-label="Título del grupo"></div><div class="caja-cuerpo pila">
        <label class="campo"><span class="etq">Título del análisis</span><input class="entrada" data-gt="tituloIndices" value="${esc(g.tituloIndices)}"></label>
        <div class="pila escalas">${g.escalas.map(filaEscala).join('')}</div>
        <button type="button" class="btn btn-chico" data-mas-escala style="align-self:flex-start">${ic('mas')}Agregar escala</button></div></section>`).join('')}
      <section class="caja"><div class="caja-cab"><span class="etq">Textos guardados</span></div>
        ${textos.length ? `<ul class="lista">${textos.map(([k, v]) => { const [eid, cat] = k.split('|'); return `<li class="texto-guardado" data-tk="${esc(k)}"><div class="caja-cuerpo pila"><b class="chico">${esc(nombreEsc(eid))} · ${esc(cat)}</b><textarea class="entrada area crece" rows="2">${esc(v)}</textarea><button type="button" class="btn-texto chico" data-quitar-texto>${ic('tacho')}Borrar</button></div></li>`; }).join('')}</ul>`
          : '<p class="vacio chico">En el informe, tocá "Usar siempre este texto para esta categoría" y queda acá.</p>'}
      </section>
      <button class="btn btn-oscuro btn-grande btn-bloque" id="guardar-test">Guardar</button>
    </div>`;
    const v = $('.ajustes-test', vista);
    $('#mas-rango', v).onclick = () => $('#rangos', v).insertAdjacentHTML('beforeend', filaRango({ min: '', max: '', cat: '' }));
    v.addEventListener('click', (e) => {
      const q = e.target.closest('[data-quitar]'); if (q) { q.parentElement.remove(); return; }
      const qt = e.target.closest('[data-quitar-texto]'); if (qt) { qt.closest('[data-tk]').remove(); return; }
      const me = e.target.closest('[data-mas-escala]'); if (me) me.previousElementSibling.insertAdjacentHTML('beforeend', filaEscala({ id: uid(), etiqueta: '', indice: '', total: false }));
    });
    $('#guardar-test', v).onclick = () => {
      t.rangos = $$('.rango', v).map((f) => ({ min: Number($('[data-r="min"]', f).value), max: Number($('[data-r="max"]', f).value), cat: $('[data-r="cat"]', f).value.trim() })).filter((r) => r.cat && !isNaN(r.min) && !isNaN(r.max));
      t.grupos = t.grupos.map((g, gi) => { const sec = $(`[data-g="${gi}"]`, v); return Object.assign({}, g, { titulo: $('[data-gt="titulo"]', sec).value.trim(), tituloIndices: $('[data-gt="tituloIndices"]', sec).value.trim(), escalas: $$('.escala-cfg', sec).map((f) => ({ id: f.dataset.id, etiqueta: $('[data-e="etiqueta"]', f).value.trim(), indice: $('[data-e="indice"]', f).value.trim(), total: $('[data-e="total"]', f).checked })).filter((x) => x.etiqueta) }); });
      t.textos = {}; $$('[data-tk]', v).forEach((li) => { const tx = $('textarea', li).value.trim(); if (tx) t.textos[li.dataset.tk] = tx; });
      t.ejemplo = false;
      guardarTest(t); aviso('Test guardado.'); ir('#/ajustes');
    };
  }

  function datosInforme(p, fecha) {
    const asist = validas(sesionesDe(p.id)).filter((s) => s.estado === 'asistio' && s.fecha <= fecha);
    const primera = asist[asist.length - 1];
    return {
      nombre: nombreCompleto(p), apellido_nombre: nombreLista(p).toLocaleUpperCase('es-AR'), apellido: p.apellido, nombres: p.nombre, dni: fmtDNI(p.dni),
      fecha_nacimiento: fmtDMY(p.fn), edad: fmtEdadLarga(edad(p.fn, fecha)), edad_anios: fmtEdad(edad(p.fn, fecha)),
      obra_social: p.os || '', afiliado: p.afiliado || '', diagnostico: (p.dx || []).join('. '),
      escuela: p.escuela || '', grado: p.grado || '', responsables: p.tutores || '',
      equipo: (p.equipo || []).map((c) => `${c.rol}: ${[c.nombre, c.contacto].filter(Boolean).join(' · ')}`).join('\n'),
      inicio_tratamiento: primera ? fmtDMY(primera.fecha) : '', sesiones: String(asist.length), fecha: fmtLarga(fecha), mes_anio: fmtMes(mesDe(fecha)), anio: fecha.slice(0, 4),
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
          await vaciarCola();
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
          await vaciarCola();
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
    const campo = (id, et, v, extra = '') => `<label class="campo"><span class="etq">${et}</span><input class="entrada" id="${id}" value="${esc(v)}" ${extra}></label>`;
    abrirHoja(`
      <div class="fila entre"><h3>Tus datos</h3><button class="cerrar" data-cerrar>${ic('cerrar')}</button></div>
      <p class="chico tinta-2">Tu nombre aparece arriba en la app y en la pantalla del PIN. Con el resto se arma el membrete del recetario. Se guarda en tu planilla, así lo ves igual en todos tus dispositivos.</p>
      ${campo('pf-nombre', 'Nombre', perfil.nombre, 'placeholder="Mariela E. Barboza" autocapitalize="words"')}
      ${campo('pf-prof', 'Profesión', perfil.profesion, 'placeholder="Lic. Psicopedagogía"')}
      ${campo('pf-mat', 'Matrícula', perfil.matricula, 'placeholder="Mat. Prof. N° 261"')}
      ${campo('pf-mail', 'Mail', perfil.email, 'type="email" autocapitalize="off"')}
      ${campo('pf-tel', 'Teléfono', perfil.telefono, 'inputmode="tel"')}
      ${campo('pf-dir', 'Dirección', perfil.direccion, 'placeholder="Calle 123, 4to piso, Posadas"')}
      <button class="btn btn-oscuro btn-grande btn-bloque" data-ok>Guardar</button>`, (hoja, cerrar) => {
      $('[data-ok]', hoja).onclick = () => {
        guardarPerfil({ nombre: $('#pf-nombre', hoja).value, profesion: $('#pf-prof', hoja).value, matricula: $('#pf-mat', hoja).value, email: $('#pf-mail', hoja).value, telefono: $('#pf-tel', hoja).value, direccion: $('#pf-dir', hoja).value }, true);
        cerrar(); render(); aviso('Datos guardados.');
      };
      if (!perfil.nombre) setTimeout(() => $('#pf-nombre', hoja).focus(), 80);
    });
  }
  /* ------------------------------------------------------------ solicitudes a la obra social (recetario) */
  function hojaSolicitud(p, x) {
    const nueva = !x;
    const ultima = solicitudesDe(p.id).find((y) => !y.anulada);
    const base = x || ultima;
    const items = CODIGOS.map((c, i) => {
      const prev = base && base.items.find((y) => y.cod === c.cod);
      return { cod: c.cod, cant: prev ? prev.cant : c.cant, si: base ? !!prev : i === 0 };
    });
    const libres = POR_HOJA - (db.hoja || []).length;
    abrirHoja(`
      <div class="fila entre"><h3>${nueva ? 'Nueva solicitud' : 'Solicitud'}</h3><button class="cerrar" data-cerrar>${ic('cerrar')}</button></div>
      <p class="tinta-2"><b>${esc(nombreLista(p).toLocaleUpperCase('es-AR'))}</b><br>${esc(p.os || 'Obra social')} N°: ${esc(p.afiliado || '—')}</p>
      ${!p.afiliado ? '<div class="nota">Falta el n.° de afiliado en la ficha.</div>' : ''}
      <div class="campo"><span class="etq">Solicito</span><div class="pila" id="sol-items">${items.map((it) => `
        <div class="sol-item"><label class="opcion" style="flex:1"><input type="checkbox" data-cod="${it.cod}" ${it.si ? 'checked' : ''}><span>Cód. ${it.cod}</span></label>
        <label class="sol-cant"><input class="entrada" type="number" min="1" max="99" inputmode="numeric" value="${it.cant}" data-cant="${it.cod}" aria-label="Sesiones del código ${it.cod}"><span class="chico tinta-2">sesiones</span></label></div>`).join('')}</div></div>
      <label class="campo"><span class="etq">Diagnóstico</span><textarea class="entrada area" id="sol-dx" rows="2">${esc(x ? x.dx : (p.dx || []).join('. '))}</textarea></label>
      <label class="campo"><span class="etq">Fecha</span><input class="entrada" type="date" id="sol-fecha" value="${x ? x.fecha : hoyISO()}"></label>
      <p class="chico alerta-txt" id="sol-msj" role="status"></p>
      <div class="acciones">
        <button class="btn btn-grande" data-hoja ${libres ? '' : 'disabled'}>${(db.hoja || []).includes(x && x.id) ? 'Ya está en la hoja' : `Agregar a la hoja (${(db.hoja || []).length}/${POR_HOJA})`}</button>
        <button class="btn btn-acento btn-grande" data-imprimir>${ic('imprimir')}Imprimir</button>
      </div>
      <p class="chico tenue">Se imprimen ${POR_HOJA} por hoja A4 para cortar. "Agregar a la hoja" junta varias solicitudes y las imprime todas juntas.</p>
      ${nueva ? '' : x.anulada ? '' : '<button class="btn btn-chico btn-peligro" data-anular style="align-self:flex-start">Anular solicitud</button>'}`, (hoja, cerrar) => {
      const leer = () => {
        const its = CODIGOS.map((c) => ({ cod: c.cod, cant: parseInt($(`[data-cant="${c.cod}"]`, hoja).value, 10) || 0, si: $(`[data-cod="${c.cod}"]`, hoja).checked })).filter((y) => y.si && y.cant > 0).map(({ cod, cant }) => ({ cod, cant }));
        if (!its.length) { $('#sol-msj', hoja).textContent = 'Marcá al menos un código con sus sesiones.'; return null; }
        const datos = { fecha: $('#sol-fecha', hoja).value || hoyISO(), items: its, dx: $('#sol-dx', hoja).value.trim() };
        const s2 = nueva ? Object.assign({ id: uid(), pid: p.id, anulada: false, creado: new Date().toISOString() }, datos) : Object.assign({}, x, datos);
        Object.assign(s2, { paciente: nombreLista(p), os: p.os || '', afiliado: p.afiliado || '' });
        guardarSolicitud(s2);
        return s2;
      };
      $('[data-hoja]', hoja).onclick = () => { const s2 = leer(); if (!s2) return; agregarAHoja(s2.id); cerrar(); render(); aviso(`En la hoja: ${db.hoja.length} de ${POR_HOJA}.`); };
      $('[data-imprimir]', hoja).onclick = () => { const s2 = leer(); if (!s2) return; agregarAHoja(s2.id); cerrar(); render(); imprimirHoja(); };
      const an = $('[data-anular]', hoja);
      if (an) an.onclick = () => confirmar('Anular solicitud', 'Queda en el historial como anulada. No se borra.', 'Anular', () => { guardarSolicitud(Object.assign({}, x, { anulada: true })); db.hoja = db.hoja.filter((id) => id !== x.id); guardar(); render(); });
    });
  }
  function guardarSolicitud(x) {
    db.solicitudes = db.solicitudes || [];
    const i = db.solicitudes.findIndex((y) => y.id === x.id);
    if (i >= 0) db.solicitudes[i] = x; else db.solicitudes.push(x);
    enviar({ op: 'solicitud', s: x });
    guardar();
  }
  function agregarAHoja(id) {
    db.hoja = db.hoja || [];
    if (!db.hoja.includes(id) && db.hoja.length < POR_HOJA) db.hoja.push(id);
    guardar();
  }

  const ICO_PIE = {
    mail: '<svg viewBox="0 0 24 24"><path d="M3 6h18v12H3zM3 6l9 7 9-7"/></svg>',
    tel: '<svg viewBox="0 0 24 24"><path d="M4 20l1.3-4A8 8 0 1 1 8 18.7zM9 9c0 3 3 6 6 6l1-1.5-2-1-1 1c-1-.5-2-1.5-2.5-2.5l1-1-1-2z"/></svg>',
    dir: '<svg viewBox="0 0 24 24"><path d="M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"/></svg>',
  };
  function recetaHTML(x) {
    if (!x) return '<div class="receta vacia"></div>';
    const p = paciente(x.pid) || { apellido: x.paciente, nombre: '', os: x.os, afiliado: x.afiliado };
    return `<div class="receta">
      <div class="r-cab"><img class="r-logo" src="${LOGO_RECETARIO}" alt="">
        <div class="r-marca"><div class="r-nombre">${esc(perfil.nombre)}</div><div class="r-sub">${esc(perfil.profesion)}</div><div class="r-sub">${esc(perfil.matricula)}</div></div></div>
      <div class="r-cuerpo">
        <div class="r-paciente">${esc(nombreLista(p).toLocaleUpperCase('es-AR'))}</div>
        <div>${esc(p.os || x.os || 'IPS')} N°: ${esc(p.afiliado || x.afiliado || '')}</div>
        <div class="r-solicito">Solicito:</div>
        ${x.items.map((it) => `<div>- Cód. ${esc(it.cod)} (x ${it.cant} ${it.cant === 1 ? 'sesión' : 'sesiones'})</div>`).join('')}
        ${x.dx ? `<div class="r-dx"><u>Dx</u>: ${esc(x.dx)}</div>` : ''}
      </div>
      <div class="r-pie">
        ${perfil.email ? `<span>${ICO_PIE.mail}${esc(perfil.email)}</span>` : ''}${perfil.telefono ? `<span>${ICO_PIE.tel}${esc(perfil.telefono)}</span>` : ''}${perfil.direccion ? `<span>${ICO_PIE.dir}${esc(perfil.direccion)}</span>` : ''}
      </div>
    </div>`;
  }
  async function imprimirHoja() {
    const ids = (db.hoja || []).filter((id) => db.solicitudes.some((x) => x.id === id));
    if (!ids.length) { aviso('La hoja está vacía.'); return; }
    if (!perfil.nombre || !perfil.matricula) { aviso('Completá tu nombre y matrícula para el membrete.'); hojaPerfil(); return; }
    let el = $('#impresion');
    if (!el) { el = document.createElement('div'); el.id = 'impresion'; document.body.appendChild(el); }
    el.innerHTML = Array.from({ length: POR_HOJA }, (_, i) => recetaHTML(db.solicitudes.find((x) => x.id === ids[i]))).join('');
    try { await Promise.all([document.fonts.load('600 15pt "Baloo 2"'), document.fonts.load('500 10pt "Baloo 2"'), document.fonts.load('11pt "DM Sans"')]); } catch (e) { /* imprime igual */ }
    await Promise.all($$('img', el).map((im) => (im.complete ? 0 : new Promise((ok) => { im.onload = im.onerror = ok; }))));
    document.body.classList.add('imprimiendo');
    const fin = () => {
      window.removeEventListener('afterprint', fin);
      document.body.classList.remove('imprimiendo');
      confirmar('¿Salió bien la impresión?', `Si ya imprimiste, vaciá la hoja para empezar una nueva. Las solicitudes quedan guardadas en la ficha de cada paciente.`, 'Vaciar la hoja', () => { db.hoja = []; guardar(); render(); });
    };
    window.addEventListener('afterprint', fin);
    setTimeout(() => window.print(), 50);
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
    const marcar = e.target.closest('[data-marcar]');
    if (marcar) {
      const a = db.agenda.find((x) => x.id === marcar.dataset.ag);
      if (a) { guardarSesion({ id: uid(), pid: a.pid, fecha: marcar.dataset.f, estado: marcar.dataset.marcar, nota: '', anulada: false, creado: new Date().toISOString(), editado: '', turno: a.id }); render(); aviso(`Sesión anotada: ${ASIST[marcar.dataset.marcar].toLowerCase()}. Tocá el turno para agregar la nota.`); }
      return;
    }
    const ag = e.target.closest('button[data-ag]');
    if (ag && !e.target.closest('.hoja')) {
      const a = db.agenda.find((x) => x.id === ag.dataset.ag);
      if (a) {
        const o = { a, fecha: ag.dataset.f };
        const ses = a.tipo === 'turno' && a.pid ? sesionDeTurno(o) : null;
        if (ses) hojaSesion(paciente(a.pid), ses); else if (a.tipo === 'alerta') hojaAlerta(a); else hojaTurno(o);
      }
      return;
    }
    const gt = e.target.closest('[data-guardar-texto]');
    if (gt) { guardarTextoHabitual(gt.dataset.guardarTexto); return; }
    const sol = e.target.closest('[data-solid]');
    if (sol) { const x = db.solicitudes.find((y) => y.id === sol.dataset.solid); if (x) hojaSolicitud(paciente(x.pid) || { id: x.pid, apellido: x.paciente, nombre: '', os: x.os, afiliado: x.afiliado, dx: [] }, x); return; }
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
      case 'solicitud': if (p) hojaSolicitud(p); break;
      case 'nuevo': hojaNuevo(); break;
      case 'turno': hojaTurno(null, { pid: p ? p.id : undefined, fecha: b.dataset.fecha }); break;
      case 'alerta': hojaAlerta(null, { fecha: b.dataset.fecha }); break;
      case 'nuevo-informe': if (p) nuevoInforme(p); break;
      case 'vista-informe': { const i = db.informes.find((x) => x.id === vista.dataset.inf); if (i) hojaVistaInforme(i); break; }
      case 'generar-informe': { const i = db.informes.find((x) => x.id === vista.dataset.inf); if (i) generarInforme(i); break; }
      case 'borrar-informe': { const i = db.informes.find((x) => x.id === vista.dataset.inf); if (i) confirmar('Borrar informe', 'Se saca de la ficha. Si ya lo habías generado, el PDF y el Docs siguen en tu Drive.', 'Borrar', () => { i.estado = 'borrado'; guardarInforme(i, true); ir(`#/p/${i.pid}`); }); break; }
      case 'imprimir-hoja': imprimirHoja(); break;
      case 'vaciar-hoja': confirmar('Vaciar la hoja', 'Se sacan las solicitudes de la hoja de impresión. Siguen guardadas en la ficha de cada paciente.', 'Vaciar', () => { db.hoja = []; guardar(); render(); }); break;
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
