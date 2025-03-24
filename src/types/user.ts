export interface UserStats {
  uid: string;           // 用户ID
  exp: number;          // 成长经验值
  coins: number;        // 任务金币
  tasksCompleted: number; // 已完成任务数
  streak: number;       // 连续完成任务天数
  lastUpdated: Date;    // 最后更新时间
  createdAt: Date;      // 创建时间
}

// 新用户默认统计数据
export const DEFAULT_USER_STATS: Omit<UserStats, 'uid' | 'createdAt' | 'lastUpdated'> = {
  exp: 0,
  coins: 0,
  tasksCompleted: 0,
  streak: 0,
}; 