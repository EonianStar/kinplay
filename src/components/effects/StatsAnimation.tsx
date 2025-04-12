'use client';

import React, { useState, useEffect } from 'react';
import { UserEventType, UserEventData, subscribeToUserEvent } from '@/services/userEvents';

// 动画项目接口
interface AnimationItem {
  id: string;
  type: 'exp' | 'coins';
  value: number;
  timestamp: number;
}

export default function StatsAnimation() {
  const [animations, setAnimations] = useState<AnimationItem[]>([]);
  
  useEffect(() => {
    // 订阅经验变化事件
    const unsubscribeExp = subscribeToUserEvent(UserEventType.EXP_CHANGED, (data) => {
      if (data.difference && data.difference > 0) {
        addAnimation('exp', data.difference);
        playSound('exp');
      }
    });
    
    // 订阅金币变化事件
    const unsubscribeCoins = subscribeToUserEvent(UserEventType.COINS_CHANGED, (data) => {
      if (data.difference && data.difference > 0) {
        addAnimation('coins', data.difference);
        playSound('coins');
      }
    });
    
    // 组件卸载时取消订阅
    return () => {
      unsubscribeExp();
      unsubscribeCoins();
    };
  }, []);
  
  // 添加新的动画项
  const addAnimation = (type: 'exp' | 'coins', value: number) => {
    const newItem: AnimationItem = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      value,
      timestamp: Date.now()
    };
    
    setAnimations(prev => [...prev, newItem]);
    
    // 3秒后移除动画
    setTimeout(() => {
      setAnimations(prev => prev.filter(item => item.id !== newItem.id));
    }, 3000);
  };
  
  // 播放音效
  const playSound = (type: 'exp' | 'coins') => {
    const sound = new Audio(type === 'exp' ? '/sounds/exp.mp3' : '/sounds/coins.mp3');
    sound.volume = 0.3; // 设置音量
    sound.play().catch(e => console.error('播放音效失败:', e));
  };
  
  // 如果没有动画，不渲染任何内容
  if (animations.length === 0) return null;
  
  return (
    <div className="fixed top-20 right-5 z-50 pointer-events-none">
      {animations.map(item => (
        <div 
          key={item.id}
          className={`flex items-center mb-2 animate-float ${
            item.type === 'exp' ? 'text-indigo-600' : 'text-yellow-500'
          }`}
        >
          {item.type === 'exp' ? (
            // 经验图标
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14" width="20" height="20" className="mr-1">
              <path fill="currentColor" fillRule="evenodd" d="M7.00415 2.54498c-.9768-.97868-1.99814-1.46342-2.97991-1.53554-1.10935-.081503-2.0897.37027-2.79796 1.08332-1.392855 1.4023-1.824887 3.93759-.09494 5.69163.00579.00587.01172.01159.01778.01716l5.51682 5.06675c.19126.1756.48516.1756.67642 0l5.51684-5.06675.0074-.00698.0104-.01018c1.7209-1.74491 1.2866-4.2799-.1018-5.68331-.7065-.71418-1.6848-1.168549-2.79318-1.08885-.98088.07053-2.00132.55434-2.97787 1.53275Zm-.35256 1.99217c-.09539-.22131-.30953-.36806-.55035-.37716-.24082-.0091-.46542.12107-.57725.33455L4.66822 6.1283h-.90308c-.34518 0-.625.27982-.625.625 0 .34517.27982.625.625.625h1.28125c.23249 0 .44576-.12905.55364-.335l.42275-.80706 1.0434 2.4207c.08656.20082.27178.34179.4884.37172.21662.02994.43313-.05552.57091-.22534L9.28164 7.3783h.95226c.3452 0 .625-.27983.625-.625 0-.34518-.2798-.625-.625-.625H8.98389c-.18836 0-.36668.08495-.48535.23122l-.69318.85438-1.15377-2.67675Z" clipRule="evenodd"/>
            </svg>
          ) : (
            // 金币图标
            <svg width="20" height="20" viewBox="0 0 14 14" className="mr-1">
              <path fill="currentColor" fillRule="evenodd" d="M2.25 2c-.0663 0-.12989.02634-.17678.07322C2.02634 2.12011 2 2.1837 2 2.25v2c0 .41421-.33579.75-.75.75C.835786 5 .5 4.66421.5 4.25v-2c0-.46413.184375-.90925.51256-1.23744C1.34075.684375 1.78587.5 2.25.5h2c.41421 0 .75.335786.75.75 0 .41421-.33579.75-.75.75h-2ZM9 1.25c0-.414214.33579-.75.75-.75h2c.4641 0 .9092.184375 1.2374.51256.3282.32819.5126.77331.5126 1.23744v2c0 .41421-.3358.75-.75.75S12 4.66421 12 4.25v-2c0-.0663-.0263-.12989-.0732-.17678C11.8799 2.02634 11.8163 2 11.75 2h-2C9.33579 2 9 1.66421 9 1.25Zm4.5 8.5c0-.41421-.3358-.75-.75-.75s-.75.33579-.75.75v2c0 .0663-.0263.1299-.0732.1768-.0469.0469-.1105.0732-.1768.0732h-2c-.41421 0-.75.3358-.75.75s.33579.75.75.75h2c.4641 0 .9092-.1844 1.2374-.5126.3282-.3282.5126-.7733.5126-1.2374v-2ZM1.25 9c.41421 0 .75.33579.75.75v2c0 .0663.02634.1299.07322.1768.04689.0469.11048.0732.17678.0732h2c.41421 0 .75.3358.75.75s-.33579.75-.75.75h-2c-.46413 0-.90925-.1844-1.23744-.5126C.684375 12.6592.5 12.2141.5 11.75v-2c0-.41421.335786-.75.75-.75Z" clipRule="evenodd" />
            </svg>
          )}
          <span className="font-medium text-lg">+{item.value.toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
} 