const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { db } = require("../db/db");

const authRouter = express.Router();

/**
 * POST /api/auth/login
 * body: { username, password }
 */
authRouter.post("/login", (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: "username and password required" });

  const user = db.prepare("SELECT id, username, password_hash, role FROM staff_users WHERE username = ?").get(username);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = bcrypt.compareSync(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET || "change_me",
    { expiresIn: "7d" }
  );

  res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
});

module.exports = { authRouter };
