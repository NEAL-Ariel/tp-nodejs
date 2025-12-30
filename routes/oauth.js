const express = require("express");
const router = express.Router();

// GET /auth/oauth/start
router.get("/start", (req, res) => {
  res.send(
    "Redirection vers GitHub OAuth (simulation)"
  );
});

// GET /auth/oauth/callback
router.get("/callback", (req, res) => {
  const fakeGithubUser = {
    id: "github_12345",
    username: "aime-dev"
  };

  res.json({
    message: "Connexion GitHub réussie",
    user: fakeGithubUser
  });
});

module.exports = router;
