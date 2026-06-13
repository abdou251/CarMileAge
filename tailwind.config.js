// ============================================================
// tailwind.config.js
// Configuration de Tailwind CSS v3.
//
// content : Tailwind analyse ces fichiers pour savoir quelles
//   classes sont utilisées, et supprime les autres en production
//   (tree-shaking CSS). Si vous ajoutez des fichiers .jsx dans
//   un nouveau dossier, pensez à l'ajouter ici.
//
// theme.extend : permet d'ajouter des valeurs personnalisées
//   sans remplacer les valeurs par défaut de Tailwind.
//   Exemples ajoutés :
//     - couleurs de l'app (bg-app, text-dim...)
//     - keyframes pour les animations CSS
// ============================================================

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],

  theme: {
    extend: {
      // ── Couleurs de l'application ─────────────────────────────────
      // Utilisables avec bg-app, text-dim, etc.
      colors: {
        app:     "#080A10",   // fond principal
        surface: "#0F1220",   // fond des modales/cards
        dim:     "#2E2E3E",   // texte secondaire très discret
        muted:   "#3A3A4A",   // texte secondaire
        light:   "#E0DDD6",   // texte principal
        // Couleurs de statut
        urgent:  "#FF4D4D",
        warn:    "#FFB347",
        ok:      "#4DFF9B",
        info:    "#64B4FF",
      },

      // ── Polices personnalisées ────────────────────────────────────
      fontFamily: {
        condensed: ["'Barlow Condensed'", "sans-serif"],
        mono:      ["'JetBrains Mono'",   "monospace"],
      },

      // ── Animations ───────────────────────────────────────────────
      // Définies ici pour pouvoir utiliser animate-slideDown, etc.
      // Les keyframes correspondants sont dans index.css.
      keyframes: {
        slideDown: {
          "0%":   { top: "-10px", opacity: "0" },
          "100%": { top:  "20px", opacity: "1" },
        },
        slideUp: {
          "0%":   { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        fadeIn: {
          "0%":   { opacity: "0", transform: "scale(0.94)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        slideDown: "slideDown 0.3s ease",
        slideUp:   "slideUp 0.25s ease",
        fadeIn:    "fadeIn 0.2s ease",
      },

      // ── Largeur max pour le layout mobile ────────────────────────
      maxWidth: {
        mobile: "480px",
      },
    },
  },

  plugins: [],
};
