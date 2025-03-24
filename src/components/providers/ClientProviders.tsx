'use client';

import { ReactNode } from 'react';
import dynamic from 'next/dynamic';

const AuthProvider = dynamic(
  () => import('@/contexts/AuthContext').then((mod) => mod.AuthProvider),
  { ssr: false }
);

export default function ClientProviders({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
} 