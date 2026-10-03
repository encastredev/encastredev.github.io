/**
 * Consultorio · conexión entre la app y esta planilla de Google.
 *
 * La app manda operaciones (paciente nuevo o editado, sesión anotada o corregida) y este
 * script las guarda en las hojas "Pacientes" y "Sesiones". Cada operación queda además en
 * la hoja "Registro" con fecha y hora: nada se borra sin dejar rastro.
 * Los informes se arman copiando una plantilla de Google Docs de la carpeta "Plantillas"
 * y se guardan en la carpeta del paciente. Instalación: ver INSTALAR.md.
 */
const CARPETA = 'Consultorio';
const H_PAC = 'Pacientes';
const H_SES = 'Sesiones';
const H_INF = 'Informes';
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
const COL_INF = [
  ['id', 'ID', 100, 'txt'], ['fecha', 'FECHA', 95, 'fecha'], ['pid', 'ID PACIENTE', 100, 'txt'],
  ['paciente', 'PACIENTE', 200, 'txt'], ['plantilla', 'PLANTILLA', 200, 'txt'], ['url', 'DOCUMENTO', 320, 'txt'],
  ['creado', 'CREADO', 130, 'momento'],
];
const COL_REG = [['t', 'FECHA', 130, 'momento'], ['op', 'OPERACIÓN', 120, 'txt'], ['id', 'ID', 100, 'txt'], ['detalle', 'DATOS', 600, 'txt']];

const ASIST = { asistio: 'Asistió', falto: 'Faltó', aviso: 'Avisó' };
const ESTADOS = { activo: 'Activo', alta: 'Alta' };

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
  prepararHoja_(ss, H_INF, COL_INF);
  prepararHoja_(ss, H_REG, COL_REG);
  const vacia = ss.getSheets().find((h) => ![H_PAC, H_SES, H_INF, H_REG].includes(h.getName()) && h.getLastRow() === 0);
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

function carpetaPaciente_(p, c) {
  if (p.carpeta) try { const f = DriveApp.getFolderById(p.carpeta); if (!f.isTrashed()) return f; } catch (e) { /* se creó otra */ }
  const f = c.pacientes.createFolder(`${p.apellido}, ${p.nombre}`.replace(/^, |, $/g, ''));
  p.carpeta = f.getId();
  return f;
}

function plantillaEjemplo_(carpeta) {
  const doc = DocumentApp.create('Informe psicopedagógico (ejemplo)');
  const b = doc.getBody();
  b.clear();
  b.appendParagraph('INFORME PSICOPEDAGÓGICO').setHeading(DocumentApp.ParagraphHeading.HEADING1).setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  b.appendParagraph('Posadas, {{fecha}}').setAlignment(DocumentApp.HorizontalAlignment.RIGHT);
  [
    'Nombre y apellido: {{nombre}}', 'DNI: {{dni}}', 'Fecha de nacimiento: {{fecha_nacimiento}} · Edad: {{edad}}',
    'Obra social: {{obra_social}} · N° de afiliado: {{afiliado}}', 'Escuela: {{escuela}} · {{grado}}',
    'Diagnóstico: {{diagnostico}}', 'Inicio del tratamiento: {{inicio_tratamiento}} · Sesiones realizadas: {{sesiones}}',
  ].forEach((t) => b.appendParagraph(t));
  ['Motivo de consulta', 'Evaluación', 'Evolución del tratamiento', 'Conclusiones y sugerencias'].forEach((t) => {
    b.appendParagraph(t).setHeading(DocumentApp.ParagraphHeading.HEADING2);
    b.appendParagraph('…');
  });
  b.appendParagraph('');
  b.appendParagraph('Lic. en Psicopedagogía').setAlignment(DocumentApp.HorizontalAlignment.RIGHT);
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
      if (body.informe) res.informe = informe_(body.informe);
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
    }
  }
  tp.escribir();
  ts.escribir();
  if (registro.length) agregarFilas_(tabla_(ss, H_REG, COL_REG), registro);
}

function informe_(pedido) {
  const ss = SpreadsheetApp.getActive();
  const tp = tabla_(ss, H_PAC, COL_PAC);
  const p = tp.porId(pedido.pid);
  if (!p) throw new Error('Ese paciente todavía no llegó a la planilla. Probá de nuevo en un rato.');
  const c = carpetas_();
  const carpeta = carpetaPaciente_(p, c);
  tp.escribir(); // por si se creó la carpeta
  const plantilla = DriveApp.getFileById(pedido.plantilla);
  const copia = plantilla.makeCopy(`${pedido.titulo}`, carpeta);
  const doc = DocumentApp.openById(copia.getId());
  const partes = [doc.getBody(), doc.getHeader(), doc.getFooter()].filter(Boolean);
  Object.keys(pedido.datos || {}).forEach((k) => {
    const valor = String(pedido.datos[k] == null ? '' : pedido.datos[k]).replace(/\$/g, '$$$$');
    partes.forEach((parte) => parte.replaceText(`\\{\\{\\s*${k}\\s*\\}\\}`, valor));
  });
  doc.saveAndClose();
  const inf = {
    id: pedido.id, fecha: pedido.fecha, pid: p.id, paciente: `${p.apellido}, ${p.nombre}`,
    plantilla: plantilla.getName(), url: copia.getUrl(), creado: new Date().toISOString(),
  };
  agregarFilas_(tabla_(ss, H_INF, COL_INF), [COL_INF.map((col) => aCelda_(inf[col[0]], col[3]))]);
  agregarFilas_(tabla_(ss, H_REG, COL_REG), [[inf.creado, 'Informe creado', inf.id, JSON.stringify({ pid: p.id, plantilla: inf.plantilla, url: inf.url })]]);
  return inf;
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
    informes: tabla_(ss, H_INF, COL_INF).todas(),
    plantillas: plantillas,
    planilla: ss.getUrl(),
    carpeta: c.raiz.getUrl(),
    carpetaPlantillas: c.plantillas.getUrl(),
  };
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
  return tipo === 'fecha' ? 'dd/mm/yyyy' : tipo === 'momento' ? 'dd/mm/yyyy hh:mm' : '@';
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
  if (tipo === 'si') return s.toUpperCase() === 'SI';
  return s;
}

function agregarFilas_(t, filas) {
  const h = t.hoja;
  const desde = h.getLastRow() + 1;
  asegurarFilas_(h, desde + filas.length - 1);
  const ancho = filas[0].length;
  const r = h.getRange(desde, 1, filas.length, ancho);
  const tipos = (h.getName() === H_REG ? COL_REG : COL_INF).map((c) => formato_(c[3]));
  r.setNumberFormats(filas.map(() => tipos));
  r.setValues(filas.map((f) => f.map((x, i) => (tipos[i] === 'dd/mm/yyyy hh:mm' && typeof x === 'string' ? new Date(x) : x))));
}

function asegurarFilas_(h, n) {
  if (h.getMaxRows() < n) h.insertRowsAfter(h.getMaxRows(), n - h.getMaxRows());
}
