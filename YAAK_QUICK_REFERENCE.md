# Guide de Référence Rapide Yaak - API d'Authentification

Guide rapide pour tester tous les endpoints avec Yaak.

---

## 📋 Tableau Récapitulatif des Endpoints

| Fonctionnalité | Méthode | URL | Auth Requise |
|---------------|---------|-----|--------------|
| **AUTHENTIFICATION** |
| Inscription | POST | `/api/auth/register` | ❌ |
| Connexion | POST | `/api/auth/login` | ❌ |
| Déconnexion | POST | `/api/auth/logout` | ✅ |
| Refresh Token | POST | `/api/auth/refresh` | ❌ |
| Mot de passe oublié | POST | `/api/auth/forgot-password` | ❌ |
| Réinitialisation mot de passe | POST | `/api/auth/reset-password` | ❌ |
| Changement mot de passe | POST | `/api/auth/change-password` | ✅ |
| **VÉRIFICATION EMAIL** |
| Envoi email vérification | POST | `/api/auth/send-verification` | ✅ |
| Vérification email | POST | `/api/auth/verify` | ❌ |
| **OAUTH** |
| OAuth Google | GET | `/api/auth/oauth/google` | ❌ |
| OAuth GitHub | GET | `/api/auth/oauth/github` | ❌ |
| **2FA** |
| Activer 2FA | POST | `/api/auth/2fa/enable` | ✅ |
| Désactiver 2FA | POST | `/api/auth/2fa/disable` | ✅ |
| Vérifier code 2FA | POST | `/api/auth/2fa/verify` | ❌ |
| **PROFIL** |
| Consulter profil | GET | `/api/me` | ✅ |
| Modifier profil | PATCH | `/api/me` | ✅ |
| Supprimer compte | DELETE | `/api/me` | ✅ |
| Historique connexions | GET | `/api/me/history` | ✅ |
| **SESSIONS** |
| Lister sessions | GET | `/api/sessions` | ✅ |
| Révoquer session | DELETE | `/api/sessions/:id` | ✅ |
| Révoquer autres sessions | DELETE | `/api/sessions/others/revoke` | ✅ |

---

## 🔑 Headers Standards

### Pour les requêtes sans authentification
```
Content-Type: application/json
```

### Pour les requêtes avec authentification
```
Authorization: Bearer VOTRE_ACCESS_TOKEN
Content-Type: application/json
```

---

## 📝 Exemples de Body JSON

### Inscription
```json
{
  "email": "test@example.com",
  "password": "SecurePassword123!",
  "firstName": "Test",
  "lastName": "User"
}
```

### Connexion
```json
{
  "email": "test@example.com",
  "password": "SecurePassword123!"
}
```

### Changement de mot de passe
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword456!"
}
```

### Réinitialisation mot de passe
```json
{
  "token": "TOKEN_FROM_DATABASE",
  "newPassword": "NewPassword456!"
}
```

### Vérification email
```json
{
  "token": "TOKEN_FROM_DATABASE"
}
```

### Activer/Désactiver 2FA
```json
{
  "token": "123456"
}
```

### Vérifier 2FA (après login)
```json
{
  "tempToken": "TEMP_TOKEN_FROM_LOGIN",
  "token": "123456"
}
```

### Modifier profil
```json
{
  "firstName": "John",
  "lastName": "Doe"
}
```

### Supprimer compte
```json
{
  "password": "SecurePassword123!"
}
```

### Révoquer autres sessions
```json
{
  "currentSessionId": 1
}
```

---

## ✅ Ordre Recommandé des Tests

1. **Inscription** → Récupérer `accessToken` et `refreshToken`
2. **Consulter profil** → Tester l'authentification
3. **Envoi email vérification** → Récupérer token depuis DB
4. **Vérification email** → Utiliser le token
5. **Modifier profil** → Tester la modification
6. **Connexion** → Obtenir nouveaux tokens
7. **Refresh token** → Tester le refresh
8. **Changement mot de passe** → Changer le mot de passe
9. **Connexion avec nouveau mot de passe** → Vérifier
10. **Mot de passe oublié** → Récupérer token depuis DB
11. **Réinitialisation mot de passe** → Utiliser le token
12. **Lister sessions** → Voir les sessions actives
13. **Révoquer session** → Révoquer une session
14. **Activer 2FA** → Scanner QR code, confirmer
15. **Connexion avec 2FA** → Utiliser tempToken + code
16. **Historique connexions** → Voir l'historique
17. **Déconnexion** → Tester la déconnexion
18. **Tests de sécurité** → Rate limiting, tokens invalides

---

## 🔍 Où Récupérer les Tokens ?

### Token de vérification email
1. Connectez-vous à phpMyAdmin
2. Sélectionnez la base `auth_db`
3. Ouvrez la table `VerificationToken`
4. Copiez le `token` de la ligne correspondante

### Token de réinitialisation mot de passe
1. Connectez-vous à phpMyAdmin
2. Sélectionnez la base `auth_db`
3. Ouvrez la table `PasswordResetToken`
4. Copiez le `token` de la ligne correspondante

---

## 🚨 Codes de Réponse Attendus

- **200** : Succès
- **201** : Créé avec succès (inscription)
- **400** : Données invalides
- **401** : Non authentifié / Token invalide
- **403** : Accès interdit (compte désactivé)
- **404** : Ressource non trouvée
- **409** : Conflit (email déjà utilisé)
- **429** : Trop de requêtes (rate limiting)

---

## 💡 Astuces Yaak

1. **Sauvegardez vos tokens** dans un fichier texte
2. **Utilisez les variables Yaak** pour stocker votre `accessToken`
3. **Vérifiez la base de données** après certains tests
4. **Testez les cas d'erreur** aussi (mauvais mot de passe, token invalide, etc.)

---

Pour plus de détails, consultez `YAAK_TEST_GUIDE.md`

