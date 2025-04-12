import { supabase } from '@/lib/supabase';
import { UserStats } from '@/lib/supabase';

// 检查认证状态
async function checkAuth() {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  console.log('认证检查 - Supabase 会话状态:', {
    isAuthenticated: !!session,
    userId: session?.user?.id,
    email: session?.user?.email
  });

  if (error) {
    console.error('获取会话时出错:', error);
    throw new Error(`认证错误: ${error.message}`);
  }

  if (!session) {
    console.error('用户未认证 - 没有有效会话');
    throw new Error('用户未认证');
  }

  return session.user;
}

// 获取用户统计数据
export async function getUserStats(userId: string): Promise<UserStats | null> {
  try {
    const user = await checkAuth();
    console.log('正在获取用户统计数据:', {
      requestedUserId: userId,
      currentUserId: user.id
    });

    const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('获取用户统计数据错误:', error);
      throw new Error(`获取用户统计数据失败: ${error.message}`);
    }

    console.log('获取到的用户统计数据:', data);
    return data;
  } catch (error) {
    console.error('获取用户统计数据异常:', error);
    throw error;
  }
}

// 初始化用户统计数据
export async function initializeUserStats(userId: string): Promise<void> {
  try {
    const user = await checkAuth();
    console.log('正在初始化用户统计数据:', {
      requestedUserId: userId,
      currentUserId: user.id
    });
    
    // 先检查是否已存在
    const { data: existingStats, error: checkError } = await supabase
      .from('user_stats')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (checkError) {
      console.error('检查用户统计数据时出错:', checkError);
      throw new Error(`检查用户统计数据失败: ${checkError.message}`);
    }

    if (existingStats) {
      console.log('用户统计数据已存在，无需初始化');
      return;
    }

    console.log('准备插入新的用户统计数据');
    const newStats = {
      user_id: userId,
      exp: 0,
      coins: 0,
      tasks_completed: 0,
      streak: 0,
      last_updated: new Date().toISOString(),
      created_at: new Date().toISOString()
    };
    console.log('新统计数据:', newStats);

    const { error } = await supabase
      .from('user_stats')
      .insert([newStats]);

    if (error) {
      console.error('初始化用户统计数据错误:', error);
      console.error('错误详情:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      throw new Error(`初始化用户统计数据失败: ${error.message}`);
    }
    console.log('用户统计数据初始化成功');
  } catch (error) {
    console.error('初始化用户统计数据异常:', error);
    throw error;
  }
}

// 更新用户统计数据
export async function updateUserStats(userId: string, updates: Partial<UserStats>): Promise<void> {
  try {
    const user = await checkAuth();
    console.log('正在更新用户统计数据:', {
      requestedUserId: userId,
      currentUserId: user.id,
      updates
    });

    const { error } = await supabase
      .from('user_stats')
      .update({
        ...updates,
        last_updated: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) {
      console.error('更新用户统计数据错误:', error);
      throw new Error(`更新用户统计数据失败: ${error.message}`);
    }
    console.log('用户统计数据更新成功');
  } catch (error) {
    console.error('更新用户统计数据异常:', error);
    throw error;
  }
}

// 增加经验值
export async function addExp(userId: string, amount: number): Promise<void> {
  try {
    await checkAuth();
    console.log(`增加经验: ${amount.toFixed(2)}`);
    
    // 获取当前经验值
    const { data: stats, error: getError } = await supabase
      .from('user_stats')
      .select('exp')
      .eq('user_id', userId)
      .single();
    
    if (getError) {
      console.error('获取用户经验值失败:', getError);
      throw new Error(`获取用户经验值失败: ${getError.message}`);
    }
    
    // 计算新的经验值（当前值 + 新增值）
    const currentExp = stats?.exp || 0;
    const newExp = currentExp + amount;
    
    console.log(`当前经验: ${currentExp.toFixed(2)}, 增加后: ${newExp.toFixed(2)}`);
    
    // 直接使用update代替RPC调用，确保小数处理正确
    const { error } = await supabase
      .from('user_stats')
      .update({ 
        exp: newExp,
        last_updated: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) {
      console.error('增加经验值错误:', error);
      throw new Error(`增加经验值失败: ${error.message}`);
    }
    
    // 发布经验值变化事件
    import('./userEvents').then(({ publishExpChange }) => {
      publishExpChange(userId, currentExp, newExp);
    }).catch(error => {
      console.error('发布经验值变化事件失败:', error);
    });
  } catch (error) {
    console.error('增加经验值异常:', error);
    throw error;
  }
}

// 增加金币
export async function addCoins(userId: string, amount: number): Promise<void> {
  try {
    await checkAuth();
    console.log(`增加金币: ${amount.toFixed(2)}`);
    
    // 获取当前金币值
    const { data: stats, error: getError } = await supabase
      .from('user_stats')
      .select('coins')
      .eq('user_id', userId)
      .single();
    
    if (getError) {
      console.error('获取用户金币失败:', getError);
      throw new Error(`获取用户金币失败: ${getError.message}`);
    }
    
    // 计算新的金币值（当前值 + 新增值）
    const currentCoins = stats?.coins || 0;
    const newCoins = currentCoins + amount;
    
    console.log(`当前金币: ${currentCoins.toFixed(2)}, 增加后: ${newCoins.toFixed(2)}`);
    
    // 直接使用update代替RPC调用，确保小数处理正确
    const { error } = await supabase
      .from('user_stats')
      .update({ 
        coins: newCoins,
        last_updated: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) {
      console.error('增加金币错误:', error);
      throw new Error(`增加金币失败: ${error.message}`);
    }
    
    // 发布金币变化事件
    import('./userEvents').then(({ publishCoinsChange }) => {
      publishCoinsChange(userId, currentCoins, newCoins);
    }).catch(error => {
      console.error('发布金币变化事件失败:', error);
    });
  } catch (error) {
    console.error('增加金币异常:', error);
    throw error;
  }
}

// 扣除经验值
export async function deductExp(userId: string, amount: number): Promise<void> {
  try {
    await checkAuth();
    console.log(`扣除经验: ${amount.toFixed(2)}`);
    
    // 获取当前经验值
    const { data: stats, error: getError } = await supabase
      .from('user_stats')
      .select('exp')
      .eq('user_id', userId)
      .single();
    
    if (getError) {
      console.error('获取用户经验值失败:', getError);
      throw new Error(`获取用户经验值失败: ${getError.message}`);
    }
    
    // 计算新的经验值（不能小于0）
    const currentExp = stats?.exp || 0;
    const newExp = Math.max(0, currentExp - amount);
    
    console.log(`当前经验: ${currentExp.toFixed(2)}, 扣除后: ${newExp.toFixed(2)}`);
    
    // 更新经验值
    const { error } = await supabase
      .from('user_stats')
      .update({ 
        exp: newExp,
        last_updated: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) {
      console.error('扣除经验值错误:', error);
      throw new Error(`扣除经验值失败: ${error.message}`);
    }
  } catch (error) {
    console.error('扣除经验值异常:', error);
    throw error;
  }
}

// 扣除金币
export async function deductCoins(userId: string, amount: number): Promise<void> {
  try {
    await checkAuth();
    console.log(`扣除金币: ${amount.toFixed(2)}`);
    
    // 获取当前金币
    const { data: stats, error: getError } = await supabase
      .from('user_stats')
      .select('coins')
      .eq('user_id', userId)
      .single();
    
    if (getError) {
      console.error('获取用户金币失败:', getError);
      throw new Error(`获取用户金币失败: ${getError.message}`);
    }
    
    // 计算新的金币（不能小于0）
    const currentCoins = stats?.coins || 0;
    const newCoins = Math.max(0, currentCoins - amount);
    
    console.log(`当前金币: ${currentCoins.toFixed(2)}, 扣除后: ${newCoins.toFixed(2)}`);
    
    // 更新金币
    const { error } = await supabase
      .from('user_stats')
      .update({ 
        coins: newCoins,
        last_updated: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) {
      console.error('扣除金币错误:', error);
      throw new Error(`扣除金币失败: ${error.message}`);
    }
  } catch (error) {
    console.error('扣除金币异常:', error);
    throw error;
  }
}

// 增加完成任务数
export async function incrementTasksCompleted(userId: string): Promise<void> {
  try {
    await checkAuth();
    const { error } = await supabase
      .rpc('increment_tasks_completed', { 
        user_id_param: userId 
      });

    if (error) {
      console.error('增加完成任务数错误:', error);
      throw new Error(`增加完成任务数失败: ${error.message}`);
    }
  } catch (error) {
    console.error('增加完成任务数异常:', error);
    throw error;
  }
}

// 更新连续完成天数
export async function updateStreak(userId: string, streak: number): Promise<void> {
  try {
    await checkAuth();
    const { error } = await supabase
      .from('user_stats')
      .update({ streak: streak })
      .eq('user_id', userId);

    if (error) {
      console.error('更新连续完成天数错误:', error);
      throw new Error(`更新连续完成天数失败: ${error.message}`);
    }
  } catch (error) {
    console.error('更新连续完成天数异常:', error);
    throw error;
  }
} 