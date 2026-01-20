import React, { useEffect, useState } from "react";
import Card from "../components/Card.jsx";
import { api } from "../lib/api";

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState({ room_number: "", room_type: "", price_per_night: 0, status: "available" });
  const [error, setError] = useState("");

  async function load() {
    const res = await api.get("/rooms");
    setRooms(res.data);
  }

  useEffect(() => { load(); }, []);

  async function create(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/rooms", { ...form, price_per_night: Number(form.price_per_night) });
      setForm({ room_number: "", room_type: "", price_per_night: 0, status: "available" });
      load();
    } catch (e) {
      setError(e?.response?.data?.error || "Failed");
    }
  }

  async function remove(id) {
    if (!confirm("Delete this room?")) return;
    await api.delete(`/rooms/${id}`);
    load();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Rooms</h1>

      <Card title="Add Room">
        <form onSubmit={create} className="grid md:grid-cols-4 gap-3">
          <input className="border rounded-lg p-2" placeholder="Room Number"
            value={form.room_number} onChange={(e)=>setForm({...form, room_number:e.target.value})} />
          <input className="border rounded-lg p-2" placeholder="Room Type (Single/Double)"
            value={form.room_type} onChange={(e)=>setForm({...form, room_type:e.target.value})} />
          <input className="border rounded-lg p-2" type="number" placeholder="Price"
            value={form.price_per_night} onChange={(e)=>setForm({...form, price_per_night:e.target.value})} />
          <select className="border rounded-lg p-2"
            value={form.status} onChange={(e)=>setForm({...form, status:e.target.value})}>
            <option value="available">available</option>
            <option value="occupied">occupied</option>
            <option value="maintenance">maintenance</option>
          </select>

          <div className="md:col-span-4">
            {error && <div className="text-red-600 text-sm mb-2">{String(error)}</div>}
            <button className="px-4 py-2 rounded-lg bg-slate-900 text-white">Create</button>
          </div>
        </form>
      </Card>

      <Card title="All Rooms">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-600">
                <th className="py-2">#</th>
                <th>Type</th>
                <th>Price</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rooms.map(r => (
                <tr key={r.id} className="border-t">
                  <td className="py-2">{r.room_number}</td>
                  <td>{r.room_type}</td>
                  <td>{r.price_per_night}</td>
                  <td>{r.status}</td>
                  <td className="text-right">
                    <button className="text-red-600" onClick={()=>remove(r.id)}>Delete</button>
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
