import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/', // Use root path for Netlify
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  define: {
    // Prevents "process is not defined" crash in browser
    'process.env': {} 
  }
});