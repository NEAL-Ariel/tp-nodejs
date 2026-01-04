# Guide de vérification du TP - API d'authentification

Ce guide vous permet de vérifier que toutes les fonctionnalités de votre API fonctionnent correctement.

## 📋 Checklist de vérification

### ✅ Étape 1 : Vérification de l'installation

#### 1.1 Vérifier les dépendances
```bash
npm install
```

#### 1.2 Vérifier la configuration
- [ ] Le fichier `.env` existe à la racine
- [ ] Les variables de base de données sont configurées
- [ ] `DB_NAME=auth_db`
- [ ] `DB_USER=root`
- [ ] `DB_PASSWORD=` (vide pour XAMPP par défaut)

#### 1.3 Vérifier la base de données
- [ ] MySQL est démarré dans XAMPP
- [ ] La base de données `auth_db` existe
- [ ] Vous pouvez vous connecter via phpMyAdmin

**Test :**
```bash
node CHECK_CONNECTION.js
```

Vous devriez voir :
```
✅ Connexion à la base de données établie avec succès.
✅ Base de données synchronisée.
📊 Tables créées: ...
```

---

### ✅ Étape 2 : Vérification du démarrage du serveur

#### 2.1 Démarrer le serveur
```bash
node server.js
```

**Résultat attendu :**
```
✅ Connexion à la base de données établie avec succès.
✅ Base de données synchronisée.
✅ Serveur SMTP prêt pour l'envoi d'emails (ou message d'erreur si non configuré)
🚀 Serveur démarré sur le port 3000
📝 Environnement: development
🌐 API disponible sur: http://localhost:3000/api
```

#### 2.2 Tester l'endpoint de santé
Dans un autre terminal ou navigateur :
```bash
curl http://localhost:3000/health
```

**Résultat attendu :**
```json
{
  "success": true,
  "message": "API d'authentification opérationnelle",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### ✅ Étape 3 : Vérification de l'inscription

#### 3.1 Tester l'inscription
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

**Résultat attendu :**
```json
{
  "success": true,
  "message": "Inscription réussie. Un email de vérification a été envoyé.",
  "data": {
    "user": {
      "id": 1,
      "email": "test@example.com",
      "firstName": "Test",
      "lastName": "User",
      "emailVerified": false
    },
    "tokens": {
      "accessToken": "eyJhbGci...",
      "refreshToken": "eyJhbGci..."
    }
  }
}
```

**Vérifications :**
- [ ] Code de réponse : 201
- [ ] Un utilisateur est créé dans la table `User`
- [ ] Un refresh token est créé dans la table `RefreshToken`
- [ ] Un token de vérification est créé dans la table `VerificationToken`
- [ ] Les tokens sont retournés

**Vérifier dans phpMyAdmin :**
- Table `User` : 1 enregistrement
- Table `RefreshToken` : 1 enregistrement
- Table `VerificationToken` : 1 enregistrement

#### 3.2 Tester l'inscription avec email existant
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

**Résultat attendu :**
```json
{
  "success": false,
  "message": "Cet email est déjà utilisé"
}
```

Code de réponse : 409

---

### ✅ Étape 4 : Vérification de la connexion

#### 4.1 Tester la connexion (sans 2FA)
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Résultat attendu :**
```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "user": { ... },
    "tokens": {
      "accessToken": "eyJhbGci...",
      "refreshToken": "eyJhbGci..."
    }
  }
}
```

**Vérifications :**
- [ ] Code de réponse : 200
- [ ] Un nouvel enregistrement dans `LoginHistory` avec `success: true`
- [ ] Un nouveau refresh token créé
- [ ] Les tokens sont retournés

#### 4.2 Tester la connexion avec mauvais mot de passe
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "wrongpassword"
  }'
```

**Résultat attendu :**
```json
{
  "success": false,
  "message": "Email ou mot de passe incorrect"
}
```

Code de réponse : 401

**Vérifications :**
- [ ] Un enregistrement dans `LoginHistory` avec `success: false`

#### 4.3 Tester le rate limiting
Essayez de vous connecter 6 fois de suite avec un mauvais mot de passe.

**Résultat attendu (après 5 tentatives) :**
```json
{
  "success": false,
  "message": "Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes."
}
```

Code de réponse : 429

---

### ✅ Étape 5 : Vérification du refresh token

#### 5.1 Récupérer un refresh token
Connectez-vous d'abord pour obtenir un refresh token.

#### 5.2 Rafraîchir l'access token
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "VOTRE_REFRESH_TOKEN_ICI"
  }'
```

**Résultat attendu :**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGci..."
  }
}
```

**Vérifications :**
- [ ] Code de réponse : 200
- [ ] Un nouvel access token est retourné
- [ ] Le refresh token reste valide

---

### ✅ Étape 6 : Vérification de la déconnexion

#### 6.1 Se déconnecter
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer VOTRE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "VOTRE_REFRESH_TOKEN"
  }'
