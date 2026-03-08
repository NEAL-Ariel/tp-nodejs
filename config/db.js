const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "../auth.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error("Erreur BD:", err);
  else console.log("✅ Connexion BD établie");
});

// Initialiser les tables
function initializeDb() {
  db.serialize(() => {
    // Table User
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT,
        firstName TEXT,
        lastName TEXT,
        emailVerifiedAt DATETIME,
        twoFactorEnabledAt DATETIME,
        twoFactorSecret TEXT,
        disabledAt DATETIME,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table OAuthAccount
    db.run(`
      CREATE TABLE IF NOT EXISTS oauth_accounts (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL UNIQUE,
        provider TEXT NOT NULL,
        providerId TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id),
        UNIQUE(provider, providerId)
      )
    `);

    // Table RefreshToken (Whitelist)
    db.run(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        token TEXT UNIQUE NOT NULL,
        revokedAt DATETIME,
        expiresAt DATETIME NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id)
      )
    `);

    // Table BlacklistedAccessToken
    db.run(`
      CREATE TABLE IF NOT EXISTS blacklisted_access_tokens (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        token TEXT UNIQUE NOT NULL,
        expiresAt DATETIME NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id)
      )
    `);

    // Table VerificationToken
    db.run(`
      CREATE TABLE IF NOT EXISTS verification_tokens (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        token TEXT UNIQUE NOT NULL,
        expiresAt DATETIME NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id)
      )
    `);

    // Table PasswordResetToken
    db.run(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        token TEXT UNIQUE NOT NULL,
        expiresAt DATETIME NOT NULL,
        usedAt DATETIME,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id)
      )
    `);

    // Table LoginHistory
    db.run(`
      CREATE TABLE IF NOT EXISTS login_history (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        success BOOLEAN NOT NULL,
        ip TEXT,
        userAgent TEXT,
        attemptedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id)
      )
    `);

    console.log("✅ Tables initialisées");
  });
}

// Wrapper pour promisifier les requêtes DB
function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

initializeDb();

module.exports = {
  db,
  dbRun,
  dbGet,
  dbAll
};
