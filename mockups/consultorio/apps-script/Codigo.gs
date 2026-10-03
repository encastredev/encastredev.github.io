/**
 * Consultorio · conexión entre la app y esta planilla de Google.
 *
 * La app manda operaciones (paciente nuevo o editado, sesión anotada o corregida) y este
 * script las guarda en las hojas "Pacientes" y "Sesiones". Cada operación queda además en
 * la hoja "Registro" con fecha y hora: nada se borra sin dejar rastro.
 * Los documentos del paciente (informes propios y de otros profesionales: PDF, Word, fotos)
 * se suben a su carpeta en Drive y quedan listados en la hoja "Documentos". También se puede
 * empezar un informe en Google Docs desde una plantilla de la carpeta "Plantillas".
 * Instalación: ver INSTALAR.md.
 */
const CARPETA = 'Consultorio';
const H_PAC = 'Pacientes';
const H_SES = 'Sesiones';
const H_DOC = 'Documentos';
const H_REG = 'Registro';

// [clave en la app, título de la columna, ancho, tipo]
const COL_PAC = [
  ['id', 'ID', 100, 'txt'], ['apellido', 'APELLIDO', 150, 'txt'], ['nombre', 'NOMBRE', 150, 'txt'],
  ['dni', 'DNI', 90, 'txt'], ['fn', 'FECHA NAC.', 95, 'fecha'], ['os', 'OBRA SOCIAL', 100, 'txt'],
  ['afiliado', 'N° AFILIADO', 120, 'txt'], ['dx', 'DIAGNÓSTICO', 220, 'lineas'],
  ['escuela', 'ESCUELA', 220, 'txt'], ['grado', 'GRADO', 110, 'txt'], ['tutores', 'ADULTOS RESPONSABLES', 220, 'txt'],
  ['equipo', 'EQUIPO (ROL · NOMBRE · CONTACTO)', 280, 'equipo'], ['obs', 'OBSERVACIONES', 220, 'txt'],
  ['estado', 'ESTADO', 80, 'estado'], ['alta', 'FECHA ALTA', 95, 'fecha'], ['revisar', 'PARA REVISAR', 240, 'lineas'],
  ['carpeta', 'CARPETA', 80, 'txt'], ['creado', 'CREADO', 130, 'momento'],
];
const COL_SES = [
  ['id', 'ID', 100, 'txt'], ['fecha', 'FECHA', 95, 'fecha'], ['pid', 'ID PACIENTE', 100, 'txt'],
  ['paciente', 'PACIENTE', 200, 'txt'], ['os', 'OBRA SOCIAL', 90, 'txt'], ['estado', 'ASISTENCIA', 100, 'asist'],
  ['nota', 'NOTA DE LA SESIÓN', 420, 'txt'], ['anulada', 'ANULADA', 75, 'si'],
  ['creado', 'ANOTADA', 130, 'momento'], ['editado', 'CORREGIDA', 130, 'momento'],
];
const COL_DOC = [
  ['id', 'ID', 100, 'txt'], ['fecha', 'FECHA', 95, 'fecha'], ['pid', 'ID PACIENTE', 100, 'txt'],
  ['paciente', 'PACIENTE', 200, 'txt'], ['tipo', 'DE QUIÉN', 130, 'tipodoc'], ['titulo', 'TÍTULO', 240, 'txt'],
  ['autor', 'PROFESIONAL', 180, 'txt'], ['url', 'ARCHIVO', 300, 'txt'], ['archivo', 'NOMBRE DEL ARCHIVO', 200, 'txt'],
  ['tam', 'TAMAÑO (KB)', 90, 'kb'], ['drive', 'ID DRIVE', 100, 'txt'], ['anulado', 'QUITADO', 75, 'si'],
  ['creado', 'SUBIDO', 130, 'momento'],
];
const MAX_MB = 25; // tamaño máximo por archivo
const COL_REG = [['t', 'FECHA', 130, 'momento'], ['op', 'OPERACIÓN', 120, 'txt'], ['id', 'ID', 100, 'txt'], ['detalle', 'DATOS', 600, 'txt']];

const ASIST = { asistio: 'Asistió', falto: 'Faltó', aviso: 'Avisó' };
const ESTADOS = { activo: 'Activo', alta: 'Alta' };
const TIPOS_DOC = { propio: 'Mío', externo: 'Otro profesional' };
const SUB_DOC = { propio: 'Mis informes', externo: 'De otros profesionales' };

