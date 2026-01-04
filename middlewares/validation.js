/**
 * Middleware de validation avec Joi
 * Valide les données des requêtes
 */

const Joi = require('joi');

/**
 * Middleware de validation générique
 * @param {Object} schema - Schéma Joi à valider
 * @param {string} property - Propriété de req à valider ('body', 'query', 'params')
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Erreur de validation',
        errors
      });
    }
    
    // Remplace les données par les données validées (avec valeurs par défaut, etc.)
    req[property] = value;
    next();
  };
};

// Schémas de validation réutilisables

const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email invalide',
    'any.required': 'L\'email est requis'
  }),
  password: Joi.string().min(8).max(255).required().messages({
    'string.min': 'Le mot de passe doit contenir au moins 8 caractères',
    'any.required': 'Le mot de passe est requis'
  }),
  firstName: Joi.string().min(1).max(100).required(),
  lastName: Joi.string().min(1).max(100).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).max(255).required()
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required()
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  newPassword: Joi.string().min(8).max(255).required()
});

const verifyEmailSchema = Joi.object({
  token: Joi.string().required()
});

const enable2FASchema = Joi.object({
  token: Joi.string().length(6).pattern(/^[0-9]+$/).required().messages({
    'string.length': 'Le code doit contenir 6 chiffres',
    'string.pattern.base': 'Le code doit contenir uniquement des chiffres'
  })
});

const verify2FASchema = Joi.object({
  token: Joi.string().length(6).pattern(/^[0-9]+$/).required()
});

const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(1).max(100).optional(),
  lastName: Joi.string().min(1).max(100).optional(),
  email: Joi.string().email().optional()
}).min(1); // Au moins un champ doit être présent

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  enable2FASchema,
  verify2FASchema,
  updateProfileSchema
};

