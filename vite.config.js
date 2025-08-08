import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  root: '.',
  publicDir: 'public',
  server: {
    port: 3001,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    target: 'esnext',
    rollupOptions: {
      input: 'index.dev.html',
      output: {
        entryFileNames: 'assets/index-[hash].js',
        manualChunks: undefined,
        format: 'es'
      }
    }
  },
  esbuild: {
    target: 'esnext'
  }
})
