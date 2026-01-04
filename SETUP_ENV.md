# Guide de configuration du fichier .env

## 🎯 Créer le fichier .env

Le fichier `.env` contient toutes vos variables d'environnement sensibles. Il n'est **pas** versionné dans Git pour des raisons de sécurité.

### Méthode 1 : Copie manuelle (Recommandé)

1. **Copiez le fichier `.env.example`**
   - Renommez-le en `.env`
   - Ou copiez son contenu dans un nouveau fichier `.env`

2. **Éditez le fichier `.env`** avec vos valeurs

### Méthode 2 : Script automatique

Exécutez le script :
```bash
node create_env.js
```

Ce script copie automatiquement `.env.example` vers `.env`.

---

## ⚙️ Configuration minimale pour démarrer

Pour tester rapidement, vous n'avez besoin que de ces variables :

```env
# Database - Configuration XAMPP
DB_HOST=localhost
DB_PORT=3306
DB_NAME=auth_db
DB_USER=root
DB_PASSWORD=

# Server
NODE_ENV=development
PORT=3000

# JWT (changez en production !)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

---

## 📋 Configuration complète

### 1. Base de données (XAMPP)

```env
DB_HOST=localhost          # Par défaut pour XAMPP
DB_PORT=3306              # Port MySQL par défaut
DB_NAME=auth_db           # Nom de votre base de données
DB_USER=root              # Utilisateur MySQL par défaut
DB_PASSWORD=              # Laissez vide si pas de mot de passe
```

**Note :** Si vous avez défini un mot de passe pour MySQL dans XAMPP, ajoutez-le dans `DB_PASSWORD`.

### 2. JWT (JSON Web Tokens)

```env
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_ACCESS_EXPIRES_IN=15m    # Durée de vie du access token
JWT_REFRESH_EXPIRES_IN=7d    # Durée de vie du refresh token
```

**⚠️ IMPORTANT :** Changez `JWT_SECRET` en production avec une clé aléatoire forte !

### 3. Email (Optionnel pour commencer)

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@yourapp.com
```

**Pour Gmail :**
1. Activez la validation en 2 étapes
2. Créez un "App Password" : https://myaccount.google.com/apppasswords
3. Utilisez cet App Password dans `SMTP_PASS`

### 4. OAuth (Optionnel)

#### Google OAuth
```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/oauth/callback/google
```

**Obtenir les credentials :**
1. Allez sur https://console.cloud.google.com/
2. Créez un projet
3. Activez l'API Google+
4. Créez des identifiants OAuth 2.0

#### GitHub OAuth
```env
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=http://localhost:3000/api/auth/oauth/callback/github
```

**Obtenir les credentials :**
1. Allez sur https://github.com/settings/developers
2. Créez une nouvelle OAuth App
3. Utilisez les Client ID et Secret

### 5. URLs de l'application

```env
FRONTEND_URL=http://localhost:3000
API_BASE_URL=http://localhost:3000/api
```

### 6. Rate Limiting

```env
RATE_LIMIT_WINDOW_MS=900000      # 15 minutes en millisecondes
RATE_LIMIT_MAX_REQUESTS=5        # 5 tentatives max
```

---

## ✅ Vérification

Après avoir créé votre `.env`, testez la connexion :

```bash
node CHECK_CONNECTION.js
```

Ou démarrez le serveur :

```bash
npm start
```

Vous devriez voir :
```
✅ Connexion à la base de données établie avec succès.
✅ Base de données synchronisée.
🚀 Serveur démarré sur le port 3000
```

---

## 🔒 Sécurité

### ⚠️ Ne jamais commiter le fichier .env

Le fichier `.env` est déjà dans `.gitignore` pour éviter qu'il soit versionné.

### ✅ Bonnes pratiques

1. **Ne partagez jamais** votre fichier `.env`
2. **Changez tous les secrets** en production
3. **Utilisez des secrets forts** pour JWT_SECRET
4. **Ne mettez pas de secrets** dans le code source
5. **Utilisez des variables d'environnement** différentes pour dev/prod

---

## 🐛 Problèmes courants

### Erreur : "Cannot find module 'dotenv'"

**Solution :**
```bash
npm install
```

### Erreur : "Access denied for user 'root'@'localhost'"

**Solution :**
- Vérifiez que MySQL est démarré dans XAMPP
- Vérifiez `DB_USER` et `DB_PASSWORD` dans `.env`

### Les variables ne sont pas chargées

**Solution :**
- Vérifiez que le fichier s'appelle bien `.env` (pas `.env.txt`)
- Vérifiez qu'il est à la racine du projet
- Redémarrez le serveur après modification

---

## 📝 Exemple de fichier .env complet

Voir le fichier `.env.example` pour un exemple complet avec tous les commentaires.

