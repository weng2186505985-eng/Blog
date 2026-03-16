import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EMOJI_CATEGORIES = [
  {
    id: 'battle',
    name: '战斗冒险',
    icon: '⚔️',
    emojis: ['⚔️', '🗡️', '🛡️', '🏹', '🪃', '🔱', '⚡', '💥', '🔥', '🌪️', '❄️', '☄️', '🧨', '💣', '🪖', '🗺️', '🧭', '🏴‍☠️', '⚓', '🌊', '🌋', '🏔️', '🗻', '🧗'],
  },
  {
    id: 'glory',
    name: '荣耀成就',
    icon: '🏆',
    emojis: ['🏆', '🥇', '🥈', '🥉', '👑', '💎', '🌟', '⭐', '🌠', '✨', '💫', '🎖️', '🎗️', '🏅', '🎀', '🎊', '🎉', '🥳', '👏', '🙌', '💯', '🔝', '🆙', '🎯'],
  },
  {
    id: 'tech',
    name: '技术代码',
    icon: '💻',
    emojis: ['💻', '🖥️', '⌨️', '🖱️', '🔧', '🔨', '⚙️', '🛠️', '🔩', '💡', '🔋', '📡', '🖨️', '💾', '💿', '📀', '🖲️', '📱', '📲', '🔌', '🧲', '🔦', '🕹️', '👾'],
  },
  {
    id: 'study',
    name: '学习成长',
    icon: '📚',
    emojis: ['📚', '📖', '📝', '✏️', '🎓', '🏫', '🔬', '🔭', '🧪', '🧬', '📊', '📈', '📉', '📋', '📌', '📍', '🗂️', '🗃️', '📦', '🧩', '💭', '💬', '🗣️', '🧠'],
  },
  {
    id: 'explore',
    name: '探索旅行',
    icon: '🌍',
    emojis: ['🌍', '🌎', '🌏', '🗺️', '🧭', '⛵', '🚀', '✈️', '🛸', '🏝️', '🏖️', '🏜️', '🏕️', '⛺', '🌅', '🌄', '🌇', '🌆', '🌃', '🌉', '🗼', '🏰', '🏯', '⛩️'],
  },
  {
    id: 'game',
    name: '游戏娱乐',
    icon: '🎮',
    emojis: ['🎮', '🕹️', '🎲', '🃏', '🀄', '🎰', '🎳', '🎯', '🎪', '🎭', '🎨', '🖼️', '🎬', '🎥', '📽️', '🎞️', '📺', '🎵', '🎶', '🎸', '🎹', '🎺', '🥁', '🎻'],
  },
  {
    id: 'nature',
    name: '自然生命',
    icon: '🌱',
    emojis: ['🌱', '🌿', '🍀', '🌸', '🌺', '🌻', '🌹', '🌷', '🍁', '🍂', '🌙', '☀️', '🌈', '⭐', '🌤️', '⛅', '🌦️', '🌧️', '⛈️', '🌩️', '❄️', '🌬️', '🦋', '🐉'],
  },
  {
    id: 'animal',
    name: '动物生灵',
    icon: '🦁',
    emojis: ['🦁', '🐯', '🐻', '🦊', '🐺', '🦅', '🦉', '🐬', '🦈', '🐙', '🦑', '🦋', '🐲', '🦄', '🐴', '🦌', '🐘', '🦏', '🦒', '🐆', '🦓', '🦜', '🦩', '🐧'],
  },
  {
    id: 'ability',
    name: '能力特质',
    icon: '💪',
    emojis: ['💪', '🧠', '👁️', '👂', '🫀', '🦾', '🤝', '✊', '👊', '🙌', '🤟', '💪', '🏃', '🧘', '🤸', '🏋️', '🤺', '🧙', '🧝', '🧛', '🧜', '🧚', '🦸', '🦹'],
  },
  {
    id: 'heart',
    name: '情感关系',
    icon: '❤️',
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💗', '💓', '💞', '💕', '💝', '💘', '💌', '🫂', '🤗', '😊', '😄', '🥹', '🫶', '🙏', '💋', '😎'],
  },
  {
    id: 'food',
    name: '生活美食',
    icon: '🍕',
    emojis: ['🍕', '🍜', '🍣', '🍦', '🧁', '🍰', '🎂', '☕', '🧋', '🍵', '🥂', '🍾', '🏠', '🏡', '🛋️', '🛁', '🪴', '🕯️', '🧸', '🪆', '🎁', '🛍️', '💝', '🧧'],
  },
  {
    id: 'special',
    name: '特殊彩蛋',
    icon: '🌐',
    emojis: ['🌐', '🔮', '🪄', '🧿', '☯️', '✡️', '☮️', '🗝️', '🔑', '🪬', '🧲', '💊', '🧬', '⚗️', '🔭', '🌀', '🎴', '🀄', '🧧', '🎋', '🎍', '🎑', '🧨', '🪔'],
  },
];

interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
}

export function EmojiPicker({ value, onChange }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const allEmojis = EMOJI_CATEGORIES.flatMap(c => c.emojis);
  
  const filteredEmojis = activeCategory === 'all' 
    ? allEmojis 
    : EMOJI_CATEGORIES.find(c => c.id === activeCategory)?.emojis || [];

  const searchedEmojis = searchTerm 
    ? allEmojis.filter(e => e.includes(searchTerm))
    : filteredEmojis;

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 rounded-lg bg-[var(--surface2)] border border-[var(--border)] text-left flex items-center justify-between hover:border-[var(--primary)] transition-all outline-none"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl leading-none">{value || '🏆'}</span>
          <span className="text-sm font-medium text-[var(--text-dim)]">{isOpen ? '请挑选一个灵魂徽章...' : '点击图标开启传送门'}</span>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full left-0 mt-2 z-50 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col w-[480px]"
          >
            {/* Search Bar */}
            <div className="p-4 border-b border-[var(--border)] flex items-center gap-3 bg-[var(--surface2)]">
              <Search size={18} className="text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="搜索你的专属符号..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent text-sm text-[var(--text)] outline-none border-none focus:ring-0"
                autoFocus
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')}><X size={16} className="text-[var(--text-muted)] hover:text-red-500" /></button>
              )}
            </div>

            {/* Categories Tabs - Wrap Layout */}
            <div className="px-3 py-2 border-b border-[var(--border)] flex flex-wrap gap-1.5 bg-[var(--surface)]">
              <button
                onClick={() => setActiveCategory('all')}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeCategory === 'all' 
                    ? 'bg-[var(--primary)] text-white shadow-glow-primary' 
                    : 'text-[var(--text-dim)] hover:bg-[var(--surface2)]'
                }`}
              >
                全部
              </button>
              {EMOJI_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                    activeCategory === cat.id 
                      ? 'bg-[var(--primary)] text-white shadow-glow-primary' 
                      : 'text-[var(--text-dim)] hover:bg-[var(--surface2)]'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Grid - 8-10 columns */}
            <div className="p-4 overflow-y-auto grid grid-cols-8 md:grid-cols-9 gap-2 h-[300px] content-start scrollbar-thin">
              {searchedEmojis.length > 0 ? (
                searchedEmojis.map((emoji, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onChange(emoji);
                      setIsOpen(false);
                    }}
                    className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all duration-200 group relative ${
                      value === emoji 
                        ? 'bg-[var(--primary)] text-white shadow-glow-primary scale-105 z-10' 
                        : 'hover:bg-[var(--surface3)] hover:scale-110'
                    }`}
                  >
                    <span className="text-[24px] select-none transform group-active:scale-95">{emoji}</span>
                    {value === emoji && (
                      <motion.div 
                        layoutId="selected-bg"
                        className="absolute inset-0 border-2 border-white/30 rounded-xl"
                      />
                    )}
                  </button>
                ))
              ) : (
                <div className="col-span-full text-center py-16">
                  <span className="text-4xl block mb-4">🔍</span>
                  <p className="text-sm text-[var(--text-muted)]">未找到匹配的图标词条</p>
                </div>
              )}
            </div>

            {/* Selected Indicator Footer */}
            <div className="px-4 py-2 border-t border-[var(--border)] bg-[var(--surface2)] flex items-center justify-between">
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest leading-none">
                {activeCategory === 'all' ? 'FULL REPOSITORY' : EMOJI_CATEGORIES.find(c => c.id === activeCategory)?.name}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[var(--text-muted)]">当前选中:</span>
                <span className="text-lg">{value}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
