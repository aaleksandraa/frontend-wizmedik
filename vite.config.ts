import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { visualizer } from 'rollup-plugin-visualizer';
import viteCompression from 'vite-plugin-compression';

export default defineConfig(({ mode }) => ({
  server: {
    host: "localhost",
    port: 5173,
    strictPort: true,
    hmr: {
      overlay: false, // Disable error overlay that causes refresh
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
    fs: {
      strict: false,
    },
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    // Gzip compression
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
    // Brotli compression (better than gzip)
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
    // Bundle analyzer (only in build)
    mode === 'production' && visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // Ensure single React instance
    dedupe: ['react', 'react-dom'],
  },
  build: {
    // Code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
          'query-vendor': ['@tanstack/react-query'],
          'map-vendor': ['leaflet', 'react-leaflet'],
          // Feature chunks
          'admin': [
            './src/pages/AdminPanel.tsx',
            './src/components/admin/TemplateSettings.tsx',
            './src/components/admin/DoctorCardSettings.tsx',
          ],
          'doctor-dashboard': [
            './src/pages/DoctorDashboard.tsx',
          ],
          'clinic-dashboard': [
            './src/pages/ClinicDashboard.tsx',
          ],
        },
      },
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production',
      },
    },
    // Source maps only in development
    sourcemap: mode === 'development',
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
    ],
    // Force re-optimization on server start
    force: false,
  },
}));
