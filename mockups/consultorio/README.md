# Consultorio · fichas, sesiones y documentos

App web para el celular y la compu de una psicopedagoga: fichas de pacientes, sesiones con nota de evolución y los documentos de cada paciente (sus informes y los de otros profesionales), guardados en su Drive.
Reemplaza al Word de fichas, que se importa una vez.

Archivos estáticos (HTML, CSS y JS sin build). **El repo no tiene datos de pacientes.** Para probar se usan pacientes inventados.

**Diseño propio de la profesional, no el de Encastre:** crema y rosa pastel, con verde salvia para lo que está bien, en Fraunces (títulos) y DM Sans. Tiene esquinas redondeadas y modo claro y oscuro.
- Sus datos se cargan en **Ajustes → Tus datos**: nombre, profesión, matrícula, mail, teléfono y dirección. Viajan por la planilla (op `perfil`) y aparecen arriba, en la pantalla del PIN y en el recetario. Se guardan sin cifrar en `consultorio.perfil`, porque no son datos de pacientes. **El repo no tiene sus datos.**
- Su logo va **solo en el recetario**, fijo en [`logo-recetario.jpg`](logo-recetario.jpg) (`LOGO_RECETARIO`), sacado de su recetario escaneado. Arriba en la app quedan sus iniciales. El script todavía acepta un logo por la planilla, pero la app ya no lo usa.
- Cada paciente tiene un círculo con sus iniciales y un color pastel fijo (`avatar()`), para reconocerlo de un vistazo.
- Encastre solo figura como "Hecho por Encastre" al pie de Ajustes.

## Dónde se guardan los datos

En una **planilla de Google de la profesional** (hojas Pacientes, Sesiones, Documentos, Solicitudes, Agenda y Registro), a través del script [`apps-script/Codigo.gs`](apps-script/Codigo.gs). Cómo instalarlo: [`apps-script/INSTALAR.md`](apps-script/INSTALAR.md).

- **Cada dispositivo guarda una copia cifrada** para abrir rápido y sin internet. La clave sale del PIN (PBKDF2-SHA256, 310 000 vueltas → AES-GCM 256) y solo vive en memoria mientras la app está abierta. En `localStorage` hay un único valor, `consultorio.cofre`, que contiene los datos, la conexión y la cola de envíos, todo cifrado.
- **Se bloquea sola** a los 5 minutos en segundo plano o a los 20 sin tocarla (`BLOQUEO_OCULTA`, `BLOQUEO_QUIETA`), y con el candado de arriba. Con el PIN mal 5 veces, espera 30 s, 60 s, 120 s…
- **Si se olvida el PIN:** se borra el dispositivo y se vuelve a conectar la planilla. Se baja todo de nuevo, salvo lo que no se había enviado.
- Lo que se anota va a una cola y se manda a la planilla apenas hay conexión. El indicador de arriba muestra "Al día", "Guardando…" o "Sin conexión · N sin enviar".
- **Nada se borra:** las sesiones se corrigen o se anulan (quedan tachadas y no cuentan) y los pacientes se dan de alta. Cada cambio queda en la hoja **Registro** con fecha y hora.
- Para sumar un dispositivo: **Ajustes → Abrir en otro dispositivo** (QR o link con la dirección y la clave). En el otro dispositivo se elige un PIN propio.
- Sin planilla, la app funciona igual pero solo en ese dispositivo, y no guarda documentos.

## Qué hace

- **Importar el Word de fichas** (`.docx`), con [`importar-word.js`](importar-word.js): una tabla con un paciente por fila. La primera celda trae nombre, obra social y n.º de afiliado, DNI, fecha de nacimiento y diagnóstico; la segunda, la escuela, el grado y los contactos (AT, psicopedagoga, gabinete, maestra, mail).
  - Los nombres en mayúscula pasan a "Nombre Apellido". Las siglas cortas (TEA, TDAH) quedan igual.
  - Queda en **Para revisar**: el nombre sin coma, un dato entre paréntesis (se carga como adulto responsable), la edad escrita que no coincide con la fecha de nacimiento, y la falta de DNI o de escuela.
  - Si se importa de nuevo, se saltean los pacientes que ya están (mismo DNI).
