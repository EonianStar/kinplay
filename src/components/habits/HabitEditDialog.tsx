'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { HabitNature, HabitDifficulty, HabitResetPeriod, CreateHabitRequest, Habit } from '@/types/habit';
import { 
  PlusIcon, 
  MinusIcon, 
  TagIcon,
  EllipsisVerticalIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { ForwardIcon, StarIcon } from '@heroicons/react/24/solid';

interface HabitEditDialogProps {
  isOpen?: boolean;
  habit?: Habit;
  onClose: () => void;
  onSave: (habitData: CreateHabitRequest) => void;
}

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

export default function HabitEditDialog({ isOpen = true, habit, onClose, onSave }: HabitEditDialogProps) {
  const [mounted, setMounted] = useState(false);
  const [title, setTitle] = useState(habit?.title || '');
  const [titleError, setTitleError] = useState(false);
  const [description, setDescription] = useState(habit?.description || '');
  const [nature, setNature] = useState<HabitNature[]>(habit?.nature || [HabitNature.GOOD, HabitNature.BAD]);
  const [natureError, setNatureError] = useState(false);
  const [difficulty, setDifficulty] = useState<HabitDifficulty>(habit?.difficulty || HabitDifficulty.EASY);
  const [difficultyError, setDifficultyError] = useState(false);
  const [tags, setTags] = useState<string[]>(habit?.tags || []);
  const [customTag, setCustomTag] = useState('');
  const [resetPeriod, setResetPeriod] = useState<HabitResetPeriod>(habit?.reset_period || HabitResetPeriod.DAILY);
  const [resetPeriodError, setResetPeriodError] = useState(false);
  const [goodCount, setGoodCount] = useState(habit?.good_count || 0);
  const [badCount, setBadCount] = useState(habit?.bad_count || 0);
  const [isExpanded, setIsExpanded] = useState(false);

  const predefinedTags = ['学习', '工作', '家务', '健康', '社交', '财务', '兴趣'];

  // 难度星级映射
  const difficultyStars: Record<HabitDifficulty, number> = {
    [HabitDifficulty.VERY_EASY]: 1,
    [HabitDifficulty.EASY]: 2,
    [HabitDifficulty.MEDIUM]: 3,
    [HabitDifficulty.HARD]: 4,
  };

  // 难度选项映射
  const difficultyLabels = {
    [HabitDifficulty.VERY_EASY]: '容易',
    [HabitDifficulty.EASY]: '简单',
    [HabitDifficulty.MEDIUM]: '中等',
    [HabitDifficulty.HARD]: '困难',
  };

  // 星级显示组件
  const DifficultyStars = ({ difficulty }: { difficulty: HabitDifficulty }) => {
    const starCount = difficultyStars[difficulty];
    return (
      <div className="flex">
        {[...Array(starCount)].map((_, index) => (
          <StarIcon
            key={index}
            className="h-3.5 w-3.5 text-yellow-400"
          />
        ))}
      </div>
    );
  };

  // 当 habit 改变时更新表单
  useEffect(() => {
    if (habit) {
      setTitle(habit.title);
      setDescription(habit.description || '');
      setNature(habit.nature);
      setDifficulty(habit.difficulty);
      setTags(habit.tags || []);
      setResetPeriod(habit.reset_period);
      setGoodCount(habit.good_count || 0);
      setBadCount(habit.bad_count || 0);
    }
  }, [habit]);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

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

  const handleTagChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === '') return;
    
    if (!tags.includes(value)) {
      setTags(prev => [...prev, value]);
    }
    e.target.value = ''; // 重置选择
  };

  const handleCustomTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomTag(e.target.value);
  };

  const handleAddCustomTag = () => {
    if (customTag && !tags.includes(customTag)) {
      setTags(prev => [...prev, customTag]);
      setCustomTag('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let hasError = false;

    // 验证必填字段
    if (!title.trim()) {
      setTitleError(true);
      hasError = true;
    }

    if (nature.length === 0) {
      setNatureError(true);
      hasError = true;
    }

    if (!difficulty) {
      setDifficultyError(true);
      hasError = true;
    }

    if (!resetPeriod) {
      setResetPeriodError(true);
      hasError = true;
    }

    if (hasError) {
      // 1秒后清除所有错误状态
      setTimeout(() => {
        setTitleError(false);
        setNatureError(false);
        setDifficultyError(false);
        setResetPeriodError(false);
      }, 1000);
      return;
    }

    // 创建习惯数据
    const habitData: CreateHabitRequest = {
      title: title.trim(),
      description: description.trim() || undefined,
      nature: nature.map(n => n.toLowerCase() as HabitNature),
      difficulty: difficulty.toLowerCase() as HabitDifficulty,
      tags: tags.map(tag => tag.trim()).filter(Boolean),
      reset_period: resetPeriod.toLowerCase() as HabitResetPeriod,
      good_count: Math.max(0, Math.min(999, goodCount)),
      bad_count: Math.max(0, Math.min(999, badCount)),
    };

    // 提交数据
    onSave(habitData);
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
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">编辑习惯</h2>
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
                form="habitForm"
                className="px-2.5 py-1.5 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                保存
              </button>
            </div>
          </div>

          <form id="habitForm" onSubmit={handleSubmit} className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 9rem)' }}>
            <div className="space-y-2 sm:space-y-3 px-4 sm:px-6 pb-6">
              {/* 标题 */}
              <div className="px-3 py-2 sm:p-3">
                <label htmlFor="title" className="block text-base font-medium text-gray-700 mb-1.5">
                  标题 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setTitleError(false);
                  }}
                  placeholder="请添加习惯标题"
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
                  placeholder="请添加习惯说明"
                  rows={3}
                  className="block w-full rounded-lg border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow focus:ring-2 focus:ring-indigo-500 text-sm px-3 py-1.5"
                />
              </div>

              {/* 性质 */}
              <div className="flex justify-center space-x-8 sm:space-x-12">
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setNature(prev => 
                        prev.includes(HabitNature.GOOD)
                          ? prev.filter(n => n !== HabitNature.GOOD)
                          : [...prev, HabitNature.GOOD]
                      );
                      setNatureError(false);
                    }}
                    className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold mb-2 shadow-[2px_2px_0px_rgba(0,0,0,0.1)] active:shadow-[1px_1px_0px_rgba(0,0,0,0.1)] active:translate-x-[1px] active:translate-y-[1px] transition-all focus:outline-none focus:ring-2 focus:ring-[#FDD835] focus:ring-offset-2 focus:ring-offset-white focus:rounded-full ${
                      nature.includes(HabitNature.GOOD)
                        ? 'bg-[#FDD835] text-white ring-4 ring-[#FDD835]/30'
                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                    } ${natureError ? 'shake-animation' : ''}`}
                  >
                    +
                  </button>
                  <span className="text-sm text-gray-600">好习惯</span>
                </div>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setNature(prev => 
                        prev.includes(HabitNature.BAD)
                          ? prev.filter(n => n !== HabitNature.BAD)
                          : [...prev, HabitNature.BAD]
                      );
                      setNatureError(false);
                    }}
                    className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold mb-2 shadow-[2px_2px_0px_rgba(0,0,0,0.1)] active:shadow-[1px_1px_0px_rgba(0,0,0,0.1)] active:translate-x-[1px] active:translate-y-[1px] transition-all focus:outline-none focus:ring-2 focus:ring-[#FDD835] focus:ring-offset-2 focus:ring-offset-white focus:rounded-full ${
                      nature.includes(HabitNature.BAD)
                        ? 'bg-[#FDD835] text-white ring-4 ring-[#FDD835]/30'
                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                    } ${natureError ? 'shake-animation' : ''}`}
                  >
                    -
                  </button>
                  <span className="text-sm text-gray-600">坏习惯</span>
                </div>
              </div>

              {/* 难度 */}
              <div className="px-3 py-2 sm:p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="difficulty" className="block text-base font-medium text-gray-700">
                    难度
                  </label>
                  <DifficultyStars difficulty={difficulty} />
                </div>
                <div className="relative">
                  <select
                    id="difficulty"
                    value={difficulty}
                    onChange={(e) => {
                      setDifficulty(e.target.value as HabitDifficulty);
                      setDifficultyError(false);
                    }}
                    className={`block w-full h-12 sm:h-13 rounded-lg border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow focus:ring-2 focus:ring-indigo-500 text-sm px-3 appearance-none ${
                      difficultyError ? 'shake-animation' : ''
                    }`}
                    required
                  >
                    {Object.entries(difficultyLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* 标签 */}
              <div className="px-3 py-2 sm:p-3">
                <label htmlFor="tags" className="block text-base font-medium text-gray-700 mb-1.5">
                  标签
                </label>
                <div className="flex gap-2">
                  <div className="relative w-1/3">
                    <select
                      id="tags"
                      onChange={handleTagChange}
                      className="block w-full h-12 sm:h-13 rounded-lg border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow focus:ring-2 focus:ring-indigo-500 text-sm px-3 appearance-none"
                    >
                      <option value="">选择标签</option>
                      {predefinedTags.map(tag => (
                        <option key={tag} value={tag}>{tag}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={customTag}
                    onChange={handleCustomTagChange}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddCustomTag()}
                    placeholder="输入自定义标签"
                    className="w-2/3 h-12 sm:h-13 rounded-lg border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow focus:ring-2 focus:ring-indigo-500 text-sm px-3 py-1.5"
                  />
                </div>
                {tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-white border border-gray-100 text-gray-700 shadow-sm hover:shadow-md transition-shadow"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => setTags(prev => prev.filter(t => t !== tag))}
                          className="ml-2 text-gray-500 hover:text-gray-700"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* 重置周期 */}
              <div className="px-3 py-2 sm:p-3">
                <label htmlFor="resetPeriod" className="block text-base font-medium text-gray-700 mb-1.5">
                  重置周期
                </label>
                <div className="relative">
                  <select
                    id="resetPeriod"
                    value={resetPeriod}
                    onChange={(e) => {
                      setResetPeriod(e.target.value as HabitResetPeriod);
                      setResetPeriodError(false);
                    }}
                    className={`block w-full h-12 sm:h-13 rounded-lg border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow focus:ring-2 focus:ring-indigo-500 text-sm px-3 appearance-none ${
                      resetPeriodError ? 'shake-animation' : ''
                    }`}
                    required
                  >
                    <option value={HabitResetPeriod.DAILY}>每日</option>
                    <option value={HabitResetPeriod.WEEKLY}>每周</option>
                    <option value={HabitResetPeriod.MONTHLY}>每月</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* 更多设置 - 折叠面板 */}
              <div className="overflow-hidden">
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="w-full px-3 py-2.5 text-left flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors border-t border-b border-gray-200"
                >
                  <span className="text-sm text-gray-600">更多设置</span>
                  <svg
                    className={`w-5 h-5 text-gray-400 transform transition-transform duration-200 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* 修正计数部分 */}
                {isExpanded && (
                  <div className="px-3 py-2 sm:p-3 bg-white">
                    <div className="mb-2">
                      <label className="block text-base font-medium text-gray-700">
                        修正计数
                      </label>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2 flex-1">
                        <span className="text-2xl sm:text-3xl font-semibold text-[#5DBEAC]">+</span>
                        <div className="relative flex-1">
                          <input
                            type="number"
                            id="goodCount"
                            value={goodCount}
                            onChange={(e) => setGoodCount(Math.min(999, Math.max(0, parseInt(e.target.value) || 0)))}
                            min="0"
                            max="999"
                            className="block w-full h-12 sm:h-13 rounded-lg border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow focus:ring-2 focus:ring-indigo-500 text-sm px-2.5 py-1.5 pr-12"
                          />
                          <div className="absolute inset-y-0 right-0 flex flex-col border-l border-gray-300">
                            <button
                              type="button"
                              onClick={() => setGoodCount(prev => Math.min(999, prev + 1))}
                              className="flex-1 px-3 hover:bg-gray-100 text-gray-600 flex items-center justify-center border-b border-gray-300"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => setGoodCount(prev => Math.max(0, prev - 1))}
                              className="flex-1 px-3 hover:bg-gray-100 text-gray-600 flex items-center justify-center"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 flex-1">
                        <span className="text-2xl sm:text-3xl font-semibold text-[#D81B60]">-</span>
                        <div className="relative flex-1">
                          <input
                            type="number"
                            id="badCount"
                            value={badCount}
                            onChange={(e) => setBadCount(Math.min(999, Math.max(0, parseInt(e.target.value) || 0)))}
                            min="0"
                            max="999"
                            className="block w-full h-12 sm:h-13 rounded-lg border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow focus:ring-2 focus:ring-indigo-500 text-sm px-2.5 py-1.5 pr-12"
                          />
                          <div className="absolute inset-y-0 right-0 flex flex-col border-l border-gray-300">
                            <button
                              type="button"
                              onClick={() => setBadCount(prev => Math.min(999, prev + 1))}
                              className="flex-1 px-3 hover:bg-gray-100 text-gray-600 flex items-center justify-center border-b border-gray-300"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => setBadCount(prev => Math.max(0, prev - 1))}
                              className="flex-1 px-3 hover:bg-gray-100 text-gray-600 flex items-center justify-center"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return createPortal(dialog, document.body);
} 