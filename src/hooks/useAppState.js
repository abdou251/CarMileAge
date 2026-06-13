// ============================================================
// src/hooks/useAppState.js
// Hook central — toutes les données viennent maintenant
// de Supabase au lieu de localStorage.
//
// Flux de données :
//   1. Au montage → charger toutes les données depuis Supabase
//   2. Action utilisateur → modifier Supabase + mettre à jour
//      l'état local React (optimistic update pour la fluidité)
//   3. Realtime → Supabase envoie les changements en temps réel
//      pour que tous les membres voient les mises à jour
//
// Pourquoi "optimistic update" ?
//   Au lieu d'attendre la réponse de Supabase avant d'afficher,
//   on met à jour l'UI immédiatement, puis on synchronise.
//   L'expérience est plus fluide (pas de latence visible).
// ============================================================

import { useState, useEffect, useRef, useCallback } from "react";
import {
  supabase, getFamilleId,
  chargerConfig, chargerPieces, chargerRemplacements, chargerJournal,
  mettreAJourKm, sauvegarderConfigEmail,
  ajouterPiece as dbAjouterPiece, supprimerPiece as dbSupprimerPiece,
  enregistrerRemplacement, ajouterJournal, supprimerJournal as dbSupprimerJournal,
  chargerProfil,
} from "../lib/supabase";
import { calculerStatut, loadEmailJS, fmtDate, today } from "../utils";

