/**
 * Configuration de la base de données avec Sequelize
 * Gère la connexion MySQL et l'initialisation des modèles
 */

const { Sequelize } = require('sequelize');
require('dotenv').config();

// Configuration de la connexion à la base de données
const sequelize = new Sequelize(
  process.env.DB_NAME || 'auth_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: true
    }
  }
);

/**
 * Teste la connexion à la base de données
 */
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie avec succès.');
    return true;
  } catch (error) {
    console.error('❌ Impossible de se connecter à la base de données:', error);
    return false;
  }
};

/**
 * Synchronise les modèles avec la base de données
 * @param {boolean} force - Si true, supprime et recrée les tables
 */
const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force });
    console.log('✅ Base de données synchronisée.');
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation:', error);
    return false;
  }
};

module.exports = {
  sequelize,
  testConnection,
  syncDatabase
};

