/**
 * Modèle OAuthAccount
 * Représente un compte OAuth lié à un utilisateur
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const OAuthAccount = sequelize.define('OAuthAccount', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  provider: {
    type: DataTypes.ENUM('google', 'github'),
    allowNull: false
  },
  providerId: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'User',
      key: 'id'
    },
    onDelete: 'CASCADE'
  }
}, {
  tableName: 'OAuthAccount',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: false,
  indexes: [
    {
      unique: true,
      fields: ['provider', 'providerId'],
      name: 'unique_provider_providerId'
    }
  ]
});

module.exports = OAuthAccount;

