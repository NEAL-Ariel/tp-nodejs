-- Script SQL pour créer manuellement toutes les tables
-- À utiliser uniquement si vous ne voulez pas utiliser Sequelize sync()
-- Normalement, Sequelize crée ces tables automatiquement au démarrage

-- Utiliser la base de données
USE auth_db;

-- Table User
CREATE TABLE IF NOT EXISTS User (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255),
  firstName VARCHAR(100) NOT NULL,
  lastName VARCHAR(100) NOT NULL,
  emailVerifiedAt DATETIME,
  twoFactorSecret VARCHAR(255),
  twoFactorEnabledAt DATETIME,
  disabledAt DATETIME,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table OAuthAccount
CREATE TABLE IF NOT EXISTS OAuthAccount (
  id INT AUTO_INCREMENT PRIMARY KEY,
  provider ENUM('google', 'github') NOT NULL,
  providerId VARCHAR(255) NOT NULL,
  userId INT NOT NULL,
  createdAt DATETIME NOT NULL,
  FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
  UNIQUE KEY unique_provider_providerId (provider, providerId),
  INDEX idx_userId (userId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table RefreshToken
CREATE TABLE IF NOT EXISTS RefreshToken (
  id INT AUTO_INCREMENT PRIMARY KEY,
  token VARCHAR(500) UNIQUE NOT NULL,
  userId INT NOT NULL,
  userAgent VARCHAR(500),
  ipAddress VARCHAR(45),
  expiresAt DATETIME NOT NULL,
  revokedAt DATETIME,
  createdAt DATETIME NOT NULL,
  FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
  INDEX idx_userId (userId),
  INDEX idx_token (token),
  INDEX idx_expiresAt (expiresAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table BlacklistedAccessToken
CREATE TABLE IF NOT EXISTS BlacklistedAccessToken (
  id INT AUTO_INCREMENT PRIMARY KEY,
  token VARCHAR(500) UNIQUE NOT NULL,
  userId INT NOT NULL,
  expiresAt DATETIME NOT NULL,
  createdAt DATETIME NOT NULL,
  FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
  INDEX idx_token (token),
  INDEX idx_expiresAt (expiresAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table VerificationToken
CREATE TABLE IF NOT EXISTS VerificationToken (
  id INT AUTO_INCREMENT PRIMARY KEY,
  token VARCHAR(255) UNIQUE NOT NULL,
  userId INT NOT NULL,
  expiresAt DATETIME NOT NULL,
  createdAt DATETIME NOT NULL,
  FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
  INDEX idx_token (token),
  INDEX idx_userId (userId),
  INDEX idx_expiresAt (expiresAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table PasswordResetToken
CREATE TABLE IF NOT EXISTS PasswordResetToken (
  id INT AUTO_INCREMENT PRIMARY KEY,
  token VARCHAR(255) UNIQUE NOT NULL,
  userId INT NOT NULL,
  expiresAt DATETIME NOT NULL,
  createdAt DATETIME NOT NULL,
  FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
  INDEX idx_token (token),
  INDEX idx_userId (userId),
  INDEX idx_expiresAt (expiresAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table LoginHistory
CREATE TABLE IF NOT EXISTS LoginHistory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT,
  email VARCHAR(255),
  ipAddress VARCHAR(45),
  userAgent VARCHAR(500),
  success BOOLEAN NOT NULL DEFAULT FALSE,
  createdAt DATETIME NOT NULL,
  FOREIGN KEY (userId) REFERENCES User(id) ON DELETE SET NULL,
  INDEX idx_userId (userId),
  INDEX idx_email (email),
  INDEX idx_createdAt (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Message de confirmation
SELECT '✅ Toutes les tables ont été créées avec succès !' AS message;


