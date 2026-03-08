# 🏗️ ARCHITECTURE & FLUX DE L'AUTHENTIFICATION

## 📐 Diagramme Global

```
┌─────────────────────────────────────────────────────────────────┐
│                          CLIENT (Frontend)                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  1. Inscription → register → 2. Email de vérification   │  │
│  │  3. Vérification d'email → verify-email                 │  │
│  │  4. Connexion → login → Access Token + Refresh Token    │  │
│  │  5. Requêtes protégées (Authorization: Bearer token)    │  │
│  │  6. Token expiré → refresh → Nouvel Access Token        │  │
│  │  7. Déconnexion → logout → Révocation token             │  │
│  └──────────────────────────────────────────────────────────┘  │
└───────────────────────────┬──────────────────────────────────────┘
                            │ HTTP Requests
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXPRESS SERVER (Node.js)                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    ROUTES LAYER                         │  │
│  │  ┌─────────────────────────────────────────────────┐   │  │
│  │  │ POST /auth/register                             │   │  │
│  │  │ POST /auth/login                                │   │  │
│  │  │ POST /auth/logout                               │   │  │
│  │  │ POST /auth/refresh                              │   │  │
│  │  │ POST /auth/verify-email                         │   │  │
│  │  │ POST /auth/forgot-password                       │   │  │
│  │  │ POST /auth/reset-password                        │   │  │
│  │  │ POST /auth/change-password (+ Middleware)       │   │  │
│  │  └─────────────────────────────────────────────────┘   │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                           │                                     │
│                           ▼                                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                 SERVICES LAYER                      │  │
│  │  ┌──────────────┐  ┌──────────────┐ ┌────────────┐ │  │
│  │  │ auth.service │  │ jwt.service  │ │email.service│ │  │
│  │  │              │  │              │ │            │ │  │
│  │  │ • register   │  │ • generate   │ │ • send     │ │  │
│  │  │ • login      │  │ • verify     │ │  verification
│  │  │ • logout     │  │ • revoke     │ │ • send reset │ │  │
│  │  │ • verify     │  │ • sessions   │ │ • send pwd   │ │  │
│  │  │ • reset      │  │              │ │              │ │  │
│  │  └──────────────┘  └──────────────┘ └────────────┘ │  │
│  └────────────────────────┬──────────────────────────────┘  │
│                           │                                   │
│                           ▼                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                DATABASE LAYER (SQLite)              │  │
│  └────────────────────────┬──────────────────────────────┘  │
└──────────────────────────┼──────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │        SQLite Database (auth.db)     │
        │  ┌──────────────────────────────┐   │
        │  │ Tables:                      │   │
        │  │ • users                      │   │
        │  │ • verification_tokens        │   │
        │  │ • password_reset_tokens      │   │
        │  │ • refresh_tokens (whitelist) │   │
        │  │ • blacklisted_access_tokens  │   │
        │  │ • oauth_accounts             │   │
        │  │ • login_history              │   │
        │  └──────────────────────────────┘   │
        └──────────────────────────────────────┘
```

---

## 🔐 Flux d'Authentification Détaillé

### 1️⃣ Inscription

```
Client                          Server
  │                              │
  ├─ POST /auth/register ───────> │
  │  {email, password, ...}       │
  │                               │ Valider email
  │                               │ Hasher password (bcryptjs)
  │                               │ Créer user en BD
  │                               │ Générer verification token
  │                               │ Insérer token en BD (24h expiry)
  │                               │
  │                               │ Préparer email
  │  <─ 201 + userId ────────────┤
  │                               │
  │ <─ Email de vérification ─────┤
  │
```

### 2️⃣ Vérification d'Email

```
Client                          Server
  │                              │
  ├─ Clic lien email ────────────>│
  ├─ POST /auth/verify-email ───>│
  │  {token}                      │
  │                               │ Chercher token en BD
  │                               │ Vérifier expiration
  │                               │ Mettre à jour user
  │                               │ Supprimer token
  │  <─ 200 OK ──────────────────┤
  │
```

