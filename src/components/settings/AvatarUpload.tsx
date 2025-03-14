'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import DefaultAvatar from '../icons/DefaultAvatar';

export default function AvatarUpload() {
  const { user, updateUserProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 生成随机头像
  const generateRandomAvatar = async () => {
    try {
      setIsLoading(true);
      setError('');
      setSuccess('');

      // 生成随机字符串作为种子
      const seed = Math.random().toString(36).substring(7);
      const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;

      // 更新用户头像
      await updateUserProfile({ photoURL: avatarUrl });
      setSuccess('更新成功');
    } catch (error) {
      console.error('Error updating avatar:', error);
      setError('更新头像失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <div className="relative w-20 h-20 rounded-full ring-2 ring-white shadow-[0_0_15px_rgba(0,0,0,0.3)]">
          {user?.photoURL ? (
            <Image
              src={user.photoURL}
              alt="User avatar"
              className="rounded-full object-cover"
              fill
              sizes="80px"
            />
          ) : (
            <DefaultAvatar className="w-20 h-20" />
          )}
        </div>
        <div className="flex flex-col space-y-2">
          <button
            onClick={generateRandomAvatar}
            type="button"
            className="w-24 px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors duration-200"
          >
            随机头像
          </button>
        </div>
      </div>
      
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
      {success && (
        <p className="text-green-500 text-sm">{success}</p>
      )}
    </div>
  );
} 