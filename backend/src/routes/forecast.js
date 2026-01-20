const express = require("express");
const fetch = require("node-fetch");
const { db } = require("../db/db");
const { authRequired } = require("../middleware/auth");

const forecastRouter = express.Router();
forecastRouter.use(authRequired);

function toISO(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth()+1).padStart(2,"0");
  const dd = String(d.getDate()).padStart(2,"0");
  return `${yyyy}-${mm}-${dd}`;
}

forecastRouter.get("/tomorrow", async (req, res) => {
  // Build daily counts from bookings table (based on check_in date)
  const rows = db.prepare(`
    SELECT check_in as ds, COUNT(*) as y
    FROM bookings
    WHERE status != 'cancelled'
    GROUP BY check_in
    ORDER BY check_in
  `).all();

  // If no data, return simple result
  if (!rows || rows.length < 3) {
    return res.json({
      model: "fallback",
      tomorrow: toISO(new Date(Date.now() + 86400000)),
      predicted_bookings: rows.length ? rows[rows.length - 1].y : 0,
      note: "Not enough historical data; using last value."
    });
  }

  const ML_BASE_URL = process.env.ML_BASE_URL || "http://localhost:5001";
  const url = `${ML_BASE_URL}/predict`;

  try {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ history: rows })
    });

    if (!r.ok) {
      const txt = await r.text();
      return res.status(502).json({ error: "ML service error", details: txt });
    }

    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.status(502).json({
      error: "Cannot reach ML service",
      hint: "Start ml_service first (python app.py) or check ML_BASE_URL in backend/.env",
      details: String(e)
    });
  }
});

module.exports = { forecastRouter };
