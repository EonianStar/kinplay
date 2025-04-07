'use client';

import { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';

interface RewardQuickAddProps {
  onAdd: (title: string) => void;
}

export default function RewardQuickAdd({ onAdd }: RewardQuickAddProps) {
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
          placeholder="添加一个成长激励"
          className="w-full h-14 px-4 rounded-lg border border-gray-100 bg-white shadow-sm group-hover:shadow-md transition-all focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base placeholder-gray-400"
        />
        {title.trim() && (
          <button
            type="submit"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 rounded-full p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <PlusIcon className="h-4 w-4" />
          </button>
        )}
      </div>
    </form>
  );
} 