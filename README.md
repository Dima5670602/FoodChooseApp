# FoodChooseApp

Plateforme de gestion des repas d'entreprise — construite pour simplifier le quotidien des employés et des responsables de commande.

---

## C'est quoi exactement ?

FoodChooseApp met en relation des entreprises, leurs employés et des restaurants partenaires. Chaque matin, l'employé se connecte, choisit son repas dans le menu du jour, et c'est tout. Le reste — validation, facturation, reminders — est géré automatiquement.

Le flux de base ressemble à ça :

```
Une entreprise s'inscrit
  → elle s'affilie aux restaurants qu'elle veut proposer à ses employés
  → elle crée les comptes de ses employés (ils reçoivent leur ID + mot de passe par email)
  → chaque matin, l'employé choisit son repas
  → l'admin valide, le restaurant confirme, la facture part
```

---

## Stack technique

- **Backend** : Node.js / Express — tout le serveur tient dans `api/index.js`
- **Base de données** : PostgreSQL (testé sur Neon, compatible Supabase ou auto-hébergé)
- **Auth** : JWT (8h) + bcryptjs
- **Emails** : Nodemailer via Gmail SMTP
- **Tâches planifiées** : node-cron (rappels quotidiens)
- **PDF** : PDFKit
- **Frontend** : HTML/CSS/JS vanilla — aucun framework, tout dans `public/`

---

## Installation

```bash
npm install
cp .env.example .env
# remplir le .env avec vos valeurs
npm run dev
```

La base de données se crée toute seule au premier démarrage.

---

## Variables d'environnement

```env
# PostgreSQL
DATABASE_URL=postgresql://user:password@host:5432/foodchooseappdb?sslmode=require

# Sécurité
JWT_SECRET=une_cle_aleatoire_de_64_caracteres_minimum
ADMIN_USER=admin
ADMIN_PASSWORD=votre_mot_de_passe_admin

# Employés
DEFAULT_EMPLOYEE_PASSWORD=MotDePasseProvisoire123

# Email (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx

# Serveur
PORT=3050
NODE_ENV=development
```

Pour le mot de passe Gmail : Compte Google → Sécurité → Validation en 2 étapes → Mots de passe d'application.

---

## Qui se connecte où

| Rôle | URL |
|------|-----|
| Restaurant | `/restaurant/login` |
| Entreprise | `/company/login` → onglet Entreprise |
| Admin (chargé de commande) | `/company/login` → onglet Administrateur |
| Employé | `/employee` |

L'admin se connecte avec `admin` + son mot de passe + l'email de son entreprise. C'est le chargé de commande côté entreprise — pas un super-admin global.

---

## Ce que fait chaque espace

### Restaurant

Le restaurant gère ses menus (plats, boissons, snacks...), consulte les commandes reçues par entreprise, génère ses factures en PDF et les envoie directement par email. Il y a aussi un chat avec les entreprises affiliées et un espace pour voir les avis laissés sur ses plats.

### Admin / Entreprise

L'admin voit les commandes du jour, valide et exporte en PDF, gère les affiliations avec les restaurants, crée les comptes employés, suit les dépenses et consulte l'historique. Les comptes employés sont créés avec un ID généré automatiquement depuis le prénom et le nom :

```
Jean Dupont     → JDUP-001
Marie Coulibaly → MCOU-002
```

L'admin peut modifier l'ID avant de valider la création.

### Employé

L'employé choisit son repas, peut noter les plats, consulter son historique de commandes et modifier sa photo de profil ou son mot de passe.

---

## Emails automatiques

La plateforme envoie des emails dans plusieurs situations :

- **Bienvenue** — à l'inscription d'une entreprise ou d'un restaurant
- **Création de compte employé** — l'employé reçoit son ID et son mot de passe provisoire
- **Commande validée** — notification au restaurant
- **Facture** — envoyée à l'entreprise avec le détail des commandes
- **Code OTP** — pour la récupération de mot de passe (valable 15 minutes)
- **Rappel repas** — aux employés qui n'ont pas encore commandé (voir ci-dessous)

---

## Rappels automatiques

