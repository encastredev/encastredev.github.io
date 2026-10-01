/**
 * Stock regional · conexión entre la app y esta planilla de Google.
 *
 * La app manda operaciones (salió, entró, corrección, alta de producto…) y este script
 * las aplica sobre las hojas "Productos" y "Movimientos". Instalación: ver INSTALAR.md.
 */
const HOJA_PROD = 'Productos';
const HOJA_MOV = 'Movimientos';
const CAB_PROD = ['ID', 'PRODUCTO', 'CATEGORIA', 'CODIGOS DE BARRAS', 'TOTAL', 'PROXIMO VENC.', 'VENCIMIENTOS', 'PARA REVISAR', 'REPARTO ESTIMADO'];
const CAB_MOV = ['ID', 'FECHA', 'TIPO', 'PRODUCTO', 'CANT', 'VENC.', 'MOTIVO', 'DETALLE', 'ID PRODUCTO'];
const TIPOS = { sale: 'Salió', entra: 'Entró', ajuste: 'Corrección' };
const MAX_MOVS = 3000; // movimientos que se mandan a la app (los más nuevos)

/* ---------------------------------------------------------------- menú */
function onOpen() {
  SpreadsheetApp.getUi().createMenu('Stock app')
    .addItem('Preparar planilla', 'configurar')
    .addItem('Ver datos de conexión', 'verConexion')
    .addToUi();
}

function configurar() {
  const ss = SpreadsheetApp.getActive();
  prepararHoja_(ss, HOJA_PROD, CAB_PROD, [300, 180, 110, 120, 60, 100, 260, 280, 90]);
  prepararHoja_(ss, HOJA_MOV, CAB_MOV, [110, 130, 90, 300, 60, 80, 90, 220, 110]);
  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty('CLAVE')) props.setProperty('CLAVE', Utilities.getUuid().replace(/-/g, '').slice(0, 16));
  const vacia = ss.getSheets().find((h) => h.getName() !== HOJA_PROD && h.getName() !== HOJA_MOV && h.getLastRow() === 0);
  if (vacia && ss.getSheets().length > 2) ss.deleteSheet(vacia);
  verConexion();
}

function verConexion() {
  const clave = PropertiesService.getScriptProperties().getProperty('CLAVE');
  const url = ScriptApp.getService().getUrl();
  const msj = !clave ? 'Primero tocá "Stock app → Preparar planilla".'
    : `Clave: ${clave}\n\n` + (url ? `Dirección: ${url}` : 'Falta publicar el script: Implementar → Nueva implementación → Aplicación web.');
  try { SpreadsheetApp.getUi().alert('Datos para conectar la app', msj, SpreadsheetApp.getUi().ButtonSet.OK); }
  catch (e) { Logger.log(msj); }
}

function prepararHoja_(ss, nombre, cab, anchos) {
  const h = ss.getSheetByName(nombre) || ss.insertSheet(nombre);
  h.getRange(1, 1, 1, cab.length).setValues([cab]).setFontWeight('bold').setBackground('#e5ede8');
  h.setFrozenRows(1);
  anchos.forEach((a, i) => h.setColumnWidth(i + 1, a));
  return h;
}

/* ---------------------------------------------------------------- web */
function doGet() {
  return ContentService.createTextOutput('La conexión de Stock está funcionando.');
}

