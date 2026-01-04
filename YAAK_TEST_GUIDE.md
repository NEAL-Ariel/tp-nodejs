# Guide de Test avec Yaak - API d'Authentification

Ce guide vous permet de tester toutes les fonctionnalités de l'API avec Yaak.

**Base URL:** `http://localhost:3000/api`

---

## 📋 Prérequis

1. Démarrer le serveur : `node server.js`
2. S'assurer que MySQL est démarré (XAMPP)
3. Ouvrir Yaak dans votre navigateur

---

## 🔐 1. AUTHENTIFICATION DE BASE

### 1.1 Inscription (Register)

**Méthode:** `POST`  
**URL:** `http://localhost:3000/api/auth/register`

**Onglet Headers:**
```
Content-Type: application/json
```

**Onglet Body (JSON):**
```json
{
  "email": "test@example.com",
  "password": "SecurePassword123!",
  "firstName": "Test",
  "lastName": "User"
}
```

**Résultat attendu:**
- Code: `201`
- Réponse contient `accessToken` et `refreshToken`
- **IMPORTANT:** Copiez le `accessToken` et `refreshToken` pour les tests suivants

---

### 1.2 Connexion (Login)

**Méthode:** `POST`  
**URL:** `http://localhost:3000/api/auth/login`

**Onglet Headers:**
```
Content-Type: application/json
```

**Onglet Body (JSON):**
```json
{
  "email": "test@example.com",
  "password": "SecurePassword123!"
}
```

**Résultat attendu:**
- Code: `200`
- Réponse contient `accessToken` et `refreshToken`

---

### 1.3 Déconnexion (Logout)

**Méthode:** `POST`  
**URL:** `http://localhost:3000/api/auth/logout`

**Onglet Headers:**
```
Authorization: Bearer VOTRE_ACCESS_TOKEN
Content-Type: application/json
```

**Onglet Body (JSON):**
```json
{
  "refreshToken": "VOTRE_REFRESH_TOKEN"
}
```

**Résultat attendu:**
- Code: `200`
- Message: "Déconnexion réussie"

**⚠️ Problème : "Token invalide ou expiré" ?**

Si vous obtenez cette erreur, c'est que votre access token a expiré (ils expirent après 15 minutes). Solutions :

1. **Utiliser le refresh token pour obtenir un nouveau access token** (voir section 1.4)
2. **Se reconnecter** pour obtenir de nouveaux tokens (voir section 1.2)
3. **Vérifier le format du header** : assurez-vous d'avoir `Bearer ` (avec l'espace) avant le token

---

### 1.4 Refresh Token

**Méthode:** `POST`  
**URL:** `http://localhost:3000/api/auth/refresh`

**Onglet Headers:**
```
Content-Type: application/json
```

**Onglet Body (JSON):**
```json
{
  "refreshToken": "VOTRE_REFRESH_TOKEN"
}
```

**Résultat attendu:**
- Code: `200`
- Réponse contient un nouveau `accessToken`

**⚠️ Problème : "Refresh token invalide" ?**

Si vous obtenez cette erreur, cela peut signifier :
1. Le refresh token a expiré (ils expirent après 7 jours)
2. Le refresh token a été révoqué (après une déconnexion ou changement de mot de passe)
3. Le token n'est pas au bon format

**Solution :** Reconnectez-vous pour obtenir de nouveaux tokens (voir section 1.2)

---

### 1.5 Mot de passe oublié (Forgot Password)

**Méthode:** `POST`  
**URL:** `http://localhost:3000/api/auth/forgot-password`

**Onglet Headers:**
```
Content-Type: application/json
```

**Onglet Body (JSON):**
```json
{
  "email": "test@example.com"
}
```

**Résultat attendu:**
- Code: `200`
- Message: "Si cet email existe, un lien de réinitialisation a été envoyé"
- **IMPORTANT:** Récupérez le token depuis la table `PasswordResetToken` dans phpMyAdmin

---

### 1.6 Réinitialisation du mot de passe (Reset Password)

**Méthode:** `POST`  
**URL:** `http://localhost:3000/api/auth/reset-password`

**Onglet Headers:**
```
Content-Type: application/json
```

**Onglet Body (JSON):**
```json
{
  "token": "TOKEN_DEPUIS_PASSWORD_RESET_TOKEN_TABLE",
  "newPassword": "NewSecurePassword456!"
}
```

**Résultat attendu:**
- Code: `200`
- Message: "Mot de passe réinitialisé avec succès"

---

### 1.7 Changement de mot de passe (Change Password)

**Méthode:** `POST`  
**URL:** `http://localhost:3000/api/auth/change-password`

**Onglet Headers:**
```
Authorization: Bearer VOTRE_ACCESS_TOKEN
Content-Type: application/json
```

