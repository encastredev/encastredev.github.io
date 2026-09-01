# encastredev.github.io

Sitio institucional de **Encastre** — estudio de software en Posadas, Misiones, Argentina.
Desarrollo a medida e integración de sistemas.

🌐 https://encastredev.github.io

## Qué es

Landing estática de una sola página, sin dependencias ni build. Todo el CSS y el JS
están embebidos en `index.html`; lo único externo son las tipografías de Google Fonts.

- Bilingüe ES / EN, con selector en la barra superior
- Tema claro y oscuro, respeta la preferencia del sistema y recuerda la elección
- Responsive, sin scroll horizontal
- Sin cookies, sin analítica, sin dependencias de terceros

## Estructura

```
.
├── index.html   # el sitio completo
├── .nojekyll    # evita que GitHub Pages procese el repo con Jekyll
└── README.md
```

## Desarrollo local

No hace falta build. Abrir `index.html` en el navegador, o levantar un servidor:

```bash
python3 -m http.server 8000
# http://localhost:8000
```

## Deploy

Automático por GitHub Pages: cada push a `main` publica el sitio.
Configuración en **Settings → Pages → Source: Deploy from a branch → main / (root)**.

## Dominio propio

Cuando el dominio esté registrado, crear un archivo `CNAME` en la raíz con el host
(por ejemplo `encastre.dev`), y apuntar el DNS a GitHub Pages:

| Tipo  | Nombre | Valor                 |
|-------|--------|-----------------------|
| A     | @      | 185.199.108.153       |
| A     | @      | 185.199.109.153       |
| A     | @      | 185.199.110.153       |
| A     | @      | 185.199.111.153       |
| CNAME | www    | encastredev.github.io |

Después activar **Enforce HTTPS** en Settings → Pages.

## Pendientes

- [ ] Reemplazar los proyectos de muestra por trabajos reales, con capturas
- [ ] Conectar el formulario de contacto a un endpoint (Formspree, Resend o propio)
- [ ] Agregar favicon y imagen Open Graph
- [ ] Registrar el dominio propio y configurar el `CNAME`

## Contacto

encastre.dev@gmail.com