### 3️⃣ Connexion

```
Client                          Server
  │                              │
  ├─ POST /auth/login ──────────>│
  │  {email, password}            │
  │                               │ Chercher user
  │                               │ Vérifier email existe
  │                               │ Comparer password (bcrypt)
  │                               │ Vérifier emailVerifiedAt
  │                               │ Vérifier pas désactivé
  │                               │
  │                               │ Générer Access Token (15m)
  │                               │ Générer Refresh Token (7j)
  │                               │ Insérer refresh token en BD
  │  <─ 200 ──────────────────────┤
  │  {accessToken,               │
  │   refreshToken,              │
  │   user}                       │
  │                               │
  │ Stocker en localStorage       │
```

### 4️⃣ Requête Protégée

```
Client                          Server
  │                              │
  ├─ GET /protected ────────────>│
  │  Authorization: Bearer token  │
  │                               │ Extraire token du header
  │                               │ Vérifier signature JWT
  │                               │ Vérifier expiration
  │                               │ Extraire userId
  │                               │
  │  <─ 200 + data ──────────────┤
```

### 5️⃣ Token Expiré → Refresh

```
Client                          Server
  │                              │
  │ [Access Token expiré]         │
  │                               │
  ├─ POST /auth/refresh ────────>│
  │  {refreshToken}               │
  │                               │ Vérifier refresh token signé
  │                               │ Chercher en BD
  │                               │ Vérifier pas revoked
  │                               │ Vérifier pas expiré
  │                               │
  │                               │ Générer nouveau Access Token
  │  <─ 200 ──────────────────────┤
  │  {accessToken}                │
  │                               │
  │ Mettre à jour localStorage    │
```

### 6️⃣ Déconnexion

```
Client                          Server
  │                              │
  ├─ POST /auth/logout ─────────>│
  │  {refreshToken}               │
  │                               │ Chercher token en BD
  │                               │ Mettre revokedAt = NOW
  │                               │
  │  <─ 200 OK ───────────────────┤
  │                               │
  │ Effacer localStorage          │
```

### 7️⃣ Mot de Passe Oublié

```
Client                          Server
  │                              │
  ├─ POST /auth/forgot-password >│
  │  {email}                      │
  │                               │ Chercher user
  │                               │ Générer reset token
  │                               │ Insérer en BD (1h expiry)
  │                               │
  │  <─ 200 OK ───────────────────┤
  │                               │
  │ <─ Email reset ────────────────┤
  │
```

### 8️⃣ Réinitialiser MDP

```
Client                          Server
  │                              │
  ├─ POST /auth/reset-password ->│
  │  {token, newPassword}         │
  │                               │ Chercher reset token
  │                               │ Vérifier expiration
  │                               │ Vérifier pas utilisé
  │                               │ Hasher nouveau password
  │                               │ Mettre à jour user
  │                               │ Marquer token comme utilisé
  │  <─ 200 OK ───────────────────┤
```

---

## 🔐 Sécurité des Tokens

### Access Token
```
Structure: Header.Payload.Signature

Header: {alg: "HS256", typ: "JWT"}

Payload: {
  userId: "abc123...",
  type: "access",
  iat: 1234567890,
  exp: 1234567890 + 15min
}

Signature: HMACSHA256(base64(header) + "." + base64(payload), JWT_SECRET)
```

### Refresh Token
```
Structure: Similaire à Access Token

Payload: {
  userId: "abc123...",
  type: "refresh",
  iat: 1234567890,
  exp: 1234567890 + 7d
}

Stockage: En Base de Données (WHITELIST)
  ├─ id (PK)
  ├─ userId (FK)
  ├─ token (encrypted)
  ├─ revokedAt (NULL = actif)
  └─ expiresAt
```

