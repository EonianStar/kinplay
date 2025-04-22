// 日常任务重复周期枚举
export enum DailyRepeatPeriod {
  DAILY = 'daily',    // 每日
  WEEKLY = 'weekly',  // 每周
  MONTHLY = 'monthly', // 每月
  YEARLY = 'yearly'   // 每年
}

// 日常任务难度枚举（四个级别）
export enum DailyDifficulty {
  VERY_EASY = 'very_easy', // 容易
  EASY = 'easy',           // 简单
  MEDIUM = 'medium',       // 中等
  HARD = 'hard'            // 困难
}

// 活跃方式类型定义（根据重复周期不同）
export type WeeklyActiveDays = number[]; // 1-7 代表周一到周日
export type MonthlyActiveDays = number[]; // 1-31 代表每月的日期
export type YearlyActiveMonths = number[]; // 1-12 代表每年的月份

// 活跃方式联合类型
export type ActivePattern = {
  type: DailyRepeatPeriod;
  value: WeeklyActiveDays | MonthlyActiveDays | YearlyActiveMonths | number; // 当类型为每日时，值为每日次数；其他为对应的数组
  target?: number; // 目标点击次数，达到后任务转为休眠状态
  clicked_count?: number; // 当前已点击次数
};

// 日常任务类型定义
export interface Daily {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  checklist?: DailyTask[]; // 子任务清单
  difficulty: DailyDifficulty;
  start_date: string; // ISO 格式的日期
  repeat_period: DailyRepeatPeriod;
  active_pattern: ActivePattern;
  streak_count: number; // 连击次数
  tags: string[];
  created_at: string;
  updated_at: string;
  value_level?: number; // 价值权重等级（-4到4的整数，默认为0）
}

// 日常任务的子任务
export interface DailyTask {
  id: string;
  daily_id: string;
  title: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

// 创建日常任务的请求类型
export interface CreateDailyRequest {
  title: string;
  description?: string;
  checklist?: { title: string; completed?: boolean }[];
  difficulty: DailyDifficulty;
  start_date: string;
  repeat_period: DailyRepeatPeriod;
  active_pattern: ActivePattern;
  tags?: string[];
  streak_count?: number;
}

// 更新日常任务的请求类型
export interface UpdateDailyRequest {
  id: string;
  title?: string;
  description?: string;
  checklist?: { id?: string; title: string; completed?: boolean }[];
  difficulty?: DailyDifficulty;
  start_date?: string;
  repeat_period?: DailyRepeatPeriod;
  active_pattern?: ActivePattern;
  streak_count?: number;
  tags?: string[];
  value_level?: number; // 价值权重等级
} 