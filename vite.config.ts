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

      "/batch": "http://localhost:5050",

      "/module": "http://localhost:5050",

      "/batchClassSchedule": "http://localhost:5050",

      "/users": "http://localhost:5050",

      "/userForAdmin": "http://localhost:5050",

      "/userForTrainee": "http://localhost:5050",
      
      "/batchTrainee": "http://localhost:5050", 

      "/coursemodule": "http://localhost:5050",

      "/courseAssignmentRecords":"http://localhost:5050",

      "/assignment-completion":"http://localhost:5050", 

      "/batchClassSchedulebybatch": "http://localhost:5050",

      "/batchbyName": "http://localhost:5050",

      "/class": "http://localhost:5050",

      "/classbyModule": "http://localhost:5050",

      "/jobs-all": "http://localhost:5050",
       
      "/attendance": "http://localhost:5050",
 
      "/attendance-file": "http://localhost:5050",

      "/submissions": "https://api.judge0.com"
      
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})