/* ---------------------------------------------------------------- menú */
function onOpen() {
  SpreadsheetApp.getUi().createMenu('Consultorio')
    .addItem('Preparar planilla', 'configurar')
    .addItem('Ver datos de conexión', 'verConexion')
    .addToUi();
}

function configurar() {
  const ss = SpreadsheetApp.getActive();
  prepararHoja_(ss, H_PAC, COL_PAC);
  prepararHoja_(ss, H_SES, COL_SES);
  prepararHoja_(ss, H_DOC, COL_DOC);
  prepararHoja_(ss, H_REG, COL_REG);
  const vacia = ss.getSheets().find((h) => ![H_PAC, H_SES, H_DOC, H_REG].includes(h.getName()) && h.getLastRow() === 0);
  if (vacia) ss.deleteSheet(vacia);
  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty('CLAVE')) props.setProperty('CLAVE', Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '').slice(0, 8));
  const c = carpetas_();
  // La planilla también va a la carpeta del consultorio.
  try { DriveApp.getFileById(ss.getId()).moveTo(c.raiz); } catch (e) { /* ya estaba */ }
  if (!c.plantillas.getFilesByType(MimeType.GOOGLE_DOCS).hasNext()) plantillaEjemplo_(c.plantillas);
  verConexion();
}

function verConexion() {
  const clave = PropertiesService.getScriptProperties().getProperty('CLAVE');
  const url = ScriptApp.getService().getUrl();
  const msj = !clave ? 'Primero tocá "Consultorio → Preparar planilla".'
    : `Clave: ${clave}\n\n` + (url ? `Dirección: ${url}` : 'Falta publicar el script: Implementar → Nueva implementación → Aplicación web.')
      + '\n\nNo le pases estos datos a nadie: dan acceso a las fichas.';
  try { SpreadsheetApp.getUi().alert('Datos para conectar la app', msj, SpreadsheetApp.getUi().ButtonSet.OK); }
  catch (e) { Logger.log(msj); }
}

function prepararHoja_(ss, nombre, cols) {
  const h = ss.getSheetByName(nombre) || ss.insertSheet(nombre);
  h.getRange(1, 1, 1, cols.length).setValues([cols.map((c) => c[1])]).setFontWeight('bold').setBackground('#e5ede8');
  h.setFrozenRows(1);
  cols.forEach((c, i) => h.setColumnWidth(i + 1, c[2]));
  h.getRange(2, 1, h.getMaxRows() - 1, cols.length).setVerticalAlignment('top').setWrap(true);
  return h;
}

/* ---------------------------------------------------------------- carpetas */
function carpetas_() {
  const props = PropertiesService.getScriptProperties();
  let raiz = null;
  const id = props.getProperty('CARPETA');
  if (id) try { raiz = DriveApp.getFolderById(id); if (raiz.isTrashed()) raiz = null; } catch (e) { raiz = null; }
  if (!raiz) { raiz = DriveApp.createFolder(CARPETA); props.setProperty('CARPETA', raiz.getId()); }
  const sub = (n) => { const it = raiz.getFoldersByName(n); return it.hasNext() ? it.next() : raiz.createFolder(n); };
  return { raiz: raiz, plantillas: sub('Plantillas'), pacientes: sub('Pacientes') };
}

// Carpeta del paciente, con "Mis informes" y "De otros profesionales" adentro. Devuelve la de ese tipo.
function carpetaPaciente_(p, c, tipo) {
  let f = null;
  if (p.carpeta) try { f = DriveApp.getFolderById(p.carpeta); if (f.isTrashed()) f = null; } catch (e) { f = null; }
  if (!f) { f = c.pacientes.createFolder(`${p.apellido}, ${p.nombre}`.replace(/^, |, $/g, '')); p.carpeta = f.getId(); }
  const nombre = SUB_DOC[tipo] || SUB_DOC.propio;
  const it = f.getFoldersByName(nombre);
  return it.hasNext() ? it.next() : f.createFolder(nombre);
}

