# TP NodeJS – API Authentification

Projet réalisé dans le cadre du TP NodeJS + Express.  
L’objectif est de créer une API REST d’authentification complète avec plusieurs méthodes de connexion.

## 👥 Travail en groupe
Projet réalisé en groupe (4–5 personnes).

**Ma partie (Membre 5 – Aimé)** :
- Authentification OAuth
- Authentification à deux facteurs (2FA)
- Gestion des sessions

---

## 🚀 Technologies utilisées
- Node.js
- Express.js
- JWT
- OAuth (Google ou GitHub)
- 2FA TOTP (Speakeasy)
- Yaak / Postman pour les tests
- Git & GitHub

---

## 📂 Structure du projet

aime-tp/
│
├── index.js
├── package.json
├── package-lock.json
├── routes/
│ ├── sessions.js
│ ├── oauth.js
│ └── twofa.js
├── services/
│ └── twofa.service.js
└── node_modules/

## ⚙️ Installation et lancement du projet

### 1️⃣ Installer les dépendances
```bash
npm install
2️⃣ Lancer le serveur
bash
Copier le code
node index.js
Le serveur démarre sur :

arduino
Copier le code
http://localhost:3000
🔐 Authentification OAuth
📌 Description
Permet à un utilisateur de se connecter via un provider OAuth (Google ou GitHub).

📦 Routes
GET /auth/oauth/start
Démarre le processus OAuth.

GET /auth/oauth/callback
Callback appelé après l’authentification OAuth.

🔐 Authentification à Deux Facteurs (2FA)
📌 Description
Ajoute une couche de sécurité supplémentaire via un code temporaire (TOTP).

📦 Routes
POST /auth/2fa/enable
Active le 2FA et retourne un QR Code à scanner avec une application d’authentification.

POST /auth/2fa/verify
Vérifie le code généré par l’application (Google Authenticator, etc.).

POST /auth/2fa/disable
Désactive le 2FA.

🧪 Test
Les routes sont testées à l’aide de Yaak ou Postman.

🗂️ Gestion des Sessions
📌 Description
Permet de gérer les sessions actives d’un utilisateur.

📦 Routes
GET /sessions
Liste les sessions actives.

DELETE /sessions/:id
Révoque une session spécifique.

DELETE /sessions/others
Révoque toutes les autres sessions sauf la session courante.

🧪 Tests API
Toutes les routes de ma partie ont été testées avec Yaak.

📦 Livrables
Repository GitHub avec historique de commits

README.md

Collection Yaak / Postman

✍️ Auteur
Aimé
Membre 5 – TP NodeJS + Express