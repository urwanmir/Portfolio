
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(({ mode }) => {
    // Load env file based on `mode`. Third param '' loads all envs regardless of prefix.
    const env = loadEnv(mode, process.cwd(), '');
    
    // Prioritize API_KEY then GEMINI_API_KEY, default to empty string
    const apiKey = env.API_KEY || env.GEMINI_API_KEY || '';
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        // We explicitly define process.env.API_KEY as a string literal.
        // This ensures that 'process.env.API_KEY' in the code is replaced by the value.
        'process.env.API_KEY': JSON.stringify(apiKey),
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
