"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useCityState } from "@/hooks/useCityState";
import LayerToggle from "@/components/LayerToggle";
import LiveFeed from "@/components/LiveFeed";
import AiAnalyst from "@/components/AiAnalyst";
import IncidentPanel from "@/components/IncidentPanel";
import PlanModal from "@/components/PlanModal";
import StatsBar from "@/components/StatsBar";
import type { IncidentEvent, RecommendationEvent } from "@/lib/types";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8001/ws";
const ANALYST_URL = process.env.NEXT_PUBLIC_ANALYST_URL || "http://localhost:8012";

export default function Dashboard() {
  const { state, feed, handleEvent } = useCityState();
  const { connected } = useWebSocket({ url: WS_URL, onMessage: handleEvent });
  const [selectedIncident, setSelectedIncident] = useState<IncidentEvent | null>(null);
  const [planIncident, setPlanIncident] = useState<IncidentEvent | null>(null);
  const [layers, setLayers] = useState({
    traffic: true,
    transit: true,
    incidents: true,
    weather: true,
  });

  const toggleLayer = useCallback((layer: string) => {
    setLayers((prev) => ({ ...prev, [layer]: !prev[layer as keyof typeof prev] }));
  }, []);

  const handleApply = useCallback((rec: RecommendationEvent) => {
    console.log("Applied recommendation:", rec.id);
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col bg-black relative">
      {/* ═══ TOP HUD BAR ═══ */}
      <header className="relative z-30 flex items-center justify-between px-4 py-1.5 border-b border-[var(--border-dim)] bg-[rgba(0,0,0,0.7)] backdrop-blur-md">
        {/* Left: Branding */}
        <div className="flex items-center gap-3">
          {/* Logo mark */}
          <div className="relative w-6 h-6 flex items-center justify-center">
            <div className="absolute inset-0 border border-[var(--cyan)] rotate-45 opacity-60" />
            <div className="absolute inset-1 border border-[var(--cyan)] rotate-45 opacity-30" />
            <span className="text-[8px] font-bold text-[var(--cyan)] text-glow z-10">U</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold tracking-[0.2em] text-[var(--text-bright)] font-[var(--font-display)]">
              URBANOPS
            </span>
            <span className="text-[8px] tracking-[0.15em] text-[var(--text-dim)]">
              CITY OPERATIONS CENTER
            </span>
          </div>
        </div>

        {/* Center: Layer Controls */}
        <LayerToggle layers={layers} onToggle={toggleLayer} />

        {/* Right: Location + Classification */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-mono font-semibold text-[var(--text-primary)] tracking-wider">
              CHICAGO, IL
            </span>
            <span className="text-[8px] text-[var(--text-dim)] tracking-wider">
              41.8781°N 87.6298°W
            </span>
          </div>
          <div className="px-2 py-0.5 border border-[var(--amber)]/30 bg-[var(--amber)]/5">
            <span className="text-[8px] font-bold tracking-wider text-[var(--amber)]">LIVE</span>
          </div>
        </div>
      </header>

      {/* ═══ MAIN AREA: Full-screen map + floating panels ═══ */}
      <div className="flex-1 relative overflow-hidden">
        {/* Map — full screen background */}
        <div className="absolute inset-0">
          <Map state={state} layers={layers} onIncidentClick={setSelectedIncident} />
        </div>

        {/* Vignette overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)",
          }}
        />

        {/* Grid overlay (subtle) */}
        <div
          className="absolute inset-0 pointer-events-none z-10 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(var(--cyan) 1px, transparent 1px), linear-gradient(90deg, var(--cyan) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* ─── Floating Panel: Event Stream (Top Left) ─── */}
        <div className="absolute top-3 left-3 z-20 w-72 max-h-[35%] panel-glass scanlines flex flex-col">
          <LiveFeed events={feed} />
        </div>

        {/* ─── Floating Panel: Incidents (Bottom Left) ─── */}
        <div className="absolute bottom-3 left-3 z-20 w-80 max-h-[45%] panel-glass scanlines flex flex-col">
          <IncidentPanel
            incidents={state.incidents}
            selectedIncident={selectedIncident}
            onSelect={setSelectedIncident}
            onPlan={setPlanIncident}
          />
        </div>

        {/* ─── Floating Panel: AI Analyst (Right) ─── */}
        <div className="absolute top-3 right-3 z-20 w-80 max-h-[55%] panel-glass scanlines flex flex-col">
          <AiAnalyst
            recommendations={state.recommendations}
            incidents={state.incidents}
            selectedIncident={selectedIncident}
            onApply={handleApply}
          />
        </div>

        {/* ─── Floating: Selected Incident Card (Bottom Center) ─── */}
        {selectedIncident && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 panel-glass p-3 max-w-md">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2 h-2 rounded-full ${
                    selectedIncident.severity === "critical"
                      ? "bg-[var(--red)] shadow-[0_0_8px_var(--red)]"
                      : selectedIncident.severity === "high"
                      ? "bg-[var(--red)]"
                      : "bg-[var(--amber)]"
                  }`} />
                  <span className="text-[9px] font-bold tracking-wider text-[var(--red)] uppercase">
                    {selectedIncident.severity} — {selectedIncident.category.replace("_", " ")}
                  </span>
                </div>
                <p className="text-[11px] text-[var(--text-bright)] leading-snug">
                  {selectedIncident.description}
                </p>
                {selectedIncident.affected_roads.length > 0 && (
                  <p className="text-[9px] text-[var(--text-dim)] mt-1 tracking-wider">
                    AFFECTED: {selectedIncident.affected_roads.join(", ")}
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                className="text-[var(--text-dim)] hover:text-[var(--text-primary)] text-xs shrink-0"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* ─── Connection overlay ─── */}
        {!connected && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4 panel-glass p-8">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 border border-[var(--cyan)] rounded-full opacity-30 animate-ping" />
                <div className="absolute inset-2 border border-[var(--cyan)] rounded-full opacity-50 animate-[sweep_2s_linear_infinite]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 bg-[var(--cyan)] rounded-full" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-[11px] font-mono font-semibold text-[var(--cyan)] tracking-wider text-glow">
                  ESTABLISHING CONNECTION
                </p>
                <p className="text-[9px] text-[var(--text-dim)] mt-1 tracking-wider">
                  SYNCING WITH OPERATIONS CENTER...
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ═══ BOTTOM HUD BAR ═══ */}
      <StatsBar state={state} connected={connected} />

      {/* ═══ PLAN MODAL ═══ */}
      {planIncident && (
        <PlanModal
          incident={planIncident}
          analystUrl={ANALYST_URL}
          onClose={() => setPlanIncident(null)}
          onExecute={(plan) => {
            console.log("Executing plan:", plan);
          }}
        />
      )}
    </div>
  );
}
