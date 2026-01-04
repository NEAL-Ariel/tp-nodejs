# Guide complet : Connexion et création des tables

## 🎯 Vue d'ensemble

Votre code utilise **Sequelize ORM** qui crée **automatiquement** toutes les tables au démarrage. Vous n'avez qu'à :
1. Créer la base de données vide
2. Configurer le fichier `.env`
3. Démarrer le serveur → Les tables sont créées automatiquement !

---

## 📋 Étape 1 : Créer la base de données vide

### Option A : Via phpMyAdmin (Recommandé)

1. **Démarrez XAMPP** (Apache + MySQL)
2. **Ouvrez phpMyAdmin** : `http://localhost/phpmyadmin`
3. **Créez la base de données** :
   - Cliquez sur "Bases de données"
   - Nom : `auth_db`
   - Interclassement : `utf8mb4_unicode_ci`
   - Cliquez sur "Créer"

✅ **C'est tout !** Vous n'avez besoin que d'une base de données **vide**.

---

## ⚙️ Étape 2 : Configurer le fichier .env

Créez un fichier `.env` à la racine du projet avec cette configuration :

```env
# Server
NODE_ENV=development
PORT=3000

# Database - CONFIGURATION XAMPP
DB_HOST=localhost
DB_PORT=3306
DB_NAME=auth_db
DB_USER=root
DB_PASSWORD=

# JWT (Changez en production !)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email (Optionnel pour commencer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@yourapp.com

# OAuth (Optionnel)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/oauth/callback/google

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_CALLBACK_URL=http://localhost:3000/api/auth/oauth/callback/github

# App URLs
FRONTEND_URL=http://localhost:3000
API_BASE_URL=http://localhost:3000/api

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=5
```

### ⚠️ Important pour XAMPP

- **DB_PASSWORD** : Laissez vide si vous n'avez pas de mot de passe MySQL
- Si vous avez un mot de passe, ajoutez-le : `DB_PASSWORD=votre_mot_de_passe`

---

## 🚀 Étape 3 : Démarrer le serveur (Création automatique des tables)

### Installer les dépendances (si pas déjà fait)
```bash
npm install
```

### Démarrer le serveur
```bash
npm start
```

ou en mode développement :
```bash
npm run dev
```

### ✨ Ce qui se passe automatiquement

Quand vous démarrez le serveur, voici ce qui se passe :

1. **Connexion à MySQL** : Le code se connecte à `auth_db`
2. **Création automatique des tables** : Sequelize crée toutes les tables selon vos modèles
3. **Création des relations** : Les clés étrangères sont créées
4. **Création des index** : Les contraintes uniques sont créées

Vous verrez dans la console :
```
✅ Connexion à la base de données établie avec succès.
✅ Base de données synchronisée.
🚀 Serveur démarré sur le port 3000
```

---

## 📊 Tables créées automatiquement

Voici les 7 tables qui seront créées :

1. **User** - Utilisateurs
2. **OAuthAccount** - Comptes OAuth liés
3. **RefreshToken** - Refresh tokens (whitelist)
4. **BlacklistedAccessToken** - Access tokens révoqués
5. **VerificationToken** - Tokens de vérification email
6. **PasswordResetToken** - Tokens de réinitialisation
7. **LoginHistory** - Historique des connexions

### Structure des tables

Toutes les colonnes, types, contraintes et relations sont créés automatiquement selon vos modèles dans le dossier `models/`.

---

## ✅ Étape 4 : Vérifier que tout fonctionne

### 1. Vérifier dans phpMyAdmin

1. Allez sur `http://localhost/phpmyadmin`
2. Cliquez sur `auth_db` dans le menu de gauche
3. Vous devriez voir **7 tables** créées :
   - User
   - OAuthAccount
   - RefreshToken
   - BlacklistedAccessToken
   - VerificationToken
   - PasswordResetToken
   - LoginHistory

### 2. Tester l'API

Ouvrez un terminal et testez :

```bash
# Test de santé
curl http://localhost:3000/health

# Inscription (crée un utilisateur dans la table User)
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

Si vous voyez une réponse JSON avec `"success": true`, tout fonctionne ! 🎉

---

## 🔍 Comment ça marche techniquement ?

### Le fichier `config/database.js`

Ce fichier configure Sequelize pour se connecter à MySQL :

```javascript
const sequelize = new Sequelize(
  process.env.DB_NAME,      // auth_db
  process.env.DB_USER,      // root
  process.env.DB_PASSWORD, // (vide pour XAMPP)
  {
    host: process.env.DB_HOST,  // localhost
    port: process.env.DB_PORT,   // 3306
    dialect: 'mysql'
  }
);
```

### Le fichier `server.js`

Au démarrage, le serveur :

1. **Teste la connexion** :
   ```javascript
   await testConnection(); // Vérifie que MySQL répond
   ```

2. **Synchronise les modèles** (en mode développement) :
   ```javascript
   await syncDatabase(false); // Crée les tables si elles n'existent pas
   ```

3. **Les modèles dans `models/`** définissent la structure :
   - Chaque fichier (User.js, RefreshToken.js, etc.) définit une table
   - Sequelize lit ces définitions et crée les tables SQL

---

## 🛠️ Option : Créer les tables manuellement (si besoin)

Si vous préférez créer les tables manuellement, voici le script SQL :

### Script SQL complet

```sql
-- Utiliser la base de données
USE auth_db;

