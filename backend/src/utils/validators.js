const { z } = require("zod");

const roomSchema = z.object({
  room_number: z.string().min(1),
  room_type: z.string().min(1),
  price_per_night: z.number().nonnegative(),
  status: z.enum(["available", "occupied", "maintenance"]).default("available")
});

const guestSchema = z.object({
  full_name: z.string().min(2),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  address: z.string().optional().nullable()
});

const bookingSchema = z.object({
  guest_id: z.number().int().positive(),
  room_id: z.number().int().positive(),
  check_in: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  check_out: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(["confirmed","checked_in","checked_out","cancelled"]).default("confirmed")
});

module.exports = { roomSchema, guestSchema, bookingSchema };
