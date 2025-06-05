/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    css: true,
  },
  server: {
    port: 3030, // Intentar con un puerto completamente diferente
    strictPort: false, // Permitir que busque otro puerto si 3030 está en uso
  },
})
