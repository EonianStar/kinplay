import { supabase } from '@/lib/supabase';
import { 
  Habit, 
  CreateHabitRequest, 
  UpdateHabitRequest,
  HabitNature,
  HabitDifficulty,
  HabitResetPeriod
} from '@/types/habit';
import { ValueLevel, increaseValueLevel, decreaseValueLevel, getWeightByValueLevel } from '@/utils/valueLevel';
import { 
  calculateExperience, 
  calculateCoins,
  BASE_EXPERIENCE,
  getTaskTypeWeight,
  getDifficultyWeight,
} from '../utils/rewardsCalculator';
import { addExp, addCoins, deductCoins } from './userStats';

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
    .order('sort_order', { ascending: true })
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

export async function incrementGoodCount(id: number): Promise<Habit> {
  try {
    // 获取用户ID
    const { data: authData, error: authError } = await supabase.auth.getSession();
    if (authError || !authData.session) {
      throw new Error('用户未登录');
    }
    const userId = authData.session.user.id;

    // 先获取当前习惯信息
    const { data: habit, error: fetchError } = await supabase
      .from('habits')
      .select('good_count, value_level, nature, difficulty, user_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('获取习惯计数失败:', fetchError);
      throw fetchError;
    }

    // 检查习惯是否包含好习惯性质
    if (!habit.nature.includes(HabitNature.GOOD)) {
      console.error('该习惯不是好习惯，无法增加好习惯计数');
      throw new Error('该习惯不是好习惯，无法增加好习惯计数');
    }

    // 计算新的价值权重等级 - 完成好习惯应提高价值权重等级
    const currentValueLevel = habit.value_level || 0;
    const newValueLevel = increaseValueLevel(currentValueLevel);
    
    // 注意：我们应该使用当前的价值权重等级来计算奖励，而不是使用新的价值权重等级
    // 这样才能确保奖励是基于当前等级的表现
    const experience = calculateExperience('habit', habit.difficulty, currentValueLevel);
    const coins = calculateCoins('habit', habit.difficulty, currentValueLevel);
    
    console.log(`习惯ID ${id} 完成: 获得经验 ${experience}, 金币 ${coins}, 价值等级从 ${currentValueLevel} 变为 ${newValueLevel}`);
    console.log(`计算明细: 基础经验(${BASE_EXPERIENCE}) × 任务类型权重(${getTaskTypeWeight('habit')}) × 难度系数权重(${getDifficultyWeight(habit.difficulty)}) × 任务价值权重(${getWeightByValueLevel(currentValueLevel)})`);

    // 更新计数和价值权重等级
    const { data: updatedHabit, error: updateError } = await supabase
      .from('habits')
      .update({ 
        good_count: (habit?.good_count || 0) + 1,
        value_level: newValueLevel,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*')
      .single();

    if (updateError) {
      console.error('增加好习惯计数失败:', updateError);
      throw updateError;
    }
    
    // 添加习惯完成记录
    try {
      // 添加到习惯完成记录表
      await supabase
        .from('habit_completions')
        .insert({
          habit_id: id,
          user_id: userId,
          completed_at: new Date().toISOString(),
          is_good: true,
          experience_gained: experience,
          coins_gained: coins,
          created_at: new Date().toISOString()
        });
        
      // 添加经验和金币
      await addExp(userId, experience);
      await addCoins(userId, coins);
    } catch (rewardError) {
      console.error('更新用户奖励失败:', rewardError);
      // 继续处理，不影响主流程
    }

    return updatedHabit;
  } catch (error) {
    console.error('增加好习惯计数失败:', error);
    throw error;
  }
}

export async function incrementBadCount(id: number): Promise<Habit> {
  try {
    // 获取用户ID
    const { data: authData, error: authError } = await supabase.auth.getSession();
    if (authError || !authData.session) {
      throw new Error('用户未登录');
    }
    const userId = authData.session.user.id;

    // 先获取当前习惯信息
    const { data: habit, error: fetchError } = await supabase
      .from('habits')
      .select('bad_count, value_level, nature, difficulty, user_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('获取习惯计数失败:', fetchError);
      throw fetchError;
    }

    // 检查习惯是否包含坏习惯性质
    if (!habit.nature.includes(HabitNature.BAD)) {
      console.error('该习惯不是坏习惯，无法增加坏习惯计数');
      throw new Error('该习惯不是坏习惯，无法增加坏习惯计数');
    }

    // 计算新的价值权重等级 - 记录坏习惯应降低价值权重等级
    const currentValueLevel = habit.value_level || 0;
    const newValueLevel = decreaseValueLevel(currentValueLevel);
    
    // 计算经验奖励（坏习惯依然获得经验）和金币扣除
    const experience = calculateExperience('habit', habit.difficulty, currentValueLevel);
    const coinsToDeduct = calculateCoins('habit', habit.difficulty, currentValueLevel);
    
    console.log(`习惯ID ${id} 记录坏习惯: 获得经验 ${experience}, 扣除金币 ${coinsToDeduct}, 价值等级从 ${currentValueLevel} 变为 ${newValueLevel}`);
    console.log(`计算明细: 基础经验(${BASE_EXPERIENCE}) × 任务类型权重(${getTaskTypeWeight('habit')}) × 难度系数权重(${getDifficultyWeight(habit.difficulty)}) × 任务价值权重(${getWeightByValueLevel(currentValueLevel)})`);

    // 更新计数和价值权重等级
    const { data: updatedHabit, error: updateError } = await supabase
      .from('habits')
      .update({ 
        bad_count: (habit?.bad_count || 0) + 1,
        value_level: newValueLevel,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*')
      .single();

    if (updateError) {
      console.error('增加坏习惯计数失败:', updateError);
      throw updateError;
    }
    
    // 添加习惯完成记录和奖励
    try {
      // 添加到习惯完成记录表
      await supabase
        .from('habit_completions')
        .insert({
          habit_id: id,
          user_id: userId,
          completed_at: new Date().toISOString(),
          is_good: false,
          experience_gained: experience,
          coins_gained: -coinsToDeduct, // 负值表示扣除
          created_at: new Date().toISOString()
        });
      
      // 添加经验和扣除金币
      await addExp(userId, experience);
      // 扣除金币，但不能变为负数
      await deductCoins(userId, coinsToDeduct);
    } catch (rewardError) {
      console.error('更新用户奖励失败:', rewardError);
      // 继续处理，不影响主流程
    }

    return updatedHabit;
  } catch (error) {
    console.error('增加坏习惯计数失败:', error);
    throw error;
  }
}

export async function resetHabitCounts(id: string): Promise<void> {
  const { error } = await supabase.rpc('reset_habit_counts', { habit_id: id });

  if (error) {
    console.error('Error resetting habit counts:', error);
    throw error;
  }
}

export async function updateHabitsOrder(habitIds: number[]): Promise<boolean> {
  try {
    // 验证用户登录状态
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('用户未登录');
    }

    // 确保所有ID都是有效的并且属于当前用户
    const { data: habits, error: checkError } = await supabase
      .from('habits')
      .select('id')
      .eq('user_id', user.id)
      .in('id', habitIds);

    if (checkError) {
      console.error('验证习惯ID失败:', checkError);
      throw checkError;
    }

    // 确保所有提供的ID都有效
    if (habits.length !== habitIds.length) {
      console.error('无效的习惯ID或习惯不属于当前用户');
      throw new Error('无效的习惯ID或习惯不属于当前用户');
    }

    // 更新每个习惯的顺序
    const updates = habitIds.map((id, index) => {
      return supabase
        .from('habits')
        .update({ sort_order: index })
        .eq('id', id)
        .eq('user_id', user.id);
    });

    // 执行所有更新
    await Promise.all(updates);
    
    return true;
  } catch (error) {
    console.error('更新习惯顺序失败:', error);
    throw error;
  }
} 