/**
 * Controller de vérification d'email
 */

const { User, VerificationToken } = require('../models');
const { sendEmail } = require('../config/email');
const { verificationEmail } = require('../utils/emailTemplates');
const VerificationTokenModel = require('../models/VerificationToken');

/**
 * POST /auth/send-verification
 * Renvoie un email de vérification
 */
const sendVerification = async (req, res, next) => {
  try {
    const user = req.user;
    
    // Vérifie si l'email est déjà vérifié
    if (user.isEmailVerified()) {
      return res.status(400).json({
        success: false,
        message: 'Email déjà vérifié'
      });
    }
    
    // Supprime les anciens tokens de vérification
    await VerificationToken.destroy({
      where: { userId: user.id }
    });
    
    // Génère un nouveau token
    const token = VerificationTokenModel.generateToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    
    await VerificationToken.create({
      token,
      userId: user.id,
      expiresAt
    });
    
    // Envoie l'email
    await sendEmail({
      to: user.email,
      subject: 'Vérification de votre email',
      html: verificationEmail(token, user.firstName)
    });
    
    res.json({
      success: true,
      message: 'Email de vérification envoyé'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /auth/verify
 * Vérifie l'email avec un token
 */
const verify = async (req, res, next) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token requis'
      });
    }
    
    // Recherche le token
    const verificationToken = await VerificationToken.findOne({
      where: { token },
      include: [{ model: User, as: 'user' }]
    });
    
    if (!verificationToken) {
      return res.status(404).json({
        success: false,
        message: 'Token invalide'
      });
    }
    
    // Vérifie si le token est expiré
    if (!verificationToken.isValid()) {
      await VerificationToken.destroy({ where: { id: verificationToken.id } });
      return res.status(400).json({
        success: false,
        message: 'Token expiré'
      });
    }
    
    const user = verificationToken.user;
    
    // Vérifie si l'email est déjà vérifié
    if (user.isEmailVerified()) {
      await VerificationToken.destroy({ where: { id: verificationToken.id } });
      return res.status(400).json({
        success: false,
        message: 'Email déjà vérifié'
      });
    }
    
    // Marque l'email comme vérifié
    user.emailVerifiedAt = new Date();
    await user.save();
    
    // Supprime le token utilisé
    await VerificationToken.destroy({ where: { id: verificationToken.id } });
    
    res.json({
      success: true,
      message: 'Email vérifié avec succès'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendVerification,
  verify
};

