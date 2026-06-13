// ============================================================
// src/lib/supabase.js
// Client Supabase + toutes les fonctions d'accès à la base.
//
// Ce fichier centralise TOUTES les interactions avec Supabase.
// Les composants React n'importent jamais supabase directement —
// ils utilisent uniquement les fonctions exportées ici.
//
// SETUP :
//   1. Créer un projet sur supabase.com
//   2. Aller dans Project Settings → API
//   3. Copier "Project URL" et "anon public key"
//   4. Créer un fichier .env à la racine du projet :
//        VITE_SUPABASE_URL=https://xxxx.supabase.co
//        VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
// ============================================================

import { createClient } from "@supabase/supabase-js";

// Les variables VITE_ sont exposées au frontend par Vite.
// Ne jamais mettre la SERVICE_ROLE key ici (frontend = public).
const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    "❌ Variables Supabase manquantes.\n" +
    "Créez un fichier .env avec :\n" +
    "  VITE_SUPABASE_URL=...\n" +
    "  VITE_SUPABASE_ANON_KEY=..."
  );
}

// Instance unique du client Supabase (singleton)
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─────────────────────────────────────────────────────────────
// IDENTIFIANT FAMILLE
// Toutes les données sont partitionnées par famille_id.
// C'est un code court que la famille partage entre membres.
// Il est stocké dans localStorage après la première connexion.
// ─────────────────────────────────────────────────────────────
export function getFamilleId() {
  return localStorage.getItem("fam_famille_id") || "";
}

export function setFamilleId(id) {
  localStorage.setItem("fam_famille_id", id);
}

// Pièces par défaut insérées lors du premier setup famille
const PIECES_INITIALES = [
  { nom: "Huile moteur",           icone: "🛢️", intervalle_km: 5000,  intervalle_mois: 6,  ordre: 1  },
  { nom: "Filtre à air",           icone: "💨", intervalle_km: 15000, intervalle_mois: 12, ordre: 2  },
  { nom: "Filtre habitacle",       icone: "🌬️", intervalle_km: 15000, intervalle_mois: 12, ordre: 3  },
  { nom: "Bougies d'allumage",     icone: "⚡", intervalle_km: 30000, intervalle_mois: 24, ordre: 4  },
  { nom: "Courroie distribution",  icone: "⚙️", intervalle_km: 60000, intervalle_mois: 48, ordre: 5  },
  { nom: "Plaquettes avant",       icone: "🔴", intervalle_km: 40000, intervalle_mois: 36, ordre: 6  },
  { nom: "Plaquettes arrière",     icone: "🔴", intervalle_km: 50000, intervalle_mois: 48, ordre: 7  },
  { nom: "Pneus",                  icone: "🔵", intervalle_km: 40000, intervalle_mois: 48, ordre: 8  },
  { nom: "Liquide de frein",       icone: "🧪", intervalle_km: 0,     intervalle_mois: 24, ordre: 9  },
  { nom: "Liquide refroidissement",icone: "❄️", intervalle_km: 0,     intervalle_mois: 24, ordre: 10 },
  { nom: "Batterie",               icone: "🔋", intervalle_km: 0,     intervalle_mois: 48, ordre: 11 },
  { nom: "Amortisseurs",           icone: "🔩", intervalle_km: 80000, intervalle_mois: 60, ordre: 12 },
];


// ─────────────────────────────────────────────────────────────
// AUTH — Authentification
// ─────────────────────────────────────────────────────────────

// Inscription d'un nouveau membre
// nom et couleur sont stockés dans user_metadata (profil)
export async function inscrire({ email, motDePasse, nom, couleur, familleId }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password: motDePasse,
    options: {
      data: { nom, couleur },   // → stocké dans profiles via trigger
    },
  });
  if (error) throw error;

  // Associe cet utilisateur à la famille
  setFamilleId(familleId);

  // Si c'est le premier membre de la famille, créer les données initiales
  await initierFamilleSiNecessaire(familleId);

  return data;
}

// Connexion d'un membre existant
export async function connecter({ email, motDePasse, familleId }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: motDePasse,
  });
  if (error) throw error;
  setFamilleId(familleId);
  return data;
}

// Déconnexion
export async function deconnecter() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Récupère la session active (null si non connecté)
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// Écoute les changements d'auth (connexion / déconnexion)
export function onAuthChange(callback) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
}


// ─────────────────────────────────────────────────────────────
// SETUP FAMILLE
// ─────────────────────────────────────────────────────────────

// Vérifie si la famille a déjà des données, sinon les crée
async function initierFamilleSiNecessaire(familleId) {
  // Vérifie si une config existe déjà pour cette famille
  const { data: config } = await supabase
    .from("config_voiture")
    .select("id")
    .eq("famille_id", familleId)
    .maybeSingle();

  if (config) return; // Famille déjà initialisée

  // 1. Créer la config de la voiture
  const { error: errConfig } = await supabase
    .from("config_voiture")
    .insert({
      famille_id:     familleId,
      km_actuel:      315000,
      updated_by:     (await supabase.auth.getUser()).data.user?.id,
    });
  if (errConfig) console.error("Erreur config:", errConfig);

  // 2. Insérer les pièces initiales
  const userId = (await supabase.auth.getUser()).data.user?.id;
  const { error: errPieces } = await supabase
    .from("pieces")
    .insert(
      PIECES_INITIALES.map(p => ({
        ...p,
        famille_id: familleId,
        created_by: userId,
      }))
    );
  if (errPieces) console.error("Erreur pièces initiales:", errPieces);
}


// ─────────────────────────────────────────────────────────────
// CONFIG VOITURE
// ─────────────────────────────────────────────────────────────

