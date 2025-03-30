'use client';

import { supabase } from '@/lib/supabase';
import {
  Todo,
  TodoTask,
  TodoDifficulty,
  CreateTodoRequest,
  UpdateTodoRequest
} from '@/types/todo';
import { v4 as uuidv4 } from 'uuid';
import { ValueLevel, getValueLevelAdjustmentByOverdue } from '@/utils/valueLevel';

/**
 * 获取所有待办事项
 */
export const getAllTodos = async (): Promise<Todo[]> => {
  try {
    const { data: authData, error: authError } = await supabase.auth.getSession();
    if (authError || !authData.session) {
      throw new Error('用户未登录');
    }

    const userId = authData.session.user.id;

    // 获取所有待办事项
    const { data: todos, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', userId)
      .order('sort_order', { ascending: true })
      .order('completed', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('获取待办事项失败:', error);
      throw error;
    }

    // 获取子任务
    const todosWithChecklist = await Promise.all(
      todos.map(async (todo) => {
        const { data: checklist, error: checklistError } = await supabase
          .from('todo_tasks')
          .select('*')
          .eq('todo_id', todo.id)
          .order('created_at', { ascending: true });

        if (checklistError) {
          console.error('获取待办事项子任务失败:', checklistError);
          return { ...todo, checklist: [] };
        }

        return { ...todo, checklist: checklist || [] };
      })
    );

    return todosWithChecklist;
  } catch (error) {
    console.error('获取所有待办事项失败:', error);
    return [];  // 出错时返回空数组
  }
};

/**
 * 获取单个待办事项
 */
export const getTodo = async (todoId: string): Promise<Todo | null> => {
  try {
    const { data: authData, error: authError } = await supabase.auth.getSession();
    if (authError || !authData.session) {
      throw new Error('用户未登录');
    }

    const userId = authData.session.user.id;

    // 获取待办事项
    const { data: todo, error } = await supabase
      .from('todos')
      .select('*')
      .eq('id', todoId)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('获取待办事项详情失败:', error);
      return null;
    }

    // 获取子任务
    const { data: checklist, error: checklistError } = await supabase
      .from('todo_tasks')
      .select('*')
      .eq('todo_id', todoId)
      .order('created_at', { ascending: true });

    if (checklistError) {
      console.error('获取待办事项子任务失败:', checklistError);
      return { ...todo, checklist: [] };
    }

    return { ...todo, checklist: checklist || [] };
  } catch (error) {
    console.error('获取待办事项详情失败:', error);
    return null;
  }
};

/**
 * 创建新的待办事项
 */
