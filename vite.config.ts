import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'; // Add this import


export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {

      "/auth": "http://localhost:5050",

      "/coursecategory": "http://localhost:5050",

      "/course": "http://localhost:5050",

      "/roles": "http://localhost:5050",

      "/permissions": "http://localhost:5050",

      "/users": "http://localhost:5050"
      
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})

