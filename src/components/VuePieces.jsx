// ============================================================
// components/VuePieces.jsx
// Vue de gestion des pièces.
// Permet de :
//   - Voir toutes les pièces avec leur état
//   - Filtrer par statut (Toutes / Urgentes / Bientôt / OK)
//   - Ajouter une nouvelle pièce personnalisée
//   - Remplacer une pièce (ouvre la modale)
//   - Supprimer une pièce
//
// Props :
//   pieces          → array de pièces
//   rempl           → objet des remplacements
//   calculerStatut  → function(piece) → statut
//   onRemplacer     → function(piece) : ouvre modale remplacement
//   onAjouter       → function({ nom, icone, intervalleKm, intervalleMois })
//   onSupprimer     → function(pieceId)
// ============================================================

import { useState } from "react";
import { ICONES_DISPONIBLES } from "../constants";
import PieceCard from "./PieceCard";

// Options de filtre
const FILTRES = [
  { k: "tous",    l: "Toutes"     },
  { k: "urgent",  l: "⚠ Urgentes" },
  { k: "bientot", l: "↑ Bientôt"  },
  { k: "ok",      l: "✓ OK"       },
];

export default function VuePieces({
  pieces, rempl, calculerStatut,
  onRemplacer, onAjouter, onSupprimer,
}) {
  const [filtre,    setFiltre]    = useState("tous");
  const [showForm,  setShowForm]  = useState(false);

  // État du formulaire d'ajout de pièce
  const [nom,    setNom]    = useState("");
  const [icone,  setIcone]  = useState("🔧");
  const [intKm,  setIntKm]  = useState(10000);
  const [intMois,setIntMois] = useState(12);

  // Filtrage des pièces selon le filtre actif
  const piecesFiltrees = pieces.filter(p => {
    const s = calculerStatut(p).statut;
    if (filtre === "urgent")  return s === "urgent";
    if (filtre === "bientot") return s === "bientot";
    if (filtre === "ok")      return s === "ok" || s === "inconnu";
    return true;
  });

  function handleAjouter() {
    if (!nom.trim()) return;
    onAjouter({ nom, icone, intervalleKm: intKm, intervalleMois: intMois });
    // Réinitialise le formulaire
    setNom(""); setIcone("🔧"); setIntKm(10000); setIntMois(12);
    setShowForm(false);
  }

  return (
    <div className="p-5" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>

      {/* En-tête + bouton Ajouter */}
      <div className="flex items-center justify-between mb-3.5">
        <div>
          <div className="text-[21px] font-extrabold tracking-tight text-[#E0DDD6]">
            Pièces & entretien
          </div>
          <p className="text-[9px] text-[#2E2E3E] tracking-[2px] uppercase mt-0.5"
             style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {pieces.length} PIÈCES SUIVIES
          </p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="px-3 py-1.5 rounded-[9px] text-[14px] font-bold
                     tracking-wider cursor-pointer transition-colors"
          style={{
            background:   showForm ? "rgba(232,168,56,.11)" : "rgba(255,255,255,.05)",
            border:       `1px solid ${showForm ? "rgba(232,168,56,.26)" : "rgba(255,255,255,.09)"}`,
            color:        showForm ? "#E8A838" : "#666",
          }}
        >
          {showForm ? "✕ Annuler" : "+ Ajouter"}
        </button>
      </div>

      {/* ── Formulaire d'ajout ─────────────────────────────────────── */}
      {showForm && (
        <div className="bg-white/[0.04] border border-white/7 rounded-2xl p-4 mb-3.5">

          <p className="input-label mb-2">ICÔNE</p>
          {/* Grille de sélection d'icônes */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {ICONES_DISPONIBLES.map(ic => (
              <button
                key={ic}
                onClick={() => setIcone(ic)}
                className="text-[18px] p-1.5 rounded-[7px] cursor-pointer transition-all"
                style={{
                  border:     `1px solid ${icone === ic ? "rgba(232,168,56,.42)" : "rgba(255,255,255,.07)"}`,
                  background: icone === ic ? "rgba(232,168,56,.09)" : "rgba(255,255,255,.03)",
                }}
              >
                {ic}
              </button>
            ))}
          </div>

          {/* Nom */}
          <div className="flex flex-col gap-1 mb-3">
            <label className="input-label">NOM DE LA PIÈCE</label>
            <input
              type="text"
              placeholder="ex : Filtre à huile"
              value={nom}
              onChange={e => setNom(e.target.value)}
              className="input-style"
            />
          </div>

          {/* Intervalles */}
          <div className="flex gap-2.5 mb-4">
            <div className="flex-1 flex flex-col gap-1">
              <label className="input-label">INTERVALLE (KM)</label>
              <input
                type="number"
                value={intKm}
                onChange={e => setIntKm(e.target.value)}
                placeholder="0 = ignorer"
                className="input-style"
              />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <label className="input-label">INTERVALLE (MOIS)</label>
              <input
                type="number"
                value={intMois}
                onChange={e => setIntMois(e.target.value)}
                placeholder="0 = ignorer"
                className="input-style"
              />
            </div>
          </div>

          <button
            onClick={handleAjouter}
            disabled={!nom.trim()}
            className="btn-primary w-full disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Ajouter la pièce
          </button>
        </div>
      )}

      {/* ── Filtres ────────────────────────────────────────────────── */}
      <div className="flex gap-1.5 mb-3.5 flex-wrap">
        {FILTRES.map(({ k, l }) => (
          <button
            key={k}
            onClick={() => setFiltre(k)}
            className={`px-3 py-1.5 rounded-full text-[13px] font-semibold
                        cursor-pointer transition-colors
                        ${filtre === k
                          ? "bg-white/8 text-[#E0DDD6] border border-white/15"
                          : "bg-white/[0.03] text-[#444] border border-white/7"
                        }`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* ── Liste des pièces filtrées ──────────────────────────────── */}
      {piecesFiltrees.length === 0 ? (
        <div className="text-center py-9 text-[#222]">
          <div className="text-[32px] mb-2">✅</div>
          <p className="text-[14px] leading-relaxed">
            Aucune pièce dans cette catégorie.
          </p>
        </div>
      ) : (
        piecesFiltrees.map(p => (
          <PieceCard
            key={p.id}
            piece={p}
            statut={calculerStatut(p)}
            dernierRemp={rempl[p.id]}
            onRemplacer={() => onRemplacer(p)}
            onSupprimer={() => onSupprimer(p.id)}
          />
        ))
      )}
    </div>
  );
}
