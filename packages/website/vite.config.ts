import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
    plugins: [
        react(),
        viteCompression({
            verbose: true,
            disable: false,
            threshold: 10240,
            algorithm: 'gzip',
            ext: '.gz',
        }),
        viteCompression({
            verbose: true,
            disable: false,
            threshold: 10240,
            algorithm: 'brotliCompress',
            ext: '.br',
        }),
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    build: {
        rollupOptions: {
            treeshake: true,
            output: {
                manualChunks: {
                    react: ['react', 'react-dom'],
                    router: ['react-router-dom'],
                    ui: [
                        '@radix-ui/react-dialog', 
                        '@radix-ui/react-scroll-area',
                        '@radix-ui/react-slot',
                        '@radix-ui/react-tabs'
                    ]
                }
            },
        },
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true,
                pure_funcs: ['console.log', 'console.debug', 'console.info'],
                passes: 2,
            },
        },
    },
});