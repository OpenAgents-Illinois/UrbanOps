"use client";

import type { IncidentEvent } from "@/lib/types";

interface IncidentPanelProps {
  incidents: IncidentEvent[];
  selectedIncident: IncidentEvent | null;
  onSelect: (incident: IncidentEvent) => void;
  onPlan?: (incident: IncidentEvent) => void;
}

const SEVERITY_CONFIG: Record<string, { color: string; glow: string; label: string }> = {
  critical: { color: "text-[var(--red)]", glow: "bg-[var(--red)] shadow-[0_0_6px_var(--red)]", label: "CRIT" },
  high: { color: "text-[var(--red)]", glow: "bg-[var(--red)]", label: "HIGH" },
  medium: { color: "text-[var(--amber)]", glow: "bg-[var(--amber)]", label: "MED" },
  low: { color: "text-[var(--text-dim)]", glow: "bg-[var(--text-dim)]", label: "LOW" },
};

const CATEGORY_ICONS: Record<string, string> = {
  accident: "ACCD",
  road_closure: "CLSD",
  fire: "FIRE",
  police: "PLCE",
  construction: "CNST",
};

function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function IncidentPanel({ incidents, selectedIncident, onSelect, onPlan }: IncidentPanelProps) {
  // Sort: critical first, then high, then medium, then low
  const severityOrder = ["critical", "high", "medium", "low"];
  const sorted = [...incidents].sort(
    (a, b) => severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity)
  );

  const criticalCount = incidents.filter((i) => i.severity === "critical").length;
  const highCount = incidents.filter((i) => i.severity === "high").length;

  return (
    <div className="flex flex-col h-full relative corner-brackets">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border-dim)]">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${criticalCount > 0 ? "bg-[var(--red)] shadow-[0_0_6px_var(--red)] animate-[data-flow_1s_ease-in-out_infinite]" : "bg-[var(--amber)]"}`} />
          <span className="hud-label text-[var(--cyan-muted)]">Active Incidents</span>
        </div>
        <div className="flex items-center gap-2">
          {criticalCount > 0 && (
            <span className="text-[8px] font-bold tracking-wider text-[var(--red)] animate-[data-flow_1.5s_ease-in-out_infinite]">
              {criticalCount} CRIT
            </span>
          )}
          {highCount > 0 && (
            <span className="text-[8px] font-bold tracking-wider text-[var(--red)]">
              {highCount} HIGH
            </span>
          )}
          <span className="hud-label">{incidents.length} TOTAL</span>
        </div>
      </div>

      {/* Incident List */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {sorted.map((incident) => {
          const sev = SEVERITY_CONFIG[incident.severity] || SEVERITY_CONFIG.low;
          const catTag = CATEGORY_ICONS[incident.category] || "EVNT";
          const isSelected = selectedIncident?.id === incident.id;

          return (
            <button
              key={incident.id}
              onClick={() => onSelect(incident)}
              className={`w-full text-left flex items-start gap-2 px-3 py-2 border-b border-[var(--border-dim)] transition-all group
                ${isSelected
                  ? "bg-[var(--cyan-dim)] border-l-2 border-l-[var(--cyan)]"
                  : "hover:bg-white/[0.02] border-l-2 border-l-transparent"
                }`}
            >
              {/* Severity dot */}
              <span className={`w-2 h-2 rounded-full mt-1 shrink-0 ${sev.glow}`} />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className={`text-[8px] font-bold tracking-wider ${sev.color}`}>
                    {sev.label}
                  </span>
                  <span className="text-[8px] font-bold tracking-wider text-[var(--text-dim)]">
                    {catTag}
                  </span>
                  <span className="text-[8px] text-[var(--text-dim)] ml-auto">
                    {formatTime(incident.timestamp)}
                  </span>
                </div>
                <p className="text-[10px] text-[var(--text-primary)] leading-snug truncate opacity-80 group-hover:opacity-100">
                  {incident.description}
                </p>
                {incident.affected_roads.length > 0 && (
                  <p className="text-[8px] text-[var(--text-dim)] tracking-wider mt-0.5 truncate">
                    {incident.affected_roads.join(" / ")}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col items-end gap-1 shrink-0 mt-0.5">
                <span className={`text-[7px] font-bold tracking-wider px-1 py-0.5 border
                  ${incident.status === "active"
                    ? "border-[var(--amber)]/30 text-[var(--amber)]"
                    : incident.status === "responding"
                    ? "border-[var(--cyan)]/30 text-[var(--cyan)]"
                    : "border-[var(--green)]/30 text-[var(--green)]"
                  }`}
                >
                  {incident.status.toUpperCase()}
                </span>
                <span
                  role="button"
                  onClick={(e) => { e.stopPropagation(); onPlan?.(incident); }}
                  className="text-[7px] font-bold tracking-wider px-1.5 py-0.5 border border-[var(--cyan)]/40 text-[var(--cyan)] hover:bg-[var(--cyan-dim)] hover:shadow-[0_0_8px_rgba(0,200,255,0.15)] cursor-pointer transition-all"
                >
                  PLAN
                </span>
              </div>
            </button>
          );
        })}
        {incidents.length === 0 && (
          <div className="flex items-center justify-center py-8">
            <span className="hud-label text-[var(--green)]">NO ACTIVE INCIDENTS</span>
          </div>
        )}
      </div>
    </div>
  );
}
