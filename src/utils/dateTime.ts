/**
 * 日期和时区处理工具函数
 */

import { format, isAfter, isBefore, startOfDay, endOfDay, addDays, getDay, isLastDayOfMonth, getMonth } from 'date-fns';
import { toZonedTime, formatInTimeZone } from 'date-fns-tz';

/**
 * 获取当前用户的时区
 * @returns 用户的时区字符串，如 'Asia/Shanghai'
 */
export function getUserTimeZone(): string {
  // 尝试获取用户的时区
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return userTimeZone || 'UTC'; // 如果无法获取，默认使用 UTC
}

/**
 * 获取给定时区当天的结束时间（23:59:59.999）
 * @param timezone 时区字符串
 * @param date 可选，特定日期，默认为当前日期
 * @returns 时区对应的当天结束时间（ISO 格式）
 */
export function getEndOfDayInTimeZone(timezone: string, date?: Date): string {
  const targetDate = date || new Date();
  const zonedDate = toZonedTime(targetDate, timezone);
  const endOfDayDate = endOfDay(zonedDate);
  
  // 直接格式化为带时区的ISO字符串
  return formatInTimeZone(endOfDayDate, timezone, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
}

/**
 * 获取习惯的下一个逾期检查时间
 * @param creationDate 习惯创建时间（ISO 格式）
 * @param timezone 用户时区
 * @returns 下一个逾期检查时间（ISO 格式）
 */
export function getNextHabitDueDate(creationDate: string, timezone: string): string {
  // 将创建时间转换为时区时间
  const creationDateInTZ = toZonedTime(new Date(creationDate), timezone);
  
  // 获取当前时区日期
  const nowInTZ = toZonedTime(new Date(), timezone);
  
  // 计算下一个检查日期（创建日期后的第二天）
  const nextDayInTZ = addDays(startOfDay(creationDateInTZ), 1);
  
  // 如果当前时间已经超过了下一个检查日期，则计算今天的结束时间
  if (isAfter(nowInTZ, nextDayInTZ)) {
    return getEndOfDayInTimeZone(timezone);
  }
  
  // 否则返回下一个检查日期的结束时间
  return getEndOfDayInTimeZone(timezone, nextDayInTZ);
}

/**
 * 检查日常任务是否应在特定日期逾期
 * @param activeDays 活跃天数/月份数组
 * @param date 要检查的日期
 * @param isMonthly 是否是按月重复（否则按周）
 * @returns 是否应该在这一天检查逾期
 */
export function shouldCheckDailyDueOnDate(activeDays: number[], date: Date, isMonthly: boolean): boolean {
  if (isMonthly) {
    // 对于按月重复的任务，检查是否是月中的特定日期
    const dayOfMonth = date.getDate();
    return activeDays.includes(dayOfMonth);
  } else {
    // 对于按周重复的任务，检查是否是周中的特定日期
    // getDay: 0 = 周日, 1-6 = 周一至周六
    const dayOfWeek = getDay(date);
    // 转换为我们的格式：1-7 = 周一至周日
    const adjustedDay = dayOfWeek === 0 ? 7 : dayOfWeek;
    return activeDays.includes(adjustedDay);
  }
}

/**
 * 检查每年重复的日常任务是否应在特定日期逾期
 * @param activeMonths 活跃月份数组 (1-12)
 * @param date 要检查的日期
 * @returns 是否应该在这一天检查逾期
 */
export function shouldCheckYearlyDailyDueOnDate(activeMonths: number[], date: Date): boolean {
  // 对于按年重复的任务，检查是否是年中的特定月份的最后一天
  const month = getMonth(date) + 1; // getMonth 返回 0-11
  return activeMonths.includes(month) && isLastDayOfMonth(date);
}

/**
 * 获取待办事项的逾期日期（截止日期的结束时间）
 * @param dueDate 截止日期（ISO 格式）
 * @param timezone 用户时区
 * @returns 逾期时间（ISO 格式）
 */
export function getTodoDueDateTime(dueDate: string, timezone: string): string {
  // 将截止日期转换为时区时间的当天结束
  const dueDateInTZ = toZonedTime(new Date(dueDate), timezone);
  return getEndOfDayInTimeZone(timezone, dueDateInTZ);
}

/**
 * 检查一个日期是否已经过期（相对于当前时间）
 * @param date 要检查的日期（ISO 格式）
 * @returns 是否已过期
 */
export function isDateOverdue(date: string): boolean {
  return isBefore(new Date(date), new Date());
}

/**
 * 计算两个日期之间相差的天数
 * @param date1 日期1（ISO 格式）
 * @param date2 日期2（ISO 格式），默认为当前时间
 * @returns 相差的天数
 */
export function getDaysBetween(date1: string, date2?: string): number {
  const d1 = new Date(date1);
  const d2 = date2 ? new Date(date2) : new Date();
  
  // 转换为毫秒并计算差值
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
} 