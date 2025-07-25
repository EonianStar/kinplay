'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function NicknameForm() {
  const { user, updateUserProfile } = useAuth();
  const [nickname, setNickname] = useState(user?.user_metadata?.display_name || '');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // 昵称校验规则（与注册一致）
  function validateNickname(nickname: string): string | null {
    if (!nickname) return '昵称不能为空';
    // 汉字2~10
    const chinese = /^[\u4e00-\u9fa5]{2,10}$/;
    // 非汉字4~20（不含下划线）
    const nonChinese = /^[A-Za-z0-9]{4,20}$/;
    // 不含标点/特殊符号/空格/下划线
    const invalid = /[\s\p{P}\p{S}_]/u;
    if (invalid.test(nickname)) return '请输入4-20个非特殊字符(含空格)';
    if (chinese.test(nickname) || nonChinese.test(nickname)) return null;
    return '请输入4-20个非特殊字符(含空格)';
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // 校验昵称
    const nicknameError = validateNickname(nickname);
    if (nicknameError) {
      setError(nicknameError);
      return;
    }

    try {
      setIsSubmitting(true);
      await updateUserProfile({
        displayName: nickname
      });
      setSuccessMessage('昵称修改成功！');
    } catch (err) {
      setError('昵称修改失败，请重试');
      console.error('修改昵称错误:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="请输入新昵称"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
            focus:outline-none focus:ring-indigo-500 focus:border-indigo-500
            text-gray-900 placeholder-gray-400
            bg-white"
          maxLength={20}
        />
        {error && (
          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>
        )}
        {successMessage && (
          <p className="mt-2 text-sm text-green-600">
            {successMessage}
          </p>
        )}
      </div>
      <div className="flex flex-row gap-4">
      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
      >
        {isSubmitting ? '保存中...' : '保存修改'}
      </button>
      </div>
    </form>
  );
} 