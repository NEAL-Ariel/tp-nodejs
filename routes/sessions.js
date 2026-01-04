/**
 * Routes de gestion des sessions
 */

const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const { authenticate } = require('../middlewares/auth');

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Liste des sessions
router.get('/', sessionController.getSessions);

// Révoquer une session
router.delete('/:id', sessionController.revokeSession);

// Révoquer toutes les autres sessions
router.delete('/others/revoke', sessionController.revokeOtherSessions);

module.exports = router;

