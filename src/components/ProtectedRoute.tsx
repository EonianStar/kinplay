'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  // 使用useEffect确保代码只在客户端执行
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // 只有当客户端渲染且认证状态已加载完成时再检查
    if (isClient && !loading) {
      if (!user) {
        // 使用replace而不是push，避免在历史记录中留下需要认证的页面
        router.replace('/login');
      }
    }
  }, [user, loading, router, isClient]);

  // 在服务器端渲染或认证加载期间显示加载界面
  if (!isClient || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // 在客户端且未认证时不渲染内容
  if (!user) {
    return null;
  }

  // 已认证，渲染子组件
  return <>{children}</>;
} 