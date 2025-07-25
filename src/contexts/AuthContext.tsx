'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  timezone: string;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, avatarUrl?: string, nickname?: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  deleteUser: () => Promise<void>;
  signInWithEmailPassword: (email: string, password: string) => Promise<void>;
  updateUserProfile: (updates: { photoURL?: string; displayName?: string }) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  timezone: 'UTC',
  signIn: async () => { throw new Error('AuthContext not initialized'); },
  signUp: async () => { throw new Error('AuthContext not initialized'); },
  resetPassword: async () => { throw new Error('AuthContext not initialized'); },
  signOut: async () => { throw new Error('AuthContext not initialized'); },
  deleteUser: async () => { throw new Error('AuthContext not initialized'); },
  signInWithEmailPassword: async () => { throw new Error('AuthContext not initialized'); },
  updateUserProfile: async () => { throw new Error('AuthContext not initialized'); },
  updatePassword: async () => { throw new Error('AuthContext not initialized'); },
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [timezone, setTimezone] = useState('UTC');

  useEffect(() => {
    // 获取用户时区
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setTimezone(userTimeZone || 'UTC');

    // 获取当前会话
    const getSession = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('获取会话失败:', error);
          setLoading(false);
          return;
        }
        
        if (data.session) {
          setSession(data.session);
          setUser(data.session.user);
        }
        setLoading(false);
      } catch (error) {
        console.error('获取会话时出错:', error);
        setLoading(false);
      }
    };

    getSession();

    // 监听认证状态变化 - 修复异步消息通道问题
    let authSubscription: { data: { subscription: { unsubscribe: () => void } } } | null = null;
    
    try {
      // 使用try-catch包裹，防止未处理的异常
      authSubscription = supabase.auth.onAuthStateChange((event, newSession) => {
        // 确保在组件挂载状态下更新状态
        setSession((prevSession) => {
          if (newSession !== prevSession) {
            return newSession;
          }
          return prevSession;
        });
        
        setUser((prevUser) => {
          const newUser = newSession?.user || null;
          if (JSON.stringify(newUser) !== JSON.stringify(prevUser)) {
            return newUser;
          }
          return prevUser;
        });
        
        setLoading(false);
      });
    } catch (error) {
      console.error('设置认证状态监听器失败:', error);
      setLoading(false);
    }

    return () => {
      // 清理订阅 - 防止出现错误
      try {
        if (authSubscription?.data?.subscription?.unsubscribe) {
          authSubscription.data.subscription.unsubscribe();
        }
      } catch (error) {
        console.error('清理认证状态监听器失败:', error);
      }
    };
  }, []);

  // 新增：用户登录后自动分配头像
  useEffect(() => {
    if (user && !user.user_metadata?.avatar_url) {
      const randomAvatar = [
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
      ][Math.floor(Math.random() * 20)]; // 确保头像列表有足够多的头像
      supabase.auth.updateUser({
        data: { avatar_url: randomAvatar }
      }).then(({ data, error }) => {
        if (error) {
          console.error('自动分配头像失败:', error);
        } else {
          setUser(data.user);
        }
      });
    }
  }, [user]);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        // 统一处理登录错误，给出友好的提示
        if (error.message === 'Invalid login credentials') {
          throw new Error('邮箱或密码错误');
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('请查收邮件并激活您的账号');
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('登录失败:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('发送重置密码邮件失败:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('登出失败:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, avatarUrl?: string, nickname?: string) => {
    try {
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: {
            ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
            ...(nickname ? { display_name: nickname } : {}),
          }
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error('注册失败:', error);
      throw error;
    }
  };

  const signInWithEmailPassword = async (email: string, password: string) => {
    return signIn(email, password);
  };

  const updateUserProfile = async (updates: { photoURL?: string; displayName?: string }) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          avatar_url: updates.photoURL,
          display_name: updates.displayName
        }
      });
      if (error) throw error;
      
      // 更新本地用户状态
      if (data.user) {
        setUser(data.user);
      }
    } catch (error) {
      console.error('更新用户信息失败:', error);
      throw error;
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    if (!user?.email) throw new Error('用户未登录');
    // 1. 校验当前密码
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });
    if (signInError) {
      throw new Error('Invalid credentials');
    }
    // 2. 更新新密码
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (updateError) {
      throw updateError;
    }
  };

  const deleteUser = async () => {
    try {
      if (!user) {
        throw new Error('用户未登录');
      }

      // 调用 Edge Function 删除所有数据（包括业务数据和认证信息）
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/delete-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ user_id: user.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`删除账号失败: ${errorData.error || '未知错误'}`);
      }

      // 清除本地状态
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('删除账号失败:', error);
      throw error;
    }
  };

  const value = {
    user,
    session,
    loading,
    timezone,
    signIn,
    signUp,
    resetPassword,
    signOut,
    deleteUser,
    signInWithEmailPassword,
    updateUserProfile,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};