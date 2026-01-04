# Architecture de sécurité

Ce document explique les choix de sécurité et l'architecture de l'API d'authentification.

## 🔐 Architecture JWT

### Access Token vs Refresh Token

#### Access Token
- **Durée de vie** : 15 minutes (configurable via `JWT_ACCESS_EXPIRES_IN`)
- **Stockage** : Côté client (localStorage, sessionStorage, ou mémoire)
- **Usage** : Inclus dans le header `Authorization: Bearer <token>` pour chaque requête authentifiée
- **Blacklist** : Les tokens révoqués sont stockés dans `BlacklistedAccessToken` jusqu'à expiration
- **Contenu** :
  ```json
  {
    "userId": 1,
    "email": "user@example.com",
    "type": "access",
    "iat": 1234567890,
    "exp": 1234568790,
    "iss": "auth-api",
    "aud": "auth-api-users"
  }
  ```

#### Refresh Token
- **Durée de vie** : 7 jours (configurable via `JWT_REFRESH_EXPIRES_IN`)
- **Stockage** : Côté client (recommandé : httpOnly cookie en production)
- **Usage** : Utilisé uniquement pour obtenir un nouvel access token
- **Whitelist** : Tous les refresh tokens valides sont stockés dans `RefreshToken`
- **Révocation** : Peut être révoqué individuellement ou en masse
- **Contenu** :
  ```json
  {
    "userId": 1,
    "tokenId": 123, // ID du refresh token en DB
    "type": "refresh",
    "iat": 1234567890,
    "exp": 1234571490,
    "iss": "auth-api",
    "aud": "auth-api-users"
  }
  ```

### Flux d'authentification

```
1. Login/Register
   ↓
2. Génération de Access Token + Refresh Token
   ↓
3. Refresh Token stocké en DB (whitelist)
   ↓
4. Client utilise Access Token pour les requêtes
   ↓
5. Access Token expire (15 min)
   ↓
6. Client utilise Refresh Token pour obtenir un nouvel Access Token
   ↓
7. Nouvel Access Token généré (même Refresh Token réutilisé)
```

### Sécurité des tokens

#### Blacklist des Access Tokens
- **Pourquoi** : Permet de révoquer un access token avant son expiration naturelle
- **Implémentation** : Table `BlacklistedAccessToken` avec expiration automatique
- **Usage** : Lors de la déconnexion, changement de mot de passe, révocation de session
- **Nettoyage** : Les tokens expirés sont supprimés automatiquement toutes les heures

#### Whitelist des Refresh Tokens
- **Pourquoi** : Permet de révoquer des sessions et de détecter les tokens volés
- **Implémentation** : Table `RefreshToken` avec statut `revokedAt`
- **Avantages** :
  - Révocation immédiate de sessions
  - Traçabilité des sessions actives
  - Détection de tokens invalides même s'ils sont valides JWT

## 🔒 Sécurité des mots de passe

### Hashage avec bcrypt
- **Algorithme** : bcrypt avec 10 rounds (coût de calcul)
- **Avantages** :
  - Résistant aux attaques par force brute
  - Salt automatique et unique par mot de passe
  - Lent par design (décourage les attaques)
- **Implémentation** : Hooks Sequelize `beforeCreate` et `beforeUpdate`

### Validation
- **Longueur minimale** : 8 caractères
- **Longueur maximale** : 255 caractères
- **Validation** : Schéma Joi dans `middlewares/validation.js`

## 🛡️ Protection contre les attaques

### Rate Limiting

#### Authentification (Anti brute-force)
- **Limite** : 5 tentatives par 15 minutes
- **Scope** : Par IP + email
- **Comportement** : Ne compte que les échecs (`skipSuccessfulRequests: true`)
- **Implémentation** : `express-rate-limit` avec clé personnalisée

#### Emails
- **Limite** : 3 emails par heure
- **Scope** : Par IP + email
- **Protection** : Évite le spam d'emails de vérification/réinitialisation

#### Général
- **Limite** : 100 requêtes par 15 minutes
- **Scope** : Par IP
- **Protection** : Protection générale de l'API

### Historique des connexions
- **Enregistrement** : Chaque tentative de connexion (succès ou échec)
- **Données stockées** :
  - Email (même si utilisateur inexistant)
  - IP Address
  - User Agent
  - Statut (succès/échec)
  - Timestamp
- **Usage** : Détection d'intrusions, analyse de sécurité

### Validation des données
- **Bibliothèque** : Joi
- **Validation** : Toutes les entrées utilisateur
- **Avantages** :
  - Protection contre l'injection
  - Validation de type
  - Messages d'erreur clairs

## 🔐 Authentification à deux facteurs (2FA)

### TOTP (Time-based One-Time Password)
- **Standard** : RFC 6238
- **Compatible** : Google Authenticator, Authy, Microsoft Authenticator
- **Génération** : Secret base32 de 32 caractères
- **Validation** : Fenêtre de ±2 périodes (60 secondes)
- **QR Code** : Généré automatiquement pour faciliter l'activation

