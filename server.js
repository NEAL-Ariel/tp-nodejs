/**
 * Serveur principal de l'API d'authentification
 * Point d'entrée de l'application
 */

require('dotenv').config();
const express = require('express');
const { sequelize, testConnection, syncDatabase } = require('./config/database');
const { verifyConnection: verifyEmailConnection } = require('./config/email');
const { cors, helmet } = require('./middlewares/security');
const { errorHandler, notFound } = require('./middlewares/errorHandler');
const { generalLimiter } = require('./middlewares/rateLimiter');
const passport = require('passport');

// Charger les modèles pour que Sequelize les connaisse
require('./models');

// Import des routes
const authRoutes = require('./routes/auth');
const sessionRoutes = require('./routes/sessions');
const userRoutes = require('./routes/user');

// Initialisation de l'application Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares de sécurité
app.use(helmet);
app.use(cors);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialisation de Passport pour OAuth
app.use(passport.initialize());

// Rate limiting général
app.use('/api', generalLimiter);

// Routes de santé
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API d\'authentification opérationnelle',
    timestamp: new Date().toISOString()
  });
});

// Routes de l'API
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/me', userRoutes);

// Route 404
app.use(notFound);

// Gestionnaire d'erreurs global
app.use(errorHandler);

/**
 * Démarre le serveur
 */
const startServer = async () => {
  try {
    // Teste la connexion à la base de données
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('❌ Impossible de se connecter à la base de données');
      process.exit(1);
    }
    
    // Synchronise les modèles avec la base de données
    // En production, utilisez des migrations au lieu de sync
    if (process.env.NODE_ENV === 'development') {
      await syncDatabase(false); // false = ne pas forcer la recréation
    }
    
    // Vérifie la connexion email (optionnel, ne bloque pas le démarrage)
    try {
      await verifyEmailConnection();
    } catch (error) {
      console.log('⚠️  Vérification SMTP ignorée (non bloquant)');
    }
    
    // Démarre le serveur
    const server = app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
      console.log(`📝 Environnement: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 API disponible sur: http://localhost:${PORT}/api`);
    });
    
    // Gestion de l'erreur de port occupé
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`\n❌ Le port ${PORT} est déjà utilisé !`);
        console.log(`\n💡 Solutions:`);
        console.log(`   1. Arrêtez le processus qui utilise le port ${PORT}:`);
        console.log(`      netstat -ano | findstr :${PORT}`);
        console.log(`      taskkill /PID <PID> /F`);
        console.log(`   2. Changez le port dans .env: PORT=3001`);
        console.log(`   3. Utilisez un autre terminal si un serveur tourne déjà\n`);
        process.exit(1);
      } else {
        throw error;
      }
    });
    
    // Nettoyage périodique des tokens expirés (toutes les heures)
    setInterval(async () => {
      try {
        const { BlacklistedAccessToken } = require('./models');
        await BlacklistedAccessToken.cleanExpired();
        
        // Nettoie aussi les tokens de vérification et reset expirés
        const { VerificationToken, PasswordResetToken } = require('./models');
        const now = new Date();
        
        await VerificationToken.destroy({
          where: {
            expiresAt: {
              [require('sequelize').Op.lt]: now
            }
          }
        });
        
        await PasswordResetToken.destroy({
          where: {
            expiresAt: {
              [require('sequelize').Op.lt]: now
            }
          }
        });
      } catch (error) {
        console.error('Erreur lors du nettoyage des tokens:', error);
      }
    }, 60 * 60 * 1000); // Toutes les heures
    
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
};

// Gestion de l'arrêt propre
process.on('SIGTERM', async () => {
  console.log('SIGTERM reçu, fermeture propre...');
  await sequelize.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT reçu, fermeture propre...');
  await sequelize.close();
  process.exit(0);
});

// Démarre le serveur
startServer();

module.exports = app;

