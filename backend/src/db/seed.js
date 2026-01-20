const bcrypt = require("bcryptjs");
const { db } = require("./db");

function upsertAdmin() {
  const username = "admin";
  const password = "admin123";
  const hash = bcrypt.hashSync(password, 10);

  const existing = db.prepare("SELECT id FROM staff_users WHERE username = ?").get(username);
  if (!existing) {
    db.prepare("INSERT INTO staff_users (username, password_hash, role) VALUES (?,?,?)")
      .run(username, hash, "admin");
    console.log("✅ Created admin user (admin / admin123)");
  } else {
    db.prepare("UPDATE staff_users SET password_hash = ? WHERE username = ?").run(hash, username);
    console.log("✅ Updated admin password (admin / admin123)");
  }
}

function seedRooms() {
  const rooms = [
    { room_number: "101", room_type: "Single", price_per_night: 25, status: "available" },
    { room_number: "102", room_type: "Single", price_per_night: 25, status: "available" },
    { room_number: "201", room_type: "Double", price_per_night: 40, status: "available" },
    { room_number: "202", room_type: "Deluxe", price_per_night: 60, status: "maintenance" },
  ];
  const stmt = db.prepare("INSERT OR IGNORE INTO rooms (room_number, room_type, price_per_night, status) VALUES (?,?,?,?)");
  rooms.forEach(r => stmt.run(r.room_number, r.room_type, r.price_per_night, r.status));
  console.log("✅ Seeded rooms");
}

function seedGuestsAndBookings() {
  const guestStmt = db.prepare("INSERT INTO guests (full_name, phone, email, address) VALUES (?,?,?,?)");
  const bookingStmt = db.prepare("INSERT INTO bookings (guest_id, room_id, check_in, check_out, status) VALUES (?,?,?,?,?)");

  const g1 = guestStmt.run("Sita Sharma", "9800000001", "sita@example.com", "Kathmandu").lastInsertRowid;
  const g2 = guestStmt.run("Ram Thapa", "9800000002", "ram@example.com", "Pokhara").lastInsertRowid;

  const r101 = db.prepare("SELECT id FROM rooms WHERE room_number='101'").get().id;
  const r201 = db.prepare("SELECT id FROM rooms WHERE room_number='201'").get().id;

  // Some bookings around today for demo (relative to local machine date)
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth()+1).padStart(2,"0");
  const dd = String(today.getDate()).padStart(2,"0");
  const todayStr = `${yyyy}-${mm}-${dd}`;

  const tomorrow = new Date(today.getTime() + 86400000);
  const tyyyy = tomorrow.getFullYear();
  const tmm = String(tomorrow.getMonth()+1).padStart(2,"0");
  const tdd = String(tomorrow.getDate()).padStart(2,"0");
  const tomorrowStr = `${tyyyy}-${tmm}-${tdd}`;

  bookingStmt.run(g1, r101, todayStr, tomorrowStr, "confirmed");
  bookingStmt.run(g2, r201, todayStr, tomorrowStr, "confirmed");
  console.log("✅ Seeded guests and bookings");
}

upsertAdmin();
seedRooms();
seedGuestsAndBookings();

console.log("✅ Seed complete");
process.exit(0);
