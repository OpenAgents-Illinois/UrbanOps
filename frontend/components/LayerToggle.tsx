"use client";

const LAYERS = [
  { key: "traffic", label: "TFC", long: "TRAFFIC" },
  { key: "transit", label: "TRN", long: "TRANSIT" },
  { key: "incidents", label: "INC", long: "INCIDENTS" },
  { key: "weather", label: "WX", long: "WEATHER" },
] as const;

interface LayerToggleProps {
  layers: Record<string, boolean>;
  onToggle: (layer: string) => void;
}

export default function LayerToggle({ layers, onToggle }: LayerToggleProps) {
  return (
    <div className="flex items-center gap-1">
      <span className="hud-label mr-2 hidden sm:block">LAYERS</span>
      {LAYERS.map(({ key, label, long }) => {
        const active = layers[key] ?? false;
        return (
          <button
            key={key}
            onClick={() => onToggle(key)}
            className="relative group"
          >
            <div
              className={`
                px-2.5 py-1 text-[10px] font-mono font-medium tracking-wider
                border transition-all duration-300 uppercase
                ${active
                  ? "bg-[var(--cyan-dim)] border-[var(--border-glow)] text-[var(--cyan)] shadow-[0_0_8px_rgba(0,200,255,0.15)]"
                  : "bg-transparent border-[var(--border-dim)] text-[var(--text-dim)] hover:border-[var(--border-glow)] hover:text-[var(--text-primary)]"
                }
              `}
            >
              <span className="sm:hidden">{label}</span>
              <span className="hidden sm:inline">{long}</span>
            </div>
            {active && (
              <div className="absolute -bottom-px left-1/2 -translate-x-1/2 w-3/4 h-px bg-[var(--cyan)] shadow-[0_0_6px_var(--cyan)]" />
            )}
          </button>
        );
      })}
    </div>
  );
}
