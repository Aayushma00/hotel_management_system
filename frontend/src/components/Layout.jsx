import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { clearToken } from "../lib/api";

const linkClass = ({ isActive }) =>
  "px-3 py-2 rounded-lg " + (isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-200");

export default function Layout() {
  const nav = useNavigate();
  return (
    <div className="min-h-screen">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="font-bold">Hotel Management System</div>
          <nav className="flex gap-2">
            <NavLink to="/" className={linkClass} end>Dashboard</NavLink>
            <NavLink to="/rooms" className={linkClass}>Rooms</NavLink>
            <NavLink to="/guests" className={linkClass}>Guests</NavLink>
            <NavLink to="/bookings" className={linkClass}>Bookings</NavLink>
          </nav>
          <button
            className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200"
            onClick={() => { clearToken(); nav("/login"); }}
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4">
        <Outlet />
      </main>
    </div>
  );
}
