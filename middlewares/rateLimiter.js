/**
 * Middleware de rate limiting
 * Protège contre les attaques brute-force
 */

const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Rate limiter général pour l'API
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requêtes par fenêtre
  message: {
    success: false,
    message: 'Trop de requêtes, veuillez réessayer plus tard.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter strict pour l'authentification (anti brute-force)
const authLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes par défaut
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 5, // 5 tentatives par défaut
  message: {
    success: false,
    message: 'Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Ne compte que les échecs
  keyGenerator: (req) => {
    // Utilise l'IP + email pour un rate limiting plus précis
    const email = req.body?.email || req.body?.identifier || 'unknown';
    return `${req.ip}-${email}`;
  }
});

// Rate limiter pour l'envoi d'emails (vérification, reset password)
const emailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 3, // 3 emails par heure
  message: {
    success: false,
    message: 'Trop de demandes d\'email. Veuillez réessayer dans 1 heure.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const email = req.body?.email || req.user?.email || 'unknown';
    return `${req.ip}-${email}`;
  }
});

// Rate limiter pour le changement de mot de passe
const passwordChangeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 5, // 5 tentatives par heure
  message: {
    success: false,
    message: 'Trop de tentatives de changement de mot de passe. Veuillez réessayer plus tard.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  generalLimiter,
  authLimiter,
  emailLimiter,
  passwordChangeLimiter
};

