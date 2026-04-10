# 🍽️ FoodChooseApp

> **Plateforme de gestion des repas d'entreprise** — Simplifiez la commande de repas pour vos employés, gérez vos affiliations avec les restaurants, et automatisez la facturation.

---

## 📋 Table des matières

- [Présentation](#-présentation)
- [Stack technique](#-stack-technique)
- [Architecture du projet](#-architecture-du-projet)
- [Rôles et accès](#-rôles-et-accès)
- [Fonctionnalités](#-fonctionnalités)
- [Installation et démarrage](#-installation-et-démarrage)
- [Variables d'environnement](#-variables-denvironnement)
- [API Reference](#-api-reference)
- [Déploiement sur Vercel](#-déploiement-sur-vercel)
- [Schéma de base de données](#-schéma-de-base-de-données)

---

## 🎯 Présentation

**FoodChooseApp** est une plateforme B2B de gestion des repas d'entreprise. Elle met en relation les entreprises, leurs employés et les restaurants partenaires au travers d'un flux de commande structuré et automatisé.

L'application repose sur **trois types d'acteurs** : les **entreprises** (qui jouent le rôle d'administrateur pour leur structure), les **restaurants** (partenaires), et les **employés** (qui choisissent leur repas au quotidien).

### Flux de fonctionnement

```
Entreprise                Restaurant
    │                         │
    ├──── s'affilie ──────────►│
    │                         │
    │         Employé          │
    │            │             │
    │◄── choisit son repas ────┤
    │            │             │
    ├── valide la commande ────►│
    │                         │
    │◄── confirme + facture ───┤
    │                         │
    └── facture automatique ──►│
```

1. Une **entreprise** s'affilie à un ou plusieurs restaurants.
2. Les **employés** choisissent leur repas du jour parmi les menus disponibles.
3. L'**entreprise** valide les commandes groupées.
4. Le **restaurant** confirme la commande et envoie la facture PDF.
5. Les **factures** sont générées automatiquement et archivées.

---

## 🛠️ Stack technique

| Couche | Technologie | Rôle |
|---|---|---|
| **Backend** | Node.js + Express | Serveur API REST |
| **Déploiement** | Vercel (serverless) | Hébergement cloud |
| **Base de données** | PostgreSQL (Neon DB) | Stockage des données |
| **Authentification** | JWT (jsonwebtoken) | Sécurisation des routes |
| **Email** | Nodemailer + Gmail SMTP | Notifications et OTP |
| **PDF** | pdfkit | Génération de factures et rapports |
| **Médias** | Cloudinary | Stockage images, fichiers, messages vocaux |
| **Tâches planifiées** | node-cron | Rappels quotidiens automatiques |
| **Frontend** | HTML / CSS / JS vanilla | Interfaces utilisateur légères |

---

## 📁 Architecture du projet

```
foodchooseapp/
│
├── api/
│   └── index.js              ← Point d'entrée du serveur Express (toutes les routes API)
│
├── public/                   ← Fichiers statiques servis par Express
│   ├── index.html            ← Page d'accueil publique
│   │
│   ├── assets/
│   │   ├── css/
│   │   │   └── main.css      ← Styles communs à toutes les pages
│   │   └── js/
│   │       └── utils.js      ← Utilitaires JavaScript partagés
│   │
│   ├── company/              ← Interface entreprise
│   │   ├── admin.html        ← Dashboard entreprise (employés, commandes, affiliations...)
│   │   ├── register.html     ← Inscription entreprise
│   │   └── login.html        ← Connexion entreprise
│   │
│   ├── restaurant/           ← Interface restaurant
│   │   ├── dashboard.html    ← Dashboard restaurant (menus, commandes, factures, stats)
│   │   ├── register.html     ← Inscription restaurant
│   │   └── login.html        ← Connexion restaurant
│   │
│   └── employee/             ← Interface employé
│       └── index.html        ← Choix du repas du jour
│
├── schema.sql                ← Schéma complet de la base de données
├── package.json              ← Dépendances et scripts npm
├── vercel.json               ← Configuration de déploiement Vercel
└── .env                      ← Variables d'environnement (ne pas versionner !)
```

---

## 👥 Rôles et accès

L'application distingue trois types d'utilisateurs, chacun avec ses propres droits et son interface dédiée. Il n'existe plus de rôle « administrateur » distinct : **l'entreprise est désormais son propre administrateur**.

### 🏢 `company` — Entreprise (Administrateur)

L'entreprise gère l'intégralité de sa structure :

- S'affilie à des restaurants partenaires (voir et gérer les affiliations)
- **Crée et gère les comptes employés** (ajout, suppression)
- Visualise les commandes de tous ses employés
- **Recherche les commandes sur une période donnée** (de date1 à date2) avec filtre restaurant
- Valide les commandes groupées à envoyer aux restaurants
- **Télécharge ou imprime un rapport PDF** des commandes de la période sélectionnée
- Consulte les factures reçues des restaurants
- Suit l'historique complet des consommations
- Communique avec les restaurants via la messagerie interne

### 🍴 `restaurant` — Gérant de restaurant

- Gère ses menus (création, modification, suppression, activation/désactivation de plats)
- **Ajoute de nouvelles spécialités culinaires** personnalisées dans son profil
- Reçoit les commandes des entreprises affiliées
- **Recherche les commandes par période** (date1 à date2) avec filtre optionnel par client (entreprise) : toutes les commandes de toutes les entreprises sur la période, ou filtrées pour une entreprise précise, triées et datées
- **Télécharge ou imprime un rapport PDF** des commandes
- Confirme les commandes reçues
- Génère et envoie les factures PDF
- **Vue d'ensemble du budget** : revenu total de toutes les commandes (suivi des bénéfices)
- **Top 3 des meilleurs clients** (entreprises par chiffre d'affaires)
- Note moyenne et avis clients sur les plats
- Communique avec les entreprises via la messagerie interne

### 👤 `employee` — Employé d'une entreprise

- Se connecte avec ses identifiants fournis par son entreprise
- Consulte les menus des restaurants affiliés à son entreprise
- Choisit et passe sa commande de repas du jour
- Reçoit des rappels automatiques par email s'il n'a pas commandé
- Note les plats commandés (1 à 5 étoiles)
- Modifie ou annule sa commande du jour (tant qu'elle est en attente)

---

## ✨ Fonctionnalités

### 🔐 Authentification & Sécurité

- Inscription et connexion par rôle (restaurant, entreprise, employé)
- Authentification JWT avec tokens sécurisés (8h d'expiration)
- Récupération de mot de passe par code OTP à 6 chiffres envoyé par email (15 min)
- Mot de passe employé par défaut configurable via variable d'environnement

### 🍕 Gestion des menus (restaurant)

- Création, modification et suppression de plats
- Upload d'images des plats via Cloudinary
- Activation / désactivation d'un plat sans le supprimer
- Catégories : plat principal, boisson, snack, dessert, petit-déjeuner
- Notation des plats par les employés (1 à 5 étoiles)

### 🧑‍🍳 Profil restaurant — Spécialités personnalisées

- Sélection parmi une liste de spécialités prédéfinies (cuisines africaines, européenne, asiatique, etc.)
- **Ajout de spécialités personnalisées** : le restaurant peut saisir librement toute nouvelle spécialité et la sauvegarder dans son profil

### 🤝 Affiliation entreprise ↔ restaurant

- Une entreprise peut s'affilier à plusieurs restaurants
- Les menus des restaurants affiliés sont visibles par les employés
- Gestion complète des affiliations depuis le dashboard entreprise

### 📦 Cycle de vie des commandes

```
Employé choisit → Commande créée (pending)
       ↓
Entreprise valide → Commande groupée envoyée au restaurant (validated)
       ↓
Restaurant confirme → Commande en préparation (confirmed)
       ↓
Restaurant facture → Facture PDF générée et envoyée (invoiced)
```

**Statuts d'une commande :**

| Statut | Description |
|---|---|
| `pending` | En attente de validation par l'entreprise |
| `validated_by_admin` | Validée par l'entreprise, envoyée au restaurant |
| `confirmed` | Confirmée par le restaurant |
| `invoiced` | Facturée |

### 🔍 Recherche de commandes par période

**Côté entreprise :**
- Sélection d'une plage de dates (de date1 à date2) + filtre restaurant optionnel
- Affichage de toutes les commandes groupées par restaurant sur la période
- Colonne « Date » affichée pour distinguer chaque jour quand la période couvre plusieurs jours
- Export PDF ou impression directe du rapport

**Côté restaurant :**
- Sélection d'une plage de dates (de date1 à date2) + filtre client (entreprise) optionnel
- Sans filtre client : liste de toutes les commandes de toutes les entreprises sur la période, groupées par entreprise
- Avec filtre client : uniquement les commandes de l'entreprise sélectionnée, datées et listées
- Export PDF ou impression directe

### 💰 Vue budget restaurant

- **Revenu du mois** affiché dans le tableau de bord
- **Revenu de la semaine** affiché dans la section statistiques
- **Budget total** (tous revenus depuis le début) pour suivre les bénéfices globaux

### 🏆 Top 3 des meilleurs clients (restaurant)

Affiché dans le tableau de bord du restaurant :
- Classement des 3 entreprises ayant généré le plus de chiffre d'affaires
- Montant total par entreprise

### 📄 Export PDF

- Génération de factures PDF par le restaurant (via pdfkit)
- Export de rapports de commandes par période pour les entreprises et les restaurants
- En-tête coloré, tableau paginé, total en bas de page

### 💬 Messagerie instantanée

- Échanges en temps réel entre entreprise et restaurant
- Support des **messages texte**, **messages vocaux** et **fichiers joints** (images, PDF, vidéos ≤ 30s)
- Stockage des médias sur Cloudinary (CDN), avec fallback base64 local

### 🔔 Notifications

- Notifications in-app consultables depuis n'importe quel dashboard
- Notifications par email pour les événements importants (validation, confirmation, nouvelle facture, nouveau message)
- Badge de compteur non lues en temps réel (polling toutes les 6s)

### ⏰ Rappels automatiques (node-cron)

Les employés qui n'ont pas encore passé de commande reçoivent un email de rappel automatiquement :

- **9h00** — Premier rappel
- **10h00** — Deuxième rappel
- **11h00** — Dernier rappel (email)

Dès qu'un employé commande, il cesse de recevoir des rappels pour la journée.

### 📊 Statistiques et historique

- Tableau de bord avec statistiques clés pour chaque rôle
- Historique complet des commandes des employés (consultable par l'entreprise)
- Graphique en barres des commandes sur 30 jours (restaurant)

---

## 🚀 Installation et démarrage

### Prérequis

- [Node.js](https://nodejs.org/) v18 ou supérieur
- Un compte [Neon DB](https://neon.tech/) (PostgreSQL cloud) ou une instance PostgreSQL locale
- Un compte [Cloudinary](https://cloudinary.com/) pour le stockage des médias
- Un compte Gmail avec un [mot de passe d'application](https://support.google.com/accounts/answer/185833) SMTP

### 1. Cloner le projet

```bash
git clone https://github.com/votre-utilisateur/foodchooseapp.git
cd foodchooseapp
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

Créez votre fichier `.env` à la racine et renseignez vos valeurs (voir la section [Variables d'environnement](#-variables-denvironnement)).

### 4. Initialiser la base de données

Connectez-vous à votre instance PostgreSQL et exécutez le schéma :

```bash
psql -h <host> -U <user> -d <database> -f schema.sql
```

Ou depuis l'interface Neon DB, collez le contenu de `schema.sql` dans l'éditeur SQL.

### 5. Lancer le serveur en développement

```bash
npm run dev
```

Le serveur démarre avec **nodemon** (rechargement automatique) sur le port configuré dans `.env` (par défaut `3050`).

### 6. Accéder aux interfaces

| Interface | URL |
|---|---|
| Page d'accueil | http://localhost:3050 |
| Connexion entreprise | http://localhost:3050/company/login.html |
| Dashboard entreprise | http://localhost:3050/company/admin.html |
| Connexion restaurant | http://localhost:3050/restaurant/login.html |
| Dashboard restaurant | http://localhost:3050/restaurant/dashboard.html |
| Interface employé | http://localhost:3050/employee/index.html |

---

## 🔧 Variables d'environnement

Créez un fichier `.env` à la racine du projet avec les variables suivantes :

```env
# ─── Base de données ───────────────────────────────────────────────────────────
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# ─── Authentification ──────────────────────────────────────────────────────────
JWT_SECRET=votre_secret_jwt_tres_long_et_aleatoire
DEFAULT_EMPLOYEE_PASSWORD=MotDePasseParDefaut123

# ─── Email (Gmail SMTP) ────────────────────────────────────────────────────────
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre.adresse@gmail.com
SMTP_PASS=votre_mot_de_passe_application_gmail

# ─── Serveur ───────────────────────────────────────────────────────────────────
PORT=3050
NODE_ENV=development
APP_URL=http://localhost:3050

# ─── Cloudinary (stockage médias) ─────────────────────────────────────────────
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret
```

> ⚠️ **Important** : Ne commitez jamais le fichier `.env` dans votre dépôt Git. Ajoutez-le à votre `.gitignore`.

### Obtenir un mot de passe d'application Gmail

1. Activez la validation en deux étapes sur votre compte Google.
2. Rendez-vous sur [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords).
3. Créez un nouveau mot de passe d'application pour "Mail".
4. Utilisez ce mot de passe de 16 caractères comme valeur de `SMTP_PASS`.

---

## 📡 API Reference

Toutes les routes sont préfixées par `/api`. Les routes protégées nécessitent un header `Authorization: Bearer <token>`.

### 🔐 Authentification

| Méthode | Route | Description | Auth requise |
|---|---|---|---|
| `POST` | `/api/auth/restaurant/register` | Inscription d'un restaurant | ❌ |
| `POST` | `/api/auth/restaurant/login` | Connexion restaurant | ❌ |
| `POST` | `/api/auth/company/register` | Inscription d'une entreprise | ❌ |
| `POST` | `/api/auth/company/login` | Connexion entreprise | ❌ |
| `POST` | `/api/auth/employee/login` | Connexion employé | ❌ |
| `POST` | `/api/auth/forgot-password` | Demande de réinitialisation (OTP) | ❌ |
| `POST` | `/api/auth/verify-otp` | Vérification du code OTP | ❌ |
| `POST` | `/api/auth/reset-password` | Définir un nouveau mot de passe | ❌ |

---

### 🍴 Restaurant

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/api/restaurant/profile` | Profil du restaurant connecté |
| `PUT` | `/api/restaurant/profile` | Modifier le profil (nom, adresse, spécialités, paiements, photo) |
| `PUT` | `/api/restaurant/password` | Modifier le mot de passe |
| `DELETE` | `/api/restaurant/account` | Supprimer le compte |
| `GET` | `/api/restaurant/menus` | Liste des plats du menu |
| `POST` | `/api/restaurant/menus` | Ajouter un plat |
| `PUT` | `/api/restaurant/menus/:id` | Modifier un plat |
| `PUT` | `/api/restaurant/menus/:id/toggle` | Activer / désactiver un plat |
| `DELETE` | `/api/restaurant/menus/:id` | Supprimer un plat |
| `GET` | `/api/restaurant/orders` | Commandes reçues (filtres : `date`, `from`/`to`, `companyId`) |
| `GET` | `/api/restaurant/orders/export-pdf` | Export PDF des commandes (`from`, `to`, `companyId` optionnel) |
| `GET` | `/api/restaurant/companies` | Entreprises affiliées (pour le filtre des commandes) |
| `GET` | `/api/restaurant/batches` | Lots de commandes groupées |
| `PUT` | `/api/restaurant/batches/:id/confirm` | Confirmer un lot de commandes |
| `POST` | `/api/restaurant/batches/:id/invoice` | Générer et envoyer la facture |
| `GET` | `/api/restaurant/stats` | Statistiques (commandes, revenus, top 3 clients, budget total) |
| `GET` | `/api/restaurant/ratings` | Avis et notes reçus |
| `GET` | `/api/restaurant/export-pdf` | Export PDF rapide (période `week` ou `month`) |
| `GET` | `/api/restaurant/conversations` | Liste des conversations avec les entreprises |

**Paramètres de recherche des commandes (`/api/restaurant/orders`) :**

| Paramètre | Type | Description |
|---|---|---|
| `date` | `YYYY-MM-DD` | Commandes d'un jour précis (défaut : aujourd'hui) |
| `from` | `YYYY-MM-DD` | Début de période |
| `to` | `YYYY-MM-DD` | Fin de période |
| `companyId` | `integer` | Filtre par entreprise (optionnel) |

---

### 🏢 Entreprise

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/api/admin/stats` | Statistiques du tableau de bord (employés, commandes, affiliations) |
| `GET` | `/api/admin/employees` | Liste des employés de l'entreprise |
| `POST` | `/api/admin/employees` | Créer un employé (envoi des identifiants par email) |
| `DELETE` | `/api/admin/employees/:id` | Supprimer un employé |
| `GET` | `/api/admin/all-restaurants` | Liste de tous les restaurants disponibles |
| `GET` | `/api/admin/affiliations` | Restaurants affiliés à l'entreprise |
| `POST` | `/api/admin/affiliations` | Créer une nouvelle affiliation |
| `DELETE` | `/api/admin/affiliations/:restaurantId` | Supprimer une affiliation |
| `GET` | `/api/admin/restaurants/:id/menus` | Menus disponibles d'un restaurant |
| `GET` | `/api/admin/orders` | Commandes (filtres : `date`, `from`/`to`, `restaurantId`) |
| `GET` | `/api/admin/orders/export-pdf` | Export PDF des commandes sur une période (`from`, `to`) |
| `POST` | `/api/admin/orders/validate` | Valider les commandes et les envoyer au restaurant |
| `GET` | `/api/admin/invoices` | Historique des factures |
| `GET` | `/api/admin/invoices/:id/pdf` | Télécharger une facture en PDF |
| `GET` | `/api/admin/history` | Historique des consommations (filtres : `from`, `to`, `employeeId`) |
| `GET` | `/api/admin/expenses` | Dépenses par période (`week`, `month`, `quarter`) |
| `GET` | `/api/admin/company-profile` | Profil de l'entreprise |
| `PUT` | `/api/admin/company-profile` | Modifier le logo de l'entreprise |
| `PUT` | `/api/company/password` | Modifier le mot de passe de l'entreprise |
| `GET` | `/api/admin/conversations` | Conversations avec les restaurants |
| `GET` | `/api/admin/search` | Recherche de plats parmi les restaurants affiliés |

**Paramètres de recherche des commandes (`/api/admin/orders`) :**

| Paramètre | Type | Description |
|---|---|---|
| `date` | `YYYY-MM-DD` | Commandes d'un jour précis (défaut : aujourd'hui) |
| `from` | `YYYY-MM-DD` | Début de période |
| `to` | `YYYY-MM-DD` | Fin de période |
| `restaurantId` | `integer` | Filtre par restaurant (optionnel) |

---

### 👤 Employé

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/api/employee/restaurants` | Restaurants disponibles (affiliés à l'entreprise) |
| `GET` | `/api/employee/restaurants/:id/menus` | Menu d'un restaurant |
| `GET` | `/api/employee/order` | Commande(s) du jour |
| `POST` | `/api/employee/order` | Passer une commande |
| `PUT` | `/api/employee/order/:id` | Modifier la commande (si encore en attente) |
| `DELETE` | `/api/employee/order/:id` | Annuler la commande (si encore en attente) |
| `POST` | `/api/employee/ratings` | Noter un plat |
| `GET` | `/api/employee/history` | Historique personnel des commandes |
| `DELETE` | `/api/employee/history` | Vider l'historique |
| `GET` | `/api/employee/profile` | Profil de l'employé |
| `PUT` | `/api/employee/profile` | Modifier le profil (photo, mot de passe) |
| `GET` | `/api/employee/search` | Recherche de plats parmi les restaurants affiliés |

---

### 💬 Messagerie

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/api/messages` | Messages d'une conversation (`companyId`, `restaurantId`) |
| `POST` | `/api/messages` | Envoyer un message (texte, voix, fichier) |
| `PUT` | `/api/messages/read` | Marquer les messages d'une conversation comme lus |
| `GET` | `/api/messages/unread-count` | Nombre de messages non lus |

---

### 🔔 Notifications

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/api/notifications` | Notifications de l'utilisateur connecté |
| `PUT` | `/api/notifications/:id/read` | Marquer une notification comme lue |
| `PUT` | `/api/notifications/read-all` | Marquer toutes les notifications comme lues |

---

## ☁️ Déploiement sur Vercel

### Configuration `vercel.json`

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "api/index.js"
    }
  ]
}
```

Toutes les requêtes (y compris les fichiers statiques) sont redirigées vers `api/index.js`, qui sert les fichiers du dossier `public/` via Express.

### Étapes de déploiement

**1. Installer Vercel CLI**

```bash
npm install -g vercel
```

**2. Se connecter à Vercel**

```bash
vercel login
```

**3. Déployer le projet**

```bash
vercel
```

**4. Configurer les variables d'environnement**

Rendez-vous dans le [dashboard Vercel](https://vercel.com/dashboard) :
- Sélectionnez votre projet
- Allez dans **Settings → Environment Variables**
- Ajoutez chaque variable de votre fichier `.env`
- Mettez `NODE_ENV=production` et renseignez l'URL publique dans `APP_URL`

**5. Déploiement en production**

```bash
vercel --prod
```

### Déploiement alternatif — VPS avec PM2

```bash
npm install --production
npm install -g pm2
pm2 start api/index.js --name foodchooseapp
pm2 save && pm2 startup
```

---

## 🗄️ Schéma de base de données

Le fichier `schema.sql` contient la définition complète de toutes les tables (version 4.0).

### Tables principales

| Table | Description |
|---|---|
| `companies` | Entreprises inscrites (jouent le rôle d'admin pour leurs employés) |
| `restaurants` | Restaurants inscrits (avec spécialités personnalisables en JSONB) |
| `users` | Employés liés à une entreprise |
| `affiliations` | Relations entreprise ↔ restaurant |
| `menus` | Plats proposés par les restaurants |
| `orders` | Commandes individuelles des employés |
| `order_batches` | Commandes groupées envoyées au restaurant |
| `invoices` | Factures générées par les restaurants |
| `order_history` | Journal d'audit immuable des actions sur les commandes |
| `messages` | Messages de la messagerie interne (texte, voix, fichiers) |
| `notifications` | Notifications in-app |
| `ratings` | Notes et avis sur les plats |
| `password_resets` | Codes OTP pour la réinitialisation (usage unique, 15 min) |
| `deletion_feedback` | Retour d'expérience lors de la suppression d'un compte restaurant |

### Aperçu des relations

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   companies     │     │  affiliations   │     │   restaurants   │
│─────────────────│     │─────────────────│     │─────────────────│
│ id              │────►│ company_id      │◄────│ id              │
│ name            │     │ restaurant_id   │     │ name            │
│ email           │     │ created_at      │     │ email           │
│ password_hash   │     └─────────────────┘     │ specialties JSONB│
│ logo_url        │                             │ payment_types   │
└────────┬────────┘                             └────────┬────────┘
         │                                               │
         │  ┌─────────────────┐     ┌─────────────────┐  │
         └─►│     users       │     │     menus       │◄─┘
            │  (employees)    │     │─────────────────│
            │─────────────────│     │ id              │
            │ id              │     │ restaurant_id   │
            │ company_id      │     │ name            │
            │ employee_id     │     │ price           │
            │ password_hash   │     │ category        │
            └────────┬────────┘     └────────┬────────┘
                     │                       │
                     └──────────┬────────────┘
                                ▼
                     ┌─────────────────┐
                     │     orders      │
                     │─────────────────│
                     │ id              │
                     │ user_id         │
                     │ company_id      │
                     │ restaurant_id   │
                     │ menu_id         │
                     │ order_date      │
                     │ status          │
                     └─────────────────┘
```

### Index de performance

| Index | Colonne(s) | Usage |
|---|---|---|
| `idx_orders_company` | `orders(company_id)` | Dashboard entreprise |
| `idx_orders_date` | `orders(order_date)` | Filtrage par date/période |
| `idx_menus_restaurant` | `menus(restaurant_id)` | Affichage du menu |
| `idx_messages_conversation` | `messages(company_id, restaurant_id)` | Chargement d'une conversation |
| `idx_notif_target` | `notifications(target_type, target_id)` | Notifications d'un utilisateur |
| `idx_history_date` | `order_history(order_date)` | Rapports et exports historique |

---

## 📝 Scripts disponibles

```bash
# Démarrage en développement (avec rechargement automatique via nodemon)
npm run dev

# Démarrage en production
npm start
```

---

## 🔒 Sécurité

- Mots de passe hashés avec **bcryptjs** (salt factor 10)
- Tokens **JWT** avec expiration 8h
- Codes **OTP à usage unique**, expirés après 15 minutes
- Aucun rôle administrateur global : chaque entreprise est admin de sa propre structure uniquement
- Variables d'environnement pour tous les credentials
- Connexion PostgreSQL avec **SSL activé** en production

---

## 🤝 Contribution

1. Forkez le projet
2. Créez une branche pour votre fonctionnalité : `git checkout -b feature/ma-fonctionnalite`
3. Commitez vos changements : `git commit -m "feat: ajout de ma fonctionnalité"`
4. Poussez votre branche : `git push origin feature/ma-fonctionnalite`
5. Ouvrez une Pull Request

---

## 📄 Licence

Ce projet est sous licence **MIT**.

---

*Développé avec ❤️ — El Immeka International · 2026*
