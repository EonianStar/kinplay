/**
 * 用户经验系统和金币系统计算模块
 */

import { getWeightByValueLevel } from './valueLevel';

// 基础值
export const BASE_EXPERIENCE = 2.0;
export const BASE_COINS = 1.0;

// 任务类型权重
export enum TaskTypeWeight {
  HABIT = 1.0,        // 培养习惯
  DAILY = 1.1,        // 日常任务
  TODO_NO_DUE = 1.2,  // 待办事项(无期限)
  TODO_WITH_DUE = 1.3 // 待办事项(有期限)
}

// 难度系数权重
export enum DifficultyWeight {
  VERY_EASY = 0.8, // 容易
  EASY = 1.0,      // 简单
  MEDIUM = 1.2,    // 中等
  HARD = 1.6       // 困难
}

/**
 * 根据任务类型获取权重
 * @param taskType 任务类型 (habit, daily, todo)
 * @param hasDueDate 是否有截止日期
 * @returns 任务类型权重
 */
export function getTaskTypeWeight(taskType: string, hasDueDate: boolean = false): number {
  switch (taskType) {
    case 'habit':
      return TaskTypeWeight.HABIT;
    case 'daily':
      return TaskTypeWeight.DAILY;
    case 'todo':
      return hasDueDate ? TaskTypeWeight.TODO_WITH_DUE : TaskTypeWeight.TODO_NO_DUE;
    default:
      return 1.0; // 默认权重
  }
}

/**
 * 根据难度获取权重
 * @param difficulty 难度级别 (very_easy, easy, medium, hard)
 * @returns 难度权重
 */
export function getDifficultyWeight(difficulty: string): number {
  switch (difficulty) {
    case 'very_easy':
      return DifficultyWeight.VERY_EASY;
    case 'easy':
      return DifficultyWeight.EASY;
    case 'medium':
      return DifficultyWeight.MEDIUM;
    case 'hard':
      return DifficultyWeight.HARD;
    default:
      return DifficultyWeight.EASY; // 默认为简单难度
  }
}

/**
 * 计算任务完成获得的经验
 * @param taskType 任务类型 (habit, daily, todo)
 * @param difficulty 难度级别 (very_easy, easy, medium, hard)
 * @param valueLevel 价值权重等级 (-4 到 4 的整数)
 * @param hasDueDate 是否有截止日期 (仅对待办事项有效)
 * @returns 获得的经验值
 */
export function calculateExperience(
  taskType: string,
  difficulty: string,
  valueLevel: number = 0,
  hasDueDate: boolean = false
): number {
  const taskTypeWeight = getTaskTypeWeight(taskType, hasDueDate);
  const difficultyWeight = getDifficultyWeight(difficulty);
  const valueWeight = getWeightByValueLevel(valueLevel);
  
  return Math.round(BASE_EXPERIENCE * taskTypeWeight * difficultyWeight * valueWeight * 100) / 100;
}

/**
 * 计算任务完成获得的金币
 * @param taskType 任务类型 (habit, daily, todo)
 * @param difficulty 难度级别 (very_easy, easy, medium, hard)
 * @param valueLevel 价值权重等级 (-4 到 4 的整数)
 * @param hasDueDate 是否有截止日期 (仅对待办事项有效)
 * @returns 获得的金币数
 */
export function calculateCoins(
  taskType: string,
  difficulty: string,
  valueLevel: number = 0,
  hasDueDate: boolean = false
): number {
  const taskTypeWeight = getTaskTypeWeight(taskType, hasDueDate);
  const difficultyWeight = getDifficultyWeight(difficulty);
  const valueWeight = getWeightByValueLevel(valueLevel);
  
  return Math.round(BASE_COINS * taskTypeWeight * difficultyWeight * valueWeight * 100) / 100;
} 