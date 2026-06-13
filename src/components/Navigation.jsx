// ============================================================
// components/Navigation.jsx
// Barre de navigation en bas de l'écran, toujours visible.
// Chaque bouton correspond à un onglet de l'application.
//
// Props :
//   vue        → l'onglet actuellement actif (string)
//   setVue     → fonction pour changer d'onglet
//   nbUrgent   → affiche un point rouge sur "Pièces" si > 0
//   emailOk    → si false, affiche un point rouge sur "Email"
//                pour inviter l'utilisateur à le configurer
// ============================================================

// Liste des onglets de la navigation
// k = clé interne, i = icône, l = label affiché
const ONGLETS = [
  { k: "tableau", i: "⚡", l: "Tableau"  },
  { k: "kilom",   i: "📍", l: "Km"       },
  { k: "pieces",  i: "🔧", l: "Pièces"   },
  { k: "journal", i: "📋", l: "Journal"  },
  { k: "config",  i: "✉",  l: "Email"    },
];

export default function Navigation({ vue, setVue, nbUrgent, emailOk }) {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2
                    w-full max-w-[480px] z-50
                    flex gap-1 px-2 pt-2.5 pb-5
                    bg-[#080A10]/98 border-t border-white/7
                    backdrop-blur-xl"
         style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>

      {ONGLETS.map(({ k, i, l }) => {
        const actif = vue === k;

        // Détermine si ce bouton doit avoir un point d'alerte rouge
        const afficherPoint = (k === "pieces" && nbUrgent > 0)
                           || (k === "config"  && !emailOk);

        return (
          <button
            key={k}
            onClick={() => setVue(k)}
            className={`relative flex-1 flex flex-col items-center gap-1
                        rounded-[9px] py-2 text-[10px] font-semibold
                        uppercase tracking-wider transition-all duration-200
                        ${actif
                          ? "bg-white/6 text-[#E0DDD6]"
                          : "text-[#2E2E3E] hover:text-[#666]"
                        }`}
          >
            {/* Icône */}
            <span className="text-[18px] leading-none">{i}</span>

            {/* Label */}
            <span>{l}</span>

            {/* Point d'alerte rouge */}
            {afficherPoint && (
              <span className="absolute top-1.5 right-[calc(50%-14px)]
                               w-1.5 h-1.5 rounded-full bg-[#FF4D4D]
                               border-[1.5px] border-[#080A10]" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
