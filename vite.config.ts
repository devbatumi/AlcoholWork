import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base='/SmokingWork/' нужен для GitHub Pages (репа лежит в подпути).
// Для Vercel/Netlify/Cloudflare Pages установи env GH_PAGES=0 или просто игнорируй — root там корректный.
const ghPages = process.env.GH_PAGES !== '0';

export default defineConfig({
  plugins: [react()],
  base: ghPages ? '/SmokingWork/' : '/',
  server: { port: 5173, host: true },
});
