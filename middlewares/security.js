/**
 * Middlewares de sécurité
 * Helmet, CORS, sanitization, etc.
 */

const helmet = require('helmet');
const cors = require('cors');
require('dotenv').config();

// Configuration CORS
const corsOptions = {
  origin: function (origin, callback) {
    // En développement, autorise toutes les origines
    if (process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      // En production, liste des origines autorisées
      const allowedOrigins = [
        process.env.FRONTEND_URL,
        process.env.API_BASE_URL
      ].filter(Boolean);
      
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Non autorisé par CORS'));
      }
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

// Configuration Helmet pour la sécurité des headers HTTP
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  },
  crossOriginEmbedderPolicy: false
});

module.exports = {
  cors: cors(corsOptions),
  helmet: helmetConfig
};

