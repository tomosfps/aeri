import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
    plugins: [react(), 
        viteCompression({
            verbose: true,
            disable: false,
            deleteOriginFile: false,
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
        },
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true,
            },
        },
    },
});
