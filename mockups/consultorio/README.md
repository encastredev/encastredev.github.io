# Consultorio · fichas, sesiones y documentos

App web para el celular y la compu de una psicopedagoga: fichas de pacientes, sesiones con nota de evolución y los documentos de cada paciente (sus informes y los de otros profesionales), guardados en su Drive.
Reemplaza al Word de fichas, que se importa una vez.

Archivos estáticos (HTML, CSS y JS sin build). **El repo no tiene datos de pacientes.** Para probar se usan pacientes inventados.

## Dónde se guardan los datos

En una **planilla de Google de la profesional** (hojas Pacientes, Sesiones, Documentos y Registro), a través del script [`apps-script/Codigo.gs`](apps-script/Codigo.gs). Cómo instalarlo: [`apps-script/INSTALAR.md`](apps-script/INSTALAR.md).

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
- **Sesiones:** fecha, asistencia (asistió, faltó o avisó) y nota. Lo que se escribe queda como borrador cifrado hasta guardarlo.
- **Sesiones del mes:** totales y conteo por paciente (sirve para la planilla de la obra social). Se exporta a Excel.
- **Documentos del paciente**, separados en **Mis informes** y **De otros profesionales**: PDF, Word o fotos de hasta 25 MB (`MAX_MB`). Necesitan internet, porque no pasan por la cola.
  - Se suben en base64 al script, que los guarda en `Consultorio/Pacientes/<Apellido, Nombre>/Mis informes` o `…/De otros profesionales` y los anota en la hoja **Documentos** (título, profesional, fecha, tamaño).
  - Las fotos de más de 600 KB se achican a 2000 px y JPEG 82 % (`FOTO_MAX`).
  - Se pueden corregir el título, el profesional, la fecha y de quién es. **Quitar** saca el documento de la ficha y manda el archivo a la papelera de Drive, donde queda 30 días.
  - En **Ajustes** se ve el espacio usado en la cuenta de Google. Lo que le comparten otros (por ejemplo, desde CENEMI) no ocupa su espacio.
- **Empezar un informe en Google Docs** (opcional): copia una plantilla de `Consultorio/Plantillas` en **Mis informes** y reemplaza los `{{campos}}` con los datos de la ficha (lista en `CAMPOS_INFORME`, en `app.js`). La plantilla de ejemplo tiene solo el encabezado con los datos, porque cada informe lo escribe ella según el caso.
- **Copia de seguridad** en JSON, cifrada con el PIN. **Exportar a Excel** con pacientes y sesiones.
- Instalable (manifest + `sw.js`), abre sin internet. Al publicar cambios, subir `VERSION` en `sw.js`.

El cifrado necesita HTTPS (GitHub Pages) o `localhost`.
