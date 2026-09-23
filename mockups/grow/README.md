# GROW Stock · boceto navegable

Boceto interactivo del sistema de stock para **GROW Partes & Máquinas / GROW GLB**, pensado para presentarlo desde la notebook y desde el celular.
Son archivos estáticos: HTML, CSS y JS sin frameworks, sin build y sin conexión a internet.

> **Datos.** Los productos, códigos, ubicaciones, referencias cruzadas y máquinas compatibles salen del Excel real de GROW. **Los costos están alterados con un factor fijo.** Los movimientos, el stock y la distribución del depósito de Miami y los envíos son simulados. Nada se guarda: al recargar, la pantalla vuelve al estado inicial.

---

## Cómo verlo

**En la computadora:** doble clic en `index.html`.

**Publicarlo en GitHub Pages**
1. Crear un repositorio en GitHub (por ejemplo `grow-boceto`).
2. Subir **el contenido de esta carpeta** a la raíz del repositorio: `index.html`, las pantallas `01…12` y la carpeta `assets/`. Se puede arrastrar desde *Add file → Upload files*.
3. Ir a *Settings → Pages*, elegir *Source: Deploy from a branch*, rama `main` y carpeta `/ (root)`, y guardar.
4. En uno o dos minutos queda publicado en `https://<usuario>.github.io/grow-boceto/`.

Todas las páginas tienen `<meta name="robots" content="noindex, nofollow">` para que no aparezcan en buscadores. Igual, **un repositorio público se puede ver con el link**. Publicar Pages desde un repositorio privado requiere un plan pago de GitHub.

---

## Pantallas

| # | Archivo | Etapa | Qué se puede probar |
|---|---|---|---|
| 00 | `index.html` | — | Portada: el problema con los números del Excel, la etapa 1, el recorrido sugerido, el índice y cómo sigue el proyecto |
| 01 | `01-panel.html` | 1 | Cambiar entre Todos, Misiones y Miami (recalcula los indicadores); desplegar envíos; pasar el mouse por las barras |
| 02 | `02-inventario.html` | 1 | Buscar `P959052` (referencia cruzada) o `320D` (máquina); filtros; abrir filas; cambiar entre la lista **público** y **distribuidor**; **exportar a Excel lo que está filtrado**; seleccionar productos y mandarlos a etiquetas |
| 03 | `03-ficha-producto.html` | 1 | **Fotos del producto** (agregar hasta 3); stock por ubicación; tipo de parte; **el factor de importación del producto**, editable, que recalcula el costo ARG y las dos ventas; filtrar máquinas compatibles; etiqueta con Part N y unidades por empaque |
| 04 | `04-movimiento.html` | 1 | Egreso, ingreso, ajuste o reubicación; el stock resultante se calcula en vivo. En **Ingreso** se carga el **costo FOB y el factor de esa importación**, el documento del despacho y el N° de tracking: ahí queda definido el costo del repuesto |
| 05 | `05-mapa-deposito.html` | 1 | Mapa de estanterías, estantes y cajas (con los colores del Excel); buscar un producto y ver dónde está; **exportar a Excel lo que hay en una ubicación** para salir a controlarla; **Editar depósito**: agregar una estantería (nombre y niveles), un estante o una caja, ver sus etiquetas de ubicación y mover productos ahí |
| 06 | `06-etiquetas-producto.html` | 1 | Etiquetas de la **XP-H500B**: Part N con sufijo (proveedor, `.GEN` o `.ALT`), unidades por empaque (ej. bolsas de 20 O-rings), tipo de parte (alternativa sobre el rollo pre-impreso; original u obsoleta en rollo blanco con el título impreso), **etiqueta manual**, código de barras, “ver solo lo que imprime” y calibración en mm |
| 07 | `07-despacho.html` | 2 (adelanto) | Envío desde Miami o a un cliente; bultos, peso y etiquetas “Bulto 1 de N” de la **XP-365B** |
| 08 | `08-precios.html` | 1 | Tipo de cambio, factor FOB→ARG **por defecto** (para los que todavía no tienen el suyo) y márgenes por categoría para **las dos listas**; simulador; cuántos productos ya tienen su factor propio |
| 09 | `09-migracion.html` | 1 | Filas reales del Excel, antes y después; problemas detectados con ejemplos; plan de importación |
| 10 | `10-app-buscar.html` | 1 | Celular: simular el lector, ver dónde está el repuesto y cuánto hay, **si la pieza es nuestra y de cuándo es su etiqueta**, y **sacarle la foto** si no tiene |
| 11 | `11-app-recepcion.html` | 2 (adelanto) | Celular: recibir un envío escaneando bultos y contando productos |
| 12 | `12-app-conteo.html` | 1 | Celular: conteo por ubicación (con modo ciego), diferencias en unidades y en dólares, y **foto de cada producto** mientras se cuenta |

**Etapas.** Cada pantalla muestra su etapa en la barra superior. Dentro de las pantallas de la etapa 1, todo lo que es de Miami (selector de depósito, envíos en tránsito, stock en Miami) lleva la marca punteada **“Etapa 2”**: se ve para que el cliente entienda hacia dónde va, pero no entra en la primera etapa.

### Flujos de punta a punta
Los datos viajan entre pantallas por la URL: se sigue viendo reflejado mientras se navega con los menús y los botones.

