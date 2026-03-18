import { useState, useEffect } from 'react';
import { GameCard } from '../components/ui/GameCard';
import { HexagonBadge } from '../components/ui/HexagonBadge';
import { ExpBar } from '../components/ui/ExpBar';
import { Link } from 'react-router-dom';
import { SlideAnim, ViewportAnim } from '../components/ui/Animations';
import { supabase, type Profile, type Post, type Quest } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';



export function Home() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [activeQuests, setActiveQuests] = useState<Quest[]>([]);

  const { profile: authProfile } = useAuth();

  useEffect(() => {
    // If not logged in, fetch the main admin profile to show on the public home page
    if (!authProfile) {
      supabase.from('profiles').select('*').eq('is_admin', true).limit(1).single().then(({ data }) => {
        if (data) setProfile(data);
      });
    } else {
      setProfile(authProfile);
    }

    // Fetch 2 recent published posts
    supabase.from('posts').select('*').eq('published', true).order('created_at', { ascending: false }).limit(2).then(({ data }) => {
      if (data) setRecentPosts(data);
    });

    // Fetch 2 active quests (1 main, 1 side if possible)
    supabase.from('quests').select('*').eq('status', 'in_progress').order('start_date', { ascending: false }).limit(2).then(({ data }) => {
      if (data) setActiveQuests(data);
    });
  }, []);



  const totalExp = profile?.exp || 0;
  // Derived level from exp to ensure consistency with the formula L = floor(sqrt(EXP/100))
  const level = Math.floor(Math.sqrt(totalExp / 100));
  const username = profile?.username || '';
  const title = profile?.title || '';
  
  // Required EXP for level L: L^2 * 100
  const nextLevelMinExp = Math.pow(level + 1, 2) * 100;

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return '刚刚';
    if (hours < 24) return `${hours}小时前`;
    const days = Math.floor(hours / 24);
    return `${days}天前`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-8 md:pb-0">
      {/* Left Column - Profile & Stats */}
      <div className="lg:col-span-1 space-y-6">
        <SlideAnim direction="left" delay={100}>
          <GameCard className="flex flex-col items-center">
            <div className="relative mb-4">
            <img
              src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${username}&backgroundColor=6366f1`}
              alt="Avatar"
              className="w-24 h-24 rounded-full border-2 border-game-primary shadow-[0_0_0_4px_var(--primary-glow)] dark:shadow-[0_0_10px_var(--primary-glow)] bg-[var(--surface)]"
            />
            <div className="absolute bottom-0 right-0">
              <HexagonBadge level={level} size="xs" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-game-text">{username}</h2>
          <p className="text-game-primary font-mono text-sm mb-4">职业：代码术士 / 称号：{title}</p>

            <ExpBar current={totalExp} max={nextLevelMinExp} label="EXP" />
          </GameCard>
        </SlideAnim>


      </div>

      {/* Right Column - Activities */}
      <div className="lg:col-span-2 space-y-6">
        {/* Active Quests */}
        <SlideAnim direction="right" delay={150}>
          <section>
            <div className="flex justify-between items-center mb-4">
            <h3 className="font-serif font-bold text-xl text-game-text flex items-center gap-2">
              <span className="w-1 h-5 bg-game-primary rounded-full inline-block"></span>
              当前悬赏
            </h3>
            <Link to="/quests" className="text-sm text-game-primary hover:text-game-accent transition-colors">查看全部 &raquo;</Link>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-[24px]">
            {activeQuests.length > 0 ? activeQuests.map(quest => (
              <GameCard key={quest.id}>
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-xs px-2 py-1 rounded border ${
                    quest.type === 'main'
                      ? 'bg-[var(--tag-main-bg)] text-[var(--tag-main-text)] border-[var(--tag-main-border)]'
                      : 'bg-[var(--tag-side-bg)] text-[var(--tag-side-text)] border-[var(--tag-side-border)]'
                  }`}>{quest.type === 'main' ? '主线任务' : '支线任务'}</span>
                  <span className="text-game-primary font-mono text-xs">+{quest.reward_exp} EXP</span>
                </div>
                <h4 className="font-bold mb-1">{quest.title}</h4>
                <p className="text-sm text-[var(--text-dim)]">{quest.description}</p>
              </GameCard>
            )) : (
              <>
                <GameCard>
                  <p className="text-sm text-[var(--text-dim)] text-center py-4">暂无进行中的任务，去后台添加吧！</p>
                </GameCard>
                <GameCard>
                  <p className="text-sm text-[var(--text-dim)] text-center py-4">在 /admin/quests 创建新任务</p>
                </GameCard>
              </>
            )}
          </div>
        </section>
        </SlideAnim>

        {/* Recent Posts */}
        <section>
          <ViewportAnim delay={200}>
            <div className="flex justify-between items-center mb-4 mt-8">
              <h3 className="font-serif text-xl text-game-text flex items-center gap-2 font-bold">
                <span className="w-1 h-5 bg-game-rarity-epic rounded-full inline-block"></span>
                最新冒险日志
              </h3>
              <Link to="/blog" className="text-sm text-game-primary hover:text-game-accent transition-colors">开启阅读 &raquo;</Link>
            </div>
          </ViewportAnim>

          <div className="space-y-4">
            {recentPosts.length > 0 ? recentPosts.map((post, idx) => (
              <ViewportAnim key={post.id} delay={250 + idx * 50}>
                <GameCard rarity={post.rarity as any} hoverable={true} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group">
                  <div>
                    <h4 className="text-lg font-bold mb-1 group-hover:text-game-primary transition-colors">
                    <Link to={`/blog/${post.id}`}>{post.title}</Link>
                  </h4>
                  <div className="flex gap-2">
                    {(post.tags || []).map(tag => (
                      <span key={tag} className="text-xs text-[var(--text-dim)] border border-[var(--border)] px-2 py-0.5 rounded-full">{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-1 rounded capitalize border
                    ${post.rarity === 'rare' ? 'text-game-rarity-rare border-game-rarity-rare/30' : ''}
                    ${post.rarity === 'epic' ? 'text-game-rarity-epic border-game-rarity-epic/30' : ''}
                    ${post.rarity === 'common' ? 'text-game-rarity-common border-game-rarity-common/30' : ''}
                    ${post.rarity === 'legendary' ? 'text-game-gold border-game-gold/30' : ''}
                  `}>
                    {post.rarity}
                  </span>
                  <p className="text-xs text-game-textDim mt-2 font-mono">{timeAgo(post.created_at)}</p>
                </div>
              </GameCard>
              </ViewportAnim>
            )) : (
              <GameCard>
                <p className="text-sm text-[var(--text-dim)] text-center py-8">还没有冒险日志，快去后台写第一篇吧！</p>
              </GameCard>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
