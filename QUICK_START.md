# Guide de démarrage rapide

## 🚀 Installation en 5 minutes

### 1. Installer les dépendances
```bash
npm install
```

### 2. Créer la base de données MySQL
```sql
CREATE DATABASE auth_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Configurer les variables d'environnement

Créez un fichier `.env` à la racine avec au minimum :

```env
# Database (minimum requis)
DB_NAME=auth_db
DB_USER=root
DB_PASSWORD=

# JWT (changez en production !)
JWT_SECRET=change-this-in-production-to-a-random-secret-key

# Email (optionnel pour commencer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@yourapp.com

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 4. Démarrer le serveur
```bash
npm run dev
```

Le serveur démarre sur `http://localhost:3000`

### 5. Tester l'API

#### Test de santé
```bash
curl http://localhost:3000/health
```

#### Inscription
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

## 📝 Prochaines étapes

1. **Configurer l'email** : Pour recevoir les emails de vérification
2. **Configurer OAuth** : Pour Google/GitHub (optionnel)
3. **Lire la documentation** : Voir `README.md` pour tous les endpoints
4. **Tester avec Postman** : Voir `POSTMAN_EXAMPLES.md`

## ⚠️ Important pour la production

1. Changez `JWT_SECRET` en un secret fort et aléatoire
2. Utilisez HTTPS
3. Configurez correctement CORS pour votre domaine
4. Utilisez des migrations au lieu de `sync()`
5. Activez les logs et le monitoring

## 🆘 Problèmes courants

### Erreur de connexion à la base de données
- Vérifiez que MySQL est démarré
- Vérifiez les credentials dans `.env`
- Vérifiez que la base de données existe

### Erreur d'envoi d'email
- Pour Gmail, créez un "App Password" dans votre compte Google
- Vérifiez que le port SMTP n'est pas bloqué

### Erreur "Token invalide"
- Vérifiez que le token n'est pas expiré (15 min pour access token)
- Utilisez le refresh token pour obtenir un nouvel access token

## 📚 Documentation complète

- `README.md` : Documentation complète de l'API
- `POSTMAN_EXAMPLES.md` : Exemples de requêtes Postman
- `SECURITY.md` : Architecture de sécurité détaillée
- `ARCHITECTURE.md` : Architecture technique

