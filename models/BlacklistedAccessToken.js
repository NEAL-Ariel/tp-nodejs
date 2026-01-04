/**
 * Modèle BlacklistedAccessToken
 * Gère la blacklist des access tokens révoqués avant expiration
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BlacklistedAccessToken = sequelize.define('BlacklistedAccessToken', {
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
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: 'BlacklistedAccessToken',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: false
});

/**
 * Nettoie les tokens expirés de la blacklist
 */
BlacklistedAccessToken.cleanExpired = async function() {
  const now = new Date();
  await BlacklistedAccessToken.destroy({
    where: {
      expiresAt: {
        [sequelize.Op.lt]: now
      }
    }
  });
};

module.exports = BlacklistedAccessToken;

