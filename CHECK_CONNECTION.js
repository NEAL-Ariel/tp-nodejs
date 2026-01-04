/**
 * Script de test de connexion à la base de données
 * Utilisez ce script pour vérifier que votre configuration fonctionne
 * 
 * Usage: node CHECK_CONNECTION.js
 */

require('dotenv').config();
const { sequelize, testConnection, syncDatabase } = require('./config/database');

// Charger les modèles
require('./models');

async function checkConnection() {
  console.log('\n🔍 Vérification de la connexion à la base de données...\n');
  
  console.log('📋 Configuration:');
  console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
  console.log(`   Port: ${process.env.DB_PORT || 3306}`);
  console.log(`   Database: ${process.env.DB_NAME || 'auth_db'}`);
  console.log(`   User: ${process.env.DB_USER || 'root'}`);
  console.log(`   Password: ${process.env.DB_PASSWORD ? '***' : '(vide)'}\n`);
  
  // Test de connexion
  const connected = await testConnection();
  
  if (!connected) {
    console.log('\n❌ Échec de la connexion. Vérifiez:');
    console.log('   1. MySQL est démarré dans XAMPP');
    console.log('   2. La base de données "auth_db" existe');
    console.log('   3. Les credentials dans .env sont corrects\n');
    process.exit(1);
  }
  
  // Test de synchronisation
  console.log('🔄 Synchronisation des modèles...\n');
  const synced = await syncDatabase(false);
  
  if (!synced) {
    console.log('\n❌ Échec de la synchronisation.\n');
    process.exit(1);
  }
  
  // Liste des tables
  try {
    const [results] = await sequelize.query("SHOW TABLES");
    console.log('\n📊 Tables créées:');
    results.forEach((row) => {
      const tableName = Object.values(row)[0];
      console.log(`   ✅ ${tableName}`);
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des tables:', error);
  }
  
  console.log('\n✅ Tout fonctionne correctement !\n');
  await sequelize.close();
  process.exit(0);
}

checkConnection().catch((error) => {
  console.error('\n❌ Erreur:', error.message);
  process.exit(1);
});


