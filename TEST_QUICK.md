# Tests rapides - Vérification minimale

Guide de tests rapides pour vérifier que l'API fonctionne.

## 🚀 Démarrage rapide

### 1. Démarrer le serveur
```bash
node server.js
```

### 2. Tester la santé
```bash
curl http://localhost:3000/health
```

### 3. Inscription
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

**Sauvegardez le `accessToken` et `refreshToken` retournés !**

### 4. Connexion
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 5. Profil (avec token)
```bash
curl -X GET http://localhost:3000/api/me \
  -H "Authorization: Bearer VOTRE_ACCESS_TOKEN"
```

### 6. Refresh token
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "VOTRE_REFRESH_TOKEN"
  }'
```

### 7. Déconnexion
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer VOTRE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "VOTRE_REFRESH_TOKEN"
  }'
```

---

## ✅ Vérifications dans phpMyAdmin

1. Allez sur `http://localhost/phpmyadmin`
2. Sélectionnez `auth_db`
3. Vérifiez les tables :
   - **User** : 1 utilisateur
   - **RefreshToken** : 1+ tokens
   - **LoginHistory** : 2+ enregistrements (inscription + connexion)

---

## 🎯 Tests essentiels réussis ?

Si ces 7 tests fonctionnent, votre API de base est opérationnelle !

Pour des tests complets, voir `VERIFICATION_GUIDE.md`


