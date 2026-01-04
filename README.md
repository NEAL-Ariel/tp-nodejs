# API REST d'Authentification Complète

API REST complète d'authentification avec Node.js et Express, incluant inscription, connexion, OAuth, 2FA, gestion des sessions, et bien plus.

## 🚀 Fonctionnalités

### Authentification de base
- ✅ Inscription avec validation email
- ✅ Connexion avec gestion des sessions
- ✅ Déconnexion avec révocation des tokens
- ✅ Refresh token pour renouveler les access tokens
- ✅ Changement de mot de passe

### Vérification et sécurité
- ✅ Vérification d'email avec tokens temporaires
- ✅ Réinitialisation de mot de passe
- ✅ Authentification à deux facteurs (2FA TOTP)
- ✅ Rate limiting anti brute-force
- ✅ Historique des connexions

### OAuth
- ✅ Authentification Google
- ✅ Authentification GitHub

### Gestion des sessions
- ✅ Liste des sessions actives
- ✅ Révocation de sessions individuelles
- ✅ Révocation de toutes les autres sessions

### Profil utilisateur
- ✅ Consultation du profil
- ✅ Modification du profil
- ✅ Suppression de compte

## 📋 Prérequis

- Node.js (v14 ou supérieur)
- MySQL (v5.7 ou supérieur)
- npm ou yarn

## 🔧 Installation

1. **Cloner le projet et installer les dépendances**
```bash
npm install
```

2. **Configurer les variables d'environnement**

Créez un fichier `.env` à la racine du projet avec le contenu suivant :

```env
# Server
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=auth_db
DB_USER=root
DB_PASSWORD=

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@yourapp.com

# OAuth Google
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/oauth/callback/google

# OAuth GitHub
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=http://localhost:3000/api/auth/oauth/callback/github

# App URLs
FRONTEND_URL=http://localhost:3000
API_BASE_URL=http://localhost:3000/api

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=5
```

3. **Créer la base de données MySQL**

```sql
CREATE DATABASE auth_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

4. **Démarrer le serveur**

```bash
# Mode développement (avec nodemon)
npm run dev

# Mode production
npm start
```

Le serveur démarre sur `http://localhost:3000`

## 📚 Structure du projet

```
tp_nodejs/
├── config/              # Configuration (DB, JWT, Email, OAuth)
├── controllers/          # Controllers pour chaque route
├── middlewares/          # Middlewares (auth, validation, rate limiting)
├── models/              # Modèles Sequelize
├── routes/              # Définition des routes
├── utils/               # Utilitaires (JWT, 2FA, email templates)
├── server.js            # Point d'entrée de l'application
└── package.json
```

## 🔐 Architecture de sécurité

### JWT (JSON Web Tokens)
- **Access Token** : Durée de vie courte (15 minutes par défaut)
- **Refresh Token** : Durée de vie longue (7 jours par défaut)
- **Whitelist** : Refresh tokens stockés en base de données
- **Blacklist** : Access tokens révoqués avant expiration

### Mots de passe
- Hashage avec **bcrypt** (10 rounds)
- Minimum 8 caractères requis
- Hashage automatique avant sauvegarde

### Rate Limiting
- **Authentification** : 5 tentatives par 15 minutes
- **Emails** : 3 emails par heure
- **Général** : 100 requêtes par 15 minutes

### 2FA (TOTP)
- Compatible avec Google Authenticator
- Génération de QR codes
- Fenêtre de validation de ±2 périodes (60 secondes)

## 📡 Endpoints de l'API

### Authentification

#### POST `/api/auth/register`
Inscription d'un nouvel utilisateur.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Inscription réussie. Un email de vérification a été envoyé.",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "emailVerified": false
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

#### POST `/api/auth/login`
Connexion d'un utilisateur.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (sans 2FA):**
```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "user": { ... },
    "tokens": { ... }
  }
}
```

**Response (avec 2FA):**
```json
{
  "success": true,
  "message": "Vérification 2FA requise",
  "requires2FA": true,
  "tempToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST `/api/auth/logout`
Déconnexion (blacklist le access token).

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST `/api/auth/refresh`
Rafraîchit l'access token.

**Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST `/api/auth/change-password`
Change le mot de passe de l'utilisateur connecté.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Body:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword123"
}
```

### Vérification d'email

#### POST `/api/auth/send-verification`
Renvoie un email de vérification.

**Headers:**
```
Authorization: Bearer <accessToken>
```

#### POST `/api/auth/verify`
Vérifie l'email avec un token.

