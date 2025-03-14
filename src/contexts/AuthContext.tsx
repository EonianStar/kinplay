'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  updatePassword as firebaseUpdatePassword,
  deleteUser as firebaseDeleteUser,
  getAuth
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  signInWithEmailPassword: (email: string, password: string) => Promise<void>;
  signUpWithEmailPassword: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (profile: { displayName?: string | null; photoURL?: string | null }) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  deleteUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // 监听用户状态变化
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // 邮箱密码登录方法
  const signInWithEmailPassword = async (email: string, password: string) => {
    try {
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('登录失败'));
      throw err;
    }
  };

  // 邮箱密码注册方法
  const signUpWithEmailPassword = async (email: string, password: string) => {
    try {
      setError(null);
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('注册失败'));
      throw err;
    }
  };

  // 登出方法
  const signOut = async () => {
    try {
      setError(null);
      await firebaseSignOut(auth);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('登出失败'));
      throw err;
    }
  };

  const updateUserProfile = async (profile: { displayName?: string | null; photoURL?: string | null }) => {
    if (!user) throw new Error('No user logged in');
    
    // 获取最新的用户对象
    const currentUser = getAuth().currentUser;
    if (!currentUser) throw new Error('No user logged in');
    
    // 使用最新的用户对象更新资料
    await updateProfile(currentUser, profile);
    
    // 强制更新用户状态以触发重新渲染
    setUser({ ...currentUser });
  };

  const updatePassword = async (newPassword: string) => {
    if (!user) throw new Error('No user logged in');
    await firebaseUpdatePassword(user, newPassword);
  };

  const deleteUser = async () => {
    if (!user) throw new Error('No user logged in');
    await firebaseDeleteUser(user);
  };

  const value = {
    user,
    loading,
    error,
    signInWithEmailPassword,
    signUpWithEmailPassword,
    signOut,
    updateUserProfile,
    updatePassword,
    deleteUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 