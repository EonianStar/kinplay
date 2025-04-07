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
                <div className="flex items-center">
                  <div className="flex items-center text-sm font-medium text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-full">
                    <svg width="20" height="20" viewBox="0 0 14 14" className="mr-1.5 flex-shrink-0">
                      <path fill="url(#coin-gradient)" fillRule="evenodd" d="M2.25 2c-.0663 0-.12989.02634-.17678.07322C2.02634 2.12011 2 2.1837 2 2.25v2c0 .41421-.33579.75-.75.75C.835786 5 .5 4.66421.5 4.25v-2c0-.46413.184375-.90925.51256-1.23744C1.34075.684375 1.78587.5 2.25.5h2c.41421 0 .75.335786.75.75 0 .41421-.33579.75-.75.75h-2ZM9 1.25c0-.414214.33579-.75.75-.75h2c.4641 0 .9092.184375 1.2374.51256.3282.32819.5126.77331.5126 1.23744v2c0 .41421-.3358.75-.75.75S12 4.66421 12 4.25v-2c0-.0663-.0263-.12989-.0732-.17678C11.8799 2.02634 11.8163 2 11.75 2h-2C9.33579 2 9 1.66421 9 1.25Zm4.5 8.5c0-.41421-.3358-.75-.75-.75s-.75.33579-.75.75v2c0 .0663-.0263.1299-.0732.1768-.0469.0469-.1105.0732-.1768.0732h-2c-.41421 0-.75.3358-.75.75s.33579.75.75.75h2c.4641 0 .9092-.1844 1.2374-.5126.3282-.3282.5126-.7733.5126-1.2374v-2ZM1.25 9c.41421 0 .75.33579.75.75v2c0 .0663.02634.1299.07322.1768.04689.0469.11048.0732.17678.0732h2c.41421 0 .75.3358.75.75s-.33579.75-.75.75h-2c-.46413 0-.90925-.1844-1.23744-.5126C.684375 12.6592.5 12.2141.5 11.75v-2c0-.41421.335786-.75.75-.75Zm6.50037-5.83167c0-.41421-.33579-.75-.75-.75-.41422 0-.75.33579-.75.75v.51051c-.93681.0994-1.66663.89211-1.66663 1.85528 0 .8768.61052 1.63531 1.46707 1.82268l1.4731.32224c.22927.05016.39314.25358.39314.48881 0 .2765-.22421.50045-.49999.50045h-.83333c-.21653 0-.40274-.13805-.47173-.33326-.13804-.39054-.56653-.59523-.95707-.45719-.39053.13803-.59523.56652-.45719.95706.23847.6747.82913 1.18439 1.55263 1.30579v.5276c0 .4142.33578.75.75.75.41421 0 .75-.3358.75-.75v-.5277c.94615-.15873 1.66668-.98203 1.66668-1.97275 0-.9396-.65417-1.75325-1.5726-1.95416l-1.47309-.32224c-.16793-.03673-.28762-.18544-.28762-.35733 0-.20202.16377-.36579.36578-.36579h.96754c.14801 0 .28023.06337.37285.16685.04351.04861.07722.10511.09889.16642.13803.39053.56652.59523.95706.45719.39054-.13803.59523-.56652.45719-.95706-.08808-.24921-.22372-.47507-.39543-.66692-.29516-.32977-.70001-.56189-1.15725-.63876v-.52772Z" clipRule="evenodd" />
                      <defs>
                        <linearGradient id="coin-gradient" x1="13.456" y1="13.503" x2="-1.939" y2="4.843" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#ff51e3" />
                          <stop offset="1" stopColor="#1b4dff" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <span>1000</span>
                  </div>
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
            <div className="flex items-center">
              <div className="flex items-center text-sm font-medium text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-full">
                <svg width="20" height="20" viewBox="0 0 14 14" className="mr-1.5 flex-shrink-0">
                  <path fill="url(#coin-gradient-desktop)" fillRule="evenodd" d="M2.25 2c-.0663 0-.12989.02634-.17678.07322C2.02634 2.12011 2 2.1837 2 2.25v2c0 .41421-.33579.75-.75.75C.835786 5 .5 4.66421.5 4.25v-2c0-.46413.184375-.90925.51256-1.23744C1.34075.684375 1.78587.5 2.25.5h2c.41421 0 .75.335786.75.75 0 .41421-.33579.75-.75.75h-2ZM9 1.25c0-.414214.33579-.75.75-.75h2c.4641 0 .9092.184375 1.2374.51256.3282.32819.5126.77331.5126 1.23744v2c0 .41421-.3358.75-.75.75S12 4.66421 12 4.25v-2c0-.0663-.0263-.12989-.0732-.17678C11.8799 2.02634 11.8163 2 11.75 2h-2C9.33579 2 9 1.66421 9 1.25Zm4.5 8.5c0-.41421-.3358-.75-.75-.75s-.75.33579-.75.75v2c0 .0663-.0263.1299-.0732.1768-.0469.0469-.1105.0732-.1768.0732h-2c-.41421 0-.75.3358-.75.75s.33579.75.75.75h2c.4641 0 .9092-.1844 1.2374-.5126.3282-.3282.5126-.7733.5126-1.2374v-2ZM1.25 9c.41421 0 .75.33579.75.75v2c0 .0663.02634.1299.07322.1768.04689.0469.11048.0732.17678.0732h2c.41421 0 .75.3358.75.75s-.33579.75-.75.75h-2c-.46413 0-.90925-.1844-1.23744-.5126C.684375 12.6592.5 12.2141.5 11.75v-2c0-.41421.335786-.75.75-.75Zm6.50037-5.83167c0-.41421-.33579-.75-.75-.75-.41422 0-.75.33579-.75.75v.51051c-.93681.0994-1.66663.89211-1.66663 1.85528 0 .8768.61052 1.63531 1.46707 1.82268l1.4731.32224c.22927.05016.39314.25358.39314.48881 0 .2765-.22421.50045-.49999.50045h-.83333c-.21653 0-.40274-.13805-.47173-.33326-.13804-.39054-.56653-.59523-.95707-.45719-.39053.13803-.59523.56652-.45719.95706.23847.6747.82913 1.18439 1.55263 1.30579v.5276c0 .4142.33578.75.75.75.41421 0 .75-.3358.75-.75v-.5277c.94615-.15873 1.66668-.98203 1.66668-1.97275 0-.9396-.65417-1.75325-1.5726-1.95416l-1.47309-.32224c-.16793-.03673-.28762-.18544-.28762-.35733 0-.20202.16377-.36579.36578-.36579h.96754c.14801 0 .28023.06337.37285.16685.04351.04861.07722.10511.09889.16642.13803.39053.56652.59523.95706.45719.39054-.13803.59523-.56652.45719-.95706-.08808-.24921-.22372-.47507-.39543-.66692-.29516-.32977-.70001-.56189-1.15725-.63876v-.52772Z" clipRule="evenodd" />
                  <defs>
                    <linearGradient id="coin-gradient-desktop" x1="13.456" y1="13.503" x2="-1.939" y2="4.843" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#ff51e3" />
                      <stop offset="1" stopColor="#1b4dff" />
                    </linearGradient>
                  </defs>
                </svg>
                <span>1000</span>
              </div>
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