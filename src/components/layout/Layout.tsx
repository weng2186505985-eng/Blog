import { Outlet, NavLink, Link } from 'react-router-dom';
import { User, ScrollText, Swords, Sparkles, Trophy, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useScroll, useSpring, motion } from 'framer-motion';
import { useLocalStorage } from 'usehooks-ts';

// For preview purpose, mock profile
const MOCK_PROFILE = {
  username: 'Linqian007',
  level: 42,
  exp: 4200,
  title: '传说',
  nextLevelExp: 4300
};

export function Layout() {
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useLocalStorage('game-theme', 'light');

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
    { path: '/', name: '王国入口', icon: <User size={18} /> },
    { path: '/blog', name: '冒险日志', icon: <ScrollText size={18} /> },
    { path: '/quests', name: '任务面板', icon: <Swords size={18} /> },
    { path: '/skills', name: '技能树', icon: <Sparkles size={18} /> },
    { path: '/achievements', name: '成就墙', icon: <Trophy size={18} /> },
  ];

  return (
    <div className="min-h-screen flex flex-col pt-20">
      {/* Scroll Progress Bar at very top */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-game-primary to-game-accent origin-left z-[60]"
        style={{ scaleX }}
      />

      {/* Floating Navbar with Glassmorphism */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[var(--nav-bg)] backdrop-blur-[20px] border-b border-game-border' : 'bg-transparent'}`}>
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex items-center gap-2">
              <img 
                src="https://api.dicebear.com/7.x/pixel-art/svg?seed=Linqian007&backgroundColor=6366f1" 
                alt="Avatar" 
                className="w-8 h-8 rounded-full border border-game-primary shadow-[0_0_0_2px_var(--primary-glow)] dark:shadow-[0_0_10px_var(--primary-glow)] group-hover:scale-105 transition-transform"
              />
              <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[var(--surface3)] text-game-primary border border-game-border">Lv.{MOCK_PROFILE.level}</span>
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-lg text-game-text leading-tight">{MOCK_PROFILE.username}</span>
              <span className="text-xs text-game-accent font-mono leading-tight">{MOCK_PROFILE.title}</span>
            </div>
          </Link>

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

            {/* Theme Toggle Button Layer 5 Animation */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full border border-game-border text-game-textMuted hover:text-game-primary hover:border-game-borderBright transition-all"
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
          </div>
        </div>
        
        {/* Global EXP Bar at the bottom of header */}
        <div className="w-full h-1 bg-game-border">
          <div 
            className="h-full bg-gradient-to-r from-game-primary to-game-accent exp-bar-fill"
            style={{ width: `${(MOCK_PROFILE.exp / MOCK_PROFILE.nextLevelExp) * 100}%` }}
          />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-4">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-game-border py-6 mt-12 bg-game-panel/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-game-textMuted font-mono">
          <p>System Version 1.0.0 // Player: {MOCK_PROFILE.username} // Status: ONLINE</p>
        </div>
      </footer>
    </div>
  );
}
