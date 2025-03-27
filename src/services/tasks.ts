import { supabase } from '@/lib/supabase';
import { Task, CreateTaskRequest, UpdateTaskRequest } from '@/types/task';

// 获取当前用户的所有任务
export async function getTasks(): Promise<Task[]> {
  try {
    const { data: authData, error: authError } = await supabase.auth.getSession();
    if (authError || !authData.session) {
      throw new Error('用户未登录');
    }

    const userId = authData.session.user.id;

    // 获取任务
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('获取任务失败:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('获取任务失败:', error);
    throw error;
  }
}

// 创建任务
export async function createTask(taskData: CreateTaskRequest): Promise<Task> {
  try {
    const { data: authData, error: authError } = await supabase.auth.getSession();
    if (authError || !authData.session) {
      throw new Error('用户未登录');
    }

    const userId = authData.session.user.id;

    // 处理数据
    const newTask = {
      user_id: userId,
      title: taskData.title.trim(),
      completed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // 创建任务
    const { data, error } = await supabase
      .from('tasks')
      .insert(newTask)
      .select()
      .single();

    if (error) {
      console.error('创建任务失败:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('创建任务失败:', error);
    throw error;
  }
}

// 更新任务
export async function updateTask(taskData: UpdateTaskRequest): Promise<Task> {
  try {
    const { data: authData, error: authError } = await supabase.auth.getSession();
    if (authError || !authData.session) {
      throw new Error('用户未登录');
    }

    const userId = authData.session.user.id;

    // 处理更新数据
    const updatedTask = {
      ...(taskData.title !== undefined && { title: taskData.title.trim() }),
      ...(taskData.completed !== undefined && { completed: taskData.completed }),
      updated_at: new Date().toISOString()
    };

    // 更新任务
    const { data, error } = await supabase
      .from('tasks')
      .update(updatedTask)
      .eq('id', taskData.id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('更新任务失败:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('更新任务失败:', error);
    throw error;
  }
}

// 删除任务
export async function deleteTask(taskId: string): Promise<boolean> {
  try {
    const { data: authData, error: authError } = await supabase.auth.getSession();
    if (authError || !authData.session) {
      throw new Error('用户未登录');
    }

    const userId = authData.session.user.id;

    // 删除任务
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
      .eq('user_id', userId);

    if (error) {
      console.error('删除任务失败:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('删除任务失败:', error);
    throw error;
  }
}

// 切换任务完成状态
export async function toggleTaskCompletion(taskId: string, completed: boolean): Promise<Task> {
  try {
    const { data: authData, error: authError } = await supabase.auth.getSession();
    if (authError || !authData.session) {
      throw new Error('用户未登录');
    }

    const userId = authData.session.user.id;

    // 更新任务完成状态
    const { data, error } = await supabase
      .from('tasks')
      .update({ 
        completed, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', taskId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('更新任务状态失败:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('更新任务状态失败:', error);
    throw error;
  }
} 