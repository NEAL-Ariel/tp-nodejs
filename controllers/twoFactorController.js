/**
 * Controller 2FA (TOTP)
 */

const { User } = require('../models');
const { generateSecret, generateQRCode, verifyToken } = require('../utils/twoFactor');

/**
 * POST /auth/2fa/enable
 * Active l'authentification à deux facteurs
 */
const enable2FA = async (req, res, next) => {
  try {
    const { token } = req.body;
    const user = req.user;
    
    // Vérifie si 2FA est déjà activé
    if (user.is2FAEnabled()) {
      return res.status(400).json({
        success: false,
        message: '2FA déjà activé'
      });
    }
    
    // Si un token est fourni, on vérifie et active directement
    if (token && user.twoFactorSecret) {
      const isValid = verifyToken(token, user.twoFactorSecret);
      
      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: 'Code 2FA invalide'
        });
      }
      
      // Active 2FA
      user.twoFactorEnabledAt = new Date();
      await user.save();
      
      return res.json({
        success: true,
        message: '2FA activé avec succès'
      });
    }
    
    // Génère un nouveau secret
    const { secret, otpauthUrl } = generateSecret();
    
    // Sauvegarde temporairement le secret (pas encore activé)
    user.twoFactorSecret = secret;
    await user.save();
    
    // Génère le QR code
    const qrCode = await generateQRCode(otpauthUrl);
    
    res.json({
      success: true,
      message: 'Scannez le QR code avec votre application d\'authentification',
      data: {
        secret,
        qrCode,
        manualEntryKey: secret // Pour entrée manuelle
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /auth/2fa/disable
 * Désactive l'authentification à deux facteurs
 */
const disable2FA = async (req, res, next) => {
  try {
    const { token } = req.body;
    const user = req.user;
    
    // Vérifie si 2FA est activé
    if (!user.is2FAEnabled()) {
      return res.status(400).json({
        success: false,
        message: '2FA non activé'
      });
    }
    
    // Vérifie le code 2FA
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Code 2FA requis pour désactiver'
      });
    }
    
    const isValid = verifyToken(token, user.twoFactorSecret);
    
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Code 2FA invalide'
      });
    }
    
    // Désactive 2FA
    user.twoFactorSecret = null;
    user.twoFactorEnabledAt = null;
    await user.save();
    
    res.json({
      success: true,
      message: '2FA désactivé avec succès'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /auth/2fa/verify
 * Vérifie un code 2FA lors de la connexion
 */
const verify2FA = async (req, res, next) => {
  try {
    const { token, tempToken } = req.body;
    
    if (!token || !tempToken) {
      return res.status(400).json({
        success: false,
        message: 'Token temporaire et code 2FA requis'
      });
    }
    
    // Vérifie le token temporaire
    const { verifyAccessToken } = require('../utils/jwt');
    const decoded = verifyAccessToken(tempToken);
    
    if (!decoded || !decoded.requires2FA || !decoded.userId) {
      return res.status(401).json({
        success: false,
        message: 'Token temporaire invalide'
      });
    }
    
    // Charge l'utilisateur
    const user = await User.findByPk(decoded.userId);
    
    if (!user || !user.is2FAEnabled()) {
      return res.status(400).json({
        success: false,
        message: '2FA non activé pour cet utilisateur'
      });
    }
    
    // Vérifie le code 2FA
    const isValid = verifyToken(token, user.twoFactorSecret);
    
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Code 2FA invalide'
      });
    }
    
    // Génère les tokens finaux
    const { RefreshToken: RefreshTokenModel } = require('../models');
    const refreshTokenValue = RefreshTokenModel.generateToken();
    const expiresAtRefresh = new Date();
    expiresAtRefresh.setDate(expiresAtRefresh.getDate() + 7);
    
    const { getIpAddress, getUserAgent } = require('../utils/requestHelpers');
    const refreshTokenRecord = await RefreshTokenModel.create({
      token: refreshTokenValue,
      userId: user.id,
      userAgent: getUserAgent(req),
      ipAddress: getIpAddress(req),
      expiresAt: expiresAtRefresh
    });
    
    const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');
    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ 
      userId: user.id, 
      tokenId: refreshTokenRecord.id 
    });
    
    // Enregistre la connexion
    await require('../models/LoginHistory').create({
      userId: user.id,
      email: user.email,
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req),
      success: true
    });
    
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

module.exports = {
  enable2FA,
  disable2FA,
  verify2FA
};

