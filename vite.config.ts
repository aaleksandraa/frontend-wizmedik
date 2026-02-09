import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import legacy from '@vitejs/plugin-legacy';
import path from "path";
import { componentTagger } from "lovable-tagger";
import { visualizer } from 'rollup-plugin-visualizer';
import viteCompression from 'vite-plugin-compression';
import { createHealthCheckMiddleware } from './src/dev/health-check-middleware';

export default defineConfig(({ mode }) => ({
  server: {
    host: "localhost",
    port: 5173,
    strictPort: true,
    hmr: {
      port: 5173,
      host: "localhost",
      overlay: false, // Disable error overlay that causes refresh
      clientPort: 5173, // Ensure client connects to correct port
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        ws: true, // Enable WebSocket proxying
      },
    },
    fs: {
      strict: false,
    },
    // Ensure WebSocket server binds correctly
    watch: {
      usePolling: false,
    },
    // Add health check middleware
    middlewareMode: false,
    configureServer(server) {
      server.middlewares.use(createHealthCheckMiddleware());
      
      // Handle server restart gracefully
      server.httpServer?.on('close', () => {
        console.log('[Vite] Server shutting down...');
      });

      // Log when server is ready
      server.httpServer?.once('listening', () => {
        console.log('[Vite] Server ready and listening');
      });
    },
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    // Legacy support for older browsers (including mobile)
    legacy({
      targets: ['defaults', 'not IE 11', 'iOS >= 12', 'Safari >= 12', 'Chrome >= 79'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
      renderLegacyChunks: true,
      polyfills: [
        'es.symbol',
        'es.array.iterator',
        'es.promise',
        'es.object.assign',
        'es.promise.finally',
      ],
    }),
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
    // Let legacy plugin handle browser targets
    target: 'esnext',
    
    // Modern CSS target
    cssTarget: 'chrome90',
    
    // Code splitting - LET VITE HANDLE IT AUTOMATICALLY
    rollupOptions: {
      output: {
        // Remove manualChunks to avoid circular dependencies
        // Vite will automatically split code based on dynamic imports
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
