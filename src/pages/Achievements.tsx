import { useState, useEffect } from 'react';
import { GameCard } from '../components/ui/GameCard';
import { ViewportAnim, SlideAnim } from '../components/ui/Animations';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { supabase, type Achievement } from '../lib/supabase';

export function Achievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<{title: string, rarity: string} | null>(null);

  useEffect(() => {
    supabase.from('achievements').select('*').order('rarity').then(({ data }) => {
      setAchievements(data ?? []);
      setLoading(false);
    });
  }, []);

  const triggerUnlock = (ach: Achievement) => {
    if (ach.is_unlocked) return;

    const canUseConfetti = (navigator.hardwareConcurrency || 4) >= 4;

    if (ach.rarity === 'legend' && canUseConfetti) {
      const colors = ['#f59e0b', '#fcd34d', '#fef3c7'];
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors });
    }

    setToastMessage({ title: ach.title, rarity: ach.rarity });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const getRarityStyles = (rarity: string, unlocked: boolean) => {
    if (!unlocked) return 'border-[var(--border)] border-dashed bg-[var(--surface2)] text-[var(--text-muted)] opacity-60';

    switch (rarity) {
      case 'bronze': return 'border-[#b45309] shadow-[0_0_10px_rgba(180,83,9,0.15)] bg-[var(--surface)] text-[#92400e]';
      case 'silver': return 'border-[#64748b] shadow-[0_0_15px_rgba(100,116,139,0.2)] bg-[var(--surface)] text-[#475569]';
      case 'gold': return 'border-[#d97706] shadow-[0_0_20px_rgba(217,119,6,0.3)] bg-[var(--surface)] text-[#b45309]';
      case 'legend': return 'border-[#d97706] shadow-[0_0_30px_rgba(217,119,6,0.4)] bg-[var(--surface)] text-[#b45309]';
      default: return 'border-[var(--border)] bg-[var(--surface)]';
    }
  };

  const getRarityLabel = (rarity: string) => {
    switch (rarity) {
      case 'bronze': return '青铜 (Bronze)';
      case 'silver': return '白银 (Silver)';
      case 'gold': return '黄金 (Gold)';
      case 'legend': return '传说 (Legendary)';
      default: return rarity;
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto text-center py-20">
        <p className="text-[var(--text-dim)] font-mono animate-pulse">加载成就数据中...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <SlideAnim direction="up" delay={100}>
        <header className="text-center mb-12">
          <h1 className="text-3xl font-serif text-game-gold font-bold mb-4 drop-shadow-[0_0_10px_var(--gold)]">
            成就荣誉墙 (Achievement Wall)
          </h1>
          <p className="text-game-textDim">记录你在代码世界的每一次闪耀时刻。</p>
        </header>
      </SlideAnim>

      {achievements.length === 0 ? (
        <GameCard><p className="text-center text-[var(--text-dim)] py-12">暂无成就，在后台创建你的第一个成就吧！</p></GameCard>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {achievements.map((ach, index) => (
            <ViewportAnim key={ach.id} delay={index * 100} className="h-full [perspective:600px]">
              <div onClick={() => triggerUnlock(ach)} className="cursor-pointer h-full">
                <GameCard
                  hoverable={true}
                  className={`flex flex-col items-center text-center p-6 ${getRarityStyles(ach.rarity, ach.is_unlocked)} transition-all duration-300 h-full group hover:[transform:rotateY(3deg)_rotateX(-2deg)]`}
                >
                  {ach.rarity === 'legend' && ach.is_unlocked && (
                    <div className="absolute inset-0 bg-gradient-to-r from-[var(--gold)]/0 via-[var(--gold)]/20 to-[var(--gold)]/0 opacity-0 group-hover:opacity-100 group-hover:animate-[shimmer_3s_linear_infinite] transition-opacity pointer-events-none" />
                  )}
                  <div className={`text-5xl mb-4 filter ${ach.is_unlocked ? 'drop-shadow-lg group-hover:scale-110 transition-transform duration-300' : ''}`}>
                    {ach.is_unlocked ? ach.icon : '🔒'}
                  </div>

                  <h3 className={`font-bold text-lg mb-2 relative z-10 ${!ach.is_unlocked && 'text-game-textMuted tracking-[0.2em]'}`}>
                    {ach.is_unlocked ? ach.title : '???'}
                  </h3>

                  <span className={`text-xs px-2 py-0.5 rounded border mb-4 font-mono relative z-10
                    ${ach.is_unlocked ? 'border-current opacity-80' : 'border-game-border text-game-textMuted'}
                  `}>
                    {ach.is_unlocked ? getRarityLabel(ach.rarity) : '未解锁'}
                  </span>

                  <p className={`text-sm flex-grow relative z-10 ${ach.is_unlocked ? 'text-game-textDim' : 'text-game-textMuted'}`}>
                    {ach.is_unlocked ? ach.description : '达成未知条件后解锁 (点击模拟解锁)'}
                  </p>

                  {ach.is_unlocked && ach.unlocked_at && (
                    <div className="text-xs mt-4 pt-4 border-t border-current/20 w-full font-mono opacity-60 relative z-10">
                      Unlock Date: {new Date(ach.unlocked_at).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit' })}
                    </div>
                  )}
                </GameCard>
              </div>
            </ViewportAnim>
          ))}
        </div>
      )}

      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`fixed bottom-8 right-8 z-50 p-4 border-l-4 rounded-md shadow-card bg-game-panel backdrop-blur-md flex items-center gap-4
              ${toastMessage.rarity === 'legend' ? 'border-game-gold shadow-[0_0_20px_var(--gold)]/30' : 'border-game-primary'}
            `}
          >
            <div className="text-2xl">解锁!</div>
            <div>
              <div className="font-bold text-game-text">{toastMessage.title}</div>
              <div className="text-xs text-game-textDim">成就已记录入世界库。</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
