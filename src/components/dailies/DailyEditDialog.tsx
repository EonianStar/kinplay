'use client';

import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition, Listbox, Tab } from '@headlessui/react';
import { 
  XMarkIcon, 
  CheckIcon, 
  ChevronUpDownIcon, 
  PlusIcon, 
  TrashIcon, 
  EllipsisVerticalIcon, 
  ChevronUpIcon, 
  ChevronDownIcon, 
  MinusIcon 
} from '@heroicons/react/24/outline';
import { StarIcon, ForwardIcon } from '@heroicons/react/24/solid';
import { 
  DailyDifficulty, 
  DailyRepeatPeriod, 
  CreateDailyRequest, 
  ActivePattern,
  Daily,
  WeeklyActiveDays,
  MonthlyActiveDays,
  YearlyActiveMonths
} from '@/types/daily';
import { createPortal } from 'react-dom';
import { Combobox } from '@headlessui/react';

// 难度选项
const difficultyOptions = [
  { id: DailyDifficulty.VERY_EASY, name: '容易' },
  { id: DailyDifficulty.EASY, name: '简单' },
  { id: DailyDifficulty.MEDIUM, name: '中等' },
  { id: DailyDifficulty.HARD, name: '困难' },
];

// 重复周期选项
const repeatPeriodOptions = [
  { id: DailyRepeatPeriod.DAILY, name: '每日' },
  { id: DailyRepeatPeriod.WEEKLY, name: '每周' },
  { id: DailyRepeatPeriod.MONTHLY, name: '每月' },
  { id: DailyRepeatPeriod.YEARLY, name: '每年' },
];

// 周几选项
const weekDayOptions = [
  { id: 1, name: '周一' },
  { id: 2, name: '周二' },
  { id: 3, name: '周三' },
  { id: 4, name: '周四' },
  { id: 5, name: '周五' },
  { id: 6, name: '周六' },
  { id: 7, name: '周日' },
];

// 月份选项
const monthOptions = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  name: `${i + 1}月`,
}));

// 创建月日选项
const createMonthDayOptions = () => {
  return Array.from({ length: 31 }, (_, i) => ({
    id: i + 1,
    name: `${i + 1}日`,
  }));
};

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

// 添加预定义标签
const predefinedTags = ['学习', '工作', '家务', '健康', '社交', '财务', '兴趣'];

interface DailyEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dailyData: CreateDailyRequest | Partial<Daily>) => void;
  initialData?: Partial<Daily>;
}

// 难度星级映射
const difficultyStars: Record<DailyDifficulty, number> = {
  [DailyDifficulty.VERY_EASY]: 1,
  [DailyDifficulty.EASY]: 2,
  [DailyDifficulty.MEDIUM]: 3,
  [DailyDifficulty.HARD]: 4,
};

// 重命名组件以避免冲突
const DifficultyStarsDisplay = ({ difficulty, className }: { difficulty: DailyDifficulty, className?: string }) => {
  const starCount = difficultyStars[difficulty];
  return (
    <div className={`flex ${className || ''}`}>
      {[...Array(starCount)].map((_, index) => (
        <StarIcon
          key={index}
          className="h-3.5 w-3.5 text-yellow-400"
        />
      ))}
    </div>
  );
};

