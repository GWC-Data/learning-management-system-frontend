import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'; // Add this import


export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      //auth backend
      "/auth": "http://localhost:5050",
      //category
      "/coursecategory": "http://localhost:5050",
      //course
      "/course": "http://localhost:5050",
      //auth role & permissions
      "/roles": "http://localhost:5050",
      "/permissions": "http://localhost:5050",
      //
      "/users": "http://localhost:5050"
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})