// Charge la config (km + email) pour la famille
export async function chargerConfig(familleId) {
  const { data, error } = await supabase
    .from("config_voiture")
    .select("*")
    .eq("famille_id", familleId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// Met à jour le kilométrage actuel
export async function mettreAJourKm(familleId, km) {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  const { error } = await supabase
    .from("config_voiture")
    .update({ km_actuel: km, updated_at: new Date().toISOString(), updated_by: userId })
    .eq("famille_id", familleId);
  if (error) throw error;
}

// Sauvegarde la configuration email
export async function sauvegarderConfigEmail(familleId, cfg) {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  const { error } = await supabase
    .from("config_voiture")
    .update({
      email_service:  cfg.serviceId,
      email_template: cfg.templateId,
      email_pubkey:   cfg.publicKey,
      email_to:       cfg.emailTo,
      notif_urgent:   cfg.notifUrgent,
      notif_bientot:  cfg.notifBientot,
      updated_at:     new Date().toISOString(),
      updated_by:     userId,
    })
    .eq("famille_id", familleId);
  if (error) throw error;
}


// ─────────────────────────────────────────────────────────────
// PIÈCES
// ─────────────────────────────────────────────────────────────

// Charge toutes les pièces de la famille, triées par ordre
export async function chargerPieces(familleId) {
  const { data, error } = await supabase
    .from("pieces")
    .select("*")
    .eq("famille_id", familleId)
    .order("ordre", { ascending: true });
  if (error) throw error;
  return data || [];
}

// Ajoute une nouvelle pièce
export async function ajouterPiece(familleId, piece) {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  const { data, error } = await supabase
    .from("pieces")
    .insert({
      famille_id:      familleId,
      nom:             piece.nom,
      icone:           piece.icone,
      intervalle_km:   piece.intervalleKm,
      intervalle_mois: piece.intervalleMois,
      ordre:           piece.ordre || 99,
      created_by:      userId,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Supprime une pièce (et ses remplacements via CASCADE)
export async function supprimerPiece(pieceId) {
  const { error } = await supabase
    .from("pieces")
    .delete()
    .eq("id", pieceId);
  if (error) throw error;
}


// ─────────────────────────────────────────────────────────────
// REMPLACEMENTS
// ─────────────────────────────────────────────────────────────

// Charge le dernier remplacement pour chaque pièce de la famille
// Retourne un objet { pieceId: { date, km, membre_nom, note } }
export async function chargerRemplacements(familleId) {
  const { data, error } = await supabase
    .from("remplacements")
    .select("*")
    .eq("famille_id", familleId)
    .order("created_at", { ascending: false });
  if (error) throw error;

  // On garde uniquement le remplacement le plus récent par pièce
  const map = {};
  for (const r of (data || [])) {
    if (!map[r.piece_id]) {
      map[r.piece_id] = {
        date:    r.date_remp,
        km:      r.km_remp,
        membre:  r.membre_nom,
        note:    r.note,
        id:      r.id,
      };
    }
  }
  return map;
}

// Enregistre un nouveau remplacement pour une pièce
export async function enregistrerRemplacement(familleId, { piece, km, date, membreNom, note }) {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  const { data, error } = await supabase
    .from("remplacements")
    .insert({
      piece_id:   piece.id,
      famille_id: familleId,
      date_remp:  date,
      km_remp:    km,
      membre_id:  userId,
      membre_nom: membreNom,
      note:       note || "",
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}


// ─────────────────────────────────────────────────────────────
// JOURNAL
// ─────────────────────────────────────────────────────────────

// Charge tout le journal, du plus récent au plus ancien
export async function chargerJournal(familleId) {
  const { data, error } = await supabase
    .from("journal_km")
    .select("*")
    .eq("famille_id", familleId)
    .order("created_at", { ascending: false })
    .limit(100);   // Limite à 100 entrées pour les performances
  if (error) throw error;
  return data || [];
}

// Ajoute une entrée dans le journal (km ou remplacement)
export async function ajouterJournal(familleId, entree) {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  const { data, error } = await supabase
    .from("journal_km")
    .insert({
      famille_id:  familleId,
      type:        entree.type,         // "km" ou "remplacement"
      km:          entree.km,
      km_ancien:   entree.kmAncien || null,
      date_entree: entree.date,
      membre_id:   userId,
      membre_nom:  entree.membre,
      piece_id:    entree.pieceId   || null,
      piece_nom:   entree.pieceNom  || "",
      piece_icone: entree.pieceIcone|| "",
      note:        entree.note      || "",
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Supprime une entrée du journal
export async function supprimerJournal(entreeId) {
  const { error } = await supabase
    .from("journal_km")
    .delete()
    .eq("id", entreeId);
  if (error) throw error;
}


// ─────────────────────────────────────────────────────────────
// PROFIL UTILISATEUR
// ─────────────────────────────────────────────────────────────

// Charge le profil de l'utilisateur connecté
export async function chargerProfil() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  if (error) throw error;
  return data;
}

// Charge tous les profils de la famille (pour affichage)
// Note: limité aux utilisateurs qui ont le même famille_id
// (la sécurité est gérée via RLS + famille_id côté SQL)
export async function chargerMembres(familleId) {
  // On récupère les noms uniques depuis le journal
  const { data, error } = await supabase
    .from("journal_km")
    .select("membre_nom, membre_id")
    .eq("famille_id", familleId);
  if (error) return [];

  // Dédoublonne par membre_id
  const vus = new Set();
  return (data || []).filter(r => {
    if (vus.has(r.membre_id)) return false;
    vus.add(r.membre_id);
    return true;
  });
}
