import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
/// <reference types="vitest" />

const host = process.env.TAURI_DEV_HOST;
const isProduction = process.env.NODE_ENV === 'production';

// Dynamic port configuration - can be overridden by environment variables
const devPort = parseInt(process.env.VITE_PORT || process.env.PORT || "1420");
const hmrPort = devPort + 1;

// https://vite.dev/config/
export default defineConfig(() => ({
  plugins: [
    react()
  ],

  // Build optimizations
  build: {
    target: 'esnext',
    minify: 'esbuild' as const,
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor code for better caching
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['framer-motion', 'styled-components'],
          'state-vendor': ['zustand']
        },
        // Optimize chunk file names for better caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      },
      // Tree-shaking optimizations
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false
      }
    },
    // Reduce chunk size warnings threshold
    chunkSizeWarningLimit: 500,
    // Disable source maps in production for smaller bundle size
    sourcemap: process.env.NODE_ENV === 'development',
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Optimize asset inlining threshold (4kb)
    assetsInlineLimit: 4096,
    // Report compressed size
    reportCompressedSize: true,
    // Optimize dependencies
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    }
  },
  
  // Esbuild options for production - drop console and debugger statements
  esbuild: isProduction ? {
    drop: ['console' as const, 'debugger' as const],
    legalComments: 'none' as const,
    treeShaking: true,
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true
  } : undefined,
  
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'zustand', 'framer-motion'],
    exclude: ['@tauri-apps/api', '@tauri-apps/plugin-opener']
  },

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent Vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, but we can make it dynamic
  server: {
    port: devPort,
    strictPort: false, // Allow fallback to next available port
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: hmrPort,
        }
      : undefined,
    watch: {
      // 3. tell Vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
  
  // Test configuration
  test: {
    globals: true,
    environment: 'jsdom',
    // Conditional setup files - skip for electron tests
    setupFiles: process.env.VITEST_POOL_ID?.includes('electron') ? [] : './src/test/setup.ts',
    // Allow per-file environment configuration
    environmentMatchGlobs: [
      ['electron/**/*.test.js', 'node'],
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/vite-env.d.ts',
        'src/types/',
        'dist/',
        'src-tauri/',
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70
        }
      }
    },
  },
}));
