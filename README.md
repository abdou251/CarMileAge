<<<<<<< HEAD
# 🚗 FamVoiture

Application familiale de suivi d'entretien automobile.
**React 18 + Vite + Tailwind CSS v3 + Supabase**

---

## 🚀 Installation & lancement

```bash
# 1. Aller dans le dossier
cd famvoiture

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env
# → Remplir VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY

# 4. Lancer
npm run dev
```

Ouvrir **http://localhost:5173**

---

## 🗄️ Configuration Supabase (obligatoire)

### Étape 1 — Créer un projet
1. Aller sur [supabase.com](https://supabase.com) → New Project
2. Choisir un nom, mot de passe DB, région (Europe West)

### Étape 2 — Créer la base de données
1. Dashboard → **SQL Editor** → New Query
2. Coller le contenu de **`schema.sql`** (à la racine du projet)
3. Cliquer **Run**

### Étape 3 — Récupérer les clés API
1. Dashboard → **Settings** → **API**
2. Copier **Project URL** et **anon public key**
3. Les coller dans votre fichier `.env` :

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

### Étape 4 — Activer l'authentification par email
1. Dashboard → **Authentication** → **Providers**
2. S'assurer que **Email** est activé
3. (Optionnel) Désactiver "Confirm email" pour les tests :
   Authentication → Settings → décocher "Enable email confirmations"

---

## 👨‍👩‍👧‍👦 Comment la famille s'inscrit

1. Le **premier membre** crée un compte avec un **Code Famille** unique
   (ex: `BENALI2024`). Cela crée automatiquement toutes les données initiales.
2. Chaque autre membre s'inscrit avec le **même Code Famille**.
3. Toutes les données sont partagées en **temps réel** entre tous les membres.

---

## 📁 Structure du projet

```
famvoiture/
├── schema.sql                      ← À exécuter dans Supabase SQL Editor
├── .env.example                    ← Modèle pour les variables d'env
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── index.html
└── src/
    ├── main.jsx                    ← Point d'entrée (avec AuthProvider)
    ├── App.jsx                     ← Orchestrateur + gestion auth
    ├── index.css                   ← Tailwind + styles globaux
    ├── constants.js                ← Données fixes
    ├── utils.js                    ← Fonctions utilitaires pures
    ├── lib/
    │   ├── supabase.js             ← Client + toutes les fonctions DB
    │   └── AuthContext.jsx         ← Contexte d'authentification React
    ├── hooks/
    │   └── useAppState.js          ← État global + Realtime Supabase
    └── components/
        ├── auth/
        │   └── PageAuth.jsx        ← Page connexion/inscription
        ├── EcranChargement.jsx     ← Spinner de chargement
        ├── Header.jsx
        ├── Navigation.jsx
        ├── Toast.jsx
        ├── ConfirmModal.jsx
        ├── MembreSelector.jsx
        ├── RemplModal.jsx
        ├── PieceCard.jsx
        ├── VueTableau.jsx
        ├── VueKilometrage.jsx
        ├── VuePieces.jsx
        ├── VueJournal.jsx
        └── VueConfig.jsx
```

---

## ⚡ Fonctionnalités Supabase utilisées

| Fonctionnalité | Usage |
|---|---|
| **Auth** | Connexion/inscription par email + JWT |
| **Database** | PostgreSQL avec Row Level Security |
| **Realtime** | Mises à jour instantanées entre membres |
| **Triggers** | Création automatique du profil à l'inscription |

---

## 🔒 Sécurité

- **Row Level Security (RLS)** activée sur toutes les tables
- Les données sont partitionnées par `famille_id`
- Les tokens JWT expirent et sont rafraîchis automatiquement
- Ne jamais exposer la `service_role` key côté frontend

---

## ✉️ Notifications Email (EmailJS)

1. Créer un compte sur [emailjs.com](https://emailjs.com) (gratuit)
2. Ajouter un service (Gmail, Outlook…)
3. Créer un template avec : `{{to_email}}` `{{subject}}` `{{message}}`
4. Saisir les identifiants dans l'onglet **✉ Email** de l'app

---

## 🛠️ Technologies

| Outil | Version | Rôle |
|---|---|---|
| React | 18 | Interface utilisateur |
| Vite | 5 | Bundler + dev server |
| Tailwind CSS | 3 | Styles utilitaires |
| Supabase | 2 | Auth + DB + Realtime |
| EmailJS | 4 | Notifications email |
=======
# CarMileAge
>>>>>>> f73b8f5a2ae19454a86dc9d04c58fa2084332157
