# Boceto navegable — Panificados Maná

> **Aviso sobre los datos.** Todo lo que se ve en este boceto es **simulado**.
> La *estructura* es la real de Maná —los rubros de producto, los sectores, la
> dotación de 53 personas, las tres franjas horarias, las tres cajas—
> porque salió del diagnóstico y de información pública. Los *números* no: al
> momento de armar esto no tuvimos acceso a Holistor ni a Todosoft.
> Nada del material del cliente (planillas, exportaciones, credenciales) está
> en este repositorio, y no debe subirse a un repositorio público.

---

## Estado: segunda entrega parcial

Van **10 de las 14 pantallas**. Los cinco flujos de la reunión ya se recorren enteros,
y el quinto termina en el celular.

Las pantallas que faltan **no se linkean**: aparecen en el menú marcadas con
"pronto" y no se puede caer en un 404 delante del cliente. Cuando una se escribe,
se le pone `listo: true` en `SCREENS` y el link se enciende solo.

| Estado | Archivo | Pantalla |
|---|---|---|
| ✅ | `index.html` | Portada de venta |
| ✅ | `01-tablero.html` | Tablero |
| ✅ | `02-iva-mes.html` | Conciliación de IVA |
| ✅ | `03-iva-comprobante.html` | Detalle de la diferencia |
| ✅ | `04-precios.html` | Precios y márgenes |
| ✅ | `05-orden-cambios.html` | Orden de cambios |
| ✅ | `06-turnos.html` | Turnos de la semana |
| ✅ | `07-horas.html` | Horas y francos |
| ⏳ | `08-resguardo.html` | Resguardo de Caja 1 |
| ✅ | `09-conexiones.html` | Conexiones |
| ✅ | `10-alertas.html` | Alertas del día (celular) |
| ⏳ | `11-turno-hoy.html` | Turno de hoy (celular) |
| ⏳ | `12-consulta.html` | Consulta de producto (celular) |
| ⏳ | `13-encargos.html` | Pedidos y encargos — etapa posterior |

Las catorce ya están declaradas en `SCREENS` dentro de `assets/nav.js`, así que
el menú y el índice muestran el mapa completo desde el primer día.

---

## Cómo verlo

**Doble clic.** Abrí `index.html` con doble clic. Funciona sin internet y sin
servidor: no hay build, no hay frameworks, no hay CDN.

**Con servidor local** (idéntico a GitHub Pages):

```
python3 -m http.server 8080
```

y entrá a `http://localhost:8080`.

### Qué tener en cuenta al mostrarlo

- **Todo el estado vive en memoria.** Si resolvés una diferencia o armás un lote
  de precios y después recargás la página, vuelve al estado inicial. Es a
  propósito: así se puede repetir el mismo recorrido en la reunión cuantas veces
  haga falta.
- Los datos entre pantallas viajan por la URL
  (`05-orden-cambios.html?lote=P003,P017&aj=2&res=D0901`; la falla simulada de
  Holistor viaja como `cx=holistor.falla`, las alertas descartadas como `desc`),
  así que lo que el
  cliente toca sobrevive el salto de pantalla y se puede mandar un link a una
  situación puntual. `nav.js` reescribe el link justo antes de navegar, así que
  también funciona desde el menú lateral.
- Todas las páginas llevan `<meta name="robots" content="noindex, nofollow">`.

---

## Publicarlo en GitHub Pages

1. Creá un repositorio **privado** en GitHub (por ejemplo `mana-boceto`).
   Privado: acá hay material pensado para un cliente puntual.
2. Desde la carpeta del boceto:

   ```
   git init
   git add .
   git commit -m "Boceto navegable para Maná"
   git branch -M main
   git remote add origin git@github.com:<usuario>/mana-boceto.git
   git push -u origin main
   ```

   Ojo con la regla del estudio: **nada directo a `main`** una vez que el repo
   está andando. De acá en más, rama + PR.
3. En GitHub: **Settings → Pages**. En *Source* elegí `Deploy from a branch`,
   rama `main`, carpeta `/ (root)`. Guardá.
4. Un minuto después queda en `https://<usuario>.github.io/mana-boceto/`.
5. Si el repo es privado, GitHub Pages necesita cuenta paga. Con cuenta gratuita
   hay dos salidas: repositorio público (no recomendado acá) o mostrarlo desde
   el zip, que funciona sin internet.

---

## Las pantallas y qué probar en cada una

### Portada — `index.html`

