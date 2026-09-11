/* Boceto navegable — Distribuidora Ferreyra · Encastre
   Navegación entre pantallas, shells compartidos y utilidades. */

const SCREENS = [
  { f:'01-panel-general.html',      t:'Panel general',             g:'Administración' },
  { f:'02-clientes.html',           t:'Clientes',                  g:'Administración' },
  { f:'03-cuenta-corriente.html',   t:'Cuenta corriente',          g:'Administración' },
  { f:'04-registrar-cobranza.html', t:'Registrar cobranza',        g:'Administración' },
  { f:'05-nota-credito.html',       t:'Nota de crédito',           g:'Administración' },
  { f:'06-comisiones.html',         t:'Comisiones semanales',      g:'Administración' },
  { f:'07-app-mis-clientes.html',   t:'App · Mis clientes',        g:'Vendedores' },
  { f:'08-app-ficha-cliente.html',  t:'App · Ficha del cliente',   g:'Vendedores' },
  { f:'09-app-cobranza.html',       t:'App · Registrar cobranza',  g:'Vendedores' },
  { f:'10-app-nota-credito.html',   t:'App · Nota de crédito',     g:'Vendedores' },
  { f:'11-portal-cliente.html',     t:'Portal del cliente',        g:'Clientes' }
];

const MENU = [
  { k:'panel',      t:'Panel general',    h:'01-panel-general.html',      i:'<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>' },
  { k:'clientes',   t:'Clientes',         h:'02-clientes.html',           i:'<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/>' },
  { k:'remitos',    t:'Remitos',          h:null,                          i:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h5"/>' },
  { k:'nc',         t:'Notas de crédito', h:'05-nota-credito.html',       i:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9 15h6"/>' },
  { k:'cobranzas',  t:'Cobranzas',        h:'04-registrar-cobranza.html', i:'<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>' },
  { k:'comisiones', t:'Comisiones',       h:'06-comisiones.html',         i:'<circle cx="12" cy="8" r="5"/><path d="M9 13l-2 8 5-3 5 3-2-8"/>' },
  { k:'reportes',   t:'Reportes',         h:null,                          i:'<path d="M3 3v18h18"/><path d="M7 15l4-6 4 3 5-8"/>' }
];

const TABS = [
  { k:'clientes',  t:'Clientes',    h:'07-app-mis-clientes.html', i:'<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>' },
  { k:'cobranzas', t:'Cobranzas',   h:'09-app-cobranza.html',     i:'<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>' },
  { k:'comision',  t:'Mi comisión', h:null,                        i:'<circle cx="12" cy="8" r="5"/><path d="M9 13l-2 8 5-3 5 3-2-8"/>' },
  { k:'actividad', t:'Actividad',   h:null,                        i:'<circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>' }
];

const svg = p => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;

/* ---------- barra superior de navegación ---------- */
function buildTopnav(){
  const file = location.pathname.split('/').pop() || 'index.html';
  const i = SCREENS.findIndex(s => s.f === file);
  if (i === -1) return;
  const prev = i > 0 ? SCREENS[i-1] : null;
  const next = i < SCREENS.length-1 ? SCREENS[i+1] : null;
  const el = document.createElement('div');
  el.className = 'topnav';
  el.innerHTML = `
    ${prev ? `<a href="${prev.f}" title="${prev.t}">←<span class="lbl">Anterior</span></a>`
           : `<span class="dis">←<span class="lbl">Anterior</span></span>`}
    <a class="ix" href="index.html">Índice</a>
    <div class="mid"><b>${SCREENS[i].t}</b><small>${SCREENS[i].g} · ${i+1} de ${SCREENS.length}</small></div>
    ${next ? `<a href="${next.f}" title="${next.t}"><span class="lbl">Siguiente</span>→</a>`
           : `<span class="dis"><span class="lbl">Siguiente</span>→</span>`}`;
  document.body.prepend(el);

  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft' && prev) location.href = prev.f;
    if (e.key === 'ArrowRight' && next) location.href = next.f;
  });
}

/* ---------- shell de escritorio ---------- */
function buildDesktop(){
  const d = document.querySelector('.desktop');
  if (!d) return;
  const active = d.dataset.menu || '';
  const title = d.dataset.title || '';
  const crumb = d.dataset.crumb || '';
  const side = document.createElement('aside');
  side.className = 'side';
  side.innerHTML = `
    <div class="brand">Distribuidora Ferreyra<small>Gestión de cuentas corrientes</small></div>
    <nav>${MENU.map(m => {
      const on = m.k === active ? ' class="on"' : (m.h ? '' : ' class="soft"');
      return m.h ? `<a href="${m.h}"${on}>${svg(m.i)}${m.t}</a>`
                 : `<a${on}>${svg(m.i)}${m.t}</a>`;
    }).join('')}</nav>
    <div class="foot">Sesión: Administrador</div>`;
  const main = document.createElement('div');
  main.className = 'main';
  const bar = document.createElement('div');
  bar.className = 'topbar';
  bar.innerHTML = `
    <h1>${crumb ? `<span class="bc">${crumb} / </span>` : ''}${title}</h1>
    <div class="search">${svg('<circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>')}
      <input placeholder="Buscar cliente, remito o pago…"></div>
    <div class="avatar">DF</div>`;
  const content = d.querySelector('.content');
  d.innerHTML = '';
  d.append(side, main);
  main.append(bar, content);
}

/* ---------- shell de teléfono ---------- */
function buildPhone(){
  const p = document.querySelector('.phone');
  if (!p) return;
  const active = p.dataset.tab || '';
  const time = p.dataset.time || '9:41';
  const sb = document.createElement('div');
  sb.className = 'statusbar';
  sb.innerHTML = `<span>${time}</span><span>▮▮▯ &nbsp;⌁&nbsp; 78%</span>`;
  p.prepend(sb);
  if (p.dataset.tabbar !== 'off'){
    const tb = document.createElement('div');
    tb.className = 'tabbar';
    tb.innerHTML = TABS.map(t => {
      const cls = t.k === active ? ' class="on"' : '';
      return t.h ? `<a href="${t.h}"${cls}>${svg(t.i)}${t.t}</a>` : `<a${cls}>${svg(t.i)}${t.t}</a>`;
    }).join('');
    p.append(tb);
  }
}

/* ---------- escalado del marco de escritorio en pantallas chicas ---------- */
function scaleFrame(){
  const f = document.querySelector('.frame');
  if (!f) return;
  const wrap = f.parentElement;
  const avail = wrap.clientWidth;
  const s = Math.min(1, Math.max(avail / 1440, 0.46));
  f.style.transform = `scale(${s})`;
  wrap.style.height = (f.offsetHeight * s) + 'px';
  wrap.scrollLeft = 0;
}

/* ---------- utilidades ---------- */
const money = n => '$ ' + Math.round(n).toLocaleString('es-AR');
const parseMoney = s => Number(String(s).replace(/[^\d]/g, '')) || 0;

function toast(msg){
  let t = document.querySelector('.toast');
  if (!t){ t = document.createElement('div'); t.className = 'toast'; document.body.append(t); }
  t.textContent = msg;
  requestAnimationFrame(() => t.classList.add('show'));
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove('show'), 2600);
}

document.addEventListener('DOMContentLoaded', () => {
  buildTopnav();
  buildDesktop();
  buildPhone();
  scaleFrame();
  window.addEventListener('resize', scaleFrame);
  window.addEventListener('load', scaleFrame);
});
