'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export default function RegisterPage() {
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const { signUp } = useAuth();

  // 头像列表
  const avatarList = [
    'https://img.kinplay.fun/default/FluffyAvatar.png',
    'https://img.kinplay.fun/default/CocoAvatar.png',
    'https://img.kinplay.fun/default/SparkyAvatar.png',
    'https://img.kinplay.fun/default/GarfatAvatar.png',
    'https://img.kinplay.fun/default/UnderbiteAvatar.png',
    'https://img.kinplay.fun/default/CurtisAvatar.png',
    'https://img.kinplay.fun/default/CarrotAvatar.png',
    'https://img.kinplay.fun/default/HammerAvatar.png',
    'https://img.kinplay.fun/default/BaconAvatar.png',
    'https://img.kinplay.fun/default/BarbieAvatar.png',
    'https://img.kinplay.fun/default/LouAvatar.png',
    'https://img.kinplay.fun/default/MacchiatoAvatar.png',
    'https://img.kinplay.fun/default/BruceAvatar.png',
    'https://img.kinplay.fun/default/TiagraAvatar.png',
    'https://img.kinplay.fun/default/HarryAvatar.png',
    'https://img.kinplay.fun/default/OttaAvatar.png',
    'https://img.kinplay.fun/default/NemoAvatar.png',
    'https://img.kinplay.fun/default/MorseAvatar.png',
    'https://img.kinplay.fun/default/ValienteAvatar.png',
    'https://img.kinplay.fun/default/MoonmoonAvatar.png',
  ];

  // 昵称校验规则
  function validateNickname(nickname: string): string | null {
    if (!nickname) return '昵称不能为空';
    // 汉字2~10
    const chinese = /^[\u4e00-\u9fa5]{2,10}$/;
    // 非汉字4~20
    const nonChinese = /^[A-Za-z0-9_]{4,20}$/;
    // 不含标点/特殊符号/空格
    const invalid = /[\s\p{P}\p{S}]/u;
    if (invalid.test(nickname)) return '昵称不能包含空格、标点或特殊符号';
    if (chinese.test(nickname) || nonChinese.test(nickname)) return null;
    return '昵称格式不正确，需2~10个汉字或4~20个字母/数字/下划线';
  }

  // 注册前查重
  async function isNicknameTaken(nickname: string): Promise<boolean> {
    const { data, error } = await supabase.rpc('check_nickname_exists', { nickname });
    if (error) return false; // 查询失败时不阻断注册
    return data === true;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 校验昵称
    const nicknameError = validateNickname(nickname);
    if (nicknameError) {
      setError(nicknameError);
      return;
    }
    // 查重
    setIsLoading(true);
    const taken = await isNicknameTaken(nickname);
    if (taken) {
      setError('此昵称已被占用');
      setIsLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      setIsLoading(false);
      return;
    }

    // 随机分配头像
    const randomAvatar = avatarList[Math.floor(Math.random() * avatarList.length)];

    try {
      await signUp(email, password, randomAvatar, nickname);
      router.push('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : '注册失败');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-br from-[#1b4dff] to-[#ff51e3] text-transparent bg-clip-text">
          KinPlay
        </h1>
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">注册</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-800 p-3 rounded-md text-sm">
              {error}
            </div>
          )}
          {/* 昵称表单项 */}
          <div>
            <label htmlFor="nickname" className="block text-sm font-medium text-gray-700">
              昵称
            </label>
            <input
              id="nickname"
              type="text"
              required
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              autoComplete="off"
              maxLength={20}
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              邮箱
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              密码
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3"
              >
                {showPassword ? (
                  <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              确认密码
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3"
              >
                {showConfirmPassword ? (
                  <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoading ? '注册中...' : '注册'}
          </button>
          <div className="text-center">
            <Link
              href="/login"
              className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
            >
              已有账号？点击登录
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}