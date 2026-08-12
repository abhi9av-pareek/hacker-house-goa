# HH Goa 2026 Frame / Builder ID Generator

A mobile-first React + Vite prototype for the Hacker House Goa 2026 shortlisting task.

## Included
- FRAME mode: HH Goa profile-picture frame
- BUILDER ID mode: name + stack/role + generated builder class
- SQUAD mode: up to 3 teammates in one combined frame
- JPG/PNG/HEIC upload (HEIC conversion via `heic2any`)
- Client-side canvas rendering
- PNG download
- Native share on supported mobile browsers, otherwise opens X compose with `#FrameInGoa`
- No login, no backend, no image upload to a server

## Run

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

The renderer is intentionally local-first so image generation stays fast and images remain on-device.
