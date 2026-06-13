// ============================================================
// components/Header.jsx
// Barre du haut de l'application, toujours visible (sticky).
// Affiche :
//   - Le titre et le kilométrage actuel
//   - Des badges colorés indiquant l'état général
//     (urgences, bientôt, tout va bien, email actif)
//
// Props reçues depuis App.jsx :
//   kmActuel        → nombre (ex: 315000)
//   nbPieces        → nombre total de pièces suivies
//   nbUrgent        → nombre de pièces en état urgent
//   nbBientot       → nombre de pièces bientôt à remplacer
//   emailConfigured → boolean (email configuré ou non)
// ============================================================

export default function Header({ kmActuel, nbPieces, nbUrgent, nbBientot, emailConfigured }) {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between
                       px-5 py-3 border-b border-white/5
                       bg-[#080A10]/97 backdrop-blur-md">

      {/* Titre + sous-titre */}
      <div>
        <div className="text-[22px] font-extrabold tracking-[3px] uppercase text-[#E0DDD6]"
             style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
          🚗 FamVoiture
        </div>
        <div className="text-[10px] text-[#3A3A4A] mt-0.5 tracking-wider"
             style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          {kmActuel.toLocaleString("fr-FR")} KM · {nbPieces} PIÈCES
        </div>
      </div>

      {/* Badges d'état */}
      <div className="flex flex-col items-end gap-1.5">

        {/* Badge rouge clignotant si pièces urgentes */}
        {nbUrgent > 0 && (
          <span className="badge-rouge animate-pulse">
            ⚠ {nbUrgent} URGENT{nbUrgent > 1 ? "S" : ""}
          </span>
        )}

        {/* Badge orange si pièces bientôt */}
        {nbBientot > 0 && (
          <span className="badge-orange">
            ↑ {nbBientot} BIENTÔT
          </span>
        )}

        {/* Badge vert si tout va bien */}
        {nbUrgent === 0 && nbBientot === 0 && (
          <span className="badge-vert">✓ TOUT VA BIEN</span>
        )}

        {/* Badge bleu si email configuré */}
        {emailConfigured && (
          <span className="badge-bleu">✉ NOTIF ACTIF</span>
        )}
      </div>
    </header>
  );
}
