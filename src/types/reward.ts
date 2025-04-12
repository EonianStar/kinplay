/**
 * 奖励数据类型定义
 */

// 奖励图标枚举
export enum RewardIcon {
  GIFT = 'gift',           // 礼物
  TRAVEL = 'travel',       // 旅行
  MOVIE = 'movie',         // 看电影
  CONCERT = 'concert',     // 演唱会
  TOY = 'toy',             // 玩具
  GAME = 'game',           // 游戏
  BAG = 'bag',             // 包
  JEWELRY = 'jewelry',     // 首饰
  CLOTHING = 'clothing',   // 服饰
  CAR = 'car',             // 汽车
  BOAT = 'boat',           // 帆船
  HOUSE = 'house',         // 房子
  PLANE = 'plane',         // 飞机
  FOOD = 'food',           // 美食
  BOOK = 'book',           // 书籍
  TECH = 'tech',           // 电子产品
  INSTRUMENT = 'instrument', // 乐器
  BEAUTY = 'beauty',        // 美妆
  SPORTS = 'sports',        // 运动
  EDUCATION = 'education',  // 教育
  EXPERIENCE = 'experience' // 体验
}

// 奖励数据结构
export interface Reward {
  id: string;             // 唯一标识符
  user_id: string;        // 所属用户ID
  title: string;          // 标题（必填）
  description: string;    // 说明（必填）
  price: number;          // 价格（必填）
  icon: string;           // 图标（必选）
  created_at: string;     // 创建时间
  updated_at: string;     // 更新时间
  position?: number;      // 位置（用于排序，可选）
  redeemed: boolean;      // 是否已兑换
  redeemed_at?: string;   // 兑换时间
}

// 奖励状态枚举
export enum RewardStatus {
  PENDING = 'pending',    // 待兑换
  REDEEMED = 'redeemed',  // 已兑换
  ALL = 'all'             // 全部
}

// 创建奖励请求接口
export interface CreateRewardRequest {
  title: string;          // 标题（必填）
  description: string;    // 说明（必填）
  price: number;          // 价格（必填）
  icon: string;           // 图标（必选）
}

// 更新奖励请求接口
export interface UpdateRewardRequest {
  id: string;             // 唯一标识符
  title?: string;         // 标题
  description?: string;   // 说明
  price?: number;         // 价格
  icon?: string;          // 图标
}

// 兑换奖励请求接口
export interface RedeemRewardRequest {
  id: string;             // 奖励ID
}

export const DEFAULT_ICONS = [
  'smirk',           // 假笑
  'bag',             // 包
  'book',            // 书籍
  'camping',         // 露营
  'chat',            // 聊天
  'device',          // 设备
  'dice',            // 骰子
  'dictionary',      // 字典
  'discount',        // 折扣
  'fireworks',       // 烟花
  'game',            // 游戏
  'gourmet',         // 美食
  'increase',        // 增长
  'music',           // 音乐
  'peace',           // 和平
  'pen',             // 钢笔
  'photo',           // 照片
  'production',      // 生产
  'puzzle',          // 拼图
  'robot',           // 机器人
  'school',          // 学校
  'snorkle',         // 潜水
  'spring',          // 春天
  'sprout',          // 发芽
  'store',           // 商店
  'telescope',       // 望远镜
  'ticket',          // 票
  'toy',             // 玩具
  'travel',          // 旅行
  'vr',              // 虚拟现实
  'watch',           // 手表
  'wave'             // 波浪
];

export const DEFAULT_REWARD: Omit<Reward, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'redeemed' | 'redeemed_at'> = {
  title: '',
  description: '',
  price: 10,
  icon: 'smirk'
}; 