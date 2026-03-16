import { useState, useEffect } from 'react';
import { supabase, type Achievement } from '../../lib/supabase';
import { GameCard } from '../../components/ui/GameCard';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../contexts/ToastContext';
import { CardSkeleton } from '../../components/ui/Skeleton';
import { Plus, Lock, Unlock, X } from 'lucide-react';


const RARITY_OPTIONS = ['bronze', 'silver', 'gold', 'legend'] as const;
const rarityLabel: Record<string, string> = { bronze: '铜', silver: '银', gold: '金', legend: '传说' };

type FormData = { title: string; description: string; icon: string; rarity: string; unlock_condition: string; reward_exp: number; };
const emptyForm: FormData = { title: '', description: '', icon: '🏆', rarity: 'bronze', unlock_condition: '', reward_exp: 50 };

export function AchievementManager() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [confirmTarget, setConfirmTarget] = useState<{ ach: Achievement; action: 'unlock' | 'revoke' } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    supabase.from('achievements').select('*').order('rarity').then(({ data }) => {
      setAchievements(data ?? []);
      setLoading(false);
    });
  }, []);

  const handleToggleUnlock = async () => {
    if (!confirmTarget) return;
    const { ach, action } = confirmTarget;
    const newState = action === 'unlock';
    setAchievements(prev => prev.map(a => a.id === ach.id ? { ...a, is_unlocked: newState, unlocked_at: newState ? new Date().toISOString() : '' } : a));
    setConfirmTarget(null);
    await supabase.from('achievements').update({ is_unlocked: newState, unlocked_at: newState ? new Date().toISOString() : null }).eq('id', ach.id);
    toast(newState ? `已解锁「${ach.title}」🎉` : `已撤销「${ach.title}」`);
  };

  const handleCreate = async () => {
    if (!form.title.trim()) { toast('请填写成就名称', 'error'); return; }
    const newAch = { ...form, id: 'temp-' + Date.now(), is_unlocked: false, unlocked_at: '' } as unknown as Achievement;
    setAchievements(prev => [...prev, newAch]);
    setShowForm(false);
    setForm(emptyForm);
    await supabase.from('achievements').insert({ title: form.title, description: form.description, icon: form.icon, rarity: form.rarity, unlock_condition: form.unlock_condition, is_unlocked: false });
    toast('成就已创建');
  };

  const getRarityStyle = (rarity: string) => {
    const map: Record<string, string> = {
      bronze: 'border-[#b45309] text-[#92400e]',
      silver: 'border-[#64748b] text-[#475569]',
      gold: 'border-[#d97706] text-[#b45309]',
      legend: 'border-[#7c3aed] text-[#6d28d9]',
    };
    return map[rarity] || map.bronze;
  };

  if (loading) return <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-serif font-bold text-[var(--text)]">🏆 成就管理</h2>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90"><Plus size={16} /> 新增成就</button>
      </div>

      {showForm && (
        <GameCard className="border-l-4 border-l-[var(--gold)]">
          <div className="flex justify-between mb-4">
            <h3 className="font-bold text-[var(--text)]">新增成就</h3>
            <button onClick={() => setShowForm(false)}><X size={18} className="text-[var(--text-muted)]" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[var(--text-dim)] mb-1">成就名称</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-[var(--surface2)] border border-[var(--border)] text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]" />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-dim)] mb-1">图标 (emoji)</label>
              <input value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-[var(--surface2)] border border-[var(--border)] text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-[var(--text-dim)] mb-1">描述</label>
              <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-[var(--surface2)] border border-[var(--border)] text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]" />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-dim)] mb-1">稀有度</label>
              <div className="flex gap-2">
                {RARITY_OPTIONS.map(r => (
                  <button key={r} onClick={() => setForm(f => ({ ...f, rarity: r }))} className={`px-3 py-1 text-xs rounded-lg border transition-all ${form.rarity === r ? getRarityStyle(r) + ' bg-[var(--surface2)]' : 'border-[var(--border)] text-[var(--text-dim)]'}`}>
                    {rarityLabel[r]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs text-[var(--text-dim)] mb-1">奖励 EXP</label>
              <input type="number" value={form.reward_exp} onChange={e => setForm(f => ({ ...f, reward_exp: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-lg bg-[var(--surface2)] border border-[var(--border)] text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-[var(--text-dim)] mb-1">解锁条件说明</label>
              <input value={form.unlock_condition} onChange={e => setForm(f => ({ ...f, unlock_condition: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-[var(--surface2)] border border-[var(--border)] text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]" />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm rounded-lg border border-[var(--border)] text-[var(--text-dim)]">取消</button>
            <button onClick={handleCreate} className="px-4 py-2 text-sm rounded-lg bg-[var(--primary)] text-white font-medium hover:opacity-90">创建</button>
          </div>
        </GameCard>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map(ach => (
          <GameCard key={ach.id} className={`text-center border ${ach.is_unlocked ? getRarityStyle(ach.rarity) : 'border-dashed border-[var(--border)] opacity-60'}`}>
            <div className="text-4xl mb-3">{ach.is_unlocked ? ach.icon : '🔒'}</div>
            <h3 className={`font-bold text-sm mb-1 ${ach.is_unlocked ? 'text-[var(--text)]' : 'text-[var(--text-muted)]'}`}>{ach.is_unlocked ? ach.title : '???'}</h3>
            <p className="text-xs text-[var(--text-dim)] mb-3">{ach.description}</p>
            <span className={`inline-block text-xs px-2 py-0.5 rounded border mb-3 ${getRarityStyle(ach.rarity)}`}>{rarityLabel[ach.rarity]}</span>
            <div className="mt-2">
              {ach.is_unlocked ? (
                <button onClick={() => setConfirmTarget({ ach, action: 'revoke' })} className="flex items-center gap-1 mx-auto text-xs px-3 py-1 rounded border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                  <Lock size={12} /> 撤销解锁
                </button>
              ) : (
                <button onClick={() => setConfirmTarget({ ach, action: 'unlock' })} className="flex items-center gap-1 mx-auto text-xs px-3 py-1 rounded border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white transition-all">
                  <Unlock size={12} /> 手动解锁
                </button>
              )}
            </div>
          </GameCard>
        ))}
      </div>

      <ConfirmDialog
        open={!!confirmTarget}
        title={confirmTarget?.action === 'unlock' ? '解锁成就' : '撤销解锁'}
        message={confirmTarget?.action === 'unlock' ? `确认解锁「${confirmTarget?.ach.title}」？` : `确认撤销「${confirmTarget?.ach.title}」的解锁状态？`}
        confirmText="确认"
        danger={confirmTarget?.action === 'revoke'}
        onConfirm={handleToggleUnlock}
        onCancel={() => setConfirmTarget(null)}
      />
    </div>
  );
}
