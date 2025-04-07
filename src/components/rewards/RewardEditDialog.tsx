'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { DEFAULT_ICONS, CreateRewardRequest, Reward, DEFAULT_REWARD } from '@/types/reward';
import RewardIcon from '@/components/icons/RewardIcon';
import CashflowIcon from '../../assets/icons/coins/cashflow.svg';

// 添加 CSS 动画
const styles = `
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}

.shake-animation {
  animation: shake 0.2s ease-in-out 0s 3;
  border-color: #EF4444 !important;
}
`;

// 预定义标签
const predefinedTags = ['生活', '娱乐', '学习', '工作', '健康', '社交', '财务', '兴趣'];

interface RewardEditDialogProps {
  isOpen: boolean;
  reward?: Reward;
  onClose: () => void;
  onSave: (rewardData: CreateRewardRequest) => void;
}

export default function RewardEditDialog({ isOpen, reward, onClose, onSave }: RewardEditDialogProps) {
  // 状态
  const [mounted, setMounted] = useState(false);
  const [title, setTitle] = useState(reward?.title || '');
  const [titleError, setTitleError] = useState(false);
  const [description, setDescription] = useState(reward?.description || '');
  const [icon, setIcon] = useState(reward?.icon || DEFAULT_REWARD.icon);
  const [iconError, setIconError] = useState(false);
  const [price, setPrice] = useState(reward?.price || DEFAULT_REWARD.price);
  const [priceError, setPriceError] = useState(false);
  
  // 初始化
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  
  // 当奖励数据改变时更新表单
  useEffect(() => {
    if (reward) {
      setTitle(reward.title);
      setDescription(reward.description || '');
      setIcon(reward.icon);
      setPrice(reward.price);
    } else {
      // 重置表单
      setTitle('');
      setDescription('');
      setIcon(DEFAULT_REWARD.icon);
      setPrice(DEFAULT_REWARD.price);
    }
    // 重置错误状态
    setTitleError(false);
    setIconError(false);
    setPriceError(false);
  }, [reward, isOpen]);
  
  // 控制背景滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);
  
  // 表单提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let hasError = false;
    
    // 验证标题
    if (!title.trim()) {
      setTitleError(true);
      hasError = true;
    }
    
    // 验证图标
    if (!icon) {
      setIconError(true);
      hasError = true;
    }
    
    // 验证价格
    if (price <= 0 || price > 2147483647) {
      setPriceError(true);
      hasError = true;
    }
    
    if (hasError) {
      // 1秒后清除错误状态
      setTimeout(() => {
        setTitleError(false);
        setIconError(false);
        setPriceError(false);
      }, 1000);
      return;
    }
    
    // 提交数据
    const rewardData: CreateRewardRequest = {
      title: title.trim(),
      description: description.trim(),
      icon,
      price
    };
    
    onSave(rewardData);
  };
  
  if (!isOpen || !mounted) return null;
  
  const dialog = (
    <div className="fixed inset-0" style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100vw', 
      height: '100vh', 
      zIndex: 99999,
      isolation: 'isolate'
    }}>
      <style>{styles}</style>
      {/* 背景蒙版 */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" 
        style={{ zIndex: 99999 }}
        onClick={onClose} 
      />
      
      {/* 弹窗内容 */}
      <div className="fixed inset-0 flex items-center justify-center overflow-y-auto" style={{ zIndex: 100000 }}>
        <div className="w-[90vw] sm:w-[80%] sm:max-w-lg bg-white rounded-lg shadow-xl relative my-6" style={{ zIndex: 100001, maxHeight: 'calc(100vh - 3rem)' }}>
          <div className="flex justify-between items-center sticky top-0 bg-white rounded-t-lg px-4 pt-3 sm:px-6 sm:pt-4 pb-4 z-10">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
              {reward ? '编辑奖励' : '新建奖励'}
            </h2>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-2.5 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                取消
              </button>
              <button
                type="submit"
                form="rewardForm"
                className="px-2.5 py-1.5 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                保存
              </button>
            </div>
          </div>
          
          <form id="rewardForm" onSubmit={handleSubmit} className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 9rem)' }}>
            <div className="space-y-2 sm:space-y-3 px-4 sm:px-6 pb-6">
              {/* 图标选择 */}
              <div className="px-3 py-2 sm:p-3">
                <label htmlFor="icon" className="block text-base font-medium text-gray-700 mb-1.5">
                  图标
                </label>
                <div className="grid grid-cols-5 sm:grid-cols-8 gap-3">
                  {DEFAULT_ICONS.map((iconName) => (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => {
                        setIcon(iconName);
                        setIconError(false);
                      }}
                      className={`w-12 h-12 flex items-center justify-center rounded-lg transition-all ${
                        icon === iconName 
                          ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-500 ring-offset-2' 
                          : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                      } ${iconError ? 'shake-animation' : ''}`}
                    >
                      <RewardIcon name={iconName} className="h-6 w-6" />
                    </button>
                  ))}
                </div>
              </div>
              
              {/* 标题 */}
              <div className="px-3 py-2 sm:p-3">
                <label htmlFor="title" className="block text-base font-medium text-gray-700 mb-1.5">
                  标题
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setTitleError(false);
                  }}
                  placeholder="请输入奖励标题"
                  className={`block w-full h-12 sm:h-13 rounded-lg border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow focus:ring-2 focus:ring-indigo-500 text-sm px-3 py-1.5 ${
                    titleError ? 'shake-animation' : ''
                  }`}
                  required
                />
              </div>
              
              {/* 说明 */}
              <div className="px-3 py-2 sm:p-3">
                <label htmlFor="description" className="block text-base font-medium text-gray-700 mb-1.5">
                  说明
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="请输入奖励说明"
                  rows={3}
                  className="block w-full rounded-lg border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow focus:ring-2 focus:ring-indigo-500 text-sm px-3 py-1.5"
                />
              </div>
              
              {/* 价格 */}
              <div className="px-3 py-2 sm:p-3">
                <label htmlFor="price" className="block text-base font-medium text-gray-700 mb-1.5">
                  价格
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="price"
                    value={price}
                    onChange={(e) => {
                      setPrice(Math.max(1, Math.min(2147483647, parseInt(e.target.value) || 0)));
                      setPriceError(false);
                    }}
                    min="1"
                    max="2147483647"
                    className={`block w-full h-12 sm:h-13 rounded-lg border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow focus:ring-2 focus:ring-indigo-500 text-sm px-3 py-1.5 ${
                      priceError ? 'shake-animation' : ''
                    }`}
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <CashflowIcon className="h-5 w-5" aria-hidden="true" />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
  
  return createPortal(dialog, document.body);
} 