import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

type ViewportAnimProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function ViewportAnim({ children, delay = 0, className = '' }: ViewportAnimProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: delay / 1000, 
        ease: [0.34, 1.56, 0.64, 1]
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

type SlideAnimProps = {
  children: ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down';
  delay?: number;
  className?: string;
  duration?: number;
}

export function SlideAnim({ children, direction = 'left', delay = 0, className = '', duration = 0.5 }: SlideAnimProps) {
  const getInitial = () => {
    switch (direction) {
      case 'left': return { opacity: 0, x: -30 };
      case 'right': return { opacity: 0, x: 30 };
      case 'up': return { opacity: 0, y: 30 };
      case 'down': return { opacity: 0, y: -30 };
    }
  }

  return (
    <motion.div
      initial={getInitial()}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ 
        duration, 
        delay: delay / 1000, 
        ease: [0.34, 1.56, 0.64, 1] 
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
