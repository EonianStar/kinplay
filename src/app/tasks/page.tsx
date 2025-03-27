'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import HabitList from '@/components/habits/HabitList';
import HabitEditDialog from '@/components/habits/HabitEditDialog';
import DailyList from '@/components/dailies/DailyList';
import DailyEditDialog from '@/components/dailies/DailyEditDialog';
import DailyQuickAdd from '@/components/dailies/DailyQuickAdd';
import { createHabit } from '@/services/habits';
import { createDaily } from '@/services/dailies';
import { CreateHabitRequest } from '@/types/habit';
import { CreateDailyRequest, Daily, DailyDifficulty, DailyRepeatPeriod } from '@/types/daily';
import { toast } from 'react-hot-toast';

export default function TasksPage() {
  const router = useRouter();
  const { signOut } = useAuth();
  const [isHabitDialogOpen, setIsHabitDialogOpen] = useState(false);
  const [isDailyDialogOpen, setIsDailyDialogOpen] = useState(false);
  const habitListRef = useRef<{ loadHabits: () => Promise<void> } | null>(null);
  const dailyListRef = useRef<{ loadDailies: () => Promise<void> } | null>(null);

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

  const handleSaveDaily = async (dailyData: CreateDailyRequest | Partial<Daily>) => {
    try {
      // 类型检查，确保数据符合CreateDailyRequest类型
      console.log('准备创建日常任务:', JSON.stringify(dailyData, null, 2));
      if ('id' in dailyData) {
        // 如果包含id字段，说明是编辑现有任务，这里仅处理新建
        console.error('提供了ID，但这是创建操作');
        toast.error('操作失败：无法创建已有ID的任务');
        return;
      }
      await createDaily(dailyData as CreateDailyRequest);
      setIsDailyDialogOpen(false);
      toast.success('日常任务创建成功！');
      // 刷新日常任务列表
      if (dailyListRef.current) {
        await dailyListRef.current.loadDailies();
      }
    } catch (error: any) {
      console.error('创建日常任务失败:', error);
      console.error('错误详情:', error.message || '未知错误');
      if (error.details) {
        console.error('错误详情:', error.details);
      }
      toast.error(`创建日常任务失败: ${error.message || '请重试'}`);
    }
  };

  const handleQuickAddDaily = async (title: string) => {
    try {
      // 使用默认值创建日常任务
      const today = new Date().toISOString().split('T')[0];
      const dailyData: CreateDailyRequest = {
        title,
        description: '',
        difficulty: DailyDifficulty.MEDIUM, // 使用枚举类型
        start_date: today,
        repeat_period: DailyRepeatPeriod.DAILY, // 使用枚举类型
        active_pattern: { type: DailyRepeatPeriod.DAILY, value: 1 }, // 默认每日执行1次
        tags: []
      };
      
      await createDaily(dailyData);
      toast.success('日常任务创建成功！');
      
      // 刷新日常任务列表
      if (dailyListRef.current) {
        await dailyListRef.current.loadDailies();
      }
    } catch (error: any) {
      console.error('快速创建日常任务失败:', error);
      toast.error(`创建失败: ${error.message || '请重试'}`);
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
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">日常任务</h2>
                <button
                  onClick={() => setIsDailyDialogOpen(true)}
                  className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  添加
                </button>
              </div>
              <DailyQuickAdd onAdd={handleQuickAddDaily} />
              <DailyList ref={dailyListRef} />
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

      {/* 对话框放在顶层，确保全屏覆盖 */}
      <HabitEditDialog
        isOpen={isHabitDialogOpen}
        onClose={() => setIsHabitDialogOpen(false)}
        onSave={handleSaveHabit}
      />

      <DailyEditDialog
        isOpen={isDailyDialogOpen}
        onClose={() => setIsDailyDialogOpen(false)}
        onSave={handleSaveDaily}
      />
    </ProtectedRoute>
  );
} 