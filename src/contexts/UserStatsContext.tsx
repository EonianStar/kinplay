'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabase';

interface UserStats {
  totalHabits: number;
  goodHabits: number;
  badHabits: number;
  completedTasks: number;
  pendingTasks: number;
  totalPoints: number;
}

interface UserStatsContextType {
  stats: UserStats;
  loading: boolean;
  error: Error | null;
  refreshStats: () => Promise<void>;
}

const UserStatsContext = createContext<UserStatsContextType | undefined>(undefined);

export function UserStatsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats>({
    totalHabits: 0,
    goodHabits: 0,
    badHabits: 0,
    completedTasks: 0,
    pendingTasks: 0,
    totalPoints: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // 获取习惯统计
      const { data: habits, error: habitsError } = await supabase
        .from('habits')
        .select('nature')
        .eq('user_id', user.id);

      if (habitsError) throw habitsError;

      // 获取任务统计
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('status')
        .eq('user_id', user.id);

      if (tasksError) throw tasksError;

      // 获取用户积分
      const { data: points, error: pointsError } = await supabase
        .from('user_points')
        .select('total_points')
        .eq('user_id', user.id)
        .single();

      if (pointsError) throw pointsError;

      setStats({
        totalHabits: habits.length,
        goodHabits: habits.filter(h => h.nature.includes('good')).length,
        badHabits: habits.filter(h => h.nature.includes('bad')).length,
        completedTasks: tasks.filter(t => t.status === 'completed').length,
        pendingTasks: tasks.filter(t => t.status === 'pending').length,
        totalPoints: points?.total_points || 0,
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch stats'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user]);

  const refreshStats = async () => {
    setLoading(true);
    await fetchStats();
  };

  return (
    <UserStatsContext.Provider value={{ stats, loading, error, refreshStats }}>
      {children}
    </UserStatsContext.Provider>
  );
}

export function useUserStats() {
  const context = useContext(UserStatsContext);
  if (context === undefined) {
    throw new Error('useUserStats 必须在 UserStatsProvider 内部使用');
  }
  return context;
} 