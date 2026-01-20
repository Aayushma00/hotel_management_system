const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");

dotenv.config();

const { authRouter } = require("./routes/auth");
const { roomsRouter } = require("./routes/rooms");
const { guestsRouter } = require("./routes/guests");
const { bookingsRouter } = require("./routes/bookings");
const { dashboardRouter } = require("./routes/dashboard");
const { forecastRouter } = require("./routes/forecast");
const { errorHandler, notFound } = require("./utils/errors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => res.json({ ok: true, name: "HMS Backend" }));

app.use("/api/auth", authRouter);
app.use("/api/rooms", roomsRouter);
app.use("/api/guests", guestsRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/forecast", forecastRouter);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
