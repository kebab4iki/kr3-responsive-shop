import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const pages = ['index', 'catalog', 'products', 'category', 'product', 'order', 'application', 'contacts'];

export default defineConfig({
  base: './',
  esbuild: { jsx: 'automatic' },
  build: {
    rollupOptions: {
      input: Object.fromEntries(pages.map((page) => [
        page, fileURLToPath(new URL(`./${page}.html`, import.meta.url)),
      ])),
    },
  },
});
