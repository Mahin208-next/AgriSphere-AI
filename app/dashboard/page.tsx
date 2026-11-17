"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import FarmerDashboard from "@/components/dashboard/FarmerDashboard";
import BuyerDashboard from "@/components/dashboard/BuyerDashboard";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import ExportRadarView from "@/components/export/ExportRadarView";
import { UserCheck } from "lucide-react";

export default function DashboardPage() {
  const { currentUser, currentRole, allUsers, switchUserRole, language, t } = useApp();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Role Switcher Pill Bar for Demo Verification */}
      <div className="bg-white p-3 rounded-2xl border border-earth-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-earth-700">
          <UserCheck className="w-4 h-4 text-agri-600" />
          <span className="font-bold text-earth-900">
            {language === "bn" ? "ড্যাশবোর্ড মোড পরিবর্তন:" : "Active Role View:"}
          </span>
          <span className="font-semibold text-agri-800 bg-agri-50 px-2 py-0.5 rounded border border-agri-200">
            {currentUser?.name} ({t.roles[currentRole] || currentRole})
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {allUsers.map((u) => {
            const isSelected = u.id === currentUser?.id;
            return (
              <button
                key={u.id}
                onClick={() => switchUserRole(u.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  isSelected
                    ? "bg-agri-800 text-white font-bold shadow-xs"
                    : "bg-earth-100 text-earth-600 hover:bg-earth-200 hover:text-earth-900"
                }`}
              >
                {t.roles[u.role] || u.role}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Role-Based View */}
      {currentRole === "farmer" && <FarmerDashboard />}
      {(currentRole === "buyer" || currentRole === "factory" || currentRole === "retailer") && <BuyerDashboard />}
      {(currentRole === "exporter" || currentRole === "importer") && <ExportRadarView />}
      {currentRole === "admin" && <AdminDashboard />}
    </div>
  );
}

