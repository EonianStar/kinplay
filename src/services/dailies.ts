import { supabase } from '@/lib/supabase';
import { Daily, CreateDailyRequest, UpdateDailyRequest, DailyTask } from '@/types/daily';
import { ValueLevel, increaseValueLevel, decreaseValueLevel, getWeightByValueLevel } from '@/utils/valueLevel';
import { calculateExperience, calculateCoins, BASE_EXPERIENCE, getTaskTypeWeight, getDifficultyWeight } from '../utils/rewardsCalculator';
import { addExp, addCoins } from './userStats';

// 获取当前用户的所有日常任务
export async function getDailies(): Promise<Daily[]> {
  try {
    const { data: authData, error: authError } = await supabase.auth.getSession();
    if (authError || !authData.session) {
      throw new Error('用户未登录');
    }

    const userId = authData.session.user.id;

    // 获取日常任务
    const { data: dailies, error } = await supabase
      .from('dailies')
      .select('*')
      .eq('user_id', userId)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('获取日常任务失败:', error);
      throw error;
    }

    // 为每个日常任务获取子任务
    const dailiesWithTasks = await Promise.all(
      dailies.map(async (daily) => {
        const { data: checklist, error: checklistError } = await supabase
          .from('daily_tasks')
          .select('*')
          .eq('daily_id', daily.id)
          .order('created_at', { ascending: true });

        if (checklistError) {
          console.error('获取子任务失败:', checklistError);
          return { ...daily, checklist: [] };
        }

        return { ...daily, checklist: checklist || [] };
      })
    );

    return dailiesWithTasks;
  } catch (error) {
    console.error('获取日常任务失败:', error);
    throw error;
  }
}

// 获取单个日常任务详情
export async function getDaily(dailyId: string): Promise<Daily | null> {
  try {
    const { data: authData, error: authError } = await supabase.auth.getSession();
    if (authError || !authData.session) {
      throw new Error('用户未登录');
    }

    const userId = authData.session.user.id;

    // 获取日常任务
    const { data: daily, error } = await supabase
      .from('dailies')
      .select('*')
      .eq('id', dailyId)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('获取日常任务详情失败:', error);
      return null;
    }

    // 获取子任务
    const { data: checklist, error: checklistError } = await supabase
      .from('daily_tasks')
      .select('*')
      .eq('daily_id', dailyId)
      .order('created_at', { ascending: true });

    if (checklistError) {
      console.error('获取子任务失败:', checklistError);
      return { ...daily, checklist: [] };
    }

    return { ...daily, checklist: checklist || [] };
  } catch (error) {
    console.error('获取日常任务详情失败:', error);
    throw error;
  }
}

