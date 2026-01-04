/**
 * Modèle LoginHistory
 * Enregistre l'historique des tentatives de connexion
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const LoginHistory = sequelize.define('LoginHistory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true, // null si tentative échouée avec email inexistant
    references: {
      model: 'User',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  ipAddress: {
    type: DataTypes.STRING(45), // IPv6 support
    allowNull: true
  },
  userAgent: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  success: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true // Pour enregistrer même si l'utilisateur n'existe pas
  }
}, {
  tableName: 'LoginHistory',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: false
});

module.exports = LoginHistory;

