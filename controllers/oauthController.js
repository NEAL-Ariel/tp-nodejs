/**
 * Controller OAuth (Google et GitHub)
 */

const passport = require('passport');
const { User, OAuthAccount, RefreshToken } = require('../models');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');
const { getIpAddress, getUserAgent } = require('../utils/requestHelpers');
const oauthConfig = require('../config/oauth');

// Configuration Passport pour Google
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;

// Configuration Google OAuth
if (oauthConfig.google.clientID) {
  passport.use(new GoogleStrategy({
    clientID: oauthConfig.google.clientID,
    clientSecret: oauthConfig.google.clientSecret,
    callbackURL: oauthConfig.google.callbackURL
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Recherche ou crée l'utilisateur
      let oauthAccount = await OAuthAccount.findOne({
        where: {
          provider: 'google',
          providerId: profile.id
        },
        include: [{ model: User, as: 'user' }]
      });
      
      if (oauthAccount) {
        return done(null, oauthAccount.user);
      }
      
      // Vérifie si un utilisateur avec cet email existe déjà
      let user = await User.findOne({
        where: { email: profile.emails[0].value }
      });
      
      if (user) {
        // Lie le compte OAuth à l'utilisateur existant
        oauthAccount = await OAuthAccount.create({
          provider: 'google',
          providerId: profile.id,
          userId: user.id
        });
        return done(null, user);
      }
      
      // Crée un nouvel utilisateur
      const nameParts = profile.displayName.split(' ');
      user = await User.create({
        email: profile.emails[0].value,
        firstName: nameParts[0] || profile.name.givenName || 'User',
        lastName: nameParts.slice(1).join(' ') || profile.name.familyName || '',
        emailVerifiedAt: new Date() // OAuth emails sont considérés comme vérifiés
      });
      
      await OAuthAccount.create({
        provider: 'google',
        providerId: profile.id,
        userId: user.id
      });
      
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }));
}

// Configuration GitHub OAuth
if (oauthConfig.github.clientID) {
  passport.use(new GitHubStrategy({
    clientID: oauthConfig.github.clientID,
    clientSecret: oauthConfig.github.clientSecret,
    callbackURL: oauthConfig.github.callbackURL
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      let oauthAccount = await OAuthAccount.findOne({
        where: {
          provider: 'github',
          providerId: profile.id.toString()
        },
        include: [{ model: User, as: 'user' }]
      });
      
      if (oauthAccount) {
        return done(null, oauthAccount.user);
      }
      
      // GitHub peut ne pas fournir d'email public
      const email = profile.emails?.[0]?.value || `${profile.username}@github.local`;
      
      let user = await User.findOne({
        where: { email }
      });
      
      if (user) {
        oauthAccount = await OAuthAccount.create({
          provider: 'github',
          providerId: profile.id.toString(),
          userId: user.id
        });
        return done(null, user);
      }
      
      const nameParts = (profile.displayName || profile.username).split(' ');
      user = await User.create({
        email,
        firstName: nameParts[0] || profile.username || 'User',
        lastName: nameParts.slice(1).join(' ') || '',
        emailVerifiedAt: profile.emails?.[0]?.value ? new Date() : null
      });
      
      await OAuthAccount.create({
        provider: 'github',
        providerId: profile.id.toString(),
        userId: user.id
      });
      
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }));
}

/**
 * GET /auth/oauth/callback/:provider
 * Callback OAuth après authentification
 */
const oauthCallback = async (req, res, next) => {
  const { provider } = req.params;
  
  if (!provider || !['google', 'github'].includes(provider)) {
    return res.status(400).json({
      success: false,
      message: 'Provider invalide'
    });
  }
  
  passport.authenticate(provider, async (err, user) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'authentification OAuth'
      });
    }
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentification OAuth échouée'
      });
    }
    
    // Vérifie si le compte est désactivé
    if (user.isDisabled()) {
      return res.status(403).json({
        success: false,
        message: 'Compte désactivé'
      });
    }
    
    // Génère les tokens
    const refreshTokenValue = RefreshToken.generateToken();
    const expiresAtRefresh = new Date();
    expiresAtRefresh.setDate(expiresAtRefresh.getDate() + 7);
    
    const refreshTokenRecord = await RefreshToken.create({
      token: refreshTokenValue,
      userId: user.id,
      userAgent: getUserAgent(req),
      ipAddress: getIpAddress(req),
      expiresAt: expiresAtRefresh
    });
    
    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ 
      userId: user.id, 
      tokenId: refreshTokenRecord.id 
    });
    
    // Enregistre la connexion
    await require('../models/LoginHistory').create({
      userId: user.id,
      email: user.email,
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req),
      success: true
    });
    
    // Redirige vers le frontend avec les tokens
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/oauth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`);
  })(req, res, next);
};

module.exports = {
  oauthCallback
};