export default function DailyEditDialog({
  isOpen,
  onClose,
  onSave,
  initialData
}: DailyEditDialogProps) {
  // 状态定义
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<DailyDifficulty>(DailyDifficulty.MEDIUM);
  const [repeatPeriod, setRepeatPeriod] = useState<DailyRepeatPeriod>(DailyRepeatPeriod.DAILY);
  const [activePattern, setActivePattern] = useState<ActivePattern>({ type: DailyRepeatPeriod.DAILY, value: 1 });
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [tags, setTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [subtasks, setSubtasks] = useState<{ id?: string; title: string; completed: boolean }[]>([]);
  const [newSubtask, setNewSubtask] = useState('');
  
  // 表单验证错误状态
  const [titleError, setTitleError] = useState(false);
  
  // 控制弹窗挂载状态
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  
  // 初始化数据
  useEffect(() => {
    if (initialData) {
      // 设置其他字段
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setSubtasks(initialData.checklist || []);
      setDifficulty(initialData.difficulty || DailyDifficulty.MEDIUM);
      setStartDate(initialData.start_date || new Date().toISOString().split('T')[0]);
      setRepeatPeriod(initialData.repeat_period || DailyRepeatPeriod.DAILY);
      
      // 添加调试日志
      console.log("初始化任务数据:", initialData);
      
      // 设置活跃模式 (activePattern)
      if (initialData.active_pattern) {
        console.log("活跃模式:", initialData.active_pattern);
        // 直接使用初始数据中的活跃模式
        setActivePattern(initialData.active_pattern);
      } else {
        // 没有活跃模式时使用默认值
        if (initialData.repeat_period === DailyRepeatPeriod.DAILY) {
          setActivePattern({ type: DailyRepeatPeriod.DAILY, value: 1 });
        } else if (initialData.repeat_period === DailyRepeatPeriod.WEEKLY) {
          setActivePattern({ type: DailyRepeatPeriod.WEEKLY, value: [] });
        } else if (initialData.repeat_period === DailyRepeatPeriod.MONTHLY) {
          setActivePattern({ type: DailyRepeatPeriod.MONTHLY, value: [] });
        } else if (initialData.repeat_period === DailyRepeatPeriod.YEARLY) {
          setActivePattern({ type: DailyRepeatPeriod.YEARLY, value: [] });
        } else {
          // 默认值
          setActivePattern({ type: DailyRepeatPeriod.DAILY, value: 1 });
        }
      }
      
      setTags(initialData.tags || []);
    } else {
      // 重置表单
      resetForm();
    }
    setTitleError(false);
  }, [initialData]);

  // 重置表单到初始状态
  const resetForm = () => {
    setTitle('');
    setTitleError(false);
    setDescription('');
    setSubtasks([]);
    setDifficulty(DailyDifficulty.MEDIUM);
    setStartDate(new Date().toISOString().split('T')[0]);
    setRepeatPeriod(DailyRepeatPeriod.DAILY);
    setActivePattern({ type: DailyRepeatPeriod.DAILY, value: 1 });
    setTags([]);
    setCustomTag('');
    setNewSubtask('');
  };

  // 添加新的子任务
  const addSubtask = () => {
    setSubtasks([...subtasks, { title: '', completed: false }]);
  };

  // 更新子任务标题
  const updateSubtaskTitle = (index: number, title: string) => {
    const newSubtasks = [...subtasks];
    newSubtasks[index].title = title;
    setSubtasks(newSubtasks);
  };

  // 删除子任务
  const removeSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  // 添加标签处理方法
  const handleTagChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === '') return;
    
    if (!tags.includes(value)) {
      setTags(prev => [...prev, value]);
    }
    e.target.value = ''; // 重置选择
  };

  // 添加自定义标签处理方法
  const handleCustomTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomTag(e.target.value);
  };

  const handleAddCustomTag = () => {
    if (customTag.trim() && !tags.includes(customTag.trim())) {
      setTags(prev => [...prev, customTag.trim()]);
      setCustomTag('');
    }
  };

  // 处理Enter键添加标签
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustomTag();
    }
  };

  // 删除标签
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // 重复周期变化处理
  const handleRepeatPeriodChange = (newPeriod: DailyRepeatPeriod) => {
    // 先设置周期
    setRepeatPeriod(newPeriod);
    
    // 根据新周期重置活跃模式数据
    if (newPeriod === DailyRepeatPeriod.DAILY) {
      setActivePattern({ type: DailyRepeatPeriod.DAILY, value: 1 });
    } else if (newPeriod === DailyRepeatPeriod.WEEKLY) {
      setActivePattern({ type: DailyRepeatPeriod.WEEKLY, value: [] });
    } else if (newPeriod === DailyRepeatPeriod.MONTHLY) {
      setActivePattern({ type: DailyRepeatPeriod.MONTHLY, value: [] });
    } else if (newPeriod === DailyRepeatPeriod.YEARLY) {
      setActivePattern({ type: DailyRepeatPeriod.YEARLY, value: [] });
    }
  };

  // 提交表单
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let hasError = false;
    
    // 验证
    if (!title.trim()) {
      setTitleError(true);
      hasError = true;
    }
    
    if (!difficulty) {
      hasError = true;
    }
    
    if (!repeatPeriod) {
      hasError = true;
    }
    
    // 根据重复周期验证活跃方式
    if (repeatPeriod === DailyRepeatPeriod.WEEKLY) {
      const weeklyPattern = activePattern.value as WeeklyActiveDays;
      if (!Array.isArray(weeklyPattern) || weeklyPattern.length === 0) {
        hasError = true;
      }
    }
    
    if (repeatPeriod === DailyRepeatPeriod.MONTHLY) {
      const monthlyPattern = activePattern.value as MonthlyActiveDays;
      if (!Array.isArray(monthlyPattern) || monthlyPattern.length === 0) {
        hasError = true;
      }
    }
    
    if (repeatPeriod === DailyRepeatPeriod.YEARLY) {
      const yearlyPattern = activePattern.value as YearlyActiveMonths;
      if (!Array.isArray(yearlyPattern) || yearlyPattern.length === 0) {
        hasError = true;
      }
    }
    
    if (hasError) {
      // 1秒后清除错误状态
      setTimeout(() => {
        setTitleError(false);
      }, 1000);
      return;
    }
    
    // 构建活跃方式数据
    let activePatternToSave: ActivePattern;
    if (repeatPeriod === DailyRepeatPeriod.DAILY) {
      const dailyValue = typeof activePattern.value === 'number' 
        ? activePattern.value 
        : 1;
      
      activePatternToSave = {
        type: DailyRepeatPeriod.DAILY,
        value: Math.min(24, Math.max(1, dailyValue)) // 限制在1-24之间
      };
    } else if (repeatPeriod === DailyRepeatPeriod.WEEKLY) {
      activePatternToSave = {
        type: DailyRepeatPeriod.WEEKLY,
        value: Array.isArray(activePattern.value) ? activePattern.value as WeeklyActiveDays : []
      };
    } else if (repeatPeriod === DailyRepeatPeriod.MONTHLY) {
      activePatternToSave = {
        type: DailyRepeatPeriod.MONTHLY,
        value: Array.isArray(activePattern.value) ? activePattern.value as MonthlyActiveDays : []
      };
    } else {
      activePatternToSave = {
        type: DailyRepeatPeriod.YEARLY,
        value: Array.isArray(activePattern.value) ? activePattern.value as YearlyActiveMonths : []
      };
    }
    
    // 过滤掉空的子任务
    const filteredSubtasks = subtasks
      .filter(item => item.title.trim())
      .map(item => ({
        title: item.title.trim(),
        completed: item.completed || false
      }));
    
    // 提交数据
    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      checklist: filteredSubtasks,
      difficulty: difficulty,
      start_date: startDate,
      repeat_period: repeatPeriod,
      active_pattern: activePatternToSave,
      tags,
    });
    
    onClose();
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
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">编辑日常任务</h2>
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
                form="dailyForm"
                className="px-2.5 py-1.5 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                保存
              </button>
            </div>
          </div>

          <form id="dailyForm" onSubmit={handleSubmit} className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 9rem)' }}>
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
                  placeholder="请添加日常任务标题"
                  className={`block w-full h-12 sm:h-13 rounded-lg border ${
                    titleError 
                      ? 'shake-animation' 
                      : 'border-gray-100'
                  } bg-white shadow-sm hover:shadow-md transition-shadow focus:ring-2 focus:ring-indigo-500 text-sm px-3 py-1.5`}
                />
              </div>

              {/* 说明 */}
              <div className="px-3 py-2 sm:p-3">
                <label htmlFor="description" className="block text-base font-medium text-gray-700 mb-1.5">
                  说明
                </label>
                <textarea
                  id="description"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="请添加日常任务说明"
                  className="block w-full rounded-lg border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow focus:ring-2 focus:ring-indigo-500 text-sm px-3 py-2"
                />
              </div>

              {/* 子任务清单 */}
              <div className="px-3 py-2 sm:p-3">
                <label htmlFor="checklist" className="block text-base font-medium text-gray-700 mb-1.5">
                  子任务清单
                </label>
                <div className="space-y-2">
                  {subtasks.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        className="block flex-1 rounded-lg border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow focus:ring-2 focus:ring-indigo-500 text-sm px-3 py-2"
                        value={item.title}
                        onChange={(e) => updateSubtaskTitle(index, e.target.value)}
                        placeholder={`子任务 ${index + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => removeSubtask(index)}
                        className="p-1.5 text-gray-500 hover:text-red-600"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addSubtask}
                    className="flex items-center text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    添加子任务
                  </button>
                </div>
              </div>

              {/* 难度选择 */}
              <div className="px-3 py-2 sm:p-3">
                <label htmlFor="difficulty" className="block text-base font-medium text-gray-700 mb-1.5">
                  难度
                </label>
                <Listbox value={difficulty} onChange={setDifficulty}>
                  <div className="relative mt-1">
                    <Listbox.Button className="relative w-full cursor-default rounded-lg border border-gray-100 bg-white py-2 pl-3 pr-10 text-left shadow-sm hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm">
                      <span className="flex items-center">
                        <span className="block truncate mr-2">{difficultyOptions.find(o => o.id === difficulty)?.name}</span>
                        <DifficultyStarsDisplay difficulty={difficulty} />
                      </span>
                      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </span>
                    </Listbox.Button>
                    <Transition
                      as={Fragment}
                      leave="transition ease-in duration-100"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        {difficultyOptions.map((option) => (
                          <Listbox.Option
                            key={option.id}
                            className={({ active }) =>
                              `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                active ? 'bg-indigo-100 text-indigo-900' : 'text-gray-900'
                              }`
                            }
                            value={option.id}
                          >
                            {({ selected }) => (
                              <>
                                <span className={`flex items-center ${selected ? 'font-medium' : 'font-normal'}`}>
                                  <span className="mr-2">{option.name}</span>
                                  <DifficultyStarsDisplay difficulty={option.id} />
                                </span>
                                {selected ? (
                                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600">
                                    <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                  </span>
                                ) : null}
                              </>
                            )}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </Transition>
                  </div>
                </Listbox>
              </div>

              {/* 开始日期和重复周期 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 开始日期 */}
                <div className="px-3 py-2 sm:p-3">
                  <label htmlFor="startDate" className="block text-base font-medium text-gray-700 mb-1.5">
                    开始日期
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    className="block w-full rounded-lg border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow focus:ring-2 focus:ring-indigo-500 text-sm px-3 py-2"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                {/* 重复周期 */}
                <div className="px-3 py-2 sm:p-3">
                  <label htmlFor="repeatPeriod" className="block text-base font-medium text-gray-700 mb-1.5">
                    重复周期
                  </label>
                  <select
                    id="repeatPeriod"
                    value={repeatPeriod}
                    onChange={(e) => {
                      const selected = repeatPeriodOptions.find(
                        option => option.id === e.target.value
                      );
                      if (selected) {
                        handleRepeatPeriodChange(selected.id);
                      }
                    }}
                    className={`block w-full rounded-lg border ${
                      'border-gray-100'
                    } bg-white shadow-sm hover:shadow-md transition-shadow focus:ring-2 focus:ring-indigo-500 text-sm px-3 py-2`}
                  >
                    {repeatPeriodOptions.map((option) => (
                      <option key={option.id} value={option.id}>{option.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 周期频次 / 活跃方式（根据重复周期显示不同内容） */}
              {repeatPeriod === DailyRepeatPeriod.DAILY && (
                <div className="px-3 py-2 sm:p-3">
                  <label htmlFor="dailyFrequency" className="block text-base font-medium text-gray-700 mb-1.5">
                    每日频率
                  </label>
                  <input
                    type="number"
                    id="dailyFrequency"
                    className="block w-full rounded-lg border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow focus:ring-2 focus:ring-indigo-500 text-sm px-3 py-2"
                    value={typeof activePattern.value === 'number' ? activePattern.value : 1}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      setActivePattern({
                        type: DailyRepeatPeriod.DAILY,
                        value: isNaN(value) ? 1 : Math.min(24, Math.max(1, value))
                      });
                    }}
                    min={1}
                    max={24}
                  />
                </div>
              )}

              {repeatPeriod === DailyRepeatPeriod.WEEKLY && (
                <div className="px-3 py-2 sm:p-3">
                  <label className="block text-base font-medium text-gray-700 mb-1.5">
                    每周哪几天
                  </label>
                  <div className={`flex flex-wrap gap-2 p-3 border rounded-md ${'border-gray-100'}`}>
                    {weekDayOptions.map((day) => {
                      // 确保我们有一个数组来处理
                      const currentValue = Array.isArray(activePattern.value) 
                        ? activePattern.value as number[] 
                        : [];
                      
                      return (
                        <button
                          key={day.id}
                          type="button"
                          onClick={() => {
                            if (currentValue.includes(day.id)) {
                              setActivePattern({
                                type: DailyRepeatPeriod.WEEKLY,
                                value: currentValue.filter((id) => id !== day.id) as WeeklyActiveDays
                              });
                            } else {
                              setActivePattern({
                                type: DailyRepeatPeriod.WEEKLY,
                                value: [...currentValue, day.id] as WeeklyActiveDays
                              });
                            }
                          }}
                          className={`px-3 py-1 rounded-full text-sm ${
                            currentValue.includes(day.id)
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {day.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 每月活跃日期选择 */}
              {repeatPeriod === DailyRepeatPeriod.MONTHLY && (
                <div className="px-3 py-2 sm:p-3">
                  <label className="block text-base font-medium text-gray-700 mb-1.5">
                    每月哪几天
                  </label>
                  <div className={`grid grid-cols-7 gap-2 p-3 border rounded-md ${'border-gray-100'}`}>
                    {createMonthDayOptions().map((day) => {
                      // 确保我们有一个数组来处理
                      const currentValue = Array.isArray(activePattern.value) 
                        ? activePattern.value as number[] 
                        : [];
                      
                      return (
                        <button
                          key={day.id}
                          type="button"
                          onClick={() => {
                            if (currentValue.includes(day.id)) {
                              setActivePattern({
                                type: DailyRepeatPeriod.MONTHLY,
                                value: currentValue.filter((id) => id !== day.id) as MonthlyActiveDays
                              });
                            } else {
                              setActivePattern({
                                type: DailyRepeatPeriod.MONTHLY,
                                value: [...currentValue, day.id] as MonthlyActiveDays
                              });
                            }
                          }}
                          className={`px-1 py-1 rounded-full text-xs ${
                            currentValue.includes(day.id)
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {day.id}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 每年活跃月份选择 */}
              {repeatPeriod === DailyRepeatPeriod.YEARLY && (
                <div className="px-3 py-2 sm:p-3">
                  <label className="block text-base font-medium text-gray-700 mb-1.5">
                    每年哪几个月
                  </label>
                  <div className={`flex flex-wrap gap-2 p-3 border rounded-md ${'border-gray-100'}`}>
                    {monthOptions.map((month) => {
                      // 确保我们有一个数组来处理
                      const currentValue = Array.isArray(activePattern.value) 
                        ? activePattern.value as number[] 
                        : [];
                      
                      return (
                        <button
                          key={month.id}
                          type="button"
                          onClick={() => {
                            if (currentValue.includes(month.id)) {
                              setActivePattern({
                                type: DailyRepeatPeriod.YEARLY,
                                value: currentValue.filter((id) => id !== month.id) as YearlyActiveMonths
                              });
                            } else {
                              setActivePattern({
                                type: DailyRepeatPeriod.YEARLY,
                                value: [...currentValue, month.id] as YearlyActiveMonths
                              });
                            }
                          }}
                          className={`px-3 py-1 rounded-full text-sm ${
                            currentValue.includes(month.id)
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {month.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 标签 - 使用下拉选择和自定义输入 */}
              <div className="px-3 py-2 sm:p-3">
                <label htmlFor="tags" className="block text-base font-medium text-gray-700 mb-1.5">
                  标签
                </label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div className="col-span-1 relative">
                    <select
                      onChange={handleTagChange}
                      className="block w-full h-10 rounded-lg border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow focus:ring-2 focus:ring-indigo-500 text-sm px-3 py-2 pr-12 appearance-none truncate"
                      aria-label="选择标签"
                    >
                      <option value="" className="truncate">选择标签</option>
                      {predefinedTags.map((tag) => (
                        <option key={tag} value={tag} className="truncate">{tag}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
                      <ChevronDownIcon className="h-4 w-4 text-gray-400 flex-shrink-0" aria-hidden="true" />
                    </div>
                  </div>
                  <div className="col-span-1">
                    <input
                      type="text"
                      className="block w-full h-10 rounded-lg border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow focus:ring-2 focus:ring-indigo-500 text-sm px-3 py-2"
                      value={customTag}
                      onChange={handleCustomTagChange}
                      placeholder="输入自定义标签"
                      onKeyDown={handleKeyDown}
                    />
                  </div>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag, index) => (
                      <div 
                        key={index} 
                        className="flex items-center border border-gray-200 text-gray-700 text-sm px-3 py-1 rounded-full transition-all hover:shadow-md hover:border-gray-300 hover:bg-gray-50"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 text-gray-500 hover:text-red-500"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
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