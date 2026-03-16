import { useState, useRef, useEffect } from 'react';
import { ExpBar } from '../components/ui/ExpBar';
import { SlideAnim } from '../components/ui/Animations';
import { motion } from 'framer-motion';

const MOCK_SKILLS = [
  // 术法之道 (Tech)
  { id: 't1', x: 200, y: 50, name: '基础咒语 (HTML/CSS)', branch: 'tech', prof: 100, type: 'core', level: 0 },
  { id: 't2', x: 100, y: 150, name: 'UI 幻术 (Tailwind)', branch: 'tech', prof: 85, type: 'node', parent: 't1', level: 1 },
  { id: 't3', x: 300, y: 150, name: '逻辑构建 (JavaScript)', branch: 'tech', prof: 90, type: 'node', parent: 't1', level: 1 },
  { id: 't4', x: 200, y: 250, name: '组件装配 (React)', branch: 'tech', prof: 95, type: 'core', parent: 't3', level: 2 },
  { id: 't5', x: 200, y: 350, name: '类型契约 (TypeScript)', branch: 'tech', prof: 88, type: 'node', parent: 't4', level: 3 },
  { id: 't6', x: 100, y: 450, name: '全栈架构 (Next.js)', branch: 'tech', prof: 75, type: 'node', parent: 't5', level: 4 },
  { id: 't7', x: 300, y: 450, name: '数据神龛 (Supabase)', branch: 'tech', prof: 80, type: 'node', parent: 't5', level: 4 },

  // 创世之道 (Creative)
  { id: 'c1', x: 600, y: 50, name: '产品共鸣 (Product Sense)', branch: 'creative', prof: 80, type: 'core', level: 0 },
  { id: 'c2', x: 500, y: 150, name: '像素美学 (Figma UI)', branch: 'creative', prof: 70, type: 'node', parent: 'c1', level: 1 },
  { id: 'c3', x: 700, y: 150, name: '交互脉络 (UX Design)', branch: 'creative', prof: 85, type: 'node', parent: 'c1', level: 1 },
  { id: 'c4', x: 600, y: 250, name: '系统化设计 (Design System)', branch: 'creative', prof: 60, type: 'core', parent: 'c2', level: 2 },
];

export function Skills() {
  const [isReady, setIsReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          setIsReady(true);
        }
      }
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const renderLines = () => {
    return MOCK_SKILLS.map(skill => {
      if (!skill.parent) return null;
      const parent = MOCK_SKILLS.find(s => s.id === skill.parent);
      if (!parent) return null;
      
      const color = skill.prof > 0 ? 'var(--border-bright)' : 'var(--border)';
      
      const delayOffset = ((parent.level || 0) + (skill.level || 0)) * 0.2; 
      
      return (
        <motion.line 
          key={`line-${skill.id}`}
          x1={parent.x} 
          y1={parent.y} 
          x2={skill.x} 
          y2={skill.y} 
          stroke={color} 
          strokeWidth="3"
          className={skill.prof === 100 ? "drop-shadow-[0_0_5px_var(--primary-glow)]" : ""}
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, margin: "100px" }}
          transition={{ duration: 1.2, delay: delayOffset + 0.5, ease: "easeOut" }}
        />
      );
    });
  };

  const renderNodes = () => {
    return MOCK_SKILLS.map(skill => {
      const isTech = skill.branch === 'tech';
      const textClass = isTech ? 'text-game-primary' : 'text-game-accent';
      const isUnlocked = skill.prof > 0;
      const borderClass = isUnlocked ? 'border-2 border-solid border-game-primary' : 'border-2 border-dashed border-game-borderBright';
      const bgClass = isUnlocked ? 'bg-[var(--surface)]' : 'bg-[var(--surface2)]';
      const opacityClass = isUnlocked ? 'opacity-100' : 'opacity-60 grayscale';
      const shadowClass = isTech ? 'shadow-glow-primary' : 'shadow-glow-accent';
      const isCore = skill.type === 'core';
      
      const sizeClass = isCore ? 'w-32 h-16' : 'w-24 h-12';

      return (
        <motion.div 
          key={skill.id}
          className={`absolute flex flex-col items-center justify-center text-center p-2 group 
            ${sizeClass} ${textClass} ${bgClass} ${borderClass} ${opacityClass}
            rounded-lg backdrop-blur-md cursor-help ${isUnlocked ? shadowClass + ' hover:scale-105 active:scale-95 transition-all duration-200 animate-[float-simple_3s_ease-in-out_infinite]' : 'transition-transform duration-200'}
          `}
          style={{
            left: `${skill.x}px`,
            top: `${skill.y}px`,
            transform: 'translate(-50%, -50%)',
          }}
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, margin: "100px" }}
          transition={{ type: "spring", bounce: 0.5, delay: (skill.level || 0) * 0.2 + 0.6 }}
        >
          <span className={`text-xs font-bold leading-tight ${isCore ? 'text-sm' : ''} drop-shadow-md`}>{skill.name}</span>
          {isUnlocked && (
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-48 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
               <div className="p-2 border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)] rounded mt-2">
                 <ExpBar current={skill.prof} max={100} label="熟练度" />
               </div>
            </div>
          )}
        </motion.div>
      );
    });
  };

  return (
    <div className="max-w-5xl mx-auto">
      <SlideAnim direction="up" delay={100}>
        <header className="text-center mb-12">
          <h1 className="text-3xl font-serif text-game-text font-bold mb-4">
            技能树系统 (Skill Matrix)
          </h1>
          <div className="flex justify-center gap-8 mt-4 font-mono text-sm">
            <span className="text-game-primary flex items-center gap-2">
              <span className="w-3 h-3 bg-game-primary rounded-sm shadow-glow-primary"></span>
              术法之道 (Tech)
            </span>
            <span className="text-game-accent flex items-center gap-2">
              <span className="w-3 h-3 bg-game-accent rounded-sm shadow-glow-accent"></span>
              创世之道 (Creative)
            </span>
          </div>
        </header>
      </SlideAnim>

      <div className="relative w-full overflow-x-auto min-h-[600px] flex justify-center bg-[var(--surface2)] border border-[var(--border)] rounded-xl mt-8">
        <div ref={containerRef} className="relative w-[800px] h-[600px] flex-shrink-0 my-8">
          {isReady && (
            <>
              {/* SVG Canvas for Lines */}
              <svg width="100%" height="100%" className="absolute inset-0 pointer-events-none">
                {renderLines()}
              </svg>
              
              {/* HTML Nodes overlay */}
              {renderNodes()}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
