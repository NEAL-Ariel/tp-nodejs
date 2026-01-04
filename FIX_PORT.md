# Résoudre l'erreur "Port 3000 déjà utilisé"

## 🔍 Problème

L'erreur `EADDRINUSE: address already in use :::3000` signifie qu'un autre processus utilise déjà le port 3000.

## ✅ Solutions

### Solution 1 : Trouver et arrêter le processus (Recommandé)

#### Sur Windows (PowerShell) :

**Étape 1 : Trouver le processus**
```powershell
netstat -ano | findstr :3000
```

Vous verrez quelque chose comme :
```
TCP    0.0.0.0:3000    0.0.0.0:0    LISTENING    12345
```

Le dernier nombre (12345) est le PID (Process ID).

**Étape 2 : Arrêter le processus**
```powershell
taskkill /PID 12345 /F
```

Remplacez `12345` par le PID que vous avez trouvé.

**Étape 3 : Redémarrer votre serveur**
```bash
node server.js
```

---

### Solution 2 : Changer le port de l'application

#### Option A : Modifier le fichier `.env`

Ajoutez ou modifiez dans votre `.env` :
```env
PORT=3001
```

Puis redémarrez :
```bash
node server.js
```

Le serveur démarrera sur le port 3001.

#### Option B : Modifier directement dans le code (temporaire)

Dans `server.js`, changez :
```javascript
const PORT = process.env.PORT || 3001; // Au lieu de 3000
```

---

### Solution 3 : Utiliser un autre terminal

Si vous avez déjà un serveur qui tourne dans un autre terminal, vous pouvez :
1. Utiliser ce terminal pour les tests
2. Ou arrêter l'ancien serveur (Ctrl+C)

---

## 🔍 Vérifier quel processus utilise le port

### Méthode PowerShell avancée :

```powershell
Get-NetTCPConnection -LocalPort 3000 | Select-Object OwningProcess
```

Puis trouver le nom du processus :
```powershell
Get-Process -Id 12345
```

---

## ✅ Vérification

Après avoir résolu le problème, vous devriez voir :
```
✅ Connexion à la base de données établie avec succès.
✅ Base de données synchronisée.
⚠️  SMTP non configuré - Les emails ne seront pas envoyés
🚀 Serveur démarré sur le port 3000
```

---

## 📝 Note sur l'erreur SMTP

L'erreur SMTP n'est **pas bloquante**. Elle signifie simplement que les credentials email ne sont pas configurés dans `.env`. 

Pour activer l'envoi d'emails, configurez dans `.env` :
```env
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

Mais ce n'est **pas obligatoire** pour tester l'API. Les autres fonctionnalités fonctionneront sans email.