export const createTodo = async (todoData: CreateTodoRequest): Promise<Todo> => {
  try {
    console.log('创建待办事项数据:', JSON.stringify(todoData, null, 2));
    
    const { data: authData, error: authError } = await supabase.auth.getSession();
    if (authError || !authData.session) {
      console.error('认证错误:', authError);
      throw new Error('用户未登录');
    }

    const userId = authData.session.user.id;
    console.log('当前用户ID:', userId);

    // 确保必填字段存在
    if (!todoData.title) {
      throw new Error('待办事项标题不能为空');
    }

    // 截止日期处理：如果提供了截止日期，需要确保时间是23:59:59
    let formattedDueDate = todoData.due_date;
    if (todoData.due_date) {
      const dueDate = new Date(todoData.due_date);
      dueDate.setHours(23, 59, 59, 999);
      formattedDueDate = dueDate.toISOString();
    }
    
    // 准备待办事项数据
    const newTodo = {
      user_id: userId,
      title: todoData.title.trim(),
      description: todoData.description?.trim() || '',
      difficulty: Number(todoData.difficulty) || TodoDifficulty.EASY,
      due_date: formattedDueDate || null,
      tags: todoData.tags?.filter(Boolean) || [],
      completed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('准备插入数据库的待办事项数据:', JSON.stringify(newTodo, null, 2));

    // 创建待办事项
    const { data: todo, error } = await supabase
      .from('todos')
      .insert(newTodo)
      .select()
      .single();

    if (error) {
      console.error('创建待办事项数据库错误:', error);
      throw error;
    }

    console.log('创建的待办事项:', todo);

    // 创建子任务
    let checklist: TodoTask[] = [];
    if (todoData.checklist && todoData.checklist.length > 0) {
      // 过滤掉标题为空的子任务
      const validChecklistItems = todoData.checklist
        .filter(item => item.title && item.title.trim())
        .map(item => ({
          todo_id: todo.id,
          title: item.title.trim(),
          completed: item.completed || false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

      if (validChecklistItems.length > 0) {
        console.log('准备插入的子任务:', validChecklistItems);
        
        const { data: checklistData, error: checklistError } = await supabase
          .from('todo_tasks')
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

    return { ...todo, checklist };
  } catch (error) {
    console.error('创建待办事项失败:', error);
    throw error;
  }
};

/**
 * 更新待办事项
 */
export const updateTodo = async (todoId: string, todoData: UpdateTodoRequest): Promise<Todo> => {
  try {
    console.log('更新待办事项数据:', JSON.stringify(todoData, null, 2));
    
    const { data: authData, error: authError } = await supabase.auth.getSession();
    if (authError || !authData.session) {
      throw new Error('用户未登录');
    }

    const userId = authData.session.user.id;

    // 获取当前待办事项
    const { data: existingTodo, error: getError } = await supabase
      .from('todos')
      .select('*')
      .eq('id', todoId)
      .eq('user_id', userId)
      .single();

    if (getError) {
      console.error('获取当前待办事项失败:', getError);
      throw new Error('待办事项不存在或无权限修改');
    }

    // 截止日期处理：如果提供了截止日期，需要确保时间是23:59:59
    let formattedDueDate = todoData.due_date;
    if (todoData.due_date) {
      const dueDate = new Date(todoData.due_date);
      dueDate.setHours(23, 59, 59, 999);
      formattedDueDate = dueDate.toISOString();
    }

    // 处理价值权重等级
    let valueLevel = todoData.value_level !== undefined ? todoData.value_level : existingTodo.value_level || 0;
    
    // 如果有截止日期且已超过，计算应降低的等级
    if (formattedDueDate && !todoData.completed) {
      const now = new Date();
      const dueDate = new Date(formattedDueDate);
      
      if (now > dueDate) {
        // 计算逾期天数
        const daysPastDue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        const adjustment = getValueLevelAdjustmentByOverdue(daysPastDue);
        
        // 将价值等级设置为指定调整值（根据逾期天数直接设置等级，不是累加）
        valueLevel = adjustment;
      }
    }
    
    // 如果没有截止日期，确保权重等级为 0（中性）
    if (!formattedDueDate && !existingTodo.due_date) {
      valueLevel = ValueLevel.NEUTRAL;
    }

    // 准备更新数据
    const updateData = {
      title: todoData.title?.trim() !== undefined ? todoData.title.trim() : existingTodo.title,
      description: todoData.description?.trim() !== undefined ? todoData.description.trim() : existingTodo.description,
      difficulty: todoData.difficulty !== undefined ? Number(todoData.difficulty) : existingTodo.difficulty,
      due_date: formattedDueDate !== undefined ? formattedDueDate : existingTodo.due_date,
      tags: todoData.tags || existingTodo.tags,
      completed: todoData.completed !== undefined ? todoData.completed : existingTodo.completed,
      value_level: valueLevel,
      updated_at: new Date().toISOString()
    };

    // 更新待办事项
    const { data: updatedTodo, error: updateError } = await supabase
      .from('todos')
      .update(updateData)
      .eq('id', todoId)
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('更新待办事项失败:', updateError);
      throw updateError;
    }

    // 处理子任务
    let checklist: TodoTask[] = [];
    if (todoData.checklist) {
      // 先删除所有现有子任务
      const { error: deleteError } = await supabase
        .from('todo_tasks')
        .delete()
        .eq('todo_id', todoId);

      if (deleteError) {
        console.error('删除现有子任务失败:', deleteError);
      }

      // 添加新的子任务
      if (todoData.checklist.length > 0) {
        const validTasks = todoData.checklist
          .filter(task => task.title && task.title.trim())
          .map(task => ({
            todo_id: todoId,
            title: task.title.trim(),
            completed: task.completed || false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }));

        if (validTasks.length > 0) {
          const { data: taskData, error: taskError } = await supabase
            .from('todo_tasks')
            .insert(validTasks)
            .select();

          if (taskError) {
            console.error('添加新子任务失败:', taskError);
          } else {
            checklist = taskData || [];
          }
        }
      }
    } else {
      // 获取现有子任务
      const { data: existingChecklist, error: checklistError } = await supabase
        .from('todo_tasks')
        .select('*')
        .eq('todo_id', todoId)
        .order('created_at', { ascending: true });

      if (!checklistError) {
        checklist = existingChecklist || [];
      }
    }

    return { ...updatedTodo, checklist };
  } catch (error) {
    console.error('更新待办事项过程中发生错误:', error);
    throw error;
  }
};

/**
 * 删除待办事项
 */
export const deleteTodo = async (todoId: string): Promise<void> => {
  try {
    const { data: authData, error: authError } = await supabase.auth.getSession();
    if (authError || !authData.session) {
      throw new Error('用户未登录');
    }

    const userId = authData.session.user.id;

    // 先删除所有子任务
    const { error: deleteTasksError } = await supabase
      .from('todo_tasks')
      .delete()
      .eq('todo_id', todoId);

    if (deleteTasksError) {
      console.error('删除待办事项子任务失败:', deleteTasksError);
      // 继续尝试删除主待办事项
    }

    // 删除待办事项
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', todoId)
      .eq('user_id', userId);

    if (error) {
      console.error('删除待办事项失败:', error);
      throw error;
    }
  } catch (error) {
    console.error('删除待办事项过程中发生错误:', error);
    throw error;
  }
};

/**
 * 标记待办事项为已完成或未完成
 */
export const toggleTodoComplete = async (todoId: string, completed: boolean): Promise<Todo> => {
  try {
    const { data: authData, error: authError } = await supabase.auth.getSession();
    if (authError || !authData.session) {
      throw new Error('用户未登录');
    }

    const userId = authData.session.user.id;

    // 获取当前待办事项
    const { data: existingTodo, error: getError } = await supabase
      .from('todos')
      .select('*')
      .eq('id', todoId)
      .eq('user_id', userId)
      .single();

    if (getError) {
      console.error('获取当前待办事项失败:', getError);
      throw getError;
    }

    // 处理价值权重等级
    let valueLevel = existingTodo.value_level || 0;
    
    // 当设置为已完成且有截止日期时，检查是否逾期，并相应调整价值权重
    if (completed && existingTodo.due_date) {
      const now = new Date();
      const dueDate = new Date(existingTodo.due_date);
      
      // 如果已经逾期，保持降级状态
      if (now > dueDate) {
        // 计算逾期天数
        const daysPastDue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        const adjustment = getValueLevelAdjustmentByOverdue(daysPastDue);
        
        // 保持当前降级状态
        valueLevel = adjustment;
      }
    }
    
    // 如果是将完成任务改为未完成，且没有期限，则重置为中性权重
    if (!completed && !existingTodo.due_date) {
      valueLevel = ValueLevel.NEUTRAL;
    }
    
    // 如果是将任务设为未完成，且有期限，需要重新评估截止日期和当前日期关系
    if (!completed && existingTodo.due_date) {
      const now = new Date();
      const dueDate = new Date(existingTodo.due_date);
      
      if (now > dueDate) {
        // 已逾期，计算逾期天数
        const daysPastDue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        valueLevel = getValueLevelAdjustmentByOverdue(daysPastDue);
      } else {
        // 未逾期，重置为中性
        valueLevel = ValueLevel.NEUTRAL;
      }
    }

    // 更新待办事项完成状态
    const { data: todo, error } = await supabase
      .from('todos')
      .update({
        completed,
        value_level: valueLevel,
        updated_at: new Date().toISOString()
      })
      .eq('id', todoId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('更新待办事项完成状态失败:', error);
      throw error;
    }

    // 如果主任务被标记为已完成，也更新所有子任务为已完成
    if (completed) {
      const { error: updateTasksError } = await supabase
        .from('todo_tasks')
        .update({
          completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('todo_id', todoId);

      if (updateTasksError) {
        console.error('更新子任务完成状态失败:', updateTasksError);
      }
    }

    // 获取更新后的子任务
    const { data: checklist, error: checklistError } = await supabase
      .from('todo_tasks')
      .select('*')
      .eq('todo_id', todoId)
      .order('created_at', { ascending: true });

    if (checklistError) {
      return { ...todo, checklist: [] };
    }

    return { ...todo, checklist: checklist || [] };
  } catch (error) {
    console.error('更新待办事项完成状态过程中发生错误:', error);
    throw error;
  }
};

/**
 * 获取未完成且截止日期临近的待办事项
 */
export const getUpcomingTodos = async (daysAhead: number = 7): Promise<Todo[]> => {
  try {
    const { data: authData, error: authError } = await supabase.auth.getSession();
    if (authError || !authData.session) {
      throw new Error('用户未登录');
    }

    const userId = authData.session.user.id;

    // 计算日期范围
    const now = new Date();
    const future = new Date();
    future.setDate(now.getDate() + daysAhead);
    future.setHours(23, 59, 59, 999);

    // 获取符合条件的待办事项
    const { data: todos, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', userId)
      .eq('completed', false)
      .gte('due_date', now.toISOString())
      .lte('due_date', future.toISOString())
      .order('due_date', { ascending: true });

    if (error) {
      console.error('获取即将到期的待办事项失败:', error);
      return [];
    }

    // 获取子任务
    const todosWithChecklist = await Promise.all(
      todos.map(async (todo) => {
        const { data: checklist, error: checklistError } = await supabase
          .from('todo_tasks')
          .select('*')
          .eq('todo_id', todo.id)
          .order('created_at', { ascending: true });

        if (checklistError) {
          return { ...todo, checklist: [] };
        }

        return { ...todo, checklist: checklist || [] };
      })
    );

    return todosWithChecklist;
  } catch (error) {
    console.error('获取即将到期的待办事项失败:', error);
    return [];
  }
};

/**
 * 更新待办事项的排序顺序
 */
export const updateTodosOrder = async (todoIds: string[]): Promise<boolean> => {
  try {
    const { data: authData, error: authError } = await supabase.auth.getSession();
    if (authError || !authData.session) {
      throw new Error('用户未登录');
    }

    const userId = authData.session.user.id;

    // 确保所有ID都是有效的并且属于当前用户
    const { data: todos, error: checkError } = await supabase
      .from('todos')
      .select('id')
      .eq('user_id', userId)
      .in('id', todoIds);

    if (checkError) {
      console.error('验证待办事项ID失败:', checkError);
      throw checkError;
    }

    // 确保所有提供的ID都有效
    if (todos.length !== todoIds.length) {
      console.error('无效的待办事项ID或任务不属于当前用户');
      throw new Error('无效的待办事项ID或任务不属于当前用户');
    }

    // 更新每个待办事项的顺序
    const updates = todoIds.map((id, index) => {
      return supabase
        .from('todos')
        .update({ sort_order: index })
        .eq('id', id)
        .eq('user_id', userId);
    });

    // 执行所有更新
    await Promise.all(updates);
    
    return true;
  } catch (error) {
    console.error('更新待办事项顺序失败:', error);
    throw error;
  }
}; 