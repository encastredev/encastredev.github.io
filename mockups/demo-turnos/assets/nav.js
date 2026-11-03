/* ==========================================================================
   Encastre Turnos · demo navegable — navegación, shells, estado y utilidades
   Datos inventados en assets/datos.js. Los turnos se generan solos para esta
   semana (siempre los mismos para cada día) y lo que se hace en la demo queda
   guardado mientras la pestaña esté abierta (sessionStorage).
   Para agregar una pantalla: sumala en SCREENS (y en MENU o TABS si corresponde).
   ========================================================================== */

const SCREENS = [
  { archivo: 'index.html', n: '00', titulo: 'Portada', disp: 'portada', rol: 'Todos', resumen: 'Qué es la demo y por dónde empezar.', probar: [] },
  { archivo: '01-agenda.html', n: '01', titulo: 'Agenda del día', corto: 'Agenda', disp: 'notebook', rol: 'Recepción',
    resumen: 'Todos los turnos del día por profesional, con los huecos libres a la vista.',
    probar: ['Cambiar de día con las flechas', 'Tocar un turno y marcarlo como confirmado o "no vino"', 'Tocar un hueco libre para dar un turno ahí'] },
  { archivo: '02-nuevo-turno.html', n: '02', titulo: 'Dar un turno', corto: 'Nuevo turno', disp: 'notebook', rol: 'Recepción',
    resumen: 'Servicio, profesional, día y horario libre en cuatro toques, sin superponer turnos.',
    probar: ['Elegir "Color" y ver que solo aparecen horarios donde entra 1 h 30 min', 'Buscar una clienta o cargar una nueva', 'Guardar y ver el mensaje de WhatsApp listo para mandar'] },
  { archivo: '03-recordatorios.html', n: '03', titulo: 'Recordatorios', disp: 'notebook', rol: 'Recepción',
    resumen: 'Los turnos de mañana sin confirmar, con el mensaje de WhatsApp armado para cada uno.',
    probar: ['Mandar un recordatorio y ver el mensaje', 'Marcar quién confirmó y quién pidió cambiar', 'Ver cómo cambia la agenda de mañana'] },
  { archivo: '11-app-agenda.html', n: '04', titulo: 'App · Mis turnos', disp: 'celular', rol: 'Profesional',
    resumen: 'Cada profesional ve sus turnos del día en el celular y marca quién llegó.',
    probar: ['Cambiar de profesional', 'Marcar "Llegó" o "No vino"', 'Ver el próximo turno destacado'] },
];

const MENU = [
  { grupo: 'Recepción', items: ['01-agenda.html', '02-nuevo-turno.html', '03-recordatorios.html'] },
  { grupo: 'App de profesionales', items: ['11-app-agenda.html'] },
  { grupo: 'También se puede', pronto: ['Cobros y señas', 'Turnos online', 'Historial de clientas'] },
];

const TABS = [
  { archivo: '11-app-agenda.html', etiqueta: 'Mis turnos', icono: 'calendar' },
  { archivo: '01-agenda.html', etiqueta: 'Agenda', icono: 'grid' },
  { archivo: 'index.html', etiqueta: 'Demo', icono: 'info' },
];

const MENU_ICONOS = { '01-agenda.html': 'calendar', '02-nuevo-turno.html': 'plus', '03-recordatorios.html': 'msg', '11-app-agenda.html': 'phone' };

