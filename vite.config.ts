import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import viteCompression from 'vite-plugin-compression'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Brotli compression (better compression ratio)
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024, // Only compress files > 1KB
    }),
    // Gzip compression (better browser support)
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Modern build target - reduces polyfills
    target: 'es2015',
    // Enable minification with Terser for smaller bundles
    minify: 'terser',
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks - let Vite handle MUI/Emotion bundling automatically
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'react-admin': ['react-admin', 'ra-data-simple-rest'],
          // Removed MUI chunk - letting Vite bundle @mui and @emotion together correctly
        },
      },
    },
    // Increase chunk size warning limit (we're optimizing for cache)
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    port: 4173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
