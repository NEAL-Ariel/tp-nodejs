/**
 * Index des modèles
 * Définit les relations entre les modèles
 */

const User = require('./User');
const OAuthAccount = require('./OAuthAccount');
const RefreshToken = require('./RefreshToken');
const BlacklistedAccessToken = require('./BlacklistedAccessToken');
const VerificationToken = require('./VerificationToken');
const PasswordResetToken = require('./PasswordResetToken');
const LoginHistory = require('./LoginHistory');

// Relations User -> OAuthAccount (One-to-Many)
User.hasMany(OAuthAccount, { foreignKey: 'userId', as: 'oauthAccounts' });
OAuthAccount.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Relations User -> RefreshToken (One-to-Many)
User.hasMany(RefreshToken, { foreignKey: 'userId', as: 'refreshTokens' });
RefreshToken.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Relations User -> BlacklistedAccessToken (One-to-Many)
User.hasMany(BlacklistedAccessToken, { foreignKey: 'userId', as: 'blacklistedTokens' });
BlacklistedAccessToken.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Relations User -> VerificationToken (One-to-Many)
User.hasMany(VerificationToken, { foreignKey: 'userId', as: 'verificationTokens' });
VerificationToken.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Relations User -> PasswordResetToken (One-to-Many)
User.hasMany(PasswordResetToken, { foreignKey: 'userId', as: 'passwordResetTokens' });
PasswordResetToken.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Relations User -> LoginHistory (One-to-Many)
User.hasMany(LoginHistory, { foreignKey: 'userId', as: 'loginHistory' });
LoginHistory.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  User,
  OAuthAccount,
  RefreshToken,
  BlacklistedAccessToken,
  VerificationToken,
  PasswordResetToken,
  LoginHistory
};

