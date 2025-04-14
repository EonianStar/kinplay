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
  signOut: () => Promise<void>;
  signInWithEmailPassword: (email: string, password: string) => Promise<void>;
  signInWithWeChat: () => Promise<void>;
  updateUserProfile: (updates: { photoURL?: string; displayName?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  timezone: 'UTC',
  signIn: async () => { throw new Error('AuthContext not initialized'); },
  signOut: async () => { throw new Error('AuthContext not initialized'); },
  signInWithEmailPassword: async () => { throw new Error('AuthContext not initialized'); },
  signInWithWeChat: async () => { throw new Error('AuthContext not initialized'); },
  updateUserProfile: async () => { throw new Error('AuthContext not initialized'); },
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
          return;
        }
        
        if (data.session) {
          setSession(data.session);
          setUser(data.session.user);
        }
      } catch (error) {
        console.error('获取会话时出错:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // 监听认证状态变化
    const { data: authListener } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user || null);
      setLoading(false);
    });

    return () => {
      // 清理订阅
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (error) {
      console.error('登录失败:', error);
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

  const signInWithEmailPassword = async (email: string, password: string) => {
    return signIn(email, password);
  };

  const signInWithWeChat = async () => {
    try {
      // 微信登录逻辑
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'wechat' as any, // 使用类型断言处理类型问题
      });
      if (error) throw error;
    } catch (error) {
      console.error('微信登录失败:', error);
      throw error;
    }
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

  const value = {
    user,
    session,
    loading,
    timezone,
    signIn,
    signOut,
    signInWithEmailPassword,
    signInWithWeChat,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};