function doPost(e) {
  let res;
  try {
    const body = JSON.parse(e.postData.contents);
    const clave = PropertiesService.getScriptProperties().getProperty('CLAVE');
    if (!clave || body.clave !== clave) throw new Error('Clave incorrecta');
    const lock = LockService.getScriptLock();
    lock.waitLock(25000);
    try {
      if (body.ops && body.ops.length) aplicar_(body.ops);
      res = { ok: true };
      if (body.estado) Object.assign(res, leerEstado_());
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    res = { ok: false, error: String((err && err.message) || err) };
  }
  return ContentService.createTextOutput(JSON.stringify(res)).setMimeType(ContentService.MimeType.JSON);
}

/* ---------------------------------------------------------------- operaciones */
function aplicar_(ops) {
  const ss = SpreadsheetApp.getActive();
  const hp = hoja_(ss, HOJA_PROD, CAB_PROD);
  const hm = hoja_(ss, HOJA_MOV, CAB_MOV);
  let prods = leerProductos_(hp);
  let porId = indice_(prods);
  const nuevos = [];         // movimientos a agregar al final
  const aBorrar = new Set(); // movimientos ya guardados que se deshacen
  let reemplazo = null;      // al importar: la lista completa de movimientos
  let guardados = null;      // movimientos de la hoja (se leen solo si hace falta)

  for (const op of ops) {
    if (op.op === 'importar') {
      prods = (op.productos || []).map(limpiar_);
      porId = indice_(prods);
      reemplazo = (op.movs || []).slice().sort((a, b) => String(a.t).localeCompare(String(b.t)));
      nuevos.length = 0; aBorrar.clear();
    } else if (op.op === 'producto') {
      const p = op.p; const i = porId.get(p.id);
      if (i == null) { prods.push(limpiar_(p)); porId.set(p.id, prods.length - 1); }
      else Object.assign(prods[i], { nombre: p.nombre, cat: p.cat, codigos: p.codigos || [], obs: p.obs || [], estimado: !!p.estimado });
    } else if (op.op === 'borrarProducto') {
      prods = prods.filter((p) => p.id !== op.id);
      porId = indice_(prods);
    } else if (op.op === 'mov') {
      const m = op.m;
      if (porId.has(m.pid)) mover_(prods[porId.get(m.pid)], m.v, delta_(m));
      nuevos.push(m);
    } else if (op.op === 'deshacer') {
      let m = nuevos.find((x) => x.id === op.id);
      if (m) nuevos.splice(nuevos.indexOf(m), 1);
      else if (reemplazo && (m = reemplazo.find((x) => x.id === op.id))) reemplazo.splice(reemplazo.indexOf(m), 1);
      else {
        if (!guardados) guardados = leerMovs_(hm);
        m = guardados.find((x) => x.id === op.id);
        if (m) aBorrar.add(m.id);
      }
      if (m && porId.has(m.pid)) mover_(prods[porId.get(m.pid)], m.v, -delta_(m));
    }
  }

  escribirProductos_(hp, prods);
  if (reemplazo) {
    limpiarDatos_(hm);
    agregarMovs_(hm, reemplazo.concat(nuevos));
  } else {
    if (aBorrar.size) {
      const ids = hm.getLastRow() > 1 ? hm.getRange(2, 1, hm.getLastRow() - 1, 1).getValues() : [];
      for (let i = ids.length - 1; i >= 0; i--) if (aBorrar.has(String(ids[i][0]))) hm.deleteRow(i + 2);
    }
    agregarMovs_(hm, nuevos);
  }
}

const delta_ = (m) => (m.tipo === 'sale' ? -Math.abs(m.cant) : m.tipo === 'entra' ? Math.abs(m.cant) : Number(m.cant));
const indice_ = (prods) => new Map(prods.map((p, i) => [p.id, i]));

function mover_(p, v, d) {
  v = v || null;
  const t = p.tandas.find((x) => (x.v || null) === v);
  if (t) t.c = Math.max(0, t.c + d);
  else if (d > 0) p.tandas.push({ v: v, c: d });
  p.tandas = p.tandas.filter((x) => x.c > 0);
}

function limpiar_(p) {
  return {
    id: String(p.id), nombre: String(p.nombre || ''), cat: String(p.cat || ''),
    codigos: (p.codigos || []).map(String), obs: p.obs || [], estimado: !!p.estimado,
    tandas: (p.tandas || []).filter((t) => t.c > 0).map((t) => ({ v: t.v || null, c: Number(t.c) })),
  };
}

/* ---------------------------------------------------------------- lectura y escritura */
function hoja_(ss, nombre, cab) {
  return ss.getSheetByName(nombre) || prepararHoja_(ss, nombre, cab, []);
}

function leerEstado_() {
  const ss = SpreadsheetApp.getActive();
  const prods = leerProductos_(hoja_(ss, HOJA_PROD, CAB_PROD));
  const movs = leerMovs_(hoja_(ss, HOJA_MOV, CAB_MOV)).reverse().slice(0, MAX_MOVS);
  return { productos: prods, movs: movs, planilla: ss.getUrl() };
}

// "05/2027" → "2027-05"; "s/f" → null
function aVenc_(txt) {
  const m = String(txt).trim().match(/^(\d{1,2})\/(\d{4})$/);
  return m ? `${m[2]}-${('0' + m[1]).slice(-2)}` : null;
}
function deVenc_(v) {
  if (!v) return 's/f';
  const [y, m] = v.split('-');
  return `${m}/${y}`;
}

function leerProductos_(h) {
  const n = h.getLastRow() - 1;
  if (n < 1) return [];
  const filas = h.getRange(2, 1, n, CAB_PROD.length).getDisplayValues();
  // Filas agregadas a mano: se les pone un ID y se guarda enseguida.
  const sinId = filas.map((f, i) => (!String(f[0]).trim() && String(f[1]).trim() ? i : -1)).filter((i) => i >= 0);
  sinId.forEach((i) => {
    filas[i][0] = Utilities.getUuid().slice(0, 12);
    h.getRange(i + 2, 1).setNumberFormat('@').setValue(filas[i][0]);
  });
  return filas
    .filter((f) => String(f[1]).trim())
    .map((f) => ({
      id: String(f[0]).trim(),
      nombre: String(f[1]).trim(),
      cat: String(f[2]).trim() || 'Otros',
      codigos: String(f[3]).split(/[,;\s]+/).filter(Boolean),
      tandas: String(f[6]).split(';').map((x) => x.trim()).filter(Boolean).map((x) => {
        const [v, c] = x.split(':');
        return { v: aVenc_(v), c: parseInt(c, 10) || 0 };
      }).filter((t) => t.c > 0),
      obs: String(f[7]).split(' | ').map((x) => x.trim()).filter(Boolean),
      estimado: String(f[8]).trim().toUpperCase() === 'SI',
    }));
}

function escribirProductos_(h, prods) {
  prods.forEach((p) => p.tandas.sort((a, b) => (a.v || '9999').localeCompare(b.v || '9999')));
  const filas = prods.slice().sort((a, b) => a.nombre.localeCompare(b.nombre)).map((p) => {
    const total = p.tandas.reduce((a, t) => a + t.c, 0);
    return [p.id, p.nombre, p.cat, p.codigos.join(', '), total, p.tandas.length ? deVenc_(p.tandas[0].v) : '',
      p.tandas.map((t) => `${deVenc_(t.v)}:${t.c}`).join('; '), p.obs.join(' | '), p.estimado ? 'SI' : ''];
  });
  limpiarDatos_(h);
  if (!filas.length) return;
  asegurarFilas_(h, filas.length + 1);
  const r = h.getRange(2, 1, filas.length, CAB_PROD.length);
  r.setNumberFormats(filas.map(() => ['@', '@', '@', '@', '0', '@', '@', '@', '@']));
  r.setValues(filas);
}

function leerMovs_(h) {
  const n = h.getLastRow() - 1;
  if (n < 1) return [];
  const tipos = { 'Salió': 'sale', 'Entró': 'entra', 'Corrección': 'ajuste' };
  return h.getRange(2, 1, n, CAB_MOV.length).getValues().filter((f) => f[0]).map((f) => {
    const tipo = tipos[f[2]] || 'ajuste';
    const cant = Number(f[4]) || 0;
    return {
      id: String(f[0]), t: f[1] instanceof Date ? f[1].toISOString() : String(f[1]), tipo: tipo,
      nombre: String(f[3]), cant: tipo === 'ajuste' ? cant : Math.abs(cant), v: aVenc_(f[5]),
      motivo: String(f[6]), detalle: String(f[7]), pid: String(f[8]),
    };
  });
}

function agregarMovs_(h, movs) {
  if (!movs.length) return;
  const desde = h.getLastRow() + 1;
  asegurarFilas_(h, desde + movs.length - 1);
  const filas = movs.map((m) => [m.id, new Date(m.t), TIPOS[m.tipo] || 'Corrección', m.nombre, delta_(m),
    m.v ? deVenc_(m.v) : '', m.motivo || '', m.detalle || '', m.pid]);
  const r = h.getRange(desde, 1, filas.length, CAB_MOV.length);
  r.setNumberFormats(filas.map(() => ['@', 'dd/mm/yyyy hh:mm', '@', '@', '0', '@', '@', '@', '@']));
  r.setValues(filas);
}

function limpiarDatos_(h) {
  if (h.getLastRow() > 1) h.getRange(2, 1, h.getLastRow() - 1, h.getLastColumn()).clearContent();
}

function asegurarFilas_(h, n) {
  if (h.getMaxRows() < n) h.insertRowsAfter(h.getMaxRows(), n - h.getMaxRows());
}
