// ============================================================
// components/PieceCard.jsx
// Carte affichant une pièce et son état d'usure.
// Utilisée dans les vues "Tableau" (aperçu urgences)
// et "Pièces" (liste complète).
//
// Props :
//   piece          → objet { id, nom, icone, intervalleKm, intervalleMois }
//   statut         → objet retourné par calculerStatut()
//   dernierRemp    → objet { date, km, membre, note } ou undefined
//   onRemplacer    → function() : ouvre la modale de remplacement
//   onSupprimer    → function() : demande confirmation de suppression
//   afficherSuppr  → boolean : afficher ou non le bouton supprimer
// ============================================================

import { fmtDate, couleurStatut } from "../utils";

export default function PieceCard({
  piece, statut, dernierRemp,
  onRemplacer, onSupprimer, afficherSuppr = true,
}) {
  const col = couleurStatut(statut.statut);
  const estUrgent  = statut.statut === "urgent";
  const estBientot = statut.statut === "bientot";

  // Labels traduits pour les badges
  const labelStatut = {
    urgent:  "URGENT",
    bientot: "BIENTÔT",
    ok:      "OK",
    inconnu: "INCONNU",
  }[statut.statut] || "—";

  return (
    <div
      className={`rounded-[13px] p-3.5 mb-2.5 transition-colors
                  ${estUrgent  ? "bg-[#FF4D4D]/4  border border-[#FF4D4D]/30"
                  : estBientot ? "bg-white/[0.04] border border-[#FFB347]/25"
                  :              "bg-white/[0.04] border border-white/7"
                  }`}
    >
      {/* Ligne 1 : icône + nom + badge statut */}
      <div className="flex items-center gap-2.5 mb-2.5">
        <span className="text-[20px] w-8 text-center shrink-0">{piece.icone}</span>
        <div className="flex-1">
          <div className="text-[16px] font-bold tracking-tight text-[#E0DDD6]"
               style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
            {piece.nom}
          </div>
          {/* Intervalles configurés */}
          <div className="text-[8px] text-[#2E2E3E] mt-0.5"
               style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {piece.intervalleKm   > 0 ? `/${piece.intervalleKm.toLocaleString("fr-FR")} km`   : ""}
            {piece.intervalleKm   > 0 && piece.intervalleMois > 0 ? " · " : ""}
            {piece.intervalleMois > 0 ? `/${piece.intervalleMois} mois` : ""}
          </div>
        </div>
        {/* Badge coloré */}
        <span
          className="px-2 py-0.5 rounded-full text-[8px] tracking-wider shrink-0"
          style={{
            background: `${col}18`,
            color:       col,
            border:      `1px solid ${col}32`,
            fontFamily:  "'JetBrains Mono', monospace",
          }}
        >
          {labelStatut}
        </span>
      </div>

      {/* Barres de progression (uniquement si la pièce a été remplacée au moins une fois) */}
      {statut.statut !== "inconnu" && (
        <div className="flex flex-col gap-1.5 mb-2.5">

          {/* Barre kilométrique */}
          {piece.intervalleKm > 0 && (
            <BarreProgression
              label="KM"
              prog={statut.progKm}
              texte={
                statut.kmRestant > 0
                  ? `${statut.kmRestant.toLocaleString("fr-FR")} rest.`
                  : "DÉPASSÉ"
              }
            />
          )}

          {/* Barre temporelle */}
          {piece.intervalleMois > 0 && (
            <BarreProgression
              label="MOIS"
              prog={statut.progTemps}
              texte={
                statut.moisRestant > 0
                  ? `${statut.moisRestant} mois rest.`
                  : "DÉPASSÉ"
              }
            />
          )}
        </div>
      )}

      {/* Ligne du bas : dernier remplacement + boutons */}
      <div className="flex items-center justify-between gap-2">

        {/* Info dernier remplacement */}
        <div className="text-[9px] leading-[1.7] flex-1"
             style={{ fontFamily: "'JetBrains Mono', monospace", color: "#2E2E3E" }}>
          {dernierRemp ? (
            <>
              Remplacé le {fmtDate(dernierRemp.date)}<br />
              à {dernierRemp.km.toLocaleString("fr-FR")} km · {dernierRemp.membre}
              {dernierRemp.note && (
                <><br /><em className="text-[#3A3A4A]">{dernierRemp.note}</em></>
              )}
            </>
          ) : (
            <span className="text-[#1E1E2E]">Jamais remplacé</span>
          )}
        </div>

        {/* Boutons */}
        <div className="flex gap-1.5 shrink-0">
          {/* Bouton remplacer */}
          <button
            onClick={onRemplacer}
            className={`px-3 py-1.5 rounded-[7px] text-[13px] font-bold
                        tracking-wide cursor-pointer transition-colors
                        ${estUrgent
                          ? "bg-[#FF4D4D]/8 border border-[#FF4D4D]/22 text-[#FF4D4D] hover:bg-[#FF4D4D]/14"
                          : "bg-[#4DFF9B]/7 border border-[#4DFF9B]/16 text-[#4DFF9B] hover:bg-[#4DFF9B]/13"
                        }`}
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            {dernierRemp ? "Remplacer" : "Saisir"}
          </button>

          {/* Bouton supprimer */}
          {afficherSuppr && (
            <button
              onClick={onSupprimer}
              className="px-2 py-1.5 rounded-[7px] text-[12px] cursor-pointer
                         border border-[#FF4D4D]/10 text-[#FF4D4D]/35
                         hover:text-[#FF4D4D] hover:border-[#FF4D4D]/28
                         transition-colors bg-transparent"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Sous-composant : une barre de progression ──────────────────────────────
// Pas exporté car uniquement utilisé dans PieceCard
function BarreProgression({ label, prog, texte }) {
  // Couleur de la barre selon la progression
  const couleur = prog >= 1 ? "#FF4D4D" : prog >= 0.8 ? "#FFB347" : "#4DFF9B";

  return (
    <div className="flex items-center gap-2">
      {/* Label (KM ou MOIS) */}
      <span className="text-[8px] text-[#2E2E3E] w-5 text-right"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        {label}
      </span>

      {/* Piste grise + remplissage coloré */}
      <div className="flex-1 h-[5px] bg-white/6 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width:      `${Math.min(prog * 100, 100)}%`,
            background: couleur,
          }}
        />
      </div>

      {/* Texte à droite (km/mois restants ou DÉPASSÉ) */}
      <span className="text-[8px] text-[#3A3A4A] w-[70px] text-right"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        {texte}
      </span>
    </div>
  );
}
