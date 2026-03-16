type ExpBarProps = {
  current: number;
  max: number;
  label?: string;
  className?: string;
}

export function ExpBar({ current, max, label, className = '' }: ExpBarProps) {
  const percentage = Math.min(100, Math.max(0, (current / max) * 100));

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex justify-between text-xs mb-1 font-mono text-[var(--text-dim)]">
          <span>{label}</span>
          <span>{current} / {max}</span>
        </div>
      )}
      <div className="h-2 w-full bg-[var(--surface3)] rounded-full overflow-hidden border border-[var(--border)] relative">
        <div 
          className="h-full bg-gradient-to-r from-game-primary to-game-accent exp-bar-fill rounded-full"
          style={{ width: `${percentage}%` }}
        />
        {/* Glow effect internally */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
