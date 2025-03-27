'use client';

import { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import DailyEditDialog from './DailyEditDialog';
import { CreateDailyRequest } from '@/types/daily';

interface DailyQuickAddProps {
  onDailyCreated: (dailyData: CreateDailyRequest) => void;
}

export default function DailyQuickAdd({ onDailyCreated }: DailyQuickAddProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleSaveDaily = (dailyData: CreateDailyRequest) => {
    onDailyCreated(dailyData);
    setIsDialogOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpenDialog}
        className="w-full flex items-center justify-center py-2 px-4 border border-dashed border-gray-300 rounded-md text-sm text-gray-700 hover:border-indigo-500 hover:text-indigo-500"
      >
        <PlusIcon className="h-5 w-5 mr-2" />
        <span>添加日常任务</span>
      </button>

      <DailyEditDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveDaily}
      />
    </>
  );
} 