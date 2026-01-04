/**
 * Controller de gestion du profil utilisateur
 */

const { User, LoginHistory } = require('../models');
const { Op } = require('sequelize');

/**
 * GET /me
 * Récupère le profil de l'utilisateur connecté
 */
const getProfile = async (req, res, next) => {
  try {
    const user = req.user;
    
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          emailVerified: user.isEmailVerified(),
          emailVerifiedAt: user.emailVerifiedAt,
          twoFactorEnabled: user.is2FAEnabled(),
          twoFactorEnabledAt: user.twoFactorEnabledAt,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /me
 * Met à jour le profil de l'utilisateur
 */
const updateProfile = async (req, res, next) => {
  try {
    const user = req.user;
    const { firstName, lastName, email } = req.body;
    
    // Vérifie si l'email est modifié et s'il est déjà utilisé
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Cet email est déjà utilisé'
        });
      }
      
      // Si l'email change, il doit être revérifié
      user.email = email;
      user.emailVerifiedAt = null;
      
      // Supprime les anciens tokens de vérification
      await require('../models/VerificationToken').destroy({
        where: { userId: user.id }
      });
      
      // Génère un nouveau token de vérification
      const VerificationTokenModel = require('../models/VerificationToken');
      const token = VerificationTokenModel.generateToken();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
      
      await VerificationTokenModel.create({
        token,
        userId: user.id,
        expiresAt
      });
      
      // Envoie l'email de vérification
      const { sendEmail } = require('../config/email');
      const { verificationEmail } = require('../utils/emailTemplates');
      await sendEmail({
        to: email,
        subject: 'Vérification de votre nouvel email',
        html: verificationEmail(token, user.firstName)
      });
    }
    
    // Met à jour les autres champs
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    
    await user.save();
    
    res.json({
      success: true,
      message: email && email !== user.email 
        ? 'Profil mis à jour. Un email de vérification a été envoyé à votre nouvelle adresse.'
        : 'Profil mis à jour avec succès',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          emailVerified: user.isEmailVerified()
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /me
 * Supprime le compte de l'utilisateur
 */
const deleteAccount = async (req, res, next) => {
  try {
    const user = req.user;
    const { password } = req.body;
    
    // Vérifie le mot de passe si l'utilisateur en a un
    if (user.password) {
      if (!password) {
        return res.status(400).json({
          success: false,
          message: 'Mot de passe requis pour supprimer le compte'
        });
      }
      
      const isValid = await user.comparePassword(password);
      if (!isValid) {
        return res.status(401).json({
          success: false,
          message: 'Mot de passe incorrect'
        });
      }
    }
    
    // Désactive le compte au lieu de le supprimer (soft delete)
    user.disabledAt = new Date();
    await user.save();
    
    // Révoque tous les refresh tokens
    await require('../models/RefreshToken').update(
      { revokedAt: new Date() },
      { where: { userId: user.id } }
    );
    
    res.json({
      success: true,
      message: 'Compte supprimé avec succès'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /me/history
 * Récupère l'historique des connexions
 */
const getLoginHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { limit = 50, offset = 0 } = req.query;
    
    const history = await LoginHistory.findAndCountAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      attributes: ['id', 'ipAddress', 'userAgent', 'success', 'createdAt']
    });
    
    res.json({
      success: true,
      data: {
        history: history.rows,
        total: history.count,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  deleteAccount,
  getLoginHistory
};

