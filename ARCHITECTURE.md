# Architecture de l'API

Ce document décrit l'architecture technique de l'API d'authentification.

## 📁 Structure du projet

```
tp_nodejs/
├── config/                    # Configuration
│   ├── database.js            # Configuration Sequelize
│   ├── jwt.js                 # Configuration JWT
│   ├── email.js               # Configuration Nodemailer
│   └── oauth.js               # Configuration OAuth
│
├── controllers/               # Controllers (logique métier)
│   ├── authController.js      # Authentification de base
│   ├── verificationController.js  # Vérification email
│   ├── passwordResetController.js   # Réinitialisation mot de passe
│   ├── oauthController.js     # OAuth (Google, GitHub)
│   ├── twoFactorController.js # 2FA TOTP
│   ├── sessionController.js   # Gestion des sessions
│   └── userController.js      # Profil utilisateur
│
├── middlewares/               # Middlewares Express
│   ├── auth.js                # Authentification JWT
│   ├── rateLimiter.js         # Rate limiting
│   ├── validation.js          # Validation Joi
│   ├── errorHandler.js        # Gestion des erreurs
│   └── security.js            # Helmet, CORS
│
├── models/                    # Modèles Sequelize
│   ├── User.js                # Modèle utilisateur
│   ├── OAuthAccount.js        # Comptes OAuth
│   ├── RefreshToken.js        # Refresh tokens
│   ├── BlacklistedAccessToken.js  # Access tokens révoqués
│   ├── VerificationToken.js   # Tokens de vérification
│   ├── PasswordResetToken.js  # Tokens de réinitialisation
│   ├── LoginHistory.js        # Historique des connexions
│   └── index.js               # Relations entre modèles
│
├── routes/                    # Routes Express
│   ├── auth.js                # Routes d'authentification
│   ├── sessions.js            # Routes de sessions
│   └── user.js                # Routes utilisateur
│
├── utils/                     # Utilitaires
│   ├── jwt.js                 # Fonctions JWT
│   ├── twoFactor.js           # Fonctions 2FA TOTP
│   ├── emailTemplates.js      # Templates d'emails HTML
│   └── requestHelpers.js      # Helpers pour requêtes
│
├── server.js                  # Point d'entrée
├── package.json               # Dépendances
└── README.md                  # Documentation
```

## 🔄 Flux de données

### Inscription
```
Client → POST /api/auth/register
  ↓
Validation (Joi)
  ↓
Rate Limiting
  ↓
Controller: Création User
  ↓
Hashage password (bcrypt hook)
  ↓
Génération VerificationToken
  ↓
Envoi email
  ↓
Génération Access + Refresh tokens
  ↓
Création RefreshToken en DB
  ↓
Response: User + Tokens
```

### Connexion
```
Client → POST /api/auth/login
  ↓
Validation + Rate Limiting
  ↓
Recherche User par email
  ↓
Enregistrement LoginHistory (échec)
  ↓
Vérification password (bcrypt)
  ↓
Vérification 2FA activé ?
  ├─ Oui → TempToken + requires2FA
  └─ Non → Access + Refresh tokens
  ↓
Enregistrement LoginHistory (succès)
  ↓
Response: Tokens ou TempToken
```

### Refresh Token
```
Client → POST /api/auth/refresh
  ↓
Vérification RefreshToken (JWT)
  ↓
Recherche RefreshToken en DB
  ↓
Vérification validité (non révoqué, non expiré)
  ↓
Vérification User (existe, non désactivé)
  ↓
Génération nouveau AccessToken
  ↓
Response: AccessToken
```

### Vérification 2FA
```
Client → POST /api/auth/2fa/verify
  ↓
Vérification TempToken
  ↓
Vérification code TOTP
  ↓
Génération Access + Refresh tokens
  ↓
Création RefreshToken en DB
  ↓
Response: Tokens
```

## 🗄️ Modèle de données

### Relations

```
User (1) ──< (N) OAuthAccount
User (1) ──< (N) RefreshToken
User (1) ──< (N) BlacklistedAccessToken
User (1) ──< (N) VerificationToken
User (1) ──< (N) PasswordResetToken
User (1) ──< (N) LoginHistory
```

### Contraintes

- `User.email` : UNIQUE
- `OAuthAccount(provider, providerId)` : UNIQUE
- `RefreshToken.token` : UNIQUE
- `BlacklistedAccessToken.token` : UNIQUE
- `VerificationToken.token` : UNIQUE
- `PasswordResetToken.token` : UNIQUE

## 🔐 Middleware Chain

