import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    // Só arquivos .jsx/.tsx passam pelo React.
    // As cenas do Phaser (.js) continuam exatamente como estão.
    react({ include: /\.(jsx|tsx)$/ })
  ],

  server: {
    port: 5173
  },

  build: {
    // O Phaser sozinho passa de 1 MB; sem isso o aviso aparece em todo build.
    chunkSizeWarningLimit: 1500,

    rollupOptions: {
      output: {
        // Separa as bibliotecas do código do jogo: o navegador guarda em cache
        // e só baixa de novo o que mudou.
        manualChunks: {
          phaser: ["phaser"],
          react: ["react", "react-dom"]
        }
      }
    }
  }
});