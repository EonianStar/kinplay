'use client';

import { useState, useEffect } from 'react';
import { LockClosedIcon, LockOpenIcon } from '@heroicons/react/24/outline';

interface ScrollLockButtonProps {
  className?: string;
  onLockChange?: (locked: boolean) => void;
}

/**
 * 页面滚动锁定按钮组件
 * 用于移动端在拖拽排序时锁定页面滚动
 */
const ScrollLockButton = ({ className = '', onLockChange }: ScrollLockButtonProps) => {
  const [isLocked, setIsLocked] = useState(false);

  // 切换锁定状态
  const toggleLock = () => {
    const newLockedState = !isLocked;
    setIsLocked(newLockedState);
    
    // 调用回调函数通知父组件锁定状态变化
    if (onLockChange) {
      onLockChange(newLockedState);
    }
  };

  // 监听锁定状态变化，控制页面滚动
  useEffect(() => {
    if (isLocked) {
      // 锁定页面滚动
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      
      // 保存当前滚动位置
      document.body.style.top = `-${window.scrollY}px`;
    } else {
      // 恢复页面滚动
      const scrollY = document.body.style.top;
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      
      // 恢复滚动位置
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY.replace('-', '')) || 0);
      }
    }
  }, [isLocked]);

  return (
    <button
      onClick={toggleLock}
      className={`fixed bottom-6 right-6 z-50 p-3 rounded-full shadow-lg bg-indigo-600 text-white ${className} ${isLocked ? 'bg-red-500' : ''}`}
      aria-label={isLocked ? '解锁页面滚动' : '锁定页面滚动'}
    >
      {isLocked ? (
        <LockClosedIcon className="h-6 w-6" />
      ) : (
        <LockOpenIcon className="h-6 w-6" />
      )}
    </button>
  );
};

export default ScrollLockButton;