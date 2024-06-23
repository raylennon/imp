import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig ({
    build: {
      target: 'esnext',
        outDir: '../docs',
        // target: 'esnext',
        rollupOptions: {
            input: {
              main: resolve(__dirname, 'index.html'),
            //   views: resolve(__dirname, 'views/poop.html'),
            },
          },
    },
    base: './'
})