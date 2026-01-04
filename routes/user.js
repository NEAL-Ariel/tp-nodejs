/**
 * Routes de gestion du profil utilisateur
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middlewares/auth');
const { validate, updateProfileSchema } = require('../middlewares/validation');

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Récupérer le profil
router.get('/', userController.getProfile);

// Mettre à jour le profil
router.patch('/', 
  validate(updateProfileSchema),
  userController.updateProfile
);

// Supprimer le compte
router.delete('/', userController.deleteAccount);

// Historique des connexions
router.get('/history', userController.getLoginHistory);

module.exports = router;

