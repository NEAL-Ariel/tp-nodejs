const express = require("express");
const router = express.Router();

// Simulation base de données
let sessions = [
  { id: 1, device: "Chrome Windows", ip: "127.0.0.1", active: true },
  { id: 2, device: "Android Phone", ip: "192.168.1.10", active: true }
];

// GET /sessions
router.get("/", (req, res) => {
  res.json(sessions.filter(s => s.active));
});

// DELETE /sessions/:id
router.delete("/:id", (req, res) => {
  const id = parseInt(req.params.id);
  sessions = sessions.map(s =>
    s.id === id ? { ...s, active: false } : s
  );
  res.send("Session révoquée");
});

// DELETE /sessions/others
router.delete("/others", (req, res) => {
  sessions = sessions.map((s, index) =>
    index === 0 ? s : { ...s, active: false }
  );
  res.send("Autres sessions révoquées");
});

module.exports = router;
