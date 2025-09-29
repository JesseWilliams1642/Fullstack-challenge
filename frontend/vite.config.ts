import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  server: { 
    host : '0.0.0.0',
    strictPort: true,
    port: Number(process.env.FRONTEND_PORT),
    cors: true
  },
  plugins: [
    tailwindcss(),
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
})
