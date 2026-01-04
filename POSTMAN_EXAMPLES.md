# Exemples de requêtes Postman

Ce document contient des exemples de requêtes pour tester l'API avec Postman.

## Configuration de base

**Base URL:** `http://localhost:3000/api`

## 1. Inscription (Register)

**Méthode:** `POST`  
**URL:** `http://localhost:3000/api/auth/register`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Réponse attendue:**
```json
{
  "success": true,
  "message": "Inscription réussie. Un email de vérification a été envoyé.",
  "data": {
    "user": {
      "id": 1,
      "email": "john.doe@example.com",
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

**Variables Postman à sauvegarder:**
- `accessToken` (depuis `data.tokens.accessToken`)
- `refreshToken` (depuis `data.tokens.refreshToken`)

---

## 2. Connexion (Login)

**Méthode:** `POST`  
**URL:** `http://localhost:3000/api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePassword123!"
}
```

**Réponse attendue (sans 2FA):**
```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "user": {
      "id": 1,
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "emailVerified": false,
      "twoFactorEnabled": false
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

**Réponse attendue (avec 2FA activé):**
```json
{
  "success": true,
  "message": "Vérification 2FA requise",
  "requires2FA": true,
  "tempToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Dans ce cas, utilisez le `tempToken` pour la route `/auth/2fa/verify`.

---

## 3. Rafraîchir le token (Refresh Token)

**Méthode:** `POST`  
**URL:** `http://localhost:3000/api/auth/refresh`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "refreshToken": "{{refreshToken}}"
}
```

**Réponse attendue:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## 4. Déconnexion (Logout)

**Méthode:** `POST`  
**URL:** `http://localhost:3000/api/auth/logout`

**Headers:**
```
Authorization: Bearer {{accessToken}}
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "refreshToken": "{{refreshToken}}"
}
```

**Réponse attendue:**
```json
{
  "success": true,
  "message": "Déconnexion réussie"
}
```

---

## 5. Changer le mot de passe

**Méthode:** `POST`  
**URL:** `http://localhost:3000/api/auth/change-password`

**Headers:**
```
Authorization: Bearer {{accessToken}}
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "currentPassword": "SecurePassword123!",
  "newPassword": "NewSecurePassword456!"
}
```

**Réponse attendue:**
```json
{
  "success": true,
  "message": "Mot de passe modifié avec succès"
}
```

---

## 6. Envoyer un email de vérification

**Méthode:** `POST`  
**URL:** `http://localhost:3000/api/auth/send-verification`

**Headers:**
```
Authorization: Bearer {{accessToken}}
```

**Réponse attendue:**
```json
{
  "success": true,
  "message": "Email de vérification envoyé"
}
```

---

## 7. Vérifier l'email

**Méthode:** `POST`  
**URL:** `http://localhost:3000/api/auth/verify`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "token": "abc123def456..." // Token reçu par email
}
```

**Réponse attendue:**
```json
{
  "success": true,
  "message": "Email vérifié avec succès"
}
```

---

## 8. Mot de passe oublié

**Méthode:** `POST`  
**URL:** `http://localhost:3000/api/auth/forgot-password`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "john.doe@example.com"
}
```

**Réponse attendue:**
```json
{
  "success": true,
  "message": "Si cet email existe, un lien de réinitialisation a été envoyé"
}
```

---

## 9. Réinitialiser le mot de passe

**Méthode:** `POST`  
**URL:** `http://localhost:3000/api/auth/reset-password`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "token": "abc123def456...", // Token reçu par email
  "newPassword": "NewSecurePassword789!"
}
```

**Réponse attendue:**
```json
{
  "success": true,
  "message": "Mot de passe réinitialisé avec succès"
}
```

---

## 10. Activer 2FA (Étape 1 - Génération)

**Méthode:** `POST`  
**URL:** `http://localhost:3000/api/auth/2fa/enable`

**Headers:**
```
Authorization: Bearer {{accessToken}}
Content-Type: application/json
```

**Body (raw JSON):**
```json
{}
```

**Réponse attendue:**
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

**Note:** Scannez le QR code avec Google Authenticator ou une app similaire, puis utilisez le code généré pour l'étape 2.

---

## 11. Activer 2FA (Étape 2 - Activation)

**Méthode:** `POST`  
**URL:** `http://localhost:3000/api/auth/2fa/enable`

**Headers:**
```
Authorization: Bearer {{accessToken}}
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "token": "123456" // Code à 6 chiffres depuis Google Authenticator
}
```

**Réponse attendue:**
```json
{
  "success": true,
  "message": "2FA activé avec succès"
}
```

---

## 12. Vérifier 2FA (après login)

**Méthode:** `POST`  
**URL:** `http://localhost:3000/api/auth/2fa/verify`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "tempToken": "{{tempToken}}", // Token reçu lors du login avec 2FA
  "token": "123456" // Code à 6 chiffres depuis Google Authenticator
}
```

**Réponse attendue:**
```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "user": { ... },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

---

## 13. Désactiver 2FA

**Méthode:** `POST`  
**URL:** `http://localhost:3000/api/auth/2fa/disable`

**Headers:**
```
Authorization: Bearer {{accessToken}}
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "token": "123456" // Code à 6 chiffres depuis Google Authenticator
}
```