// Plantilla de ejemplo: solo el encabezado con los datos de la ficha; el resto lo escribe ella.
function plantillaEjemplo_(carpeta) {
  const doc = DocumentApp.create('Informe en blanco con los datos del paciente');
  const b = doc.getBody();
  b.clear();
  b.appendParagraph('Posadas, {{fecha}}').setAlignment(DocumentApp.HorizontalAlignment.RIGHT);
  [
    'Nombre y apellido: {{nombre}}', 'DNI: {{dni}} · Fecha de nacimiento: {{fecha_nacimiento}} · Edad: {{edad}}',
    'Obra social: {{obra_social}} · N° de afiliado: {{afiliado}}', 'Escuela: {{escuela}} · {{grado}}',
    'Diagnóstico: {{diagnostico}}',
  ].forEach((t) => b.appendParagraph(t));
  b.appendParagraph('');
  doc.saveAndClose();
  DriveApp.getFileById(doc.getId()).moveTo(carpeta);
}

/* ---------------------------------------------------------------- web */
function doGet() {
  return ContentService.createTextOutput('La conexión del consultorio está funcionando.');
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
      res = { ok: true };
      if (body.ops && body.ops.length) aplicar_(body.ops);
      if (body.informe) res.documento = informe_(body.informe);
      if (body.subir) res.documento = subir_(body.subir);
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
  const tp = tabla_(ss, H_PAC, COL_PAC);
  const ts = tabla_(ss, H_SES, COL_SES);
  let td = null;
  const registro = [];
  const ahora = new Date().toISOString();
  for (const op of ops) {
    if (op.op === 'paciente') {
      const viejo = tp.porId(op.p.id);
      // La carpeta la maneja este script: la app no la pisa.
      tp.guardar(Object.assign({}, op.p, { carpeta: viejo ? viejo.carpeta : '' }));
      registro.push([ahora, viejo ? 'Paciente editado' : 'Paciente nuevo', op.p.id, JSON.stringify(op.p)]);
    } else if (op.op === 'sesion') {
      const vieja = ts.porId(op.s.id);
      const que = !vieja ? 'Sesión anotada' : op.s.anulada && !vieja.anulada ? 'Sesión anulada' : 'Sesión corregida';
      ts.guardar(op.s);
      registro.push([ahora, que, op.s.id, JSON.stringify(op.s)]);
    } else if (op.op === 'documento') {
      // Solo los datos (título, profesional, fecha, de quién). El archivo no se cambia.
      td = td || tabla_(ss, H_DOC, COL_DOC);
      const viejo = td.porId(op.d.id);
      if (!viejo) continue;
      const quitar = op.d.anulado && !viejo.anulado;
      td.guardar({ id: viejo.id, titulo: op.d.titulo, autor: op.d.autor, fecha: op.d.fecha, tipo: op.d.tipo, anulado: !!op.d.anulado });
      // Quitado: el archivo va a la papelera de Drive (se puede recuperar durante 30 días).
      if (quitar && viejo.drive) try { DriveApp.getFileById(viejo.drive).setTrashed(true); } catch (e) { /* ya no estaba */ }
      registro.push([ahora, quitar ? 'Documento quitado' : 'Documento editado', op.d.id, JSON.stringify(op.d)]);
    }
  }
  tp.escribir();
  ts.escribir();
  if (td) td.escribir();
  if (registro.length) agregarFilas_(tabla_(ss, H_REG, COL_REG), registro);
}

// Un informe nuevo en Google Docs a partir de una plantilla, con los {{campos}} completos.
function informe_(pedido) {
  const plantilla = DriveApp.getFileById(pedido.plantilla);
  return nuevoDocumento_(pedido, 'propio', (carpeta) => {
    const copia = plantilla.makeCopy(pedido.titulo, carpeta);
    const doc = DocumentApp.openById(copia.getId());
    const partes = [doc.getBody(), doc.getHeader(), doc.getFooter()].filter(Boolean);
    Object.keys(pedido.datos || {}).forEach((k) => {
      const valor = String(pedido.datos[k] == null ? '' : pedido.datos[k]).replace(/\$/g, '$$$$');
      partes.forEach((parte) => parte.replaceText(`\\{\\{\\s*${k}\\s*\\}\\}`, valor));
    });
    doc.saveAndClose();
    return copia;
  });
}

