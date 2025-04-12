/**
 * 用户事件系统 - 处理用户统计数据变化通知
 */

// 事件类型
export enum UserEventType {
  EXP_CHANGED = 'exp_changed',
  COINS_CHANGED = 'coins_changed',
  STATS_CHANGED = 'stats_changed'
}

// 事件数据接口
export interface UserEventData {
  type: UserEventType;
  userId: string;
  oldValue?: number;
  newValue?: number;
  difference?: number;
}

// 事件订阅回调函数类型
type EventCallback = (data: UserEventData) => void;

// 事件订阅存储
const subscribers: Map<UserEventType, EventCallback[]> = new Map();

/**
 * 订阅用户事件
 * @param eventType 事件类型
 * @param callback 回调函数
 * @returns 取消订阅的函数
 */
export function subscribeToUserEvent(eventType: UserEventType, callback: EventCallback): () => void {
  if (!subscribers.has(eventType)) {
    subscribers.set(eventType, []);
  }
  
  const eventCallbacks = subscribers.get(eventType)!;
  eventCallbacks.push(callback);
  
  // 返回取消订阅的函数
  return () => {
    const callbacks = subscribers.get(eventType);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    }
  };
}

/**
 * 发布用户事件
 * @param data 事件数据
 */
export function publishUserEvent(data: UserEventData): void {
  const { type } = data;
  
  // 如果有针对特定事件类型的订阅者，通知他们
  const eventCallbacks = subscribers.get(type);
  if (eventCallbacks) {
    eventCallbacks.forEach(callback => callback(data));
  }
  
  // 同时通知所有STATS_CHANGED订阅者
  if (type !== UserEventType.STATS_CHANGED) {
    const statsCallbacks = subscribers.get(UserEventType.STATS_CHANGED);
    if (statsCallbacks) {
      statsCallbacks.forEach(callback => callback(data));
    }
  }
}

/**
 * 发布经验值变化事件
 * @param userId 用户ID
 * @param oldValue 旧值
 * @param newValue 新值
 */
export function publishExpChange(userId: string, oldValue: number, newValue: number): void {
  publishUserEvent({
    type: UserEventType.EXP_CHANGED,
    userId,
    oldValue,
    newValue,
    difference: newValue - oldValue
  });
}

/**
 * 发布金币变化事件
 * @param userId 用户ID
 * @param oldValue 旧值
 * @param newValue 新值
 */
export function publishCoinsChange(userId: string, oldValue: number, newValue: number): void {
  publishUserEvent({
    type: UserEventType.COINS_CHANGED,
    userId,
    oldValue,
    newValue,
    difference: newValue - oldValue
  });
} 