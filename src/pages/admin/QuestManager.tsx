import { useState, useEffect } from 'react';
import { supabase, type Quest } from '../../lib/supabase';
import { GameCard } from '../../components/ui/GameCard';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../contexts/ToastContext';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { Plus, Check, Trash2, Edit, Star, X } from 'lucide-react';


type FormData = { title: string; description: string; type: 'main' | 'side'; status: 'in_progress' | 'completed' | 'abandoned'; difficulty: number; reward_exp: number; start_date: string; end_date: string; };
const emptyForm: FormData = { title: '', description: '', type: 'side', status: 'in_progress', difficulty: 1, reward_exp: 50, start_date: '', end_date: '' };

export function QuestManager() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'main' | 'side'>('main');
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Quest | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    supabase.from('quests').select('*').order('start_date', { ascending: false }).then(({ data }) => {
      setQuests(data ?? []);
      setLoading(false);
    });
  }, []);

  const filtered = quests.filter(q => q.type === tab);
  const statusBadge = (s: string) => s === 'completed' ? 'bg-[var(--accent-glow)] text-[var(--accent)] border-[var(--accent)]' : s === 'in_progress' ? 'bg-[var(--primary-glow)] text-[var(--primary)] border-[var(--primary)]' : 'bg-[var(--surface3)] text-[var(--text-muted)] border-[var(--border)]';

  const openNew = () => { setEditing(null); setForm({ ...emptyForm, type: tab }); setShowForm(true); };
  const openEdit = (q: Quest) => { setEditing(q.id); setForm({ title: q.title, description: q.description, type: q.type, status: q.status, difficulty: q.difficulty, reward_exp: q.reward_exp, start_date: q.start_date || '', end_date: q.end_date || '' }); setShowForm(true); };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast('请填写任务名称', 'error');
      return;
    }

    // Convert empty strings to null for date fields to avoid DB errors
    const saveForm = {
      ...form,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
    };

    try {
      let levelData = null;
      let userData = null;

      if (editing) {
        const oldQuest = quests.find(q => q.id === editing);
        const { error } = await supabase.from('quests').update(saveForm).eq('id', editing);
        if (error) throw error;
        
        // EXP Rollback/Gain logic
        if (oldQuest && oldQuest.status !== saveForm.status) {
          const { data } = await supabase.from('profiles').select('id').eq('is_admin', true).single();
          userData = data;
          if (userData) {
            if (saveForm.status === 'completed') {
              ({ data: levelData } = await supabase.rpc('add_exp_v2', { target_user_id: userData.id, src_type: 'quest', src_id: editing, src_title: saveForm.title, amount: saveForm.reward_exp }));
            } else if (oldQuest.status === 'completed') {
              ({ data: levelData } = await supabase.rpc('revoke_exp_v2', { target_user_id: userData.id, src_type: 'quest', src_id: editing }));
            }
          }
        }

        setQuests(prev => prev.map(q => q.id === editing ? { ...q, ...saveForm } as Quest : q));
        toast('任务已更新');
      } else {
        const { data, error } = await supabase.from('quests').insert(saveForm).select().single();
        if (error) throw error;
        
        if (data) {
          setQuests(prev => [data, ...prev]);
          if (saveForm.status === 'completed') {
            const { data: uData } = await supabase.from('profiles').select('id').eq('is_admin', true).single();
            if (uData) {
              ({ data: levelData } = await supabase.rpc('add_exp_v2', { target_user_id: uData.id, src_type: 'quest', src_id: data.id, src_title: saveForm.title, amount: saveForm.reward_exp }));
            }
          }
        }
        toast('任务已创建');
      }

      if (levelData && levelData[0]) {
        const { old_level, new_level } = levelData[0];
        if (new_level > old_level) toast(`🎉 恭喜升级！Lv.${old_level} → Lv.${new_level}`, 'success');
        else if (new_level < old_level) toast(`📉 等级下降至 Lv.${new_level}`, 'error');
      }

      setShowForm(false);
    } catch (error: any) {
      console.error('Failed to save quest:', error);
      toast(error.message || '保存失败，请稍后重试', 'error');
    }
  };

  const quickComplete = async (q: Quest) => {
    setQuests(prev => prev.map(x => x.id === q.id ? { ...x, status: 'completed' as const } : x));
    await supabase.from('quests').update({ status: 'completed', end_date: new Date().toISOString() }).eq('id', q.id);
    
    const { data: userData } = await supabase.from('profiles').select('id').eq('is_admin', true).single();
    if (userData) {
      const { data: levelData } = await supabase.rpc('add_exp_v2', {
        target_user_id: userData.id,
        src_type: 'quest',
        src_id: q.id,
        src_title: q.title,
        amount: q.reward_exp
      });
      if (levelData && levelData[0]) {
        const { old_level, new_level } = levelData[0];
        if (new_level > old_level) toast(`🎉 恭喜升级！Lv.${old_level} → Lv.${new_level}`, 'success');
      }
    }
    
    toast(`任务完成！获得 ${q.reward_exp} EXP 🎉`);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setQuests(prev => prev.filter(q => q.id !== deleteTarget.id));
    setDeleteTarget(null);
    await supabase.from('quests').delete().eq('id', deleteTarget.id);
    toast('任务已删除');
  };

  if (loading) return <TableSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-serif font-bold text-[var(--text)]">⚔️ 任务管理</h2>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90"><Plus size={16} /> 新增</button>
      </div>

      <div className="flex gap-1 bg-[var(--surface2)] rounded-lg p-1 w-fit">
        {(['main', 'side'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 text-sm rounded-md transition-all ${tab === t ? 'bg-[var(--primary)] text-white' : 'text-[var(--text-dim)]'}`}>
            {t === 'main' ? '主线任务' : '支线任务'}
          </button>
        ))}
      </div>

      {showForm && (
        <GameCard className="border-l-4 border-l-[var(--primary)]">
          <div className="flex justify-between mb-4">
            <h3 className="font-bold text-[var(--text)]">{editing ? '编辑任务' : '新增任务'}</h3>
            <button onClick={() => setShowForm(false)}><X size={18} className="text-[var(--text-muted)]" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[var(--text-dim)] mb-1">任务名称</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-[var(--surface2)] border border-[var(--border)] text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]" />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-dim)] mb-1">奖励 EXP</label>
              <input type="number" value={form.reward_exp} onChange={e => setForm(f => ({ ...f, reward_exp: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-lg bg-[var(--surface2)] border border-[var(--border)] text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]" />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-dim)] mb-1">任务类型</label>
              <div className="flex gap-2">
                {(['main', 'side'] as const).map(t => (
                  <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))} className={`px-3 py-1 text-xs rounded-lg border ${form.type === t ? 'bg-[var(--primary)] text-white border-[var(--primary)]' : 'border-[var(--border)] text-[var(--text-dim)]'}`}>
                    {t === 'main' ? '主线任务' : '支线任务'}
                  </button>
                ))}
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-[var(--text-dim)] mb-1">描述</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-lg bg-[var(--surface2)] border border-[var(--border)] text-sm text-[var(--text)] outline-none focus:border-[var(--primary)] resize-none" />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-dim)] mb-1">状态</label>
              <div className="flex gap-2">
                {(['in_progress', 'completed', 'abandoned'] as const).map(s => (
                  <button key={s} onClick={() => setForm(f => ({ ...f, status: s }))} className={`px-3 py-1 text-xs rounded-lg border ${form.status === s ? statusBadge(s) : 'border-[var(--border)] text-[var(--text-dim)]'}`}>
                    {s === 'in_progress' ? '进行中' : s === 'completed' ? '已完成' : '已放弃'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs text-[var(--text-dim)] mb-1">难度</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} onClick={() => setForm(f => ({ ...f, difficulty: n }))}>
                    <Star size={20} className={n <= form.difficulty ? 'fill-[var(--gold)] text-[var(--gold)]' : 'text-[var(--border)]'} />
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm rounded-lg border border-[var(--border)] text-[var(--text-dim)]">取消</button>
            <button onClick={handleSave} className="px-4 py-2 text-sm rounded-lg bg-[var(--primary)] text-white font-medium hover:opacity-90">保存</button>
          </div>
        </GameCard>
      )}

      <GameCard className="!p-0 overflow-hidden">
        <table className="w-full">
          <thead><tr className="bg-[var(--surface2)]">
            <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-dim)]">任务名</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-dim)]">状态</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-dim)] hidden md:table-cell">难度</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-dim)] hidden md:table-cell">奖励</th>
            <th className="text-right px-4 py-3 text-xs font-medium text-[var(--text-dim)]">操作</th>
          </tr></thead>
          <tbody>
            {filtered.map((q, i) => (
              <tr key={q.id} className={`border-t border-[var(--border)] hover:bg-[var(--primary-glow)] ${i % 2 === 1 ? 'bg-[var(--surface2)]/50' : ''}`}>
                <td className="px-4 py-3"><p className={`text-sm font-medium ${q.status === 'completed' ? 'text-[var(--text-dim)] line-through' : 'text-[var(--text)]'}`}>{q.title}</p></td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded border ${statusBadge(q.status)}`}>{q.status === 'in_progress' ? '进行中' : q.status === 'completed' ? '已完成' : '已放弃'}</span></td>
                <td className="px-4 py-3 hidden md:table-cell"><div className="flex gap-0.5">{[1,2,3,4,5].map(n => <Star key={n} size={12} className={n <= q.difficulty ? 'fill-[var(--gold)] text-[var(--gold)]' : 'text-[var(--border)]'} />)}</div></td>
                <td className="px-4 py-3 hidden md:table-cell"><span className="text-xs font-mono text-[var(--primary)]">+{q.reward_exp} EXP</span></td>
                <td className="px-4 py-3"><div className="flex items-center justify-end gap-1">
                  {q.status === 'in_progress' && <button onClick={() => quickComplete(q)} className="p-1.5 rounded hover:bg-[var(--accent-glow)] text-[var(--text-dim)] hover:text-[var(--accent)]" title="完成"><Check size={15} /></button>}
                  <button onClick={() => openEdit(q)} className="p-1.5 rounded hover:bg-[var(--surface2)] text-[var(--text-dim)] hover:text-[var(--primary)]" title="编辑"><Edit size={15} /></button>
                  <button onClick={() => setDeleteTarget(q)} className="p-1.5 rounded hover:bg-red-500/10 text-[var(--text-dim)] hover:text-red-500" title="删除"><Trash2 size={15} /></button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center py-12 text-[var(--text-dim)]">暂无{tab === 'main' ? '主线' : '支线'}任务</div>}
      </GameCard>

      <ConfirmDialog open={!!deleteTarget} title="删除任务" message={`确定要删除「${deleteTarget?.title}」吗？`} confirmText="确认删除" danger onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}
