import { Outlet, NavLink, Link } from 'react-router-dom';
import { User, ScrollText, Swords, Trophy, Sun, Moon, Menu, X, Settings } from 'lucide-react';
import { WelcomeModal } from '../ui/WelcomeModal';
import { useState, useEffect } from 'react';
import { useScroll, useSpring, motion, AnimatePresence } from 'framer-motion';
import { useLocalStorage } from 'usehooks-ts';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

// Fallback if DB is empty or unreachable
const FALLBACK_USERNAME = '冒险者';

export function Layout() {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useLocalStorage('game-theme', 'light');
  const { profile: authProfile, loading: authLoading } = useAuth();
  const [authorProfile, setAuthorProfile] = useState<any>(null);

  useEffect(() => {
    // If we're not logged in, we should at least show the blog owner's profile (the first admin)
    if (!authProfile && !authLoading) {
      supabase.from('profiles').select('*').eq('is_admin', true).limit(1).single().then(({ data }) => {
        if (data) setAuthorProfile(data);
      });
    }
  }, [authProfile, authLoading]);

  const activeProfile = authProfile || authorProfile;

  const displayProfile = {
    username: activeProfile?.username || FALLBACK_USERNAME,
    level: activeProfile?.level || 0,
    exp: activeProfile?.exp || 0,
    title: activeProfile?.title || '加载中...',
    nextLevelExp: (activeProfile?.level || 1) * 100 + 200
  };

  // Layer 5: Scroll Progress Bar
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sync theme with HTML attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(t => t === 'light' ? 'dark' : 'light');
  };

  const navItems = [
    { path: '/', name: '首页', icon: <User size={18} /> },
    { path: '/blog', name: '日志', icon: <ScrollText size={18} /> },
    { path: '/quests', name: '任务', icon: <Swords size={18} /> },
    { path: '/achievements', name: '成就', icon: <Trophy size={18} /> },
  ];

  return (
    <div className="min-h-screen flex flex-col pt-20 pb-[60px] md:pb-0">
      <WelcomeModal />
      {/* Scroll Progress Bar at very top */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-game-primary to-game-accent origin-left z-[60]"
        style={{ scaleX }}
      />

      {/* Floating Navbar with Glassmorphism */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[var(--nav-bg)] backdrop-blur-[20px] border-b border-game-border' : 'bg-transparent'}`}>
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="flex items-center gap-2">
                <img 
                  src="https://api.dicebear.com/7.x/pixel-art/svg?seed=Linqian007&backgroundColor=6366f1" 
                  alt="Avatar" 
                  className="w-8 h-8 rounded-full border border-game-primary shadow-[0_0_0_2px_var(--primary-glow)] dark:shadow-[0_0_10px_var(--primary-glow)] group-hover:scale-105 transition-transform"
                />
                <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[var(--surface3)] text-game-primary border border-game-border">Lv.{displayProfile.level}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-bold text-lg text-game-text leading-tight">{displayProfile.username}</span>
                <span className="text-xs text-game-accent font-mono leading-tight">🏝️ {displayProfile.title}</span>
              </div>
            </Link>

            {/* Admin Quick Entrance - Now closer to name */}
            {authProfile?.is_admin && (
              <div className="relative group/admin">
                <Link 
                  to="/admin/dashboard"
                  className="flex items-center justify-center w-[24px] h-[24px] md:w-[28px] md:h-[28px] rounded-full bg-gradient-to-br from-[#2ab8b0] to-[#f0a500] shadow-glow-primary transition-all duration-300 hover:rotate-90 hover:scale-110"
                >
                  <Settings size={12} className="text-white" />
                </Link>
                {/* Tooltip */}
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/admin:opacity-100 transition-opacity pointer-events-none whitespace-nowrap bg-game-panel border border-game-border px-2 py-1 rounded text-[10px] text-game-text font-bold shadow-xl z-[60]">
                  进入后台
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-[4px] border-transparent border-r-game-border mr-0" />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) => `relative flex items-center gap-2 px-3 py-2 rounded-md transition-colors duration-300 ${
                    isActive 
                      ? 'text-game-accent' 
                      : 'text-game-textMuted hover:text-game-text hover:bg-game-textMuted/10'
                  }`}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.div
                          layoutId="nav-indicator"
                          className="absolute inset-0 rounded-md bg-game-accentGlow border border-game-accent/30"
                          transition={{ type: "spring", stiffness: 350, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-2">
                        {item.icon}
                        <span className="text-sm font-medium">{item.name}</span>
                      </span>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Desktop Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="hidden md:block p-2 rounded-full border border-game-border text-game-textMuted hover:text-game-primary hover:border-game-borderBright transition-all"
              aria-label="Toggle Theme"
            >
              <motion.div
                initial={false}
                animate={{ rotate: theme === 'dark' ? 180 : 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </motion.div>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="md:hidden p-2 text-game-text hover:text-game-primary transition-colors"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
        
        {/* Global EXP Bar at the bottom of header */}
        <div className="w-full h-1 bg-game-border">
          <div 
            className="h-full bg-gradient-to-r from-game-primary to-game-accent exp-bar-fill"
            style={{ width: `${(displayProfile.exp / displayProfile.nextLevelExp) * 100}%` }}
          />
        </div>
        <div className="w-full h-[1px] bg-[repeating-linear-gradient(90deg,transparent,transparent_4px,rgba(42,184,176,0.15)_4px,rgba(42,184,176,0.15)_8px)]" />
      </header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black z-[100] md:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[280px] bg-[var(--surface)] z-[101] md:hidden shadow-2xl flex flex-col"
            >
              <div className="p-4 border-b border-game-border flex items-center justify-between">
                <span className="font-serif font-bold text-game-text">菜单导航</span>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 text-game-textMuted">
                  <X size={24} />
                </button>
              </div>
              <div className="flex-1 p-4 flex flex-col gap-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={({ isActive }) => `flex items-center gap-4 px-4 py-4 rounded-xl text-lg font-medium transition-colors ${
                      isActive ? 'bg-game-primary/10 text-game-primary border border-game-primary/30' : 'text-game-textDim hover:bg-[var(--surface2)]'
                    }`}
                  >
                    {item.icon}
                    {item.name}
                  </NavLink>
                ))}
              </div>
              <div className="p-4 border-t border-game-border">
                <button 
                  onClick={toggleTheme}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-[var(--surface2)] text-game-text"
                >
                  <span className="flex items-center gap-3">
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    {theme === 'dark' ? '切回浅色' : '切回深色'}
                  </span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-4">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="hidden md:block w-full border-t border-game-border py-6 mt-12 bg-game-panel/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-game-textMuted font-mono">
          <p>风吹过夏伍风屿 · 每一天都算数 // 守岛人：{displayProfile.username}</p>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 h-[60px] backdrop-blur-md bg-opacity-80 border-t border-[rgba(42,184,176,0.2)] bg-[rgba(240,249,248,0.92)] dark:bg-[rgba(10,31,31,0.92)] z-50 md:hidden flex items-center justify-around px-2">
        {navItems.slice(0, 4).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `flex flex-col items-center gap-1 transition-colors ${
              isActive ? 'text-game-primary' : 'text-game-textMuted'
            }`}
          >
            {item.icon}
            <span className="text-[10px] font-bold">{item.name}</span>
          </NavLink>
        ))}
        {/* Special treatment for achievements on mobile bottom bar if space allows, or skip the last one */}
        <NavLink
            to="/achievements"
            className={({ isActive }) => `flex flex-col items-center gap-1 transition-colors ${
              isActive ? 'text-game-primary' : 'text-game-textMuted'
            }`}
          >
            <Trophy size={18} />
            <span className="text-[10px] font-bold">成就</span>
          </NavLink>
      </nav>
    </div>
  );
}
