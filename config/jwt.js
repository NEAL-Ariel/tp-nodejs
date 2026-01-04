/**
 * Configuration JWT
 * Gère la génération et la vérification des tokens JWT
 */

require('dotenv').config();

const jwtConfig = {
  // Secret pour signer les tokens (à changer en production)
  secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  
  // Durée de vie des tokens
  accessTokenExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  refreshTokenExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  
  // Algorithmes
  algorithm: 'HS256',
  
  // Options par défaut
  issuer: 'auth-api',
  audience: 'auth-api-users'
};

module.exports = jwtConfig;

