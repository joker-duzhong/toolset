import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  css: {
    postcss: {
      plugins: [
        {
          postcssPlugin: 'remove-cascade-layers',
          OnceExit(root) {
            const layers: import('postcss').AtRule[] = []
            root.walkAtRules('layer', (rule) => { layers.push(rule) })
            for (const rule of layers) {
              if (rule.nodes) {
                rule.replaceWith(rule.nodes)
              } else {
                rule.remove()
              }
            }
          },
        },
      ],
    },
  },
  server: {},
})
