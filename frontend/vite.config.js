import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: false,
    host: true, // Escuchar en todas las IPs
    allowedHosts: true, // Permitir cualquier host (para túneles)
  }
})
