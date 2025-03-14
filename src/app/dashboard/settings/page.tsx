'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import AvatarUpload from '@/components/settings/AvatarUpload';
import NicknameForm from '@/components/settings/NicknameForm';
import PasswordForm from '@/components/settings/PasswordForm';
import DeleteAccount from '@/components/settings/DeleteAccount';

export default function SettingsPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // 检查用户是否使用邮箱密码方式注册
  const isEmailPasswordUser = user?.providerData?.[0]?.providerId === 'password';

  return (
    <div className="max-w-2xl mx-auto space-y-8 p-4">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">账号设置</h3>
          <div className="mt-6 space-y-8">
            {/* 头像设置 */}
            <div>
              <h4 className="text-sm font-medium text-gray-900">头像设置</h4>
              <div className="mt-2">
                <AvatarUpload />
              </div>
            </div>

            {/* 昵称设置 */}
            <div>
              <h4 className="text-sm font-medium text-gray-900">昵称设置</h4>
              <div className="mt-2">
                <NicknameForm />
              </div>
            </div>

            {/* 密码修改（仅邮箱注册用户可见） */}
            {isEmailPasswordUser && (
              <div>
                <h4 className="text-sm font-medium text-gray-900">密码修改</h4>
                <div className="mt-2">
                  <PasswordForm />
                </div>
              </div>
            )}

            {/* 账号删除 */}
            <div>
              <h4 className="text-sm font-medium text-gray-900">账号删除</h4>
              <div className="mt-2">
                <DeleteAccount />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 