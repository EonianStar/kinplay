/**
 * 奖励服务 - 处理奖励的创建、查询、更新和删除
 */
import { supabase } from '@/lib/supabase';
import { Reward, CreateRewardRequest, UpdateRewardRequest, RedeemRewardRequest, RewardStatus } from '@/types/reward';
import { deductCoins, getUserStats } from './userStats';

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
 * @param status 奖励状态过滤（待兑换/已兑换/全部）
 * @returns 奖励列表
 */
export async function getRewards(status: RewardStatus = RewardStatus.PENDING): Promise<Reward[]> {
  const { data: session, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session?.session?.user?.id) {
    console.error('获取用户会话失败:', sessionError);
    throw new Error('用户未登录或会话已过期');
  }

  let query = supabase
    .from('rewards')
    .select('*')
    .eq('user_id', session.session.user.id);
  
  // 根据状态过滤
  if (status === RewardStatus.PENDING) {
    query = query.eq('redeemed', false);
  } else if (status === RewardStatus.REDEEMED) {
    query = query.eq('redeemed', true);
  }

  // 根据状态排序
  if (status === RewardStatus.ALL) {
    // 如果是查看所有奖励，先显示未兑换的，再显示已兑换的
    query = query.order('redeemed', { ascending: true })
                .order('created_at', { ascending: false });
  } else {
    // 其他情况按创建时间倒序排列
    query = query.order('created_at', { ascending: false });
  }

  const { data, error } = await query;

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

/**
 * 兑换奖励
 * @param data 兑换请求数据
 * @returns 兑换后的奖励对象
 */
export async function redeemReward(data: RedeemRewardRequest): Promise<Reward> {
  try {
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.session?.user?.id) {
      console.error('获取用户会话失败:', sessionError);
      throw new Error('用户未登录或会话已过期');
    }
    
    const userId = session.session.user.id;
    
    // 先获取奖励信息
    const { data: reward, error: rewardError } = await supabase
      .from('rewards')
      .select('*')
      .eq('id', data.id)
      .eq('user_id', userId)
      .single();
    
    if (rewardError || !reward) {
      console.error(`获取奖励(ID: ${data.id})失败:`, rewardError);
      throw new Error(`获取奖励失败: ${rewardError?.message || '奖励不存在'}`);
    }
    
    // 检查奖励是否已兑换
    if (reward.redeemed) {
      throw new Error('该奖励已经兑换过了');
    }
    
    // 获取用户当前金币
    const userStats = await getUserStats(userId);
    
    // 检查金币是否足够
    if (!userStats) {
      throw new Error('无法获取用户金币信息');
    }
    
    if (userStats.coins < reward.price) {
      throw new Error(`金币不足，无法兑换。当前金币: ${userStats.coins.toFixed(2)}，需要: ${reward.price.toFixed(2)}`);
    }
    
    // 扣除用户金币 - deductCoins内部会更新数据库，同时会发布金币变化事件
    await deductCoins(userId, reward.price);
    
    // 标记奖励为已兑换
    const currentTime = new Date().toISOString();
    const { data: updatedReward, error: updateError } = await supabase
      .from('rewards')
      .update({
        redeemed: true,
        redeemed_at: currentTime
      })
      .eq('id', data.id)
      .eq('user_id', userId)
      .select('*')
      .single();
    
    if (updateError) {
      console.error(`兑换奖励(ID: ${data.id})失败:`, updateError);
      throw new Error(`兑换奖励失败: ${updateError.message}`);
    }
    
    console.log(`奖励 "${reward.title}" 已成功兑换，扣除 ${reward.price} 金币`);
    
    return updatedReward as Reward;
  } catch (error) {
    console.error('兑换奖励失败:', error);
    throw error;
  }
} 