export function useAppState() {
  // ── État des données ────────────────────────────────────────────────────
  const [kmActuel,  setKmActuel]  = useState(315000);
  const [pieces,    setPieces]    = useState([]);
  const [rempl,     setRempl]     = useState({});
  const [journal,   setJournal]   = useState([]);
  const [config,    setConfig]    = useState({
    serviceId: "", templateId: "", publicKey: "",
    emailTo: "", notifUrgent: true, notifBientot: true,
  });
  const [profil,    setProfil]    = useState(null);

  // ── État UI ─────────────────────────────────────────────────────────────
  const [chargement, setChargement] = useState(true);  // premier chargement
  const [toast,      setToast]      = useState(null);
  const [emailStatus,setEmailStatus]= useState(null);

  const familleId    = getFamilleId();
  const notifSentRef = useRef({});

  // ── Toast helper ────────────────────────────────────────────────────────
  function showToast(msg, type = "ok") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  // ── Chargement initial de toutes les données ────────────────────────────
  const chargerTout = useCallback(async () => {
    if (!familleId) { setChargement(false); return; }
    setChargement(true);
    try {
      // Chargement en parallèle pour aller plus vite
      const [cfg, pcs, rpl, jnl, prf] = await Promise.all([
        chargerConfig(familleId),
        chargerPieces(familleId),
        chargerRemplacements(familleId),
        chargerJournal(familleId),
        chargerProfil(),
      ]);

      if (cfg) {
        setKmActuel(cfg.km_actuel);
        setConfig({
          serviceId:   cfg.email_service   || "",
          templateId:  cfg.email_template  || "",
          publicKey:   cfg.email_pubkey    || "",
          emailTo:     cfg.email_to        || "",
          notifUrgent: cfg.notif_urgent,
          notifBientot:cfg.notif_bientot,
        });
      }
      setPieces(pcs);
      setRempl(rpl);
      // Normalise le journal Supabase → format interne
      setJournal((jnl || []).map(normaliserEntreeJournal));
      setProfil(prf);
    } catch (err) {
      console.error("Erreur chargement:", err);
      showToast("Erreur de chargement des données", "err");
    } finally {
      setChargement(false);
    }
  }, [familleId]);

  useEffect(() => { chargerTout(); }, [chargerTout]);

  // ── Realtime : écoute les changements en temps réel ────────────────────
  // Quand un autre membre enregistre un km ou un remplacement,
  // la page se met à jour automatiquement sans rechargement.
  useEffect(() => {
    if (!familleId) return;

    const channel = supabase
      .channel(`famille_${familleId}`)

      // Écoute les changements de config (km actuel)
      .on("postgres_changes", {
        event: "UPDATE", schema: "public", table: "config_voiture",
        filter: `famille_id=eq.${familleId}`,
      }, payload => {
        setKmActuel(payload.new.km_actuel);
      })

      // Écoute les nouveaux remplacements
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "remplacements",
        filter: `famille_id=eq.${familleId}`,
      }, () => {
        // Recharge les remplacements pour avoir les données fraîches
        chargerRemplacements(familleId).then(setRempl);
      })

      // Écoute les nouveaux journaux
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "journal_km",
        filter: `famille_id=eq.${familleId}`,
      }, payload => {
        setJournal(j => [normaliserEntreeJournal(payload.new), ...j]);
      })

      // Écoute les suppressions de journal
      .on("postgres_changes", {
        event: "DELETE", schema: "public", table: "journal_km",
        filter: `famille_id=eq.${familleId}`,
      }, payload => {
        setJournal(j => j.filter(e => e.id !== payload.old.id));
      })

      // Écoute les nouvelles pièces et suppressions
      .on("postgres_changes", {
        event: "*", schema: "public", table: "pieces",
        filter: `famille_id=eq.${familleId}`,
      }, () => {
        chargerPieces(familleId).then(setPieces);
      })

      .subscribe();

    // Nettoyage : désabonner quand le composant se démonte
    return () => { supabase.removeChannel(channel); };
  }, [familleId]);

  // ── Notifications auto quand km change ──────────────────────────────────
  useEffect(() => {
    if (config.serviceId && config.templateId && config.publicKey && config.emailTo) {
      _checkAndNotify(false, config, pieces, rempl, kmActuel, notifSentRef, setEmailStatus, showToast);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kmActuel, rempl]);

  // ── ACTIONS ─────────────────────────────────────────────────────────────

  async function enregistrerKm({ km, date, membre, note }) {
    if (!km || km <= kmActuel) {
      showToast("Le kilométrage doit être supérieur à l'actuel", "err");
      return false;
    }
    try {
      const kmAncien = kmActuel;
      // 1. Optimistic update (mise à jour locale immédiate)
      setKmActuel(km);
      // 2. Sauvegarder dans Supabase
      await mettreAJourKm(familleId, km);
      // 3. Ajouter au journal
      await ajouterJournal(familleId, {
        type: "km", km, kmAncien, date, membre, note,
      });
      showToast(`Kilométrage mis à jour : ${km.toLocaleString("fr-FR")} km`);
      return true;
    } catch (err) {
      setKmActuel(kmActuel); // Rollback si erreur
      showToast("Erreur lors de la sauvegarde", "err");
      return false;
    }
  }

  async function remplacerPiece({ piece, km, date, membre, note }) {
    try {
      // 1. Optimistic update
      setRempl(r => ({
        ...r,
        [piece.id]: { date, km, membre, note },
      }));
      // 2. Sauvegarder le remplacement
      await enregistrerRemplacement(familleId, {
        piece, km, date, membreNom: membre, note,
      });
      // 3. Ajouter au journal
      await ajouterJournal(familleId, {
        type: "remplacement", km, date, membre,
        pieceId: piece.id, pieceNom: piece.nom, pieceIcone: piece.icone, note,
      });
      // 4. Reset notif pour cette pièce
      const ns = { ...notifSentRef.current };
      delete ns[piece.id + "_urgent"];
      delete ns[piece.id + "_bientot"];
      notifSentRef.current = ns;

      showToast(`${piece.nom} remplacé(e) ✓`);
    } catch (err) {
      showToast("Erreur lors de la sauvegarde", "err");
      chargerRemplacements(familleId).then(setRempl); // Rollback
    }
  }

  async function ajouterPiece({ nom, icone, intervalleKm, intervalleMois }) {
    if (!nom.trim()) return;
    try {
      const nouvelle = await dbAjouterPiece(familleId, {
        nom, icone, intervalleKm, intervalleMois, ordre: pieces.length + 1,
      });
      setPieces(p => [...p, nouvelle]);
      showToast(`${nom} ajouté(e)`);
    } catch (err) {
      showToast("Erreur lors de l'ajout", "err");
    }
  }

  async function supprimerPiece(id) {
    try {
      setPieces(p => p.filter(x => x.id !== id)); // Optimistic
      setRempl(r => { const c = { ...r }; delete c[id]; return c; });
      await dbSupprimerPiece(id);
      showToast("Pièce supprimée");
    } catch (err) {
      showToast("Erreur lors de la suppression", "err");
      chargerPieces(familleId).then(setPieces); // Rollback
    }
  }

  async function supprimerJournal(id) {
    try {
      setJournal(j => j.filter(x => x.id !== id)); // Optimistic
      await dbSupprimerJournal(id);
    } catch (err) {
      showToast("Erreur lors de la suppression", "err");
      chargerJournal(familleId).then(j => setJournal(j.map(normaliserEntreeJournal)));
    }
  }

  async function sauvegarderConfig(nouvelleConfig) {
    try {
      await sauvegarderConfigEmail(familleId, nouvelleConfig);
      setConfig(nouvelleConfig);
      showToast("Configuration sauvegardée ✓");
    } catch (err) {
      showToast("Erreur lors de la sauvegarde", "err");
    }
  }

  async function envoyerNotifications(cfg) {
    await _checkAndNotify(true, cfg, pieces, rempl, kmActuel, notifSentRef, setEmailStatus, showToast);
  }

  // ── Données calculées ───────────────────────────────────────────────────
  const nbUrgent  = pieces.filter(p => calculerStatut(p, rempl, kmActuel).statut === "urgent").length;
  const nbBientot = pieces.filter(p => calculerStatut(p, rempl, kmActuel).statut === "bientot").length;
  const emailConfigured = !!(config.serviceId && config.templateId && config.publicKey && config.emailTo);

  function getStatut(piece) {
    return calculerStatut(piece, rempl, kmActuel);
  }

  return {
    // État
    kmActuel, pieces, rempl, journal, config, profil,
    chargement, toast, emailStatus,
    nbUrgent, nbBientot, emailConfigured,
    // Actions
    enregistrerKm, remplacerPiece, ajouterPiece,
    supprimerPiece, supprimerJournal, sauvegarderConfig,
    envoyerNotifications, getStatut, showToast,
  };
}