### Flux 2FA

```
1. Utilisateur active 2FA
   ↓
2. Génération d'un secret TOTP
   ↓
3. QR Code généré et affiché
   ↓
4. Utilisateur scanne avec app d'authentification
   ↓
5. Utilisateur entre le code pour confirmer
   ↓
6. 2FA activé
   ↓
7. Lors du login :
   - Login normal → tempToken
   - Vérification 2FA → Access + Refresh tokens
```

## 🌐 OAuth (Google & GitHub)

### Sécurité OAuth
- **Flow** : OAuth 2.0 Authorization Code Flow
- **State** : Devrait être implémenté pour prévenir les attaques CSRF
- **Scopes** : Limités au minimum nécessaire
  - Google : `profile`, `email`
  - GitHub : `user:email`

### Gestion des comptes
- **Liaison** : Un compte OAuth peut être lié à un compte existant (même email)
- **Création** : Création automatique si compte inexistant
- **Vérification email** : Automatique pour OAuth (emails vérifiés par le provider)

## 📧 Sécurité des emails

### Tokens temporaires
- **Vérification email** : Expire dans 24 heures
- **Réinitialisation mot de passe** : Expire dans 1 heure
- **Usage unique** : Tokens supprimés après utilisation
- **Génération** : Crypto aléatoire sécurisé (32 bytes → hex)

### Protection contre l'énumération
- **Mot de passe oublié** : Message identique si email existe ou non
- **Avantage** : Ne révèle pas si un email est enregistré

## 🗄️ Sécurité de la base de données

### Contraintes
- **Email unique** : Contrainte unique sur `User.email`
- **OAuth unique** : Contrainte unique sur `(provider, providerId)`
- **Tokens uniques** : Contraintes uniques sur tous les tokens

### Soft Delete
- **Suppression de compte** : `disabledAt` au lieu de suppression réelle
- **Avantages** :
  - Conservation de l'historique
  - Possibilité de restaurer
  - Intégrité référentielle

### Nettoyage automatique
- **Tokens expirés** : Suppression automatique toutes les heures
- **Tables concernées** :
  - `BlacklistedAccessToken`
  - `VerificationToken`
  - `PasswordResetToken`

## 🔒 Headers de sécurité

### Helmet
- **Content Security Policy** : Protection XSS
- **X-Frame-Options** : Protection clickjacking
- **X-Content-Type-Options** : Protection MIME sniffing
- **Strict-Transport-Security** : Force HTTPS (en production)

### CORS
- **Configuration** : Par origine en production
- **Credentials** : Support des cookies
- **Développement** : Toutes les origines autorisées

## 🚨 Bonnes pratiques implémentées

1. ✅ **Mots de passe hashés** avec bcrypt
2. ✅ **Tokens JWT avec expiration courte** (access) et longue (refresh)
3. ✅ **Blacklist des access tokens** révoqués
4. ✅ **Whitelist des refresh tokens** pour révocation
5. ✅ **Rate limiting** anti brute-force
6. ✅ **Validation stricte** des entrées
7. ✅ **Historique des connexions** pour audit
8. ✅ **2FA TOTP** pour sécurité renforcée
9. ✅ **Tokens temporaires** pour emails
10. ✅ **Protection contre l'énumération** d'emails
11. ✅ **Headers de sécurité** (Helmet)
12. ✅ **CORS configuré** correctement
13. ✅ **Soft delete** pour les comptes
14. ✅ **Nettoyage automatique** des tokens expirés

## ⚠️ Recommandations pour la production

1. **Changez `JWT_SECRET`** : Utilisez un secret fort et aléatoire
2. **HTTPS obligatoire** : Tous les tokens doivent transiter en HTTPS
3. **Cookies httpOnly** : Pour les refresh tokens en production
4. **Migrations** : Utilisez Sequelize migrations au lieu de `sync()`
5. **Monitoring** : Surveillez l'historique des connexions
6. **Logs** : Implémentez un système de logs complet
7. **Backup** : Sauvegardez régulièrement la base de données
8. **Tests** : Ajoutez des tests unitaires et d'intégration
9. **State OAuth** : Implémentez le paramètre `state` pour OAuth
10. **Secrets** : Utilisez un gestionnaire de secrets (AWS Secrets Manager, etc.)

## 📊 Métriques de sécurité

### À surveiller
- Nombre de tentatives de connexion échouées par IP
- Nombre de tokens révoqués
- Nombre de sessions actives par utilisateur
- Taux d'activation 2FA
- Temps de réponse des endpoints d'authentification

### Alertes recommandées
- Plus de 10 tentatives échouées en 1 heure depuis une IP
- Plus de 5 sessions actives pour un utilisateur
- Changement de mot de passe depuis une nouvelle IP
- Désactivation de 2FA

