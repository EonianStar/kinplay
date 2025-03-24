'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useRef, useEffect } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 点击页面其他地方关闭下拉菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 处理退出登录
  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('退出登录失败:', error);
    }
  };

  // 如果在登录或注册页面，或者用户未登录，不显示导航栏
  if (['/login', '/register'].includes(pathname) || !user) {
    return null;
  }

  return (
    <nav className="bg-white shadow-sm">
      <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-2 md:px-4">
        <div className="flex flex-col sm:flex-row sm:justify-between">
          {/* 左侧导航链接 */}
          <div className="flex flex-col sm:flex-row">
            {/* Logo */}
            <div className="flex items-center justify-between h-20 sm:h-16">
              <Link href="/" className="text-2xl font-bold text-indigo-600">
                KinPlay
              </Link>
              
              {/* 移动端的用户功能区 */}
              <div className="flex items-center space-x-4 sm:hidden">
                {/* 金币 */}
                <div className="flex items-center px-3 py-1.5 bg-yellow-100 rounded-full">
                  <svg className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.736 6.979C9.208 6.193 9.696 6 10 6c.304 0 .792.193 1.264.979a1 1 0 001.715-1.029C12.279 4.784 11.232 4 10 4s-2.279.784-2.979 1.95c-.285.475-.507 1.002-.67 1.55H6a1 1 0 000 2h.013a9.358 9.358 0 000 1H6a1 1 0 100 2h.351c.163.548.385 1.075.67 1.55C7.721 15.216 8.768 16 10 16s2.279-.784 2.979-1.95a1 1 0 10-1.715-1.029C10.792 13.807 10.304 14 10 14c-.304 0-.792-.193-1.264-.979a1 1 0 00-1.715 1.029C7.721 15.216 8.768 16 10 16s2.279-.784 2.979-1.95c.285-.475.507-1.002.67-1.55H14a1 1 0 100-2h-.013a9.358 9.358 0 000-1H14a1 1 0 000-2h-.351c-.163-.548-.385-1.075-.67-1.55C12.279 4.784 11.232 4 10 4s-2.279.784-2.979 1.95a1 1 0 001.715 1.029z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-1 text-base font-medium text-yellow-700">1000</span>
                </div>

                {/* 用户头像下拉菜单 */}
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-base text-indigo-600 font-medium">
                        {user?.email?.[0].toUpperCase() || 'U'}
                      </span>
                    </div>
                  </button>

                  {/* 下拉菜单 */}
                  {isDropdownOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 py-1 z-50">
                      <Link
                        href="/settings"
                        className="block px-4 py-2.5 text-base text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        设置
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2.5 text-base text-gray-700 hover:bg-gray-100"
                      >
                        退出登录
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 导航链接 - 移动端显示在第二行 */}
            <div className="flex justify-around sm:justify-start sm:ml-6 sm:space-x-8 pb-3 sm:pb-0">
              <Link
                href="/tasks"
                className={`inline-flex items-center px-2 pt-1 border-b-2 text-base font-bold ${
                  pathname === '/tasks'
                    ? 'border-indigo-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                任务
              </Link>
              <Link
                href="/family"
                className={`inline-flex items-center px-2 pt-1 border-b-2 text-base font-bold ${
                  pathname === '/family'
                    ? 'border-indigo-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                家庭
              </Link>
              <Link
                href="/challenges"
                className={`inline-flex items-center px-2 pt-1 border-b-2 text-base font-bold ${
                  pathname === '/challenges'
                    ? 'border-indigo-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                挑战
              </Link>
              <Link
                href="/help"
                className={`inline-flex items-center px-2 pt-1 border-b-2 text-base font-bold ${
                  pathname === '/help'
                    ? 'border-indigo-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                帮助
              </Link>
            </div>
          </div>

          {/* 桌面端的用户功能区 */}
          <div className="hidden sm:flex items-center space-x-3 pr-1">
            {/* 金币 */}
            <div className="flex items-center px-2 py-0.5 bg-yellow-100 rounded-full">
              <svg className="h-4 w-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.736 6.979C9.208 6.193 9.696 6 10 6c.304 0 .792.193 1.264.979a1 1 0 001.715-1.029C12.279 4.784 11.232 4 10 4s-2.279.784-2.979 1.95c-.285.475-.507 1.002-.67 1.55H6a1 1 0 000 2h.013a9.358 9.358 0 000 1H6a1 1 0 100 2h.351c.163.548.385 1.075.67 1.55C7.721 15.216 8.768 16 10 16s2.279-.784 2.979-1.95a1 1 0 10-1.715-1.029C10.792 13.807 10.304 14 10 14c-.304 0-.792-.193-1.264-.979a1 1 0 00-1.715 1.029C7.721 15.216 8.768 16 10 16s2.279-.784 2.979-1.95c.285-.475.507-1.002.67-1.55H14a1 1 0 100-2h-.013a9.358 9.358 0 000-1H14a1 1 0 000-2h-.351c-.163-.548-.385-1.075-.67-1.55C12.279 4.784 11.232 4 10 4s-2.279.784-2.979 1.95a1 1 0 001.715 1.029z" clipRule="evenodd" />
              </svg>
              <span className="ml-1 text-sm font-medium text-yellow-700">1000</span>
            </div>

            {/* 刷新按钮 */}
            <button className="p-0.5 rounded-full text-gray-400 hover:text-gray-500">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>

            {/* 通知按钮 */}
            <button className="p-0.5 rounded-full text-gray-400 hover:text-gray-500">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>

            {/* 桌面端的用户头像下拉菜单 */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-sm text-indigo-600 font-medium">
                    {user?.email?.[0].toUpperCase() || 'U'}
                  </span>
                </div>
              </button>

              {/* 下拉菜单 */}
              {isDropdownOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 py-1 z-50">
                  <Link
                    href="/settings"
                    className="block px-4 py-2.5 text-base text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    设置
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2.5 text-base text-gray-700 hover:bg-gray-100"
                  >
                    退出登录
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 