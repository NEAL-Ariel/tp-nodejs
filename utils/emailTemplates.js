/**
 * Templates d'emails
 * Contient les templates HTML pour les différents types d'emails
 */

require('dotenv').config();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

/**
 * Template pour la vérification d'email
 * @param {string} token - Token de vérification
 * @param {string} firstName - Prénom de l'utilisateur
 * @returns {string} HTML de l'email
 */
const verificationEmail = (token, firstName) => {
  const verificationUrl = `${FRONTEND_URL}/verify-email?token=${token}`;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .button { display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { margin-top: 30px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Vérification de votre email</h1>
        <p>Bonjour ${firstName},</p>
        <p>Merci de vous être inscrit. Veuillez cliquer sur le bouton ci-dessous pour vérifier votre adresse email :</p>
        <a href="${verificationUrl}" class="button">Vérifier mon email</a>
        <p>Ou copiez ce lien dans votre navigateur :</p>
        <p style="word-break: break-all;">${verificationUrl}</p>
        <p>Ce lien expire dans 24 heures.</p>
        <div class="footer">
          <p>Si vous n'avez pas créé de compte, ignorez cet email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Template pour la réinitialisation de mot de passe
 * @param {string} token - Token de réinitialisation
 * @param {string} firstName - Prénom de l'utilisateur
 * @returns {string} HTML de l'email
 */
const passwordResetEmail = (token, firstName) => {
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .button { display: inline-block; padding: 12px 24px; background-color: #dc3545; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { margin-top: 30px; font-size: 12px; color: #666; }
        .warning { background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Réinitialisation de votre mot de passe</h1>
        <p>Bonjour ${firstName},</p>
        <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous :</p>
        <a href="${resetUrl}" class="button">Réinitialiser mon mot de passe</a>
        <p>Ou copiez ce lien dans votre navigateur :</p>
        <p style="word-break: break-all;">${resetUrl}</p>
        <div class="warning">
          <p><strong>⚠️ Attention :</strong> Ce lien expire dans 1 heure. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
        </div>
        <div class="footer">
          <p>Pour votre sécurité, ne partagez jamais ce lien.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Template pour la notification de changement de mot de passe
 * @param {string} firstName - Prénom de l'utilisateur
 * @param {string} ipAddress - Adresse IP
 * @param {string} userAgent - User agent
 * @returns {string} HTML de l'email
 */
const passwordChangedEmail = (firstName, ipAddress, userAgent) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .warning { background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .footer { margin-top: 30px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Votre mot de passe a été modifié</h1>
        <p>Bonjour ${firstName},</p>
        <p>Votre mot de passe a été modifié avec succès.</p>
        <div class="warning">
          <p><strong>Détails de la modification :</strong></p>
          <ul>
            <li>Date : ${new Date().toLocaleString('fr-FR')}</li>
            <li>Adresse IP : ${ipAddress || 'Non disponible'}</li>
            <li>Appareil : ${userAgent || 'Non disponible'}</li>
          </ul>
        </div>
        <p>Si vous n'avez pas effectué cette modification, veuillez contacter le support immédiatement.</p>
        <div class="footer">
          <p>Pour votre sécurité, changez votre mot de passe si vous pensez que votre compte a été compromis.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = {
  verificationEmail,
  passwordResetEmail,
  passwordChangedEmail
};

