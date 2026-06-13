// ============================================================
// components/VueConfig.jsx
// Vue de configuration des notifications email via EmailJS.
//
// Cette vue permet à l'utilisateur de :
//   1. Saisir ses identifiants EmailJS (Service ID, Template ID, Public Key)
//   2. Définir l'adresse email destinataire
//   3. Choisir quand envoyer (urgent / bientôt)
//   4. Tester l'envoi manuellement
//
// Props :
//   config            → objet config actuel (sauvegardé)
//   emailStatus       → null | "sending" | "ok" | "err"
//   onSauvegarder     → function(nouvelleConfig) : sauvegarde la config
//   onEnvoyer         → function(config) : envoie les notifs maintenant
// ============================================================

import { useState } from "react";

export default function VueConfig({ config, emailStatus, onSauvegarder, onEnvoyer }) {

  // Copie locale pour l'édition (on ne sauvegarde qu'au clic "Sauvegarder")
  const [edit, setEdit] = useState({ ...config });

  // Met à jour un champ spécifique de la config en édition
  const maj = (champ, valeur) => setEdit(c => ({ ...c, [champ]: valeur }));

  const configComplete = config.serviceId && config.templateId
                      && config.publicKey  && config.emailTo;

  // Label et style du bouton d'envoi selon l'état
  const boutonNotif = {
    null:     { label: "✉ Envoyer un rapport maintenant", cls: "btn-bleu" },
    sending:  { label: "⏳ Envoi en cours…",              cls: "btn-orange" },
    ok:       { label: "✓ Email envoyé avec succès",      cls: "btn-vert"  },
    err:      { label: "✕ Échec — vérifiez les identifiants", cls: "btn-rouge" },
  }[emailStatus] || { label: "✉ Envoyer", cls: "btn-bleu" };

  return (
    <div className="p-5" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>

      {/* Titre */}
      <div className="text-[21px] font-extrabold tracking-tight text-[#E0DDD6] mb-1">
        Notifications Email
      </div>
      <p className="text-[9px] text-[#2E2E3E] tracking-[2px] uppercase mb-4"
         style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        CONFIGURATION EMAILJS
      </p>

      {/* ── Guide de configuration ────────────────────────────────── */}
      <div className="bg-[#64B4FF]/5 border border-[#64B4FF]/12
                      rounded-xl p-4 mb-4">
        <p className="text-[13px] text-[#7AAABB] leading-relaxed">
          <span className="text-[#64B4FF] font-bold">Comment configurer en 4 étapes :</span><br />
          1. Créer un compte sur <span className="text-[#64B4FF] font-bold">emailjs.com</span> (gratuit)<br />
          2. Ajouter un service email (Gmail, Outlook…)<br />
          3. Créer un template avec les variables :<br />
          <code className="font-mono text-[11px] bg-[#64B4FF]/10 px-1 rounded text-[#A8D4FF]">
            {"{{to_email}}"}
          </code>{" "}
          <code className="font-mono text-[11px] bg-[#64B4FF]/10 px-1 rounded text-[#A8D4FF]">
            {"{{subject}}"}
          </code>{" "}
          <code className="font-mono text-[11px] bg-[#64B4FF]/10 px-1 rounded text-[#A8D4FF]">
            {"{{message}}"}
          </code><br />
          4. Copier <span className="text-[#64B4FF] font-bold">Service ID</span>,{" "}
          <span className="text-[#64B4FF] font-bold">Template ID</span> et{" "}
          <span className="text-[#64B4FF] font-bold">Public Key</span> ci-dessous
        </p>
      </div>

      {/* ── Barre de statut ──────────────────────────────────────── */}
      <div
        className={`flex items-center gap-2 px-3 py-2.5 rounded-[9px] mb-4
                    text-[10px] tracking-wider
                    ${configComplete
                      ? "bg-[#4DFF9B]/6 border border-[#4DFF9B]/13 text-[#4DFF9B]"
                      : "bg-[#FFB347]/6 border border-[#FFB347]/13 text-[#FFB347]"
                    }`}
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        {configComplete
          ? "✓ EmailJS configuré — notifications actives"
          : "⚠ Non configuré — remplissez les champs ci-dessous"}
      </div>

      {/* ── Identifiants EmailJS ──────────────────────────────────── */}
      <div className="bg-white/[0.04] border border-white/7 rounded-[13px] p-4 mb-3">
        <h3 className="text-[13px] font-bold tracking-wider text-[#666] uppercase mb-3.5">
          Identifiants EmailJS
        </h3>

        {[
          { champ: "serviceId",  label: "SERVICE ID",         placeholder: "service_xxxxxxx"        },
          { champ: "templateId", label: "TEMPLATE ID",        placeholder: "template_xxxxxxx"       },
          { champ: "publicKey",  label: "PUBLIC KEY",         placeholder: "xxxxxxxxxxxxxxxxxxxx"    },
          { champ: "emailTo",    label: "EMAIL DESTINATAIRE", placeholder: "famille@email.com", type: "email" },
        ].map(({ champ, label, placeholder, type = "text" }) => (
          <div key={champ} className="flex flex-col gap-1 mb-3 last:mb-0">
            <label className="input-label">{label}</label>
            <input
              type={type}
              placeholder={placeholder}
              value={edit[champ]}
              onChange={e => maj(champ, e.target.value)}
              className="input-style"
            />
          </div>
        ))}
      </div>

      {/* ── Déclencheurs de notification ─────────────────────────── */}
      <div className="bg-white/[0.04] border border-white/7 rounded-[13px] p-4 mb-4">
        <h3 className="text-[13px] font-bold tracking-wider text-[#666] uppercase mb-3.5">
          Quand envoyer ?
        </h3>

        <ToggleRow
          label="⚠ Pièces urgentes (dépassées)"
          sous="Notifier quand une pièce est en retard"
          valeur={edit.notifUrgent}
          onChange={v => maj("notifUrgent", v)}
        />
        <ToggleRow
          label="↑ Pièces bientôt (80%+)"
          sous="Notifier quand une pièce approche la limite"
          valeur={edit.notifBientot}
          onChange={v => maj("notifBientot", v)}
          derniere
        />
      </div>

      {/* Bouton sauvegarder */}
      <button onClick={() => onSauvegarder(edit)} className="btn-primary w-full">
        Sauvegarder la configuration
      </button>

      {/* Séparateur */}
      <div className="h-px bg-white/5 my-4" />

      {/* ── Envoi manuel ─────────────────────────────────────────── */}
      <p className="text-[9px] text-[#2E2E3E] tracking-[2px] uppercase mb-3"
         style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        TEST & ENVOI MANUEL
      </p>

      <button
        onClick={() => onEnvoyer(edit)}
        disabled={emailStatus === "sending"}
        className={`w-full py-3 rounded-[11px] text-[15px] font-extrabold
                    tracking-wider uppercase cursor-pointer transition-all
                    flex items-center justify-center gap-2
                    disabled:cursor-wait
                    ${boutonNotif.cls}`}
        style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
      >
        {boutonNotif.label}
      </button>

      <p className="text-[9px] text-[#222] text-center mt-3 leading-relaxed"
         style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        Les notifications sont aussi envoyées automatiquement<br />
        à chaque mise à jour du kilométrage.
      </p>
    </div>
  );
}

// ── Sous-composant : ligne avec toggle switch ────────────────────────────────
function ToggleRow({ label, sous, valeur, onChange, derniere = false }) {
  return (
    <div className={`flex items-center justify-between py-2.5
                     ${!derniere ? "border-b border-white/5" : ""}`}>
      <div>
        <div className="text-[14px] text-[#AAA]">{label}</div>
        <div className="text-[9px] text-[#2E2E3E] mt-0.5"
             style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          {sous}
        </div>
      </div>

      {/* Toggle switch custom */}
      <button
        onClick={() => onChange(!valeur)}
        className={`relative w-9 h-[21px] rounded-full transition-colors cursor-pointer
                    border-none outline-none
                    ${valeur ? "bg-[#4DFF9B]/28" : "bg-white/9"}`}
      >
        <span
          className={`absolute top-[3px] w-[15px] h-[15px] rounded-full
                      transition-all duration-200
                      ${valeur
                        ? "left-[18px] bg-[#4DFF9B]"
                        : "left-[3px]  bg-[#444]"
                      }`}
        />
      </button>
    </div>
  );
}
