import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

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
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
})
