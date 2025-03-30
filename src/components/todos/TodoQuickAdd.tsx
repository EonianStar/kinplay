'use client';

import { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import TodoEditDialog from './TodoEditDialog';
import { CreateTodoRequest } from '@/types/todo';

interface TodoQuickAddProps {
  onSave: (todoData: CreateTodoRequest) => void;
}

const TodoQuickAdd = ({ onSave }: TodoQuickAddProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const handleSave = (todoData: CreateTodoRequest) => {
    onSave(todoData);
    setIsDialogOpen(false);
  };
  
  return (
    <div>
      <button
        type="button"
        onClick={() => setIsDialogOpen(true)}
        className="text-indigo-600 hover:text-indigo-800 focus:outline-none"
        aria-label="添加待办事项"
      >
        <PlusIcon className="h-5 w-5" />
      </button>
      
      <TodoEditDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
};

export default TodoQuickAdd; 