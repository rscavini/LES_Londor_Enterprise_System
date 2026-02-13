import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    base: '/',
    plugins: [react()],

    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@modules': path.resolve(__dirname, './modules'),
        },
    },
    optimizeDeps: {
        include: ['firebase/app', 'firebase/firestore', 'firebase/auth'],
    },
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                secure: false
            }
        },
        fs: {
            allow: ['.']
        }
    },
});
