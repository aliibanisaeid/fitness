import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig(({ mode }) => ({
  base: mode === 'pages' ? '/fitness/' : '/',
  plugins: [react()],
  server: { port: 5190, strictPort: true, proxy: { '/api': 'http://127.0.0.1:3190' } },
  build: { sourcemap: false, outDir: mode === 'pages' ? 'dist-pages' : 'dist' }
}));
