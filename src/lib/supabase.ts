'use client';

import { createClient } from '@supabase/supabase-js';
import env from '../config/env';

// 使用环境变量配置文件
const supabaseUrl = env.SUPABASE_URL;
const supabaseAnonKey = env.SUPABASE_ANON_KEY;

// 添加更强健的错误处理
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  // 提供后备URL和密钥或使用空字符串避免抛出错误
  // 在生产环境中，您应该有适当的错误处理策略
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey, 
  {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
    },
    global: {
      // 设置更长的超时时间，防止通道过早关闭
      fetch: (url, options) => {
        const controller = new AbortController();
        const { signal } = controller;
        
        // 在60秒后取消请求
        const timeoutId = setTimeout(() => controller.abort(), 60000);
        
        return fetch(url, { ...options, signal })
          .catch(error => {
            console.error('Supabase fetch error:', error);
            throw error;
          })
          .finally(() => clearTimeout(timeoutId));
      }
    },
    realtime: {
      // 增加心跳检查频率，保持连接活跃
      timeout: 60000,
      heartbeatIntervalMs: 15000
  }
  }
);

// 用户统计数据类型定义
export interface UserStats {
  id: string;           // UUID
  user_id: string;      // 用户ID（auth.uid）
  exp: number;          // 成长经验值
  coins: number;        // 任务金币
  tasks_completed: number; // 已完成任务数
  streak: number;       // 连续完成任务天数
  last_updated: string; // 最后更新时间
  created_at: string;   // 创建时间
}

// 默认统计数据
export const DEFAULT_USER_STATS: Partial<UserStats> = {
  exp: 0,
  coins: 0,
  tasks_completed: 0,
  streak: 0,
}; 