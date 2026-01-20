import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Layout from "./components/Layout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Rooms from "./pages/Rooms.jsx";
import Guests from "./pages/Guests.jsx";
import Bookings from "./pages/Bookings.jsx";
import { getToken } from "./lib/api";

function PrivateRoute({ children }) {
  return getToken() ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="rooms" element={<Rooms />} />
        <Route path="guests" element={<Guests />} />
        <Route path="bookings" element={<Bookings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
