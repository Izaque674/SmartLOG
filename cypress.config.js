import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173/", // Altere para a URL do seu frontend
    setupNodeEvents(on, config) {
      // implement node event listeners here, se necessário
    },
  },
});

