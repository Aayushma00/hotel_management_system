import React, { useEffect, useState } from "react";
import Card from "../components/Card.jsx";
import { api } from "../lib/api";

export default function Guests() {
  const [guests, setGuests] = useState([]);
  const [form, setForm] = useState({ full_name: "", phone: "", email: "", address: "" });
  const [error, setError] = useState("");

  async function load() {
    const res = await api.get("/guests");
    setGuests(res.data);
  }
  useEffect(() => { load(); }, []);

  async function create(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/guests", form);
      setForm({ full_name: "", phone: "", email: "", address: "" });
      load();
    } catch (e) {
      setError(e?.response?.data?.error || "Failed");
    }
  }

  async function remove(id) {
    if (!confirm("Delete this guest?")) return;
    await api.delete(`/guests/${id}`);
    load();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Guests</h1>

      <Card title="Add Guest">
        <form onSubmit={create} className="grid md:grid-cols-2 gap-3">
          <input className="border rounded-lg p-2" placeholder="Full Name"
            value={form.full_name} onChange={(e)=>setForm({...form, full_name:e.target.value})} />
          <input className="border rounded-lg p-2" placeholder="Phone"
            value={form.phone} onChange={(e)=>setForm({...form, phone:e.target.value})} />
          <input className="border rounded-lg p-2" placeholder="Email"
            value={form.email} onChange={(e)=>setForm({...form, email:e.target.value})} />
          <input className="border rounded-lg p-2" placeholder="Address"
            value={form.address} onChange={(e)=>setForm({...form, address:e.target.value})} />

          <div className="md:col-span-2">
            {error && <div className="text-red-600 text-sm mb-2">{String(error)}</div>}
            <button className="px-4 py-2 rounded-lg bg-slate-900 text-white">Create</button>
          </div>
        </form>
      </Card>

      <Card title="All Guests">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-600">
                <th className="py-2">Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Address</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {guests.map(g => (
                <tr key={g.id} className="border-t">
                  <td className="py-2">{g.full_name}</td>
                  <td>{g.phone}</td>
                  <td>{g.email}</td>
                  <td>{g.address}</td>
                  <td className="text-right">
                    <button className="text-red-600" onClick={()=>remove(g.id)}>Delete</button>
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
