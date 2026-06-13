// ============================================================
// src/lib/AuthContext.jsx
// Contexte React pour l'authentification.
//
// Pourquoi un contexte ?
//   La session utilisateur doit être accessible partout dans
//   l'app (App.jsx, composants, hooks...). Le Context API de
//   React permet de partager cette valeur sans "prop drilling"
//   (passer la prop à travers chaque composant intermédiaire).
//
// Utilisation dans un composant :
//   import { useAuth } from "../lib/AuthContext";
//   const { session, profil } = useAuth();
// ============================================================

import { createContext, useContext, useEffect, useState } from "react";
import { supabase, onAuthChange, chargerProfil } from "./supabase";

// Création du contexte avec valeur par défaut null
const AuthContext = createContext(null);

// Provider : enveloppe toute l'application dans App.jsx
export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined); // undefined = chargement initial
  const [profil,  setProfil]  = useState(null);

  useEffect(() => {
    // Charge la session existante au démarrage (depuis le cookie/localStorage)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) chargerProfil().then(setProfil).catch(() => {});
    });

    // Écoute les changements (connexion, déconnexion, refresh token)
    const { data: { subscription } } = onAuthChange(newSession => {
      setSession(newSession);
      if (newSession) {
        chargerProfil().then(setProfil).catch(() => {});
      } else {
        setProfil(null);
      }
    });

    // Nettoyage à la destruction du composant
    return () => subscription.unsubscribe();
  }, []);

  const valeur = {
    session,                                   // Session Supabase (ou null)
    profil,                                    // Profil { nom, couleur } (ou null)
    estConnecte: !!session,                    // Boolean pratique
    chargementAuth: session === undefined,     // true pendant le chargement initial
  };

  return (
    <AuthContext.Provider value={valeur}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook pour consommer le contexte facilement
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans <AuthProvider>");
  return ctx;
}
