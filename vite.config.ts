import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', 
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  define: {
    // This empty object prevents "process is not defined" crashes in the browser
    // when code tries to access process.env
    'process.env': {} 
  }
});