/**
 * Controller de réinitialisation de mot de passe
 */

const { User, PasswordResetToken } = require('../models');
const { sendEmail } = require('../config/email');
const { passwordResetEmail } = require('../utils/emailTemplates');
const PasswordResetTokenModel = require('../models/PasswordResetToken');

/**
 * POST /auth/forgot-password
 * Envoie un email de réinitialisation de mot de passe
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    // Recherche l'utilisateur
    const user = await User.findOne({ where: { email } });
    
    // Pour la sécurité, on ne révèle pas si l'email existe ou non
    if (!user) {
      return res.json({
        success: true,
        message: 'Si cet email existe, un lien de réinitialisation a été envoyé'
      });
    }
    
    // Vérifie si le compte est désactivé
    if (user.isDisabled()) {
      return res.json({
        success: true,
        message: 'Si cet email existe, un lien de réinitialisation a été envoyé'
      });
    }
    
    // Supprime les anciens tokens de réinitialisation
    await PasswordResetToken.destroy({
      where: { userId: user.id }
    });
    
    // Génère un nouveau token
    const token = PasswordResetTokenModel.generateToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Expire dans 1 heure
    
    await PasswordResetToken.create({
      token,
      userId: user.id,
      expiresAt
    });
    
    // Envoie l'email
    await sendEmail({
      to: user.email,
      subject: 'Réinitialisation de votre mot de passe',
      html: passwordResetEmail(token, user.firstName)
    });
    
    res.json({
      success: true,
      message: 'Si cet email existe, un lien de réinitialisation a été envoyé'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /auth/reset-password
 * Réinitialise le mot de passe avec un token
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token et nouveau mot de passe requis'
      });
    }
    
    // Recherche le token
    const passwordResetToken = await PasswordResetToken.findOne({
      where: { token },
      include: [{ model: User, as: 'user' }]
    });
    
    if (!passwordResetToken) {
      return res.status(404).json({
        success: false,
        message: 'Token invalide'
      });
    }
    
    // Vérifie si le token est expiré
    if (!passwordResetToken.isValid()) {
      await PasswordResetToken.destroy({ where: { id: passwordResetToken.id } });
      return res.status(400).json({
        success: false,
        message: 'Token expiré'
      });
    }
    
    const user = passwordResetToken.user;
    
    // Vérifie si le compte est désactivé
    if (user.isDisabled()) {
      return res.status(403).json({
        success: false,
        message: 'Compte désactivé'
      });
    }
    
    // Met à jour le mot de passe
    user.password = newPassword;
    await user.save();
    
    // Supprime le token utilisé
    await PasswordResetToken.destroy({ where: { id: passwordResetToken.id } });
    
    // Supprime tous les refresh tokens de l'utilisateur (sécurité)
    await require('../models/RefreshToken').update(
      { revokedAt: new Date() },
      { where: { userId: user.id } }
    );
    
    res.json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  forgotPassword,
  resetPassword
};

