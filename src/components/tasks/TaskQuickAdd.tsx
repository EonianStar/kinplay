'use client';

import { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';

interface TaskQuickAddProps {
  onTaskCreated: (title: string) => void;
}

export default function TaskQuickAdd({ onTaskCreated }: TaskQuickAddProps) {
  const [title, setTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    onTaskCreated(title.trim());
    setTitle('');
    setIsAdding(false);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      {!isAdding ? (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="w-full flex items-center justify-center py-2 px-4 border border-dashed border-gray-300 rounded-md text-sm text-gray-700 hover:border-indigo-500 hover:text-indigo-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          <span>添加任务</span>
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <input
              type="text"
              placeholder="输入任务标题..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              autoFocus
            />
          </div>
          <div className="flex space-x-2">
            <button
              type="submit"
              disabled={!title.trim()}
              className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              添加
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setTitle('');
              }}
              className="inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-semibold text-gray-900 hover:bg-gray-50"
            >
              取消
            </button>
          </div>
        </form>
      )}
    </div>
  );
} 