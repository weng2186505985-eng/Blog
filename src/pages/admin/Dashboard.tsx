import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GameCard } from '../../components/ui/GameCard';
import { FileText, Heart, MessageSquare, Zap, PenTool, Swords, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '../../lib/supabase';
import { CardSkeleton } from '../../components/ui/Skeleton';

// Mock data for charts (will be replaced by Supabase queries)
const TREND_DATA = Array.from({ length: 30 }, (_, i) => ({
  day: `${i + 1}`,
  posts: Math.floor(Math.random() * 3),
  likes: Math.floor(Math.random() * 20 + 5),
}));

const RARITY_DATA = [
  { name: 'Common', value: 8, color: 'var(--common)' },
  { name: 'Rare', value: 4, color: 'var(--rare)' },
  { name: 'Epic', value: 2, color: 'var(--epic)' },
  { name: 'Legendary', value: 1, color: 'var(--legendary)' },
];

const RECENT_COMMENTS = [
  { id: '1', user: '游侠小明', content: '这篇日志太有用了！', postTitle: '探索 React 19 新特性', time: '2小时前' },
  { id: '2', user: '法师艾米', content: 'Server Components 的确是质的飞跃。', postTitle: '探索 React 19 新特性', time: '5小时前' },
  { id: '3', user: '剑士大卫', content: '学到了很多新东西', postTitle: 'Tailwind CSS 进阶魔法', time: '1天前' },
];

type Stats = {
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  totalExp: number;
};

export function Dashboard() {
  const [stats, setStats] = useState<Stats>({ totalPosts: 0, totalLikes: 0, totalComments: 0, totalExp: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [postsRes, likesRes, commentsRes, profileRes] = await Promise.all([
          supabase.from('posts').select('id', { count: 'exact', head: true }),
          supabase.from('likes').select('id', { count: 'exact', head: true }),
          supabase.from('comments').select('id', { count: 'exact', head: true }),
          supabase.from('profiles').select('exp').eq('is_admin', true).single(),
        ]);

        setStats({
          totalPosts: postsRes.count ?? 15,
          totalLikes: likesRes.count ?? 462,
          totalComments: commentsRes.count ?? 38,
          totalExp: profileRes.data?.exp ?? 4200,
        });
      } catch {
        // Fallback to mock data
        setStats({ totalPosts: 15, totalLikes: 462, totalComments: 38, totalExp: 4200 });
      }
      setLoading(false);
    }
    fetchStats();
  }, []);

  const statCards = [
    { label: '总文章数', value: stats.totalPosts, icon: <FileText size={20} />, color: 'var(--primary)' },
    { label: '总点赞水晶', value: stats.totalLikes, icon: <Heart size={20} />, color: 'var(--accent)' },
    { label: '总评论数', value: stats.totalComments, icon: <MessageSquare size={20} />, color: 'var(--gold)' },
    { label: '博主 EXP', value: stats.totalExp, icon: <Zap size={20} />, color: 'var(--primary)' },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-serif font-bold text-[var(--text)]">📊 数据总览</h2>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => (
          <GameCard key={card.label}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[var(--text-dim)] mb-1">{card.label}</p>
                <p className="text-3xl font-mono font-bold" style={{ color: card.color, fontFamily: 'Orbitron, monospace' }}>
                  {card.value.toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-lg" style={{ backgroundColor: card.color + '15', color: card.color }}>
                {card.icon}
              </div>
            </div>
          </GameCard>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart */}
        <GameCard className="lg:col-span-2">
          <h3 className="text-sm font-bold text-[var(--text)] mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-[var(--primary)]" />
            近30天趋势
          </h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={TREND_DATA}>
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Line type="monotone" dataKey="likes" stroke="var(--accent)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="posts" stroke="var(--primary)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GameCard>

        {/* Pie Chart */}
        <GameCard>
          <h3 className="text-sm font-bold text-[var(--text)] mb-4">稀有度分布</h3>
          <div className="h-[250px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={RARITY_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {RARITY_DATA.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 mt-2">
            {RARITY_DATA.map(r => (
              <span key={r.name} className="flex items-center gap-1 text-xs text-[var(--text-dim)]">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }} />
                {r.name}
              </span>
            ))}
          </div>
        </GameCard>
      </div>

      {/* Quick Actions + Recent Comments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <GameCard>
          <h3 className="text-sm font-bold text-[var(--text)] mb-4">快捷操作</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/admin/posts/new" className="flex items-center gap-2 px-4 py-3 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-all">
              <PenTool size={16} />
              ✍️ 写新文章
            </Link>
            <Link to="/admin/quests" className="flex items-center gap-2 px-4 py-3 rounded-lg border border-[var(--accent)] text-[var(--accent)] text-sm font-medium hover:bg-[var(--accent)] hover:text-white transition-all">
              <Swords size={16} />
              ⚔️ 新增任务
            </Link>
          </div>
        </GameCard>

        {/* Recent Comments */}
        <GameCard>
          <h3 className="text-sm font-bold text-[var(--text)] mb-4">最近评论</h3>
          <div className="space-y-3">
            {RECENT_COMMENTS.map(c => (
              <div key={c.id} className="flex items-start justify-between gap-2 p-2 rounded-lg hover:bg-[var(--surface2)] transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[var(--text)]"><span className="font-bold text-[var(--accent)]">{c.user}</span> 在 <span className="text-[var(--primary)]">{c.postTitle}</span></p>
                  <p className="text-sm text-[var(--text-dim)] truncate mt-0.5">{c.content}</p>
                </div>
                <span className="text-xs text-[var(--text-muted)] whitespace-nowrap">{c.time}</span>
              </div>
            ))}
          </div>
        </GameCard>
      </div>
    </div>
  );
}
