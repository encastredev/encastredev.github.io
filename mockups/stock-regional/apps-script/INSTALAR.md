# Conectar la app con una planilla de Google

Se hace una vez por cuenta: primero con la tuya para probar y después con la de ella. Son unos 10 minutos.

## 1. Crear la planilla y pegar el script

1. Entrá a [sheets.new](https://sheets.new) con la cuenta de Google que va a guardar el stock. Ponele un nombre, por ejemplo **Stock demos y regalos**.
2. Menú **Extensiones → Apps Script**. Se abre el editor en otra pestaña.
3. Borrá lo que viene escrito, pegá todo el contenido de [`Codigo.gs`](Codigo.gs) y guardá con el disquete (o Ctrl+S).

## 2. Preparar la planilla

1. En el editor, arriba, elegí la función **configurar** y tocá **Ejecutar**.
2. Google pide permiso: **Revisar permisos** → elegí la cuenta → aparece "Google no verificó esta app". Tocá **Configuración avanzada → Ir a (nombre del proyecto)** → **Permitir**.
   Es normal: el script es tuyo y solo toca esta planilla.
3. Volvé a la planilla: ahora tiene las hojas **Productos** y **Movimientos**, y un menú nuevo **Stock app**. Si no aparece el menú, recargá la página.

## 3. Publicar el script

1. En el editor: **Implementar → Nueva implementación**.
2. En el engranaje de "Seleccionar tipo", elegí **Aplicación web**.
3. Completá así:
   - **Ejecutar como:** Yo
   - **Quién tiene acceso:** Cualquier usuario
4. **Implementar** y copiá la **URL de la aplicación web** (termina en `/exec`).

"Cualquier usuario" hace falta para que la app pueda hablar con la planilla sin iniciar sesión. Para que nadie más pueda leer ni escribir, la app además necesita la **clave**, que se genera en el paso 2 y está guardada en el script.

## 4. Conectar la app

1. En la planilla: menú **Stock app → Ver datos de conexión**. Ahí están la dirección y la clave.
2. Abrí la app en la compu → **Conectar con la planilla** → pegá la dirección y la clave.
3. Tocá **Importar mi Excel** y elegí el Excel del stock. En unos segundos aparece todo en la hoja **Productos**.
4. Para el celular: en la app de la compu, **Más → Abrir en otro dispositivo** y escaneá el código QR con la cámara del celular.

## Si cambiás el script

Si se modifica `Codigo.gs`, hay que pegarlo de nuevo y publicarlo así: **Implementar → Administrar implementaciones → lápiz → Versión: Nueva versión → Implementar**. La dirección no cambia.
Si en cambio se hace una **Nueva implementación**, la dirección cambia y hay que volver a conectar la app.

## Pasar de tu cuenta a la de ella

Repetí los pasos 1 a 4 con la cuenta de ella. En cada dispositivo donde probaste: **Más → Desconectar este dispositivo** y conectalo a la dirección nueva.

## Qué se puede tocar a mano en la planilla

- Se puede mirar, filtrar y copiar todo.
- En **Productos** se pueden corregir el nombre, la categoría y los vencimientos. La columna **VENCIMIENTOS** usa el formato `05/2027:2; 02/2029:3` (mes/año:cantidad; `s/f` si no tiene fecha). También se pueden agregar filas nuevas: el ID se completa solo.
- No cambies la columna **ID** ni el orden de las columnas.
- Los cambios a mano aparecen en la app la próxima vez que se actualiza (al abrirla, cada minuto o tocando el indicador de arriba a la derecha).
