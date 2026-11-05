import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Port 3000 on purpose: the backend's CORS list only allows http://localhost:3000.
export default defineConfig({
  plugins: [react()],
  server: { port: 3000, strictPort: true },
});
