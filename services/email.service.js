const nodemailer = require("nodemailer");

let transporter;

// Initialiser le transporteur email
function initEmailService() {
  if (process.env.NODE_ENV === "development") {
    // Mode console (affiche dans les logs)
    transporter = {
      sendMail: async (mailOptions) => {
        console.log("📧 Email à envoyer:");
        console.log("  To:", mailOptions.to);
        console.log("  Subject:", mailOptions.subject);
        console.log("  Body:", mailOptions.html || mailOptions.text);
        return { messageId: "dev-mode" };
      }
    };
  } else {
    // Mode production avec Nodemailer
    transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }
}

// Envoyer un email de vérification
async function sendVerificationEmail(email, verificationToken) {
  const verificationLink = `${process.env.FRONTEND_URL}/verify?token=${verificationToken}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Vérifiez votre email",
    html: `
      <h2>Bienvenue!</h2>
      <p>Cliquez sur le lien ci-dessous pour vérifier votre email:</p>
      <a href="${verificationLink}">Vérifier mon email</a>
      <p>Ce lien expire dans 24 heures.</p>
    `
  };

  return transporter.sendMail(mailOptions);
}

// Envoyer un email de réinitialisation de mot de passe
async function sendPasswordResetEmail(email, resetToken) {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Réinitialiser votre mot de passe",
    html: `
      <h2>Réinitialisation du mot de passe</h2>
      <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe:</p>
      <a href="${resetLink}">Réinitialiser mon mot de passe</a>
      <p>Ce lien expire dans 1 heure.</p>
      <p>Si vous n'avez pas demandé la réinitialisation, ignorez cet email.</p>
    `
  };

  return transporter.sendMail(mailOptions);
}

// Envoyer un email de renvoi de vérification
async function resendVerificationEmail(email, verificationToken) {
  return sendVerificationEmail(email, verificationToken);
}

initEmailService();

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  resendVerificationEmail
};