### Route protégée typique
```
Request
  ↓
Helmet (headers sécurité)
  ↓
CORS
  ↓
Body Parser
  ↓
Rate Limiting
  ↓
Validation (Joi)
  ↓
Authenticate (JWT)
  ↓
Controller
  ↓
Response
```

### Route publique
```
Request
  ↓
Helmet
  ↓
CORS
  ↓
Body Parser
  ↓
Rate Limiting (stricte pour auth)
  ↓
Validation
  ↓
Controller
  ↓
Response
```

## 🛠️ Technologies utilisées

### Backend
- **Node.js** : Runtime JavaScript
- **Express** : Framework web
- **Sequelize** : ORM pour MySQL
- **MySQL2** : Driver MySQL

### Sécurité
- **bcryptjs** : Hashage des mots de passe
- **jsonwebtoken** : Génération/vérification JWT
- **helmet** : Headers de sécurité
- **express-rate-limit** : Rate limiting
- **joi** : Validation des données

### Authentification
- **passport** : Middleware d'authentification
- **passport-google-oauth20** : OAuth Google
- **passport-github2** : OAuth GitHub
- **speakeasy** : Génération/vérification TOTP
- **qrcode** : Génération QR codes

### Email
- **nodemailer** : Envoi d'emails SMTP

## 📡 Endpoints par catégorie

### Authentification (`/api/auth`)
- `POST /register` : Inscription
- `POST /login` : Connexion
- `POST /logout` : Déconnexion
- `POST /refresh` : Rafraîchir token
- `POST /change-password` : Changer mot de passe
- `POST /send-verification` : Renvoyer email vérification
- `POST /verify` : Vérifier email
- `POST /forgot-password` : Mot de passe oublié
- `POST /reset-password` : Réinitialiser mot de passe
- `GET /oauth/:provider` : Démarrage OAuth
- `GET /oauth/callback/:provider` : Callback OAuth
- `POST /2fa/enable` : Activer 2FA
- `POST /2fa/disable` : Désactiver 2FA
- `POST /2fa/verify` : Vérifier code 2FA

### Sessions (`/api/sessions`)
- `GET /` : Liste des sessions
- `DELETE /:id` : Révoquer une session
- `DELETE /others/revoke` : Révoquer autres sessions

### Utilisateur (`/api/me`)
- `GET /` : Profil utilisateur
- `PATCH /` : Modifier profil
- `DELETE /` : Supprimer compte
- `GET /history` : Historique des connexions

## 🔄 Gestion des erreurs

### Hiérarchie des erreurs
```
Error
  ↓
SequelizeValidationError → 400
  ↓
SequelizeUniqueConstraintError → 409
  ↓
JsonWebTokenError → 401
  ↓
TokenExpiredError → 401
  ↓
Error générique → 500
```

### Format de réponse d'erreur
```json
{
  "success": false,
  "message": "Message d'erreur",
  "errors": [
    {
      "field": "email",
      "message": "Email invalide"
    }
  ]
}
```

## 🧹 Nettoyage automatique

### Tâches programmées
- **Nettoyage des tokens expirés** : Toutes les heures
  - `BlacklistedAccessToken` (expirés)
  - `VerificationToken` (expirés)
  - `PasswordResetToken` (expirés)

### Optimisations futures
- Nettoyage des `LoginHistory` anciens (> 1 an)
- Archivage des sessions révoquées
- Compression des logs

## 📊 Performance

### Optimisations
- **Pool de connexions** : Sequelize avec pool configuré
- **Indexes** : Sur les colonnes fréquemment recherchées
- **Rate limiting** : Protection contre la surcharge
- **Validation précoce** : Validation avant traitement

### Métriques à surveiller
- Temps de réponse des endpoints
- Taux d'erreur
- Utilisation de la base de données
- Nombre de requêtes par seconde

## 🚀 Déploiement

### Variables d'environnement requises
- `NODE_ENV` : `production` ou `development`
- `PORT` : Port du serveur
- `DB_*` : Configuration base de données
- `JWT_SECRET` : Secret pour JWT
- `SMTP_*` : Configuration email
- `OAUTH_*` : Configuration OAuth

### Checklist production
- [ ] `JWT_SECRET` fort et aléatoire
- [ ] HTTPS activé
- [ ] CORS configuré pour le domaine frontend
- [ ] Base de données en production
- [ ] SMTP configuré et testé
- [ ] OAuth callbacks configurés
- [ ] Logs configurés
- [ ] Monitoring activé
- [ ] Backup automatique

