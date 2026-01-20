# Quick Diagram Guide (for your report)

## 1) ER Diagram (tables)
- staff_users (id, username, password_hash, role)
- rooms (id, room_number, room_type, price_per_night, status)
- guests (id, full_name, phone, email, address)
- bookings (id, guest_id, room_id, check_in, check_out, status)

Relationships:
- One Guest -> Many Bookings
- One Room -> Many Bookings

## 2) Use Case Diagram (actors)
Actor: Staff
Use cases:
- Login
- Manage Rooms
- Manage Guests
- Manage Bookings
- View Dashboard
- View Tomorrow Forecast

## 3) DFD (simple)
Staff -> (React UI) -> (Express API) -> (SQLite DB)
Express API -> (Flask ML Service) -> Forecast result -> UI
