import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, ArrowLeft, Shield } from 'lucide-react';
import { GameCard } from '../components/ui/GameCard';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Convert username to email format for Supabase Auth
    const email = `${username.trim().toLowerCase()}@blog.local`;
    const { error } = await signIn(email, password);
    if (error) {
      setError(error.message || '登录失败，请检查账号密码');
      setLoading(false);
    } else {
      navigate('/admin');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] p-4" style={{ backgroundImage: 'var(--bg-image)', backgroundSize: '40px 40px' }}>
      <div className="w-full max-w-md space-y-6">
        <Link to="/" className="inline-flex items-center text-[var(--primary)] hover:text-[var(--accent)] transition-colors text-sm gap-1">
          <ArrowLeft size={16} /> 返回王国
        </Link>

        <GameCard className="!p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-[var(--primary-glow)] border border-[var(--primary)] flex items-center justify-center mx-auto mb-4">
              <Shield size={28} className="text-[var(--primary)]" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-[var(--text)]">管理员登录</h1>
            <p className="text-sm text-[var(--text-dim)] mt-2">需要管理员权限才能进入后台</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[var(--text-dim)] mb-1.5">用户名</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg bg-[var(--surface2)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] focus:shadow-[var(--shadow-focus)] transition-all"
                placeholder="Linqian007"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-dim)] mb-1.5">密码</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg bg-[var(--surface2)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] focus:shadow-[var(--shadow-focus)] transition-all"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-500">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-[var(--primary)] text-white font-medium transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={18} />
                  进入后台
                </>
              )}
            </button>
          </form>
        </GameCard>
      </div>
    </div>
  );
}
