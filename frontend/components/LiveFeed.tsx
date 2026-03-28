"use client";

import type { CityEvent } from "@/lib/types";

interface LiveFeedProps {
  events: CityEvent[];
}

function eventLabel(type: string): { tag: string; color: string } {
  switch (type) {
    case "traffic":
      return { tag: "TFC", color: "text-[var(--amber)]" };
    case "transit":
      return { tag: "TRN", color: "text-[var(--cyan)]" };
    case "incident":
      return { tag: "INC", color: "text-[var(--red)]" };
    case "weather":
      return { tag: "WX", color: "text-[var(--teal)]" };
    case "recommendation":
      return { tag: "AI", color: "text-[var(--cyan)]" };
    default:
      return { tag: "SYS", color: "text-[var(--text-dim)]" };
  }
}

function eventSummary(event: CityEvent): string {
  switch (event.type) {
    case "traffic": {
      const congested = event.segments.filter(
        (s) => s.congestion_level === "heavy" || s.congestion_level === "severe"
      ).length;
      return congested > 0
        ? `${congested} segment${congested > 1 ? "s" : ""} congested`
        : "Normal flow";
    }
    case "transit": {
      const delayed = event.vehicles.filter(
        (v) => v.status === "delayed" || v.status === "stopped"
      ).length;
      return delayed > 0
        ? `${delayed} vehicle${delayed > 1 ? "s" : ""} delayed`
        : "All on schedule";
    }
    case "incident":
      return event.description;
    case "weather": {
      const c = event.conditions;
      return `${Math.round(c.temperature_f)}°F ${c.precipitation !== "none" ? c.precipitation : "clear"}${c.alert ? " // " + c.alert : ""}`;
    }
    case "recommendation":
      return event.summary.slice(0, 70) + (event.summary.length > 70 ? "..." : "");
    default:
      return "System event";
  }
}

function severityDot(event: CityEvent): string {
  if (event.type === "incident") {
    if ((event as any).severity === "critical") return "bg-[var(--red)] shadow-[0_0_6px_var(--red)]";
    if ((event as any).severity === "high") return "bg-[var(--red)]";
    if ((event as any).severity === "medium") return "bg-[var(--amber)]";
    return "bg-[var(--text-dim)]";
  }
  return "";
}

function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function LiveFeed({ events }: LiveFeedProps) {
  return (
    <div className="flex flex-col h-full relative corner-brackets">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border-dim)]">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-[var(--cyan)] rounded-full animate-[data-flow_2s_ease-in-out_infinite]" />
          <span className="hud-label text-[var(--cyan-muted)]">Event Stream</span>
        </div>
        <span className="hud-label">{events.length} EVT</span>
      </div>

      {/* Events */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {events.map((event, i) => {
          const { tag, color } = eventLabel(event.type);
          const dot = severityDot(event);
          return (
            <div
              key={`${event.type}-${event.timestamp}-${i}`}
              className="flex items-start gap-2 px-3 py-1.5 border-b border-[var(--border-dim)] hover:bg-white/[0.02] transition-colors group"
            >
              <span className="text-[9px] text-[var(--text-dim)] font-mono mt-0.5 w-14 shrink-0">
                {formatTime(event.timestamp)}
              </span>
              <span className={`text-[9px] font-bold font-mono tracking-wider w-6 shrink-0 mt-0.5 ${color}`}>
                {tag}
              </span>
              {dot && (
                <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${dot}`} />
              )}
              <span className="text-[11px] text-[var(--text-primary)] leading-tight opacity-70 group-hover:opacity-100 transition-opacity">
                {eventSummary(event)}
              </span>
            </div>
          );
        })}
        {events.length === 0 && (
          <div className="flex items-center justify-center py-8">
            <span className="hud-label animate-[data-flow_2s_ease-in-out_infinite]">
              AWAITING DATA STREAM...
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
