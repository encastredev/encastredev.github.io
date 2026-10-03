/* ==========================================================================
   Consultorio · lector del Word de pacientes
   Lee el word/document.xml de un .docx con una tabla de fichas: en cada fila,
   la primera celda tiene los datos del paciente y la segunda los de la escuela.
   Devuelve pacientes con los campos separados y, en "revisar", lo que conviene mirar.
   Funciona en el navegador (window.leerFichasWord) y en Node (module.exports) para probarlo.
   ========================================================================== */
(function (raiz) {
  'use strict';

  const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
  const deXML = (s) => s.replace(/&(#x?[0-9a-f]+|\w+);/gi, (m, e) => {
    if (e[0] === '#') return String.fromCodePoint(e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10));
    return ENT[e] ?? m;
  });
  const limpio = (s) => s.replace(/[ \t]+/g, ' ').replace(/\s+/g, ' ').trim();
  const bloques = (xml, tag) => {
    const re = new RegExp(`<w:${tag}[ >][\\s\\S]*?</w:${tag}>`, 'g');
    return xml.match(re) || [];
  };
  // Texto de un párrafo: <w:t>, tabs y saltos de línea.
  function textoParrafo(p) {
    let t = '';
    const re = /<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>|<w:tab\/>|<w:br\/>|<w:cr\/>/g;
    let m;
    while ((m = re.exec(p))) t += m[1] !== undefined ? deXML(m[1]) : m[0] === '<w:tab/>' ? ' ' : '\n';
    return t;
  }
  const lineasCelda = (tc) => bloques(tc, 'p').flatMap((p) => textoParrafo(p).split('\n')).map(limpio).filter(Boolean);

  // "Juan PÉREZ" → "Juan Pérez"; las siglas cortas (TEA, TDAH) quedan como están.
  const titulo = (s) => s.toLowerCase().replace(/(^|[\s(-])(\p{L})/gu, (m, a, b) => a + b.toUpperCase());
  function arreglarMayus(s) {
    return s.split(' ').map((w) => (/^\p{Lu}{5,}[.,]?$/u.test(w) ? titulo(w) : w)).join(' ');
  }
  function fechaISO(txt) {
    const m = String(txt).match(/(\d{1,2})\s*[/.-]\s*(\d{1,2})\s*[/.-]\s*(\d{2,4})/);
    if (!m) return null;
    let y = +m[3]; if (m[3].length === 2) y += y > 40 ? 1900 : 2000;
    const d = +m[1], mes = +m[2];
    if (mes < 1 || mes > 12 || d < 1 || d > 31) return null;
    return `${y}-${String(mes).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }
  function edadEn(fn, hoy) {
    const [y, m, d] = fn.split('-').map(Number);
    let e = hoy.getFullYear() - y;
    if (hoy.getMonth() + 1 < m || (hoy.getMonth() + 1 === m && hoy.getDate() < d)) e--;
    return e;
  }

  // Equipo externo: "AT: Nombre (3764-000000)", "Psicop. Nombre (…)", "Lic. Nombre", "Email: …"
  const ROLES = [
    [/^A\.?T\.?\s*[:.-]\s*/i, 'Acompañante terapéutico'],
    [/^Psicop(edagoga)?\.?\s*[:.-]?\s*/i, 'Psicopedagoga'],
    [/^Psic[oó]log[oa]\s*[:.-]?\s*/i, 'Psicóloga'],
    [/^Gabinete( escolar)?\s*[:.-]?\s*/i, 'Gabinete escolar'],
    [/^(Maestr|Mestr)[oa]\s*[:.-]?\s*/i, 'Maestra'],
    [/^Docente\s*[:.-]?\s*/i, 'Docente'],
    [/^Directora?\s*[:.-]?\s*/i, 'Dirección'],
    [/^(Lic|Prof|Dra?)\.\s*/i, null], // el título queda en el nombre
  ];
  const RE_TEL = /\(?\s*(\+?\d[\d\s-]{6,}\d)\s*\)?/;
  const RE_MAIL = /[\w.+-]+@[\w-]+(\.[\w-]+)+/;
  function contacto(linea) {
    const mail = linea.match(RE_MAIL);
    if (/^e-?mail\s*:/i.test(linea) && mail) return { rol: '', nombre: '', contacto: mail[0], soloMail: true };
    for (const [re, rol] of ROLES) {
      if (!re.test(linea)) continue;
      let resto = rol ? linea.replace(re, '') : linea;
      const tel = resto.match(RE_TEL);
      let dato = '';
      if (tel) { dato = tel[1].replace(/\s+/g, ''); resto = resto.replace(tel[0], ''); }
      else if (mail) { dato = mail[0]; resto = resto.replace(mail[0], ''); }
      return { rol: rol || 'Escuela', nombre: limpio(resto.replace(/[-–,:]+\s*$/, '')), contacto: dato };
    }
    return null;
  }

  const RE_GRADO = /[-–.,]?\s*((\d+\s*(º|°|o|to|ro|do|er|vo|mo|no)?\.?\s*(grado|a[ñn]o)(\s+(del\s+)?secundari[oa])?)|(sala\s+(de\s+)?\d+(\s*a[ñn]os)?))\s*[.,]?\s*$/i;

  function leerEscuela(lineas, p) {
    const resto = [];
    for (const l of lineas) {
      if (/^datos\s+(de\s+(la\s+)?)?escuela\s*:?\s*$/i.test(l)) continue;
      const linea = l.replace(/^datos\s+(de\s+(la\s+)?)?escuela\s*:\s*/i, '');
      const c = contacto(linea);
      if (c) {
        const ult = p.equipo[p.equipo.length - 1];
        if (c.soloMail) {
          if (ult && !ult.contacto) ult.contacto = c.contacto; else p.equipo.push({ rol: 'Escuela', nombre: '', contacto: c.contacto });
        } else p.equipo.push({ rol: c.rol, nombre: c.nombre, contacto: c.contacto });
        continue;
      }
      resto.push(linea);
    }
    for (let l of resto) {
      const g = l.match(RE_GRADO);
      if (g && !p.grado) { p.grado = g[1].replace(/\s+/g, ' ').trim(); l = l.slice(0, g.index); }
      l = limpio(l.replace(/[\s\-–.,]+$/, '').replace(/[“”]/g, '"'));
      if (!l) continue;
      p.escuela = p.escuela ? `${p.escuela} ${l}` : l;
    }
    if (p.grado) p.grado = p.grado.charAt(0).toUpperCase() + p.grado.slice(1);
  }

  function leerPaciente(lineas, hoy) {
    const p = { apellido: '', nombre: '', dni: '', fn: '', os: '', afiliado: '', dx: [], escuela: '', grado: '', tutores: '', equipo: [], obs: '', revisar: [] };
    let edadWord = null;
    const extra = [];
    lineas.forEach((l, i) => {
      if (i === 0) {
        const n = l.replace(/[.,;]+$/, '');
        const [ap, ...no] = n.split(',');
        if (no.length) { p.apellido = titulo(limpio(ap)); p.nombre = titulo(limpio(no.join(' '))); }
        else {
          const [ap1, ...resto] = titulo(limpio(n)).split(' ');
          p.apellido = ap1; p.nombre = resto.join(' ');
          p.revisar.push('El nombre no tenía coma: se tomó la primera palabra como apellido. Revisalo.');
        }
        return;
      }
      const os = l.match(/^([A-ZÁÉÍÓÚÑ.]{2,}[\w.]*)\s*N\s*[º°o]?\s*[:.]?\s*([\d\s/-]+)/i);
      if (os && /\d{5,}/.test(os[2])) { p.os = os[1].replace(/\.$/, '').toUpperCase(); p.afiliado = os[2].replace(/\D/g, ''); }
      const dni = l.match(/D\.?N\.?I\.?\s*[Nº°]*\s*[:.]?\s*([\d.\s]{6,})/i);
      if (dni) p.dni = dni[1].replace(/\D/g, '');
      if (os || dni) return;
      if (/^F\.?\s*N\.?\s*[:.]/i.test(l) || /nacimiento/i.test(l)) {
        p.fn = fechaISO(l) || '';
        const e = l.match(/edad\s*[:.]?\s*(\d+)/i); if (e) edadWord = +e[1];
        if (!p.fn) p.revisar.push(`No se pudo leer la fecha de nacimiento ("${l}").`);
        return;
      }
      const dx = l.match(/^(DX|Diagn[oó]stico)\s*[:.]\s*(.*)$/i);
      if (dx) {
        p.dx = dx[2].split(/\.\s*|;\s*/).map((x) => arreglarMayus(limpio(x))).filter(Boolean)
          .map((x) => x.charAt(0).toUpperCase() + x.slice(1));
        return;
      }
      const tutor = l.match(/^\((.+)\)$/);
      if (tutor) { p.tutores = titulo(limpio(tutor[1])); p.revisar.push(`"${limpio(tutor[1])}" estaba entre paréntesis: se cargó como adulto responsable. Revisá el vínculo.`); return; }
      extra.push(l);
    });
    if (extra.length) p.obs = extra.join('\n');
    if (p.fn && edadWord != null) {
      const e = edadEn(p.fn, hoy);
      if (Math.abs(e - edadWord) > 1) p.revisar.push(`En el Word decía ${edadWord} años, pero con la fecha de nacimiento tendría ${e}. Revisá la fecha.`);
    }
    if (!p.dni) p.revisar.push('No tenía DNI.');
    return p;
  }

  function leerFichasWord(xml, hoy = new Date()) {
    const cuerpo = (xml.match(/<w:body>([\s\S]*)<\/w:body>/) || [, xml])[1];
    const pacientes = []; const encabezado = [];
    for (const tabla of bloques(cuerpo, 'tbl')) {
      for (const tr of bloques(tabla, 'tr')) {
        // Las celdas vacías o con un número de orden (la columna angosta de la izquierda) no cuentan.
        const celdas = bloques(tr, 'tc').map(lineasCelda).filter((c) => c.length && !(c.length === 1 && /^\d{1,3}[.)-]?$/.test(c[0])));
        if (!celdas.length) continue;
        const [a, b = []] = celdas;
        // Una ficha tiene que tener algo que parezca DNI, afiliado o fecha de nacimiento.
        if (!a.some((l) => /DNI|F\.?\s*N\.?\s*[:.]|N\s*[º°]\s*:/i.test(l))) continue;
        const p = leerPaciente(a, hoy);
        leerEscuela(b.concat(celdas.slice(2).flat()), p);
        if (!p.escuela) p.revisar.push('No tenía los datos de la escuela.');
        pacientes.push(p);
      }
    }
    // Lo que está fuera de las tablas (título, códigos de la obra social).
    const fuera = cuerpo.replace(/<w:tbl[ >][\s\S]*?<\/w:tbl>/g, '');
    for (const p of bloques(fuera, 'p')) { const t = limpio(textoParrafo(p)); if (t) encabezado.push(t); }
    return { pacientes, encabezado };
  }

  if (typeof module === 'object' && module.exports) module.exports = { leerFichasWord, fechaISO };
  else raiz.leerFichasWord = leerFichasWord;
})(typeof window !== 'undefined' ? window : globalThis);
