'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import DefaultAvatar from '../icons/DefaultAvatar';

export default function AvatarUpload() {
  const { user, updateUserProfile } = useAuth();
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // 生成随机头像
  const handleRandomAvatar = async () => {
    try {
      setError('');
      setSuccessMessage('');

      // 生成随机字符串作为种子
      const seed = Math.random().toString(36).substring(7);
      const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`;

      // 更新用户头像
      await updateUserProfile({ photoURL: avatarUrl });
      setSuccessMessage('更新成功');
    } catch (error) {
      console.error('Avatar update error:', error);
      setError('更新失败，请重试');
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
        <div className="flex flex-row gap-4">
          <button
            type="button"
            onClick={handleRandomAvatar}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-gray-900 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2"
          >
            随机头像
          </button>
        </div>
      </div>
      
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
      {successMessage && (
        <p className="text-green-500 text-sm">{successMessage}</p>
      )}
    </div>
  );
} 