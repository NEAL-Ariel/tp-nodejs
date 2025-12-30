const express = require("express");
const QRCode = require("qrcode");
const { generateSecret, verifyToken } = require("../services/twofa.service");

const router = express.Router();
let secret;

// POST /auth/2fa/enable
router.post("/enable", async (req, res) => {
  secret = generateSecret();
  const qr = await QRCode.toDataURL(secret.otpauth_url);
  res.json({ qr });
});

// POST /auth/2fa/verify
router.post("/verify", (req, res) => {
  // 🔐 Protection si body manquant
  if (!req.body || !req.body.token) {
    return res.status(400).json({
      error: "Token manquant"
    });
  }

  const { token } = req.body;
  const verified = verifyToken(secret, token);

  res.json({ verified });
});

// POST /auth/2fa/disable
router.post("/disable", (req, res) => {
  secret = null;
  res.send("2FA désactivé");
});

module.exports = router;
