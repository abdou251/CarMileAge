// ============================================================
// src/utils.js — Fonctions utilitaires pures
// ============================================================

// localStorage helpers (encore utilisés pour famille_id et notif_sent)
export function load(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}
export function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

// Date helpers
export function today() { return new Date().toISOString().split("T")[0]; }

export function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR", { day:"2-digit", month:"short", year:"numeric" });
}

export function moisEntre(d1, d2) {
  const a = new Date(d1), b = new Date(d2);
  return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
}

// Calcule le statut d'une pièce
// piece.id dans Supabase est un UUID, rempl[piece.id] = { date, km, ... }
export function calculerStatut(piece, rempl, kmActuel) {
  // Support both UUID (Supabase) and string id (legacy)
  const r = rempl[piece.id];
  if (!r) return { statut:"inconnu", progKm:0, progTemps:0, kmRestant:null, moisRestant:null, kmDepuis:0, moisDepuis:0 };

  const kmDepuis    = kmActuel - r.km;
  const moisDepuis  = moisEntre(r.date, today());
  const progKm      = piece.intervalle_km   > 0 || piece.intervalleKm   > 0
    ? Math.min(kmDepuis   / (piece.intervalle_km   || piece.intervalleKm),   1) : 0;
  const progTemps   = piece.intervalle_mois > 0 || piece.intervalleMois > 0
    ? Math.min(moisDepuis / (piece.intervalle_mois || piece.intervalleMois), 1) : 0;
  const progMax     = Math.max(progKm, progTemps);
  const kmRestant   = (piece.intervalle_km   || piece.intervalleKm   || 0) > 0
    ? (piece.intervalle_km || piece.intervalleKm) - kmDepuis : null;
  const moisRestant = (piece.intervalle_mois || piece.intervalleMois || 0) > 0
    ? (piece.intervalle_mois || piece.intervalleMois) - moisDepuis : null;

  let statut = "ok";
  if (progMax >= 1) statut = "urgent";
  else if (progMax >= 0.8) statut = "bientot";

  return { statut, progKm, progTemps, kmRestant, moisRestant, kmDepuis, moisDepuis };
}

export function couleurStatut(statut) {
  return statut === "urgent" ? "#FF4D4D" : statut === "bientot" ? "#FFB347" : statut === "ok" ? "#4DFF9B" : "#555";
}

// EmailJS loader
export function loadEmailJS() {
  return new Promise((res, rej) => {
    if (window.emailjs) { res(window.emailjs); return; }
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
    s.onload = () => res(window.emailjs); s.onerror = rej;
    document.head.appendChild(s);
  });
}