**Onglet Body (JSON):**
```json
{
  "currentPassword": "SecurePassword123!",
  "newPassword": "NewSecurePassword789!"
}
```

**Résultat attendu:**
- Code: `200`
- Message: "Mot de passe modifié avec succès"

---

## 📧 2. VÉRIFICATION EMAIL

### 2.1 Envoi d'email de vérification (Send Verification)

**Méthode:** `POST`  
**URL:** `http://localhost:3000/api/auth/send-verification`

**Onglet Headers:**
```
Authorization: Bearer VOTRE_ACCESS_TOKEN
```

**Résultat attendu:**
- Code: `200`
- Message: "Email de vérification envoyé"
- **IMPORTANT:** Récupérez le token depuis la table `VerificationToken` dans phpMyAdmin

---

### 2.2 Vérification de l'email (Verify Email)

**Méthode:** `POST`  
**URL:** `http://localhost:3000/api/auth/verify`

**Onglet Headers:**
```
Content-Type: application/json
```

**Onglet Body (JSON):**
```json
{
  "token": "TOKEN_DEPUIS_VERIFICATION_TOKEN_TABLE"
}
```

**Résultat attendu:**
- Code: `200`
- Message: "Email vérifié avec succès"

---

## 🔑 3. OAUTH (GOOGLE OU GITHUB)

### 3.1 Connexion OAuth - Google

**Méthode:** `GET`  
**URL:** `http://localhost:3000/api/auth/oauth/google`

**Onglet Headers:**
```
(Aucun header nécessaire)
```

**Note:** Cette route redirige vers Google pour l'authentification. Ouvrez cette URL dans votre navigateur.

---

### 3.2 Connexion OAuth - GitHub

**Méthode:** `GET`  
**URL:** `http://localhost:3000/api/auth/oauth/github`

**Onglet Headers:**
```
(Aucun header nécessaire)
```

**Note:** Cette route redirige vers GitHub pour l'authentification. Ouvrez cette URL dans votre navigateur.

---

## 🔒 4. AUTHENTIFICATION À DEUX FACTEURS (2FA)

### 4.1 Activer 2FA (Étape 1 - Génération du secret)

**Méthode:** `POST`  
**URL:** `http://localhost:3000/api/auth/2fa/enable`

**Onglet Headers:**
```
Authorization: Bearer VOTRE_ACCESS_TOKEN
Content-Type: application/json
```

**Onglet Body (JSON):**
```json
{}
```

**Résultat attendu:**
- Code: `200`
- Réponse contient `secret`, `qrCode` (image base64), et `manualEntryKey`
- **IMPORTANT:** Scannez le QR code avec Google Authenticator ou une app similaire

---

### 4.2 Activer 2FA (Étape 2 - Confirmation avec code)

**Méthode:** `POST`  
**URL:** `http://localhost:3000/api/auth/2fa/enable`

**Onglet Headers:**
```
Authorization: Bearer VOTRE_ACCESS_TOKEN
Content-Type: application/json
```

**Onglet Body (JSON):**
```json
{
  "token": "123456"
}
```

**Note:** Remplacez `123456` par le code à 6 chiffres de votre application d'authentification.

**Résultat attendu:**
- Code: `200`
- Message: "2FA activé avec succès"

---

### 4.3 Vérification 2FA à la connexion

**Étape 1 - Connexion (retourne un tempToken):**

**Méthode:** `POST`  
**URL:** `http://localhost:3000/api/auth/login`

**Onglet Headers:**
```
Content-Type: application/json
```

**Onglet Body (JSON):**
```json
{
  "email": "test@example.com",
  "password": "SecurePassword123!"
}
```

**Résultat attendu:**
- Code: `200`
- Réponse contient `tempToken` et `requires2FA: true`

**Étape 2 - Vérifier le code 2FA:**

**Méthode:** `POST`  
**URL:** `http://localhost:3000/api/auth/2fa/verify`

**Onglet Headers:**
```
Content-Type: application/json
```

**Onglet Body (JSON):**
```json
{
  "tempToken": "TEMP_TOKEN_DE_L_ETAPE_1",
  "token": "123456"
}
```

**Note:** Remplacez `123456` par le code à 6 chiffres de votre application d'authentification.

**Résultat attendu:**
- Code: `200`
- Réponse contient `accessToken` et `refreshToken`

---

### 4.4 Désactiver 2FA

**Méthode:** `POST`  
**URL:** `http://localhost:3000/api/auth/2fa/disable`

**Onglet Headers:**
```
Authorization: Bearer VOTRE_ACCESS_TOKEN
Content-Type: application/json
```

**Onglet Body (JSON):**
```json
{
  "token": "123456"
}
```

