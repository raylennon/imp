import { resolve } from 'path'
import { defineConfig } from 'vite'
import monacoEditorPlugin from 'vite-plugin-monaco-editor';


const wasmContentTypePlugin = {
  name: "wasm-content-type-plugin",
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url.endsWith(".wasm")) {
        res.setHeader("Content-Type", "application/wasm");
      }
      next();
    });
  },
};

export default defineConfig({
  plugins: [wasmContentTypePlugin, monacoEditorPlugin],
  resolve: {
    alias: {
      '~bootstrap': resolve(__dirname, 'node_modules/bootstrap'),
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        editor: resolve(__dirname, 'editor/index.html'),
        docs: resolve(__dirname, 'docs/index.html'),
      },
    },
  },
})