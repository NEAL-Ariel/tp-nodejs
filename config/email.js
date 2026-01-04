/**
 * Configuration de l'envoi d'emails avec Nodemailer
 */

const nodemailer = require('nodemailer');
require('dotenv').config();

// Création du transporteur email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false, // true pour 465, false pour les autres ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

/**
 * Vérifie la connexion SMTP
 */
const verifyConnection = async () => {
  // Si les credentials ne sont pas configurés, on skip la vérification
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('⚠️  SMTP non configuré - Les emails ne seront pas envoyés');
    return false;
  }
  
  try {
    await transporter.verify();
    console.log('✅ Serveur SMTP prêt pour l\'envoi d\'emails');
    return true;
  } catch (error) {
    console.error('❌ Erreur de configuration SMTP:', error.message);
    console.log('⚠️  Les emails ne seront pas envoyés. Configurez SMTP_USER et SMTP_PASS dans .env');
    return false;
  }
};

/**
 * Envoie un email
 * @param {Object} options - Options de l'email
 */
const sendEmail = async (options) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@yourapp.com',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text
    });
    
    console.log('✅ Email envoyé:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  transporter,
  verifyConnection,
  sendEmail
};

