/**
 * 自动逾期检查服务
 * 处理习惯、日常任务和待办事项的逾期检查和价值权重调整
 */

import { supabase } from '@/lib/supabase';
import { Habit, HabitNature } from '@/types/habit';
import { Daily, DailyRepeatPeriod } from '@/types/daily';
import { Todo } from '@/types/todo';
import { ValueLevel, decreaseValueLevel } from '@/utils/valueLevel';
import { 
  getUserTimeZone, 
  getNextHabitDueDate, 
  shouldCheckDailyDueOnDate,
  shouldCheckYearlyDailyDueOnDate,
  getTodoDueDateTime,
  isDateOverdue,
  getDaysBetween
} from '@/utils/dateTime';

/**
 * 检查并处理习惯的逾期情况
 * @param userId 用户ID
 */
export async function checkHabitsOverdue(userId: string): Promise<void> {
  try {
    const timezone = getUserTimeZone();
    const now = new Date();
    
    // 获取所有需要检查的习惯（好习惯或双向习惯）
    const { data: habits, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .contains('nature', [HabitNature.GOOD]); // 包含 GOOD 性质的习惯
    
    if (error) {
      console.error('获取习惯失败:', error);
      return;
    }
    
    if (!habits || habits.length === 0) return;
    
    // 遍历每个习惯，检查是否逾期
    for (const habit of habits) {
      // 获取习惯下一个检查日期
      const nextDueDate = getNextHabitDueDate(habit.created_at, timezone);
      
      // 如果已过期且尚未进行今天的检查，更新价值权重等级
      if (isDateOverdue(nextDueDate)) {
        // 检查最后逾期检查时间，如果今天已经检查过则跳过
        if (habit.last_due_check) {
          const lastCheckDate = new Date(habit.last_due_check);
          const today = new Date();
          if (
            lastCheckDate.getFullYear() === today.getFullYear() &&
            lastCheckDate.getMonth() === today.getMonth() &&
            lastCheckDate.getDate() === today.getDate()
          ) {
            console.log(`习惯 "${habit.title}" 今天已检查过逾期状态，跳过`);
            continue;
          }
        }
        
        const currentValueLevel = habit.value_level || 0;
        const newValueLevel = decreaseValueLevel(currentValueLevel);
        
        // 更新习惯的价值权重等级和最后检查时间
        await supabase
          .from('habits')
          .update({ 
            value_level: newValueLevel,
            last_due_check: new Date().toISOString()
          })
          .eq('id', habit.id)
          .eq('user_id', userId);
        
        console.log(`习惯 "${habit.title}" 已逾期，价值权重等级从 ${currentValueLevel} 降至 ${newValueLevel}`);
      }
    }
  } catch (error) {
    console.error('检查习惯逾期失败:', error);
  }
}

/**
 * 检查并处理日常任务的逾期情况
 * @param userId 用户ID
 */
export async function checkDailiesOverdue(userId: string): Promise<void> {
  try {
    const timezone = getUserTimeZone();
    const now = new Date();
    
    // 获取所有日常任务
    const { data: dailies, error } = await supabase
      .from('dailies')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error('获取日常任务失败:', error);
      return;
    }
    
    if (!dailies || dailies.length === 0) return;
    
    // 遍历每个日常任务，检查是否逾期
    for (const daily of dailies) {
      let shouldCheck = false;
      
      // 检查最后逾期检查时间，如果今天已经检查过则跳过
      if (daily.last_due_check) {
        const lastCheckDate = new Date(daily.last_due_check);
        const today = new Date();
        if (
          lastCheckDate.getFullYear() === today.getFullYear() &&
          lastCheckDate.getMonth() === today.getMonth() &&
          lastCheckDate.getDate() === today.getDate()
        ) {
          console.log(`日常任务 "${daily.title}" 今天已检查过逾期状态，跳过`);
          continue;
        }
      }
      
      // 根据不同的重复周期判断是否应该检查
      switch (daily.repeat_period) {
        case DailyRepeatPeriod.DAILY:
          // 每日任务，每天结束时检查
          shouldCheck = true;
          break;
          
        case DailyRepeatPeriod.WEEKLY:
          // 每周任务，在指定的周几检查
          if (Array.isArray(daily.active_pattern.value)) {
            shouldCheck = shouldCheckDailyDueOnDate(
              daily.active_pattern.value as number[],
              now,
              false
            );
          }
          break;
          
        case DailyRepeatPeriod.MONTHLY:
          // 每月任务，在指定的日期检查
          if (Array.isArray(daily.active_pattern.value)) {
            shouldCheck = shouldCheckDailyDueOnDate(
              daily.active_pattern.value as number[],
              now,
              true
            );
          }
          break;
          
        case DailyRepeatPeriod.YEARLY:
          // 每年任务，在指定月份的最后一天检查
          if (Array.isArray(daily.active_pattern.value)) {
            shouldCheck = shouldCheckYearlyDailyDueOnDate(
              daily.active_pattern.value as number[],
              now
            );
          }
          break;
      }
      
      // 如果需要检查且没有完成，降低价值权重等级
      if (shouldCheck) {
        // 获取该日常任务今天的完成记录
        const { data: completions } = await supabase
          .from('daily_completions')
          .select('*')
          .eq('daily_id', daily.id)
          .gte('completed_at', new Date().toISOString().split('T')[0]); // 当天开始
        
        // 如果没有完成记录，降低价值权重等级
        if (!completions || completions.length === 0) {
          const currentValueLevel = daily.value_level || 0;
          const newValueLevel = decreaseValueLevel(currentValueLevel);
          
          // 更新日常任务的价值权重等级和最后检查时间
          await supabase
            .from('dailies')
            .update({ 
              value_level: newValueLevel,
              streak_count: 0, // 重置连击次数
              last_due_check: new Date().toISOString()
            })
            .eq('id', daily.id)
            .eq('user_id', userId);
          
          console.log(`日常任务 "${daily.title}" 已逾期，价值权重等级从 ${currentValueLevel} 降至 ${newValueLevel}`);
        } else {
          // 更新最后检查时间
          await supabase
            .from('dailies')
            .update({ 
              last_due_check: new Date().toISOString()
            })
            .eq('id', daily.id)
            .eq('user_id', userId);
        }
      }
    }
  } catch (error) {
    console.error('检查日常任务逾期失败:', error);
  }
}

