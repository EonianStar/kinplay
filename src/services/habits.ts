import { supabase } from '@/lib/supabase';
import { 
  Habit, 
  CreateHabitRequest, 
  UpdateHabitRequest,
  HabitNature,
  HabitDifficulty,
  HabitResetPeriod
} from '@/types/habit';

export async function getHabits(): Promise<Habit[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('用户未登录');
  }

  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('获取习惯列表失败:', error);
    throw error;
  }

  return data || [];
}

export async function getHabit(id: string): Promise<Habit> {
  const { data: habit, error } = await supabase
    .from('habits')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching habit:', error);
    throw error;
  }

  return habit;
}

export async function createHabit(habitData: CreateHabitRequest): Promise<Habit> {
  try {
    // 验证用户登录状态
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('用户未登录');
    }

    // 验证必填字段
    if (!habitData.title?.trim()) {
      throw new Error('习惯标题不能为空');
    }

    if (!habitData.nature || habitData.nature.length === 0) {
      throw new Error('请选择习惯性质');
    }

    if (!habitData.difficulty) {
      throw new Error('请选择习惯难度');
    }

    if (!habitData.reset_period) {
      throw new Error('请选择重置周期');
    }

    // 格式化数据
    const formattedData = {
      title: habitData.title.trim(),
      description: habitData.description?.trim() || null,
      nature: Array.isArray(habitData.nature) 
        ? habitData.nature
        : [habitData.nature],
      difficulty: habitData.difficulty,
      tags: Array.isArray(habitData.tags) ? habitData.tags.filter(Boolean) : [],
      reset_period: habitData.reset_period,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      good_count: Math.max(0, Math.min(999, habitData.good_count || 0)),
      bad_count: Math.max(0, Math.min(999, habitData.bad_count || 0)),
    };

    console.log('Creating habit with formatted data:', formattedData);

    // 插入数据
    const { data, error } = await supabase
      .from('habits')
      .insert([formattedData])
      .select()
      .single();

    if (error) {
      console.error('数据库插入失败:', error);
      throw new Error('创建习惯失败: ' + error.message);
    }

    if (!data) {
      throw new Error('创建习惯失败: 未返回数据');
    }

    console.log('Successfully created habit:', data);
    return data;
  } catch (error) {
    console.error('创建习惯时发生错误:', error);
    throw error;
  }
}

export async function updateHabit(id: string, habit: UpdateHabitRequest): Promise<Habit> {
  try {
    console.log('开始更新习惯，ID:', id);
    console.log('更新数据:', habit);

    // 验证用户登录状态
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('用户未登录');
    }

    console.log('当前用户ID:', user.id);

    // 检查习惯是否存在
    const { data: existingHabit, error: checkError } = await supabase
      .from('habits')
      .select('*')
      .eq('id', id)
      .single();

    if (checkError) {
      console.error('检查习惯时出错:', checkError);
      throw new Error('习惯不存在或无法访问');
    }

    console.log('现有习惯数据:', existingHabit);

    // 执行更新
    const { data, error } = await supabase
      .from('habits')
      .update(habit)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('更新习惯时出错:', error);
      throw error;
    }

    console.log('更新成功，返回数据:', data);
    return data;
  } catch (error) {
    console.error('更新习惯过程中发生错误:', error);
    throw error;
  }
}

export async function deleteHabit(id: number): Promise<void> {
  const { error } = await supabase
    .from('habits')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('删除习惯失败:', error);
    throw error;
  }
}

export async function incrementGoodCount(id: number): Promise<void> {
  // 先获取当前计数
  const { data: habit, error: fetchError } = await supabase
    .from('habits')
    .select('good_count')
    .eq('id', id)
    .single();

  if (fetchError) {
    console.error('获取习惯计数失败:', fetchError);
    throw fetchError;
  }

  // 更新计数
  const { error: updateError } = await supabase
    .from('habits')
    .update({ good_count: (habit?.good_count || 0) + 1 })
    .eq('id', id);

  if (updateError) {
    console.error('增加好习惯计数失败:', updateError);
    throw updateError;
  }
}

export async function incrementBadCount(id: number): Promise<void> {
  // 先获取当前计数
  const { data: habit, error: fetchError } = await supabase
    .from('habits')
    .select('bad_count')
    .eq('id', id)
    .single();

  if (fetchError) {
    console.error('获取习惯计数失败:', fetchError);
    throw fetchError;
  }

  // 更新计数
  const { error: updateError } = await supabase
    .from('habits')
    .update({ bad_count: (habit?.bad_count || 0) + 1 })
    .eq('id', id);

  if (updateError) {
    console.error('增加坏习惯计数失败:', updateError);
    throw updateError;
  }
}

export async function resetHabitCounts(id: string): Promise<void> {
  const { error } = await supabase.rpc('reset_habit_counts', { habit_id: id });

  if (error) {
    console.error('Error resetting habit counts:', error);
    throw error;
  }
} 