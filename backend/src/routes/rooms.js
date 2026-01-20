const express = require("express");
const { db } = require("../db/db");
const { authRequired } = require("../middleware/auth");
const { roomSchema } = require("../utils/validators");

const roomsRouter = express.Router();
roomsRouter.use(authRequired);

roomsRouter.get("/", (req, res) => {
  const rows = db.prepare("SELECT * FROM rooms ORDER BY room_number").all();
  res.json(rows);
});

roomsRouter.post("/", (req, res) => {
  const parsed = roomSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const r = parsed.data;
  try {
    const info = db.prepare(
      "INSERT INTO rooms (room_number, room_type, price_per_night, status) VALUES (?,?,?,?)"
    ).run(r.room_number, r.room_type, r.price_per_night, r.status);

    res.status(201).json({ id: info.lastInsertRowid, ...r });
  } catch (e) {
    return res.status(400).json({ error: "Room number already exists" });
  }
});

roomsRouter.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  const parsed = roomSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const r = parsed.data;
  const exists = db.prepare("SELECT id FROM rooms WHERE id = ?").get(id);
  if (!exists) return res.status(404).json({ error: "Room not found" });

  try {
    db.prepare(
      "UPDATE rooms SET room_number=?, room_type=?, price_per_night=?, status=? WHERE id=?"
    ).run(r.room_number, r.room_type, r.price_per_night, r.status, id);

    res.json({ id, ...r });
  } catch (e) {
    return res.status(400).json({ error: "Room number already exists" });
  }
});

roomsRouter.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  const exists = db.prepare("SELECT id FROM rooms WHERE id = ?").get(id);
  if (!exists) return res.status(404).json({ error: "Room not found" });

  db.prepare("DELETE FROM rooms WHERE id = ?").run(id);
  res.json({ ok: true });
});

module.exports = { roomsRouter };
