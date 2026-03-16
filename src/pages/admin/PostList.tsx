import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase, type Post } from '../../lib/supabase';
import { GameCard } from '../../components/ui/GameCard';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../contexts/ToastContext';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { Plus, Search, Edit, Trash2, Eye, EyeOff } from 'lucide-react';


type FilterTab = 'all' | 'published' | 'draft';

export function PostList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>('all');
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchPosts() {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      setPosts(error || !data ? [] : data);
      setLoading(false);
    }
    fetchPosts();
  }, []);

  const filteredPosts = posts
    .filter(p => filter === 'all' || (filter === 'published' ? p.published : !p.published))
    .filter(p => p.title.toLowerCase().includes(search.toLowerCase()));

  const togglePublish = async (post: Post) => {
    const newState = !post.published;
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, published: newState } : p));
    const { error } = await supabase.from('posts').update({ published: newState }).eq('id', post.id);
    if (error) {
      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, published: !newState } : p));
      toast('操作失败：' + error.message, 'error');
    } else {
      toast(newState ? '文章已发布' : '文章已设为草稿');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setPosts(prev => prev.filter(p => p.id !== id));
    setDeleteTarget(null);
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) {
      toast('删除失败：' + error.message, 'error');
    } else {
      toast('文章已删除');
    }
  };

  const getRarityBadge = (rarity: string) => {
    const styles: Record<string, string> = {
      common: 'bg-[var(--tag-common-bg)] text-[var(--tag-common-text)] border-[var(--tag-common-border)]',
      rare: 'bg-[var(--tag-rare-bg)] text-[var(--tag-rare-text)] border-[var(--tag-rare-border)]',
      epic: 'bg-[var(--tag-epic-bg)] text-[var(--tag-epic-text)] border-[var(--tag-epic-border)]',
      legendary: 'bg-[var(--tag-legendary-bg)] text-[var(--tag-legendary-text)] border-[var(--tag-legendary-border)]',
    };
    return styles[rarity] || styles.common;
  };

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'published', label: '已发布' },
    { key: 'draft', label: '草稿' },
  ];

  if (loading) return <TableSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-serif font-bold text-[var(--text)]">📝 文章管理</h2>
        <Link
          to="/admin/posts/new"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-all"
        >
          <Plus size={16} />
          新建文章
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-1 bg-[var(--surface2)] rounded-lg p-1">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-1.5 text-sm rounded-md transition-all ${
                filter === tab.key
                  ? 'bg-[var(--primary)] text-white shadow-sm'
                  : 'text-[var(--text-dim)] hover:text-[var(--text)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜索文章标题..."
            className="pl-9 pr-4 py-2 rounded-lg bg-[var(--surface2)] border border-[var(--border)] text-sm text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] w-full sm:w-[260px] transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <GameCard className="!p-0 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[var(--surface2)]">
              <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-dim)] uppercase">标题</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-dim)] uppercase">稀有度</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-dim)] uppercase hidden md:table-cell">标签</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-dim)] uppercase">状态</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-dim)] uppercase hidden lg:table-cell">创建日期</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-[var(--text-dim)] uppercase">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredPosts.map((post, i) => (
              <tr
                key={post.id}
                className={`border-t border-[var(--border)] hover:bg-[var(--primary-glow)] transition-colors ${
                  i % 2 === 1 ? 'bg-[var(--surface2)]/50' : ''
                }`}
              >
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-[var(--text)] truncate max-w-[250px]">{post.title}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded border capitalize ${getRarityBadge(post.rarity)}`}>
                    {post.rarity}
                  </span>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <div className="flex gap-1 flex-wrap">
                    {post.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-xs px-1.5 py-0.5 rounded bg-[var(--surface3)] text-[var(--text-dim)]">#{tag}</span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded border ${
                    post.published
                      ? 'bg-[var(--accent-glow)] border-[var(--accent)] text-[var(--accent)]'
                      : 'bg-[var(--surface3)] border-[var(--border)] text-[var(--text-muted)]'
                  }`}>
                    {post.published ? '已发布' : '草稿'}
                  </span>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className="text-xs text-[var(--text-muted)] font-mono">{post.created_at}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link to={`/admin/posts/${post.id}/edit`} className="p-1.5 rounded hover:bg-[var(--surface2)] text-[var(--text-dim)] hover:text-[var(--primary)] transition-colors" title="编辑">
                      <Edit size={15} />
                    </Link>
                    <button onClick={() => togglePublish(post)} className="p-1.5 rounded hover:bg-[var(--surface2)] text-[var(--text-dim)] hover:text-[var(--accent)] transition-colors" title={post.published ? '设为草稿' : '发布'}>
                      {post.published ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                    <button onClick={() => setDeleteTarget(post)} className="p-1.5 rounded hover:bg-red-500/10 text-[var(--text-dim)] hover:text-red-500 transition-colors" title="删除">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredPosts.length === 0 && (
          <div className="text-center py-12 text-[var(--text-dim)]">没有找到符合条件的文章</div>
        )}
      </GameCard>

      <ConfirmDialog
        open={!!deleteTarget}
        title="删除文章"
        message={`确定要删除「${deleteTarget?.title}」吗？此操作不可撤销。`}
        confirmText="确认删除"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
