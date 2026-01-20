import React from "react";

export default function Card({ title, children, right }) {
  return (
    <div className="bg-white border rounded-2xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold">{title}</div>
        {right}
      </div>
      {children}
    </div>
  );
}
