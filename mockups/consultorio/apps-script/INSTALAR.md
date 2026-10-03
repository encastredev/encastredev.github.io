# Conectar la app con una planilla de Google

Se hace una vez por cuenta: primero con la tuya para probar y después con la de ella. Son unos 10 minutos.

**Antes:** que la cuenta de Google de ella tenga activada la **verificación en dos pasos** (myaccount.google.com → Seguridad). Ahí quedan las fichas de los pacientes.

## 1. Crear la planilla y pegar el script

1. Entrá a [sheets.new](https://sheets.new) con la cuenta de Google que va a guardar las fichas. Ponele un nombre, por ejemplo **Consultorio**.
2. Menú **Extensiones → Apps Script**. Se abre el editor en otra pestaña.
3. Borrá lo que viene escrito, pegá todo el contenido de [`Codigo.gs`](Codigo.gs) y guardá con el disquete (o Ctrl+S).
4. En el editor, **Configuración del proyecto** (el engranaje): revisá que la **zona horaria** sea `(GMT-03:00) Buenos Aires`.

## 2. Preparar la planilla

1. En el editor, arriba, elegí la función **configurar** y tocá **Ejecutar**.
2. Google pide permiso: **Revisar permisos** → elegí la cuenta → aparece "Google no verificó esta app". Tocá **Configuración avanzada → Ir a (nombre del proyecto)** → **Permitir**.
   Es normal: el script es tuyo. Pide acceso a Drive y Docs porque crea la carpeta **Consultorio** y guarda ahí los documentos de los pacientes.
3. Volvé a la planilla: ahora tiene las hojas **Pacientes**, **Sesiones**, **Documentos** y **Registro**, y un menú nuevo **Consultorio**. Si no aparece el menú, recargá la página.
4. En Drive quedó la carpeta **Consultorio**, con la planilla adentro y dos carpetas:
   - **Pacientes**: cuando se sube el primer documento de un paciente, se crea su carpeta, con **Mis informes** y **De otros profesionales** adentro.
   - **Plantillas**, con un informe en blanco que solo trae los datos del paciente (es opcional).

## 3. Publicar el script

1. En el editor: **Implementar → Nueva implementación**.
2. En el engranaje de "Seleccionar tipo", elegí **Aplicación web**.
3. Completá así:
   - **Ejecutar como:** Yo
   - **Quién tiene acceso:** Cualquier usuario
4. **Implementar** y copiá la **URL de la aplicación web** (termina en `/exec`).

"Cualquier usuario" hace falta para que la app pueda hablar con la planilla sin iniciar sesión en Google. Para que nadie más pueda leer ni escribir, además necesita la **clave** que se generó en el paso 2. Esa clave da acceso a todas las fichas: no se manda por WhatsApp ni por mail.

## 4. Conectar la app

1. En la planilla: menú **Consultorio → Ver datos de conexión**. Ahí están la dirección y la clave.
2. Abrí la app en la compu y elegí el PIN → **Ajustes → Conectar con la planilla** → pegá la dirección y la clave.
3. **Importar mi Word** con el Word de fichas. En unos segundos aparece todo en la hoja **Pacientes**.
4. Revisá **Pacientes → Para revisar**.
5. Para el celular: en la app de la compu, **Ajustes → Abrir en otro dispositivo** y escaneá el QR con la cámara del celular. En el celular se elige un PIN.

## Documentos de los pacientes

- Desde la ficha: **Subir documento** → **Mío** o **De otro profesional** → elegir el archivo o sacar una foto.
- Quedan en la carpeta del paciente en Drive y listados en la hoja **Documentos**. No hace falta tocarlos desde Drive: se abren desde la app.
- Ocupan el espacio de la cuenta de ella (15 GB gratis entre Drive, Gmail y Fotos). Un informe en PDF pesa entre 100 KB y 2 MB, así que entran miles. Lo que le comparten otras personas o instituciones no le ocupa espacio. En **Ajustes** de la app se ve cuánto lleva usado.
- Si un archivo se subió al paciente equivocado: tocá el lápiz → **Quitar documento**. Va a la papelera de Drive y se puede recuperar durante 30 días.

## Plantillas (opcional)

- Una plantilla es cualquier **documento de Google Docs** dentro de **Consultorio → Plantillas**. El nombre del documento es el que aparece en la app.
- Donde va un dato de la ficha, se escribe el campo entre llaves dobles, por ejemplo `{{nombre}}`, `{{edad}}` o `{{diagnostico}}`. La lista completa está en la app, en **Empezar uno en Google Docs → Qué datos completa solo**. También pueden ir en el encabezado y el pie (el membrete).
- **Para usar un Word que ya tiene:** subilo a la carpeta Plantillas, abrilo y tocá **Archivo → Guardar como documento de Google**. Después borrá el `.docx` y escribí los campos donde correspondan.
- Después de agregar o renombrar una plantilla, en la app tocá **Ajustes → Actualizar ahora**.

## Si cambiás el script

Si se modifica `Codigo.gs`, hay que pegarlo de nuevo y publicarlo así: **Implementar → Administrar implementaciones → lápiz → Versión: Nueva versión → Implementar**. La dirección no cambia.
Si en cambio se hace una **Nueva implementación**, la dirección cambia y hay que volver a conectar la app.

## Pasar de tu cuenta a la de ella

Repetí los pasos 1 a 4 con la cuenta de ella. En cada dispositivo donde probaste: **Ajustes → Desconectar este dispositivo** y conectalo a la dirección nueva.
**Borrá la planilla y la carpeta de prueba de tu cuenta** si cargaste datos reales.

## Qué se puede tocar a mano en la planilla

- Se puede mirar, filtrar y copiar todo.
- En **Pacientes** se pueden corregir los datos. En **DIAGNÓSTICO** y **PARA REVISAR** va un dato por renglón (Ctrl+Enter dentro de la celda). En **EQUIPO** va un contacto por renglón, con el formato `Rol · Nombre · Teléfono`.
- En **Sesiones** se puede corregir la nota o la asistencia (`Asistió`, `Faltó`, `Avisó`).
- En **Documentos** se puede corregir el título o el profesional. Para quitar uno, mejor desde la app (así el archivo va a la papelera).
- Se pueden agregar pacientes o sesiones a mano: el ID se completa solo.
- No cambies la columna **ID** ni el orden de las columnas, y no toques la hoja **Registro**.
- Los cambios a mano aparecen en la app la próxima vez que se actualiza (al abrirla, cada minuto o tocando el indicador de arriba).
