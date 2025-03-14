'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* 欢迎区域 */}
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          欢迎回来，{user?.displayName || '亲爱的用户'}
        </h1>
        <p className="mt-2 text-gray-600">
          开始你的家庭游戏化之旅吧！
        </p>
      </div>

      {/* 快速访问区域 */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* 任务卡片 */}
        <Link href="/dashboard/tasks" 
          className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-medium text-gray-900">任务中心</h2>
              <p className="mt-1 text-sm text-gray-500">管理你的日常任务和习惯</p>
            </div>
          </div>
        </Link>

        {/* 家庭卡片 */}
        <Link href="/dashboard/family"
          className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-medium text-gray-900">家庭管理</h2>
              <p className="mt-1 text-sm text-gray-500">管理家庭成员和关系</p>
            </div>
          </div>
        </Link>

        {/* 挑战卡片 */}
        <Link href="/dashboard/challenges"
          className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-medium text-gray-900">挑战中心</h2>
              <p className="mt-1 text-sm text-gray-500">接受和发起家庭挑战</p>
            </div>
          </div>
        </Link>

        {/* 帮助卡片 */}
        <Link href="/dashboard/help"
          className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-medium text-gray-900">帮助中心</h2>
              <p className="mt-1 text-sm text-gray-500">获取帮助和支持</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
} 