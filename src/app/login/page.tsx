'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import EmailPasswordLoginForm from '@/components/EmailPasswordLoginForm';
import EmailPasswordRegisterForm from '@/components/EmailPasswordRegisterForm';

export default function LoginPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isLogin ? '登录到 KinPlay' : '注册 KinPlay 账号'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isLogin ? '开始你的家庭游戏化之旅' : '创建账号，开启全新体验'}
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {isLogin ? <EmailPasswordLoginForm /> : <EmailPasswordRegisterForm />}
          
          <div className="text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
            >
              {isLogin ? '还没有账号？点击注册' : '已有账号？点击登录'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 