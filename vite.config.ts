import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // @ts-ignore - explicitly requested by user for custom dev setups
    historyApiFallback: true
  }
})
