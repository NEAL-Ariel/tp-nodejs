# API REST d'Authentification - NodeJS + Express

Projet d'authentification complète avec plusieurs méthodes de connexion en NodeJS.

## 👥 Membres du groupe (Partie 5 - Aimé)

- Authentification basic (inscription, connexion, etc.)
- Authentification OAuth (Google/GitHub)
- Authentification à deux facteurs (2FA)
- Gestion des sessions

---

## 🚀 Technologies utilisées

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **SQLite** - Base de données
- **JWT** - Authentification par tokens
- **bcryptjs** - Hashage des mots de passe
- **Nodemailer** - Envoi d'emails
- **speakeasy** - 2FA TOTP
- **qrcode** - Génération de QR codes

---

## 📂 Structure du projet

```
aime-tp/
├── config/
│   └── db.js                 # Configuration SQLite
├── routes/
│   ├── auth.js              # Routes d'authentification de base
│   ├── sessions.js          # Gestion des sessions
│   ├── oauth.js             # OAuth (Google/GitHub)
│   └── twofa.js             # 2FA TOTP
├── services/
│   ├── auth.service.js      # Logique d'authentification
│   ├── jwt.service.js       # Gestion des JWT
│   ├── email.service.js     # Envoi d'emails
│   ├── oauth.service.js     # Logique OAuth
│   └── twofa.service.js     # Logique 2FA
├── index.js                 # Point d'entrée
├── package.json
├── .env                     # Variables d'environnement
└── ROUTES.md                # Documentation des routes
```

---

## ⚙️ Installation

### 1️⃣ Cloner le projet

```bash
git clone <repository>
cd aime-tp
```

### 2️⃣ Installer les dépendances

```bash
npm install
```

### 3️⃣ Configurer les variables d'environnement

Créez un fichier `.env` (exemple ci-dessous):

```env
# Base de données
DB_PATH=./auth.db

# JWT
JWT_SECRET=your_super_secret_key_change_in_production_12345
JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_TOKEN_EXPIRY=7d

# Email (Nodemailer)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@auth-api.com

# Server
PORT=3000
NODE_ENV=development

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 4️⃣ Lancer le serveur

```bash
node index.js
```

Le serveur démarre sur `http://localhost:3000`

---

## 🔐 Fonctionnalités implémentées

### ✅ Authentification de Base

- ✅ Inscription avec vérification d'email
- ✅ Connexion (avec email/mot de passe)
- ✅ Déconnexion
- ✅ Refresh token (renouvellement du token d'accès)
- ✅ Mot de passe oublié (envoi d'email)
- ✅ Réinitialisation du mot de passe
- ✅ Changement de mot de passe

### ✅ Vérification Email

- ✅ Envoi du token de vérification
- ✅ Vérification du compte par email
- ✅ Renvoi de l'email de vérification

### ⚠️ Authentification OAuth

- ⚠️ Routes implémentées (nécessite config OAuth provider)

### ⚠️ Authentification à Deux Facteurs (2FA)

- ✅ Activation du 2FA (QR Code)
- ✅ Vérification du code TOTP
- ✅ Désactivation du 2FA

### ⚠️ Gestion des Sessions

- ⚠️ Routes implémentées (nécessite intégration avec JWT)

---

## 📚 Documentation des Routes

Voir le fichier [ROUTES.md](./ROUTES.md) pour la documentation complète des endpoints.

### Exemples rapides

**Inscription:**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d {
    "email": "user@example.com",
    "password": "SecurePassword123",
    "firstName": "Jean",
    "lastName": "Dupont"
  }
```

**Connexion:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d {
    "email": "user@example.com",
    "password": "SecurePassword123"
  }
```

---

## 🗄️ Base de Données

La BD SQLite inclut les tables suivantes:

- **users** - Utilisateurs
- **oauth_accounts** - Comptes liés (OAuth)
- **refresh_tokens** - Sessions actives (whitelist)
- **blacklisted_access_tokens** - Access tokens révoqués
- **verification_tokens** - Tokens de vérification d'email
- **password_reset_tokens** - Tokens de réinitialisation
- **login_history** - Historique des connexions

---

## 🧪 Tests API

Importez la collection Yaak/Postman incluse pour tester tous les endpoints.

**Fichier collection:** `./postman-collection.json`

---

## 📝 Notes de sécurité

- Les mots de passe sont hashés avec bcryptjs (10 rounds)
- Les tokens JWT utilisent une clé secrète (à changer en production)
- Les refresh tokens sont stockés en whitelist en base de données
- Les access tokens révoqués sont en blacklist
- Les tokens expirent après une période définie
- Les emails sont validés avant la création de compte
- HTTPS est recommandé en production

---

## 🔧 Troubleshooting

### Erreur: "module not found"

```bash
npm install
```

### La BD ne se crée pas

Vérifiez que le chemin DB_PATH dans `.env` est correct et accessible.

### Les emails ne s'envoient pas

- En développement, les emails s'affichent dans la console
- En production, configurez correctement les variables d'email

---

## 📅 Deadline

**Rendu final:** Samedi 10 janvier à 00h

---

## 📚 Ressources

- [Express.js Documentation](https://expressjs.com/)
- [JWT Documentation](https://jwt.io/)
- [bcryptjs](https://www.npmjs.com/package/bcryptjs)
- [Nodemailer](https://nodemailer.com/)
- [SQLite](https://www.sqlite.org/)

---

**Projet EN COURS** - Authentification de base complétée ✅
