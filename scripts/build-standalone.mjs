import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';

const root = new URL('../', import.meta.url);
const result = await build({
  configFile: false,
  root: fileURLToPath(root),
  base: './',
  esbuild: { jsx: 'automatic' },
  build: {
    write: false,
    copyPublicDir: false,
    rollupOptions: { output: { inlineDynamicImports: true } },
  },
});
const files = (Array.isArray(result) ? result : [result]).flatMap(({ output }) => output);
const index = files.find(({ fileName }) => fileName === 'index.html');
const script = files.find(({ type, isEntry }) => type === 'chunk' && isEntry);
const stylesheet = files.find(({ fileName }) => fileName.endsWith('.css'));
if (!index || !script || !stylesheet || script.imports.length || script.dynamicImports.length) {
  throw new Error('Expected one self-contained JavaScript bundle, stylesheet and HTML entry.');
}

const mime = {
  jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp', mp4: 'video/mp4',
};
const assets = {};
for (const directory of ['images', 'media']) {
  const source = new URL(`public/${directory}/`, root);
  for (const filename of await readdir(source)) {
    if (/\.responsive-\d+\.webp$/.test(filename)) continue;
    const type = mime[filename.split('.').pop()];
    if (!type) continue;
    const data = await readFile(new URL(filename, source));
    assets[`${directory}/${filename}`] = `data:${type};base64,${data.toString('base64')}`;
  }
}

const sourceHtml = String(index.source);
const scriptTag = [...sourceHtml.matchAll(/<script\b[^>]*\bsrc="[^"]+"[^>]*><\/script>/g)]
  .find(([tag]) => tag.includes(script.fileName))?.[0];
const cssTag = [...sourceHtml.matchAll(/<link\b[^>]*>/g)]
  .find(([tag]) => tag.includes(stylesheet.fileName))?.[0];
if (!scriptTag || !cssTag) throw new Error('Could not locate the built script or stylesheet tags.');

const code = script.code.replace(/<\/script/gi, (value) => value.replace('</', '<\\/'));
const html = sourceHtml
  .replace('<html lang="ru">', '<html lang="ru" data-corekit-standalone>')
  .replace(/href="[^"]*images\/corekit-mark\.png"/, () => `href="${assets['images/corekit-mark.png']}"`)
  .replace(cssTag, () => `<style>\n${stylesheet.source}\n</style>`)
  .replace(scriptTag, () => `<script>globalThis.corekitAssets = ${JSON.stringify(assets)};</script>\n<script type="module">\n${code}\n</script>`);

const output = new URL('standalone/', root);
await mkdir(output, { recursive: true });
await writeFile(new URL('Corekit.html', output), html);
console.log('Готовый файл для открытия в браузере: standalone/Corekit.html');
