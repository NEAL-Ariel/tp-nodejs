/**
 * Utilitaires JWT
 * Gère la génération et la vérification des tokens JWT
 */

const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

/**
 * Génère un access token JWT
 * @param {Object} payload - Données à inclure dans le token
 * @returns {string} Access token
 */
const generateAccessToken = (payload) => {
  return jwt.sign(
    {
      userId: payload.userId,
      email: payload.email,
      type: 'access'
    },
    jwtConfig.secret,
    {
      expiresIn: jwtConfig.accessTokenExpiresIn,
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience
    }
  );
};

/**
 * Génère un refresh token JWT
 * @param {Object} payload - Données à inclure dans le token
 * @returns {string} Refresh token
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(
    {
      userId: payload.userId,
      tokenId: payload.tokenId, // ID du refresh token en DB
      type: 'refresh'
    },
    jwtConfig.secret,
    {
      expiresIn: jwtConfig.refreshTokenExpiresIn,
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience
    }
  );
};

/**
 * Vérifie et décode un access token
 * @param {string} token - Token à vérifier
 * @returns {Object|null} Payload décodé ou null si invalide
 */
const verifyAccessToken = (token) => {
  try {
    const decoded = jwt.verify(token, jwtConfig.secret, {
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience
    });
    
    if (decoded.type !== 'access') {
      return null;
    }
    
    return decoded;
  } catch (error) {
    return null;
  }
};

/**
 * Vérifie et décode un refresh token
 * @param {string} token - Token à vérifier
 * @returns {Object|null} Payload décodé ou null si invalide
 */
const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, jwtConfig.secret, {
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience
    });
    
    if (decoded.type !== 'refresh') {
      return null;
    }
    
    return decoded;
  } catch (error) {
    return null;
  }
};

/**
 * Décode un token sans vérification (pour inspection)
 * @param {string} token - Token à décoder
 * @returns {Object|null} Payload décodé ou null
 */
const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken
};

