import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'; // Add this import


export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {

      "/auth": "http://localhost:8080",

      "/coursecategory": "http://localhost:8080",

      "/course": "http://localhost:8080",

      "/roles": "http://localhost:8080",

      "/permissions": "http://localhost:8080",

      "/batch": "http://localhost:8080",

      "/module": "http://localhost:8080",

      "/batchModuleSchedule": "http://localhost:8080",

      "/users": "http://localhost:8080",

      "/userForAdmin": "http://localhost:8080",

      "/userForTrainee": "http://localhost:8080",
      
      "/batchTrainee": "http://localhost:8080", 

      "/coursemodule": "http://localhost:8080",

      "/courseAssignmentRecords":"http://localhost:8080",

      "/assignment-completion":"http://localhost:8080",

      "/batchModuleSchedulebyBatch": "http://localhost:8080",

      "/job": "http://localhost:8080",

      "/companyinfo": "http://localhost:8080",

      "/batchbyName": "http://localhost:8080",

      "/class": "http://localhost:8080",

      "/classbyModule": "http://localhost:8080",

      "/jobs-all": "http://localhost:8080",
       
      "/attendance": "http://localhost:8080",
 
      "/attendance-file": "http://localhost:8080"
      
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})

