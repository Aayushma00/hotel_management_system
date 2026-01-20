const express = require("express");
const { db } = require("../db/db");
const { authRequired } = require("../middleware/auth");

const dashboardRouter = express.Router();
dashboardRouter.use(authRequired);

function todayStr() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth()+1).padStart(2,"0");
  const dd = String(d.getDate()).padStart(2,"0");
  return `${yyyy}-${mm}-${dd}`;
}

dashboardRouter.get("/summary", (req, res) => {
  const today = todayStr();

  const totalRooms = db.prepare("SELECT COUNT(*) as n FROM rooms").get().n;

  // Occupied = rooms that have a booking where today is between check_in and check_out (exclusive end)
  const occupiedRooms = db.prepare(`
    SELECT COUNT(DISTINCT room_id) as n
    FROM bookings
    WHERE status IN ('confirmed','checked_in')
      AND check_in <= ?
      AND check_out > ?
  `).get(today, today).n;

  const todayBookings = db.prepare(`
    SELECT COUNT(*) as n
    FROM bookings
    WHERE check_in = ?
  `).get(today).n;

  const recentBookings = db.prepare(`
    SELECT b.*, g.full_name AS guest_name, r.room_number AS room_number
    FROM bookings b
    JOIN guests g ON g.id=b.guest_id
    JOIN rooms r ON r.id=b.room_id
    ORDER BY b.id DESC
    LIMIT 5
  `).all();

  res.json({
    today,
    totalRooms,
    occupiedRooms,
    occupancyRate: totalRooms === 0 ? 0 : Math.round((occupiedRooms / totalRooms) * 100),
    todayBookings,
    recentBookings
  });
});

module.exports = { dashboardRouter };
