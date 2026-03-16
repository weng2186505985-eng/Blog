import { useState, useEffect } from 'react';
import { GameCard } from '../components/ui/GameCard';
import { Shield, Scroll, CheckCircle2, CircleDashed, XCircle, Star } from 'lucide-react';
import { ViewportAnim, SlideAnim } from '../components/ui/Animations';
import { supabase, type Quest } from '../lib/supabase';

const StatusIcon = ({ status }: { status: string }) => {
  if (status === 'completed') return <CheckCircle2 className="text-game-rarity-rare" size={20} />;
  if (status === 'in_progress') return <CircleDashed className="text-game-primary animate-spin-slow" size={20} />;
  return <XCircle className="text-game-rarity-common" size={20} />;
};

export function Quests() {
  const [mainQuests, setMainQuests] = useState<Quest[]>([]);
  const [sideQuests, setSideQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQuests() {
      const { data } = await supabase
        .from('quests')
        .select('*')
        .order('start_date', { ascending: true });

      const quests = data || [];
      setMainQuests(quests.filter(q => q.type === 'main'));
      setSideQuests(quests.filter(q => q.type === 'side'));
      setLoading(false);
    }
    fetchQuests();
  }, []);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit' });
    } catch { return dateStr; }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto text-center py-20">
        <p className="text-[var(--text-dim)] font-mono animate-pulse">加载任务数据中...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <SlideAnim direction="up" delay={100}>
        <header className="text-center mb-12">
          <h1 className="text-3xl font-serif text-game-accent font-bold mb-4 drop-shadow-[0_0_10px_var(--accent-glow)]">
            冒险者任务中心 (Quest Board)
          </h1>
          <p className="text-game-textDim">追踪你的主线进程，接取丰厚的支线悬赏，赚取经验值提升冒险者等级。</p>
        </header>
      </SlideAnim>

      {/* Main Quests Timeline */}
      <section>
        <SlideAnim direction="right" delay={200}>
          <h2 className="text-2xl font-serif font-bold text-game-primary mb-8 flex items-center gap-2">
            <Shield className="text-game-primary" />
            主线战役 (Main Campaign)
          </h2>
        </SlideAnim>

        {mainQuests.length === 0 ? (
          <GameCard><p className="text-center text-[var(--text-dim)] py-8">暂无主线任务</p></GameCard>
        ) : (
          <div className="relative border-l border-game-primary/30 ml-4 md:ml-8 space-y-8 pb-4">
            {mainQuests.map((quest, index) => (
              <ViewportAnim key={quest.id} delay={300 + index * 150} className="relative pl-8 md:pl-12">
                <div className={`absolute -left-3 top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center bg-game-bg z-10
                  ${quest.status === 'completed' ? 'border-game-rarity-rare shadow-[0_0_10px_rgba(76,175,80,0.3)]' :
                    quest.status === 'in_progress' ? 'border-game-primary shadow-glow-primary' : 'border-game-borderBright'}
                `}>
                  <div className={`w-2 h-2 rounded-full ${quest.status === 'completed' ? 'bg-game-rarity-rare' : quest.status === 'in_progress' ? 'bg-game-primary animate-pulse' : 'bg-game-borderBright'}`} />
                </div>

                <GameCard
                  hoverable={false}
                  className={`transition-all duration-500 border-l-4 ${
                    quest.status === 'completed'
                      ? 'border-l-[var(--border)] opacity-70 hover:opacity-100'
                      : quest.status === 'in_progress'
                        ? 'border-l-[var(--primary)] shadow-[var(--shadow-hover)]'
                        : 'border-l-transparent'
                  }`}
                >
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-2">
                    <h3 className={`text-xl font-bold ${quest.status === 'completed' ? 'text-game-textDim line-through' : 'text-game-text'} flex items-center gap-2`}>
                      {quest.title}
                    </h3>
                    <div className="flex gap-4 text-sm font-mono">
                      <span className="text-game-primary font-bold">+{quest.reward_exp} EXP</span>
                      <span className="text-game-textMuted">{formatDate(quest.start_date)}</span>
                    </div>
                  </div>
                  <p className="text-game-textDim">{quest.description}</p>
                  {quest.status === 'completed' && (
                    <div className="mt-4 pt-4 border-t border-game-border text-game-rarity-rare text-sm flex items-center gap-1">
                      <CheckCircle2 size={16} /> 战役已完成
                    </div>
                  )}
                  {quest.status === 'in_progress' && (
                    <div className="mt-4 pt-4 border-t border-game-borderBright text-game-primary text-sm flex items-center gap-1 font-bold">
                      <CircleDashed size={16} className="animate-spin-slow" /> 战役进行中...
                    </div>
                  )}
                </GameCard>
              </ViewportAnim>
            ))}
          </div>
        )}
      </section>

      {/* Side Quests Board */}
      <section>
        <SlideAnim direction="left">
          <h2 className="text-2xl font-serif font-bold text-game-accent mb-8 mt-16 flex items-center gap-2">
            <Scroll className="text-game-accent" />
            支线悬赏 (Side Quests)
          </h2>
        </SlideAnim>

        {sideQuests.length === 0 ? (
          <GameCard><p className="text-center text-[var(--text-dim)] py-8">暂无支线任务</p></GameCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sideQuests.map((quest, index) => (
              <ViewportAnim key={quest.id} delay={index * 100} className="h-full">
                <GameCard hoverable={true} className={`flex flex-col h-full group border-l-4 ${
                  quest.status === 'completed' ? 'border-l-[var(--border)]' :
                  quest.status === 'in_progress' ? 'border-l-[var(--accent)]' :
                  'border-l-transparent'
                }`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[var(--surface3)] to-transparent rounded-bl-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="flex items-center gap-2">
                      <StatusIcon status={quest.status} />
                      <h3 className={`font-bold ${quest.status === 'abandoned' ? 'text-game-textMuted line-through' : ''}`}>{quest.title}</h3>
                    </div>
                    <div className="flex bg-game-appTag border border-game-border rounded px-2 py-1 gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          className={i < quest.difficulty ? "text-game-gold fill-game-gold" : "text-game-borderBright"}
                        />
                      ))}
                    </div>
                  </div>

                  <p className={`text-sm flex-grow mb-6 relative z-10 ${quest.status === 'abandoned' ? 'text-game-textMuted' : 'text-game-textDim'}`}>
                    {quest.description}
                  </p>

                  <div className="flex justify-between items-center text-sm font-mono border-t border-game-border pt-4 mt-auto relative z-10">
                    <span className={
                      quest.status === 'completed' ? 'text-game-rarity-rare' :
                      quest.status === 'abandoned' ? 'text-game-textMuted' : 'text-game-primary'
                    }>
                      奖赏: +{quest.reward_exp} EXP
                    </span>

                    <span className={`px-2 py-0.5 rounded text-xs border
                      ${quest.status === 'completed' ? 'bg-[var(--surface2)] border-[var(--border)] text-[var(--text-dim)]' : ''}
                      ${quest.status === 'in_progress' ? 'bg-[var(--accent-glow)] border-[var(--accent)] text-[var(--accent)]' : ''}
                      ${quest.status === 'abandoned' ? 'bg-[var(--surface3)] border-[var(--border)] text-[var(--text-muted)]' : ''}
                    `}>
                      {quest.status === 'completed' ? '已达成' :
                       quest.status === 'in_progress' ? '进行中' : '已放弃'}
                    </span>
                  </div>
                </GameCard>
              </ViewportAnim>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
