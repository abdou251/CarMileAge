// ============================================================
// components/RemplModal.jsx
// Modal (tiroir du bas) pour enregistrer le remplacement
// d'une pièce. S'ouvre quand on clique "Remplacer" sur une pièce.
//
// Props :
//   piece      → objet pièce { id, nom, icone, ... } ou null
//   kmActuel   → number : pré-remplit le champ kilométrage
//   onConfirm  → function({ piece, km, date, membre, note })
//   onClose    → function() : ferme la modale
// ============================================================

import { useState, useEffect } from "react";
import { today } from "../utils";
import MembreSelector from "./MembreSelector";
import { MEMBRES } from "../constants";

export default function RemplModal({ piece, kmActuel, onConfirm, onClose }) {
  // État local du formulaire (réinitialisé à chaque ouverture)
  const [rDate,   setRDate]   = useState(today());
  const [rKm,     setRKm]     = useState(kmActuel);
  const [rMembre, setRMembre] = useState(MEMBRES[0]);
  const [rNote,   setRNote]   = useState("");

  // Quand la modale s'ouvre (piece change), réinitialise le km
  useEffect(() => {
    if (piece) setRKm(kmActuel);
  }, [piece, kmActuel]);

  // Ne rien afficher si pas de pièce sélectionnée
  if (!piece) return null;

  function handleConfirm() {
    onConfirm({
      piece,
      km:     parseInt(rKm),
      date:   rDate,
      membre: rMembre,
      note:   rNote,
    });
    setRNote("");
  }

  return (
    // Overlay sombre — clic dessus ferme la modale
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center bg-black/80"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      {/* Tiroir */}
      <div className="bg-[#0F1220] rounded-t-[22px] w-full max-w-[480px]
                      border-t border-white/9 px-5 pt-6 pb-8
                      animate-[slideUp_0.25s_ease]"
           style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>

        {/* Titre avec icône */}
        <div className="flex items-center gap-2 text-[19px] font-extrabold
                        text-[#E0DDD6] tracking-wide mb-4">
          <span>{piece.icone}</span>
          <span>Remplacer — {piece.nom}</span>
        </div>

        {/* Sélection du membre */}
        <p className="text-[9px] text-[#2E2E3E] tracking-[2px] uppercase mb-3"
           style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          QUI A EFFECTUÉ LE REMPLACEMENT ?
        </p>
        <MembreSelector valeur={rMembre} onChange={setRMembre} />

        {/* Date + Kilométrage côte à côte */}
        <div className="flex gap-2.5 mb-3">
          <div className="flex-1 flex flex-col gap-1">
            <label className="text-[9px] text-[#2E2E3E] tracking-widest uppercase"
                   style={{ fontFamily: "'JetBrains Mono', monospace" }}>Date</label>
            <input
              type="date" value={rDate}
              onChange={e => setRDate(e.target.value)}
              className="input-style"
            />
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <label className="text-[9px] text-[#2E2E3E] tracking-widest uppercase"
                   style={{ fontFamily: "'JetBrains Mono', monospace" }}>Kilométrage</label>
            <input
              type="number" value={rKm}
              onChange={e => setRKm(e.target.value)}
              className="input-style"
            />
          </div>
        </div>

        {/* Note optionnelle */}
        <div className="flex flex-col gap-1 mb-4">
          <label className="text-[9px] text-[#2E2E3E] tracking-widest uppercase"
                 style={{ fontFamily: "'JetBrains Mono', monospace" }}>Note (optionnel)</label>
          <textarea
            value={rNote} onChange={e => setRNote(e.target.value)}
            placeholder="ex : garage Slim, 4 500 DA..."
            className="input-style resize-none h-14 text-sm"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          />
        </div>

        {/* Bouton confirmer */}
        <button onClick={handleConfirm} className="btn-primary w-full">
          ✓ Confirmer le remplacement
        </button>

        {/* Bouton annuler */}
        <button onClick={onClose} className="btn-secondary w-full mt-2">
          Annuler
        </button>
      </div>
    </div>
  );
}
