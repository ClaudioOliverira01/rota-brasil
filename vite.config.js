import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    // Só arquivos .jsx/.tsx passam pelo React.
    react({ include: /\.(jsx|tsx)$/ })
  ],

  server: {
    port: 5173
  },

  build: {
    rollupOptions: {
      output: {
        // Separa o React do código do jogo: o navegador guarda em cache
        // e só baixa de novo o que mudou.
        manualChunks: {
          react: ["react", "react-dom"]
        }
      }
    }
  }
});