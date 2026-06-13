// ============================================================
// components/VueKilometrage.jsx
// Vue pour enregistrer un nouveau kilométrage.
// Un membre sélectionne son nom, entre le nouveau km,
// la date, et une note optionnelle.
//
// Props :
//   kmActuel      → number : km actuel (pour affichage et validation)
//   onEnregistrer → function({ km, date, membre, note }) : appelée à la soumission
// ============================================================

import { useState } from "react";
import { today } from "../utils";
import { MEMBRES } from "../constants";
import MembreSelector from "./MembreSelector";

export default function VueKilometrage({ kmActuel, onEnregistrer }) {
  // État local du formulaire
  const [membre, setMembre] = useState(MEMBRES[0]);
  const [km,     setKm]     = useState(kmActuel);
  const [date,   setDate]   = useState(today());
  const [note,   setNote]   = useState("");

  // Validation : le km saisi doit être strictement supérieur à l'actuel
  const kmValide = parseInt(km) > kmActuel;

  function handleSoumettre() {
    const ok = onEnregistrer({ km: parseInt(km), date, membre, note });
    // Si l'enregistrement réussit, vide la note
    if (ok) setNote("");
  }

  return (
    <div className="p-5" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>

      {/* Titre */}
      <div className="text-[21px] font-extrabold tracking-tight text-[#E0DDD6] mb-1">
        Enregistrer le kilométrage
      </div>
      <p className="text-[9px] text-[#2E2E3E] tracking-[2px] uppercase mb-4"
         style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        ACTUEL : {kmActuel.toLocaleString("fr-FR")} KM
      </p>

      {/* Formulaire */}
      <div className="bg-white/[0.04] border border-white/7 rounded-2xl p-4">

        {/* Sélection du membre */}
        <p className="text-[9px] text-[#2E2E3E] tracking-[2px] uppercase mb-3"
           style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          QUI CONDUIT ?
        </p>
        <MembreSelector valeur={membre} onChange={setMembre} />

        {/* Km + Date côte à côte */}
        <div className="flex gap-2.5 mb-3">
          <div className="flex-1 flex flex-col gap-1">
            <label className="input-label">NOUVEAU KILOMÉTRAGE</label>
            <input
              type="number"
              value={km}
              onChange={e => setKm(e.target.value)}
              min={kmActuel + 1}
              className="input-style"
            />
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <label className="input-label">DATE</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="input-style"
            />
          </div>
        </div>

        {/* Note optionnelle */}
        <div className="flex flex-col gap-1 mb-4">
          <label className="input-label">NOTE (OPTIONNEL)</label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="ex : retour de Tizi Ouzou..."
            className="input-style resize-none h-14 text-sm"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          />
        </div>

        {/* Bouton soumission — désactivé si km invalide */}
        <button
          onClick={handleSoumettre}
          disabled={!kmValide}
          className="btn-primary w-full disabled:opacity-30 disabled:cursor-not-allowed
                     disabled:transform-none disabled:shadow-none"
        >
          Enregistrer
        </button>

        {/* Message d'aide si km invalide */}
        {km && !kmValide && (
          <p className="text-[10px] text-[#FF4D4D]/70 text-center mt-2"
             style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            Le kilométrage doit être supérieur à {kmActuel.toLocaleString("fr-FR")} km
          </p>
        )}
      </div>
    </div>
  );
}