// 创建日常任务
export async function createDaily(dailyData: CreateDailyRequest): Promise<Daily> {
  try {
    // 记录创建参数
    console.log('创建日常任务数据:', JSON.stringify(dailyData, null, 2));
    
    const { data: authData, error: authError } = await supabase.auth.getSession();
    if (authError || !authData.session) {
      console.error('认证错误:', authError);
      throw new Error('用户未登录');
    }

    const userId = authData.session.user.id;
    console.log('当前用户ID:', userId);

    // 确保必填字段存在
    if (!dailyData.title || !dailyData.difficulty || !dailyData.repeat_period || !dailyData.active_pattern) {
      console.error('缺少必填字段:', { 
        hasTitle: !!dailyData.title, 
        hasDifficulty: !!dailyData.difficulty, 
        hasRepeatPeriod: !!dailyData.repeat_period, 
        hasActivePattern: !!dailyData.active_pattern 
      });
      throw new Error('缺少必填字段');
    }

    // 处理数据
    const newDaily = {
      user_id: userId,
      title: dailyData.title.trim(),
      description: dailyData.description?.trim() || null,
      difficulty: dailyData.difficulty,
      start_date: dailyData.start_date,
      repeat_period: dailyData.repeat_period,
      active_pattern: dailyData.active_pattern,
      streak_count: dailyData.streak_count || 0,
      tags: dailyData.tags?.filter(Boolean) || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('准备插入数据库的日常任务数据:', JSON.stringify(newDaily, null, 2));

    // 创建日常任务
    const { data: daily, error } = await supabase
      .from('dailies')
      .insert(newDaily)
      .select()
      .single();

    if (error) {
      console.error('创建日常任务数据库错误:', error);
      throw error;
    }

    console.log('创建的日常任务:', daily);

    // 创建子任务
    let checklist: DailyTask[] = [];
    if (dailyData.checklist && dailyData.checklist.length > 0) {
      // 过滤掉标题为空的子任务
      const validChecklistItems = dailyData.checklist
        .filter(item => item.title && item.title.trim())
        .map(item => ({
          daily_id: daily.id,
          title: item.title.trim(),
          completed: item.completed || false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

      if (validChecklistItems.length > 0) {
        console.log('准备插入的子任务:', validChecklistItems);
        
        const { data: checklistData, error: checklistError } = await supabase
          .from('daily_tasks')
          .insert(validChecklistItems)
          .select();

        if (checklistError) {
          console.error('创建子任务失败:', checklistError);
        } else {
          checklist = checklistData || [];
          console.log('创建的子任务:', checklist);
        }
      }
    }

    return { ...daily, checklist };
  } catch (error) {
    console.error('创建日常任务过程中发生错误:', error);
    throw error;
  }
}

// 更新日常任务
export async function updateDaily(dailyId: string, dailyData: UpdateDailyRequest): Promise<Daily> {
  try {
    const { data: authData, error: authError } = await supabase.auth.getSession();
    if (authError || !authData.session) {
      throw new Error('用户未登录');
    }

    const userId = authData.session.user.id;

    // 获取当前日常任务
    const { data: existingDaily, error: getError } = await supabase
      .from('dailies')
      .select('*')
      .eq('id', dailyId)
      .eq('user_id', userId)
      .single();

    if (getError) {
      console.error('获取日常任务失败:', getError);
      throw getError;
    }

    // 处理更新数据
    const updatedDaily = {
      ...(dailyData.title !== undefined && { title: dailyData.title.trim() }),
      ...(dailyData.description !== undefined && { description: dailyData.description.trim() }),
      ...(dailyData.difficulty !== undefined && { difficulty: dailyData.difficulty }),
      ...(dailyData.start_date !== undefined && { start_date: dailyData.start_date }),
      ...(dailyData.repeat_period !== undefined && { repeat_period: dailyData.repeat_period }),
      ...(dailyData.active_pattern !== undefined && { active_pattern: dailyData.active_pattern }),
      ...(dailyData.streak_count !== undefined && { streak_count: dailyData.streak_count }),
      ...(dailyData.tags !== undefined && { tags: dailyData.tags.filter(Boolean) }),
      updated_at: new Date().toISOString()
    };

    // 更新日常任务
    const { data: daily, error } = await supabase
      .from('dailies')
      .update(updatedDaily)
      .eq('id', dailyId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('更新日常任务失败:', error);
      throw error;
    }

    // 处理子任务更新
    let checklist: DailyTask[] = [];
    if (dailyData.checklist) {
      // 获取当前子任务
      const { data: currentChecklist } = await supabase
        .from('daily_tasks')
        .select('*')
        .eq('daily_id', dailyId);
      
      const currentTaskIds = new Set((currentChecklist || []).map(task => task.id));
      const updatedTaskIds = new Set();
      
      // 更新或创建子任务
      for (const item of dailyData.checklist) {
        if (item.id && currentTaskIds.has(item.id)) {
          // 更新现有子任务
          const { error: updateError } = await supabase
            .from('daily_tasks')
            .update({
              title: item.title.trim(),
              completed: item.completed !== undefined ? item.completed : false,
              updated_at: new Date().toISOString()
            })
            .eq('id', item.id)
            .eq('daily_id', dailyId);
          
          if (updateError) {
            console.error('更新子任务失败:', updateError);
          } else {
            updatedTaskIds.add(item.id);
          }
        } else {
          // 创建新子任务
          const { data: newTask, error: createError } = await supabase
            .from('daily_tasks')
            .insert({
              daily_id: dailyId,
              title: item.title.trim(),
              completed: item.completed || false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();
          
          if (createError) {
            console.error('创建子任务失败:', createError);
          } else if (newTask) {
            updatedTaskIds.add(newTask.id);
          }
        }
      }
      
      // 删除未包含在更新中的子任务
      for (const taskId of currentTaskIds) {
        if (!updatedTaskIds.has(taskId)) {
          const { error: deleteError } = await supabase
            .from('daily_tasks')
            .delete()
            .eq('id', taskId)
            .eq('daily_id', dailyId);
          
          if (deleteError) {
            console.error('删除子任务失败:', deleteError);
          }
        }
      }

      // 获取更新后的子任务列表
      const { data: updatedChecklist, error: getChecklistError } = await supabase
        .from('daily_tasks')
        .select('*')
        .eq('daily_id', dailyId)
        .order('created_at', { ascending: true });
      
      if (getChecklistError) {
        console.error('获取更新后的子任务失败:', getChecklistError);
      } else {
        checklist = updatedChecklist || [];
      }
    }

    return { ...daily, checklist };
  } catch (error) {
    console.error('更新日常任务失败:', error);
    throw error;
  }
}

// 删除日常任务
export async function deleteDaily(dailyId: string): Promise<boolean> {
  try {
    const { data: authData, error: authError } = await supabase.auth.getSession();
    if (authError || !authData.session) {
      throw new Error('用户未登录');
    }

    const userId = authData.session.user.id;

    // 首先删除所有相关子任务
    const { error: deleteTasksError } = await supabase
      .from('daily_tasks')
      .delete()
      .eq('daily_id', dailyId);

    if (deleteTasksError) {
      console.error('删除子任务失败:', deleteTasksError);
    }

    // 删除日常任务
    const { error } = await supabase
      .from('dailies')
      .delete()
      .eq('id', dailyId)
      .eq('user_id', userId);

    if (error) {
      console.error('删除日常任务失败:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('删除日常任务失败:', error);
    throw error;
  }
}

// 更新日常任务连击次数
export async function updateDailyStreak(dailyId: string, increment: boolean): Promise<Daily> {
  try {
    const { data: authData, error: authError } = await supabase.auth.getSession();
    if (authError || !authData.session) {
      throw new Error('用户未登录');
    }

    const userId = authData.session.user.id;

    // 获取当前日常任务
    const { data: daily, error: getError } = await supabase
      .from('dailies')
      .select('streak_count, value_level, difficulty')
      .eq('id', dailyId)
      .eq('user_id', userId)
      .single();

    if (getError) {
      console.error('获取日常任务失败:', getError);
      throw getError;
    }

    // 计算新的连击次数
    const newStreakCount = increment 
      ? Math.min(999, (daily.streak_count || 0) + 1) // 增加连击，最大999
      : 0; // 重置连击
    
    // 计算新的价值权重等级
    const currentValueLevel = daily.value_level || 0;
    // 如果是增加连击（完成任务），则提高价值权重等级；如果是重置连击（未完成），则降低价值权重等级
    const newValueLevel = increment 
      ? increaseValueLevel(currentValueLevel) // 提高一档
      : decreaseValueLevel(currentValueLevel); // 降低一档
    
    // 如果是标记完成，计算经验和金币奖励
    if (increment) {
      // 计算经验和金币奖励
      const experience = calculateExperience('daily', daily.difficulty, currentValueLevel);
      const coins = calculateCoins('daily', daily.difficulty, currentValueLevel);
      
      console.log(`日常任务ID ${dailyId} 完成: 获得经验 ${experience}, 金币 ${coins}, 价值等级从 ${currentValueLevel} 变为 ${newValueLevel}`);
      console.log(`计算明细: 基础经验(${BASE_EXPERIENCE}) × 任务类型权重(${getTaskTypeWeight('daily')}) × 难度系数权重(${getDifficultyWeight(daily.difficulty)}) × 任务价值权重(${getWeightByValueLevel(currentValueLevel)})`);
      
      try {
        // 添加经验和金币
        await addExp(userId, experience);
        await addCoins(userId, coins);
        
        // 添加完成记录
        await supabase
          .from('daily_completions')
          .insert({
            daily_id: dailyId,
            user_id: userId,
            completed_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            experience_gained: experience,
            coins_gained: coins
          });
      } catch (error) {
        console.error('添加日常任务完成记录或奖励失败:', error);
        // 继续处理，不影响主流程
      }
    }
    
    // 更新日常任务的连击次数和价值权重等级
    const { data: updatedDaily, error: updateError } = await supabase
      .from('dailies')
      .update({
        streak_count: newStreakCount,
        value_level: newValueLevel,
        updated_at: new Date().toISOString()
      })
      .eq('id', dailyId)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (updateError) {
      console.error('更新日常任务连击次数失败:', updateError);
      throw updateError;
    }

    return updatedDaily;
  } catch (error) {
    console.error('更新日常任务连击次数过程中发生错误:', error);
    throw error;
  }
}

// 完成子任务
export async function toggleDailyTask(taskId: string, completed: boolean): Promise<DailyTask> {
  try {
    const { data: authData, error: authError } = await supabase.auth.getSession();
    if (authError || !authData.session) {
      throw new Error('用户未登录');
    }

    // 获取子任务及其关联的日常任务
    const { data: task, error: getTaskError } = await supabase
      .from('daily_tasks')
      .select('*, dailies!inner(user_id)')
      .eq('id', taskId)
      .single();

    if (getTaskError) {
      console.error('获取子任务失败:', getTaskError);
      throw getTaskError;
    }

    // 验证权限
    if (task.dailies.user_id !== authData.session.user.id) {
      throw new Error('无权限操作此子任务');
    }

    // 更新子任务完成状态
    const { data: updatedTask, error } = await supabase
      .from('daily_tasks')
      .update({ 
        completed, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      console.error('更新子任务状态失败:', error);
      throw error;
    }

    return updatedTask;
  } catch (error) {
    console.error('更新子任务状态失败:', error);
    throw error;
  }
}

// 更新日常任务的排序顺序
export async function updateDailiesOrder(dailyIds: string[]): Promise<boolean> {
  try {
    const { data: authData, error: authError } = await supabase.auth.getSession();
    if (authError || !authData.session) {
      throw new Error('用户未登录');
    }

    const userId = authData.session.user.id;

    // 确保所有ID都是有效的并且属于当前用户
    const { data: dailies, error: checkError } = await supabase
      .from('dailies')
      .select('id')
      .eq('user_id', userId)
      .in('id', dailyIds);

    if (checkError) {
      console.error('验证日常任务ID失败:', checkError);
      throw checkError;
    }

    // 确保所有提供的ID都有效
    if (dailies.length !== dailyIds.length) {
      console.error('无效的日常任务ID或任务不属于当前用户');
      throw new Error('无效的日常任务ID或任务不属于当前用户');
    }

    // 更新每个日常任务的顺序
    const updates = dailyIds.map((id, index) => {
      return supabase
        .from('dailies')
        .update({ sort_order: index })
        .eq('id', id)
        .eq('user_id', userId);
    });

    // 执行所有更新
    await Promise.all(updates);
    
    return true;
  } catch (error) {
    console.error('更新日常任务顺序失败:', error);
    throw error;
  }
} 