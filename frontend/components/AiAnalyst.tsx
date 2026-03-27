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

function priorityColor(priority: RecommendationAction["priority"]): string {
  switch (priority) {
    case "critical":
    case "high":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    case "medium":
      return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    case "low":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
  }
}

function formatActionType(action: string): string {
  return action.replace(/_/g, " ");
}

export default function AiAnalyst({
  recommendations,
  incidents,
  selectedIncident,
  onApply,
}: AiAnalystProps) {
  const filtered = selectedIncident
    ? recommendations.filter(
        (r) => r.incident_id === selectedIncident.id
      )
    : recommendations.slice(-3);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-3 py-2 shrink-0">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500" />
        </span>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          AI Analyst
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 space-y-2 px-3 pb-2">
        {filtered.map((rec) => (
          <div
            key={rec.id}
            className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-3 space-y-2"
          >
            <p className="text-sm text-slate-200 leading-snug">
              {rec.summary}
            </p>

            <div className="flex flex-wrap gap-1.5">
              {rec.actions.map((action, i) => (
                <span
                  key={i}
                  className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${priorityColor(action.priority)}`}
                >
                  {formatActionType(action.action)}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500">
                Confidence: {Math.round(rec.confidence * 100)}%
              </span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => onApply?.(rec)}
                  className="px-2.5 py-1 rounded text-[10px] font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 transition-colors"
                >
                  Apply
                </button>
                <button className="px-2.5 py-1 rounded text-[10px] font-medium bg-slate-700/50 text-slate-400 border border-slate-600/30 hover:bg-slate-700 transition-colors">
                  Skip
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-xs text-slate-500 py-4 text-center">
            {selectedIncident
              ? "No recommendations for this incident yet."
              : "Waiting for AI analysis..."}
          </p>
        )}
      </div>
    </div>
  );
}
