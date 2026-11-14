# DS5 · Semana 8 · WebSockets a escala (PixPro)

Presentación interactiva (reveal.js + React) que parte de la caída de Microsoft 365 del 12–13 de noviembre de 2026
y sigue con WebSockets: vida de una conexión, API y librerías, escalar a varios servidores, AsyncAPI, monitoreo y seguridad (OWASP).

- `#/presentacion` · las 13 columnas de la clase (→ temas, ↓ profundizar). `?t=t4` abre un tema.
- `#/actividades` · 4 actividades en el celular con autocorrección (sin servidor; se guardan en el navegador).
- `#/simuladores` · efecto dominó, tormenta de reconexión y enrutamiento entre servidores.
- `public/diagramas/` · diagramas de Archify (fuentes en `archify/`).

## Desarrollo

```bash
npm install
npm run dev
```

## Publicar en GitHub Pages

1. En GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Cada push a `main` ejecuta `.github/workflows/deploy.yml` y publica el sitio.
