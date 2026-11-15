# DS5 · Semana 8 · WebSockets a escala (PixPro)

Presentación interactiva (reveal.js + React) que parte de la caída de Microsoft 365 del 12–13 de noviembre de 2026
y sigue con WebSockets: vida de una conexión, API y librerías, escalar a varios servidores, AsyncAPI, monitoreo y seguridad (OWASP).

- `#/profesor` · **modo profesor**: inicias sesión, se abre una sala con un solo QR/PIN y envías cada pregunta a los celulares desde la presentación.
- `#/sala` · el celular del estudiante en la clase en vivo (apodo + PIN, una sola vez).
- `#/presentacion` · las 13 columnas de la clase (→ temas, ↓ profundizar). `?t=t4` abre un tema.
- `#/actividades` · las mismas 4 actividades para practicar por cuenta propia, con autocorrección (sin servidor).
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

## Clase en vivo con Firebase

Usa el **mismo proyecto de Firebase** de las semanas 4–6 (Auth del profesor + Firestore, mismas reglas `firestore.rules`).
Las salas se marcan con `week: 8` y las claves del navegador empiezan con `sd5w8-`.

1. **Settings → Secrets and variables → Actions → Variables** del repositorio `sd5_week_8`: las 5 variables de `sd5_week_6`
   (`VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID`, `VITE_HOST_EMAIL`).
2. Vuelve a ejecutar **Actions → Publicar** (o haz un push).

En clase: `#/profesor` → contraseña → **Crear sala y empezar** → proyecta el QR → en cada diapositiva de pregunta,
**Enviar a los celulares** → **Revelar respuesta**. Al final, **Ranking** y **Finalizar sesión**.
Sin esas variables el sitio funciona en **modo demo local** (la sala solo funciona entre pestañas del mismo navegador).