Los números reales de la operación, el problema, qué resuelve el sistema, el
recorrido sugerido, el índice de pantallas y las etapas.

### 01 · Tablero — notebook — Jorge y Administración

Todo lo que necesita una decisión hoy, en cuatro números.

- Cambiá el período y mirá cómo se recalculan los cuatro números.
- Tocá el número de diferencias de IVA: caés directo en la lista del mes.
- Fijate que el resguardo avisa cuando una copia falló.

### 02 · Conciliación de IVA — notebook — Administración

Compras, ventas y ARCA cruzadas, con las diferencias a la vista.

- Filtrá por tipo de diferencia y mirá el total del panel cambiar.
- Buscá un proveedor por nombre o por CUIT.
- Abrí una diferencia para ver qué dice cada sistema.

### 03 · Detalle de la diferencia — notebook — Administración

El mismo comprobante mirado desde Holistor, Todosoft y ARCA.

- Marcá la diferencia como resuelta.
- Volvé al período y fijate que el contador bajó. Volvé al tablero: también bajó ahí.

### 04 · Precios y márgenes — notebook — Jorge y Administración

Qué productos subieron de costo y quedaron con el precio viejo.

- Movéle al ajuste del margen objetivo: se recalculan todos los precios sugeridos
  y entran o salen productos de la lista.
- Filtrá por rubro y cambiá el orden (lo que más se pierde por mes, margen más
  caído, suba de costo).
- Sumá productos al lote: la barra de abajo te dice cuánto se recupera por mes.

### 05 · Orden de cambios — notebook — Administración

El lote listo para cargar en Todosoft.

- Sacá un producto y mirá el resumen recalcularse.
- Generá el archivo, o imprimí la lista para el mostrador.

### 06 · Turnos de la semana — notebook — Administración

Siete días, tres franjas, siete sectores: dónde queda un hueco.

- Filtrá por sector y mirá cómo cambia la grilla.
- Tocá una celda en rojo para ver quiénes están y quién falta.
- Cubrí un puesto: baja el contador de arriba y la persona queda marcada.

### 07 · Horas y francos — notebook — Administración

El acumulado del mes de las 53 personas.

- Ordená por horas nocturnas o por francos adeudados.
- Filtrá por sector y buscá a alguien por nombre.
- Si venís de cubrir un turno noche, esa persona aparece con las 8 horas sumadas.

### 09 · Conexiones — notebook — Administración

De dónde sale cada dato y qué pasa el día que una fuente falla.

- Tocá "Simular que no contesta" en Holistor: el tablero y el IVA pasan a mostrar
  las compras como **incompletas** (el sistema no inventa números).
- Subí el export de ejemplo (o arrastrá cualquier archivo): el mes se completa
  y el cruce con ARCA sigue marcando lo mismo.
- Mirá las tres formas de leer Holistor: la que está en uso se resalta sola.
- El historial de 14 noches cuenta la misma historia que el resguardo: el 13/09
  Caja 1 estaba apagada.

### 10 · Alertas del día — celular — Jorge

Lo que necesita su decisión, a las 7 de la mañana.

- Cada alerta sale de los mismos datos que la notebook: si resolvés algo allá,
  acá desaparece.
- Tocá una alerta y caés en la pantalla que la resuelve. La de turnos abre la
  grilla en el hueco justo; la de francos, ordenada por francos.
- Descartá una: baja el contador y aparece "Deshacer".
- Con Holistor en falla (desde Conexiones) aparece una alerta urgente nueva.

---

## Flujos de punta a punta

Los que se muestran en la reunión. Los cinco se recorren completos.

1. **Resolver una diferencia de IVA** ✅
   Portada → tablero → "7 diferencias" → lista del mes → abrir una → resolverla
   → volver y ver 6.
2. **Filtrar y encontrar** ✅
   Lista del mes → filtrar por tipo → buscar proveedor → abrir el detalle.
3. **Actualizar precios después de una suba** ✅
   Tablero → precios → mover el margen objetivo → sumar productos al lote →
   orden de cambios → generar el archivo.
4. **Cubrir el hueco del fin de semana a la noche** ✅
   Turnos → celda en rojo → cubrir el puesto → horas y francos: esa persona
   tiene 8 horas nocturnas más.
5. **El día que Holistor no contesta** ✅
   Conexiones → poner Holistor en falla → tablero: compras incompletas →
   "Cómo lo ve Jorge": alerta urgente en el celular → subir el export a mano →
   el mes se completa igual.

