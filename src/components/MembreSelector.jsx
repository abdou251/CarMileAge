// ============================================================
// components/MembreSelector.jsx
// Grille de 5 boutons ronds pour sélectionner un membre
// de la famille. Réutilisé dans deux endroits :
//   1. Vue "Kilométrage" (qui enregistre le km)
//   2. Modal "Remplacement" (qui note qui a remplacé la pièce)
//
// Props :
//   valeur    → string : le membre actuellement sélectionné
//   onChange  → function(membre: string) : appelée au clic
// ============================================================

import { MEMBRES, COULEURS_MEMBRES } from "../constants";

export default function MembreSelector({ valeur, onChange }) {
  return (
    <div className="grid grid-cols-5 gap-2 mb-3.5">
      {MEMBRES.map(membre => {
        const actif = valeur === membre;
        const couleur = COULEURS_MEMBRES[membre];

        return (
          <button
            key={membre}
            onClick={() => onChange(membre)}
            // Quand actif : fond = couleur du membre, texte sombre
            // Quand inactif : fond transparent, texte gris
            style={actif ? { background: couleur, borderColor: couleur } : {}}
            className={`aspect-square rounded-full border-2 flex flex-col
                        items-center justify-center gap-0.5 transition-all duration-200
                        hover:-translate-y-0.5 cursor-pointer
                        ${actif
                          ? "border-transparent"
                          : "border-white/8 bg-white/3"
                        }`}
            style={{ fontFamily: "'Barlow Condensed', sans-serif",
                     ...(actif ? { background: couleur, borderColor: couleur } : {}) }}
          >
            {/* Avatar circulaire avec initiale */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center
                         text-[13px] font-extrabold"
              style={{
                background: actif ? "rgba(0,0,0,0.2)" : `${couleur}22`,
                color:      actif ? "#080A10"          : couleur,
              }}
            >
              {membre[0]}
            </div>

            {/* Nom du membre */}
            <span
              className="text-[9px] font-bold leading-none"
              style={{ color: actif ? "#080A10" : "#555" }}
            >
              {membre}
            </span>
          </button>
        );
      })}
    </div>
  );
}