**Réponse attendue:**
```json
{
  "success": true,
  "message": "2FA désactivé avec succès"
}
```

---

## 14. Lister les sessions

**Méthode:** `GET`  
**URL:** `http://localhost:3000/api/sessions`

**Headers:**
```
Authorization: Bearer {{accessToken}}
```

**Réponse attendue:**
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": 1,
        "userAgent": "Mozilla/5.0...",
        "ipAddress": "127.0.0.1",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "expiresAt": "2024-01-08T00:00:00.000Z",
        "isCurrent": true
      }
    ]
  }
}
```

---

## 15. Révoquer une session

**Méthode:** `DELETE`  
**URL:** `http://localhost:3000/api/sessions/1`

**Headers:**
```
Authorization: Bearer {{accessToken}}
```

**Réponse attendue:**
```json
{
  "success": true,
  "message": "Session révoquée avec succès"
}
```

---

## 16. Révoquer toutes les autres sessions

**Méthode:** `DELETE`  
**URL:** `http://localhost:3000/api/sessions/others/revoke`

**Headers:**
```
Authorization: Bearer {{accessToken}}
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "currentSessionId": 1 // ID de la session actuelle
}
```

**Réponse attendue:**
```json
{
  "success": true,
  "message": "Toutes les autres sessions ont été révoquées"
}
```

---

## 17. Récupérer le profil

**Méthode:** `GET`  
**URL:** `http://localhost:3000/api/me`

**Headers:**
```
Authorization: Bearer {{accessToken}}
```

**Réponse attendue:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "emailVerified": true,
      "emailVerifiedAt": "2024-01-01T00:00:00.000Z",
      "twoFactorEnabled": true,
      "twoFactorEnabledAt": "2024-01-01T00:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

---

## 18. Mettre à jour le profil

**Méthode:** `PATCH`  
**URL:** `http://localhost:3000/api/me`

**Headers:**
```
Authorization: Bearer {{accessToken}}
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "firstName": "Jane",
  "lastName": "Smith"
}
```

**Réponse attendue:**
```json
{
  "success": true,
  "message": "Profil mis à jour avec succès",
  "data": {
    "user": {
      "id": 1,
      "email": "john.doe@example.com",
      "firstName": "Jane",
      "lastName": "Smith",
      "emailVerified": true
    }
  }
}
```

---

## 19. Supprimer le compte

**Méthode:** `DELETE`  
**URL:** `http://localhost:3000/api/me`

**Headers:**
```
Authorization: Bearer {{accessToken}}
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "password": "SecurePassword123!"
}
```

**Réponse attendue:**
```json
{
  "success": true,
  "message": "Compte supprimé avec succès"
}
```

---

## 20. Historique des connexions

**Méthode:** `GET`  
**URL:** `http://localhost:3000/api/me/history?limit=10&offset=0`

**Headers:**
```
Authorization: Bearer {{accessToken}}
```

**Query Parameters:**
- `limit` (optionnel, défaut: 50)
- `offset` (optionnel, défaut: 0)

**Réponse attendue:**
```json
{
  "success": true,
  "data": {
    "history": [
      {
        "id": 1,
        "ipAddress": "127.0.0.1",
        "userAgent": "Mozilla/5.0...",
        "success": true,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 10,
    "limit": 10,
    "offset": 0
  }
}
```

---

## 21. OAuth - Google (Démarrage)

**Méthode:** `GET`  
**URL:** `http://localhost:3000/api/auth/oauth/google`

Cette requête redirige vers Google pour l'authentification.  
Après authentification, Google redirige vers le callback qui renvoie les tokens.

---

## 22. OAuth - GitHub (Démarrage)

**Méthode:** `GET`  
**URL:** `http://localhost:3000/api/auth/oauth/github`

Cette requête redirige vers GitHub pour l'authentification.  
Après authentification, GitHub redirige vers le callback qui renvoie les tokens.

---

## Configuration Postman

### Variables d'environnement

Créez un environnement Postman avec les variables suivantes :

- `baseUrl`: `http://localhost:3000/api`
- `accessToken`: (sera rempli automatiquement après login/register)
- `refreshToken`: (sera rempli automatiquement après login/register)
- `tempToken`: (sera rempli après login avec 2FA)

### Scripts de test automatiques

Vous pouvez ajouter des scripts dans Postman pour automatiquement sauvegarder les tokens :

**Dans "Tests" de la requête Login/Register:**
```javascript
if (pm.response.code === 200 || pm.response.code === 201) {
    var jsonData = pm.response.json();
    if (jsonData.data && jsonData.data.tokens) {
        pm.environment.set("accessToken", jsonData.data.tokens.accessToken);
        pm.environment.set("refreshToken", jsonData.data.tokens.refreshToken);
    }
}
```

---

## Notes importantes

1. **Rate Limiting**: Après 5 tentatives de connexion échouées, vous devrez attendre 15 minutes.
2. **Tokens expirés**: Les access tokens expirent après 15 minutes. Utilisez le refresh token pour en obtenir un nouveau.
3. **2FA**: Si 2FA est activé, vous devrez fournir le code après le login.
4. **Emails**: Les emails de vérification et de réinitialisation expirent (24h pour vérification, 1h pour reset).
5. **OAuth**: Les URLs de callback doivent être configurées dans les consoles Google/GitHub.

