/**
 * Script pour créer le fichier .env depuis .env.example
 * 
 * Usage: node create_env.js
 */

const fs = require('fs');
const path = require('path');

const envExamplePath = path.join(__dirname, '.env.example');
const envPath = path.join(__dirname, '.env');

// Vérifier si .env existe déjà
if (fs.existsSync(envPath)) {
  console.log('⚠️  Le fichier .env existe déjà.');
  console.log('   Si vous voulez le recréer, supprimez-le d\'abord.\n');
  process.exit(0);
}

// Vérifier si .env.example existe
if (!fs.existsSync(envExamplePath)) {
  console.error('❌ Le fichier .env.example n\'existe pas !');
  process.exit(1);
}

// Copier .env.example vers .env
try {
  const envContent = fs.readFileSync(envExamplePath, 'utf8');
  fs.writeFileSync(envPath, envContent, 'utf8');
  console.log('✅ Fichier .env créé avec succès !');
  console.log('📝 N\'oubliez pas de configurer vos variables d\'environnement.\n');
} catch (error) {
  console.error('❌ Erreur lors de la création du fichier .env:', error.message);
  process.exit(1);
}

