import React, { useEffect, useState } from "react";
import Card from "../components/Card.jsx";
import { api } from "../lib/api";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [err, setErr] = useState("");

  async function load() {
    setErr("");
    try {
      const s = await api.get("/dashboard/summary");
      setSummary(s.data);
    } catch (e) {
      setErr("Failed to load dashboard");
    }

    try {
      const f = await api.get("/forecast/tomorrow");
      setForecast(f.data);
    } catch (e) {
      setForecast({ error: "Forecast not available. Start ML service." });
    }
  }

  useEffect(() => { load(); }, []);

  if (!summary) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200" onClick={load}>Refresh</button>
      </div>

      {err && <div className="text-red-600">{err}</div>}

      <div className="grid md:grid-cols-4 gap-4">
        <Card title="Today">{summary.today}</Card>
        <Card title="Total Rooms">{summary.totalRooms}</Card>
        <Card title="Occupied Rooms">{summary.occupiedRooms}</Card>
        <Card title="Occupancy Rate">{summary.occupancyRate}%</Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card title="Today Bookings">{summary.todayBookings}</Card>

        <Card
          title="Tomorrow Forecast"
          right={<span className="text-xs text-slate-500">{forecast?.model ? `model: ${forecast.model}` : ""}</span>}
        >
          {!forecast && <div>Loading forecast...</div>}
          {forecast?.error && <div className="text-red-600 text-sm">{forecast.error}</div>}
          {forecast?.predicted_bookings !== undefined && (
            <div className="space-y-1">
              <div className="text-3xl font-bold">{forecast.predicted_bookings}</div>
              <div className="text-sm text-slate-600">Tomorrow: {forecast.tomorrow}</div>
              {forecast.note && <div className="text-xs text-slate-500">{forecast.note}</div>}
            </div>
          )}
        </Card>
      </div>

      <Card title="Recent Bookings">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-600">
                <th className="py-2">Guest</th>
                <th>Room</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {summary.recentBookings.map((b) => (
                <tr key={b.id} className="border-t">
                  <td className="py-2">{b.guest_name}</td>
                  <td>{b.room_number}</td>
                  <td>{b.check_in}</td>
                  <td>{b.check_out}</td>
                  <td>{b.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
