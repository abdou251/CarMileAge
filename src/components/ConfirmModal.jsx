// ============================================================
// components/ConfirmModal.jsx
// Boîte de dialogue de confirmation générique.
// Utilisée pour confirmer les suppressions (pièce, journal).
//
// Props :
//   ouvert    → boolean : afficher ou non la modale
//   titre     → string  : titre affiché (ex: "Supprimer ?")
//   message   → string  : description (ex: "Cette action est irréversible.")
//   onOui     → fonction appelée si l'utilisateur clique "Supprimer"
//   onNon     → fonction appelée si l'utilisateur clique "Annuler"
//
// Exemple :
//   <ConfirmModal
//     ouvert={!!idASupprimer}
//     titre="Supprimer la pièce ?"
//     message="L'historique sera perdu."
//     onOui={() => supprimerPiece(idASupprimer)}
//     onNon={() => setIdASupprimer(null)}
//   />
// ============================================================

export default function ConfirmModal({ ouvert, titre, message, onOui, onNon }) {
  if (!ouvert) return null;

  return (
    // Fond semi-transparent derrière la boîte
    <div className="fixed inset-0 z-[300] flex items-center justify-center
                    bg-black/80 px-5">
      <div className="bg-[#0F1220] border border-[#FF4D4D]/20 rounded-2xl
                      p-6 max-w-[280px] w-full text-center
                      animate-[fadeIn_0.2s_ease]"
           style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>

        {/* Titre */}
        <h3 className="text-[18px] font-extrabold text-[#E0DDD6] mb-1.5 tracking-wide">
          {titre}
        </h3>

        {/* Description */}
        <p className="text-[13px] text-[#555] mb-4 leading-relaxed">
          {message}
        </p>

        {/* Boutons */}
        <div className="flex gap-2">
          {/* Annuler */}
          <button
            onClick={onNon}
            className="flex-1 py-2.5 rounded-[9px] text-[14px] font-bold
                       tracking-wider text-[#555] cursor-pointer
                       bg-white/5 border border-white/10
                       hover:text-[#888] transition-colors"
          >
            Annuler
          </button>

          {/* Confirmer (destructif) */}
          <button
            onClick={onOui}
            className="flex-1 py-2.5 rounded-[9px] text-[14px] font-bold
                       tracking-wider text-[#FF4D4D] cursor-pointer
                       bg-[#FF4D4D]/9 border border-[#FF4D4D]/22
                       hover:bg-[#FF4D4D]/15 transition-colors"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}