**Note:** Remplacez `123456` par le code à 6 chiffres de votre application d'authentification.

**Résultat attendu:**
- Code: `200`
- Message: "2FA désactivé avec succès"

---

## 👤 5. GESTION DU PROFIL

### 5.1 Consulter son profil (Get Profile)

**Méthode:** `GET`  
**URL:** `http://localhost:3000/api/me`

**Onglet Headers:**
```
Authorization: Bearer VOTRE_ACCESS_TOKEN
```

**Résultat attendu:**
- Code: `200`
- Réponse contient toutes les informations du profil utilisateur

---

### 5.2 Modifier son profil (Update Profile)

**Méthode:** `PATCH`  
**URL:** `http://localhost:3000/api/me`

**Onglet Headers:**
```
Authorization: Bearer VOTRE_ACCESS_TOKEN
Content-Type: application/json
```

**Onglet Body (JSON):**
```json
{
  "firstName": "John",
  "lastName": "Doe"
}
```

**Résultat attendu:**
- Code: `200`
- Message: "Profil mis à jour avec succès"

---

### 5.3 Supprimer son compte (Delete Account)

**Méthode:** `DELETE`  
**URL:** `http://localhost:3000/api/me`

**Onglet Headers:**
```
Authorization: Bearer VOTRE_ACCESS_TOKEN
Content-Type: application/json
```

**Onglet Body (JSON):**
```json
{
  "password": "SecurePassword123!"
}
```

**Résultat attendu:**
- Code: `200`
- Message: "Compte supprimé avec succès"

---

## 📊 6. GESTION DES SESSIONS

### 6.1 Lister ses sessions actives

**Méthode:** `GET`  
**URL:** `http://localhost:3000/api/sessions`

**Onglet Headers:**
```
Authorization: Bearer VOTRE_ACCESS_TOKEN
```

**Résultat attendu:**
- Code: `200`
- Réponse contient la liste des sessions actives avec IP, user agent, dates

---

### 6.2 Révoquer une session spécifique

**Méthode:** `DELETE`  
**URL:** `http://localhost:3000/api/sessions/1`

**Note:** Remplacez `1` par l'ID de la session à révoquer (trouvé dans la liste des sessions).

**Onglet Headers:**
```
Authorization: Bearer VOTRE_ACCESS_TOKEN
```

**Résultat attendu:**
- Code: `200`
- Message: "Session révoquée avec succès"

---

### 6.3 Révoquer toutes les autres sessions

**Méthode:** `DELETE`  
**URL:** `http://localhost:3000/api/sessions/others/revoke`

**Onglet Headers:**
```
Authorization: Bearer VOTRE_ACCESS_TOKEN
Content-Type: application/json
```

**Onglet Body (JSON):**
```json
{
  "currentSessionId": 1
}
```

**Note:** Remplacez `1` par l'ID de votre session actuelle (celle que vous voulez garder).

**Résultat attendu:**
- Code: `200`
- Message: "Toutes les autres sessions ont été révoquées"

---

## 📈 7. HISTORIQUE DES CONNEXIONS

### 7.1 Consulter l'historique des connexions

**Méthode:** `GET`  
**URL:** `http://localhost:3000/api/me/history?limit=10&offset=0`

**Onglet Headers:**
```
Authorization: Bearer VOTRE_ACCESS_TOKEN
```

**Paramètres de requête (Query Parameters):**
- `limit` (optionnel, défaut: 50) : Nombre d'éléments à retourner
- `offset` (optionnel, défaut: 0) : Décalage pour la pagination

**Résultat attendu:**
- Code: `200`
- Réponse contient l'historique avec date, IP, appareil, succès/échec

---

## 🔒 8. TESTS DE SÉCURITÉ

### 8.1 Test du rate limiting (Brute-force protection)

Essayez de vous connecter 6 fois de suite avec un mauvais mot de passe :

**Méthode:** `POST`  
**URL:** `http://localhost:3000/api/auth/login`

**Onglet Headers:**
```
Content-Type: application/json
```

**Onglet Body (JSON):**
```json
{
  "email": "test@example.com",
  "password": "WrongPassword"
}
```

**Résultat attendu (après 5 tentatives):**
- Code: `429`
- Message: "Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes."

---

### 8.2 Test d'accès sans token

**Méthode:** `GET`  
**URL:** `http://localhost:3000/api/me`

**Onglet Headers:**
```
(Aucun header Authorization)
```

**Résultat attendu:**
- Code: `401`
- Message: "Token d'accès manquant"

---

### 8.3 Test d'accès avec token invalide

**Méthode:** `GET`  
**URL:** `http://localhost:3000/api/me`

