
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(({ mode }) => {
    // Load env file from the current directory
    // '' as the third argument allows loading variables without VITE_ prefix
    const env = loadEnv(mode, process.cwd(), '');
    
    // Prioritize API_KEY
    const apiKey = env.API_KEY || env.GEMINI_API_KEY || '';
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        // This explicitly shims the environment variable for the browser.
        // It replaces the text 'process.env.API_KEY' with the actual key string during build.
        'process.env.API_KEY': JSON.stringify(apiKey),
        'process.env': JSON.stringify({ API_KEY: apiKey })
      },
      resolve: {
        alias: {
          '@': resolve(__dirname, '.'),
        }
      },
      build: {
        outDir: 'dist',
        rollupOptions: {
          input: {
            main: resolve(__dirname, 'index.html'),
          },
        },
      }
    };
});