1. **Conteo:** 12 (sacar una foto y confirmar con una diferencia) → 03 muestra la foto y el ajuste → 01 lo suma a los movimientos. La foto viaja en el `#` de la URL (no llega al servidor).
2. **Venta:** 04 (egreso) → 03 con el stock descontado.
3. **Miami:** 07 (despachar) → 11 (recibir con el celular) → 01 con el envío cerrado y el stock ubicado → 06 para etiquetar lo que llegó.
4. **Etiquetas:** 02 (seleccionar) → 06 (imprimir) → 02 y 03 los muestran etiquetados.
5. **Depósito nuevo:** 05 (Editar depósito → crear la estantería M) → “Mover productos acá” → 04 (reubicación con destino M0) → “Ver en el mapa” → 05 con la estantería M y su stock. La estructura creada viaja en `?nuevas=`.
6. **Importación:** 04 (Ingreso → costo FOB, factor, documento y N° de tracking) → 03 muestra el costo ARG nuevo, las dos ventas recalculadas y el documento en el historial.
7. **Exportar:** 02 (filtrar por categoría) → “Exportar a Excel” → elegir columnas → baja un `.csv` con solo esa parte del stock.

Para volver al estado inicial: link “Reiniciar esta pantalla” del menú, o abrir la página sin parámetros.

---

## Dónde tocar

| Qué | Dónde |
|---|---|
| **Colores, tipografías y medidas** | Variables al principio de `assets/ui.css` (`--acento`, `--grafito`, `--f-titulo`…). El acento es uno solo: `--acento`. |
| Tamaño del marco del teléfono | `--telefono-ancho`, `--telefono-alto`, `--telefono-borde` en `assets/ui.css` |
| **Orden, títulos y “qué probar” de cada pantalla** | Arreglo `SCREENS` al principio de `assets/nav.js` (alimenta el índice, la navegación anterior/siguiente y la portada) |
| Menú de la notebook | Arreglo `MENU` en `assets/nav.js` |
| Pestañas de la app del celular | Arreglo `TABS` en `assets/nav.js` |
| Tipo de cambio, márgenes y stock mínimo iniciales | Objeto `CONFIG` en `assets/nav.js` |
| Diseño de las etiquetas | Funciones `etiquetaProducto` y `etiquetaDespacho` en `assets/nav.js` y bloque `ETIQUETAS` de `assets/ui.css` |
| Textos propios de cada pantalla | En el HTML de cada página, dentro de `<main id="pagina">` |
| Productos | `assets/datos.js` (se genera a partir del Excel, no se edita a mano) |

**Agregar una pantalla:** crear `13-nombre.html` copiando una existente (`data-shell="escritorio"` o `"telefono"`), sumarla en `SCREENS` y, si corresponde, en `MENU` o `TABS`.

---

## Definido en la reunión del 22/09 con Walter
- **El costo en Argentina va por producto, no por regla general.** El factor para nacionalizar va de **×2 a ×10** según el flete, el volumen y si consolida el envío. Se define **cuando entra la importación**, ítem por ítem. El factor por categoría queda solo como valor por defecto y para valorizar el stock.
- **Dos listas de precios:** consumidor final y distribuidor (≈45% y ≈30% de margen). Los precios por cliente quedan para la etapa 3.
- **Documentos de importación:** se adjunta el papel del despacho y se guarda un N° de referencia o tracking, para ver qué envío está demorado.
- **Código de barras propio GROW** (no el del fabricante): además sirve para saber si una pieza salió de acá y de cuándo, si un cliente manda la foto de la caja.
- **Exportar a Excel, por partes** (audios del 22/09): “un Excel de solamente filtros, un Excel de solamente sensores”, para dejárselo a alguien que no entra al sistema.
- **Facturación, remitos, clientes y cuenta corriente son la etapa 3**, no la 2.

## Definido con GROW (audios de Walter)
- **Part N** = número de pieza + "." + sufijo. El sufijo son las iniciales del proveedor (ej. `.KO`), `.GEN` si es genuino/original o `.ALT` si es alternativo en general.
- **Descripción:** el nombre del producto, en inglés o en castellano.
- **Cantidad de la etiqueta:** son las unidades del empaque fraccionado, no el stock (ej. una bolsa de 20 resortes lleva 20).
- **Rollos:** solo existe el pre-impreso “Partes alternativas”. Para otros tipos, el sistema puede imprimir el título.
- **Carga:** las etiquetas se pueden completar a mano o desde el sistema.
- **Código de barras:** va en el espacio libre de la etiqueta.
- **Más adelante:** que las etiquetas salgan solas al emitir la factura o el remito.
- **Fotos:** el cliente pidió ir cargando fotos de cada producto. Entran en la etapa 1 como foto de identificación, sacada con el celular durante el conteo o desde la ficha. Las fotos de catálogo para la web quedan para más adelante.

## Supuestos a confirmar con GROW
- **Medidas de los rollos:** se asumió 100×70 mm la etiqueta de producto y 80×50 mm la de despacho.
- **Tipo de parte de cada producto:** se asignó automáticamente (original según la marca, obsoleta si dice usado o reacondicionado, el resto alternativa). Hay que revisarlo.
- **Empaque:** solo se detectó en 6 productos del Excel (ej. “4 (20 O-RING)”); el resto figura por unidad.
- **Precios:** los márgenes de cada lista por categoría (los que están son de ejemplo).
- **Miami:** la distribución real del warehouse.
- **Despacho:** qué datos lleva la etiqueta (cliente, transporte, remito) y qué número de guía usan.
- **Usuarios:** cuántas personas lo van a usar y con qué rol (aparece Carolina, del lado de GROW).

## Estructura
```
index.html                    portada e índice
01-panel.html … 12-app-conteo.html
assets/ui.css                 sistema visual (variables arriba, media queries al final)
assets/nav.js                 SCREENS / MENU / TABS, shells, datos en memoria, flujos por URL, Code128, etiquetas
assets/datos.js               productos normalizados del Excel (costos alterados)
assets/fonts/                 Archivo Black y Arimo (SIL Open Font License)
```
