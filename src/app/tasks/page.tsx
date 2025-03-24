'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import HabitList from '@/components/habits/HabitList';
import HabitEditDialog from '@/components/habits/HabitEditDialog';
import { createHabit } from '@/services/habits';
import { CreateHabitRequest } from '@/types/habit';
import { toast } from 'react-hot-toast';

export default function TasksPage() {
  const router = useRouter();
  const { signOut } = useAuth();
  const [isHabitDialogOpen, setIsHabitDialogOpen] = useState(false);
  const habitListRef = useRef<{ loadHabits: () => Promise<void> } | null>(null);

  const handleSaveHabit = async (habitData: CreateHabitRequest) => {
    try {
      await createHabit(habitData);
      setIsHabitDialogOpen(false);
      toast.success('习惯创建成功！');
      // 刷新习惯列表
      if (habitListRef.current) {
        await habitListRef.current.loadHabits();
      }
    } catch (error) {
      console.error('创建习惯失败:', error);
      toast.error('创建习惯失败，请重试');
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 培养习惯板块 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">培养习惯</h2>
                <button
                  onClick={() => setIsHabitDialogOpen(true)}
                  className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  添加
                </button>
              </div>
              <HabitList ref={habitListRef} />
            </div>

            {/* 日常任务板块 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">日常任务</h2>
              <p className="text-gray-600">即将推出...</p>
            </div>

            {/* 待办事项板块 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">待办事项</h2>
              <p className="text-gray-600">即将推出...</p>
            </div>

            {/* 成长激励板块 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">成长激励</h2>
              <p className="text-gray-600">即将推出...</p>
            </div>
          </div>
        </div>
      </div>

      <HabitEditDialog
        isOpen={isHabitDialogOpen}
        onClose={() => setIsHabitDialogOpen(false)}
        onSave={handleSaveHabit}
      />
    </ProtectedRoute>
  );
} 