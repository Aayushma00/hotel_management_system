const express = require("express");
const { db } = require("../db/db");
const { authRequired } = require("../middleware/auth");
const { guestSchema } = require("../utils/validators");

const guestsRouter = express.Router();
guestsRouter.use(authRequired);

guestsRouter.get("/", (req, res) => {
  const rows = db.prepare("SELECT * FROM guests ORDER BY id DESC").all();
  res.json(rows);
});

guestsRouter.post("/", (req, res) => {
  const parsed = guestSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const g = parsed.data;
  const info = db.prepare(
    "INSERT INTO guests (full_name, phone, email, address) VALUES (?,?,?,?)"
  ).run(g.full_name, g.phone || null, g.email || null, g.address || null);

  res.status(201).json({ id: info.lastInsertRowid, ...g });
});

guestsRouter.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  const parsed = guestSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const exists = db.prepare("SELECT id FROM guests WHERE id = ?").get(id);
  if (!exists) return res.status(404).json({ error: "Guest not found" });

  const g = parsed.data;
  db.prepare("UPDATE guests SET full_name=?, phone=?, email=?, address=? WHERE id=?")
    .run(g.full_name, g.phone || null, g.email || null, g.address || null, id);

  res.json({ id, ...g });
});

guestsRouter.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  const exists = db.prepare("SELECT id FROM guests WHERE id = ?").get(id);
  if (!exists) return res.status(404).json({ error: "Guest not found" });

  db.prepare("DELETE FROM guests WHERE id = ?").run(id);
  res.json({ ok: true });
});

module.exports = { guestsRouter };
