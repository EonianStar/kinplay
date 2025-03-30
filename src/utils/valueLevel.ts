/**
 * 价值权重等级工具函数
 */

// 价值权重等级范围
export enum ValueLevel {
  NEGATIVE_FOUR = -4,
  NEGATIVE_THREE = -3,
  NEGATIVE_TWO = -2,
  NEGATIVE_ONE = -1,
  NEUTRAL = 0,
  POSITIVE_ONE = 1,
  POSITIVE_TWO = 2,
  POSITIVE_THREE = 3,
  POSITIVE_FOUR = 4
}

// 价值权重系数映射
export const valueLevelWeights: Record<ValueLevel, number> = {
  [ValueLevel.NEGATIVE_FOUR]: 0.50,
  [ValueLevel.NEGATIVE_THREE]: 0.65,
  [ValueLevel.NEGATIVE_TWO]: 0.80,
  [ValueLevel.NEGATIVE_ONE]: 0.90,
  [ValueLevel.NEUTRAL]: 1.00,
  [ValueLevel.POSITIVE_ONE]: 1.10,
  [ValueLevel.POSITIVE_TWO]: 1.20,
  [ValueLevel.POSITIVE_THREE]: 1.35,
  [ValueLevel.POSITIVE_FOUR]: 1.50
};

// 价值权重颜色映射
export const valueLevelColors: Record<ValueLevel, string> = {
  [ValueLevel.NEGATIVE_FOUR]: '#D81B60',
  [ValueLevel.NEGATIVE_THREE]: '#E24B56',
  [ValueLevel.NEGATIVE_TWO]: '#EB7A4B',
  [ValueLevel.NEGATIVE_ONE]: '#F4A940',
  [ValueLevel.NEUTRAL]: '#FDD835',
  [ValueLevel.POSITIVE_ONE]: '#D5D253',
  [ValueLevel.POSITIVE_TWO]: '#ADCB71',
  [ValueLevel.POSITIVE_THREE]: '#85C58F',
  [ValueLevel.POSITIVE_FOUR]: '#5DBEAC'
};

/**
 * 增加价值权重等级
 * @param currentLevel 当前等级
 * @param increment 增加的等级数量
 * @returns 新的等级
 */
export function increaseValueLevel(currentLevel: number, increment: number = 1): number {
  const newLevel = Math.min(ValueLevel.POSITIVE_FOUR, currentLevel + increment);
  return newLevel;
}

/**
 * 降低价值权重等级
 * @param currentLevel 当前等级
 * @param decrement 降低的等级数量
 * @returns 新的等级
 */
export function decreaseValueLevel(currentLevel: number, decrement: number = 1): number {
  const newLevel = Math.max(ValueLevel.NEGATIVE_FOUR, currentLevel - decrement);
  return newLevel;
}

/**
 * 根据待办事项逾期天数计算价值权重等级
 * @param daysPastDue 逾期天数
 * @returns 权重等级调整值
 */
export function getValueLevelAdjustmentByOverdue(daysPastDue: number): number {
  if (daysPastDue < 1) return 0;
  if (daysPastDue < 8) return -1;
  if (daysPastDue < 31) return -2;
  if (daysPastDue < 120) return -3;
  return -4;
}

/**
 * 根据价值权重等级获取颜色
 * @param level 价值权重等级
 * @returns 对应的颜色代码
 */
export function getColorByValueLevel(level: number): string {
  // 确保 level 在有效范围内
  const safeLevel = Math.max(ValueLevel.NEGATIVE_FOUR, Math.min(ValueLevel.POSITIVE_FOUR, level)) as ValueLevel;
  return valueLevelColors[safeLevel];
}

/**
 * 获取价值权重系数
 * @param level 价值权重等级
 * @returns 权重系数
 */
export function getWeightByValueLevel(level: number): number {
  // 确保 level 在有效范围内
  const safeLevel = Math.max(ValueLevel.NEGATIVE_FOUR, Math.min(ValueLevel.POSITIVE_FOUR, level)) as ValueLevel;
  return valueLevelWeights[safeLevel];
} 