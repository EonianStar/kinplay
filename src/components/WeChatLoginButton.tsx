'use client';

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function WeChatLoginButton() {
  const { signInWithWeChat } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      await signInWithWeChat();
    } catch (error) {
      console.error('微信登录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogin}
      disabled={loading}
      className="flex items-center justify-center w-full px-4 py-2 space-x-2 text-white bg-[#07C160] hover:bg-[#06ae56] disabled:bg-gray-400 rounded-lg transition-colors duration-200"
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.182 0 .653-.52 1.182-1.162 1.182-.642 0-1.162-.529-1.162-1.182 0-.653.52-1.182 1.162-1.182zm5.813 0c.642 0 1.162.529 1.162 1.182 0 .653-.52 1.182-1.162 1.182-.642 0-1.162-.529-1.162-1.182 0-.653.52-1.182 1.162-1.182zm6.636 3.812c-1.519-.036-3.074.41-4.413 1.453-1.746 1.363-2.476 3.435-1.818 5.88 0 .037.019.075.035.112.06.135.159.24.281.316.122.076.26.123.406.14h.06c.056 0 .11-.006.164-.017 4.367-.767 7.496-3.596 7.496-6.973a4.229 4.229 0 0 0-.234-1.355c-.455-.03-.914-.094-1.395-.094-.369 0-.73.019-1.082.038zm-2.973 6.118c-.512 0-.927-.424-.927-.947 0-.523.415-.947.927-.947.512 0 .927.424.927.947 0 .523-.415.947-.927.947zm4.875 0c-.512 0-.927-.424-.927-.947 0-.523.415-.947.927-.947.512 0 .927.424.927.947 0 .523-.415.947-.927.947z" />
          </svg>
          <span className="font-medium">使用微信登录</span>
        </>
      )}
    </button>
  );
} 