"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { AuditLog, OversupplyAlert, User } from "@/types";
import { 
  ShieldCheck, 
  Users, 
  UploadCloud, 
  AlertTriangle, 
  Activity, 
  CheckCircle2, 
  FileText,
  TrendingUp,
  Database
} from "lucide-react";

export default function AdminDashboard() {
  const { currentUser, language, t } = useApp();
  const [stats, setStats] = useState<any>({});
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [alerts, setAlerts] = useState<OversupplyAlert[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [csvText, setCsvText] = useState(
`cropId,cropNameEn,marketId,marketNameEn,district,wholesalePrice,retailPrice,date,priceSource
green_chilli,Green Chilli,mkt_karwan_bazar,Karwan Bazar Wholesale,Dhaka,168,198,2026-11-09,DAM
cucumber,Cucumber,mkt_mahasthangarh,Mahasthangarh Agri Hub,Bogura,29,39,2026-11-09,DAM
sweet_pumpkin,Sweet Pumpkin,mkt_shyambazar,Shyambazar Wholesale,Dhaka,35,46,2026-11-09,DAM`
  );
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);

  const fetchAdminOverview = async () => {
    try {
      const res = await fetch("/api/v1/admin/overview");
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats || {});
        setAuditLogs(data.auditLogs || []);
        setAlerts(data.oversupplyAlerts || []);
        setUsers(data.users || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchAdminOverview();
  }, []);

  const handleImportCsv = async (e: React.FormEvent) => {
    e.preventDefault();
    setImporting(true);
    setImportResult(null);

    try {
      const res = await fetch("/api/v1/admin/prices/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvText }),
      });

      const data = await res.json();
      if (res.ok) {
        setImportResult(`Successfully imported ${data.importedCount} verified DAM market price records into live database.`);
        fetchAdminOverview();
      } else {
        setImportResult(`Error: ${data.error}`);
      }
    } catch (err: any) {
      setImportResult(`Import failed: ${err.message}`);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-earth-900 to-agri-950 text-white p-6 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-agri-700 text-agri-200 uppercase tracking-wider">
            {language === "bn" ? "প্ল্যাটফর্ম সুপারভিশন ও অডিট" : "Admin Oversight & DAM Observer"}
          </span>
          <h1 className="text-2xl font-black mt-2">
            KrishiSetu AI System Administration
          </h1>
          <p className="text-xs text-earth-300 mt-1">
            {language === "bn"
              ? "সরাসরি অডিট লগ, ব্যবহারকারী যাচাইকরণ, বাজার দর সিএসভি ইমপোর্ট এবং কার্টেল নজরদারি"
              : "Live audit trail, user verification, DAM price synchronization, and syndicate monitoring"}
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-earth-200 shadow-2xs">
          <div className="text-xs text-earth-500 font-medium">Total Registered Users</div>
          <div className="text-2xl font-black text-earth-900 mt-1">
            {stats.totalUsers || 0}
          </div>
          <div className="text-[11px] text-earth-400 mt-0.5">
            {stats.farmersCount || 0} Farmers • {stats.buyersCount || 0} Buyers
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-earth-200 shadow-2xs">
          <div className="text-xs text-earth-500 font-medium">Completed Platform Trades</div>
          <div className="text-2xl font-black text-agri-800 mt-1">
            ৳{(stats.totalTradeVolumeBdt || 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-earth-400 mt-0.5">
            {stats.completedOrdersCount || 0} Settled Orders
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-earth-200 shadow-2xs">
          <div className="text-xs text-earth-500 font-medium">Active Market Operations</div>
          <div className="text-2xl font-black text-harvest-600 mt-1">
            {stats.activeAuctions || 0}
          </div>
          <div className="text-[11px] text-earth-400 mt-0.5">
            {stats.activeListings || 0} Listings • {stats.openProcurementRequests || 0} Demands
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-earth-200 shadow-2xs">
          <div className="text-xs text-earth-500 font-medium">Price Records in Database</div>
          <div className="text-2xl font-black text-earth-900 mt-1">
            {stats.priceRecordsCount || 0}
          </div>
          <div className="text-[11px] text-agri-700 font-semibold mt-0.5">
            DAM BD Synchronized
          </div>
        </div>
      </div>

      {/* Section 1: CSV Market Price Import Tool */}
      <div className="bg-white p-6 rounded-2xl border border-earth-200 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <UploadCloud className="w-5 h-5 text-agri-700" />
          <h3 className="text-base font-bold text-earth-900">
            {language === "bn" ? "কৃষি বিপণন অধিদপ্তর (DAM) দৈনিক বাজার দর CSV ইমপোর্ট" : "Import DAM Official Market Prices (CSV)"}
          </h3>
        </div>
        <p className="text-xs text-earth-500 mb-4">
          {language === "bn"
            ? "প্রতিদিনের পাইকারি ও খুচরা দর সিএসভি ফরম্যাটে আপলোড করুন। এআই রিকমেন্ডার ইঞ্জিন স্বয়ংক্রিয়ভাবে আপডেট হবে।"
            : "Directly import validated wholesale and retail price records into the active database to power AI calculations."}
        </p>

        {importResult && (
          <div className="p-3 mb-4 rounded-xl text-xs bg-agri-50 text-agri-900 border border-agri-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-agri-700" />
            <span>{importResult}</span>
          </div>
        )}

        <form onSubmit={handleImportCsv} className="space-y-3">
          <textarea
            rows={5}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            className="w-full font-mono text-xs p-3 bg-earth-50 border border-earth-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-agri-500"
            required
          />

          <div className="flex justify-between items-center">
            <span className="text-[11px] text-earth-400 font-mono">
              Format: cropId, cropNameEn, marketId, marketNameEn, district, wholesalePrice, retailPrice, date, priceSource
            </span>
            <button
              type="submit"
              disabled={importing}
              className="px-5 py-2 bg-agri-700 hover:bg-agri-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <Database className="w-3.5 h-3.5" />
              <span>{importing ? "Processing..." : "Validate & Import CSV"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Section 2: Real-time Immutable Audit Logs */}
      <div className="bg-white p-6 rounded-2xl border border-earth-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-agri-700" />
            <h3 className="text-base font-bold text-earth-900">
              {language === "bn" ? "সার্ভার লেনদেন ও বিডিং অডিট ট্রেইল (Immutable Audit Trail)" : "Real-time Platform Audit Log"}
            </h3>
          </div>
          <span className="text-xs text-earth-400 font-mono">
            {auditLogs.length} Events Logged
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-earth-700">
            <thead className="bg-earth-50 border-y border-earth-200 text-earth-500 font-semibold uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">User / Actor</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Entity</th>
                <th className="py-2.5 px-3">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-earth-100 font-mono text-[11px]">
              {auditLogs.slice(0, 15).map((log) => (
                <tr key={log.id} className="hover:bg-earth-50/60">
                  <td className="py-2.5 px-3 text-earth-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="py-2.5 px-3 font-sans font-bold text-earth-900 whitespace-nowrap">
                    {log.userName || "System"}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-agri-100 text-agri-800 font-semibold">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-earth-500">{log.entityType}</td>
                  <td className="py-2.5 px-3 font-sans text-earth-800 max-w-md truncate">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

