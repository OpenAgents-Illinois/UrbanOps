"use client";

import type { CityState } from "@/lib/types";

interface StatsBarProps {
  state: CityState;
  connected: boolean;
}

function Metric({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="hud-label">{label}</span>
      <span className={`text-[11px] font-mono font-semibold ${color || "text-[var(--text-bright)]"}`}>
        {value}
      </span>
    </div>
  );
}

function Separator() {
  return <div className="w-px h-3 bg-[var(--border-dim)]" />;
}

export default function StatsBar({ state, connected }: StatsBarProps) {
  const activeIncidents = state.incidents.filter((i) => i.status !== "resolved").length;

  const avgSpeed =
    state.traffic && state.traffic.segments.length > 0
      ? Math.round(
          state.traffic.segments.reduce((s, seg) => s + seg.speed_mph, 0) /
            state.traffic.segments.length
        )
      : 0;

  const transitTotal = state.transit?.vehicles.length ?? 0;
  const transitOnTime =
    state.transit?.vehicles.filter((v) => v.status === "on_time").length ?? 0;
  const onTimeRatio = transitTotal > 0 ? Math.round((transitOnTime / transitTotal) * 100) : 0;

  const temp = state.weather?.conditions.temperature_f ?? null;
  const precip = state.weather?.conditions.precipitation ?? "none";
  const alert = state.weather?.conditions.alert;

  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
    <div className="flex items-center gap-4 px-4 py-1.5 border-t border-[var(--border-dim)] bg-[rgba(0,0,0,0.6)] backdrop-blur-sm">
      {/* System time */}
      <span className="text-[11px] font-mono font-bold text-[var(--cyan)] text-glow tracking-wider">
        {timeStr}
      </span>

      <Separator />

      <Metric
        label="INCIDENTS"
        value={String(activeIncidents)}
        color={activeIncidents > 0 ? "text-[var(--red)]" : "text-[var(--green)]"}
      />

      <Separator />

      <Metric label="AVG SPD" value={avgSpeed > 0 ? `${avgSpeed} MPH` : "--"} />

      <Separator />

      <Metric
        label="TRANSIT"
        value={transitTotal > 0 ? `${onTimeRatio}% ON-TIME` : "--"}
        color={onTimeRatio < 70 ? "text-[var(--amber)]" : undefined}
      />

      <Separator />

      <Metric
        label="WX"
        value={temp !== null ? `${Math.round(temp)}°F ${precip !== "none" ? precip.toUpperCase() : "CLR"}` : "--"}
        color={alert ? "text-[var(--red)]" : precip !== "none" ? "text-[var(--amber)]" : undefined}
      />

      {alert && (
        <>
          <Separator />
          <span className="text-[9px] font-mono font-bold text-[var(--red)] tracking-wider animate-[data-flow_1.5s_ease-in-out_infinite]">
            {alert.toUpperCase()}
          </span>
        </>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Recommendations count */}
      <Metric label="AI RECS" value={String(state.recommendations.length)} color="text-[var(--cyan)]" />

      <Separator />

      {/* Connection status */}
      <div className="flex items-center gap-1.5">
        <span className="relative flex h-1.5 w-1.5">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 ${connected ? "bg-[var(--green)]" : "bg-[var(--red)]"}`} />
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${connected ? "bg-[var(--green)]" : "bg-[var(--red)]"}`} />
        </span>
        <span className={`text-[9px] font-mono font-bold tracking-wider ${connected ? "text-[var(--green)]" : "text-[var(--red)]"}`}>
          {connected ? "STREAM LIVE" : "OFFLINE"}
        </span>
      </div>
    </div>
  );
}