---

## Dónde tocar cada cosa

| Qué querés cambiar | Dónde |
|---|---|
| Colores, tipografías, medidas | Bloque `:root` arriba de `assets/ui.css` |
| Comportamiento en pantallas angostas | Las `@media` **al final** de `assets/ui.css` |
| Orden, nombres y resúmenes de pantallas | Arreglo `SCREENS`, arriba de `assets/nav.js` |
| Grupos del menú de la notebook | Arreglo `MENU`, arriba de `assets/nav.js` |
| Pestañas de la app del celular | Arreglo `TABS`, arriba de `assets/nav.js` |
| "Qué probar" de cada pantalla | Campo `probar` de cada fila de `SCREENS` |
| Formato de números, búsqueda, íconos, toast | Objeto `G` en `assets/nav.js` |
| Los datos | `scripts/generar_datos.py` y después `python3 scripts/generar_datos.py` |
| Encender una pantalla recién escrita | `listo: true` en su fila de `SCREENS` |

**`assets/datos.js` no se edita a mano**: lo genera el script. Cuando tengamos
la exportación real del cliente, se reemplaza el script por uno que lea ese
archivo y normalice; las pantallas no cambian.

Regla del esqueleto: cada página declara
`<body data-shell="escritorio|telefono|portada" data-pantalla="NN-archivo.html">`
y adentro sólo `<main id="pagina">`. El menú, la barra superior, la navegación
anterior/siguiente, el índice y el marco del teléfono los inyecta `nav.js`.
Las páginas **no redeclaran** nada de `nav.js`: si dos pantallas necesitan lo
mismo, va a `G`.

---

## Verificación

No se entrega sin esto en **0 fallas**:

```
npm install -D playwright
npx playwright install chromium
node tools/verificar.mjs
```

El script levanta un servidor estático local y:

0. junta **todos los links internos de todas las páginas** y falla si alguno
   apunta a un archivo que no existe;
1. abre **cada página a 320, 390, 768, 1280 y 1680 px** y falla si hay
   `pageerror`, errores de consola o elementos desbordados;
2. recorre **cada flujo con clicks reales** y verifica el resultado en la
   pantalla de destino (no que el botón exista: que el número cambie);
3. chequea que todo cargue también con `file://` (doble clic);
4. deja capturas de cada pantalla en 390 y 1280 px en `capturas/`.

Estado actual: **0 fallas**, 10 páginas, 15 flujos verificados.

---

## Supuestos a confirmar con el cliente

Ninguno de estos está inventado con mala fe: son decisiones que el boceto tuvo
que tomar para poder mostrarse. Van a la lista de preguntas de la reunión.

**Sobre el IVA**

- Que la conciliación es mensual y la hace una sola persona.
- Que hoy lleva unas 6 horas por mes entre exportar, pegar en Excel y revisar.
- Qué pasa cuando llega una factura en papel que todavía no está en ARCA.
- Si el contador quiere el archivo en algún formato puntual.

**Sobre los precios**

- Que el margen objetivo se define **por rubro** y no producto por producto.
- Que los precios se cargan a mano en Todosoft de a uno. Si Todosoft acepta un
  archivo de importación, la pantalla 05 cambia bastante (y para mejor).
- Si hay productos con precio "político" que no se tocan aunque suba el costo.

**Sobre el personal**

- Que los sectores son producción, pastelería, mostrador, cajas, reparto,
  limpieza y administración, y que la dotación por franja se parece a la del
  boceto.
- Cómo se manejan hoy los francos adeudados y las horas nocturnas.
- Si el turno noche tiene una dotación mínima por convenio.

**Sobre los sistemas**

- **Si Holistor nos deja leer de forma automática.** Es el supuesto más grande
  de todos y está marcado como tal en el tablero y en la pantalla de conexiones.
  Hay que ver el contrato y hablar con el proveedor.
- Si el robot puede tener su propio usuario en Holistor y si eso suma licencia.
- Qué versión de SQL Server corre Todosoft en Caja 1 y si el proveedor acepta un
  usuario de solo lectura.
- Si hoy existe alguna copia de Caja 1 fuera del local.

**Sobre las alertas**

- Cómo le llegan a Jorge: notificación del celular o WhatsApp.
- A qué hora (el boceto asume las 7 de la mañana) y si alguien más las recibe.

---

Encastre · Posadas, Misiones · encastre.dev@gmail.com · +54 9 3764 60-8249
