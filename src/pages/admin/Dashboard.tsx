import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GameCard } from '../../components/ui/GameCard';
import { FileText, Heart, MessageSquare, Zap, PenTool, Swords, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '../../lib/supabase';
import { CardSkeleton } from '../../components/ui/Skeleton';

// Mock data for charts (will be replaced by Supabase queries)
// Chart will use trendData state

// Chart colors
const RARITY_COLORS: Record<string, string> = {
  common: 'var(--common)',
  rare: 'var(--rare)',
  epic: 'var(--epic)',
  legendary: 'var(--legendary)',
};

type Stats = {
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  totalExp: number;
  level: number;
};

export function Dashboard() {
  const [stats, setStats] = useState<Stats>({ 
    totalPosts: 0, 
    totalLikes: 0, 
    totalComments: 0, 
    totalExp: 0,
    level: 0
  });
  const [recentComments, setRecentComments] = useState<any[]>([]);
  const [rarityData, setRarityData] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [expLogs, setExpLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const [postsRes, likesRes, commentsRes, profileRes, recentCommRes, rarityRes, trendPostsRes, trendLikesRes, expLogsRes] = await Promise.all([
          supabase.from('posts').select('id', { count: 'exact', head: true }),
          supabase.from('likes').select('id', { count: 'exact', head: true }),
          supabase.from('comments').select('id', { count: 'exact', head: true }),
          supabase.from('profiles').select('exp, level').eq('is_admin', true).single(),
          supabase.from('comments').select('id, content, created_at, profiles(username), posts(title)').order('created_at', { ascending: false }).limit(3),
          supabase.from('posts').select('rarity'),
          supabase.from('posts').select('created_at').gte('created_at', thirtyDaysAgo.toISOString()),
          supabase.from('likes').select('created_at').gte('created_at', thirtyDaysAgo.toISOString()),
          supabase.from('exp_logs').select('*').order('created_at', { ascending: false }).limit(20),
        ]);

        const totalExp = profileRes.data?.exp ?? 0;
        const derivedLevel = Math.floor(Math.sqrt(totalExp / 100));

        setStats({
          totalPosts: postsRes.count ?? 0,
          totalLikes: likesRes.count ?? 0,
          totalComments: commentsRes.count ?? 0,
          totalExp: totalExp,
          level: derivedLevel,
        });

        if (expLogsRes && expLogsRes.data) {
          setExpLogs(expLogsRes.data);
        }

        // Calculate trend data
        const trendMap: Record<string, { day: string, posts: number, likes: number }> = {};
        for (let i = 0; i < 30; i++) {
          const d = new Date();
          d.setDate(d.getDate() - (29 - i));
          const dateStr = d.toISOString().split('T')[0];
          trendMap[dateStr] = { day: (i + 1).toString(), posts: 0, likes: 0 };
        }

        trendPostsRes.data?.forEach(p => {
          const date = p.created_at.split('T')[0];
          if (trendMap[date]) trendMap[date].posts++;
        });
        trendLikesRes.data?.forEach(l => {
          const date = l.created_at.split('T')[0];
          if (trendMap[date]) trendMap[date].likes++;
        });

        setTrendData(Object.values(trendMap));

        if (recentCommRes.data) {
          setRecentComments(recentCommRes.data.map((c: any) => ({
            id: c.id,
            user: c.profiles?.username || '神秘旅者',
            content: c.content,
            postTitle: c.posts?.title || '未知日志',
            time: new Date(c.created_at).toLocaleDateString()
          })));
        }

        if (rarityRes.data) {
          const counts: Record<string, number> = {};
          rarityRes.data.forEach((p: any) => {
            counts[p.rarity] = (counts[p.rarity] || 0) + 1;
          });
          const formattedRarity = Object.keys(RARITY_COLORS).map(key => ({
            name: key.charAt(0).toUpperCase() + key.slice(1),
            value: counts[key] || 0,
            color: RARITY_COLORS[key]
          }));
          setRarityData(formattedRarity.filter(r => r.value > 0));
        }

        if (trendLikesRes.status === 200) {
           // handled
        }

      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      }
      setLoading(false);
    }
    fetchStats();
  }, []);

  const statCards = [
    { label: '总文章数', value: stats.totalPosts, icon: <FileText size={20} />, color: 'var(--primary)' },
    { label: '总点赞水晶', value: stats.totalLikes, icon: <Heart size={20} />, color: 'var(--accent)' },
    { label: '总评论数', value: stats.totalComments, icon: <MessageSquare size={20} />, color: 'var(--gold)' },
    { label: '博主 EXP', value: stats.totalExp, subtitle: `Lv.${(stats as any).level || 0}`, icon: <Zap size={20} />, color: 'var(--primary)' },
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
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-mono font-bold" style={{ color: card.color, fontFamily: 'Orbitron, monospace' }}>
                    {card.value.toLocaleString()}
                  </p>
                  {card.subtitle && <span className="text-[10px] font-bold opacity-60" style={{ color: card.color }}>{card.subtitle}</span>}
                </div>
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
              <LineChart data={trendData}>
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
                  data={rarityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {rarityData.map((entry, i) => (
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
            {rarityData.map(r => (
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
            {recentComments.length > 0 ? recentComments.map(c => (
              <div key={c.id} className="flex items-start justify-between gap-2 p-2 rounded-lg hover:bg-[var(--surface2)] transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[var(--text)]"><span className="font-bold text-[var(--accent)]">{c.user}</span> 在 <span className="text-[var(--primary)]">{c.postTitle}</span></p>
                  <p className="text-sm text-[var(--text-dim)] truncate mt-0.5">{c.content}</p>
                </div>
                <span className="text-xs text-[var(--text-muted)] whitespace-nowrap">{c.time}</span>
              </div>
            )) : (
              <p className="text-xs text-[var(--text-muted)] text-center py-4">暂无最近评论</p>
            )}
          </div>
        </GameCard>
      </div>

      {/* EXP Logs Section */}
      <GameCard>
        <h3 className="text-sm font-bold text-[var(--text)] mb-4 flex items-center gap-2">
          <Zap size={16} className="text-[var(--primary)]" />
          EXP 动态 (20条)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {expLogs.length > 0 ? expLogs.map(log => {
            const Icon = log.source_type === 'post' ? FileText : log.source_type === 'achievement' ? Zap : Swords;
            const color = log.source_type === 'post' ? 'var(--primary)' : log.source_type === 'achievement' ? 'var(--gold)' : 'var(--accent)';
            return (
              <div key={log.id} className="flex items-center gap-3 p-3 rounded-lg bg-[var(--surface2)] border border-[var(--border)]/30 hover:border-[var(--primary)]/30 transition-all group">
                <div className="p-2 rounded-md bg-[var(--surface3)]" style={{ color }}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[var(--text)] truncate">{log.source_title}</p>
                  <p className="text-[10px] text-[var(--text-muted)]">{new Date(log.created_at).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div className={`text-xs font-mono font-bold ${log.exp_amount >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {log.exp_amount >= 0 ? '+' : ''}{log.exp_amount}
                </div>
              </div>
            );
          }) : (
             <p className="col-span-full py-12 text-center text-xs text-[var(--text-muted)]">暂无 EXP 记录，快去完成任务吧！</p>
          )}
        </div>
      </GameCard>
    </div>
  );
}
