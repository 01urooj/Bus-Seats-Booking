# Publish Wayfare

The production build is a single self-contained file: **`dist/index.html`**
(all CSS, JS and images are inlined). Any static host can serve it.

## 1. Netlify Drop (fastest, no CLI)

1. Run `npm install` then `npm run build` on your machine.
2. Open <https://app.netlify.com/drop>.
3. Drag the whole **`dist`** folder into the drop zone.
4. Netlify returns a public URL such as `https://wayfare-abc123.netlify.app`.
5. Optional: Site settings → "Change site name" for a nicer subdomain.

No build settings are required because the folder already contains `index.html`.

## 2. Vercel (CLI)

```bash
npm i -g vercel
npm run build
vercel deploy dist --prod
```

Or import the repository at <https://vercel.com/new> and use:

- Framework preset: **Vite**
- Build command: `npm run build`
- Output directory: `dist`

## 3. Cloudflare Pages

1. Push the project to GitHub.
2. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git**.
3. Build command: `npm run build` · Build output directory: `dist`.

## 4. GitHub Pages

```bash
npm run build
npx gh-pages -d dist
```

Then enable Pages for the branch in **Settings → Pages**.

## Preview the production build locally

```bash
npm run build
npm run preview
# http://localhost:4173
```

## Notes

- Bookings are stored in the browser (`localStorage`) — there is no backend.
- Payment is a simulated demo; no card data is transmitted or stored.
- The build works on any static host; no server or environment variables needed.
