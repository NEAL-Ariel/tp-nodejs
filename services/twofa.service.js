const speakeasy = require("speakeasy");

function generateSecret() {
  return speakeasy.generateSecret();
}

function verifyToken(secret, token) {
  return speakeasy.totp.verify({
    secret: secret.base32,
    encoding: "base32",
    token
  });
}

module.exports = { generateSecret, verifyToken };
