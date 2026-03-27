"use client";

const LAYERS = [
  { key: "traffic", label: "Traffic", icon: "\uD83D\uDE97" },
  { key: "transit", label: "Transit", icon: "\uD83D\uDE8C" },
  { key: "incidents", label: "Incidents", icon: "\u26A0\uFE0F" },
  { key: "weather", label: "Weather", icon: "\uD83C\uDF26\uFE0F" },
] as const;

interface LayerToggleProps {
  layers: Record<string, boolean>;
  onToggle: (layer: string) => void;
}

export default function LayerToggle({ layers, onToggle }: LayerToggleProps) {
  return (
    <div className="flex gap-2">
      {LAYERS.map(({ key, label, icon }) => {
        const active = layers[key] ?? false;
        return (
          <button
            key={key}
            onClick={() => onToggle(key)}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
              transition-all duration-200 border
              ${
                active
                  ? "bg-blue-500/20 border-blue-500/50 text-blue-400"
                  : "bg-slate-800/50 border-slate-700/50 text-slate-400 hover:border-slate-600"
              }
            `}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
