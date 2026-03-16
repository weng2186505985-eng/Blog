import { useState, useEffect } from 'react';
import { GameCard } from '../components/ui/GameCard';
import { Link } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import { ViewportAnim, SlideAnim } from '../components/ui/Animations';
import { supabase, type Post } from '../lib/supabase';

type PostWithLikes = Post & { likes_count: number };

export function BlogList() {
  const [posts, setPosts] = useState<PostWithLikes[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPosts() {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error || !data) {
        setPosts([]);
        setLoading(false);
        return;
      }

      // Fetch likes counts
      const { data: likesData } = await supabase
        .from('likes')
        .select('post_id');

      const likesMap: Record<string, number> = {};
      likesData?.forEach(l => {
        likesMap[l.post_id] = (likesMap[l.post_id] || 0) + 1;
      });

      setPosts(data.map(p => ({
        ...p,
        likes_count: likesMap[p.id] || 0,
      })));
      setLoading(false);
    }
    fetchPosts();
  }, []);

  const allTags = Array.from(new Set(posts.flatMap(p => p.tags || [])));

  const filteredPosts = posts.filter(post => {
    const matchSearch = post.title.toLowerCase().includes(search.toLowerCase()) || (post.summary || '').toLowerCase().includes(search.toLowerCase());
    const matchTag = activeTag ? (post.tags || []).includes(activeTag) : true;
    return matchSearch && matchTag;
  });

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
    } catch { return dateStr; }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <SlideAnim direction="up" delay={100}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-serif text-game-primary font-bold flex items-center gap-2">
            <span className="w-1.5 h-8 bg-game-primary inline-block rounded-full shadow-glow-primary"></span>
            冒险日志 (Quest Logs)
          </h1>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-game-textMuted" size={18} />
            <input
              type="text"
              placeholder="搜索日志..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-game-panel border border-game-border rounded-md py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-game-primary transition-colors focus:shadow-glow-primary placeholder-game-textMuted"
            />
          </div>
        </div>
      </SlideAnim>

      <SlideAnim direction="up" delay={200}>
        <div className="flex flex-wrap gap-2 items-center">
          <Filter size={16} className="text-game-textMuted mr-2" />
          <button
            onClick={() => setActiveTag(null)}
            className={`px-3 py-1 text-xs rounded-full border transition-all ${!activeTag ? 'bg-game-primary/20 border-game-primary text-game-primary shadow-glow-primary' : 'border-game-border text-game-textDim hover:border-game-borderBright hover:text-game-text'}`}
          >
            全部 (All)
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`px-3 py-1 text-xs rounded-full border transition-all ${activeTag === tag ? 'bg-game-primary/20 border-game-primary text-game-primary shadow-glow-primary' : 'border-game-border text-game-textDim hover:border-game-borderBright hover:text-game-text'}`}
            >
              {tag}
            </button>
          ))}
        </div>
      </SlideAnim>

      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-12 text-[var(--text-dim)] font-mono animate-pulse">加载中...</div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12 text-[var(--text-dim)] font-mono">暂未发现任何冒险记录...</div>
        ) : (
          filteredPosts.map((post, idx) => (
            <ViewportAnim key={post.id} delay={300 + idx * 100}>
              <GameCard rarity={post.rarity as any} hoverable={true} className="group">
                <div className="flex justify-between items-start mb-2 relative z-10">
                  <Link to={`/blog/${post.id}`}>
                    <h2 className="text-xl font-bold group-hover:text-game-primary transition-colors">{post.title}</h2>
                  </Link>
                  <span className={`text-xs px-2 py-1 rounded capitalize border shadow-sm
                    ${post.rarity === 'common' ? 'bg-[var(--tag-common-bg)] text-[var(--tag-common-text)] border-[var(--tag-common-border)]' : ''}
                    ${post.rarity === 'rare' ? 'bg-[var(--tag-rare-bg)] text-[var(--tag-rare-text)] border-[var(--tag-rare-border)] shadow-[0_0_8px_rgba(76,175,80,0.2)]' : ''}
                    ${post.rarity === 'epic' ? 'bg-[var(--tag-epic-bg)] text-[var(--tag-epic-text)] border-[var(--tag-epic-border)] shadow-[0_0_12px_rgba(156,39,176,0.3)]' : ''}
                    ${post.rarity === 'legendary' ? 'bg-[var(--tag-legendary-bg)] text-[var(--tag-legendary-text)] border-[var(--tag-legendary-border)] shadow-[0_0_15px_var(--gold)]' : ''}
                  `}>
                    {post.rarity}
                  </span>
                </div>

                <div className={`absolute top-0 left-0 w-1 h-10 group-hover:h-full transition-all duration-300 ease-out z-0
                  ${post.rarity === 'common' ? 'bg-game-rarity-common/50' : ''}
                  ${post.rarity === 'rare' ? 'bg-game-rarity-rare/50' : ''}
                  ${post.rarity === 'epic' ? 'bg-game-rarity-epic/50' : ''}
                  ${post.rarity === 'legendary' ? 'bg-game-gold/50' : ''}
                `} />

                <div className="relative z-10">
                  <p className="text-game-textDim text-sm mb-4 line-clamp-2 leading-relaxed ml-2">
                    {post.summary}
                  </p>
                  <div className="flex flex-wrap justify-between items-center text-xs text-game-textMuted font-mono ml-2">
                    <div className="flex gap-2">
                      {(post.tags || []).map(tag => (
                        <span key={tag} className="bg-[var(--surface3)] text-[var(--text-dim)] px-2 py-0.5 rounded border border-game-border">#{tag}</span>
                      ))}
                    </div>
                    <div className="flex gap-4 mt-2 sm:mt-0">
                      <span>💎 {post.likes_count} 水晶</span>
                      <span>⏱️ {post.read_time} min</span>
                      <span>📅 {formatDate(post.created_at)}</span>
                    </div>
                  </div>
                </div>
              </GameCard>
            </ViewportAnim>
          ))
        )}
      </div>
    </div>
  );
}
