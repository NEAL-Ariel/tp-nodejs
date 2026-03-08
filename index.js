require("dotenv").config();
const express = require("express");
const app = express();

app.use(express.json());

// Charger la configuration de la BD
require("./config/db");

// Routes
const authRoutes = require("./routes/auth");
const sessionsRoutes = require("./routes/sessions");
const oauthRoutes = require("./routes/oauth");
const twofaRoutes = require("./routes/twofa");

app.get("/", (req, res) => {
  res.send("API Auth – Authentification de base implémentée");
});

app.use("/auth", authRoutes);
app.use("/sessions", sessionsRoutes);
app.use("/auth/oauth", oauthRoutes);
app.use("/auth/2fa", twofaRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
});
