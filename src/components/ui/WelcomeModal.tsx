import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const hasBeenWelcomed = localStorage.getItem('welcomed');
    if (!hasBeenWelcomed) {
      const timer = setTimeout(() => setIsOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('welcomed', 'true');
  };

  const typewriter = {
    hidden: { opacity: 0 },
    visible: (i: number) => ({
      opacity: 1,
      transition: {
        delay: i * 0.1,
      },
    }),
  };

  const titleText = "欢迎来到 夏伍风屿 🏝️";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-[100] backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center z-[101] p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onAnimationComplete={() => setShowContent(true)}
              className="bg-[var(--surface)] w-full max-w-[480px] rounded-2xl shadow-2xl overflow-hidden pointer-events-auto border border-game-border relative"
            >
              {/* Header Decoration */}
              <div className="h-2 w-full bg-gradient-to-r from-game-primary to-game-accent" />
              
              <div className="p-8">
                <div className="text-center text-2xl mb-3 opacity-70">
                  🌊 🏝️ ⛵ 🌺 🦋
                </div>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-serif font-bold text-game-text mb-2">
                      {titleText.split("").map((char, i) => (
                        <motion.span
                          key={i}
                          custom={i}
                          initial="hidden"
                          animate="visible"
                          variants={typewriter}
                        >
                          {char}
                        </motion.span>
                      ))}
                    </h2>
                    <p className="text-game-primary font-mono text-sm">风屿岛主 Linqian007 的个人王国</p>
                  </div>
                  <button 
                    onClick={handleClose}
                    className="p-1 hover:bg-[var(--surface2)] rounded-full transition-colors text-game-textMuted"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-6">
                  <p className="text-game-textDim leading-relaxed">
                    这座小岛正在建设中，部分区域尚未开放<br />
                    岛主正在努力搭建每一片土地<br />
                    感谢你在这里留下足迹 ✨
                  </p>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono text-game-textMuted">
                      <span>王国建设进度</span>
                      <span>60%</span>
                    </div>
                    <div className="h-2 w-full bg-[var(--surface2)] rounded-full overflow-hidden border border-game-border/30">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={showContent ? { width: "60%" } : { width: 0 }}
                        transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-game-primary to-game-accent shadow-[0_0_8px_var(--primary-glow)]"
                      />
                    </div>
                    <p className="text-xs text-[var(--text-muted)] text-center mt-2">
                      海风轻拂，小岛正在生长 🌱
                    </p>
                  </div>

                  <button
                    onClick={handleClose}
                    className="w-full py-3 bg-[var(--surface2)] hover:bg-[var(--surface3)] border border-game-border rounded-xl text-game-primary font-bold transition-all hover:scale-[1.02] active:scale-[0.98] group"
                  >
                    开始探索 <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                  </button>
                </div>
              </div>

              {/* Background Decoration */}
              <div className="absolute bottom-0 right-0 text-6xl opacity-[0.06] pointer-events-none select-none leading-none">
                🏝️
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
