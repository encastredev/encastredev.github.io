# Encastre Turnos · demo

Demo navegable de un sistema de turnos a medida, para mostrar en redes y a futuros clientes.
**Todo es inventado**: el negocio ("Estudio de ejemplo", peluquería y estética), las profesionales, las clientas, los teléfonos, los precios y los turnos.

Son archivos estáticos (HTML, CSS y JS sin build), con los mismos estilos que `demo-stock` (`assets/ui.css`) más `assets/turnos.css`.
Lo que se hace queda guardado mientras la pestaña esté abierta (sessionStorage); "Reiniciar la demo" vuelve al estado inicial.

## Pantallas

| Archivo | Qué muestra |
|---|---|
| `index.html` | Portada y recorrido sugerido |
| `01-agenda.html` | Agenda del día por profesional, huecos libres, confirmar / llegó / no vino |
| `02-nuevo-turno.html` | Servicio → profesional → día → horario libre (solo donde entra) → clienta; mensaje de confirmación para WhatsApp |
| `03-recordatorios.html` | Turnos de mañana sin confirmar con el recordatorio de WhatsApp ya escrito |
| `11-app-agenda.html` | App del celular: los turnos de hoy de cada profesional y "Llegó" / "No vino" |

## Datos

- `assets/datos.js`: el negocio (horario, días, paso de 30 min), profesionales, servicios con duración y precio, y clientas. **Para clonar la demo a otro rubro** (consultorio, barbería, gimnasio) alcanza con cambiar este archivo y los textos de la portada.
- Los turnos se generan solos para cada día con una semilla fija (siempre los mismos para la misma fecha), relativos a hoy: lo que ya pasó aparece atendido, hoy casi todo confirmado y mañana la mayoría sin confirmar, para que la pantalla de recordatorios tenga trabajo.
- Los teléfonos se muestran tapados (`376 •••-0101`) y los links de WhatsApp abren `wa.me` sin número: no apuntan a nadie real.
