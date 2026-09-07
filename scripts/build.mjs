import { mkdir, readFile, writeFile } from 'node:fs/promises';

const token = process.env.MAPBOX_PUBLIC_TOKEN?.trim();
if (!token || !/^pk\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token)) {
  throw new Error('Set MAPBOX_PUBLIC_TOKEN to an existing public Mapbox browser token (pk.).');
}

await mkdir('dist', { recursive: true });
await writeFile('dist/index.html', await readFile('index.html'));
await writeFile('dist/map-config.js', `window.REUNION_MAPBOX_TOKEN = ${JSON.stringify(token)};\n`);
console.log('Static guest guide built.');
