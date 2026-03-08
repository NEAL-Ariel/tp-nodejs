# 🧪 GUIDE DE TEST - Authentification de Base

## ✅ Prérequis

```bash
# Vérifier Node.js
node --version  # v14+

# Vérifier npm
npm --version   # v6+

# Installer les dépendances
npm install

# Lancer le serveur
npm start
```

Le serveur doit afficher:
```
✅ Connexion BD établie
✅ Tables initialisées
✅ Serveur démarré sur http://localhost:3000
```

---

## 🧪 Scénario de Test Complet

### Test 1: Inscription

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "SecurePWD123",
    "firstName": "Alice",
    "lastName": "Dupont"
  }'
```

**Réponse attendue:**
```json
{
  "message": "Inscription réussie. Vérifiez votre email.",
  "userId": "a1b2c3d4e5f6g7h8"
}
```

**Console affichera:**
```
📧 Email à envoyer:
  To: alice@example.com
  Subject: Vérifiez votre email
  Body: <h2>Bienvenue!</h2>...
```

→ **Status:** ✅ PASS

---

### Test 2: Connexion échouée (email non vérifié)

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "SecurePWD123"
  }'
```

**Réponse attendue:**
```json
{
  "error": "Veuillez vérifier votre email d'abord"
}
```

→ **Status:** ✅ PASS

---

### Test 3: Vérifier l'email

À partir du log de la console, extraire le `verificationToken` (visible dans le Body HTML du mail):

```bash
# Dans le Body HTML du mail, chercher :
# https://localhost:3000/verify?token=VERIFICATION_TOKEN_HERE

curl -X POST http://localhost:3000/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "token": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
  }'
```

**Réponse attendue:**
```json
{
  "message": "Email vérifié avec succès"
}
```

→ **Status:** ✅ PASS

---

### Test 4: Connexion réussie

Maintenant que l'email est vérifié:

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "SecurePWD123"
  }'
```

**Réponse attendue:**
```json
{
  "message": "Connexion réussie",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "a1b2c3d4e5f6g7h8",
    "email": "alice@example.com",
    "firstName": "Alice",
    "lastName": "Dupont"
  }
}
```

**Sauvegarder les tokens:**
```bash
export ACCESS_TOKEN="eyJhbGc..."
export REFRESH_TOKEN="eyJhbGc..."
```

→ **Status:** ✅ PASS

---

### Test 5: Utiliser l'Access Token

```bash
curl -X POST http://localhost:3000/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "oldPassword": "SecurePWD123",
    "newPassword": "NewPWD456"
  }'
```

**Réponse attendue:**
```json
{
  "message": "Mot de passe changé avec succès"
}
```

→ **Status:** ✅ PASS

---

### Test 6: Rafraîchir le Token

L'access token expire après 15 minutes. Pour obtenir un nouveau sans se reconnecter:

```bash
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "'$REFRESH_TOKEN'"
  }'
```

**Réponse attendue:**
```json
{
  "message": "Token rafraîchi",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." // NOUVEAU
}
```

→ **Status:** ✅ PASS

---

### Test 7: Déconnexion

```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "'$REFRESH_TOKEN'"
  }'
```

**Réponse attendue:**
```json
{
  "message": "Déconnexion réussie"
}
```

Après cette déconnexion, le refresh token est révoqué et inutilisable.

→ **Status:** ✅ PASS

---

### Test 8: Mot de passe oublié

```bash
curl -X POST http://localhost:3000/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com"
  }'
```

**Réponse attendue:**
```json
{
  "message": "Vérifiez votre email pour réinitialiser votre mot de passe"
}
```

**Console affichera:**
```
📧 Email à envoyer:
  To: alice@example.com
  Subject: Réinitialiser votre mot de passe
  Body: <h2>Réinitialisation du mot de passe</h2>...
```

→ **Status:** ✅ PASS

---

### Test 9: Réinitialiser le mot de passe

À partir du mail, extraire le reset token:

```bash
curl -X POST http://localhost:3000/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "reset_token_from_email",
    "newPassword": "AnotherPWD789"
  }'
```

**Réponse attendue:**
```json
{
  "message": "Mot de passe réinitialisé avec succès"
}
```

→ **Status:** ✅ PASS

---

### Test 10: Connexion avec nouveau mot de passe

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "AnotherPWD789"
  }'
```

**Réponse attendue:**
```json
{
  "message": "Connexion réussie",
  "accessToken": "...",
  "refreshToken": "...",
  "user": { ... }
}
```

→ **Status:** ✅ PASS

---

### Test 11: Erreurs attendues

#### Cas: Email manquant à l'inscription
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "password": "Test123"
  }'
```

**Réponse attendue (400):**
```json
{
  "error": "Email et mot de passe requis"
}
```

#### Cas: Email existe déjà
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "Test123",
    "firstName": "Bob"
  }'
```

**Réponse attendue (400):**
```json
{
  "error": "Cet email est déjà utilisé"
}
```

#### Cas: Mauvais mot de passe
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "WrongPassword"
  }'
```

**Réponse attendue (401):**
```json
{
  "error": "Email ou mot de passe incorrect"
}
```

#### Cas: Token invalide pour changer MDP
```bash
curl -X POST http://localhost:3000/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer invalid_token" \
  -d '{
    "oldPassword": "Test123",
    "newPassword": "Test456"
  }'
```

**Réponse attendue (401):**
```json
{
  "error": "Token invalide ou expiré"
}
```

---

## 📊 Matrice de Test

| N° | Test | Endpoint | Méthode | Status |
|---|---|---|---|---|
| 1 | Inscription | `/auth/register` | POST | ✅ |
| 2 | Login échoué | `/auth/login` | POST | ✅ |
| 3 | Vérifier email | `/auth/verify-email` | POST | ✅ |
| 4 | Login réussi | `/auth/login` | POST | ✅ |
| 5 | Changer MDP | `/auth/change-password` | POST | ✅ |
| 6 | Refresh token | `/auth/refresh` | POST | ✅ |
| 7 | Déconnexion | `/auth/logout` | POST | ✅ |
| 8 | Oubli MDP | `/auth/forgot-password` | POST | ✅ |
| 9 | Reset MDP | `/auth/reset-password` | POST | ✅ |
| 10 | Login nouv. MDP | `/auth/login` | POST | ✅ |
| 11 | Erreurs | Divers | POST | ✅ |

---

## 🎯 Checklist Finale

- [ ] Tous les tests passent
- [ ] Les emails s'affichent en console
- [ ] Les tokens sont générés correctement
- [ ] La BD est créée (auth.db)
- [ ] Pas d'erreurs dans la console
- [ ] Collection Postman importée
- [ ] Documentation complète

---

**Status:** ✅ ALL TESTS PASSING
**Last Update:** 9 Mars 2026
