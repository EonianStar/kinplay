/**
 * 奖励服务 - 处理奖励的创建、查询、更新和删除
 */
import { supabase } from '@/lib/supabase';
import { Reward, CreateRewardRequest, UpdateRewardRequest } from '@/types/reward';

/**
 * 创建新奖励
 * @param data 奖励数据
 * @returns 创建的奖励对象
 */
export async function createReward(data: CreateRewardRequest): Promise<Reward> {
  const { data: session, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session?.session?.user?.id) {
    console.error('获取用户会话失败:', sessionError);
    throw new Error('用户未登录或会话已过期');
  }
  
  const userId = session.session.user.id;
  
  const { data: reward, error } = await supabase
    .from('rewards')
    .insert({
      user_id: userId,
      title: data.title,
      description: data.description,
      icon: data.icon,
      price: data.price
    })
    .select('*')
    .single();

  if (error) {
    console.error('创建奖励失败:', error);
    throw new Error(`创建奖励失败: ${error.message}`);
  }

  return reward as Reward;
}

/**
 * 获取所有奖励
 * @returns 奖励列表
 */
export async function getRewards(): Promise<Reward[]> {
  const { data: session, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session?.session?.user?.id) {
    console.error('获取用户会话失败:', sessionError);
    throw new Error('用户未登录或会话已过期');
  }

  const { data, error } = await supabase
    .from('rewards')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('获取奖励列表失败:', error);
    throw new Error(`获取奖励列表失败: ${error.message}`);
  }

  return data as Reward[];
}

/**
 * 获取单个奖励
 * @param id 奖励ID
 * @returns 奖励对象
 */
export async function getRewardById(id: string): Promise<Reward> {
  const { data: session, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session?.session?.user?.id) {
    console.error('获取用户会话失败:', sessionError);
    throw new Error('用户未登录或会话已过期');
  }

  const { data, error } = await supabase
    .from('rewards')
    .select('*')
    .eq('id', id)
    .eq('user_id', session.session.user.id)
    .single();

  if (error) {
    console.error(`获取奖励(ID: ${id})失败:`, error);
    throw new Error(`获取奖励失败: ${error.message}`);
  }

  return data as Reward;
}

/**
 * 更新奖励
 * @param data 更新数据
 * @returns 更新后的奖励对象
 */
export async function updateReward(data: UpdateRewardRequest): Promise<Reward> {
  const { data: session, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session?.session?.user?.id) {
    console.error('获取用户会话失败:', sessionError);
    throw new Error('用户未登录或会话已过期');
  }
  
  const updateData: Partial<Reward> = {};

  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.icon !== undefined) updateData.icon = data.icon;
  if (data.price !== undefined) updateData.price = data.price;

  const { data: reward, error } = await supabase
    .from('rewards')
    .update(updateData)
    .eq('id', data.id)
    .eq('user_id', session.session.user.id)
    .select('*')
    .single();

  if (error) {
    console.error(`更新奖励(ID: ${data.id})失败:`, error);
    throw new Error(`更新奖励失败: ${error.message}`);
  }

  return reward as Reward;
}

/**
 * 删除奖励
 * @param id 奖励ID
 * @returns 成功标志
 */
export async function deleteReward(id: string): Promise<boolean> {
  const { data: session, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session?.session?.user?.id) {
    console.error('获取用户会话失败:', sessionError);
    throw new Error('用户未登录或会话已过期');
  }

  const { error } = await supabase
    .from('rewards')
    .delete()
    .eq('id', id)
    .eq('user_id', session.session.user.id);

  if (error) {
    console.error(`删除奖励(ID: ${id})失败:`, error);
    throw new Error(`删除奖励失败: ${error.message}`);
  }

  return true;
}

/**
 * 更新奖励顺序
 * @param rewardIds 排序后的奖励ID列表
 * @returns 成功标志
 */
export async function updateRewardsOrder(rewardIds: string[]): Promise<boolean> {
  try {
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.session?.user?.id) {
      console.error('获取用户会话失败:', sessionError);
      throw new Error('用户未登录或会话已过期');
    }
    
    // 暂时禁用排序更新功能，等待数据库迁移完成后再启用
    console.log('排序功能暂未启用，等待数据库迁移');
    return true;
  } catch (error) {
    console.error('更新奖励顺序失败:', error);
    throw new Error(`更新奖励顺序失败: ${error instanceof Error ? error.message : String(error)}`);
  }
} 