```

**Résultat attendu :**
```json
{
  "success": true,
  "message": "Déconnexion réussie"
}
```

**Vérifications :**
- [ ] Code de réponse : 200
- [ ] L'access token est dans `BlacklistedAccessToken`
- [ ] Le refresh token a `revokedAt` défini

#### 6.2 Tester l'utilisation d'un token révoqué
Essayez d'utiliser l'access token blacklisté.

**Résultat attendu :**
```json
{
  "success": false,
  "message": "Token révoqué"
}
```

Code de réponse : 401

---

### ✅ Étape 7 : Vérification de la vérification d'email

#### 7.1 Demander un nouvel email de vérification
```bash
curl -X POST http://localhost:3000/api/auth/send-verification \
  -H "Authorization: Bearer VOTRE_ACCESS_TOKEN"
```

**Résultat attendu :**
```json
{
  "success": true,
  "message": "Email de vérification envoyé"
}
```

**Vérifications :**
- [ ] Code de réponse : 200
- [ ] Un nouveau token dans `VerificationToken`
- [ ] L'ancien token est supprimé

#### 7.2 Vérifier l'email
Récupérez le token depuis la table `VerificationToken` dans phpMyAdmin.

```bash
curl -X POST http://localhost:3000/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{
    "token": "TOKEN_DE_VERIFICATION"
  }'
```

**Résultat attendu :**
```json
{
  "success": true,
  "message": "Email vérifié avec succès"
}
```

**Vérifications :**
- [ ] Code de réponse : 200
- [ ] `emailVerifiedAt` est défini dans `User`
- [ ] Le token de vérification est supprimé

---

### ✅ Étape 8 : Vérification du mot de passe oublié

#### 8.1 Demander une réinitialisation
```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

**Résultat attendu :**
```json
{
  "success": true,
  "message": "Si cet email existe, un lien de réinitialisation a été envoyé"
}
```

**Vérifications :**
- [ ] Code de réponse : 200
- [ ] Un token dans `PasswordResetToken`
- [ ] Le message est identique même si l'email n'existe pas (sécurité)

#### 8.2 Réinitialiser le mot de passe
Récupérez le token depuis `PasswordResetToken`.

```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "TOKEN_DE_RESET",
    "newPassword": "newPassword123"
  }'
```

**Résultat attendu :**
```json
{
  "success": true,
  "message": "Mot de passe réinitialisé avec succès"
}
```

**Vérifications :**
- [ ] Code de réponse : 200
- [ ] Le mot de passe est changé (hashé)
- [ ] Tous les refresh tokens sont révoqués
- [ ] Le token de reset est supprimé

#### 8.3 Tester la connexion avec le nouveau mot de passe
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "newPassword123"
  }'
```

**Résultat attendu :** Connexion réussie

---

### ✅ Étape 9 : Vérification du changement de mot de passe

#### 9.1 Changer le mot de passe
```bash
curl -X POST http://localhost:3000/api/auth/change-password \
  -H "Authorization: Bearer VOTRE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "newPassword123",
    "newPassword": "anotherPassword123"
  }'
```

**Résultat attendu :**
```json
{
  "success": true,
  "message": "Mot de passe modifié avec succès"
}
```

**Vérifications :**
- [ ] Code de réponse : 200
- [ ] Le mot de passe est changé
- [ ] Un email de notification est envoyé (si configuré)

---

### ✅ Étape 10 : Vérification du profil utilisateur

#### 10.1 Récupérer le profil
```bash
curl -X GET http://localhost:3000/api/me \
  -H "Authorization: Bearer VOTRE_ACCESS_TOKEN"
```

**Résultat attendu :**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "test@example.com",
      "firstName": "Test",
      "lastName": "User",
      "emailVerified": true,
      "twoFactorEnabled": false,
      ...
    }
  }
}
```

**Vérifications :**
- [ ] Code de réponse : 200
- [ ] Toutes les informations utilisateur sont retournées

#### 10.2 Modifier le profil
```bash
curl -X PATCH http://localhost:3000/api/me \
  -H "Authorization: Bearer VOTRE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe"
  }'
```

**Résultat attendu :**
```json
{
  "success": true,
  "message": "Profil mis à jour avec succès",
  "data": {
    "user": { ... }
  }
}
```

**Vérifications :**
- [ ] Code de réponse : 200
- [ ] Les données sont mises à jour dans la base

#### 10.3 Historique des connexions
```bash
curl -X GET "http://localhost:3000/api/me/history?limit=10&offset=0" \
  -H "Authorization: Bearer VOTRE_ACCESS_TOKEN"
```

**Résultat attendu :**
```json
{
  "success": true,
  "data": {
    "history": [ ... ],
    "total": 5,
    "limit": 10,
    "offset": 0
  }
}
```

---

### ✅ Étape 11 : Vérification des sessions

#### 11.1 Lister les sessions
```bash
curl -X GET http://localhost:3000/api/sessions \
  -H "Authorization: Bearer VOTRE_ACCESS_TOKEN"
```