-- Table User
CREATE TABLE IF NOT EXISTS User (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255),
  firstName VARCHAR(100) NOT NULL,
  lastName VARCHAR(100) NOT NULL,
  emailVerifiedAt DATETIME,
  twoFactorSecret VARCHAR(255),
  twoFactorEnabledAt DATETIME,
  disabledAt DATETIME,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table OAuthAccount
CREATE TABLE IF NOT EXISTS OAuthAccount (
  id INT AUTO_INCREMENT PRIMARY KEY,
  provider ENUM('google', 'github') NOT NULL,
  providerId VARCHAR(255) NOT NULL,
  userId INT NOT NULL,
  createdAt DATETIME NOT NULL,
  FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
  UNIQUE KEY unique_provider_providerId (provider, providerId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table RefreshToken
CREATE TABLE IF NOT EXISTS RefreshToken (
  id INT AUTO_INCREMENT PRIMARY KEY,
  token VARCHAR(500) UNIQUE NOT NULL,
  userId INT NOT NULL,
  userAgent VARCHAR(500),
  ipAddress VARCHAR(45),
  expiresAt DATETIME NOT NULL,
  revokedAt DATETIME,
  createdAt DATETIME NOT NULL,
  FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table BlacklistedAccessToken
CREATE TABLE IF NOT EXISTS BlacklistedAccessToken (
  id INT AUTO_INCREMENT PRIMARY KEY,
  token VARCHAR(500) UNIQUE NOT NULL,
  userId INT NOT NULL,
  expiresAt DATETIME NOT NULL,
  createdAt DATETIME NOT NULL,
  FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table VerificationToken
CREATE TABLE IF NOT EXISTS VerificationToken (
  id INT AUTO_INCREMENT PRIMARY KEY,
  token VARCHAR(255) UNIQUE NOT NULL,
  userId INT NOT NULL,
  expiresAt DATETIME NOT NULL,
  createdAt DATETIME NOT NULL,
  FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table PasswordResetToken
CREATE TABLE IF NOT EXISTS PasswordResetToken (
  id INT AUTO_INCREMENT PRIMARY KEY,
  token VARCHAR(255) UNIQUE NOT NULL,
  userId INT NOT NULL,
  expiresAt DATETIME NOT NULL,
  createdAt DATETIME NOT NULL,
  FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table LoginHistory
CREATE TABLE IF NOT EXISTS LoginHistory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT,
  email VARCHAR(255),
  ipAddress VARCHAR(45),
  userAgent VARCHAR(500),
  success BOOLEAN NOT NULL DEFAULT FALSE,
  createdAt DATETIME NOT NULL,
  FOREIGN KEY (userId) REFERENCES User(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Comment exécuter ce script

1. **Via phpMyAdmin** :
   - Allez sur `http://localhost/phpmyadmin`
   - Sélectionnez `auth_db`
   - Cliquez sur l'onglet "SQL"
   - Collez le script et cliquez sur "Exécuter"

2. **Via ligne de commande** :
   ```bash
   cd C:\xampp\mysql\bin
   mysql.exe -u root auth_db < chemin\vers\script.sql
   ```

---

## 🐛 Résolution de problèmes

### Erreur : "Access denied for user 'root'@'localhost'"

**Solution :**
- Vérifiez que MySQL est démarré dans XAMPP
- Vérifiez votre `.env` :
  ```env
  DB_USER=root
  DB_PASSWORD=  # Laissez vide si pas de mot de passe
  ```

### Erreur : "Unknown database 'auth_db'"

**Solution :**
- Créez la base de données d'abord (voir Étape 1)
- Vérifiez le nom dans `.env` : `DB_NAME=auth_db`

### Erreur : "Can't connect to MySQL server"

**Solution :**
- Vérifiez que MySQL est démarré dans XAMPP
- Vérifiez le port : `DB_PORT=3306`
- Vérifiez l'hôte : `DB_HOST=localhost`

### Les tables ne se créent pas

**Solution :**
- Vérifiez que `NODE_ENV=development` dans `.env`
- Vérifiez les logs dans la console pour voir les erreurs
- Assurez-vous que tous les modèles sont bien importés dans `models/index.js`

---

## 📝 Résumé rapide

1. ✅ **Créez la base de données vide** : `auth_db` dans phpMyAdmin
2. ✅ **Configurez `.env`** : DB_HOST, DB_NAME, DB_USER, DB_PASSWORD
3. ✅ **Démarrez le serveur** : `npm start`
4. ✅ **Les tables sont créées automatiquement** par Sequelize
5. ✅ **Vérifiez dans phpMyAdmin** : Vous devriez voir 7 tables

**C'est tout !** Sequelize fait le travail pour vous. 🎉

---

## 🔄 Réinitialiser la base de données

Si vous voulez tout recréer depuis zéro :

1. **Supprimez toutes les tables** dans phpMyAdmin
2. **Redémarrez le serveur** : Les tables seront recréées

Ou modifiez temporairement `server.js` :
```javascript
await syncDatabase(true); // true = force la recréation
```

⚠️ **Attention** : Cela supprime toutes les données !

---

## 📚 Pour aller plus loin

- **Migrations Sequelize** : Pour la production, utilisez des migrations au lieu de `sync()`
- **Seeds** : Créez des données de test avec des seeds
- **Backup** : Configurez des sauvegardes automatiques

Votre base de données est maintenant connectée et prête à être utilisée ! 🚀

