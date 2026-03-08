#!/bin/bash
# 🚀 SCRIPTS UTILES POUR LE TP

# ===============================================
# 1. DÉMARRER LE SERVEUR
# ===============================================
# npm start
# ou
# node index.js

# ===============================================
# 2. TESTER L'INSCRIPTION
# ===============================================

echo "Test 1: Inscription"
echo "==================="

curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "SecurePassword123",
    "firstName": "Alice",
    "lastName": "Dupont"
  }' | jq .

echo -e "\n✅ Check console pour le token de vérification\n"

# ===============================================
# 3. TESTER LA CONNEXION (sans vérification)
# ===============================================

echo "Test 2: Connexion échouée (email non vérifié)"
echo "=============================================="

curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "SecurePassword123"
  }' | jq .

echo -e "\n✅ Error attendue: 'Veuillez vérifier votre email'\n"

# ===============================================
# 4. EXTRAIRE LE TOKEN DE VÉRIFICATION
# ===============================================

echo "Test 3: Vérifier l'email"
echo "======================="
echo "À partir du log console, copier le verification token et exécuter:"
echo ""
echo "curl -X POST http://localhost:3000/auth/verify-email \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"token\": \"YOUR_VERIFICATION_TOKEN\"}' | jq ."
echo ""

# ===============================================
# 5. APRÈS VÉRIFICATION: CONNEXION RÉUSSIE
# ===============================================

echo "Test 4: Connexion réussie"
echo "========================="

curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "SecurePassword123"
  }' | jq .

echo -e "\n✅ Sauvegarder les tokens (accessToken, refreshToken)\n"

# ===============================================
# 6. UTILISER L'ACCESS TOKEN
# ===============================================

echo "Test 5: Changer de mot de passe (authentifié)"
echo "=============================================="
echo "Remplacer YOUR_ACCESS_TOKEN par le token reçu ci-dessus"
echo ""
echo "curl -X POST http://localhost:3000/auth/change-password \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \\"
echo "  -d '{\"oldPassword\": \"SecurePassword123\", \"newPassword\": \"NewPassword456\"}' | jq ."
echo ""

# ===============================================
# 7. RAFRAÎCHIR LE TOKEN
# ===============================================

echo "Test 6: Rafraîchir le token"
echo "==========================="
echo "Remplacer YOUR_REFRESH_TOKEN par le token reçu"
echo ""
echo "curl -X POST http://localhost:3000/auth/refresh \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"refreshToken\": \"YOUR_REFRESH_TOKEN\"}' | jq ."
echo ""

# ===============================================
# 8. DÉCONNEXION
# ===============================================

echo "Test 7: Déconnexion"
echo "=================="
echo "curl -X POST http://localhost:3000/auth/logout \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"refreshToken\": \"YOUR_REFRESH_TOKEN\"}' | jq ."
echo ""

# ===============================================
# 9. MOT DE PASSE OUBLIÉ
# ===============================================

echo "Test 8: Mot de passe oublié"
echo "============================"

curl -X POST http://localhost:3000/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com"
  }' | jq .

echo -e "\n✅ Check console pour le token de réinitialisation\n"

# ===============================================
# 10. RÉINITIALISER LE MOT DE PASSE
# ===============================================

echo "Test 9: Réinitialiser le mot de passe"
echo "====================================="
echo "À partir du log console, copier le reset token et exécuter:"
echo ""
echo "curl -X POST http://localhost:3000/auth/reset-password \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"token\": \"YOUR_RESET_TOKEN\", \"newPassword\": \"AnotherPassword789\"}' | jq ."
echo ""

# ===============================================
# BONUS: LIRE LA BD
# ===============================================

echo "Bonus: Inspecter la BD"
echo "====================="
echo "Pour voir les données:"
echo ""
echo "sqlite3 auth.db"
echo "  > SELECT * FROM users;"
echo "  > SELECT * FROM refresh_tokens;"
echo "  > .tables"
echo ""

# ===============================================
# UTILE: JQ (Pretty print)
# ===============================================

echo "Note: Installer jq pour prettier output:"
echo "  - macOS: brew install jq"
echo "  - Ubuntu: sudo apt-get install jq"
echo "  - Windows: scoop install jq"
echo "    ou: choco install jq"
echo ""

# ===============================================
# CONFIGURATION EMAIL (Optionnel)
# ===============================================

echo "Pour configurer l'email (Gmail):"
echo "================================"
echo "1. Aller sur: https://myaccount.google.com/apppasswords"
echo "2. Générer un 'App Password' pour Node.js"
echo "3. Mettre à jour .env:"
echo "   EMAIL_USER=your_email@gmail.com"
echo "   EMAIL_PASSWORD=your_app_password"
echo "4. Redémarrer le serveur"
echo ""

echo "✅ Scripts de test terminés!"