Tous les jours du lundi au vendredi, les employés qui n'ont pas encore fait leur choix reçoivent un email de rappel à 9h, 10h et 11h (fuseau Africa/Abidjan). Dès qu'un employé commande, il ne reçoit plus de rappel pour la journée.

---

## Récupération de mot de passe

Disponible sur toutes les pages de connexion. L'utilisateur entre son email, reçoit un code à 6 chiffres valable 15 minutes, le saisit, puis définit un nouveau mot de passe. Ça fonctionne pour les entreprises, les restaurants et les employés.

---

## Structure des fichiers

```
foodchooseapp/
├── api/
│   └── index.js              ← tout le backend est ici
├── public/
│   ├── index.html            ← page d'accueil
│   ├── assets/
│   │   ├── css/main.css      ← design system partagé
│   │   └── js/utils.js       ← fonctions communes (auth, toast, notifications...)
│   ├── company/
│   │   ├── register.html
│   │   ├── login.html
│   │   └── admin.html
│   ├── restaurant/
│   │   ├── register.html
│   │   ├── login.html
│   │   └── dashboard.html
│   └── employee/
│       └── index.html
├── .env
├── package.json
└── vercel.json
```

---

## Base de données

Les tables sont créées automatiquement. En résumé :

- `companies`, `restaurants`, `users` — les trois types de comptes
- `affiliations` — quelle entreprise travaille avec quel restaurant
- `menus`, `orders`, `order_batches` — la gestion des repas
- `invoices`, `order_history` — facturation et traçabilité
- `messages`, `notifications` — communication en temps réel
- `ratings` — avis sur les plats
- `password_resets` — codes OTP (nettoyés après usage)
- `deletion_feedback` — retour d'expérience lors de la suppression d'un compte

---

## API

### Auth (public)
```
POST /api/auth/company/register
POST /api/auth/company/login
POST /api/auth/restaurant/register
POST /api/auth/restaurant/login
POST /api/auth/admin/login
POST /api/auth/employee/login
POST /api/auth/forgot-password
POST /api/auth/verify-otp
POST /api/auth/reset-password
```

### Restaurant
```
GET  /api/restaurant/profile
PUT  /api/restaurant/profile
PUT  /api/restaurant/password
GET  /api/restaurant/menus
POST /api/restaurant/menus
PUT  /api/restaurant/menus/:id/toggle
DELETE /api/restaurant/menus/:id
GET  /api/restaurant/orders
GET  /api/restaurant/stats
DELETE /api/restaurant/account
```

### Admin / Entreprise
```
GET  /api/admin/stats
GET  /api/admin/employees
POST /api/admin/employees
DELETE /api/admin/employees/:id
GET  /api/admin/all-restaurants
GET  /api/admin/affiliations
POST /api/admin/affiliations
DELETE /api/admin/affiliations/:id
GET  /api/admin/orders
GET  /api/admin/invoices
GET  /api/admin/company-profile
PUT  /api/admin/company-profile
PUT  /api/company/password
```

### Employé
```
GET  /api/employee/restaurants
GET  /api/employee/restaurants/:id/menus
GET  /api/employee/order
POST /api/employee/order
PUT  /api/employee/order/:id
DELETE /api/employee/order/:id
GET  /api/employee/profile
PUT  /api/employee/profile
```

---

## Déploiement

### Vercel + Neon (option gratuite)

1. Créer une base sur [neon.tech](https://neon.tech), copier l'URL de connexion
2. Pousser le projet sur GitHub
3. Importer sur Vercel → ajouter les variables d'environnement → déployer
4. La DB s'initialise au premier appel

### VPS avec PM2

```bash
npm install --production
npm install -g pm2
pm2 start api/index.js --name foodchooseapp
pm2 save && pm2 startup
```

---

## Sécurité

- Mots de passe hashés (bcryptjs, salt 10)
- JWT avec expiration 8h
- Codes OTP à usage unique, expirés après 15 minutes
- Aucun credential visible dans l'interface
- Variables sensibles dans `.env` (non versionné)
- SSL activé sur la connexion PostgreSQL en production

---

Développé par L'Ingénieur Mahamadi TASSEMBEDO — El Immeka International · 2026
