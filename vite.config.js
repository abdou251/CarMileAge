// ============================================================
// vite.config.js
// Configuration de Vite (le bundler / serveur de dev).
//
// @vitejs/plugin-react active :
//   - Le Fast Refresh (mise à jour instantanée sans rechargement)
//   - La transformation JSX automatique (pas besoin d'importer React)
//
// @cloudflare/vite-plugin utilise wrangler.jsonc pour builder et
// prévisualiser le site exactement comme sur Cloudflare Workers.
// ============================================================

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [react(), cloudflare()],
});