**Résultat attendu :**
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": 1,
        "userAgent": "...",
        "ipAddress": "127.0.0.1",
        "createdAt": "...",
        "expiresAt": "..."
      }
    ]
  }
}
```

#### 11.2 Révoquer une session
```bash
curl -X DELETE http://localhost:3000/api/sessions/1 \
  -H "Authorization: Bearer VOTRE_ACCESS_TOKEN"
```

**Résultat attendu :**
```json
{
  "success": true,
  "message": "Session révoquée avec succès"
}
```

**Vérifications :**
- [ ] Le refresh token a `revokedAt` défini

---

### ✅ Étape 12 : Vérification du 2FA (optionnel)

#### 12.1 Activer 2FA (étape 1)
```bash
curl -X POST http://localhost:3000/api/auth/2fa/enable \
  -H "Authorization: Bearer VOTRE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Résultat attendu :**
```json
{
  "success": true,
  "message": "Scannez le QR code avec votre application d'authentification",
  "data": {
    "secret": "JBSWY3DPEHPK3PXP",
    "qrCode": "data:image/png;base64,...",
    "manualEntryKey": "JBSWY3DPEHPK3PXP"
  }
}
```

#### 12.2 Activer 2FA (étape 2 - confirmation)
Scannez le QR code avec Google Authenticator, puis :

```bash
curl -X POST http://localhost:3000/api/auth/2fa/enable \
  -H "Authorization: Bearer VOTRE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "123456"
  }'
```

**Résultat attendu :**
```json
{
  "success": true,
  "message": "2FA activé avec succès"
}
```

**Vérifications :**
- [ ] `twoFactorEnabledAt` est défini dans `User`
- [ ] `twoFactorSecret` est défini

#### 12.3 Tester la connexion avec 2FA
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "anotherPassword123"
  }'
```

**Résultat attendu :**
```json
{
  "success": true,
  "message": "Vérification 2FA requise",
  "requires2FA": true,
  "tempToken": "eyJhbGci..."
}
```

#### 12.4 Vérifier le code 2FA
```bash
curl -X POST http://localhost:3000/api/auth/2fa/verify \
  -H "Content-Type: application/json" \
  -d '{
    "tempToken": "TEMP_TOKEN",
    "token": "123456"
  }'
```

**Résultat attendu :**
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

---

### ✅ Étape 13 : Vérification de la suppression de compte

#### 13.1 Supprimer le compte
```bash
curl -X DELETE http://localhost:3000/api/me \
  -H "Authorization: Bearer VOTRE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "password": "anotherPassword123"
  }'
```

**Résultat attendu :**
```json
{
  "success": true,
  "message": "Compte supprimé avec succès"
}
```

**Vérifications :**
- [ ] `disabledAt` est défini dans `User`
- [ ] Tous les refresh tokens sont révoqués

---

## 📊 Vérification de la base de données

### Tables à vérifier dans phpMyAdmin

1. **User** : Doit contenir les utilisateurs créés
2. **OAuthAccount** : Vide si OAuth non testé
3. **RefreshToken** : Doit contenir les sessions actives
4. **BlacklistedAccessToken** : Doit contenir les tokens révoqués
5. **VerificationToken** : Vide après vérification
6. **PasswordResetToken** : Vide après utilisation
7. **LoginHistory** : Doit contenir toutes les tentatives de connexion

---

## 🐛 Tests d'erreurs

### Tester les validations
- [ ] Inscription avec email invalide → 400
- [ ] Inscription avec mot de passe trop court → 400
- [ ] Connexion sans email → 400
- [ ] Requête sans token → 401
- [ ] Requête avec token invalide → 401
- [ ] Requête avec token expiré → 401

### Tester les contraintes
- [ ] Email unique → 409
- [ ] OAuth provider unique → 409

---

## ✅ Résumé de vérification

### Fonctionnalités de base
- [x] Inscription
- [x] Connexion
- [x] Déconnexion
- [x] Refresh token
- [x] Changement de mot de passe

### Vérification email
- [x] Envoi email de vérification
- [x] Vérification email

### Mot de passe oublié
- [x] Demande de réinitialisation
- [x] Réinitialisation

### Profil utilisateur
- [x] Consultation
- [x] Modification
- [x] Suppression
- [x] Historique des connexions

### Sessions
- [x] Liste des sessions
- [x] Révocation de session

### Sécurité
- [x] Rate limiting
- [x] Historique des connexions
- [x] Blacklist des tokens
- [x] Validation des données

### Optionnel
- [ ] 2FA (si testé)
- [ ] OAuth (si configuré)

---

## 📝 Notes

- Utilisez Postman pour faciliter les tests (voir `POSTMAN_EXAMPLES.md`)
- Sauvegardez les tokens pour les tests suivants
- Vérifiez les logs du serveur pour les erreurs
- Vérifiez la base de données après chaque test

---

**Tous les tests passent ? ✅ Votre API est fonctionnelle !**