**Body:**
```json
{
  "token": "abc123..."
}
```

### Mot de passe oublié

#### POST `/api/auth/forgot-password`
Envoie un email de réinitialisation.

**Body:**
```json
{
  "email": "user@example.com"
}
```

#### POST `/api/auth/reset-password`
Réinitialise le mot de passe avec un token.

**Body:**
```json
{
  "token": "abc123...",
  "newPassword": "newPassword123"
}
```

### OAuth

#### GET `/api/auth/oauth/:provider`
Démarre l'authentification OAuth (Google ou GitHub).

**Exemple:**
```
GET /api/auth/oauth/google
GET /api/auth/oauth/github
```

Redirige vers le provider OAuth.

#### GET `/api/auth/oauth/callback/:provider`
Callback OAuth après authentification.

Redirige vers le frontend avec les tokens.

### 2FA

#### POST `/api/auth/2fa/enable`
Active l'authentification à deux facteurs.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Body (première étape - génération):**
```json
{}
```

**Response:**
```json
{
  "success": true,
  "message": "Scannez le QR code avec votre application d'authentification",
  "data": {
    "secret": "JBSWY3DPEHPK3PXP",
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "manualEntryKey": "JBSWY3DPEHPK3PXP"
  }
}
```

**Body (deuxième étape - activation):**
```json
{
  "token": "123456"
}
```

#### POST `/api/auth/2fa/disable`
Désactive l'authentification à deux facteurs.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Body:**
```json
{
  "token": "123456"
}
```

#### POST `/api/auth/2fa/verify`
Vérifie un code 2FA lors de la connexion.

**Body:**
```json
{
  "tempToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token": "123456"
}
```

### Sessions

#### GET `/api/sessions`
Liste toutes les sessions actives.

**Headers:**
```
Authorization: Bearer <accessToken>
```

#### DELETE `/api/sessions/:id`
Révoque une session spécifique.

**Headers:**
```
Authorization: Bearer <accessToken>
```

#### DELETE `/api/sessions/others/revoke`
Révoque toutes les autres sessions.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Body:**
```json
{
  "currentSessionId": 1
}
```

### Profil utilisateur

#### GET `/api/me`
Récupère le profil de l'utilisateur connecté.

**Headers:**
```
Authorization: Bearer <accessToken>
```

#### PATCH `/api/me`
Met à jour le profil.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "newemail@example.com"
}
```

#### DELETE `/api/me`
Supprime le compte.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Body:**
```json
{
  "password": "password123"
}
```

#### GET `/api/me/history`
Récupère l'historique des connexions.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Query params:**
- `limit` (optionnel, défaut: 50)
- `offset` (optionnel, défaut: 0)

## 🗄️ Base de données

### Tables

- **User** : Utilisateurs
- **OAuthAccount** : Comptes OAuth liés
- **RefreshToken** : Refresh tokens (whitelist)
- **BlacklistedAccessToken** : Access tokens révoqués
- **VerificationToken** : Tokens de vérification d'email
- **PasswordResetToken** : Tokens de réinitialisation
- **LoginHistory** : Historique des connexions

Les tables sont créées automatiquement au démarrage en mode développement.

## 🔒 Bonnes pratiques de sécurité

1. **Changez le JWT_SECRET** en production
2. **Utilisez HTTPS** en production
3. **Configurez correctement CORS** pour votre frontend
4. **Utilisez des migrations** au lieu de `sync()` en production
5. **Activez 2FA** pour les comptes sensibles
6. **Surveillez l'historique des connexions** pour détecter les intrusions
7. **Limitez les tentatives de connexion** avec le rate limiting

## 📝 Exemples Postman

Voir le fichier `POSTMAN_EXAMPLES.md` pour des exemples de requêtes Postman complètes.

## 🐛 Dépannage

### Erreur de connexion à la base de données
- Vérifiez que MySQL est démarré
- Vérifiez les credentials dans `.env`
- Vérifiez que la base de données existe

### Erreur d'envoi d'email
- Vérifiez les credentials SMTP dans `.env`
- Pour Gmail, utilisez un "App Password" au lieu du mot de passe
- Vérifiez que le port SMTP n'est pas bloqué par un firewall

### Erreur OAuth
- Vérifiez que les Client ID et Secret sont corrects
- Vérifiez que les URLs de callback sont correctement configurées
- Vérifiez que les scopes sont autorisés dans la console du provider

## 📄 Licence

ISC

## 👤 Auteur

Développé avec ❤️ pour une authentification sécurisée

