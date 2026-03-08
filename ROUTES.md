# Documentation des Routes d'Authentification

## 🔐 Authentification de Base

### 1. Inscription - POST `/auth/register`

**Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "firstName": "Jean",
  "lastName": "Dupont"
}
```

**Réponse (201):**
```json
{
  "message": "Inscription réussie. Vérifiez votre email.",
  "userId": "abc123..."
}
```

---

### 2. Connexion - POST `/auth/login`

**Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Réponse (200):**
```json
{
  "message": "Connexion réussie",
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": "abc123...",
    "email": "user@example.com",
    "firstName": "Jean",
    "lastName": "Dupont"
  }
}
```

---

### 3. Rafraîchir le token - POST `/auth/refresh`

**Body:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Réponse (200):**
```json
{
  "message": "Token rafraîchi",
  "accessToken": "eyJhbGc..."
}
```

---

### 4. Déconnexion - POST `/auth/logout`

**Headers:**
```
Authorization: Bearer eyJhbGc...
```

**Body:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Réponse (200):**
```json
{
  "message": "Déconnexion réussie"
}
```

---

### 5. Vérifier l'email - POST `/auth/verify-email`

**Body:**
```json
{
  "token": "verification_token..."
}
```

**Réponse (200):**
```json
{
  "message": "Email vérifié avec succès"
}
```

---

### 6. Demander la réinitialisation - POST `/auth/forgot-password`

**Body:**
```json
{
  "email": "user@example.com"
}
```

**Réponse (200):**
```json
{
  "message": "Vérifiez votre email pour réinitialiser votre mot de passe"
}
```

---

### 7. Réinitialiser le mot de passe - POST `/auth/reset-password`

**Body:**
```json
{
  "token": "reset_token...",
  "newPassword": "NewPassword123"
}
```

**Réponse (200):**
```json
{
  "message": "Mot de passe réinitialisé avec succès"
}
```

---

### 8. Changer le mot de passe - POST `/auth/change-password`

**Headers:**
```
Authorization: Bearer eyJhbGc...
```

**Body:**
```json
{
  "oldPassword": "SecurePassword123",
  "newPassword": "NewPassword456"
}
```

**Réponse (200):**
```json
{
  "message": "Mot de passe changé avec succès"
}
```

---

## 📌 Notes

- L'**access token** expire après 15 minutes
- Le **refresh token** expire après 7 jours
- Tous les tokens sont stockés en base de données (whitelist/blacklist)
- Les mots de passe sont hashés avec bcrypt (10 rounds)
- Les emails de vérification sont envoyés automatiquement
