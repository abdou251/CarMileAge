// ============================================================
// src/components/EcranChargement.jsx
// Écran affiché pendant le chargement initial (auth + données).
// Simple spinner centré sur fond sombre.
// ============================================================

export default function EcranChargement({ message = "Chargement…" }) {
  return (
    <div className="min-h-screen bg-[#080A10] flex flex-col items-center
                    justify-center gap-4">
      {/* Spinner CSS pur */}
      <div className="w-10 h-10 rounded-full border-2 border-white/10
                      border-t-[#E8A838] animate-spin" />
      <p className="text-[11px] text-[#3A3A4A] tracking-[2px] uppercase"
         style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        {message}
      </p>
    </div>
  );
}
