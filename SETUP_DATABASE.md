# Guide de création de la base de données avec XAMPP

## 🎯 Méthode 1 : Via phpMyAdmin (Recommandé - Plus simple)

### Étapes :

1. **Démarrer XAMPP**
   - Ouvrez le panneau de contrôle XAMPP
   - Démarrez **Apache** et **MySQL** (cliquez sur "Start")

2. **Ouvrir phpMyAdmin**
   - Ouvrez votre navigateur
   - Allez sur : `http://localhost/phpmyadmin`
   - Ou cliquez sur "Admin" à côté de MySQL dans XAMPP

3. **Créer la base de données**
   - Cliquez sur l'onglet **"Bases de données"** (ou "Databases")
   - Dans le champ **"Nom de la base de données"**, tapez : `auth_db`
   - Sélectionnez **"utf8mb4_unicode_ci"** dans le menu déroulant "Interclassement"
   - Cliquez sur **"Créer"** (ou "Create")

✅ **C'est fait !** La base de données `auth_db` est créée.

---

## 🎯 Méthode 2 : Via la ligne de commande MySQL

### Étapes :

1. **Ouvrir le terminal/CMD**
   - Appuyez sur `Windows + R`
   - Tapez `cmd` et appuyez sur Entrée

2. **Se connecter à MySQL**
   ```bash
   cd C:\xampp\mysql\bin
   mysql.exe -u root -p
   ```
   - Si vous n'avez pas de mot de passe, appuyez simplement sur Entrée
   - Si vous avez un mot de passe, entrez-le

3. **Créer la base de données**
   ```sql
   CREATE DATABASE auth_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

4. **Vérifier que c'est créé**
   ```sql
   SHOW DATABASES;
   ```
   Vous devriez voir `auth_db` dans la liste.

5. **Quitter MySQL**
   ```sql
   EXIT;
   ```

---

## 🎯 Méthode 3 : Via un fichier SQL

### Étapes :

1. **Créer un fichier SQL**
   - Créez un fichier `create_database.sql` avec ce contenu :
   ```sql
   CREATE DATABASE IF NOT EXISTS auth_db 
   CHARACTER SET utf8mb4 
   COLLATE utf8mb4_unicode_ci;
   ```

2. **Exécuter le fichier**
   - Ouvrez le terminal dans le dossier où se trouve le fichier
   - Exécutez :
   ```bash
   cd C:\xampp\mysql\bin
   mysql.exe -u root -p < chemin\vers\create_database.sql
   ```

---

## ⚙️ Configuration dans .env

Une fois la base de données créée, configurez votre fichier `.env` :

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=auth_db
DB_USER=root
DB_PASSWORD=
```

**Note :** Si vous avez défini un mot de passe pour MySQL dans XAMPP, ajoutez-le dans `DB_PASSWORD`.

---

## ✅ Vérification

Pour vérifier que tout fonctionne :

1. **Testez la connexion depuis Node.js**
   ```bash
   npm start
   ```
   
   Vous devriez voir :
   ```
   ✅ Connexion à la base de données établie avec succès.
   ✅ Base de données synchronisée.
   🚀 Serveur démarré sur le port 3000
   ```

2. **Vérifiez dans phpMyAdmin**
   - Allez sur `http://localhost/phpmyadmin`
   - Cliquez sur `auth_db` dans le menu de gauche
   - Vous devriez voir les tables créées automatiquement :
     - `User`
     - `OAuthAccount`
     - `RefreshToken`
     - `BlacklistedAccessToken`
     - `VerificationToken`
     - `PasswordResetToken`
     - `LoginHistory`

---

## 🐛 Problèmes courants

### Erreur : "Access denied for user 'root'@'localhost'"

**Solution :**
- Vérifiez que MySQL est démarré dans XAMPP
- Si vous avez un mot de passe, ajoutez-le dans `.env` :
  ```env
  DB_PASSWORD=votre_mot_de_passe
  ```

### Erreur : "Can't connect to MySQL server"

**Solution :**
- Vérifiez que MySQL est démarré dans XAMPP
- Vérifiez le port (par défaut 3306)
- Vérifiez que le service MySQL n'est pas déjà utilisé par un autre processus

### Erreur : "Unknown database 'auth_db'"

**Solution :**
- La base de données n'a pas été créée
- Suivez la Méthode 1 (phpMyAdmin) pour la créer

---

## 📝 Résumé rapide

**La méthode la plus simple :**
1. Démarrez XAMPP (Apache + MySQL)
2. Allez sur `http://localhost/phpmyadmin`
3. Cliquez sur "Bases de données"
4. Tapez `auth_db` et sélectionnez `utf8mb4_unicode_ci`
5. Cliquez sur "Créer"
6. ✅ Terminé !

