# Stock regional · demos y regalos

App web para el celular que controla el stock de productos de demostración y regalo, con vencimientos.
Reemplaza al Excel: se importa una vez y después se escanea el código de barras de cada caja para anotar lo que sale y lo que entra.

Archivos estáticos (HTML, CSS y JS sin build). **El repo no tiene datos.**

## Dónde se guardan los datos

En una **planilla de Google de la dueña del stock** (hojas Productos y Movimientos), a través del script [`apps-script/Codigo.gs`](apps-script/Codigo.gs). Así la compu y el celular ven lo mismo. Cómo instalarlo: [`apps-script/INSTALAR.md`](apps-script/INSTALAR.md).

- Cada dispositivo guarda una copia local (`localStorage`) para abrir rápido y sin internet.
- Lo que se anota va a una cola (`stockRegional.cola`) y se manda a la planilla apenas hay conexión. El indicador de arriba a la derecha muestra "Al día", "Guardando…" o "Sin conexión · N sin enviar".
- El script aplica **movimientos** (salió −n, entró +n, corrección ±n por fecha), no totales, así que dos dispositivos no se pisan el stock.
- Para sumar un dispositivo: **Más → Abrir en otro dispositivo** (QR o link con la dirección y la clave).
- Sin planilla, la app funciona igual pero solo en ese dispositivo.

## Qué hace

- **Importar su Excel** (`.xls`/`.xlsx`): columna `PRODUCTO`, `FECHA DE VENCIMIENTO` + columnas sin título a la derecha (hasta 3 fechas) y `CANT`.
  - La categoría sale de la primera palabra del nombre (`MAKE UP`, `PERF`, `CUERPO`…). Ver `CATEGORIAS` en `app.js`.
  - Varias fechas y una sola cantidad: 1 unidad a cada fecha posterior y el resto a la más próxima. El producto muestra el aviso para que lo corrija.
  - Filas sin fecha, sin cantidad, repetidas o con fechas raras quedan en **Para revisar**.
- **Sacar productos** y **Cargar lo que llegó** (`#/salida`, `#/entrada`): se arma una lista escaneando o buscando varios productos y se confirma una vez. La salida lleva motivo (demo, regalo, premio, venta, vencido, otro) y detalle; la entrada, cantidad y mes/año de vencimiento por producto. Sale primero lo que vence antes. Todo se puede deshacer. Las listas sin confirmar quedan guardadas (`stockRegional.lotes`).
- **Escanear**: con `BarcodeDetector` (Chrome en Android) o ZXing desde la CDN (iPhone). En las listas, la cámara queda abierta y cada código se suma. También se puede escribir el número a mano, o usar un **lector USB** en la compu (escribe el código y Enter: la app lo detecta en cualquier pantalla).
  La primera vez que se escanea un producto se asocia buscándolo por nombre; después lo encuentra solo.
- **Ficha del producto**: Sacar o Agregar de a uno, corregir vencimientos, códigos e historial.
- **Celular y compu**: en el celular, barra abajo y pantallas de una columna. Desde 960 px, menú a la izquierda, stock en tabla con la ficha en un panel a la derecha e historial en tabla.
- **Corregir** las cantidades por fecha (queda como "Corrección" en el historial).
- **Tablero**: vencidos, vencen en los próximos 3 meses (`MESES_ALERTA`), en stock y agotados.
- **Exportar a Excel** (hojas Stock y Movimientos). Ese Excel se puede volver a importar.
- **Copia de seguridad** en JSON, que en el celular se comparte por WhatsApp o Drive. La app avisa si pasaron 7 días sin copia.
- Instalable (manifest + `sw.js`), abre sin internet. Al publicar cambios, subir `VERSION` en `sw.js`.

La cámara solo funciona con HTTPS (GitHub Pages) o en `localhost`.
