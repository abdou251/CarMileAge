// ============================================================
// vite.config.js
// Configuration de Vite (le bundler / serveur de dev).
//
// @vitejs/plugin-react active :
//   - Le Fast Refresh (mise à jour instantanée sans rechargement)
//   - La transformation JSX automatique (pas besoin d'importer React)
// ============================================================

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
});
