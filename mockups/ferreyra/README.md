# Boceto navegable — Distribuidora Ferreyra

Demo estática de 11 pantallas del sistema de cuentas corrientes y cobranzas.
Sin dependencias, sin build, sin conexión a internet: HTML, CSS y JS plano.

## Cómo publicarlo

En el repo `encastredev/encastredev.github.io`:

1. Copiá esta carpeta completa en `mockups/ferreyra/`.
2. `git add . && git commit -m "Boceto Distribuidora Ferreyra" && git push`
3. Queda online en `https://encastredev.github.io/mockups/ferreyra/`

No hace falta configurar nada más: GitHub Pages sirve los archivos tal como están.
Para probarlo antes, alcanza con abrir `index.html` con doble clic.

## Estructura

```
index.html                   portada y índice de pantallas
01-panel-general.html        ┐
02-clientes.html             │
03-cuenta-corriente.html     │ administración (escritorio)
04-registrar-cobranza.html   │
05-nota-credito.html         │
06-comisiones.html           ┘
07-app-mis-clientes.html     ┐
08-app-ficha-cliente.html    │ app del vendedor (celular)
09-app-cobranza.html         │
10-app-nota-credito.html     ┘
11-portal-cliente.html         portal del cliente (celular)
assets/ui.css                  sistema visual compartido
assets/nav.js                  navegación, menús y utilidades
assets/fonts/                  tipografía Barlow local
```

## Qué se puede probar en la demo

- **02 Clientes:** buscador y filtros en vivo (con deuda, +60 días, por vendedor).
- **04 Registrar cobranza:** cambiar el monto y el medio de pago recalcula el saldo;
  al guardar salta a la cuenta corriente con el movimiento agregado.
- **05 Nota de crédito:** cantidades ajustables, motivo que cambia el efecto sobre el
  stock, y el nuevo saldo calculado en vivo.
- **06 Comisiones:** desplegar el detalle de cada vendedor y cerrar la semana.
- **07 App:** el cartel de señal es un interruptor — activalo para ver la cola de
  cobranzas sincronizarse.
- **09 y 10:** cargar una cobranza o pedir una nota de crédito de punta a punta.

Navegación: barra superior con anterior/siguiente e índice. En escritorio también
funcionan las flechas del teclado.

## Notas

- Los datos son de ejemplo. El nombre del comercio es real; el titular y el teléfono
  son ficticios.
- El estado no se guarda: al recargar una pantalla vuelve a su punto inicial.
- Todas las pantallas son responsive: las de administración adaptan el menú lateral a
  una barra superior y ocultan las columnas secundarias de las tablas en celular. Se
  probaron de 320px hasta 1680px de ancho.
- Todas las páginas llevan `noindex` para que no aparezcan en buscadores.

## Para editarlo

Los colores, tipografías y componentes están en `assets/ui.css` (variables CSS al
inicio del archivo). El menú lateral, la barra inferior de la app y el orden de las
pantallas se configuran en los arreglos `SCREENS`, `MENU` y `TABS` al inicio de
`assets/nav.js`.

---
Encastre · Posadas, Misiones · encastre.dev@gmail.com