/* ------------------------------------------------------------------------ */
window.G = (function () {
  const DATA = window.DEMO_DATA;
  const NEG = DATA.negocio;

  /* ---------------- íconos ---------------- */
  const ICONOS = {
    calendar: '<rect x="3" y="4.5" width="18" height="16" rx="1.5"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    msg: '<path d="M4 19.5 5.3 16A8 8 0 1 1 8 18.7Z"/><path d="M9 10.5h6M9 13.5h4"/>',
    user: '<circle cx="12" cy="8" r="3.8"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M21.5 20a6.5 6.5 0 0 0-4-6"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7"/>',
    alert: '<path d="M10.3 3.9 2.4 17.5A2 2 0 0 0 4.1 20.5h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    refresh: '<path d="M20 11A8 8 0 0 0 5.3 6.7L3 9"/><path d="M3 4v5h5"/><path d="M4 13a8 8 0 0 0 14.7 4.3L21 15"/><path d="M21 20v-5h-5"/>',
    back: '<path d="M19 12H5"/><path d="m11 18-6-6 6-6"/>',
    next: '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
    prev: '<path d="m15 6-6 6 6 6"/>',
    chevron: '<path d="m9 6 6 6-6 6"/>',
    phone: '<rect x="6" y="2.5" width="12" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
    laptop: '<rect x="4" y="4" width="16" height="11" rx="1.5"/><path d="M2 19h20"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    send: '<path d="M21 3 10 14"/><path d="m21 3-7 18-4-7-7-4Z"/>',
    dollar: '<path d="M12 2v20"/><path d="M17 6.5c-.8-1.4-2.6-2.5-5-2.5-2.8 0-4.5 1.5-4.5 3.5 0 4.8 10 2.5 10 7.5 0 2-2 3.5-5 3.5-2.6 0-4.5-1.1-5.3-2.8"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18"/>',
    history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l3 2"/>',
    bluetooth: '<path d="m7 7 10 10-5 4V3l5 4L7 17"/>',
    sparkle: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
  };
  const icono = (nombre, cls) => `<span class="i${cls ? ' ' + cls : ''}" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONOS[nombre] || ICONOS.info}</svg></span>`;
  function hidratar(raiz) {
    (raiz || document).querySelectorAll('i[data-i]').forEach((el) => { el.outerHTML = icono(el.dataset.i, el.className); });
  }

  /* ---------------- formato y fechas ---------------- */
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const nfInt = new Intl.NumberFormat('es-AR');
  const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const aMin = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };
  const aHora = (min) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const deIso = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const sumarDias = (s, n) => { const d = deIso(s); d.setDate(d.getDate() + n); return iso(d); };
  const abierto = (s) => NEG.dias.includes(deIso(s).getDay());
  function proximoAbierto(s, dir) { let x = s; for (let i = 0; i < 8 && !abierto(x); i++) x = sumarDias(x, dir || 1); return x; }
  const hoyReal = iso(new Date());
  const HOY = proximoAbierto(hoyReal, 1);
  const MANIANA = proximoAbierto(sumarDias(HOY, 1), 1);
  // la demo siempre "está" a media mañana, así a cualquier hora se ve un día con turnos hechos, por venir y huecos libres
  const HORA_DEMO = 11 * 60 + 30;
  const ahoraMin = () => HORA_DEMO;
  const fmt = {
    int: (n) => nfInt.format(Math.round(n || 0)),
    ars: (n) => '$ ' + nfInt.format(Math.round(n || 0)),
    dur: (m) => (m < 60 ? `${m} min` : m % 60 ? `${Math.floor(m / 60)} h ${m % 60} min` : `${m / 60} h`),
    dia(s) {
      if (s === HOY) return 'Hoy';
      if (s === MANIANA) return 'Mañana';
      const d = deIso(s); return `${DIAS[d.getDay()][0].toUpperCase()}${DIAS[d.getDay()].slice(1)} ${d.getDate()}`;
    },
    diaLargo(s) { const d = deIso(s); return `${DIAS[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]}`; },
    diaCorto(s) { const d = deIso(s); return `${DIAS[d.getDay()].slice(0, 3)} ${d.getDate()}/${d.getMonth() + 1}`; },
  };
  const norm = (s) => String(s == null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

  function azar(semilla) {
    let a = semilla >>> 0;
    return function () { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function hash(str) { let h = 2166136261; for (const c of str) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }

  /* ---------------- catálogo ---------------- */
  const prof = (id) => DATA.profesionales.find((p) => p.id === id);
  const servicio = (id) => DATA.servicios.find((s) => s.id === id);
  const serviciosDe = (pid) => DATA.servicios.filter((s) => s.prof.includes(pid));
  let clientesExtra = [];
  const clientes = () => DATA.clientes.concat(clientesExtra);
  const cliente = (id) => clientes().find((c) => c.id === id);

  /* ---------------- turnos generados (siempre los mismos para cada día) ---------------- */
  const ABRE = aMin(NEG.abre), CIERRA = aMin(NEG.cierra), PASO = NEG.paso;
  function generarDia(dia) {
    if (!abierto(dia)) return [];
    const out = [];
    DATA.profesionales.forEach((p) => {
      const r = azar(hash(dia + p.id));
      const servs = serviciosDe(p.id);
      let t = ABRE;
      while (t < CIERRA) {
        const s = servs[Math.floor(r() * servs.length)];
        if (t + s.dur > CIERRA) break;
        if (r() < 0.72) {
          const c = DATA.clientes[Math.floor(r() * DATA.clientes.length)];
          out.push({ id: `${dia}-${p.id}-${t}`, dia, prof: p.id, inicio: t, dur: s.dur, serv: s.id, cli: c.id, estado: 'pendiente', aviso: false });
          t += s.dur;
        } else t += PASO;
      }
    });
    // estados según el momento: lo pasado ya se atendió (algunos no vinieron), lo de hoy y mañana está a medio confirmar
    const r = azar(hash('estado' + dia));
    out.forEach((tu) => {
      const x = r();
      if (dia < HOY || (dia === HOY && tu.inicio + tu.dur <= HORA_DEMO)) tu.estado = x < 0.1 ? 'ausente' : 'atendido';
      else if (dia === HOY) tu.estado = x < 0.75 ? 'confirmado' : 'pendiente';
      else if (dia === MANIANA) { tu.estado = x < 0.3 ? 'confirmado' : 'pendiente'; tu.aviso = tu.estado === 'confirmado'; }
      else tu.estado = x < 0.15 ? 'confirmado' : 'pendiente';
    });
    return out;
  }

  /* ---------------- estado de la demo (dura lo que dura la pestaña) ---------------- */
  const CLAVE = 'encastre-demo-turnos-v1';
  let est = null;
  function cargar() {
    try { const s = sessionStorage.getItem(CLAVE); if (s) { const e = JSON.parse(s); if (e.hoy === HOY) return e; } } catch (e) { /* sin almacenamiento: la demo funciona igual */ }
    return { hoy: HOY, dias: {}, clientes: [], eventos: [] };
  }
  function estado() { if (!est) { est = cargar(); clientesExtra = est.clientes; } return est; }
  function guardar() { try { sessionStorage.setItem(CLAVE, JSON.stringify(estado())); } catch (e) { /* nada */ } }
  function reiniciar() { try { sessionStorage.removeItem(CLAVE); } catch (e) { /* nada */ } est = null; clientesExtra = []; }
  function turnosDelDia(dia) {
    const e = estado();
    if (!e.dias[dia]) e.dias[dia] = generarDia(dia);
    return e.dias[dia].slice().sort((a, b) => a.inicio - b.inicio);
  }
  function turno(id) { const dia = id.slice(0, 10); return (estado().dias[dia] || turnosDelDia(dia)).find((t) => t.id === id); }
  function libres(dia, pid, dur) {
    if (!abierto(dia)) return [];
    const ocup = turnosDelDia(dia).filter((t) => t.prof === pid && t.estado !== 'cancelado');
    const desde = dia === HOY ? Math.max(ABRE, Math.ceil((HORA_DEMO + 15) / PASO) * PASO) : ABRE;
    const out = [];
    for (let t = desde; t + dur <= CIERRA; t += PASO) {
      if (!ocup.some((o) => t < o.inicio + o.dur && o.inicio < t + dur)) out.push(t);
    }
    return out;
  }
  function agregarTurno(o) {
    const e = estado();
    turnosDelDia(o.dia);
    const s = servicio(o.serv);
    const t = { id: `${o.dia}-${o.prof}-${o.inicio}-n`, dia: o.dia, prof: o.prof, inicio: o.inicio, dur: s.dur, serv: s.id, cli: o.cli, estado: 'confirmado', aviso: false, nuevo: true };
    e.dias[o.dia].push(t);
    e.eventos.unshift({ icono: 'plus', texto: `Turno nuevo: ${esc(cliente(o.cli).nombre)}, ${esc(s.nombre)} el ${fmt.diaLargo(o.dia)} a las ${aHora(o.inicio)}.` });
    guardar();
    return t;
  }
  function agregarCliente(nombre, tel) {
    const e = estado();
    const c = { id: 'n' + (e.clientes.length + 1), nombre: nombre.trim(), tel: (tel || '').trim() || 'sin teléfono', nueva: true };
    e.clientes.push(c); clientesExtra = e.clientes; guardar();
    return c;
  }
  function cambiarEstado(id, nuevo) {
    const t = turno(id); if (!t) return;
    t.estado = nuevo;
    if (nuevo === 'confirmado') t.aviso = true;
    guardar();
  }
  function marcarAviso(id) { const t = turno(id); if (t) { t.aviso = true; guardar(); } }

  const ESTADOS = {
    confirmado: { txt: 'Confirmado', cls: 'b-ok', ic: 'check' },
    pendiente: { txt: 'Sin confirmar', cls: 'b-aviso', ic: 'clock' },
    atendido: { txt: 'Atendido', cls: 'b-neutro', ic: 'check' },
    ausente: { txt: 'No vino', cls: 'b-alerta', ic: 'x' },
    cambio: { txt: 'Pidió cambiar', cls: 'b-info', ic: 'refresh' },
    cancelado: { txt: 'Cancelado', cls: 'b-neutro', ic: 'x' },
  };
  const badge = (estadoId) => { const e = ESTADOS[estadoId]; return `<span class="badge ${e.cls}">${icono(e.ic)}${e.txt}</span>`; };

  function mensaje(t) {
    const c = cliente(t.cli), s = servicio(t.serv), p = prof(t.prof);
    const nombre = c.nombre.split(' ')[0];
    const cuando = t.dia === MANIANA ? `mañana ${fmt.diaLargo(t.dia)}` : fmt.diaLargo(t.dia);
    return `¡Hola ${nombre}! Te recordamos tu turno de ${s.nombre.toLowerCase()} con ${p.nombre} ${cuando} a las ${aHora(t.inicio)} en ${NEG.nombre}. ¿Nos confirmás? Respondé SÍ o, si no podés venir, avisanos y lo pasamos a otro día. 😊`;
  }
  const waLink = (t) => 'https://wa.me/?text=' + encodeURIComponent(mensaje(t));

  /* ---------------- UI chica ---------------- */
  function toast(msg, ic) {
    let caja = document.querySelector('.toast-caja');
    if (!caja) { caja = document.createElement('div'); caja.className = 'toast-caja'; caja.setAttribute('aria-live', 'polite'); document.body.appendChild(caja); }
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = `${icono(ic || 'check')}<span>${msg}</span>`;
    caja.appendChild(t);
    setTimeout(() => t.remove(), 3600);
  }
  function modal(titulo, cuerpo, pie) {
    const fondo = document.createElement('div');
    fondo.className = 'modal-fondo';
    fondo.innerHTML = `<div class="modal" role="dialog" aria-modal="true" aria-label="${esc(titulo)}"><div class="modal-cab"><strong>${esc(titulo)}</strong><button class="btn btn-icono btn-fantasma" type="button" data-cerrar aria-label="Cerrar">${icono('x')}</button></div><div class="modal-cuerpo">${cuerpo}</div>${pie ? `<div class="modal-pie">${pie}</div>` : ''}</div>`;
    document.body.appendChild(fondo);
    const alTeclado = (e) => { if (e.key === 'Escape') cerrar(); };
    function cerrar() { fondo.remove(); document.removeEventListener('keydown', alTeclado); }
    fondo.addEventListener('click', (e) => { if (e.target === fondo || e.target.closest('[data-cerrar]')) cerrar(); });
    document.addEventListener('keydown', alTeclado);
    return { el: fondo, cerrar };
  }

  /* ---------------- shells ---------------- */
  const href = (archivo, extra) => archivo + (extra ? '?' + new URLSearchParams(extra) : '');
  const qs = (k) => new URLSearchParams(location.search).get(k);
  const archivoActual = (location.pathname.split('/').pop() || 'index.html');
  const pantalla = SCREENS.find((s) => s.archivo === (document.body.dataset.pantalla || archivoActual)) || SCREENS[0];
  const idx = SCREENS.indexOf(pantalla);
  const LOGO = '<svg viewBox="2 3 20 18" aria-hidden="true"><path d="M2 3h9v4H7.5v4H11v2H7.5v4H11v4H2z" fill="currentColor"/><path d="M22 3h-9v4h3.5v4H13v2h3.5v4H13v4h9z" fill="var(--acento)"/></svg>';
  const marcaHTML = (sub) => `<a class="marca" href="index.html"><span class="marca-logo marca-encastre">${LOGO}<span class="marca-txt">Encastre</span></span><span class="marca-sub">${sub || 'Turnos'}</span></a>`;

  function navPantallas() {
    const prev = SCREENS[idx - 1], sig = SCREENS[idx + 1];
    const lista = SCREENS.map((s) => `<a href="${s.archivo}" class="${s === pantalla ? 'activo' : ''}"><span class="n">${s.n}</span><span class="corta">${esc(s.titulo)}</span><span class="disp">${s.disp === 'celular' ? icono('phone', 'i-sm') : s.disp === 'notebook' ? icono('laptop', 'i-sm') : ''}</span></a>`).join('');
    return `<nav class="nav-pantallas" aria-label="Pantallas de la demo">
      ${prev ? `<a class="paso ant" href="${prev.archivo}"><small>← Anterior</small><span>${prev.n} · ${esc(prev.titulo)}</span></a>` : '<span class="vacio"></span>'}
      <details class="indice-desplegable"><summary class="btn btn-chico">${icono('grid')}Pantalla ${pantalla.n} de ${SCREENS.length - 1}</summary><div class="indice-lista">${lista}</div></details>
      ${sig ? `<a class="paso sig" href="${sig.archivo}"><small>Siguiente →</small><span>${sig.n} · ${esc(sig.titulo)}</span></a>` : '<span class="vacio"></span>'}
    </nav>`;
  }
  function flujoHTML() {
    const ev = estado().eventos.slice(0, 3);
    if (!ev.length) return '';
    return `<div class="flujo">${ev.map((e) => `<div class="flujo-item">${icono(e.icono)}<div style="min-width:0"><div>${e.texto}</div></div></div>`).join('')}
      <div class="chico tenue">Lo que hacés en la demo queda mientras la pestaña esté abierta. <a href="#" data-reiniciar>Volver al estado inicial</a></div></div>`;
  }
  function shellEscritorio(pagina) {
    const menu = MENU.map((g) => {
      if (g.pronto) return `<div class="menu-grupo">${g.grupo}</div>${g.pronto.map((t) => `<span class="menu-item pronto">${icono({ 'Cobros y señas': 'dollar', 'Turnos online': 'globe', 'Historial de clientas': 'history' }[t] || 'globe')}<span>${t}</span><span class="tag">Próx.</span></span>`).join('')}`;
      return `<div class="menu-grupo">${g.grupo}</div>` + g.items.map((a) => {
        const s = SCREENS.find((x) => x.archivo === a);
        return `<a class="menu-item${s === pantalla ? ' activo' : ''}" href="${a}"><span class="n">${s.n}</span>${icono(MENU_ICONOS[a])}<span class="t-largo">${esc(s.titulo.replace('App · ', ''))}</span><span class="t-corto">${esc(s.corto || s.titulo.replace('App · ', ''))}</span>${s.disp === 'celular' ? '<span class="tag">celu</span>' : ''}</a>`;
      }).join('');
    }).join('');
    const app = document.createElement('div');
    app.className = 'app';
    app.innerHTML = `
      <aside class="lateral">${marcaHTML('Turnos')}<nav class="menu" aria-label="Menú">${menu}</nav>
        <div class="lateral-pie"><strong>Demo</strong><span>Sistema de ejemplo hecho por Encastre. El negocio, las personas y los turnos son inventados.</span><a href="#" data-reiniciar>Reiniciar la demo</a></div>
      </aside>
      <div class="principal">
        <header class="barra-sup"><div class="titulo-sup"><span class="n">${pantalla.n}</span><span class="corta">${esc(pantalla.titulo)}</span><span class="badge b-etapa1">Demo</span></div><span class="espacio"></span>
          <div class="usuario"><span class="avatar">RE</span><div><strong>${esc(pantalla.rol)}</strong><small>${esc(NEG.nombre)}</small></div></div></header>
        <div class="contenido">${flujoHTML()}</div>
        ${navPantallas()}
      </div>`;
    document.body.prepend(app);
    app.querySelector('.contenido').appendChild(pagina);
  }
  function shellTelefono(pagina) {
    const hora = aHora(HORA_DEMO);
    const cont = document.createElement('div');
    cont.innerHTML = `
      <div class="escenario">
        <div class="escenario-info">
          ${marcaHTML('Turnos')}
          <div><div class="antetitulo">${icono('phone', 'i-sm')} Pantalla ${pantalla.n} · App de profesionales · Demo</div><h1>${esc(pantalla.titulo.replace('App · ', ''))}</h1></div>
          <p class="tinta-2">${esc(pantalla.resumen)}</p>
          <div class="panel"><div class="fuerte" style="margin-bottom:6px">Qué probar</div><ul>${pantalla.probar.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></div>
          ${flujoHTML()}
        </div>
        <div class="telefono">
          <div class="estado-tel"><span>${hora}</span><span class="iconos">${icono('bluetooth', 'i-sm')}<span class="bateria"></span></span></div>
          <div class="barra-app"><div class="t"><small>Encastre Turnos · ${esc(NEG.nombre)}</small>${esc(document.body.dataset.appTitulo || pantalla.titulo.replace('App · ', ''))}</div><span class="avatar" id="avatar-app">CA</span></div>
          <div class="cuerpo-app"></div>
          <nav class="pestanas" aria-label="Pestañas de la app">${TABS.map((t) => `<a class="pestana${t.archivo === pantalla.archivo ? ' activa' : ''}" href="${t.archivo}">${icono(t.icono)}<span>${t.etiqueta}</span></a>`).join('')}</nav>
        </div>
      </div>
      ${navPantallas()}`;
    document.body.prepend(...cont.children);
    document.querySelector('.cuerpo-app').appendChild(pagina);
  }
  function shellPortada(pagina) {
    const top = document.createElement('header');
    top.className = 'portada-top';
    top.innerHTML = `${marcaHTML('Turnos · Demo')}<a class="btn btn-acento" href="01-agenda.html">Empezar el recorrido ${icono('next')}</a>`;
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
    document.addEventListener('click', (e) => {
      document.querySelectorAll('.indice-desplegable[open]').forEach((d) => { if (!d.contains(e.target)) d.removeAttribute('open'); });
      if (e.target.closest('[data-reiniciar]')) { e.preventDefault(); reiniciar(); location.reload(); }
    });
  }

  const api = {
    SCREENS, NEG, datos: DATA, HOY, MANIANA, hoyReal, HORA_DEMO,
    icono, hidratar, esc, fmt, norm, aMin, aHora, iso, deIso, sumarDias, abierto, proximoAbierto, ahoraMin,
    prof, servicio, serviciosDe, clientes, cliente, profesionales: DATA.profesionales, servicios: DATA.servicios,
    estado, guardar, reiniciar, turnosDelDia, turno, libres, agregarTurno, agregarCliente, cambiarEstado, marcarAviso,
    ESTADOS, badge, mensaje, waLink, toast, modal, href, qs, pantalla,
  };
  window.G = api;
  iniciar();
  return api;
})();
