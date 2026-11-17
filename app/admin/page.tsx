"use client";

import React, { useEffect } from "react";
import { useApp } from "@/context/AppContext";
import AdminDashboard from "@/components/dashboard/AdminDashboard";

export default function AdminPage() {
  const { allUsers, switchUserRole, currentRole } = useApp();

  useEffect(() => {
    const adminUser = allUsers.find((u) => u.role === "admin");
    if (adminUser && currentRole !== "admin") {
      switchUserRole(adminUser.id);
    }
  }, [allUsers, currentRole, switchUserRole]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <AdminDashboard />
    </div>
  );
}
