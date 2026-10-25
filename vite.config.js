import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' makes the build work under any GitHub Pages repo path
export default defineConfig({
  plugins: [react()],
  base: './',
})
