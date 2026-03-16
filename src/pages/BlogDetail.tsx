import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { GameCard } from '../components/ui/GameCard';
import { ArrowLeft, MessageSquare, Send, Diamond } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, type Post } from '../lib/supabase';
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

// Fallback mock article for development or missing data
const DEFAULT_ARTICLE: Partial<Post> = {
  title: '',
  rarity: 'common' as const,
  created_at: '',
  content: '',
};

export function BlogDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [likeEffects, setLikeEffects] = useState<{ id: number; x: number; y: number }[]>([]);

  useEffect(() => {
    async function fetchPostAndComments() {
      if (!id) return;
      setLoading(true);

      const [postRes, likesRes, commentsRes] = await Promise.all([
        supabase.from('posts').select('*').eq('id', id).single(),
        supabase.from('likes').select('id', { count: 'exact' }).eq('post_id', id),
        supabase.from('comments').select('*, profiles(*)').eq('post_id', id).order('created_at', { ascending: true })
      ]);

      if (postRes.data) {
        setPost(postRes.data);
      }
      if (likesRes.count !== null) {
        setLikes(likesRes.count);
      }
      if (commentsRes.data) {
        setComments(commentsRes.data.map(c => ({
          id: c.id,
          user: c.profiles?.username || '神秘旅者',
          level: c.profiles?.level || 1,
          content: c.content,
          time: new Date(c.created_at).toLocaleDateString()
        })));
      }

      // Check if current user liked
      if (user) {
        const { count } = await supabase.from('likes').select('id', { count: 'exact', head: true }).eq('post_id', id).eq('user_id', user.id);
        setHasLiked(!!count);
      }

      setLoading(false);
    }
    fetchPostAndComments();
  }, [id, user]);

  const handleLike = async (e: React.MouseEvent) => {
    if (!id || !user || hasLiked) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const { error } = await supabase.from('likes').insert({ post_id: id, user_id: user.id });
    
    if (!error) {
      setLikes(prev => prev + 1);
      setHasLiked(true);

      const newEffect = { id: Date.now(), x, y };
      setLikeEffects(prev => [...prev, newEffect]);
      setTimeout(() => {
        setLikeEffects(prev => prev.filter(effect => effect.id !== newEffect.id));
      }, 1000);
    }
  };

  const handleSendComment = async () => {
    if (!id || !user || !commentText.trim()) return;

    const { data, error } = await supabase.from('comments').insert({
      post_id: id,
      user_id: user.id,
      content: commentText.trim()
    }).select('*, profiles(*)').single();

    if (!error && data) {
      setComments(prev => [...prev, {
        id: data.id,
        user: data.profiles?.username || '我',
        level: data.profiles?.level || 1,
        content: data.content,
        time: '刚刚'
      }]);
      setCommentText('');
    }
  };

  if (loading) {
    return <div className="text-center py-20 font-mono animate-pulse">正在解读上古卷轴...</div>;
  }

  const displayPost = post || { ...DEFAULT_ARTICLE, title: '未知卷轴', rarity: 'common' as const };

  return (
    <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-8">
      {/* Main Content */}
      <div className="lg:w-3/4 space-y-8">
        <Link to="/blog" className="inline-flex items-center text-game-primary hover:text-game-accent transition-colors text-sm">
          <ArrowLeft size={16} className="mr-1" /> 返回日志列表
        </Link>

        <GameCard rarity={displayPost.rarity as any} hoverable={false} className="p-8">
          <header className="mb-8 border-b border-[var(--border)] pb-6">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-game-text to-game-textMuted">
                {displayPost.title}
              </h1>
              <span className={`text-xs px-2 py-1 rounded capitalize border hidden md:block
                  ${displayPost.rarity === 'epic' ? 'bg-[var(--tag-epic-bg)] text-[var(--tag-epic-text)] border-[var(--tag-epic-border)]' : ''}
                `}>
                {displayPost.rarity}
              </span>
            </div>
            <div className="flex gap-4 text-sm text-[var(--text-dim)] font-mono">
              <span>📅 发布于: {displayPost.created_at ? new Date(displayPost.created_at).toLocaleDateString() : ''}</span>
              <span>💎 获得水晶: {likes}</span>
            </div>
          </header>

          {/* Markdown Content */}
          <div className="prose max-w-none mb-10">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{displayPost.content}</ReactMarkdown>
          </div>

          {/* Action Area */}
          <div className="flex justify-center border-t border-[var(--border)] pt-8 relative">
            <button
              onClick={handleLike}
              className={`flex flex-col items-center gap-2 group transition-all duration-300 ${hasLiked ? 'text-game-primary' : 'text-game-textMuted hover:text-game-primary'}`}
            >
              <motion.div
                animate={hasLiked ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.4 }}
                className={`p-4 rounded-full border transition-all duration-300 relative ${hasLiked ? 'border-game-primary bg-game-primary/10 shadow-[0_0_10px_var(--primary-glow)]' : 'border-[var(--border)] bg-[var(--surface2)] group-hover:border-[var(--border-bright)]'}`}
              >
                <Diamond size={24} className={hasLiked ? "fill-game-primary text-game-primary" : ""} />

                <AnimatePresence>
                  {likeEffects.map((effect) => (
                    <motion.span
                      key={effect.id}
                      initial={{ opacity: 1, y: 0, x: 0 }}
                      animate={{ opacity: 0, y: -40, x: (Math.random() - 0.5) * 20 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="absolute text-game-primary font-bold z-50 pointer-events-none text-sm whitespace-nowrap"
                      style={{ left: effect.x - 24, top: effect.y - 24 }} // adjust local coords
                    >
                      +1 水晶
                    </motion.span>
                  ))}
                </AnimatePresence>
              </motion.div>
              <span className="font-mono text-lg font-bold">{likes}</span>
              <span className="text-xs uppercase text-[var(--text-dim)]">{hasLiked ? '已赠送' : '送出魔力水晶'}</span>
            </button>
          </div>
        </GameCard>

        {/* Message Board (Comments) */}
        <section className="space-y-4">
          <h3 className="font-serif font-bold text-xl flex items-center gap-2">
            <MessageSquare size={20} className="text-game-accent" />
            冒险者留言板
          </h3>

          <GameCard className="p-4">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-[var(--surface2)] border border-[var(--border)] flex items-center justify-center shrink-0">
                {user ? (
                  <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.email}`} className="w-full h-full rounded-full" alt="Avatar" />
                ) : '👤'}
              </div>
              <div className="flex-1 right-0">
                <textarea
                  rows={3}
                  placeholder={user ? "留下你的冒险心语..." : "请先登录后再留言..."}
                  disabled={!user}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded pt-2 px-3 text-sm focus:outline-none focus:border-game-primary resize-none placeholder-[var(--text-muted)] text-[var(--text)] disabled:opacity-50"
                ></textarea>
                <div className="flex justify-end mt-2">
                  <button 
                    onClick={handleSendComment}
                    disabled={!user || !commentText.trim()}
                    className="explicit-action bg-game-primary hover:bg-game-primary/80 text-white px-4 py-1.5 rounded text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <Send size={14} /> 施放留言
                  </button>
                </div>
              </div>
            </div>
          </GameCard>

          <div className="space-y-3 mt-6">
            <AnimatePresence>
              {comments.map((c, index) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <GameCard className="p-4 bg-[var(--surface2)] border-[var(--border)]">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-game-accent">{c.user}</span>
                        <span className="text-xs font-mono text-game-primary bg-game-primary/10 border border-game-primary/20 px-1 rounded">Lv.{c.level}</span>
                      </div>
                      <span className="text-xs text-[var(--text-muted)]">{c.time}</span>
                    </div>
                    <p className="text-sm text-[var(--text-dim)]">{c.content}</p>
                  </GameCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>
      </div>

      {/* Sidebar */}
      <div className="lg:w-1/4 space-y-6">
        <GameCard>
          <h4 className="font-bold mb-4 font-serif text-sm border-b border-[var(--border)] pb-2 text-[var(--text)]">魔法目录 (TOC)</h4>
          <ul className="text-sm space-y-2 text-[var(--text-dim)]">
            <li className="hover:text-game-primary cursor-pointer transition-colors">- 引言 (Introduction)</li>
            <li className="hover:text-game-primary cursor-pointer transition-colors">- 1. Concurrent Rendering</li>
            <li className="hover:text-game-primary cursor-pointer transition-colors">- 2. Server Components</li>
          </ul>
        </GameCard>

        <GameCard>
          <h4 className="font-bold mb-4 font-serif text-sm border-b border-[var(--border)] pb-2 text-[var(--text)]">相关卷轴</h4>
          <ul className="text-sm space-y-3 text-[var(--text-dim)]">
            <li className="hover:text-game-primary cursor-pointer transition-colors">Tailwind CSS 进阶魔法</li>
            <li className="hover:text-game-primary cursor-pointer transition-colors">如何设计一个游戏化博客系统</li>
          </ul>
        </GameCard>
      </div>
    </div>
  );
}
