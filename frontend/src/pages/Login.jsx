import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setToken } from "../lib/api";

export default function Login() {
  const nav = useNavigate();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/auth/login", { username, password });
      setToken(res.data.token);
      nav("/");
    } catch (e) {
      setError(e?.response?.data?.error || "Login failed");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={onSubmit} className="bg-white border rounded-2xl shadow-sm p-6 w-full max-w-sm">
        <h1 className="text-xl font-bold mb-1">Staff Login</h1>
        <p className="text-sm text-slate-600 mb-4">Use admin / admin123 (demo)</p>

        <label className="text-sm">Username</label>
        <input className="w-full border rounded-lg p-2 mb-3"
          value={username} onChange={(e)=>setUsername(e.target.value)} />

        <label className="text-sm">Password</label>
        <input type="password" className="w-full border rounded-lg p-2 mb-3"
          value={password} onChange={(e)=>setPassword(e.target.value)} />

        {error && <div className="text-red-600 text-sm mb-3">{error}</div>}

        <button className="w-full bg-slate-900 text-white rounded-lg py-2 hover:opacity-90">
          Login
        </button>
      </form>
    </div>
  );
}
