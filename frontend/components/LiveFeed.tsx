"use client";

import type { CityEvent } from "@/lib/types";

interface LiveFeedProps {
  events: CityEvent[];
}

function eventIcon(type: CityEvent["type"]): string {
  switch (type) {
    case "traffic":
      return "\uD83D\uDE97";
    case "transit":
      return "\uD83D\uDE8C";
    case "incident":
      return "\u26A0\uFE0F";
    case "weather":
      return "\uD83C\uDF26\uFE0F";
    case "recommendation":
      return "\uD83E\uDD16";
  }
}

function eventSummary(event: CityEvent): string {
  switch (event.type) {
    case "traffic": {
      const congested = event.segments.filter(
        (s) => s.congestion_level === "heavy" || s.congestion_level === "severe"
      ).length;
      return `${congested} congested road${congested !== 1 ? "s" : ""}`;
    }
    case "transit": {
      const delayed = event.vehicles.filter(
        (v) => v.status === "delayed" || v.status === "stopped"
      ).length;
      return `${delayed} vehicle${delayed !== 1 ? "s" : ""} delayed`;
    }
    case "incident":
      return event.description;
    case "weather": {
      const c = event.conditions;
      const parts: string[] = [`${Math.round(c.temperature_f)}\u00B0F`];
      if (c.precipitation !== "none") parts.push(c.precipitation);
      if (c.alert) parts.push(c.alert);
      return parts.join(" \u00B7 ");
    }
    case "recommendation":
      return event.summary.length > 80
        ? event.summary.slice(0, 77) + "..."
        : event.summary;
  }
}

function eventColor(event: CityEvent): string {
  switch (event.type) {
    case "traffic": {
      const hasSevere = event.segments.some(
        (s) => s.congestion_level === "severe"
      );
      const hasHeavy = event.segments.some(
        (s) => s.congestion_level === "heavy"
      );
      if (hasSevere) return "text-red-400";
      if (hasHeavy) return "text-amber-400";
      return "text-green-400";
    }
    case "transit": {
      const hasStopped = event.vehicles.some((v) => v.status === "stopped");
      const hasDelayed = event.vehicles.some((v) => v.status === "delayed");
      if (hasStopped) return "text-red-400";
      if (hasDelayed) return "text-amber-400";
      return "text-green-400";
    }
    case "incident":
      if (event.severity === "critical" || event.severity === "high")
        return "text-red-400";
      if (event.severity === "medium") return "text-amber-400";
      return "text-green-400";
    case "weather":
      if (event.conditions.alert) return "text-red-400";
      if (event.conditions.precipitation !== "none") return "text-amber-400";
      return "text-green-400";
    case "recommendation":
      return "text-blue-400";
  }
}

function formatTime(timestamp: string): string {
  const d = new Date(timestamp);
  return d.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function LiveFeed({ events }: LiveFeedProps) {
  return (
    <div className="flex flex-col h-full">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 px-3 py-2 shrink-0">
        Live Feed
      </h2>
      <div className="flex-1 overflow-y-auto min-h-0 space-y-0.5">
        {events.map((event, i) => (
          <div
            key={`${event.type}-${event.timestamp}-${i}`}
            className="flex items-start gap-2 px-3 py-2 hover:bg-slate-800/50 transition-colors"
          >
            <span className="text-base shrink-0 mt-0.5">
              {eventIcon(event.type)}
            </span>
            <div className="flex-1 min-w-0">
              <p className={`text-sm leading-snug truncate ${eventColor(event)}`}>
                {eventSummary(event)}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {formatTime(event.timestamp)}
              </p>
            </div>
          </div>
        ))}
        {events.length === 0 && (
          <p className="text-xs text-slate-500 px-3 py-4 text-center">
            Waiting for events...
          </p>
        )}
      </div>
    </div>
  );
}
