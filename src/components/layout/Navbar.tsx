'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getUserStats } from '@/services/userStats';
import { UserEventType, subscribeToUserEvent } from '@/services/userEvents';
import { TbCoin } from "react-icons/tb";
import ClientOnly from "../ClientOnly";
import { Menu } from "@headlessui/react";
import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import { useSupabase } from '@/app/supabase-provider';
import Image from 'next/image';
import { useSoundEffects } from '@/hooks/useSoundEffects';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userStats, setUserStats] = useState({ exp: 0, coins: 0 });
  const [loading, setLoading] = useState(false);
  const [expPulse, setExpPulse] = useState(false);
  const [coinsPulse, setCoinsPulse] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { playExpSound, playCoinSound, setExpSoundRef, setCoinSoundRef } = useSoundEffects();
  
  const prevExpRef = useRef<number | null>(null);
  const prevCoinsRef = useRef<number | null>(null);

  useEffect(() => {
    const expAudio = document.getElementById('expSound') as HTMLAudioElement;
    const coinAudio = document.getElementById('coinSound') as HTMLAudioElement;
    
    if (expAudio) setExpSoundRef(expAudio);
    if (coinAudio) setCoinSoundRef(coinAudio);
    
    const loadAudio = () => {
      if (expAudio) {
        expAudio.load();
        const silentPlay = () => {
          if (expAudio) {
            expAudio.volume = 0;
            expAudio.play().catch(() => {});
            setTimeout(() => {
              if (expAudio) expAudio.volume = 1;
            }, 100);
          }
        };
        silentPlay();
      }
      if (coinAudio) {
        coinAudio.load();
        const silentPlay = () => {
          if (coinAudio) {
            coinAudio.volume = 0;
            coinAudio.play().catch(() => {});
            setTimeout(() => {
              if (coinAudio) coinAudio.volume = 1;
            }, 100);
          }
        };
        silentPlay();
      }
      document.removeEventListener('click', loadAudio);
      document.removeEventListener('keydown', loadAudio);
    };
    
    document.addEventListener('click', loadAudio);
    document.addEventListener('keydown', loadAudio);
    
    return () => {
      document.removeEventListener('click', loadAudio);
      document.removeEventListener('keydown', loadAudio);
    };
  }, [setExpSoundRef, setCoinSoundRef]);

  useEffect(() => {
    if (!user) return;

    const fetchUserStats = async () => {
      setLoading(true);
      try {
        const stats = await getUserStats(user.id);
        if (stats) {
          setUserStats({
            exp: stats.exp || 0,
            coins: stats.coins || 0
          });
        }
      } catch (error) {
        console.error('获取用户统计数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
    
    const handleExpChange = (data: any) => {
      console.log('经验变化事件:', data);
      if (data.userId === user.id && data.newValue !== undefined) {
        setUserStats(prev => ({ ...prev, exp: data.newValue as number }));
        setExpPulse(true);
        setTimeout(() => setExpPulse(false), 1500);
        
        playExpSound();
      }
    };
    
    const handleCoinsChange = (data: any) => {
      console.log('金币变化事件:', data);
      if (data.userId === user.id && data.newValue !== undefined) {
        setUserStats(prev => ({ ...prev, coins: data.newValue as number }));
        setCoinsPulse(true);
        setTimeout(() => setCoinsPulse(false), 1500);
        
        playCoinSound();
      }
    };
    
    const unsubscribeExp = subscribeToUserEvent(UserEventType.EXP_CHANGED, handleExpChange);
    const unsubscribeCoins = subscribeToUserEvent(UserEventType.COINS_CHANGED, handleCoinsChange);
    
    return () => {
      unsubscribeExp();
      unsubscribeCoins();
    };
  }, [user, playExpSound, playCoinSound]);

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

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('退出登录失败:', error);
    }
  };

  const formatNumber = (num: number) => {
    return parseFloat(num.toFixed(2)).toLocaleString();
  };

  const refreshUserStats = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const stats = await getUserStats(user.id);
      if (stats) {
        setUserStats({
          exp: stats.exp || 0,
          coins: stats.coins || 0
        });
      }
    } catch (error) {
      console.error('刷新用户统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const mobileExpPulseClass = expPulse ? 'animate-pulse scale-110 bg-indigo-100 text-indigo-800' : 'bg-indigo-50 text-indigo-700';
  const mobileCoinsPulseClass = coinsPulse ? 'animate-pulse scale-110 bg-indigo-100 text-indigo-800' : 'bg-indigo-50 text-indigo-700';
  const desktopExpPulseClass = expPulse ? 'animate-pulse scale-110 bg-indigo-100 text-indigo-800' : 'bg-indigo-50 text-indigo-700';
  const desktopCoinsPulseClass = coinsPulse ? 'animate-pulse scale-110 bg-indigo-100 text-indigo-800' : 'bg-indigo-50 text-indigo-700';

  if (['/login', '/register'].includes(pathname) || !user) {
    return null;
  }

  return (
    <nav className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
      <audio id="expSound" src="/sounds/exp-up.mp3" preload="auto" controls={false} style={{ display: 'none' }} />
      <audio id="coinSound" src="/sounds/coin-get.mp3" preload="auto" controls={false} style={{ display: 'none' }} />
      
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="exp-gradient" x1="13.953" x2="-1.302" y1="13.002" y2="2.99" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ff51e3"/>
            <stop offset="1" stopColor="#1b4dff"/>
          </linearGradient>
          <linearGradient id="coin-gradient-mobile" x1="13.456" y1="13.503" x2="-1.939" y2="4.843" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ff51e3" />
            <stop offset="1" stopColor="#1b4dff" />
          </linearGradient>
          <linearGradient id="coin-gradient-desktop" x1="13.456" y1="13.503" x2="-1.939" y2="4.843" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ff51e3" />
            <stop offset="1" stopColor="#1b4dff" />
          </linearGradient>
          <linearGradient id="coin-gradient" x1="13.456" y1="13.503" x2="-1.939" y2="4.843" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ff51e3" />
            <stop offset="1" stopColor="#1b4dff" />
          </linearGradient>
        </defs>
      </svg>
      
      <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-2 md:px-4">
        <div className="flex flex-col sm:flex-row sm:justify-between">
          <div className="flex flex-col sm:flex-row">
            <div className="flex items-center justify-between h-20 sm:h-16">
              <Link href="/" className="relative text-2xl font-bold">
                <span className="bg-gradient-to-br from-[#1b4dff] to-[#ff51e3] text-transparent bg-clip-text">
                  KinPlay
                </span>
                <style jsx>{`
                  .bg-gradient-to-br {
                    background-image: linear-gradient(to bottom right, var(--tw-gradient-from), var(--tw-gradient-to));
                  }
                `}</style>
              </Link>
              
              <div className="flex items-center space-x-4 sm:hidden">
                <div className="flex items-center">
                  <div className={`flex items-center text-sm font-medium ${mobileExpPulseClass} px-3 py-1.5 rounded-full transition-all duration-300`}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14" width="20" height="20" className="mr-1.5 flex-shrink-0">
                      <path fill="url(#exp-gradient)" fillRule="evenodd" d="M7.00415 2.54498c-.9768-.97868-1.99814-1.46342-2.97991-1.53554-1.10935-.081503-2.0897.37027-2.79796 1.08332-1.392855 1.4023-1.824887 3.93759-.09494 5.69163.00579.00587.01172.01159.01778.01716l5.51682 5.06675c.19126.1756.48516.1756.67642 0l5.51684-5.06675.0074-.00698.0104-.01018c1.7209-1.74491 1.2866-4.2799-.1018-5.68331-.7065-.71418-1.6848-1.168549-2.79318-1.08885-.98088.07053-2.00132.55434-2.97787 1.53275Zm-.35256 1.99217c-.09539-.22131-.30953-.36806-.55035-.37716-.24082-.0091-.46542.12107-.57725.33455L4.66822 6.1283h-.90308c-.34518 0-.625.27982-.625.625 0 .34517.27982.625.625.625h1.28125c.23249 0 .44576-.12905.55364-.335l.42275-.80706 1.0434 2.4207c.08656.20082.27178.34179.4884.37172.21662.02994.43313-.05552.57091-.22534L9.28164 7.3783h.95226c.3452 0 .625-.27983.625-.625 0-.34518-.2798-.625-.625-.625H8.98389c-.18836 0-.36668.08495-.48535.23122l-.69318.85438-1.15377-2.67675Z" clipRule="evenodd"/>
                    </svg>
                    <span>{formatNumber(userStats.exp)}</span>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className={`flex items-center text-sm font-medium ${mobileCoinsPulseClass} px-3 py-1.5 rounded-full transition-all duration-300`}>
                    <svg width="20" height="20" viewBox="0 0 14 14" className="mr-1.5 flex-shrink-0">
                      <path fill="url(#coin-gradient-mobile)" fillRule="evenodd" d="M2.25 2c-.0663 0-.12989.02634-.17678.07322C2.02634 2.12011 2 2.1837 2 2.25v2c0 .41421-.33579.75-.75.75C.835786 5 .5 4.66421.5 4.25v-2c0-.46413.184375-.90925.51256-1.23744C1.34075.684375 1.78587.5 2.25.5h2c.41421 0 .75.335786.75.75 0 .41421-.33579.75-.75.75h-2ZM9 1.25c0-.414214.33579-.75.75-.75h2c.4641 0 .9092.184375 1.2374.51256.3282.32819.5126.77331.5126 1.23744v2c0 .41421-.3358.75-.75.75S12 4.66421 12 4.25v-2c0-.0663-.0263-.12989-.0732-.17678C11.8799 2.02634 11.8163 2 11.75 2h-2C9.33579 2 9 1.66421 9 1.25Zm4.5 8.5c0-.41421-.3358-.75-.75-.75s-.75.33579-.75.75v2c0 .0663-.0263.1299-.0732.1768-.0469.0469-.1105.0732-.1768.0732h-2c-.41421 0-.75.3358-.75.75s.33579.75.75.75h2c.4641 0 .9092-.1844 1.2374-.5126.3282-.3282.5126-.7733.5126-1.2374v-2ZM1.25 9c.41421 0 .75.33579.75.75v2c0 .0663.02634.1299.07322.1768.04689.0469.11048.0732.17678.0732h2c.41421 0 .75.3358.75.75s-.33579.75-.75.75h-2c-.46413 0-.90925-.1844-1.23744-.5126C.684375 12.6592.5 12.2141.5 11.75v-2c0-.41421.335786-.75.75-.75Zm6.50037-5.83167c0-.41421-.33579-.75-.75-.75-.41422 0-.75.33579-.75.75v.51051c-.93681.0994-1.66663.89211-1.66663 1.85528 0 .8768.61052 1.63531 1.46707 1.82268l1.4731.32224c.22927.05016.39314.25358.39314.48881 0 .2765-.22421.50045-.49999.50045h-.83333c-.21653 0-.40274-.13805-.47173-.33326-.13804-.39054-.56653-.59523-.95707-.45719-.39053.13803-.59523.56652-.45719.95706.23847.6747.82913 1.18439 1.55263 1.30579v.5276c0 .4142.33578.75.75.75.41421 0 .75-.3358.75-.75v-.5277c.94615-.15873 1.66668-.98203 1.66668-1.97275 0-.9396-.65417-1.75325-1.5726-1.95416l-1.47309-.32224c-.16793-.03673-.28762-.18544-.28762-.35733 0-.20202.16377-.36579.36578-.36579h.96754c.14801 0 .28023.06337.37285.16685.04351.04861.07722.10511.09889.16642.13803.39053.56652.59523.95706.45719.39054-.13803.59523-.56652.45719-.95706-.08808-.24921-.22372-.47507-.39543-.66692-.29516-.32977-.70001-.56189-1.15725-.63876v-.52772Z" clipRule="evenodd" />
                    </svg>
                    <span>{formatNumber(userStats.coins)}</span>
                  </div>
                </div>

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

          <div className="hidden sm:flex items-center space-x-3 pr-1">
            <div className="flex items-center">
              <div className={`flex items-center text-sm font-medium ${desktopExpPulseClass} px-3 py-1.5 rounded-full transition-all duration-300`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14" width="20" height="20" className="mr-1.5 flex-shrink-0">
                  <path fill="url(#exp-gradient)" fillRule="evenodd" d="M7.00415 2.54498c-.9768-.97868-1.99814-1.46342-2.97991-1.53554-1.10935-.081503-2.0897.37027-2.79796 1.08332-1.392855 1.4023-1.824887 3.93759-.09494 5.69163.00579.00587.01172.01159.01778.01716l5.51682 5.06675c.19126.1756.48516.1756.67642 0l5.51684-5.06675.0074-.00698.0104-.01018c1.7209-1.74491 1.2866-4.2799-.1018-5.68331-.7065-.71418-1.6848-1.168549-2.79318-1.08885-.98088.07053-2.00132.55434-2.97787 1.53275Zm-.35256 1.99217c-.09539-.22131-.30953-.36806-.55035-.37716-.24082-.0091-.46542.12107-.57725.33455L4.66822 6.1283h-.90308c-.34518 0-.625.27982-.625.625 0 .34517.27982.625.625.625h1.28125c.23249 0 .44576-.12905.55364-.335l.42275-.80706 1.0434 2.4207c.08656.20082.27178.34179.4884.37172.21662.02994.43313-.05552.57091-.22534L9.28164 7.3783h.95226c.3452 0 .625-.27983.625-.625 0-.34518-.2798-.625-.625-.625H8.98389c-.18836 0-.36668.08495-.48535.23122l-.69318.85438-1.15377-2.67675Z" clipRule="evenodd"/>
                </svg>
                <span>{formatNumber(userStats.exp)}</span>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className={`flex items-center text-sm font-medium ${desktopCoinsPulseClass} px-3 py-1.5 rounded-full transition-all duration-300`}>
                <svg width="20" height="20" viewBox="0 0 14 14" className="mr-1.5 flex-shrink-0">
                  <path fill="url(#coin-gradient)" fillRule="evenodd" d="M2.25 2c-.0663 0-.12989.02634-.17678.07322C2.02634 2.12011 2 2.1837 2 2.25v2c0 .41421-.33579.75-.75.75C.835786 5 .5 4.66421.5 4.25v-2c0-.46413.184375-.90925.51256-1.23744C1.34075.684375 1.78587.5 2.25.5h2c.41421 0 .75.335786.75.75 0 .41421-.33579.75-.75.75h-2ZM9 1.25c0-.414214.33579-.75.75-.75h2c.4641 0 .9092.184375 1.2374.51256.3282.32819.5126.77331.5126 1.23744v2c0 .41421-.3358.75-.75.75S12 4.66421 12 4.25v-2c0-.0663-.0263-.12989-.0732-.17678C11.8799 2.02634 11.8163 2 11.75 2h-2C9.33579 2 9 1.66421 9 1.25Zm4.5 8.5c0-.41421-.3358-.75-.75-.75s-.75.33579-.75.75v2c0 .0663-.0263.1299-.0732.1768-.0469.0469-.1105.0732-.1768.0732h-2c-.41421 0-.75.3358-.75.75s.33579.75.75.75h2c.4641 0 .9092-.1844 1.2374-.5126.3282-.3282.5126-.7733.5126-1.2374v-2ZM1.25 9c.41421 0 .75.33579.75.75v2c0 .0663.02634.1299.07322.1768.04689.0469.11048.0732.17678.0732h2c.41421 0 .75.3358.75.75s-.33579.75-.75.75h-2c-.46413 0-.90925-.1844-1.23744-.5126C.684375 12.6592.5 12.2141.5 11.75v-2c0-.41421.335786-.75.75-.75Zm6.50037-5.83167c0-.41421-.33579-.75-.75-.75-.41422 0-.75.33579-.75.75v.51051c-.93681.0994-1.66663.89211-1.66663 1.85528 0 .8768.61052 1.63531 1.46707 1.82268l1.4731.32224c.22927.05016.39314.25358.39314.48881 0 .2765-.22421.50045-.49999.50045h-.83333c-.21653 0-.40274-.13805-.47173-.33326-.13804-.39054-.56653-.59523-.95707-.45719-.39053.13803-.59523.56652-.45719.95706.23847.6747.82913 1.18439 1.55263 1.30579v.5276c0 .4142.33578.75.75.75.41421 0 .75-.3358.75-.75v-.5277c.94615-.15873 1.66668-.98203 1.66668-1.97275 0-.9396-.65417-1.75325-1.5726-1.95416l-1.47309-.32224c-.16793-.03673-.28762-.18544-.28762-.35733 0-.20202.16377-.36579.36578-.36579h.96754c.14801 0 .28023.06337.37285.16685.04351.04861.07722.10511.09889.16642.13803.39053.56652.59523.95706.45719.39054-.13803.59523-.56652.45719-.95706-.08808-.24921-.22372-.47507-.39543-.66692-.29516-.32977-.70001-.56189-1.15725-.63876v-.52772Z" clipRule="evenodd" />
                </svg>
                <span>{formatNumber(userStats.coins)}</span>
              </div>
            </div>

            <button 
              className="p-0.5 rounded-full text-gray-400 hover:text-gray-500"
              onClick={refreshUserStats}
              disabled={loading}
              title="刷新数据"
            >
              <svg className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>

            <button className="p-0.5 rounded-full text-gray-400 hover:text-gray-500">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>

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