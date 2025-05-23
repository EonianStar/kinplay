import type { Metadata } from 'next';
import './globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import { Toaster } from 'react-hot-toast';
import OverdueChecker from '@/components/OverdueChecker';
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'KinPlay - 让家庭生活更有趣',
  description: '通过游戏化的方式管理家庭任务，培养良好习惯',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <AuthProvider>
          <Navbar />
          <main className="pt-20 sm:pt-16">
            {children}
          </main>
          <Toaster />
          <OverdueChecker />
          <SpeedInsights />
        </AuthProvider>
      </body>
    </html>
  );
}
