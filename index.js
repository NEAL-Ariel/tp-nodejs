const express = require("express");
const app = express();

app.use(express.json());

const sessionsRoutes = require("./routes/sessions");
const oauthRoutes = require("./routes/oauth");
const twofaRoutes = require("./routes/twofa");

app.get("/", (req, res) => {
  res.send("API Auth – Partie 5 complète");
});

app.use("/sessions", sessionsRoutes);
app.use("/auth/oauth", oauthRoutes);
app.use("/auth/2fa", twofaRoutes);

app.listen(3000, () => {
  console.log("Serveur démarré sur http://localhost:3000");
});
