// ============================================================
// src/App.jsx — Composant racine avec authentification
//
// Flux de l'application :
//
//   1. Démarrage → AuthProvider vérifie s'il y a une session
//   2. Pas connecté  → afficher <PageAuth> (login/register)
//   3. Connecté      → afficher l'application principale
//   4. Chargement des données Supabase → <EcranChargement>
//   5. Données prêtes → afficher le tableau de bord
//
// L'AuthProvider (dans main.jsx) enveloppe toute l'app et
// rend la session accessible via useAuth() partout.
// ============================================================

import { useState }         from "react";
import { useAuth }          from "./lib/AuthContext";
import { deconnecter }      from "./lib/supabase";
import { useAppState }      from "./hooks/useAppState";

// Auth
import PageAuth             from "./components/auth/PageAuth";
import EcranChargement      from "./components/EcranChargement";

// UI globaux
import Header               from "./components/Header";
import Navigation           from "./components/Navigation";
import Toast                from "./components/Toast";
import ConfirmModal         from "./components/ConfirmModal";
import RemplModal           from "./components/RemplModal";

// Vues
import VueTableau           from "./components/VueTableau";
import VueKilometrage       from "./components/VueKilometrage";
import VuePieces            from "./components/VuePieces";
import VueJournal           from "./components/VueJournal";
import VueConfig            from "./components/VueConfig";

export default function App() {
  const { estConnecte, chargementAuth, profil } = useAuth();

  // ── Si l'auth est en cours de vérification ──────────────────────────────
  if (chargementAuth) {
    return <EcranChargement message="Vérification de la session…" />;
  }

  // ── Si l'utilisateur n'est pas connecté → page d'auth ──────────────────
  if (!estConnecte) {
    return <PageAuth />;
  }

  // ── Sinon → application principale ──────────────────────────────────────
  return <AppPrincipale profil={profil} />;
}

// ── Composant interne : application principale (une fois connecté) ─────────
function AppPrincipale({ profil }) {
  // Toutes les données et actions depuis Supabase
  const {
    kmActuel, pieces, rempl, journal, config,
    chargement, toast, emailStatus,
    nbUrgent, nbBientot, emailConfigured,
    enregistrerKm, remplacerPiece, ajouterPiece,
    supprimerPiece, supprimerJournal, sauvegarderConfig,
    envoyerNotifications, getStatut,
  } = useAppState();

  // ── État UI ─────────────────────────────────────────────────────────────
  const [vue,              setVue]              = useState("tableau");
  const [pieceARemplacer,  setPieceARemplacer]  = useState(null);
  const [pieceASupprimer,  setPieceASupprimer]  = useState(null);
  const [journalASupprimer,setJournalASupprimer]= useState(null);
  const [showMenu,         setShowMenu]         = useState(false);

  // ── Chargement initial des données ──────────────────────────────────────
  if (chargement) {
    return <EcranChargement message="Chargement des données…" />;
  }

  return (
    <div className="min-h-screen bg-[#080A10] max-w-[480px] mx-auto relative"
         style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>

      {/* Texture de bruit */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-40"
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")` }}
      />

      {/* ── Composants globaux ──────────────────────────────────────────── */}
      <Toast toast={toast} />

      <RemplModal
        piece={pieceARemplacer}
        kmActuel={kmActuel}
        onConfirm={params => { remplacerPiece(params); setPieceARemplacer(null); }}
        onClose={() => setPieceARemplacer(null)}
      />

      <ConfirmModal
        ouvert={!!pieceASupprimer}
        titre="Supprimer la pièce ?"
        message="L'historique de remplacement sera perdu."
        onOui={() => { supprimerPiece(pieceASupprimer); setPieceASupprimer(null); }}
        onNon={() => setPieceASupprimer(null)}
      />

      <ConfirmModal
        ouvert={!!journalASupprimer}
        titre="Supprimer l'entrée ?"
        message="Cette action est irréversible."
        onOui={() => { supprimerJournal(journalASupprimer); setJournalASupprimer(null); }}
        onNon={() => setJournalASupprimer(null)}
      />

      {/* ── Menu utilisateur (déconnexion) ─────────────────────────────── */}
      {showMenu && (
        <div
          className="fixed inset-0 z-[150]"
          onClick={() => setShowMenu(false)}
        >
          <div
            className="absolute top-16 right-4 bg-[#0F1220] border border-white/10
                       rounded-xl overflow-hidden shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Info utilisateur */}
            <div className="px-4 py-3 border-b border-white/7">
              <div className="text-[15px] font-bold text-[#E0DDD6]">
                {profil?.nom || "Membre"}
              </div>
              <div className="text-[10px] text-[#3A3A4A] mt-0.5"
                   style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                Connecté
              </div>
            </div>
            {/* Bouton déconnexion */}
            <button
              onClick={async () => { await deconnecter(); setShowMenu(false); }}
              className="w-full px-4 py-3 text-left text-[14px] font-semibold
                         text-[#FF4D4D] hover:bg-[#FF4D4D]/8 transition-colors
                         cursor-pointer"
            >
              Se déconnecter
            </button>
          </div>
        </div>
      )}

      <div className="relative z-10 pb-[90px]">

        {/* Header avec avatar cliquable */}
        <div className="sticky top-0 z-50">
          <div className="flex items-center border-b border-white/5
                          bg-[#080A10]/97 backdrop-blur-md">
            <div className="flex-1">
              <Header
                kmActuel={kmActuel}
                nbPieces={pieces.length}
                nbUrgent={nbUrgent}
                nbBientot={nbBientot}
                emailConfigured={emailConfigured}
              />
            </div>

            {/* Avatar du membre connecté */}
            <button
              onClick={() => setShowMenu(v => !v)}
              className="mr-4 w-9 h-9 rounded-full flex items-center justify-center
                         text-[14px] font-extrabold text-[#080A10] cursor-pointer
                         border-none shrink-0"
              style={{ background: profil?.couleur || "#E8A838" }}
              title={profil?.nom || "Menu"}
            >
              {(profil?.nom || "?")[0]}
            </button>
          </div>
        </div>

        {/* ── Vues ─────────────────────────────────────────────────────── */}
        {vue === "tableau" && (
          <VueTableau
            kmActuel={kmActuel}
            pieces={pieces}
            rempl={rempl}
            journal={journal}
            nbUrgent={nbUrgent}
            nbBientot={nbBientot}
            onRemplacer={setPieceARemplacer}
            calculerStatut={getStatut}
          />
        )}
        {vue === "kilom" && (
          <VueKilometrage kmActuel={kmActuel} onEnregistrer={enregistrerKm} />
        )}
        {vue === "pieces" && (
          <VuePieces
            pieces={pieces}
            rempl={rempl}
            calculerStatut={getStatut}
            onRemplacer={setPieceARemplacer}
            onAjouter={ajouterPiece}
            onSupprimer={setPieceASupprimer}
          />
        )}
        {vue === "journal" && (
          <VueJournal journal={journal} onSupprimer={setJournalASupprimer} />
        )}
        {vue === "config" && (
          <VueConfig
            config={config}
            emailStatus={emailStatus}
            onSauvegarder={sauvegarderConfig}
            onEnvoyer={envoyerNotifications}
          />
        )}
      </div>

      <Navigation
        vue={vue}
        setVue={setVue}
        nbUrgent={nbUrgent}
        emailOk={emailConfigured}
      />
    </div>
  );
}
