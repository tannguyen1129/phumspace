"use client";

import { useEffect, useState } from "react";
import type { HealthResponseContract } from "@phumspace/contracts";

export function ApiStatus() {
  const [data, setData] = useState<HealthResponseContract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const res = await fetch(`${apiUrl}/api/v1/health`, { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const json: HealthResponseContract = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to connect to API");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div id="api-status-card" className="mt-8 p-6 rounded-2xl bg-slate-800/80 border border-slate-700/60 backdrop-blur-md shadow-xl transition-all hover:border-amber-500/40">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex h-4 w-4">
            {loading ? (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            ) : data ? (
              <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            ) : (
              <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            )}
            <span
              className={`relative inline-flex rounded-full h-4 w-4 ${
                loading
                  ? "bg-amber-500"
                  : data
                  ? "bg-emerald-500"
                  : "bg-rose-500"
              }`}
            ></span>
          </div>
          <h2 id="api-status-title" className="text-lg font-semibold text-slate-100">
            Trạng thái kết nối API Backend
          </h2>
        </div>
        <button
          id="btn-retry-health"
          onClick={fetchHealth}
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-700 text-slate-200 hover:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/50"
        >
          Tải lại
        </button>
      </div>

      <div className="mt-4 text-sm font-mono">
        {loading && (
          <p id="api-status-loading" className="text-amber-400">Đang kiểm tra kết nối tới NestJS API (/api/v1/health)...</p>
        )}
        {!loading && error && (
          <div id="api-status-error" className="space-y-1 text-rose-400">
            <p className="font-semibold">⚠️ Offline / Không thể kết nối API</p>
            <p className="text-xs text-slate-400">Chi tiết: {error}</p>
          </div>
        )}
        {!loading && data && (
          <div id="api-status-success" className="space-y-2 text-slate-300">
            <div className="flex items-center justify-between border-b border-slate-700/50 pb-2">
              <span className="text-slate-400">Trạng thái (Status):</span>
              <span className="px-2 py-0.5 text-xs font-bold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {data.status.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-700/50 pb-2">
              <span className="text-slate-400">Dịch vụ (Service):</span>
              <span className="text-amber-300 font-semibold">{data.service}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Thời gian (Timestamp):</span>
              <span className="text-xs text-slate-300">{data.timestamp}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
