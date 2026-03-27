"use client";

import type { CityState } from "@/lib/types";

interface StatsBarProps {
  state: CityState;
  connected: boolean;
}

export default function StatsBar({ state, connected }: StatsBarProps) {
  const activeIncidents = state.incidents.filter(
    (i) => i.status !== "resolved"
  ).length;

  const avgSpeed =
    state.traffic && state.traffic.segments.length > 0
      ? state.traffic.segments.reduce((sum, s) => sum + s.speed_mph, 0) /
        state.traffic.segments.length
      : 0;

  const transitTotal = state.transit?.vehicles.length ?? 0;
  const transitOnTime =
    state.transit?.vehicles.filter((v) => v.status === "on_time").length ?? 0;
  const onTimeRatio =
    transitTotal > 0 ? Math.round((transitOnTime / transitTotal) * 100) : 0;

  const temp = state.weather?.conditions.temperature_f ?? null;
  const precip = state.weather?.conditions.precipitation ?? "none";

  return (
    <div className="flex items-center gap-6 px-4 py-2 text-xs">
      {/* Active Incidents */}
      <div className="flex items-center gap-1.5">
        <span
          className={`inline-block h-2 w-2 rounded-full ${
            activeIncidents > 0 ? "bg-red-500" : "bg-green-500"
          }`}
        />
        <span className="text-slate-400">Incidents</span>
        <span
          className={`font-semibold ${
            activeIncidents > 0 ? "text-red-400" : "text-green-400"
          }`}
        >
          {activeIncidents}
        </span>
      </div>

      {/* Average Speed */}
      <div className="flex items-center gap-1.5">
        <span className="text-slate-400">Avg Speed</span>
        <span className="font-semibold text-slate-200">
          {avgSpeed > 0 ? `${Math.round(avgSpeed)} mph` : "--"}
        </span>
      </div>

      {/* Transit On-Time */}
      <div className="flex items-center gap-1.5">
        <span className="text-slate-400">Transit On-Time</span>
        <span className="font-semibold text-slate-200">
          {transitTotal > 0 ? `${onTimeRatio}%` : "--"}
        </span>
      </div>

      {/* Weather */}
      <div className="flex items-center gap-1.5">
        <span className="text-slate-400">Weather</span>
        <span className="font-semibold text-slate-200">
          {temp !== null ? `${Math.round(temp)}\u00B0F` : "--"}
          {precip !== "none" && (
            <span className="ml-1 text-amber-400">{precip}</span>
          )}
        </span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Connection Status */}
      <div className="flex items-center gap-1.5">
        <span className="relative flex h-2 w-2">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              connected ? "bg-green-400" : "bg-red-400"
            }`}
          />
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              connected ? "bg-green-500" : "bg-red-500"
            }`}
          />
        </span>
        <span
          className={`font-medium ${
            connected ? "text-green-400" : "text-red-400"
          }`}
        >
          {connected ? "Live" : "Disconnected"}
        </span>
      </div>
    </div>
  );
}