// Un archivo que manda la app (PDF, Word, foto), en base64.
function subir_(pedido) {
  const bytes = Utilities.base64Decode(pedido.datos);
  if (bytes.length > MAX_MB * 1024 * 1024) throw new Error(`El archivo pesa más de ${MAX_MB} MB.`);
  return nuevoDocumento_(pedido, pedido.tipo, (carpeta) => carpeta.createFile(Utilities.newBlob(bytes, pedido.mime || 'application/octet-stream', pedido.nombre || pedido.titulo)));
}

function nuevoDocumento_(pedido, tipo, crear) {
  const ss = SpreadsheetApp.getActive();
  const tp = tabla_(ss, H_PAC, COL_PAC);
  const p = tp.porId(pedido.pid);
  if (!p) throw new Error('Ese paciente todavía no llegó a la planilla. Probá de nuevo en un rato.');
  const carpeta = carpetaPaciente_(p, carpetas_(), tipo);
  tp.guardar({ id: p.id, carpeta: p.carpeta }); // por si se creó la carpeta
  tp.escribir();
  const f = crear(carpeta);
  const d = {
    id: pedido.id, fecha: pedido.fecha, pid: p.id, paciente: `${p.apellido}, ${p.nombre}`, tipo: TIPOS_DOC[tipo] ? tipo : 'propio',
    titulo: pedido.titulo, autor: pedido.autor || '', url: f.getUrl(), archivo: f.getName(), tam: f.getSize(),
    drive: f.getId(), anulado: false, creado: new Date().toISOString(),
  };
  const td = tabla_(ss, H_DOC, COL_DOC);
  td.guardar(d);
  td.escribir();
  agregarFilas_(tabla_(ss, H_REG, COL_REG), [[d.creado, 'Documento subido', d.id, JSON.stringify({ pid: p.id, tipo: d.tipo, titulo: d.titulo, url: d.url })]]);
  return d;
}

/* ---------------------------------------------------------------- lectura y escritura */
function leerEstado_() {
  const ss = SpreadsheetApp.getActive();
  const c = carpetas_();
  const plantillas = [];
  const it = c.plantillas.getFilesByType(MimeType.GOOGLE_DOCS);
  while (it.hasNext()) { const f = it.next(); plantillas.push({ id: f.getId(), nombre: f.getName() }); }
  plantillas.sort((a, b) => a.nombre.localeCompare(b.nombre));
  return {
    pacientes: tabla_(ss, H_PAC, COL_PAC).todas(),
    sesiones: tabla_(ss, H_SES, COL_SES).todas(),
    documentos: tabla_(ss, H_DOC, COL_DOC).todas(),
    plantillas: plantillas,
    planilla: ss.getUrl(),
    carpeta: c.raiz.getUrl(),
    carpetaPlantillas: c.plantillas.getUrl(),
    espacio: espacio_(),
  };
}

// Espacio de la cuenta de Google (Drive + Gmail + Fotos). Lo compartido por otros no cuenta.
function espacio_() {
  try { return { usado: DriveApp.getStorageUsed(), limite: DriveApp.getStorageLimit() }; } catch (e) { return null; }
}

// Una hoja leída como lista de objetos, con guardar (agrega o reemplaza por ID) y escribir.
function tabla_(ss, nombre, cols) {
  const h = ss.getSheetByName(nombre) || prepararHoja_(ss, nombre, cols);
  const n = h.getLastRow() - 1;
  const filas = n > 0 ? h.getRange(2, 1, n, cols.length).getDisplayValues() : [];
  let filasId = null;
  if (cols[0][0] === 'id') {
    // Filas agregadas a mano: se les pone un ID y se guarda enseguida.
    filas.forEach((f, i) => {
      if (String(f[0]).trim() || !f.slice(1).some((x) => String(x).trim())) return;
      f[0] = Utilities.getUuid().slice(0, 12);
      h.getRange(i + 2, 1).setNumberFormat('@').setValue(f[0]);
    });
  }
  const objetos = filas.filter((f) => f.some((x) => String(x).trim())).map((f) => {
    const o = {};
    cols.forEach((c, i) => { o[c[0]] = deCelda_(f[i], c[3]); });
    return o;
  });
  let cambio = false;
  return {
    hoja: h,
    todas: () => objetos,
    porId: (id) => { if (!filasId) filasId = new Map(objetos.map((o, i) => [o.id, i])); const i = filasId.get(id); return i == null ? null : objetos[i]; },
    guardar: function (o) {
      const viejo = this.porId(o.id);
      const limpio = {};
      cols.forEach((c) => { limpio[c[0]] = o[c[0]] == null ? (viejo ? viejo[c[0]] : '') : o[c[0]]; });
      if (viejo) Object.assign(viejo, limpio); else { objetos.push(limpio); filasId.set(limpio.id, objetos.length - 1); }
      cambio = true;
    },
    escribir: () => {
      if (!cambio) return;
      const datos = objetos.map((o) => cols.map((c) => aCelda_(o[c[0]], c[3])));
      if (h.getLastRow() > 1) h.getRange(2, 1, h.getLastRow() - 1, cols.length).clearContent();
      if (!datos.length) return;
      asegurarFilas_(h, datos.length + 1);
      const r = h.getRange(2, 1, datos.length, cols.length);
      r.setNumberFormats(datos.map(() => cols.map((c) => formato_(c[3]))));
      r.setValues(datos);
      cambio = false;
    },
  };
}

