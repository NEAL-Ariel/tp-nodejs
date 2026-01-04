/**
 * Controller d'authentification
 * Gère l'inscription, la connexion, la déconnexion, etc.
 */

const { User, RefreshToken, LoginHistory, VerificationToken } = require('../models');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { sendEmail } = require('../config/email');
const { verificationEmail } = require('../utils/emailTemplates');
const { getIpAddress, getUserAgent } = require('../utils/requestHelpers');
const VerificationTokenModel = require('../models/VerificationToken');
const { Op } = require('sequelize');

/**
 * POST /auth/register
 * Inscription d'un nouvel utilisateur
 */
const register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    
    // Vérifie si l'utilisateur existe déjà
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Cet email est déjà utilisé'
      });
    }
    
    // Crée l'utilisateur
    const user = await User.create({
      email,
      password,
      firstName,
      lastName
    });
    
    // Génère un token de vérification
    const verificationToken = VerificationTokenModel.generateToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Expire dans 24h
    
    await VerificationToken.create({
      token: verificationToken,
      userId: user.id,
      expiresAt
    });
    
    // Envoie l'email de vérification
    await sendEmail({
      to: user.email,
      subject: 'Vérification de votre email',
      html: verificationEmail(verificationToken, user.firstName)
    });
    
    // Génère les tokens
    const refreshTokenValue = RefreshToken.generateToken();
    const expiresAtRefresh = new Date();
    expiresAtRefresh.setDate(expiresAtRefresh.getDate() + 7); // 7 jours
    
    const refreshTokenRecord = await RefreshToken.create({
      token: refreshTokenValue,
      userId: user.id,
      userAgent: getUserAgent(req),
      ipAddress: getIpAddress(req),
      expiresAt: expiresAtRefresh
    });
    
    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ 
      userId: user.id, 
      tokenId: refreshTokenRecord.id 
    });
    
    res.status(201).json({
      success: true,
      message: 'Inscription réussie. Un email de vérification a été envoyé.',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          emailVerified: user.isEmailVerified()
        },
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /auth/login
 * Connexion d'un utilisateur
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const ipAddress = getIpAddress(req);
    const userAgent = getUserAgent(req);
    
    // Recherche l'utilisateur
    const user = await User.findOne({ where: { email } });
    
    // Enregistre la tentative de connexion (même si l'utilisateur n'existe pas)
    await LoginHistory.create({
      userId: user?.id || null,
      email,
      ipAddress,
      userAgent,
      success: false
    });
    
    // Vérifie si l'utilisateur existe
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }
    
    // Vérifie si le compte est désactivé
    if (user.isDisabled()) {
      return res.status(403).json({
        success: false,
        message: 'Compte désactivé'
      });
    }
    
    // Vérifie le mot de passe
    if (!user.password || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }
    
    // Vérifie si 2FA est activé
    if (user.is2FAEnabled()) {
      // Retourne un token temporaire pour la vérification 2FA
      const tempToken = generateAccessToken({ 
        userId: user.id, 
        email: user.email,
        requires2FA: true 
      });
      
      return res.status(200).json({
        success: true,
        message: 'Vérification 2FA requise',
        requires2FA: true,
        tempToken
      });
    }
    
    // Génère les tokens
    const refreshTokenValue = RefreshToken.generateToken();
    const expiresAtRefresh = new Date();
    expiresAtRefresh.setDate(expiresAtRefresh.getDate() + 7);
    
    const refreshTokenRecord = await RefreshToken.create({
      token: refreshTokenValue,
      userId: user.id,
      userAgent,
      ipAddress,
      expiresAt: expiresAtRefresh
    });
    
    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ 
      userId: user.id, 
      tokenId: refreshTokenRecord.id 
    });
    
    // Met à jour l'historique de connexion
    await LoginHistory.update(
      { success: true },
      { where: { email, ipAddress, success: false }, order: [['createdAt', 'DESC']], limit: 1 }
    );
    
    res.json({
      success: true,
      message: 'Connexion réussie',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          emailVerified: user.isEmailVerified(),
          twoFactorEnabled: user.is2FAEnabled()
        },
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /auth/logout
 * Déconnexion (blacklist le access token et révoque le refresh token)
 */
const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const accessToken = req.token;
    const userId = req.user.id;
    
    // Blacklist le access token
    if (accessToken) {
      const decoded = require('../utils/jwt').decodeToken(accessToken);
      if (decoded && decoded.exp) {
        const expiresAt = new Date(decoded.exp * 1000);
        await require('../models/BlacklistedAccessToken').create({
          token: accessToken,
          userId,
          expiresAt
        });
      }
    }
    
    // Révoque le refresh token si fourni
    if (refreshToken) {
      const decoded = verifyRefreshToken(refreshToken);
      if (decoded && decoded.tokenId) {
        await RefreshToken.update(
          { revokedAt: new Date() },
          { where: { id: decoded.tokenId, userId } }
        );
      }
    }
    
    res.json({
      success: true,
      message: 'Déconnexion réussie'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /auth/refresh
 * Rafraîchit les tokens d'accès
 */
const refresh = async (req, res, next) => {
  try {
    const { refreshToken: refreshTokenValue } = req.body;
    
    if (!refreshTokenValue) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token requis'
      });
    }
    
    // Vérifie le refresh token
    const decoded = verifyRefreshToken(refreshTokenValue);
    if (!decoded || !decoded.tokenId) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token invalide'
      });
    }
    
    // Vérifie que le refresh token existe en base et est valide
    const refreshTokenRecord = await RefreshToken.findByPk(decoded.tokenId);
    if (!refreshTokenRecord || !refreshTokenRecord.isValid()) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token invalide ou expiré'
      });
    }
    
    // Vérifie l'utilisateur
    const user = await User.findByPk(decoded.userId);
    if (!user || user.isDisabled()) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur introuvable ou désactivé'
      });
    }
    
    // Génère un nouveau access token
    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    
    res.json({
      success: true,
      data: {
        accessToken
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /auth/change-password
 * Change le mot de passe de l'utilisateur connecté
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = req.user;
    
    // Vérifie le mot de passe actuel
    if (!user.password || !(await user.comparePassword(currentPassword))) {
      return res.status(401).json({
        success: false,
        message: 'Mot de passe actuel incorrect'
      });
    }
    
    // Met à jour le mot de passe
    user.password = newPassword;
    await user.save();
    
    // Envoie un email de notification
    const { passwordChangedEmail } = require('../utils/emailTemplates');
    await sendEmail({
      to: user.email,
      subject: 'Votre mot de passe a été modifié',
      html: passwordChangedEmail(
        user.firstName,
        getIpAddress(req),
        getUserAgent(req)
      )
    });
    
    res.json({
      success: true,
      message: 'Mot de passe modifié avec succès'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  refresh,
  changePassword
};

