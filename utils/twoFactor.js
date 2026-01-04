/**
 * Utilitaires 2FA (TOTP)
 * Gère l'authentification à deux facteurs avec Google Authenticator
 */

const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

/**
 * Génère un secret 2FA pour un utilisateur
 * @returns {Object} Secret et URL pour QR code
 */
const generateSecret = () => {
  const secret = speakeasy.generateSecret({
    name: 'Auth API',
    length: 32
  });
  
  return {
    secret: secret.base32,
    otpauthUrl: secret.otpauth_url
  };
};

/**
 * Génère un QR code pour l'application d'authentification
 * @param {string} otpauthUrl - URL OTP Auth
 * @returns {Promise<string>} Data URL du QR code
 */
const generateQRCode = async (otpauthUrl) => {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);
    return qrCodeDataUrl;
  } catch (error) {
    throw new Error('Erreur lors de la génération du QR code');
  }
};

/**
 * Vérifie un code TOTP
 * @param {string} token - Code à vérifier
 * @param {string} secret - Secret de l'utilisateur
 * @returns {boolean} True si le code est valide
 */
const verifyToken = (token, secret) => {
  try {
    return speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 2 // Accepte les codes dans une fenêtre de ±2 périodes (60s)
    });
  } catch (error) {
    return false;
  }
};

/**
 * Génère un code TOTP pour test (développement uniquement)
 * @param {string} secret - Secret de l'utilisateur
 * @returns {string} Code TOTP
 */
const generateToken = (secret) => {
  return speakeasy.totp({
    secret: secret,
    encoding: 'base32'
  });
};

module.exports = {
  generateSecret,
  generateQRCode,
  verifyToken,
  generateToken
};