/**
 * 检查并处理待办事项的逾期情况
 * @param userId 用户ID
 */
export async function checkTodosOverdue(userId: string): Promise<void> {
  try {
    const timezone = getUserTimeZone();
    
    // 获取所有未完成且有截止日期的待办事项
    const { data: todos, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', userId)
      .eq('completed', false)
      .not('due_date', 'is', null);
    
    if (error) {
      console.error('获取待办事项失败:', error);
      return;
    }
    
    if (!todos || todos.length === 0) return;
    
    // 获取当前日期
    const today = new Date();
    
    // 遍历每个待办事项，检查是否逾期及逾期天数
    for (const todo of todos) {
      if (!todo.due_date) continue;
      
      // 检查最后逾期检查时间，如果今天已经检查过则跳过
      if (todo.last_due_check) {
        const lastCheckDate = new Date(todo.last_due_check);
        if (
          lastCheckDate.getFullYear() === today.getFullYear() &&
          lastCheckDate.getMonth() === today.getMonth() &&
          lastCheckDate.getDate() === today.getDate()
        ) {
          console.log(`待办事项 "${todo.title}" 今天已检查过逾期状态，跳过`);
          continue;
        }
      }
      
      // 获取待办事项的逾期时间点
      const dueDateTime = getTodoDueDateTime(todo.due_date, timezone);
      
      // 如果已逾期，计算逾期天数并相应调整价值权重等级
      if (isDateOverdue(dueDateTime)) {
        const daysPastDue = getDaysBetween(dueDateTime);
        let newValueLevel = 0;
        
        // 根据逾期天数确定价值权重等级
        if (daysPastDue < 8) {
          newValueLevel = ValueLevel.NEGATIVE_ONE;
        } else if (daysPastDue < 31) {
          newValueLevel = ValueLevel.NEGATIVE_TWO;
        } else if (daysPastDue < 120) {
          newValueLevel = ValueLevel.NEGATIVE_THREE;
        } else {
          newValueLevel = ValueLevel.NEGATIVE_FOUR;
        }
        
        // 更新待办事项的价值权重等级和最后检查时间
        await supabase
          .from('todos')
          .update({ 
            value_level: newValueLevel,
            last_due_check: new Date().toISOString()
          })
          .eq('id', todo.id)
          .eq('user_id', userId);
        
        console.log(`待办事项 "${todo.title}" 已逾期 ${daysPastDue} 天，价值权重等级设为 ${newValueLevel}`);
      } else {
        // 未逾期但已检查，更新最后检查时间
        await supabase
          .from('todos')
          .update({ 
            last_due_check: new Date().toISOString()
          })
          .eq('id', todo.id)
          .eq('user_id', userId);
      }
    }
  } catch (error) {
    console.error('检查待办事项逾期失败:', error);
  }
}

/**
 * 执行所有逾期检查
 */
export async function runAllOverdueChecks(): Promise<void> {
  const { data: auth } = await supabase.auth.getSession();
  if (!auth.session) return;
  
  const userId = auth.session.user.id;
  
  await checkHabitsOverdue(userId);
  await checkDailiesOverdue(userId);
  await checkTodosOverdue(userId);
} 