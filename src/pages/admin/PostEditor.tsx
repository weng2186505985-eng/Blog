import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { supabase } from '../../lib/supabase';
import { GameCard } from '../../components/ui/GameCard';
import { TagInput } from '../../components/ui/TagInput';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../contexts/ToastContext';
import { Save, Upload, Trash2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const RARITY_OPTIONS = [
  { value: 'common', label: 'Common', color: 'var(--common)' },
  { value: 'rare', label: 'Rare', color: 'var(--rare)' },
  { value: 'epic', label: 'Epic', color: 'var(--epic)' },
  { value: 'legendary', label: 'Legendary', color: 'var(--legendary)' },
] as const;

type PostForm = {
  title: string;
  content: string;
  tags: string[];
  rarity: string;
  published: boolean;
};

const DRAFT_KEY = 'admin-post-draft';

export function PostEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = !!id;

  const [form, setForm] = useState<PostForm>({
    title: '',
    content: '',
    tags: [],
    rarity: 'common',
    published: false,
  });
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showDraftRecovery, setShowDraftRecovery] = useState(false);
  const autoSaveRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load post data for editing
  useEffect(() => {
    if (isEdit) {
      supabase.from('posts').select('*').eq('id', id).single().then(({ data }) => {
        if (data) {
          setForm({
            title: data.title,
            content: data.content,
            tags: data.tags || [],
            rarity: data.rarity,
            published: data.published,
          });
        }
      });
    } else {
      // Check for saved draft
      const savedDraft = localStorage.getItem(DRAFT_KEY);
      if (savedDraft) {
        setShowDraftRecovery(true);
      }
    }
  }, [id, isEdit]);

  // Auto-save draft every 30s
  useEffect(() => {
    if (!isEdit) {
      autoSaveRef.current = setInterval(() => {
        if (form.title || form.content) {
          localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
        }
      }, 30000);
    }
    return () => {
      if (autoSaveRef.current) clearInterval(autoSaveRef.current);
    };
  }, [form, isEdit]);

  const recoverDraft = () => {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) {
      setForm(JSON.parse(saved));
    }
    setShowDraftRecovery(false);
  };

  const handleSave = async (publish: boolean) => {
    if (!form.title.trim()) {
      toast('请填写文章标题', 'error');
      return;
    }
    setSaving(true);

    const payload = {
      title: form.title,
      content: form.content,
      summary: form.content.slice(0, 100),
      tags: form.tags,
      rarity: form.rarity,
      published: publish,
      read_time: Math.max(1, Math.ceil(form.content.length / 500)),
    };

    let error;
    if (isEdit) {
      ({ error } = await supabase.from('posts').update(payload).eq('id', id));
    } else {
      ({ error } = await supabase.from('posts').insert(payload));
    }

    setSaving(false);

    if (error) {
      toast('保存失败：' + error.message, 'error');
    } else {
      localStorage.removeItem(DRAFT_KEY);
      toast(publish ? '文章已发布 🎉' : '草稿已保存');
      navigate('/admin/posts');
    }
  };

  const handleDelete = async () => {
    setShowDelete(false);
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) {
      toast('删除失败', 'error');
    } else {
      toast('文章已删除');
      navigate('/admin/posts');
    }
  };

  return (
    <div className="space-y-4">
      <Link to="/admin/posts" className="inline-flex items-center gap-1 text-sm text-[var(--primary)] hover:text-[var(--accent)] transition-colors">
        <ArrowLeft size={16} /> 返回文章列表
      </Link>

      <h2 className="text-2xl font-serif font-bold text-[var(--text)]">
        {isEdit ? '✏️ 编辑文章' : '✍️ 新建文章'}
      </h2>

      {/* Draft Recovery Banner */}
      {showDraftRecovery && (
        <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--primary-glow)] border border-[var(--primary)]/20">
          <span className="text-sm text-[var(--text)]">🔄 发现未保存的草稿，是否恢复？</span>
          <div className="flex gap-2">
            <button onClick={recoverDraft} className="text-xs px-3 py-1 rounded bg-[var(--primary)] text-white">恢复</button>
            <button onClick={() => { setShowDraftRecovery(false); localStorage.removeItem(DRAFT_KEY); }} className="text-xs px-3 py-1 rounded border border-[var(--border)] text-[var(--text-dim)]">丢弃</button>
          </div>
        </div>
      )}

      {/* Editor Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[600px]">
        {/* Left: Form */}
        <div className="space-y-4">
          <GameCard>
            {/* Title */}
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="文章标题..."
              className="w-full text-xl font-bold bg-transparent text-[var(--text)] placeholder-[var(--text-muted)] outline-none mb-4"
            />

            {/* Rarity Selector */}
            <label className="block text-xs font-medium text-[var(--text-dim)] mb-2">稀有度</label>
            <div className="flex gap-2 mb-4">
              {RARITY_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setForm(f => ({ ...f, rarity: opt.value }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    form.rarity === opt.value
                      ? 'text-white shadow-sm'
                      : 'text-[var(--text-dim)] border-[var(--border)] hover:border-[var(--border-bright)]'
                  }`}
                  style={form.rarity === opt.value ? { backgroundColor: opt.color, borderColor: opt.color } : {}}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Tags */}
            <label className="block text-xs font-medium text-[var(--text-dim)] mb-2">标签</label>
            <div className="mb-4">
              <TagInput tags={form.tags} onChange={tags => setForm(f => ({ ...f, tags }))} />
            </div>

            {/* Publish Toggle */}
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                className={`w-11 h-6 rounded-full relative transition-colors ${form.published ? 'bg-[var(--accent)]' : 'bg-[var(--surface3)]'}`}
                onClick={() => setForm(f => ({ ...f, published: !f.published }))}
              >
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.published ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
              </div>
              <span className="text-sm text-[var(--text-dim)]">{form.published ? '已发布' : '草稿'}</span>
            </label>
          </GameCard>

          {/* Markdown Editor */}
          <GameCard className="!p-0 flex-1">
            <textarea
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              placeholder="在此编写 Markdown 正文..."
              className="w-full h-[400px] p-5 bg-transparent text-sm text-[var(--text)] placeholder-[var(--text-muted)] font-mono resize-none outline-none leading-relaxed"
            />
          </GameCard>
        </div>

        {/* Right: Live Preview */}
        <GameCard className="overflow-y-auto max-h-[calc(100vh-200px)]">
          <h3 className="text-xs font-medium text-[var(--text-muted)] uppercase mb-4 tracking-wider">预览</h3>
          {form.title ? (
            <div>
              <h1 className="text-2xl font-serif font-bold text-[var(--text)] mb-4">{form.title}</h1>
              <div className="flex gap-2 mb-4">
                {form.tags.map(tag => (
                  <span key={tag} className="text-xs px-2 py-0.5 rounded bg-[var(--surface3)] text-[var(--text-dim)]">#{tag}</span>
                ))}
              </div>
              <div className="prose dark:prose-invert prose-p:text-[var(--text-dim)] prose-headings:text-[var(--text)] prose-headings:font-serif prose-a:text-[var(--primary)] prose-code:text-[var(--accent)] prose-pre:bg-[var(--surface2)] prose-pre:border prose-pre:border-[var(--border)] max-w-none">
                <ReactMarkdown>{form.content}</ReactMarkdown>
              </div>
            </div>
          ) : (
            <p className="text-[var(--text-muted)] text-sm text-center py-12">输入标题和内容后这里将显示实时预览...</p>
          )}
        </GameCard>
      </div>

      {/* Bottom Action Bar */}
      <div className="sticky bottom-0 bg-[var(--surface)] border-t border-[var(--border)] py-3 px-4 -mx-6 flex items-center justify-between rounded-t-lg shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        <div>
          {isEdit && (
            <button
              onClick={() => setShowDelete(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-all"
            >
              <Trash2 size={15} /> 删除文章
            </button>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-[var(--border)] text-[var(--text-dim)] hover:bg-[var(--surface2)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={15} /> 保存草稿
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-[var(--primary)] text-white font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Upload size={15} />}
            发布文章
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={showDelete}
        title="删除文章"
        message={`确定要删除「${form.title}」吗？此操作不可撤销。`}
        confirmText="确认删除"
        danger
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
}
