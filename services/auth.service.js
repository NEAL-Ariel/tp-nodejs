const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { dbRun, dbGet } = require("../config/db");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken
} = require("./jwt.service");

// Générer un UUID simple
function generateId() {
  return crypto.randomBytes(16).toString("hex");
}

// Inscription
async function register(email, password, firstName, lastName) {
  // Vérifier si l'utilisateur existe
  const existingUser = await dbGet(
    "SELECT id FROM users WHERE email = ?",
    [email]
  );

  if (existingUser) {
    throw new Error("Cet email est déjà utilisé");
  }

  // Hasher le mot de passe
  const hashedPassword = await bcrypt.hash(password, 10);
  const userId = generateId();

  // Créer l'utilisateur
  await dbRun(
    `INSERT INTO users (id, email, password, firstName, lastName) 
     VALUES (?, ?, ?, ?, ?)`,
    [userId, email, hashedPassword, firstName, lastName]
  );

  // Créer un token de vérification d'email
  const verificationToken = generateId();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

  await dbRun(
    `INSERT INTO verification_tokens (id, userId, token, expiresAt) 
     VALUES (?, ?, ?, ?)`,
    [generateId(), userId, verificationToken, expiresAt]
  );

  return {
    userId,
    email,
    verificationToken,
    message: "Inscription réussie. Vérifiez votre email."
  };
}

// Connexion
async function login(email, password) {
  // Trouver l'utilisateur
  const user = await dbGet("SELECT * FROM users WHERE email = ?", [email]);

  if (!user) {
    throw new Error("Email ou mot de passe incorrect");
  }

  // Vérifier le mot de passe
  const isPasswordValid = await bcrypt.compare(password, user.password || "");

  if (!isPasswordValid) {
    throw new Error("Email ou mot de passe incorrect");
  }

  // Vérifier que l'email est vérifié
  if (!user.emailVerifiedAt && user.password) {
    throw new Error("Veuillez vérifier votre email d'abord");
  }

  // Vérifier que le compte n'est pas désactivé
  if (user.disabledAt) {
    throw new Error("Compte désactivé");
  }

  // Générer les tokens
  const accessToken = generateAccessToken(user.id);
  const refreshToken = await generateRefreshToken(user.id);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    }
  };
}

// Valider un token de rafraîchissement et émettre un nouvel access token
async function refreshAccessToken(refreshToken) {
  const decoded = await verifyRefreshToken(refreshToken);

  if (!decoded) {
    throw new Error("Refresh token invalide ou expiré");
  }

  const accessToken = generateAccessToken(decoded.userId);
  return { accessToken };
}

// Déconnexion (révoquer le refresh token)
async function logout(refreshToken) {
  await revokeRefreshToken(refreshToken);
  return { message: "Déconnexion réussie" };
}

// Vérifier l'email
async function verifyEmail(token) {
  const verificationRecord = await dbGet(
    `SELECT * FROM verification_tokens 
     WHERE token = ? AND expiresAt > datetime('now')`,
    [token]
  );

  if (!verificationRecord) {
    throw new Error("Token de vérification invalide ou expiré");
  }

  // Mettre à jour l'utilisateur
  await dbRun(
    "UPDATE users SET emailVerifiedAt = datetime('now') WHERE id = ?",
    [verificationRecord.userId]
  );

  // Supprimer le token
  await dbRun("DELETE FROM verification_tokens WHERE id = ?", [
    verificationRecord.id
  ]);

  return { message: "Email vérifié avec succès" };
}

// Demande de réinitialisation de mot de passe
async function requestPasswordReset(email) {
  const user = await dbGet("SELECT id FROM users WHERE email = ?", [email]);

  if (!user) {
    // Retourner le même message pour ne pas révéler si l'email existe
    return { message: "Vérifiez votre email pour réinitialiser votre mot de passe" };
  }

  const resetToken = generateId();
  const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1h

  await dbRun(
    `INSERT INTO password_reset_tokens (id, userId, token, expiresAt) 
     VALUES (?, ?, ?, ?)`,
    [generateId(), user.id, resetToken, expiresAt]
  );

  return {
    message: "Vérifiez votre email pour réinitialiser votre mot de passe",
    resetToken // À retirer en prod (envoyer par email)
  };
}

// Réinitialiser le mot de passe
async function resetPassword(token, newPassword) {
  const resetRecord = await dbGet(
    `SELECT * FROM password_reset_tokens 
     WHERE token = ? AND expiresAt > datetime('now') AND usedAt IS NULL`,
    [token]
  );

  if (!resetRecord) {
    throw new Error("Token de réinitialisation invalide ou expiré");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Mettre à jour le mot de passe
  await dbRun("UPDATE users SET password = ? WHERE id = ?", [
    hashedPassword,
    resetRecord.userId
  ]);

  // Marquer le token comme utilisé
  await dbRun(
    "UPDATE password_reset_tokens SET usedAt = datetime('now') WHERE id = ?",
    [resetRecord.id]
  );

  return { message: "Mot de passe réinitialisé avec succès" };
}

// Changer le mot de passe (utilisateur connecté)
async function changePassword(userId, oldPassword, newPassword) {
  const user = await dbGet("SELECT password FROM users WHERE id = ?", [userId]);

  if (!user || !user.password) {
    throw new Error("Utilisateur non trouvé");
  }

  const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

  if (!isPasswordValid) {
    throw new Error("Ancien mot de passe incorrect");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await dbRun("UPDATE users SET password = ? WHERE id = ?", [
    hashedPassword,
    userId
  ]);

  return { message: "Mot de passe changé avec succès" };
}

module.exports = {
  register,
  login,
  refreshAccessToken,
  logout,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
  changePassword
};
