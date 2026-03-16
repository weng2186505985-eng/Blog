import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { GameCard } from '../components/ui/GameCard';
import { ArrowLeft, MessageSquare, Send, Diamond } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_ARTICLE = {
  id: 1,
  title: '探索 React 19 新特性',
  rarity: 'epic',
  time: '2023-10-24',
  likes: 120,
  content: `
# 引言 (Introduction)

React 19 带来了许多令人兴奋的特性，作为一名**代码术士**，掌握这些新魔法是必须的。

## 1. Concurrent Rendering

并发渲染允许 React 暂停某些渲染工作去处理更紧急的交互任务。这就好比在战斗中可以灵活分配注意力一样：
* \`useTransition\`
* \`useDeferredValue\`

## 2. Server Components

直接在服务器施展魔法，减少传送给客户端的魔力消耗（Bundle size）。

\`\`\`javascript
export default async function Page() {
  const data = await fetchSpellData();
  return <div>{data.spellName}</div>;
}
\`\`\`

> "优秀的术士总是懂得如何优化魔力流转。"
  `,
};

const MOCK_COMMENTS = [
  { id: 1, user: '游侠小明', level: 12, content: '这篇日志太有用了！', time: '2小时前' },
  { id: 2, user: '法师艾米', level: 25, content: 'Server Components 的确是质的飞跃。', time: '5小时前' }
];

export function BlogDetail() {
  const { id } = useParams();
  const [likes, setLikes] = useState(MOCK_ARTICLE.likes);
  const [hasLiked, setHasLiked] = useState(false);
  const [comment, setComment] = useState('');
  const [likeEffects, setLikeEffects] = useState<{ id: number; x: number; y: number }[]>([]);

  const handleLike = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (!hasLiked) {
      setLikes(likes + 1);
      setHasLiked(true);

      const newEffect = { id: Date.now(), x, y };
      setLikeEffects(prev => [...prev, newEffect]);
      setTimeout(() => {
        setLikeEffects(prev => prev.filter(effect => effect.id !== newEffect.id));
      }, 1000); // Remove after animation
    }
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-8">
      {/* Main Content */}
      <div className="lg:w-3/4 space-y-8">
        <Link to="/blog" className="inline-flex items-center text-game-primary hover:text-game-accent transition-colors text-sm">
          <ArrowLeft size={16} className="mr-1" /> 返回日志列表
        </Link>

        <GameCard rarity={MOCK_ARTICLE.rarity as any} hoverable={false} className="p-8">
          <header className="mb-8 border-b border-[var(--border)] pb-6">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-game-text to-game-textMuted">
                {MOCK_ARTICLE.title} {id && <span className="text-[var(--text-muted)] text-lg">#{id}</span>}
              </h1>
              <span className={`text-xs px-2 py-1 rounded capitalize border hidden md:block
                  ${MOCK_ARTICLE.rarity === 'epic' ? 'bg-[var(--tag-epic-bg)] text-[var(--tag-epic-text)] border-[var(--tag-epic-border)]' : ''}
                `}>
                {MOCK_ARTICLE.rarity}
              </span>
            </div>
            <div className="flex gap-4 text-sm text-[var(--text-dim)] font-mono">
              <span>📅 发布于: {MOCK_ARTICLE.time}</span>
              <span>💎 获得水晶: {likes}</span>
            </div>
          </header>

          {/* Markdown Content */}
          <div className="prose dark:prose-invert prose-p:text-[var(--text-dim)] prose-headings:text-game-text prose-headings:font-serif prose-a:text-game-primary hover:prose-a:text-game-accent prose-code:text-game-accent prose-pre:bg-[var(--surface2)] prose-pre:border prose-pre:border-[var(--border)] max-w-none mb-10">
            <ReactMarkdown>{MOCK_ARTICLE.content}</ReactMarkdown>
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
                👤
              </div>
              <div className="flex-1 right-0">
                <textarea
                  rows={3}
                  placeholder="留下你的冒险心语..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded pt-2 px-3 text-sm focus:outline-none focus:border-game-primary resize-none placeholder-[var(--text-muted)] text-[var(--text)]"
                ></textarea>
                <div className="flex justify-end mt-2">
                  <button className="bg-game-primary hover:bg-game-primary/80 text-white px-4 py-1.5 rounded text-sm flex items-center gap-2 transition-colors">
                    <Send size={14} /> 施放留言
                  </button>
                </div>
              </div>
            </div>
          </GameCard>

          <div className="space-y-3 mt-6">
            <AnimatePresence>
              {MOCK_COMMENTS.map((c, index) => (
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
