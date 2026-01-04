/**
 * Modèle RefreshToken
 * Gère les refresh tokens en whitelist
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const crypto = require('crypto');

const RefreshToken = sequelize.define('RefreshToken', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  token: {
    type: DataTypes.STRING(500),
    allowNull: false,
    unique: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'User',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  userAgent: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  ipAddress: {
    type: DataTypes.STRING(45), // IPv6 support
    allowNull: true
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  revokedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'RefreshToken',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: false
});

/**
 * Génère un token aléatoire sécurisé
 * @returns {string}
 */
RefreshToken.generateToken = function() {
  return crypto.randomBytes(64).toString('hex');
};

/**
 * Vérifie si le token est valide (non expiré et non révoqué)
 * @returns {boolean}
 */
RefreshToken.prototype.isValid = function() {
  const now = new Date();
  return !this.revokedAt && this.expiresAt > now;
};

module.exports = RefreshToken;

