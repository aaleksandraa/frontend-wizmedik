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
    // Target modern browsers for better mobile support
    target: ['es2020', 'chrome90', 'safari14', 'firefox88', 'edge90'],
    
    // Modern CSS target
    cssTarget: 'chrome90',
    
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
    
    // Minification with modern support
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production',
        ecma: 2020, // Target ES2020 for better mobile support
      },
      format: {
        ecma: 2020, // Output ES2020 compatible code
      },
    },
    
    // Source maps only in development
    sourcemap: mode === 'development',
    
    // Ensure compatibility with older browsers
    modulePreload: {
      polyfill: true,
    },
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
