const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

fs.mkdirSync('api', { recursive: true });
fs.rmSync('api/index.cjs', { force: true });
fs.rmSync('api/index.mjs', { force: true });
fs.rmSync('dist-esm', { recursive: true, force: true });

const tsconfig = fs.existsSync('tsconfig.build.json')
  ? 'tsconfig.build.json'
  : 'tsconfig.json';

// Tambahkan --incremental false agar tsc selalu menulis ulang hasil compile ke dist-esm
execSync(
  `pnpm exec tsc -p ${tsconfig} --module ESNext --moduleResolution bundler --outDir dist-esm --incremental false`,
  { stdio: 'inherit' }
);

const candidates = ['dist-esm/serverless.js', 'dist-esm/src/serverless.js'];
const found = candidates.find((p) => fs.existsSync(p));

if (!found) {
  throw new Error(
    `File serverless.js tidak ditemukan di dist-esm. Isi dist-esm: ${
      fs.existsSync('dist-esm') ? fs.readdirSync('dist-esm').join(', ') : '(folder tidak ada)'
    }`
  );
}

esbuild.buildSync({
  entryPoints: [path.resolve(found)],
  bundle: true,
  platform: 'node',
  format: 'esm',
  packages: 'external',
  banner: {
    js: "import { createRequire } from 'module'; import { fileURLToPath } from 'url'; import { dirname } from 'path'; const require = createRequire(import.meta.url); const __filename = fileURLToPath(import.meta.url); const __dirname = dirname(__filename);",
  },
  outfile: 'api/index.mjs',
});

console.log('Serverless ESM bundle built successfully -> api/index.mjs');