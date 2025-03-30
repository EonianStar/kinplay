'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { runAllOverdueChecks } from '@/services/overdueCheck';

/**
 * 逾期检查器组件
 * 该组件会在客户端加载后定期执行逾期检查
 */
export default function OverdueChecker() {
  const { user, loading } = useAuth();
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  
  // 检查间隔时间（毫秒）
  const CHECK_INTERVAL = 60 * 60 * 1000; // 1小时
  
  useEffect(() => {
    // 如果用户未登录或正在加载中，不执行检查
    if (loading || !user) return;
    
    // 创建一个函数执行检查
    const performCheck = async () => {
      try {
        const now = new Date();
        
        // 如果上次检查是在1小时之内，跳过
        if (lastCheck && (now.getTime() - lastCheck.getTime()) < CHECK_INTERVAL) {
          return;
        }
        
        console.log('执行逾期检查...');
        await runAllOverdueChecks();
        
        // 更新上次检查时间
        setLastCheck(now);
        console.log('逾期检查完成');
      } catch (error) {
        console.error('执行逾期检查时出错:', error);
      }
    };
    
    // 页面加载后立即执行一次
    performCheck();
    
    // 设置定期检查
    const intervalId = setInterval(performCheck, CHECK_INTERVAL);
    
    // 组件卸载时清除定时器
    return () => clearInterval(intervalId);
  }, [user, loading, lastCheck]);
  
  // 这个组件不渲染任何内容
  return null;
} 