**Onglet Headers:**
```
Authorization: Bearer token_invalide_12345
```

**Résultat attendu:**
- Code: `401`
- Message: "Token invalide ou expiré"

---

### 8.4 Test d'accès avec token révoqué (après logout)

1. Connectez-vous et récupérez un `accessToken`
2. Déconnectez-vous avec ce token
3. Essayez d'utiliser ce même token

**Méthode:** `GET`  
**URL:** `http://localhost:3000/api/me`

**Onglet Headers:**
```
Authorization: Bearer TOKEN_REVOQUE
```

**Résultat attendu:**
- Code: `401`
- Message: "Token révoqué"

---

## 📝 CHECKLIST DE VÉRIFICATION

### ✅ Authentification de Base
- [ ] Inscription
- [ ] Connexion
- [ ] Déconnexion
- [ ] Refresh token
- [ ] Mot de passe oublié (envoi d'email)
- [ ] Réinitialisation du mot de passe
- [ ] Changement de mot de passe

### ✅ Vérification Email
- [ ] Envoi d'email de vérification
- [ ] Vérification de l'email

### ✅ OAuth
- [ ] Connexion via Google (ou GitHub)

### ✅ 2FA
- [ ] Activation du 2FA
- [ ] Vérification du code 2FA à la connexion
- [ ] Désactivation du 2FA

### ✅ Gestion du Profil
- [ ] Consulter son profil
- [ ] Modifier son profil
- [ ] Supprimer son compte

### ✅ Gestion des Sessions
- [ ] Lister ses sessions actives
- [ ] Révoquer une session spécifique
- [ ] Révoquer toutes les autres sessions

### ✅ Historique des Connexions
- [ ] Consulter l'historique des connexions

### ✅ Sécurité
- [ ] Rate limiting (protection brute-force)
- [ ] Test d'accès sans token
- [ ] Test d'accès avec token invalide
- [ ] Test d'accès avec token révoqué

---

## 💡 Conseils pour Yaak

1. **Sauvegardez vos tokens:** Après chaque connexion/inscription, copiez le `accessToken` et `refreshToken` dans un fichier texte pour les réutiliser.

2. **Variables Yaak:** Yaak permet de sauvegarder des variables. Utilisez-les pour stocker votre `accessToken` et éviter de le copier-coller à chaque fois.

3. **Vérification en base de données:** Après certains tests (inscription, vérification email, etc.), vérifiez les tables dans phpMyAdmin pour confirmer que les données sont bien enregistrées.

4. **Ordre des tests:** Suivez l'ordre suggéré car certains tests dépendent des précédents (par exemple, vous devez vous inscrire avant de pouvoir vous connecter).

5. **Tests d'erreur:** N'hésitez pas à tester les cas d'erreur (mauvais mot de passe, token invalide, etc.) pour vérifier que les validations fonctionnent correctement.

---

## 🐛 Dépannage

### Erreur "Route non trouvée"
- Vérifiez que l'URL est correcte
- Vérifiez que le serveur est démarré
- Vérifiez que vous utilisez la bonne méthode HTTP (GET, POST, DELETE, PATCH)

### Erreur "Token d'accès manquant" ou "Token invalide" ou "Token invalide ou expiré"
- **Cause la plus fréquente :** Le token a expiré (les access tokens expirent après 15 minutes)
- **Solutions :**
  1. Utilisez le endpoint `/auth/refresh` avec votre refresh token pour obtenir un nouveau access token
  2. Ou reconnectez-vous pour obtenir de nouveaux tokens
- Vérifiez que vous avez bien ajouté le header `Authorization: Bearer VOTRE_TOKEN`
- **Important :** Assurez-vous d'avoir un espace après `Bearer` dans le header
- Vérifiez que vous n'avez pas copié d'espaces en trop dans le token

### Erreur "Token révoqué"
- Cela signifie que vous avez déjà utilisé ce token pour vous déconnecter
- Obtenez un nouveau token en vous reconnectant

### Erreur "Refresh token invalide"
- **Causes possibles :**
  1. Le refresh token a expiré (durée de vie : 7 jours)
  2. Le refresh token a été révoqué (déconnexion, changement de mot de passe, réinitialisation)
  3. Le token n'est pas au bon format ou corrompu
  4. Le token n'existe plus en base de données
- **Solution :** Reconnectez-vous pour obtenir de nouveaux tokens frais
- **Note :** Après une réinitialisation de mot de passe, tous les refresh tokens sont révoqués automatiquement

### Erreur de connexion à la base de données
- Vérifiez que MySQL est démarré dans XAMPP
- Vérifiez les variables d'environnement dans `.env`
- Exécutez `node CHECK_CONNECTION.js` pour tester la connexion

---

**Bon test ! 🚀**

