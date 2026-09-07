# Santa Cruz 2026 family reunion guest guide

The original June 5–7, 2026 Alarcon Ruano family guest website, preserved as a standalone static site. It lives outside the planner application's build.

## Hosting

- GitHub: `ShortyLTD/santacruzreunion-2026`
- Vercel team: `da-boyz`
- Vercel project: `reunion-2026-guest-site`
- Production domain: `https://2026.santacruzreunion.com/`
- Framework preset: Other
- Build command: `node scripts/build.mjs`
- Output directory: `dist`

Pushes to `main` deploy through the Vercel Git integration. DNS and HTTPS are managed by Vercel.

## Source and behavior

`index.html` is the recovered published guest guide. Its styling, illustrations, map, lodging suggestions, schedule, and copy are preserved. The original deployment contained only this file, with no redirect configuration or server functions. `vercel.json` retains clean URLs. The build generates a small map configuration file from Vercel environment configuration.

Section links include `#map-section`, `#field-guide-section`, `#lodging-section`, and `#schedule-section`. RSVP selections are stored only in the visitor's browser. There are no hosted forms or shared RSVP records.

Set `MAPBOX_PUBLIC_TOKEN` in Vercel for Production, Preview, and Development to the existing public Mapbox browser token. The build accepts only a `pk.` token and rejects secret `sk.` tokens. The public value is included in the deployed browser configuration, but is kept out of version control. If that token has URL restrictions, its owner must allow `https://2026.santacruzreunion.com`. The source also retains its existing web fonts.

## Local preview

```sh
node scripts/build.mjs
python3 -m http.server 8026 --directory dist
```

Export `MAPBOX_PUBLIC_TOKEN` in your local environment before building, then open `http://localhost:8026/`. There are no package dependencies to install.
