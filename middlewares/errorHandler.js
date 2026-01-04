/**
 * Middleware de gestion des erreurs
 * Capture et formate toutes les erreurs de l'application
 */

/**
 * Middleware de gestion des erreurs global
 * Doit être placé en dernier dans app.js
 */
const errorHandler = (err, req, res, next) => {
  console.error('Erreur:', err);
  
  // Erreur de validation Sequelize
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Erreur de validation',
      errors: err.errors.map(e => ({
        field: e.path,
        message: e.message
      }))
    });
  }
  
  // Erreur de contrainte unique Sequelize
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      success: false,
      message: 'Cette ressource existe déjà',
      field: err.errors[0]?.path
    });
  }
  
  // Erreur de clé étrangère Sequelize
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      success: false,
      message: 'Référence invalide'
    });
  }
  
  // Erreur JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token invalide'
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expiré'
    });
  }
  
  // Erreur par défaut
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Erreur serveur interne';
  
  res.status(statusCode).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Une erreur est survenue' 
      : message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * Middleware pour les routes non trouvées
 */
const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} non trouvée`
  });
};

module.exports = {
  errorHandler,
  notFound
};

