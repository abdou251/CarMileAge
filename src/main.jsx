// ============================================================
// src/main.jsx — Point d'entrée avec AuthProvider
//
// AuthProvider enveloppe toute l'app pour rendre la session
// Supabase accessible partout via useAuth().
// ============================================================

import { StrictMode }   from "react";
import { createRoot }   from "react-dom/client";
import { AuthProvider } from "./lib/AuthContext";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* AuthProvider doit envelopper App pour que useAuth() fonctionne */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);
