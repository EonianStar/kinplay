// 习惯难度枚举
export enum HabitDifficulty {
  VERY_EASY = 'very_easy',
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
}

// 习惯重置周期枚举
export enum HabitResetPeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly'
}

// 习惯性质枚举
export enum HabitNature {
  GOOD = 'good',
  BAD = 'bad'
}

// 预设标签
export const PRESET_TAGS = [
  '健康', '学习', '工作', '生活', '运动', '阅读', '冥想', '写作'
] as const;

// 难度系数映射
export const DIFFICULTY_COEFFICIENTS: Record<HabitDifficulty, number> = {
  [HabitDifficulty.VERY_EASY]: 0.5,
  [HabitDifficulty.EASY]: 1,
  [HabitDifficulty.MEDIUM]: 2,
  [HabitDifficulty.HARD]: 3,
};

// 习惯接口
export interface Habit {
  id: number;
  user_id: string;
  title: string;
  description?: string;
  nature: HabitNature[];
  difficulty: HabitDifficulty;
  tags: string[];
  reset_period: HabitResetPeriod;
  good_count: number;
  bad_count: number;
  created_at: string;
  updated_at: string;
}

// 创建习惯请求接口
export interface CreateHabitRequest {
  title: string;
  description?: string;
  nature: HabitNature[];
  difficulty: HabitDifficulty;
  tags: string[];
  reset_period: HabitResetPeriod;
  good_count: number;
  bad_count: number;
}

// 更新习惯请求体
export type UpdateHabitRequest = Partial<CreateHabitRequest>; 