// ============================================================
// components/Toast.jsx
// Petit message de confirmation ou d'erreur qui apparaît
// en haut de l'écran pendant 3 secondes puis disparaît.
//
// Props :
//   toast → null (rien à afficher) OU { msg: string, type: "ok"|"err" }
//
// Exemple d'utilisation dans App.jsx :
//   <Toast toast={toast} />
//
// Le composant n'affiche rien si toast est null.
// ============================================================

export default function Toast({ toast }) {
  // Si pas de toast, on n'affiche rien du tout
  if (!toast) return null;

  const estErreur = toast.type === "err";

  return (
    <div
      className={`fixed top-5 left-1/2 -translate-x-1/2 z-[999]
                  px-4 py-2.5 rounded-full whitespace-nowrap max-w-[92vw]
                  text-[10px] tracking-wider animate-[slideDown_0.3s_ease]
                  ${estErreur
                    ? "bg-[#FF4D4D]/11 border border-[#FF4D4D]/20 text-[#FF4D4D]"
                    : "bg-[#4DFF9B]/11 border border-[#4DFF9B]/20 text-[#4DFF9B]"
                  }`}
      style={{ fontFamily: "'JetBrains Mono', monospace" }}
    >
      {toast.msg}
    </div>
  );
}
