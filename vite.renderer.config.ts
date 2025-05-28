// vite.renderer.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  root: resolve(__dirname, 'src/renderer'),
  base: './',
  build: {
    outDir: resolve(__dirname, 'dist/renderer'),
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'src/renderer/index.html'),
    },
    sourcemap: process.env.NODE_ENV === 'development',
    minify: process.env.NODE_ENV !== 'development',
  },
  resolve: {
    alias: {
      '@shared': resolve(__dirname, 'src/shared'),
      '@renderer': resolve(__dirname, 'src/renderer'),
      '@': resolve(__dirname, 'src/renderer'),
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
  server: {
    port: 3000,
    strictPort: true,
    host: 'localhost',
    cors: true,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-big-calendar',
      '@mui/material',
      '@emotion/react',
      '@emotion/styled',
    ],
  },
  // Electronアプリでの外部リソース読み込み設定
  preview: {
    port: 3000,
    strictPort: true,
  },
});