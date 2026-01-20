const express = require("express");
const { db } = require("../db/db");
const { authRequired } = require("../middleware/auth");
const { bookingSchema } = require("../utils/validators");

const bookingsRouter = express.Router();
bookingsRouter.use(authRequired);

function overlaps(aStart, aEnd, bStart, bEnd) {
  // overlap if aStart < bEnd AND bStart < aEnd
  return (aStart < bEnd) && (bStart < aEnd);
}

bookingsRouter.get("/", (req, res) => {
  const rows = db.prepare(`
    SELECT b.*, 
           g.full_name AS guest_name, 
           r.room_number AS room_number
    FROM bookings b
    JOIN guests g ON g.id = b.guest_id
    JOIN rooms r ON r.id = b.room_id
    ORDER BY b.id DESC
  `).all();
  res.json(rows);
});

bookingsRouter.post("/", (req, res) => {
  const parsed = bookingSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const b = parsed.data;

  // Validate dates
  if (b.check_out <= b.check_in) {
    return res.status(400).json({ error: "check_out must be after check_in" });
  }

  // Room availability check (simple)
  const existing = db.prepare(`
    SELECT check_in, check_out, status FROM bookings
    WHERE room_id = ? AND status IN ('confirmed','checked_in')
  `).all(b.room_id);

  for (const e of existing) {
    if (overlaps(b.check_in, b.check_out, e.check_in, e.check_out)) {
      return res.status(409).json({ error: "Room already booked in this date range" });
    }
  }

  const info = db.prepare(
    "INSERT INTO bookings (guest_id, room_id, check_in, check_out, status) VALUES (?,?,?,?,?)"
  ).run(b.guest_id, b.room_id, b.check_in, b.check_out, b.status);

  res.status(201).json({ id: info.lastInsertRowid, ...b });
});

bookingsRouter.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  const parsed = bookingSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const exists = db.prepare("SELECT * FROM bookings WHERE id = ?").get(id);
  if (!exists) return res.status(404).json({ error: "Booking not found" });

  const b = parsed.data;
  if (b.check_out <= b.check_in) {
    return res.status(400).json({ error: "check_out must be after check_in" });
  }

  // Check conflicts excluding this booking
  const existing = db.prepare(`
    SELECT id, check_in, check_out, status FROM bookings
    WHERE room_id = ? AND id != ? AND status IN ('confirmed','checked_in')
  `).all(b.room_id, id);

  for (const e of existing) {
    if (overlaps(b.check_in, b.check_out, e.check_in, e.check_out)) {
      return res.status(409).json({ error: "Room already booked in this date range" });
    }
  }

  db.prepare("UPDATE bookings SET guest_id=?, room_id=?, check_in=?, check_out=?, status=? WHERE id=?")
    .run(b.guest_id, b.room_id, b.check_in, b.check_out, b.status, id);

  res.json({ id, ...b });
});

bookingsRouter.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  const exists = db.prepare("SELECT id FROM bookings WHERE id = ?").get(id);
  if (!exists) return res.status(404).json({ error: "Booking not found" });

  db.prepare("DELETE FROM bookings WHERE id = ?").run(id);
  res.json({ ok: true });
});

module.exports = { bookingsRouter };
