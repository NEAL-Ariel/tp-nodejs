const express = require("express");
const router = express.Router();
const {
  register,
  login,
  refreshAccessToken,
  logout,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
  changePassword
} = require("../services/auth.service");
const {
  sendVerificationEmail,
  sendPasswordResetEmail
} = require("../services/email.service");
const { verifyAccessToken } = require("../services/jwt.service");

// Middleware pour vérifier l'accès token
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token manquant" });
  }

  const token = authHeader.slice(7);
  const decoded = verifyAccessToken(token);

  if (!decoded) {
    return res.status(401).json({ error: "Token invalide ou expiré" });
  }

  req.userId = decoded.userId;
  next();
};

// POST /auth/register
router.post("/register", async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email et mot de passe requis" });
    }

    const result = await register(email, password, firstName, lastName);

    // Envoyer l'email de vérification
    await sendVerificationEmail(email, result.verificationToken);

    res.status(201).json({
      message: "Inscription réussie. Vérifiez votre email.",
      userId: result.userId
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email et mot de passe requis" });
    }

    const result = await login(email, password);

    res.json({
      message: "Connexion réussie",
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user
    });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// POST /auth/refresh
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token requis" });
    }

    const result = await refreshAccessToken(refreshToken);

    res.json({
      message: "Token rafraîchi",
      accessToken: result.accessToken
    });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// POST /auth/logout
router.post("/logout", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token requis" });
    }

    await logout(refreshToken);

    res.json({ message: "Déconnexion réussie" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /auth/verify-email
router.post("/verify-email", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Token requis" });
    }

    const result = await verifyEmail(token);

    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /auth/forgot-password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email requis" });
    }

    const result = await requestPasswordReset(email);

    // Envoyer l'email de réinitialisation
    if (result.resetToken) {
      await sendPasswordResetEmail(email, result.resetToken);
    }

    res.json({
      message: "Vérifiez votre email pour réinitialiser votre mot de passe"
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /auth/reset-password
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ error: "Token et nouveau mot de passe requis" });
    }

    const result = await resetPassword(token, newPassword);

    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /auth/change-password (authentifié)
router.post("/change-password", authMiddleware, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "Ancien et nouveau mot de passe requis" });
    }

    const result = await changePassword(req.userId, oldPassword, newPassword);

    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
