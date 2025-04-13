import { useRef, useCallback } from 'react';

/**
 * 自定义钩子用于管理声音效果
 * 提供播放经验和金币获取音效的方法
 */
export const useSoundEffects = () => {
  // 创建对声音元素的引用
  const expSoundRef = useRef<HTMLAudioElement | null>(null);
  const coinSoundRef = useRef<HTMLAudioElement | null>(null);

  // 播放经验获取音效
  const playExpSound = useCallback(() => {
    try {
      if (expSoundRef.current) {
        expSoundRef.current.currentTime = 0;
        expSoundRef.current.play().catch(err => {
          console.error('播放经验音效失败:', err);
        });
      }
    } catch (error) {
      console.error('经验音效播放错误:', error);
    }
  }, []);

  // 播放金币获取音效
  const playCoinSound = useCallback(() => {
    try {
      if (coinSoundRef.current) {
        coinSoundRef.current.currentTime = 0;
        coinSoundRef.current.play().catch(err => {
          console.error('播放金币音效失败:', err);
        });
      }
    } catch (error) {
      console.error('金币音效播放错误:', error);
    }
  }, []);

  // 设置声音元素引用
  const setExpSoundRef = useCallback((element: HTMLAudioElement | null) => {
    expSoundRef.current = element;
  }, []);

  const setCoinSoundRef = useCallback((element: HTMLAudioElement | null) => {
    coinSoundRef.current = element;
  }, []);

  return {
    playExpSound,
    playCoinSound,
    setExpSoundRef,
    setCoinSoundRef
  };
};

export default useSoundEffects; 