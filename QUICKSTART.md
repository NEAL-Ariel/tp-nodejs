# 🚀 QUICKSTART - Démarrage Rapide

## Installation et Lancement (5 minutes)

### 1. Installer les dépendances

```bash
cd aime-tp
npm install
```

### 2. Configurer .env

Le fichier `.env` est déjà créé avec les valeurs par défaut.

**Pour tester localement (développement):**
- Les emails s'affichent dans la **console** (mode développement)
- Pas besoin de configurer Gmail

**Pour la production:**
- Changer `JWT_SECRET` par une vraie clé secrète
- Configurer un service d'email (Gmail, SendGrid, etc.)

### 3. Lancer le serveur

```bash
npm start
```

Résultat:
```
✅ Connexion BD établie
✅ Tables initialisées
✅ Serveur démarré sur http://localhost:3000
```

---

## 🧪 Tester les Routes (avec curl ou Postman)

### Test 1: Inscription

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123",
    "firstName": "Jean",
    "lastName": "Test"
  }'
```

**Console affichera:**
```
📧 Email à envoyer:
  To: test@example.com
  Subject: Vérifiez votre email
  Body: <html>...</html>
```

### Test 2: Connexion

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123"
  }'
```

**Réponse:**
```json
{
  "message": "Connexion réussie",
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": "abc123...",
    "email": "test@example.com"
  }
}
```

### Test 3: Utiliser l'Access Token

```bash
curl -X POST http://localhost:3000/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGc..." \
  -d '{
    "oldPassword": "TestPassword123",
    "newPassword": "NewPassword456"
  }'
```

---

## 📚 Documentation Complète

- **[ROUTES.md](./ROUTES.md)** - Tous les endpoints avec exemples
- **[README_AUTH.md](./README_AUTH.md)** - Guide d'installation détaillé
- **[IMPLEMENTATION_COMPLETE.md](./IMPLEMENTATION_COMPLETE.md)** - Ce qui a été implémenté

---

## 🎯 Endpoints Disponibles

### Authentification de Base
- `POST /auth/register` - Inscription
- `POST /auth/login` - Connexion
- `POST /auth/logout` - Déconnexion
- `POST /auth/refresh` - Rafraîchir le token

### Gestion Mot de Passe
- `POST /auth/forgot-password` - Demander réinitialisation
- `POST /auth/reset-password` - Réinitialiser le mot de passe
- `POST /auth/change-password` - Changer le mot de passe (authentifié)

### Email
- `POST /auth/verify-email` - Vérifier l'email

### (À compléter)
- `POST /auth/oauth/start` - Démarrer OAuth
- `GET /auth/oauth/callback` - Callback OAuth
- `POST /auth/2fa/enable` - Activer 2FA
- `POST /auth/2fa/verify` - Vérifier code 2FA
- `POST /auth/2fa/disable` - Désactiver 2FA
- `GET /sessions` - Lister les sessions
- `DELETE /sessions/:id` - Révoquer une session
- `DELETE /sessions/others` - Révoquer autres sessions

---

## 📊 Base de Données

Les tables sont créées **automatiquement** au premier lancement:

```
auth.db
├── users (utilisateurs)
├── oauth_accounts (comptes OAuth)
├── refresh_tokens (sessions)
├── blacklisted_access_tokens (tokens révoqués)
├── verification_tokens (vérification email)
├── password_reset_tokens (réinitialisation)
└── login_history (historique)
```

---

## ⚡ Troubleshooting

### Erreur: "Cannot find module"
```bash
npm install
```

### Erreur: "Port 3000 déjà utilisé"
```bash
# Changer le port dans .env
PORT=3001
```

### Erreur: "Connexion BD échouée"
Vérifier que `DB_PATH=./auth.db` est correct dans `.env`

### Les emails ne s'affichent pas
- Vérifier que `NODE_ENV=development` dans `.env`
- Les emails s'affichent uniquement en console en dev

---

## 🔐 Token Management

**Access Token:**
- Durée: 15 minutes
- Utilisé pour les requêtes authentifiées
- Stocké en client

**Refresh Token:**
- Durée: 7 jours  
- Stocké en base de données (whitelist)
- Utilisé pour obtenir un nouvel access token

### Renouveler le token expiré:
```bash
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "eyJhbGc..."}'
```

---

## 💡 Prochaines étapes (Optionnel)

1. **Rate Limiting** - Protéger contre les attaques brute-force
2. **OAuth** - Configurer Google/GitHub
3. **2FA** - Intégrer avec le login
4. **Sessions** - Lister/révoquer les sessions actives
5. **Tests** - Ajouter des tests unitaires

---

**Status:** ✅ Prêt à l'emploi
**Dernière mise à jour:** 9 Mars 2026
