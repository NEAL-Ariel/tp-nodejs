/**
 * Routes d'authentification
 */

const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');
const verificationController = require('../controllers/verificationController');
const passwordResetController = require('../controllers/passwordResetController');
const oauthController = require('../controllers/oauthController');
const twoFactorController = require('../controllers/twoFactorController');
const { authenticate } = require('../middlewares/auth');
const { authLimiter, emailLimiter, passwordChangeLimiter } = require('../middlewares/rateLimiter');
const {
  validate,
  registerSchema,
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  enable2FASchema,
  verify2FASchema
} = require('../middlewares/validation');

// Inscription
router.post('/register', 
  authLimiter,
  validate(registerSchema),
  authController.register
);

// Connexion
router.post('/login',
  authLimiter,
  validate(loginSchema),
  authController.login
);

// Déconnexion
router.post('/logout',
  authenticate,
  authController.logout
);

// Rafraîchir le token
router.post('/refresh',
  authController.refresh
);

// Changer le mot de passe
router.post('/change-password',
  authenticate,
  passwordChangeLimiter,
  validate(changePasswordSchema),
  authController.changePassword
);

// Vérification d'email
router.post('/send-verification',
  authenticate,
  emailLimiter,
  verificationController.sendVerification
);

router.post('/verify',
  validate(verifyEmailSchema),
  verificationController.verify
);

// Mot de passe oublié
router.post('/forgot-password',
  emailLimiter,
  validate(forgotPasswordSchema),
  passwordResetController.forgotPassword
);

router.post('/reset-password',
  validate(resetPasswordSchema),
  passwordResetController.resetPassword
);

// OAuth - Note: Les routes OAuth utilisent GET pour la redirection
router.get('/oauth/:provider',
  (req, res, next) => {
    const { provider } = req.params;
    if (!['google', 'github'].includes(provider)) {
      return res.status(400).json({
        success: false,
        message: 'Provider invalide. Utilisez "google" ou "github"'
      });
    }
    passport.authenticate(provider, { 
      scope: provider === 'google' ? ['profile', 'email'] : ['user:email'] 
    })(req, res, next);
  }
);

router.get('/oauth/callback/:provider',
  oauthController.oauthCallback
);

// 2FA
router.post('/2fa/enable',
  authenticate,
  validate(enable2FASchema),
  twoFactorController.enable2FA
);

router.post('/2fa/disable',
  authenticate,
  validate(enable2FASchema),
  twoFactorController.disable2FA
);

router.post('/2fa/verify',
  validate(verify2FASchema),
  twoFactorController.verify2FA
);

module.exports = router;

