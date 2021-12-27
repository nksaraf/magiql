import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  build: {
    lib: {
      entry: "./src/index.ts",
      formats: ["es", "cjs", "umd"],
      fileName: "index",
      name: "Leva"
    },
    rollupOptions: {
      external: ["react", "react-dom"]
    },
    polyfillDynamicImport: false
  },
  define: {
    global: {
      ErrorUtils: null
    }
  },
  plugins: [
    // for the playground, we need to be able to use the solid-three package itself
    react()
  ]
});
