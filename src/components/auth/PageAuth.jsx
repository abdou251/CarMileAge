// ============================================================
// src/components/auth/PageAuth.jsx
// Page de connexion / inscription.
//
// Deux modes :
//   - "connexion"  : email + mot de passe + code famille
//   - "inscription": email + mot de passe + nom + couleur + code famille
//
// Le "code famille" est un identifiant court (ex: "BENALI2024")
// que tous les membres de la même famille utilisent pour
// partager les mêmes données. C'est simple et sans serveur.
//
// Props : aucune (la navigation se fait via onAuthChange)
// ============================================================

import { useState } from "react";
import { inscrire, connecter } from "../../lib/supabase";

// Couleurs disponibles pour les membres
const COULEURS = [
  "#E8A838", "#E86B8A", "#5BC4BF",
  "#7B8CDE", "#A8E86B", "#E87B5C",
  "#64B4FF", "#C87BE8",
];

export default function PageAuth() {
  const [mode,       setMode]       = useState("connexion"); // connexion | inscription
  const [email,      setEmail]      = useState("");
  const [mdp,        setMdp]        = useState("");
  const [nom,        setNom]        = useState("");
  const [couleur,    setCouleur]    = useState(COULEURS[0]);
  const [familleId,  setFamilleId]  = useState("");
  const [erreur,     setErreur]     = useState("");
  const [chargement, setChargement] = useState(false);

  async function handleSoumettre() {
    setErreur("");
    if (!email || !mdp || !familleId) {
      setErreur("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    if (mode === "inscription" && !nom.trim()) {
      setErreur("Veuillez saisir votre prénom.");
      return;
    }
    if (mdp.length < 6) {
      setErreur("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    setChargement(true);
    try {
      if (mode === "inscription") {
        await inscrire({ email, motDePasse: mdp, nom, couleur, familleId });
      } else {
        await connecter({ email, motDePasse: mdp, familleId });
      }
      // La redirection est gérée automatiquement par AuthContext
      // qui détecte le changement de session
    } catch (err) {
      // Traduit les erreurs Supabase en français
      const msg = err.message || "";
      if (msg.includes("Invalid login credentials"))
        setErreur("Email ou mot de passe incorrect.");
      else if (msg.includes("User already registered"))
        setErreur("Cet email est déjà utilisé. Essayez de vous connecter.");
      else if (msg.includes("Email not confirmed"))
        setErreur("Vérifiez votre boîte mail pour confirmer votre compte.");
      else
        setErreur(msg || "Une erreur est survenue.");
    } finally {
      setChargement(false);
    }
  }

  // Soumission avec la touche Entrée
  function handleKeyDown(e) {
    if (e.key === "Enter") handleSoumettre();
  }

  return (
    <div className="min-h-screen bg-[#080A10] flex items-center justify-center px-5"
         style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>

      <div className="w-full max-w-[400px]">

        {/* Logo / Titre */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🚗</div>
          <h1 className="text-[28px] font-extrabold tracking-[3px] uppercase text-[#E0DDD6]">
            FamVoiture
          </h1>
          <p className="text-[11px] text-[#3A3A4A] mt-1 tracking-wider"
             style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            SUIVI D'ENTRETIEN FAMILIAL
          </p>
        </div>

        {/* Onglets Connexion / Inscription */}
        <div className="flex bg-white/[0.04] rounded-xl p-1 mb-6
                        border border-white/7">
          {[
            { k: "connexion",  l: "Connexion"   },
            { k: "inscription",l: "Inscription" },
          ].map(({ k, l }) => (
            <button
              key={k}
              onClick={() => { setMode(k); setErreur(""); }}
              className={`flex-1 py-2 rounded-[9px] text-[15px] font-bold
                          tracking-wider transition-all cursor-pointer border-none
                          ${mode === k
                            ? "bg-white/8 text-[#E0DDD6]"
                            : "text-[#444] hover:text-[#666]"
                          }`}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Formulaire */}
        <div className="bg-white/[0.04] border border-white/7 rounded-2xl p-5"
             onKeyDown={handleKeyDown}>

          {/* Prénom (inscription seulement) */}
          {mode === "inscription" && (
            <div className="flex flex-col gap-1 mb-4">
              <label className="input-label">VOTRE PRÉNOM</label>
              <input
                type="text"
                placeholder="ex : Karim"
                value={nom}
                onChange={e => setNom(e.target.value)}
                className="input-style"
              />
            </div>
          )}

          {/* Couleur (inscription seulement) */}
          {mode === "inscription" && (
            <div className="flex flex-col gap-2 mb-4">
              <label className="input-label">VOTRE COULEUR</label>
              <div className="flex gap-2 flex-wrap">
                {COULEURS.map(c => (
                  <button
                    key={c}
                    onClick={() => setCouleur(c)}
                    className="w-8 h-8 rounded-full cursor-pointer transition-all
                               border-2 border-transparent"
                    style={{
                      background:   c,
                      borderColor:  couleur === c ? "#E0DDD6" : "transparent",
                      transform:    couleur === c ? "scale(1.2)" : "scale(1)",
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Email */}
          <div className="flex flex-col gap-1 mb-4">
            <label className="input-label">EMAIL</label>
            <input
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input-style"
              autoComplete="email"
            />
          </div>

          {/* Mot de passe */}
          <div className="flex flex-col gap-1 mb-4">
            <label className="input-label">MOT DE PASSE</label>
            <input
              type="password"
              placeholder="minimum 6 caractères"
              value={mdp}
              onChange={e => setMdp(e.target.value)}
              className="input-style"
              autoComplete={mode === "inscription" ? "new-password" : "current-password"}
            />
          </div>

          {/* Code famille */}
          <div className="flex flex-col gap-1 mb-2">
            <label className="input-label">CODE FAMILLE</label>
            <input
              type="text"
              placeholder="ex : BENALI2024"
              value={familleId}
              onChange={e => setFamilleId(e.target.value.toUpperCase().replace(/\s/g, ""))}
              className="input-style uppercase tracking-widest"
              autoComplete="off"
            />
          </div>

          {/* Explication du code famille */}
          <p className="text-[10px] text-[#3A3A4A] mb-4 leading-relaxed"
             style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {mode === "inscription"
              ? "Choisissez un code unique pour votre famille (ex: NOM+ANNÉE). Tous les membres utiliseront ce même code."
              : "Utilisez le même code que les autres membres de votre famille."
            }
          </p>

          {/* Message d'erreur */}
          {erreur && (
            <div className="bg-[#FF4D4D]/10 border border-[#FF4D4D]/20 rounded-xl
                            px-4 py-3 mb-4 text-[13px] text-[#FF4D4D] leading-relaxed">
              {erreur}
            </div>
          )}

          {/* Bouton soumettre */}
          <button
            onClick={handleSoumettre}
            disabled={chargement}
            className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {chargement
              ? "Chargement…"
              : mode === "connexion" ? "Se connecter" : "Créer mon compte"
            }
          </button>
        </div>

        {/* Note de sécurité */}
        <p className="text-center text-[9px] text-[#2E2E3E] mt-4 leading-relaxed"
           style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          Données sécurisées par Supabase · Auth JWT
        </p>
      </div>
    </div>
  );
}
