import { copyFile, mkdir, readdir, rename, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = process.cwd();
const buildDirectory = resolve(root, 'dist');
const clientDirectory = resolve(buildDirectory, 'client');
const serverDirectory = resolve(root, 'dist', 'server');
const metadataDirectory = resolve(root, 'dist', '.openai');

await mkdir(clientDirectory, { recursive: true });
await mkdir(serverDirectory, { recursive: true });
await mkdir(metadataDirectory, { recursive: true });

// Sites binds static assets from dist/client. Plain Vite emits them directly
// into dist, so move that output into the directory expected by the runtime.
for (const entry of await readdir(buildDirectory, { withFileTypes: true })) {
  if (['client', 'server', '.openai'].includes(entry.name)) continue;
  await rename(
    resolve(buildDirectory, entry.name),
    resolve(clientDirectory, entry.name),
  );
}

await writeFile(
  resolve(serverDirectory, 'index.js'),
  `export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    if (response.status !== 404) return response;

    const fallback = new Request(new URL('/index.html', request.url), request);
    return env.ASSETS.fetch(fallback);
  },
};
`,
  'utf8',
);

await copyFile(
  resolve(root, '.openai', 'hosting.json'),
  resolve(metadataDirectory, 'hosting.json'),
);
