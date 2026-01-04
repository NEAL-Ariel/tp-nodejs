/**
 * Modèle User
 * Représente un utilisateur dans le système
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: true, // Peut être null si OAuth uniquement
    validate: {
      len: [8, 255] // Minimum 8 caractères si présent
    }
  },
  firstName: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  emailVerifiedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  twoFactorSecret: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  twoFactorEnabledAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  disabledAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'User',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  hooks: {
    // Hash le mot de passe avant la création
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    // Hash le mot de passe avant la mise à jour si modifié
    beforeUpdate: async (user) => {
      if (user.changed('password') && user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

/**
 * Vérifie si le mot de passe correspond
 * @param {string} candidatePassword - Mot de passe à vérifier
 * @returns {Promise<boolean>}
 */
User.prototype.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * Vérifie si l'email est vérifié
 * @returns {boolean}
 */
User.prototype.isEmailVerified = function() {
  return this.emailVerifiedAt !== null;
};

/**
 * Vérifie si le compte est désactivé
 * @returns {boolean}
 */
User.prototype.isDisabled = function() {
  return this.disabledAt !== null;
};

/**
 * Vérifie si 2FA est activé
 * @returns {boolean}
 */
User.prototype.is2FAEnabled = function() {
  return this.twoFactorEnabledAt !== null && this.twoFactorSecret !== null;
};

module.exports = User;