### Validation Tokens
```
1. Vérifier la signature (JWT_SECRET)
2. Vérifier l'expiration
3. Pour refresh: Vérifier en BD (whitelist)
   └─ Présent?
   └─ revokedAt = NULL?
   └─ expiresAt > now?
```

---

## 🗄️ Schéma Base de Données

### Users
```sql
-- Stocke les informations utilisateurs
id TEXT PRIMARY KEY
email TEXT UNIQUE NOT NULL        -- Identifiant unique
password TEXT                     -- Hash bcrypt (NULL si OAuth)
firstName TEXT
lastName TEXT
emailVerifiedAt DATETIME          -- Si NULL = email pas vérifié
twoFactorEnabledAt DATETIME       -- Si NULL = 2FA désactivé
twoFactorSecret TEXT              -- Secret TOTP (si 2FA activé)
disabledAt DATETIME               -- Si NULL = compte actif
createdAt DATETIME
updatedAt DATETIME
```

### Refresh Tokens (WHITELIST)
```sql
-- Gère les sessions actives
id TEXT PRIMARY KEY
userId TEXT FK                    -- Lien à l'utilisateur
token TEXT UNIQUE                 -- JWT Refresh Token
revokedAt DATETIME                -- Si NULL = token actif
expiresAt DATETIME                -- Expiration originale
createdAt DATETIME
```

### Verification Tokens
```sql
-- Tokens d'email
id TEXT PRIMARY KEY
userId TEXT FK
token TEXT UNIQUE
expiresAt DATETIME                -- 24 heures
createdAt DATETIME
```

### Password Reset Tokens
```sql
-- Tokens de réinitialisation
id TEXT PRIMARY KEY
userId TEXT FK
token TEXT UNIQUE
expiresAt DATETIME                -- 1 heure
usedAt DATETIME                   -- Marquer comme utilisé
createdAt DATETIME
```

---

## 🔄 Cycle de Vie d'une Session

```
1. Register
   └─ Email verification token créé
2. Verify Email
   └─ User peut se connecter
3. Login
   ├─ Refresh token créé et inséré en BD
   └─ Access token généré
4. Appel API protégé (Access Token valide)
   └─ Requête autorisée
5. Access Token expire (15 min)
   ├─ Refresh token utilisable
   └─ Nouveau access token généré
6. Logout
   ├─ Refresh token marqué revoked
   └─ Session terminée
7. Renouvellement de session impossible
   ├─ Refresh token invalide (revoked)
   └─ Nouveau login requis
```

---

## ⚙️ Configurations Principales

```env
# Timers
JWT_ACCESS_TOKEN_EXPIRY=15m       # Access token valide 15 min
JWT_REFRESH_TOKEN_EXPIRY=7d       # Refresh token valide 7 jours

# Email
EMAIL_SERVICE=gmail               # Nodemailer service
NODE_ENV=development              # Mode console pour emails

# Database
DB_PATH=./auth.db                 # Fichier SQLite local

# Security
JWT_SECRET=very_long_secret_key   # À changer en production
```

---

## 🔍 Points d'Attack et Défenses

| Attack | Défense |
|--------|---------|
| Brute Force | Rate limiting (à ajouter) |
| SQL Injection | Prepared statements (SQLite) |
| Token Theft | HTTPS, httpOnly cookies |
| Token Hijacking | Refresh token whitelist + revocation |
| Password | Bcrypt 10 rounds |
| Email Spoofing | Vérification d'email requis |
| Session Fixation | Tokens stateless JWT |

---

## 📈 Performance

```
Register: ~200ms   (1x bcrypt hash)
Login: ~200ms      (1x bcrypt verify + 2x JWT generate)
Refresh: ~50ms     (1x DB lookup + 1x JWT generate)
Protected Req: ~5ms (JWT verify uniquement)
```

**Bouteille:** Hachage bcryptjs (par design sécuritaire)

---

**Dernière mise à jour:** 9 Mars 2026
