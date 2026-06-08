# mundel — Marketing site

A standalone, dependency-free landing page (plain HTML/CSS/JS) that introduces mundel:
the product, the story behind it, how it works, and the tech stack. Fully separate from
the Next.js app — nothing to build, just static files.

```
marketing/
  index.html      # the page
  styles.css      # academic-navy brand styling
  assets/         # brand SVGs (logo, mark, favicon)
```

## Preview locally

```bash
# from repo root
open marketing/index.html
# or serve it
npx serve marketing      # then open http://localhost:3000
python3 -m http.server 8080 -d marketing
```

## Deploy

Any static host works — there is no build step.

- **GitHub Pages:** push and point Pages at `/marketing` (or copy its contents to a `gh-pages` branch / `docs/` folder).
- **Cloud Run / Netlify / Vercel / Cloudflare Pages:** set the publish directory to `marketing`.
- **Firebase Hosting:** `firebase deploy` with `"public": "marketing"`.

## Editing

- Copy lives directly in `index.html` (Japanese-first, mirrors the README).
- Colors and spacing are CSS variables at the top of `styles.css` (`--navy`, `--amber`, …).
- The live-app and GitHub links appear in the nav, hero, course card, and final CTA —
  update them there if the URLs change.

**Current links**
- App: `https://mundel-frontend-490996932437.europe-west1.run.app`
- Repo: `https://github.com/ryuseiinomoto/mundel-frontend`

## Image credits (hero space scene)

| File | Source | License |
|------|--------|---------|
| `assets/earth-texture.jpg` | NASA — Blue Marble (Land/Ocean/Ice), equirectangular | Public domain |
| `assets/moon.jpg` | NASA — LRO near-side mosaic | Public domain |
| `assets/starfield.jpg` | ESO/S. Brunier — The Milky Way panorama (resized) | CC BY 4.0 — attribution required |

The Milky Way background (ESO) is **CC BY 4.0**: keep the credit “ESO/S. Brunier” if you publish.
NASA imagery is public domain (courtesy credit appreciated but not required).