// ── Normalisation : adapte les colonnes Supabase → format interne ─────────
// Supabase utilise snake_case, le frontend utilise camelCase.
function normaliserEntreeJournal(e) {
  return {
    id:       e.id,
    type:     e.type,
    km:       e.km,
    ancien:   e.km_ancien,
    date:     e.date_entree,
    membre:   e.membre_nom,
    pieceId:  e.piece_id,
    pieceNom: e.piece_nom,
    icone:    e.piece_icone,
    note:     e.note,
  };
}

// ── Envoi email (identique à la version localStorage) ────────────────────
async function _checkAndNotify(manual, cfg, pieces, rempl, kmActuel, notifSentRef, setEmailStatus, showToast) {
  if (!cfg.serviceId || !cfg.templateId || !cfg.publicKey || !cfg.emailTo) {
    if (manual) showToast("Veuillez remplir tous les champs EmailJS", "err");
    return;
  }
  function statut(p) { return calculerStatut(p, rempl, kmActuel).statut; }

  const cibles = pieces.filter(p => {
    const s = statut(p);
    if (cfg.notifUrgent  && s === "urgent"  && !notifSentRef.current[p.id + "_urgent"])  return true;
    if (cfg.notifBientot && s === "bientot" && !notifSentRef.current[p.id + "_bientot"]) return true;
    return false;
  });
  if (cibles.length === 0) { if (manual) showToast("Aucune nouvelle alerte à envoyer ✓"); return; }

  setEmailStatus("sending");
  try {
    const ejs = await loadEmailJS();
    ejs.init({ publicKey: cfg.publicKey });
    const urgentes   = cibles.filter(p => statut(p) === "urgent");
    const prochaines = cibles.filter(p => statut(p) === "bientot");
    const ligne = p => {
      const s = calculerStatut(p, rempl, kmActuel);
      return `  • ${p.icone||p.icone} ${p.nom}`
        + (s.kmRestant    !== null ? ` | KM: ${s.kmRestant > 0    ? s.kmRestant.toLocaleString("fr-FR") + " restants" : "DÉPASSÉ"}` : "")
        + (s.moisRestant  !== null ? ` | Temps: ${s.moisRestant > 0 ? s.moisRestant + " mois restants" : "DÉPASSÉ"}` : "");
    };
    const corps =
      `🚗 RAPPORT D'ENTRETIEN — FAMVOITURE\n${"━".repeat(38)}\n`
      + `📅 Date : ${fmtDate(today())} | 📍 Km : ${kmActuel.toLocaleString("fr-FR")} km\n\n`
      + (urgentes.length   ? `🔴 URGENT :\n${urgentes.map(ligne).join("\n")}\n\n`   : "")
      + (prochaines.length ? `🟡 BIENTÔT :\n${prochaines.map(ligne).join("\n")}\n\n` : "")
      + `${"━".repeat(38)}\nConnectez-vous à FamVoiture pour marquer les remplacements.`;

    await ejs.send(cfg.serviceId, cfg.templateId, {
      to_email: cfg.emailTo,
      subject:  `🚗 FamVoiture — ${urgentes.length} urgent(s), ${prochaines.length} bientôt`,
      message:  corps, km_actuel: kmActuel.toLocaleString("fr-FR") + " km",
    });

    const ns = { ...notifSentRef.current };
    cibles.forEach(p => {
      const s = statut(p);
      if (s === "urgent")  ns[p.id + "_urgent"]  = today();
      if (s === "bientot") ns[p.id + "_bientot"] = today();
    });
    notifSentRef.current = ns;

    setEmailStatus("ok");
    showToast(`Email envoyé à ${cfg.emailTo} ✓`);
    setTimeout(() => setEmailStatus(null), 4000);
  } catch (err) {
    console.error(err);
    setEmailStatus("err");
    showToast("Échec de l'envoi EmailJS", "err");
    setTimeout(() => setEmailStatus(null), 5000);
  }
}
