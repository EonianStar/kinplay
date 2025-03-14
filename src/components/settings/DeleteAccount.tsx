'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function DeleteAccount() {
  const { user, deleteUser } = useAuth();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleDelete = async () => {
    if (!user) return;

    try {
      setIsDeleting(true);
      setError('');
      await deleteUser();
      router.push('/');
    } catch (err) {
      setError('账号删除失败，请重试');
      console.error('删除账号错误:', err);
      setShowConfirmDialog(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => setShowConfirmDialog(true)}
        className="w-24 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors duration-200"
      >
        删除账号
      </button>

      {/* 确认对话框 */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              确认删除账号？
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              此操作将永久删除您的账号和所有相关数据。此操作不可撤销。
            </p>
            {error && (
              <p className="text-sm text-red-600 mb-4">
                {error}
              </p>
            )}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setShowConfirmDialog(false)}
                className="w-24 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-24 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isDeleting ? '删除中...' : '确认删除'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 