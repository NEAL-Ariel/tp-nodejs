/**
 * Middleware d'authentification
 * Vérifie les tokens JWT et charge l'utilisateur
 */

const { verifyAccessToken } = require('../utils/jwt');
const { User, BlacklistedAccessToken } = require('../models');
const { Op } = require('sequelize');

/**
 * Middleware pour vérifier l'authentification
 * Ajoute req.user si le token est valide
 */
const authenticate = async (req, res, next) => {
  try {
    // Récupère le token depuis le header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token d\'accès manquant'
      });
    }
    
    const token = authHeader.substring(7); // Enlève "Bearer "
    
    // Vérifie si le token est blacklisté
    const blacklisted = await BlacklistedAccessToken.findOne({
      where: { token }
    });
    
    if (blacklisted) {
      return res.status(401).json({
        success: false,
        message: 'Token révoqué'
      });
    }
    
    // Vérifie et décode le token
    const decoded = verifyAccessToken(token);
    
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Token invalide ou expiré'
      });
    }
    
    // Charge l'utilisateur depuis la base de données
    const user = await User.findByPk(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur introuvable'
      });
    }
    
    // Vérifie si le compte est désactivé
    if (user.isDisabled()) {
      return res.status(403).json({
        success: false,
        message: 'Compte désactivé'
      });
    }
    
    // Ajoute l'utilisateur à la requête
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.error('Erreur dans le middleware authenticate:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur d\'authentification'
    });
  }
};

/**
 * Middleware optionnel : vérifie l'authentification mais ne bloque pas si absent
 * Utile pour les routes qui fonctionnent avec ou sans authentification
 */
const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyAccessToken(token);
      
      if (decoded) {
        const blacklisted = await BlacklistedAccessToken.findOne({
          where: { token }
        });
        
        if (!blacklisted) {
          const user = await User.findByPk(decoded.userId);
          if (user && !user.isDisabled()) {
            req.user = user;
            req.token = token;
          }
        }
      }
    }
    
    next();
  } catch (error) {
    // En cas d'erreur, on continue sans authentification
    next();
  }
};

module.exports = {
  authenticate,
  optionalAuthenticate
};

