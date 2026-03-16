type HexagonBadgeProps = {
  level: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export function HexagonBadge({ level, size = 'md' }: HexagonBadgeProps) {
  const sizeMap: Record<string, string> = {
    xs: 'w-5 h-5 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-xl'
  };

  return (
    <div className={`relative flex items-center justify-center filter drop-shadow-[0_0_8px_rgba(108,99,255,0.6)] ${sizeMap[size]}`}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full text-game-panel fill-current stroke-game-primary stroke-2">
        <polygon points="50 1 95 25 95 75 50 99 5 75 5 25" />
      </svg>
      <span className="relative z-10 font-mono font-bold text-game-accent">
        {level}
      </span>
    </div>
  );
}
