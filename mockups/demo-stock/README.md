# Encastre Stock · demo

Demo navegable de un sistema de stock a medida, para mostrar en redes y a futuros clientes.
**Todo es inventado**: productos, marcas, códigos, referencias, máquinas, proveedores y movimientos.

Son archivos estáticos (HTML, CSS y JS sin build). Nada se guarda: al recargar vuelve al estado inicial.

## Pantallas

| Archivo | Qué muestra |
|---|---|
| `index.html` | Portada y recorrido sugerido |
| `02-inventario.html` | Buscar por código, referencia cruzada (`K418220`) o máquina (`EX-210`); exportar a Excel |
| `03-ficha-producto.html` | Stock, precios, historial, fotos y etiqueta |
| `04-movimiento.html` | Venta, ingreso, ajuste o reubicación con el resultado en vivo |
| `12-app-conteo.html` | Conteo con el celular en la ubicación A1 (4 productos) |

## Recorrido del reel

1. `04-movimiento.html` abre con **FX-20418** (3 unidades, mínimo 2) y una venta de 2: aparece el aviso de stock bajo.
2. Confirmar → **Ver la ficha actualizada**: stock 1, "Bajo mínimo" y la venta en el historial.

## Datos

`assets/datos.js` se genera con `python scripts/generar_datos.py` (semilla fija: siempre salen los mismos productos).
Colores y tipografías: variables al principio de `assets/ui.css`. Pantallas y menú: `SCREENS` y `MENU` en `assets/nav.js`.
