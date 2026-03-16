import type { ReactNode } from 'react';

type GameCardProps = {
  children: ReactNode;
  className?: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  onClick?: () => void;
  hoverable?: boolean;
}

const rarityColors = {
  common: 'border-[var(--border)] hover:border-[var(--border-bright)] hover:shadow-card-hover',
  rare: 'border-[var(--rare)]/30 hover:border-[var(--rare)] hover:shadow-[0_0_15px_rgba(76,175,80,0.3)]',
  epic: 'border-[var(--epic)]/40 hover:border-[var(--epic)] hover:shadow-[0_0_15px_rgba(156,39,176,0.4)]',
  legendary: 'border-[var(--legendary)]/50 hover:border-[var(--legendary)] hover:shadow-[0_0_20px_rgba(255,152,0,0.6)]',
}

export function GameCard({ children, className = '', rarity = 'common', onClick, hoverable = true }: GameCardProps) {
  const baseStyle = "bg-[var(--surface)] text-[var(--text)] rounded-lg shadow-card backdrop-blur-sm transition-all duration-300 border relative overflow-hidden";
  const hoverStyle = hoverable ? rarityColors[rarity] : 'border-[var(--border)]';
  
  return (
    <div 
      className={`${baseStyle} ${hoverStyle} ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {/* Rarity ambient glow */}
      {rarity !== 'common' && (
        <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none
          ${rarity === 'rare' ? 'bg-[var(--rare)]' : ''}
          ${rarity === 'epic' ? 'bg-[var(--epic)]' : ''}
          ${rarity === 'legendary' ? 'bg-[var(--legendary)]' : ''}
        `} />
      )}
      <div className="relative z-10 w-full h-full p-5">
        {children}
      </div>
    </div>
  );
}
