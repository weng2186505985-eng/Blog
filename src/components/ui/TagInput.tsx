import { useState } from 'react';
import { X } from 'lucide-react';

type TagInputProps = {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
};

export function TagInput({ tags, onChange, placeholder = '输入标签后回车添加...' }: TagInputProps) {
  const [input, setInput] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = input.trim();
      if (trimmed && !tags.includes(trimmed)) {
        onChange([...tags, trimmed]);
      }
      setInput('');
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  const removeTag = (tag: string) => {
    onChange(tags.filter(t => t !== tag));
  };

  return (
    <div className="flex flex-wrap items-center gap-2 px-3 py-2 rounded-lg bg-[var(--surface2)] border border-[var(--border)] focus-within:border-[var(--primary)] focus-within:shadow-[var(--shadow-focus)] transition-all min-h-[42px]">
      {tags.map(tag => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-[var(--primary-glow)] text-[var(--primary)] border border-[var(--primary)]/20"
        >
          #{tag}
          <button onClick={() => removeTag(tag)} className="hover:text-red-500 transition-colors">
            <X size={12} />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[120px] bg-transparent text-sm text-[var(--text)] placeholder-[var(--text-muted)] outline-none"
      />
    </div>
  );
}
