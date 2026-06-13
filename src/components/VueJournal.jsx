// ============================================================
// components/VueJournal.jsx
// Vue historique : liste toutes les actions enregistrées
// (mises à jour km + remplacements de pièces).
// Chaque entrée peut être supprimée.
//
// Props :
//   journal           → array d'entrées triées du plus récent au plus ancien
//   onSupprimer       → function(id) : supprime une entrée du journal
// ============================================================

import { fmtDate } from "../utils";
import { COULEURS_MEMBRES } from "../constants";

export default function VueJournal({ journal, onSupprimer }) {
  return (
    <div className="p-5" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>

      {/* Titre */}
      <div className="text-[21px] font-extrabold tracking-tight text-[#E0DDD6] mb-1">
        Journal d'activité
      </div>
      <p className="text-[9px] text-[#2E2E3E] tracking-[2px] uppercase mb-4"
         style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        {journal.length} ENTRÉE{journal.length !== 1 ? "S" : ""}
      </p>

      {/* Liste vide */}
      {journal.length === 0 ? (
        <div className="text-center py-9 text-[#222]">
          <div className="text-[32px] mb-2">📋</div>
          <p className="text-[14px] leading-relaxed">
            Aucune activité enregistrée.
          </p>
        </div>
      ) : (
        // Liste des entrées
        journal.map(e => (
          <EntreeJournal
            key={e.id}
            entree={e}
            onSupprimer={() => onSupprimer(e.id)}
          />
        ))
      )}
    </div>
  );
}

// ── Composant pour une entrée du journal ────────────────────────────────────
function EntreeJournal({ entree: e, onSupprimer }) {
  const estKm = e.type === "km";

  return (
    <div className="flex items-start gap-2.5 py-3 border-b border-white/[0.05]">

      {/* Icône de type d'action */}
      <div
        className="w-[33px] h-[33px] rounded-[9px] flex items-center
                   justify-center text-[15px] shrink-0"
        style={{
          background: estKm
            ? "rgba(255,255,255,0.04)"
            : "rgba(77,255,155,0.07)",
        }}
      >
        {estKm ? "📍" : (e.icone || "🔧")}
      </div>

      {/* Contenu */}
      <div className="flex-1">
        {/* Titre de l'action */}
        <div className="text-[15px] font-bold tracking-tight text-[#E0DDD6]">
          {estKm ? "Kilométrage" : e.pieceNom}
        </div>

        {/* Métadonnées */}
        <div className="text-[9px] text-[#2E2E3E] mt-1 leading-relaxed"
             style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          {fmtDate(e.date)} ·{" "}
          {/* Nom du membre en couleur */}
          <span style={{ color: COULEURS_MEMBRES[e.membre] || "#888" }}>
            {e.membre}
          </span>
          {/* Affiche le delta km pour les entrées de type kilométrage */}
          {estKm && e.ancien != null
            ? ` · +${(e.km - e.ancien).toLocaleString("fr-FR")} km`
            : ""}
          {/* Tag pour les remplacements */}
          {!estKm ? " · Remplacement" : ""}
        </div>

        {/* Note si présente */}
        {e.note && (
          <div className="text-[12px] text-[#3A3A4A] mt-0.5 italic">
            {e.note}
          </div>
        )}
      </div>

      {/* Kilométrage + bouton supprimer */}
      <div className="flex items-center gap-1.5">
        <div className="text-right">
          <div className="text-[13px] text-[#E0DDD6]"
               style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {e.km.toLocaleString("fr-FR")}
          </div>
          <div className="text-[9px] text-[#2E2E3E]"
               style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            KM
          </div>
        </div>
        {/* Bouton suppression */}
        <button
          onClick={onSupprimer}
          className="text-[#FF4D4D]/28 text-[13px] px-1 py-1
                     hover:text-[#FF4D4D] transition-colors cursor-pointer
                     bg-transparent border-none"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
