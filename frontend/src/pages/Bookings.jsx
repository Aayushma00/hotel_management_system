import React, { useEffect, useState } from "react";
import Card from "../components/Card.jsx";
import { api } from "../lib/api";

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [guests, setGuests] = useState([]);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    guest_id: "",
    room_id: "",
    check_in: "",
    check_out: "",
    status: "confirmed"
  });

  async function load() {
    const [b, r, g] = await Promise.all([
      api.get("/bookings"),
      api.get("/rooms"),
      api.get("/guests"),
    ]);
    setBookings(b.data);
    setRooms(r.data);
    setGuests(g.data);
  }
  useEffect(() => { load(); }, []);

  async function create(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/bookings", {
        ...form,
        guest_id: Number(form.guest_id),
        room_id: Number(form.room_id),
      });
      setForm({ guest_id:"", room_id:"", check_in:"", check_out:"", status:"confirmed" });
      load();
    } catch (e) {
      setError(e?.response?.data?.error || "Failed");
    }
  }

  async function remove(id) {
    if (!confirm("Delete this booking?")) return;
    await api.delete(`/bookings/${id}`);
    load();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Bookings</h1>

      <Card title="Create Booking">
        <form onSubmit={create} className="grid md:grid-cols-5 gap-3">
          <select className="border rounded-lg p-2"
            value={form.guest_id} onChange={(e)=>setForm({...form, guest_id:e.target.value})}>
            <option value="">Select Guest</option>
            {guests.map(g => <option key={g.id} value={g.id}>{g.full_name}</option>)}
          </select>

          <select className="border rounded-lg p-2"
            value={form.room_id} onChange={(e)=>setForm({...form, room_id:e.target.value})}>
            <option value="">Select Room</option>
            {rooms.map(r => <option key={r.id} value={r.id}>{r.room_number} ({r.room_type})</option>)}
          </select>

          <input className="border rounded-lg p-2" type="date"
            value={form.check_in} onChange={(e)=>setForm({...form, check_in:e.target.value})} />
          <input className="border rounded-lg p-2" type="date"
            value={form.check_out} onChange={(e)=>setForm({...form, check_out:e.target.value})} />

          <select className="border rounded-lg p-2"
            value={form.status} onChange={(e)=>setForm({...form, status:e.target.value})}>
            <option value="confirmed">confirmed</option>
            <option value="checked_in">checked_in</option>
            <option value="checked_out">checked_out</option>
            <option value="cancelled">cancelled</option>
          </select>

          <div className="md:col-span-5">
            {error && <div className="text-red-600 text-sm mb-2">{String(error)}</div>}
            <button className="px-4 py-2 rounded-lg bg-slate-900 text-white">Create</button>
          </div>
        </form>
      </Card>

      <Card title="All Bookings">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-600">
                <th className="py-2">Guest</th>
                <th>Room</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.id} className="border-t">
                  <td className="py-2">{b.guest_name}</td>
                  <td>{b.room_number}</td>
                  <td>{b.check_in}</td>
                  <td>{b.check_out}</td>
                  <td>{b.status}</td>
                  <td className="text-right">
                    <button className="text-red-600" onClick={()=>remove(b.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
