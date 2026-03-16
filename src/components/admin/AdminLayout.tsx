import { Outlet, NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutDashboard, FileText, Swords, Trophy, LogOut, ArrowLeft, Sun, Moon } from 'lucide-react';
import { useLocalStorage } from 'usehooks-ts';
import { useEffect } from 'react';

const sidebarItems = [
  { path: '/admin/dashboard', icon: <LayoutDashboard size={18} />, label: '📊 数据总览' },
  { path: '/admin/posts', icon: <FileText size={18} />, label: '📝 文章管理' },
  { path: '/admin/quests', icon: <Swords size={18} />, label: '⚔️ 任务管理' },
  { path: '/admin/achievements', icon: <Trophy size={18} />, label: '🏆 成就管理' },
];

export function AdminLayout() {
  const { profile, signOut } = useAuth();
  const [theme, setTheme] = useLocalStorage('game-theme', 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div className="min-h-screen flex bg-[var(--bg)]" style={{ backgroundImage: 'var(--bg-image)', backgroundSize: '40px 40px' }}>
      {/* Sidebar */}
      <aside className="w-[220px] fixed top-0 left-0 h-full bg-[var(--surface)] border-r border-[var(--border)] flex flex-col z-40">
        {/* Brand */}
        <div className="p-5 border-b border-[var(--border)]">
          <h1 className="font-serif font-bold text-[var(--text)] text-lg">🎮 后台管理</h1>
          <p className="text-xs text-[var(--text-muted)] mt-1 font-mono">Admin Panel v1.0</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {sidebarItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[var(--primary-glow)] text-[var(--primary)] border-l-[3px] border-l-[var(--primary)]'
                    : 'text-[var(--text-dim)] hover:bg-[var(--surface2)] hover:text-[var(--text)]'
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-[var(--border)] space-y-2">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-[var(--text-dim)] hover:text-[var(--primary)] transition-colors"
          >
            <ArrowLeft size={16} />
            返回前台
          </Link>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 ml-[220px]">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-[var(--surface)]/80 backdrop-blur-md border-b border-[var(--border)] px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${profile?.username || 'admin'}&backgroundColor=6366f1`}
              alt="Avatar"
              className="w-8 h-8 rounded-full border border-[var(--primary)]"
            />
            <div>
              <p className="text-sm font-medium text-[var(--text)]">{profile?.username || 'Admin'}</p>
              <p className="text-xs text-[var(--text-muted)] font-mono">Lv.{profile?.level || 1} · {profile?.title || '管理员'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
              className="p-2 rounded-lg border border-[var(--border)] text-[var(--text-dim)] hover:text-[var(--primary)] hover:border-[var(--primary)] transition-all"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-all"
            >
              <LogOut size={16} />
              退出
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