- **Ficha:** la edad se calcula sola (años y meses) y hay botones de llamar y WhatsApp para cada contacto. Debajo están sus sesiones y documentos, y se puede dar de alta o volver a activo.
- **Agenda** (`#/agenda`): vista de la semana y del día. **Turnos** con un paciente o con otro motivo (reunión, entrevista), con fecha, hora, duración (la elige ella y se recuerda por paciente), aviso y opción de **repetirse todas las semanas** hasta una fecha. Al cambiar o cancelar uno que se repite, se elige "solo este día" (queda como excepción) o "este y los que siguen" (corta la serie y arranca otra). En los turnos de hoy o pasados se marca **Asistió / Faltó / Avisó** con un toque y queda la sesión anotada, ligada al turno.
  - **Alertas:** recordatorios sueltos con fecha, hora y aviso; se marcan como hechas.
  - **Google Calendar:** el script copia cada turno y alerta a un calendario **"Consultorio"** de su cuenta (serie semanal con excepciones, aviso emergente), así le llegan las notificaciones al celular aunque la app esté cerrada. Cada cambio borra y vuelve a crear el evento. Si el calendario falla, el turno se guarda igual y queda anotado en el Registro.
  - En el celular, la barra es Inicio · Pacientes · **Nuevo** (sesión, turno o alerta) · Agenda · Ajustes. "Sesiones del mes" se abre desde la Agenda y desde el inicio. En la compu, la barra lateral muestra Agenda y Sesiones.
- **Sesiones:** fecha, asistencia (asistió, faltó o avisó) y nota. Lo que se escribe queda como borrador cifrado hasta guardarlo.
- **Sesiones del mes:** totales y conteo por paciente (sirve para la planilla de la obra social). Se exporta a Excel.
- **Documentos del paciente**, separados en **Mis informes** y **De otros profesionales**: PDF, Word o fotos de hasta 25 MB (`MAX_MB`). Necesitan internet, porque no pasan por la cola.
  - Se suben en base64 al script, que los guarda en `Consultorio/Pacientes/<Apellido, Nombre>/Mis informes` o `…/De otros profesionales` y los anota en la hoja **Documentos** (título, profesional, fecha, tamaño).
  - Las fotos de más de 600 KB se achican a 2000 px y JPEG 82 % (`FOTO_MAX`).
  - Se pueden corregir el título, el profesional, la fecha y de quién es. **Quitar** saca el documento de la ficha y manda el archivo a la papelera de Drive, donde queda 30 días.
  - En **Ajustes** se ve el espacio usado en la cuenta de Google. Lo que le comparten otros (por ejemplo, desde CENEMI) no ocupa su espacio.
- **Empezar un informe en Google Docs** (opcional): copia una plantilla de `Consultorio/Plantillas` en **Mis informes** y reemplaza los `{{campos}}` con los datos de la ficha (lista en `CAMPOS_INFORME`, en `app.js`). La plantilla de ejemplo tiene solo el encabezado con los datos, porque cada informe lo escribe ella según el caso.
- **Solicitudes a la obra social (recetario):** desde la ficha, **Solicitudes → Nueva**. Trae el paciente, el n.º de afiliado y el diagnóstico; se marcan los códigos (`CODIGOS`: 450105 y 450102) con la cantidad de sesiones. Se imprime con su membrete, **4 por hoja A4** para cortar (`POR_HOJA`): "Agregar a la hoja" junta varias y "Imprimir" las imprime todas. La firma y el sello van a mano. Cada solicitud queda en la ficha y en la hoja **Solicitudes**, y se puede anular. Funciona sin internet.
- **Copia de seguridad** en JSON, cifrada con el PIN. **Exportar a Excel** con pacientes y sesiones.
- Instalable (manifest + `sw.js`), abre sin internet. **Al publicar cambios, subir `VERSION` en `sw.js` y el `?v=` de `app.css`, `importar-word.js` y `app.js` en `index.html` (y en la lista `APP` del `sw.js`)**: así la página y el código siempre son de la misma versión, aunque el navegador tenga guardada una copia vieja (GitHub Pages las guarda 10 minutos).

El cifrado necesita HTTPS (GitHub Pages) o `localhost`.