function formato_(tipo) {
  return tipo === 'fecha' ? 'dd/mm/yyyy' : tipo === 'momento' ? 'dd/mm/yyyy hh:mm' : tipo === 'kb' ? '0' : '@';
}

// De la app a la celda
function aCelda_(v, tipo) {
  if (v == null || v === '') return '';
  if (tipo === 'fecha') { const m = String(v).match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : ''; }
  if (tipo === 'momento') { const d = new Date(v); return isNaN(d) ? '' : d; }
  if (tipo === 'lineas') return (Array.isArray(v) ? v : [v]).join('\n');
  if (tipo === 'equipo') return (v || []).map((e) => [e.rol, e.nombre, e.contacto].map((x) => String(x || '').replace(/·/g, '-').trim()).join(' · ')).join('\n');
  if (tipo === 'asist') return ASIST[v] || v;
  if (tipo === 'estado') return ESTADOS[v] || v;
  if (tipo === 'tipodoc') return TIPOS_DOC[v] || v;
  if (tipo === 'kb') return Math.round(Number(v) / 1024);
  if (tipo === 'si') return v ? 'SI' : '';
  return String(v);
}

// De la celda a la app
function deCelda_(v, tipo) {
  const s = String(v == null ? '' : v).trim();
  if (tipo === 'fecha') { const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/); return m ? `${m[3]}-${('0' + m[2]).slice(-2)}-${('0' + m[1]).slice(-2)}` : ''; }
  if (tipo === 'momento') {
    const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})/);
    return m ? new Date(+m[3], +m[2] - 1, +m[1], +m[4], +m[5]).toISOString() : '';
  }
  if (tipo === 'lineas') return s.split('\n').map((x) => x.trim()).filter(Boolean);
  if (tipo === 'equipo') return s.split('\n').map((x) => x.trim()).filter(Boolean).map((x) => { const [rol, nombre, contacto] = x.split('·').map((y) => (y || '').trim()); return { rol: rol || '', nombre: nombre || '', contacto: contacto || '' }; });
  if (tipo === 'asist') { const k = Object.keys(ASIST).find((a) => ASIST[a].toLowerCase() === s.toLowerCase()); return k || (s ? s.toLowerCase() : 'asistio'); }
  if (tipo === 'estado') return s.toLowerCase() === 'alta' ? 'alta' : 'activo';
  if (tipo === 'tipodoc') return /otro/i.test(s) ? 'externo' : 'propio';
  if (tipo === 'kb') return (parseInt(s.replace(/\D/g, ''), 10) || 0) * 1024;
  if (tipo === 'si') return s.toUpperCase() === 'SI';
  return s;
}

// Agrega filas al final (solo se usa para el Registro).
function agregarFilas_(t, filas) {
  const h = t.hoja;
  const desde = h.getLastRow() + 1;
  asegurarFilas_(h, desde + filas.length - 1);
  const ancho = filas[0].length;
  const r = h.getRange(desde, 1, filas.length, ancho);
  const tipos = COL_REG.map((c) => formato_(c[3]));
  r.setNumberFormats(filas.map(() => tipos));
  r.setValues(filas.map((f) => f.map((x, i) => (tipos[i] === 'dd/mm/yyyy hh:mm' && typeof x === 'string' ? new Date(x) : x))));
}

function asegurarFilas_(h, n) {
  if (h.getMaxRows() < n) h.insertRowsAfter(h.getMaxRows(), n - h.getMaxRows());
}
