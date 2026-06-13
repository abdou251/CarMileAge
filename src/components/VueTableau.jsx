// ============================================================
// components/VueTableau.jsx
// Vue principale "Tableau de bord".
// Affiche :
//   - Le kilométrage actuel en grand
//   - 3 stats rapides (urgents, bientôt, nb pièces)
//   - Les pièces qui nécessitent une attention (urgent + bientôt)
//   - Les 5 dernières activités du journal
//
// Props :
//   kmActuel     → number
//   pieces       → array de pièces
//   rempl        → objet { pieceId: { date, km, membre, note } }
//   journal      → array d'entrées du journal
//   nbUrgent     → number
//   nbBientot    → number
//   onRemplacer  → function(piece) : ouvre la modale de remplacement
//   calculerStatut → function(piece) : retourne le statut
// ============================================================

import { fmtDate } from "../utils";
import { COULEURS_MEMBRES } from "../constants";
import PieceCard from "./PieceCard";

export default function VueTableau({
  kmActuel, pieces, rempl, journal,
  nbUrgent, nbBientot, onRemplacer, calculerStatut,
}) {
  // Filtre les pièces qui nécessitent une attention
  const piecesAlerte = pieces.filter(p => {
    const s = calculerStatut(p).statut;
    return s === "urgent" || s === "bientot";
  });

  return (
    <div>
      {/* ── Kilométrage héros ────────────────────────────────────────── */}
      <div className="text-center px-5 py-7">
        <div className="text-[44px] font-medium leading-none text-[#E0DDD6]"
             style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: "-1px" }}>
          {kmActuel.toLocaleString("fr-FR")}
        </div>
        <div className="text-[14px] text-[#3A3A4A] mt-1 tracking-[2px]"
             style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
          KILOMÈTRES
        </div>
      </div>

      {/* ── 3 Stats rapides ─────────────────────────────────────────── */}
      <div className="px-5 pb-5">
        <SectionTitre>RÉSUMÉ</SectionTitre>
        <div className="grid grid-cols-3 gap-2.5">
          <StatCard valeur={nbUrgent}       label="Urgents"  couleur="#FF4D4D" />
          <StatCard valeur={nbBientot}      label="Bientôt"  couleur="#FFB347" />
          <StatCard valeur={pieces.length}  label="Pièces"   couleur="#E0DDD6" />
        </div>
      </div>

      {/* ── Pièces nécessitant une attention ─────────────────────────── */}
      {piecesAlerte.length > 0 && (
        <div className="px-5 pb-5">
          <SectionTitre>ATTENTION REQUISE</SectionTitre>
          {piecesAlerte.map(p => (
            <PieceCard
              key={p.id}
              piece={p}
              statut={calculerStatut(p)}
              dernierRemp={rempl[p.id]}
              onRemplacer={() => onRemplacer(p)}
              afficherSuppr={false}  // Pas de suppression depuis le tableau
            />
          ))}
        </div>
      )}

      {/* ── Dernières activités ──────────────────────────────────────── */}
      <div className="px-5 pb-5">
        <SectionTitre>DERNIÈRES ACTIVITÉS</SectionTitre>

        {journal.length === 0 ? (
          <div className="text-center py-9 text-[#222]"
               style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
            <div className="text-[32px] mb-2">📋</div>
            <p className="text-[14px] leading-relaxed">
              Aucune activité.<br />
              Commencez par enregistrer le kilométrage.
            </p>
          </div>
        ) : (
          journal.slice(0, 5).map(e => (
            <EntreeJournal key={e.id} entree={e} />
          ))
        )}
      </div>
    </div>
  );
}

// ── Sous-composants internes ──────────────────────────────────────────────

// Titre de section stylisé
function SectionTitre({ children }) {
  return (
    <p className="text-[9px] text-[#2E2E3E] tracking-[2px] uppercase mb-3"
       style={{ fontFamily: "'JetBrains Mono', monospace" }}>
      {children}
    </p>
  );
}

// Carte de statistique rapide
function StatCard({ valeur, label, couleur }) {
  return (
    <div className="bg-white/[0.04] border border-white/7 rounded-xl p-3 text-center">
      <div className="text-[19px] font-medium"
           style={{ fontFamily: "'JetBrains Mono', monospace", color: couleur }}>
        {valeur}
      </div>
      <div className="text-[12px] text-[#3A3A4A] mt-1"
           style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
        {label}
      </div>
    </div>
  );
}

// Ligne d'entrée dans le journal (aperçu)
function EntreeJournal({ entree: e }) {
  const estKm = e.type === "km";
  return (
    <div className="flex items-start gap-2.5 py-3 border-b border-white/[0.05]">
      {/* Icône */}
      <div className={`w-8 h-8 rounded-[9px] flex items-center justify-center
                       text-[15px] shrink-0
                       ${estKm ? "bg-white/[0.04]" : "bg-[#4DFF9B]/7"}`}>
        {estKm ? "📍" : (e.icone || "🔧")}
      </div>

      {/* Infos */}
      <div className="flex-1">
        <div className="text-[15px] font-bold text-[#E0DDD6]"
             style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
          {estKm ? "Kilométrage mis à jour" : e.pieceNom}
        </div>
        <div className="text-[9px] text-[#2E2E3E] mt-1 leading-relaxed"
             style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          {fmtDate(e.date)} ·{" "}
          <span style={{ color: COULEURS_MEMBRES[e.membre] || "#888" }}>
            {e.membre}
          </span>
          {estKm && e.ancien != null
            ? ` · +${(e.km - e.ancien).toLocaleString("fr-FR")} km`
            : ""}
          {!estKm ? " · Remplacement" : ""}
        </div>
        {e.note && (
          <div className="text-[12px] text-[#3A3A4A] mt-0.5 italic">
            {e.note}
          </div>
        )}
      </div>

      {/* Km */}
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
    </div>
  );
}
