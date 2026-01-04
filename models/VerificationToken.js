/**
 * Modèle VerificationToken
 * Gère les tokens de vérification d'email
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const crypto = require('crypto');

const VerificationToken = sequelize.define('VerificationToken', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  token: {
    type: DataTypes.STRING(255),
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
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: 'VerificationToken',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: false
});

/**
 * Génère un token de vérification
 * @returns {string}
 */
VerificationToken.generateToken = function() {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Vérifie si le token est valide (non expiré)
 * @returns {boolean}
 */
VerificationToken.prototype.isValid = function() {
  const now = new Date();
  return this.expiresAt > now;
};

module.exports = VerificationToken;

