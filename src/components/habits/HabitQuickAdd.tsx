import { useState } from 'react';

interface HabitQuickAddProps {
  onAdd: (title: string) => void;
}

export default function HabitQuickAdd({ onAdd }: HabitQuickAddProps) {
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd(title.trim());
      setTitle('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-3">
      <div className="relative group">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="添加一个习惯"
          className="w-full h-14 px-4 rounded-lg border border-gray-100 bg-white shadow-sm group-hover:shadow-md transition-all focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base placeholder-gray-400"
          autoComplete="off"
        />
        <button
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-indigo-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ display: title.trim() ? 'flex' : 'none' }}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </form>
  );
} 