"use client";

import type {
  RecommendationEvent,
  RecommendationAction,
  IncidentEvent,
} from "@/lib/types";

interface AiAnalystProps {
  recommendations: RecommendationEvent[];
  incidents: IncidentEvent[];
  selectedIncident: IncidentEvent | null;
  onApply?: (rec: RecommendationEvent) => void;
}

function priorityBadge(priority: RecommendationAction["priority"]): string {
  switch (priority) {
    case "critical":
      return "border-[var(--red)] text-[var(--red)] bg-[rgba(255,59,79,0.08)]";
    case "high":
      return "border-[var(--red)] text-[var(--red)] bg-[rgba(255,59,79,0.05)]";
    case "medium":
      return "border-[var(--amber)] text-[var(--amber)] bg-[rgba(255,170,0,0.05)]";
    case "low":
      return "border-[var(--cyan)] text-[var(--cyan)] bg-[rgba(0,200,255,0.05)]";
  }
}

export default function AiAnalyst({
  recommendations,
  selectedIncident,
  onApply,
}: AiAnalystProps) {
  const filtered = selectedIncident
    ? recommendations.filter((r) => r.incident_id === selectedIncident.id)
    : recommendations.slice(-3);

  return (
    <div className="flex flex-col h-full relative corner-brackets">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border-dim)]">
        <div className="flex items-center gap-2">
          <div className="relative w-2 h-2">
            <span className="absolute inset-0 rounded-full bg-[var(--cyan)] animate-ping opacity-40" />
            <span className="absolute inset-0 rounded-full bg-[var(--cyan)]" />
          </div>
          <span className="hud-label text-[var(--cyan-muted)]">AI Analysis Engine</span>
        </div>
        <span className="hud-label">GPT-4o</span>
      </div>

      {/* Recommendations */}
      <div className="flex-1 overflow-y-auto min-h-0 p-3 space-y-2">
        {filtered.map((rec) => (
          <div
            key={rec.id}
            className="border border-[var(--border-dim)] bg-white/[0.01] p-3 space-y-2.5 hover:border-[var(--border-glow)] transition-colors"
          >
            {/* Summary */}
            <p className="text-[11px] text-[var(--text-bright)] leading-relaxed font-[var(--font-display)]">
              {rec.summary}
            </p>

            {/* Actions */}
            <div className="space-y-1">
              {rec.actions.map((action, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className={`shrink-0 mt-0.5 px-1.5 py-0.5 text-[8px] font-bold tracking-wider uppercase border ${priorityBadge(action.priority)}`}>
                    {action.priority}
                  </span>
                  <span className="text-[10px] text-[var(--text-primary)] leading-snug opacity-80">
                    <span className="text-[var(--cyan-muted)] uppercase font-semibold">
                      {action.action.replace(/_/g, " ")}
                    </span>
                    {" — "}
                    {action.description}
                  </span>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-1 border-t border-[var(--border-dim)]">
              <div className="flex items-center gap-3">
                <span className="hud-label">
                  CONF {Math.round(rec.confidence * 100)}%
                </span>
                <div className="w-16 h-1 bg-[var(--border-dim)] overflow-hidden">
                  <div
                    className="h-full bg-[var(--cyan)] transition-all"
                    style={{ width: `${rec.confidence * 100}%` }}
                  />
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => onApply?.(rec)}
                  className="px-2.5 py-0.5 text-[9px] font-bold tracking-wider uppercase
                    border border-[var(--cyan)] text-[var(--cyan)]
                    hover:bg-[var(--cyan-dim)] hover:shadow-[0_0_10px_rgba(0,200,255,0.2)]
                    transition-all"
                >
                  EXECUTE
                </button>
                <button
                  className="px-2.5 py-0.5 text-[9px] font-bold tracking-wider uppercase
                    border border-[var(--border-dim)] text-[var(--text-dim)]
                    hover:border-[var(--border-glow)] hover:text-[var(--text-primary)]
                    transition-all"
                >
                  DISMISS
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <div className="w-8 h-8 border border-[var(--border-dim)] rounded-full flex items-center justify-center">
              <div className="w-4 h-0.5 bg-[var(--border-glow)] animate-[sweep_3s_linear_infinite] origin-left" />
            </div>
            <span className="hud-label animate-[data-flow_3s_ease-in-out_infinite]">
              {selectedIncident ? "ANALYZING INCIDENT..." : "MONITORING THREATS..."}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
