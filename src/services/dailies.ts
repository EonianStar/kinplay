import { supabase } from '@/lib/supabase';
import { Daily, CreateDailyRequest, UpdateDailyRequest, DailyTask } from '@/types/daily';

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
    const { data: authData, error: authError } = await supabase.auth.getSession();
    if (authError || !authData.session) {
      throw new Error('用户未登录');
    }

    const userId = authData.session.user.id;

    // 处理数据
    const newDaily = {
      user_id: userId,
      title: dailyData.title.trim(),
      description: dailyData.description?.trim() || undefined,
      difficulty: dailyData.difficulty,
      start_date: dailyData.start_date,
      repeat_period: dailyData.repeat_period,
      active_pattern: dailyData.active_pattern,
      streak_count: 0,
      tags: dailyData.tags?.filter(Boolean) || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // 创建日常任务
    const { data: daily, error } = await supabase
      .from('dailies')
      .insert(newDaily)
      .select()
      .single();

    if (error) {
      console.error('创建日常任务失败:', error);
      throw error;
    }

    // 创建子任务
    let checklist: DailyTask[] = [];
    if (dailyData.checklist && dailyData.checklist.length > 0) {
      const checklistItems = dailyData.checklist.map(item => ({
        daily_id: daily.id,
        title: item.title.trim(),
        completed: item.completed || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { data: checklistData, error: checklistError } = await supabase
        .from('daily_tasks')
        .insert(checklistItems)
        .select();

      if (checklistError) {
        console.error('创建子任务失败:', checklistError);
      } else {
        checklist = checklistData;
      }
    }

    return { ...daily, checklist };
  } catch (error) {
    console.error('创建日常任务失败:', error);
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
export async function updateDailyStreak(dailyId: string, increment: boolean): Promise<number> {
  try {
    const { data: authData, error: authError } = await supabase.auth.getSession();
    if (authError || !authData.session) {
      throw new Error('用户未登录');
    }

    const userId = authData.session.user.id;

    // 获取当前日常任务
    const { data: daily, error: getError } = await supabase
      .from('dailies')
      .select('streak_count')
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

    // 更新连击次数
    const { data: updatedDaily, error } = await supabase
      .from('dailies')
      .update({ 
        streak_count: newStreakCount,
        updated_at: new Date().toISOString()
      })
      .eq('id', dailyId)
      .eq('user_id', userId)
      .select('streak_count')
      .single();

    if (error) {
      console.error('更新连击次数失败:', error);
      throw error;
    }

    return updatedDaily.streak_count;
  } catch (error) {
    console.error('更新连击次数失败:', error);
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