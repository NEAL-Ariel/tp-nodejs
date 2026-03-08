const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { dbRun, dbGet, dbAll } = require("../config/db");

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";
const ACCESS_TOKEN_EXPIRY = process.env.JWT_ACCESS_TOKEN_EXPIRY || "15m";
const REFRESH_TOKEN_EXPIRY = process.env.JWT_REFRESH_TOKEN_EXPIRY || "7d";

// Générer un ID simple
function generateId() {
  return crypto.randomBytes(16).toString("hex");
}

// Créer un Access Token
function generateAccessToken(userId) {
  return jwt.sign(
    { userId, type: "access" },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
}

// Créer un Refresh Token (et le stocker en base)
async function generateRefreshToken(userId) {
  const token = jwt.sign(
    { userId, type: "refresh" },
    JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );

  const decoded = jwt.decode(token);
  const refreshTokenId = generateId();

  await dbRun(
    `INSERT INTO refresh_tokens (id, userId, token, expiresAt) 
     VALUES (?, ?, ?, datetime(?, 'unixepoch'))`,
    [refreshTokenId, userId, token, Math.floor(decoded.exp)]
  );

  return token;
}

// Vérifier un Access Token
function verifyAccessToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Vérifier un Refresh Token (et qu'il existe en base + non révoqué)
async function verifyRefreshToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Vérifier en base de données
    const refreshToken = await dbGet(
      `SELECT * FROM refresh_tokens 
       WHERE token = ? AND revokedAt IS NULL AND expiresAt > datetime('now')`,
      [token]
    );

    if (!refreshToken) return null;
    return decoded;
  } catch (error) {
    return null;
  }
}

// Révoquer un Refresh Token
async function revokeRefreshToken(token) {
  await dbRun(
    `UPDATE refresh_tokens SET revokedAt = datetime('now') WHERE token = ?`,
    [token]
  );
}

// Révoquer tous les Refresh Tokens d'un utilisateur
async function revokeAllUserTokens(userId) {
  await dbRun(
    `UPDATE refresh_tokens SET revokedAt = datetime('now') 
     WHERE userId = ? AND revokedAt IS NULL`,
    [userId]
  );
}

// Lister les sessions actives (refresh tokens non révoqués)
async function getActiveSessions(userId) {
  return dbAll(
    `SELECT id, createdAt, expiresAt FROM refresh_tokens 
     WHERE userId = ? AND revokedAt IS NULL`,
    [userId]
  );
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
  getActiveSessions
};
