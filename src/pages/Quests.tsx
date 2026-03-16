import { useState, useEffect } from 'react';
import { GameCard } from '../components/ui/GameCard';
import { Shield, Scroll, Star, CircleDashed, CheckCircle2, XCircle } from 'lucide-react';
import { ViewportAnim, SlideAnim } from '../components/ui/Animations';
import { supabase, type Quest } from '../lib/supabase';

const StatusTag = ({ status }: { status: string }) => {
  const styles = {
    in_progress: 'border-[var(--primary)] text-[var(--primary)] bg-[var(--primary-glow)]',
    completed: 'border-game-rarity-rare text-game-rarity-rare bg-game-rarity-rare/10',
    abandoned: 'border-[var(--border)] text-[var(--text-dim)] bg-[var(--surface3)]',
  }[status as 'in_progress' | 'completed' | 'abandoned'] || 'border-[var(--border)] text-[var(--text-dim)]';
  
  const labels = {
    in_progress: '进行中',
    completed: '已完成',
    abandoned: '已放弃',
  }[status as 'in_progress' | 'completed' | 'abandoned'] || status;

  const Icon = {
    in_progress: CircleDashed,
    completed: CheckCircle2,
    abandoned: XCircle,
  }[status as 'in_progress' | 'completed' | 'abandoned'];

  return (
    <span className={`px-2 py-0.5 rounded text-[10px] border font-medium flex items-center gap-1.5 ${styles}`}>
      {Icon && (
        <Icon 
          size={14} 
          className={status === 'in_progress' ? 'animate-[spin_1.5s_linear_infinite]' : ''} 
        />
      )}
      {labels}
    </span>
  );
};

const DifficultyStars = ({ difficulty }: { difficulty: number }) => (
  <div className="flex gap-0.5">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={12}
        className={i < difficulty ? "text-game-gold fill-game-gold" : "text-game-border"}
      />
    ))}
  </div>
);

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
            冒险者任务中心
          </h1>
          <p className="text-game-textDim">追踪你的主线进程，接取丰厚的支线悬赏，赚取经验值提升冒险者等级。</p>
        </header>
      </SlideAnim>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[24px]">
        {/* Main Quests Timeline - Left Column */}
        <section className="space-y-8">
          <SlideAnim direction="right" delay={200}>
            <h2 className="text-2xl font-serif font-bold text-game-primary mb-8 flex items-center gap-2">
              <Shield className="text-game-primary" size={24} />
              主线战役
            </h2>
          </SlideAnim>

          {mainQuests.length === 0 ? (
            <GameCard><p className="text-center text-[var(--text-dim)] py-8 text-sm">暂无主线任务</p></GameCard>
          ) : (
            <div className="relative border-l-2 border-game-primary/20 ml-4 md:ml-6 space-y-6 pb-4">
              {mainQuests.map((quest, index) => (
                <ViewportAnim key={quest.id} delay={300 + index * 100} className="relative pl-8 md:pl-10">
                  {/* Timeline Dot */}
                  <div className={`absolute -left-[11px] top-4 w-5 h-5 rounded-full border-2 flex items-center justify-center bg-game-bg z-10
                    ${quest.status === 'completed' ? 'border-game-rarity-rare shadow-[0_0_8px_rgba(76,175,80,0.3)]' :
                      quest.status === 'in_progress' ? 'border-game-primary shadow-glow-primary' : 'border-game-border'}
                  `}>
                    <div className={`w-1.5 h-1.5 rounded-full ${quest.status === 'completed' ? 'bg-game-rarity-rare' : quest.status === 'in_progress' ? 'bg-game-primary animate-pulse' : 'bg-game-border'}`} />
                  </div>

                  <GameCard hoverable={true} className="p-5 group">
                    {/* Row 1: Title + EXP */}
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <h3 className={`font-bold text-base transition-colors group-hover:text-game-primary ${quest.status === 'completed' ? 'text-game-textDim line-through' : 'text-game-text'}`}>
                        {quest.title}
                      </h3>
                      <span className="text-game-primary font-mono text-xs font-bold whitespace-nowrap">
                        +{quest.reward_exp} EXP
                      </span>
                    </div>

                    {/* Row 2: Description */}
                    <p className="text-game-textDim text-sm mb-4 line-clamp-2 leading-relaxed">
                      {quest.description}
                    </p>

                    {/* Row 3: Status + Stars */}
                    <div className="flex justify-between items-center pt-3 border-t border-game-border/50">
                      <StatusTag status={quest.status} />
                      <DifficultyStars difficulty={quest.difficulty} />
                    </div>
                  </GameCard>
                </ViewportAnim>
              ))}
            </div>
          )}
        </section>

        {/* Side Quests Board - Right Column */}
        <section className="space-y-8">
          <SlideAnim direction="left">
            <h2 className="text-2xl font-serif font-bold text-game-accent mb-8 flex items-center gap-2">
              <Scroll className="text-game-accent" size={24} />
              支线悬赏
            </h2>
          </SlideAnim>

          {sideQuests.length === 0 ? (
            <GameCard><p className="text-center text-[var(--text-dim)] py-8 text-sm">暂无支线任务</p></GameCard>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {sideQuests.map((quest, index) => (
                <ViewportAnim key={quest.id} delay={index * 100}>
                  <GameCard hoverable={true} className="p-5 group">
                    {/* Row 1: Title + EXP */}
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <h3 className={`font-bold text-base transition-colors group-hover:text-game-accent ${quest.status === 'completed' ? 'text-game-textDim line-through' : 'text-game-text'}`}>
                        {quest.title}
                      </h3>
                      <span className="text-game-accent font-mono text-xs font-bold whitespace-nowrap">
                        +{quest.reward_exp} EXP
                      </span>
                    </div>

                    {/* Row 2: Description */}
                    <p className="text-game-textDim text-sm mb-4 line-clamp-2 leading-relaxed">
                      {quest.description}
                    </p>

                    {/* Row 3: Status + Stars */}
                    <div className="flex justify-between items-center pt-3 border-t border-game-border/50">
                      <StatusTag status={quest.status} />
                      <DifficultyStars difficulty={quest.difficulty} />
                    </div>
                  </GameCard>
                </ViewportAnim>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
