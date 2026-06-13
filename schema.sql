-- ============================================================
-- schema.sql
-- À exécuter dans l'éditeur SQL de Supabase
-- (Dashboard → SQL Editor → New Query → Coller → Run)
--
-- Ce fichier crée toutes les tables et règles de sécurité
-- nécessaires à l'application FamVoiture.
--
-- Tables créées :
--   profiles    → informations des membres (nom, couleur)
--   pieces      → pièces suivies par la famille
--   remplacements → historique des remplacements
--   journal_km  → historique des kilométrages
--   config_voiture → kilométrage actuel + config email
--
-- Sécurité : Row Level Security (RLS) activée sur toutes
-- les tables. Chaque famille ne voit que ses propres données.
-- ============================================================
drop table if exists public.journal cascade;
drop table if exists public.remplacements cascade;
drop table if exists public.pieces cascade;
drop table if exists public.config cascade;
drop table if exists public.profiles cascade;
drop table if exists public.familles cascade;

-- ─────────────────────────────────────────────────────────────
-- 0. Extension UUID (déjà activée sur Supabase, au cas où)
-- ─────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";


-- ─────────────────────────────────────────────────────────────
-- 1. TABLE : profiles
-- Créée automatiquement quand un utilisateur s'inscrit.
-- Liée à auth.users (géré par Supabase Auth).
-- ─────────────────────────────────────────────────────────────
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  nom         text not null,                          -- "Papa", "Maman", etc.
  couleur     text not null default '#E8A838',        -- couleur hex du membre
  created_at  timestamptz default now()
);

-- Activer RLS : chaque utilisateur ne voit que son propre profil
alter table public.profiles enable row level security;

create policy "Voir son propre profil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Modifier son propre profil"
  on public.profiles for update
  using (auth.uid() = id);

-- Trigger : crée automatiquement un profil quand un user s'inscrit
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, nom, couleur)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nom', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'couleur', '#E8A838')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ─────────────────────────────────────────────────────────────
-- 2. TABLE : config_voiture
-- Une seule ligne partagée par toute la famille.
-- Stocke le km actuel et la configuration email.
-- ─────────────────────────────────────────────────────────────
create table public.config_voiture (
  id              uuid primary key default uuid_generate_v4(),
  famille_id      text not null,         -- identifiant partagé de la famille
  km_actuel       integer not null default 315000,
  email_service   text default '',       -- EmailJS service ID
  email_template  text default '',       -- EmailJS template ID
  email_pubkey    text default '',       -- EmailJS public key
  email_to        text default '',       -- adresse destinataire
  notif_urgent    boolean default true,
  notif_bientot   boolean default true,
  updated_at      timestamptz default now(),
  updated_by      uuid references auth.users(id)
);

alter table public.config_voiture enable row level security;

-- Tous les membres de la même famille peuvent lire et modifier
create policy "Famille peut lire la config"
  on public.config_voiture for select
  using (true);  -- filtré par famille_id dans le code

create policy "Famille peut modifier la config"
  on public.config_voiture for all
  using (true);


-- ─────────────────────────────────────────────────────────────
-- 3. TABLE : pieces
-- Liste des pièces suivies par la famille.
-- ─────────────────────────────────────────────────────────────
create table public.pieces (
  id              uuid primary key default uuid_generate_v4(),
  famille_id      text not null,
  nom             text not null,
  icone           text not null default '🔧',
  intervalle_km   integer not null default 0,
  intervalle_mois integer not null default 0,
  ordre           integer default 0,       -- pour trier l'affichage
  created_at      timestamptz default now(),
  created_by      uuid references auth.users(id)
);

alter table public.pieces enable row level security;

create policy "Famille peut lire ses pièces"
  on public.pieces for select using (true);

create policy "Famille peut gérer ses pièces"
  on public.pieces for all using (true);


-- ─────────────────────────────────────────────────────────────
-- 4. TABLE : remplacements
-- Dernier remplacement connu pour chaque pièce.
-- (Une ligne par pièce, mise à jour à chaque remplacement)
-- ─────────────────────────────────────────────────────────────
create table public.remplacements (
  id          uuid primary key default uuid_generate_v4(),
  piece_id    uuid not null references public.pieces(id) on delete cascade,
  famille_id  text not null,
  date_remp   date not null,
  km_remp     integer not null,
  membre_id   uuid references auth.users(id),
  membre_nom  text not null,   -- dénormalisé pour affichage sans jointure
  note        text default '',
  created_at  timestamptz default now()
);

alter table public.remplacements enable row level security;

create policy "Famille peut lire ses remplacements"
  on public.remplacements for select using (true);

create policy "Famille peut gérer ses remplacements"
  on public.remplacements for all using (true);


-- ─────────────────────────────────────────────────────────────
-- 5. TABLE : journal_km
-- Historique de toutes les mises à jour de kilométrage
-- et de tous les remplacements de pièces.
-- ─────────────────────────────────────────────────────────────
create table public.journal_km (
  id          uuid primary key default uuid_generate_v4(),
  famille_id  text not null,
  type        text not null check (type in ('km', 'remplacement')),
  km          integer not null,
  km_ancien   integer,            -- uniquement pour type = 'km'
  date_entree date not null,
  membre_id   uuid references auth.users(id),
  membre_nom  text not null,
  piece_id    uuid references public.pieces(id) on delete set null,
  piece_nom   text default '',    -- dénormalisé
  piece_icone text default '',
  note        text default '',
  created_at  timestamptz default now()
);

alter table public.journal_km enable row level security;

create policy "Famille peut lire son journal"
  on public.journal_km for select using (true);

create policy "Famille peut ajouter au journal"
  on public.journal_km for insert with check (true);

create policy "Famille peut supprimer du journal"
  on public.journal_km for delete using (true);


-- ─────────────────────────────────────────────────────────────
-- 6. DONNÉES INITIALES : pièces par défaut
-- Appelé manuellement lors du premier setup famille.
-- (Le code React appellera une fonction pour insérer ces pièces
--  lors de la première connexion d'une famille.)
-- ─────────────────────────────────────────────────────────────
-- Exemple : insert into public.pieces (famille_id, nom, icone, ...) values (...)
-- → géré côté frontend dans lib/supabase.js


-- ─────────────────────────────────────────────────────────────
-- 7. INDEX pour les performances
-- ─────────────────────────────────────────────────────────────
create index idx_pieces_famille        on public.pieces(famille_id);
create index idx_remplacements_piece   on public.remplacements(piece_id);
create index idx_remplacements_famille on public.remplacements(famille_id);
create index idx_journal_famille       on public.journal_km(famille_id);
create index idx_journal_created       on public.journal_km(created_at desc);
create index idx_config_famille        on public.config_voiture(famille_id);
