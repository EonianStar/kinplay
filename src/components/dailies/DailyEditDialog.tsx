'use client';

import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition, Listbox } from '@headlessui/react';
import { XMarkIcon, CheckIcon, ChevronUpDownIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { 
  DailyDifficulty, 
  DailyRepeatPeriod, 
  CreateDailyRequest, 
  ActivePattern
} from '@/types/daily';

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

interface DailyEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dailyData: CreateDailyRequest) => void;
  initialData?: any;
}

export default function DailyEditDialog({
  isOpen,
  onClose,
  onSave,
  initialData
}: DailyEditDialogProps) {
  // 表单状态
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [checklist, setChecklist] = useState<{ id?: string; title: string; completed?: boolean }[]>([]);
  const [difficulty, setDifficulty] = useState(difficultyOptions[0]);
  const [startDate, setStartDate] = useState('');
  const [repeatPeriod, setRepeatPeriod] = useState(repeatPeriodOptions[0]);
  const [dailyFrequency, setDailyFrequency] = useState(1);
  const [selectedWeekDays, setSelectedWeekDays] = useState<number[]>([]);
  const [selectedMonthDays, setSelectedMonthDays] = useState<number[]>([]);
  const [selectedMonths, setSelectedMonths] = useState<number[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});

  // 今天的日期，格式为YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];

  // 初始化表单
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setChecklist(initialData.checklist || []);
      
      const selectedDifficulty = difficultyOptions.find(option => option.id === initialData.difficulty);
      setDifficulty(selectedDifficulty || difficultyOptions[0]);
      
      setStartDate(initialData.start_date || today);
      
      const selectedRepeatPeriod = repeatPeriodOptions.find(option => option.id === initialData.repeat_period);
      setRepeatPeriod(selectedRepeatPeriod || repeatPeriodOptions[0]);
      
      if (initialData.active_pattern) {
        if (initialData.repeat_period === DailyRepeatPeriod.DAILY) {
          setDailyFrequency(initialData.active_pattern.value || 1);
        } else if (initialData.repeat_period === DailyRepeatPeriod.WEEKLY) {
          setSelectedWeekDays(initialData.active_pattern.value || []);
        } else if (initialData.repeat_period === DailyRepeatPeriod.MONTHLY) {
          setSelectedMonthDays(initialData.active_pattern.value || []);
        } else if (initialData.repeat_period === DailyRepeatPeriod.YEARLY) {
          setSelectedMonths(initialData.active_pattern.value || []);
        }
      }
      
      setTags(initialData.tags || []);
    } else {
      // 重置表单
      resetForm();
    }
    setErrors({});
  }, [initialData, isOpen]);

  // 重置表单到初始状态
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setChecklist([]);
    setDifficulty(difficultyOptions[0]);
    setStartDate(today);
    setRepeatPeriod(repeatPeriodOptions[0]);
    setDailyFrequency(1);
    setSelectedWeekDays([]);
    setSelectedMonthDays([]);
    setSelectedMonths([]);
    setTags([]);
    setNewTag('');
  };

  // 添加新的子任务
  const addChecklistItem = () => {
    setChecklist([...checklist, { title: '' }]);
  };

  // 更新子任务标题
  const updateChecklistItemTitle = (index: number, title: string) => {
    const newChecklist = [...checklist];
    newChecklist[index].title = title;
    setChecklist(newChecklist);
  };

  // 删除子任务
  const removeChecklistItem = (index: number) => {
    setChecklist(checklist.filter((_, i) => i !== index));
  };

  // 添加标签
  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  // 删除标签
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // 提交表单
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 验证
    const newErrors: { [key: string]: boolean } = {};
    if (!title.trim()) {
      newErrors.title = true;
    }
    if (!difficulty) {
      newErrors.difficulty = true;
    }
    if (!repeatPeriod) {
      newErrors.repeatPeriod = true;
    }
    // 根据重复周期验证活跃方式
    if (repeatPeriod.id === DailyRepeatPeriod.WEEKLY && selectedWeekDays.length === 0) {
      newErrors.weekDays = true;
    }
    if (repeatPeriod.id === DailyRepeatPeriod.MONTHLY && selectedMonthDays.length === 0) {
      newErrors.monthDays = true;
    }
    if (repeatPeriod.id === DailyRepeatPeriod.YEARLY && selectedMonths.length === 0) {
      newErrors.months = true;
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // 1秒后清除错误
      setTimeout(() => setErrors({}), 1000);
      return;
    }
    
    // 构建活跃方式数据
    let activePattern: ActivePattern;
    if (repeatPeriod.id === DailyRepeatPeriod.DAILY) {
      activePattern = {
        type: DailyRepeatPeriod.DAILY,
        value: Math.min(24, Math.max(1, dailyFrequency)) // 限制在1-24之间
      };
    } else if (repeatPeriod.id === DailyRepeatPeriod.WEEKLY) {
      activePattern = {
        type: DailyRepeatPeriod.WEEKLY,
        value: selectedWeekDays
      };
    } else if (repeatPeriod.id === DailyRepeatPeriod.MONTHLY) {
      activePattern = {
        type: DailyRepeatPeriod.MONTHLY,
        value: selectedMonthDays
      };
    } else {
      activePattern = {
        type: DailyRepeatPeriod.YEARLY,
        value: selectedMonths
      };
    }
    
    // 过滤掉空的子任务
    const filteredChecklist = checklist
      .filter(item => item.title.trim())
      .map(item => ({
        title: item.title.trim(),
        completed: item.completed || false
      }));
    
    // 提交数据
    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      checklist: filteredChecklist,
      difficulty: difficulty.id,
      start_date: startDate || today,
      repeat_period: repeatPeriod.id,
      active_pattern: activePattern,
      tags
    });
    
    onClose();
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 w-full max-w-2xl sm:p-6">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={onClose}
                  >
                    <span className="sr-only">关闭</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                      {initialData ? '编辑日常任务' : '新增日常任务'}
                    </Dialog.Title>
                    <div className="mt-4">
                      <form onSubmit={handleSubmit} className="space-y-4">
                        {/* 标题 */}
                        <div>
                          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                            标题 *
                          </label>
                          <input
                            type="text"
                            id="title"
                            className={`block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ${
                              errors.title 
                                ? 'ring-red-500 animate-pulse-red' 
                                : 'ring-gray-300 focus:ring-indigo-600'
                            } placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6`}
                            value={title}
                            onChange={(e) => {
                              setTitle(e.target.value);
                              if (e.target.value.trim()) {
                                setErrors((prev) => ({ ...prev, title: false }));
                              }
                            }}
                            placeholder="输入日常任务标题"
                          />
                        </div>
                        
                        {/* 说明 */}
                        <div>
                          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                            说明
                          </label>
                          <textarea
                            id="description"
                            rows={3}
                            className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="输入日常任务说明（选填）"
                          />
                        </div>

                        {/* 子任务清单 */}
                        <div>
                          <label htmlFor="checklist" className="block text-sm font-medium text-gray-700 mb-1">
                            子任务清单
                          </label>
                          <div className="space-y-2">
                            {checklist.map((item, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <input
                                  type="text"
                                  className="block flex-1 rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                  value={item.title}
                                  onChange={(e) => updateChecklistItemTitle(index, e.target.value)}
                                  placeholder={`子任务 ${index + 1}`}
                                />
                                <button
                                  type="button"
                                  onClick={() => removeChecklistItem(index)}
                                  className="p-1.5 text-gray-500 hover:text-red-600"
                                >
                                  <TrashIcon className="h-5 w-5" />
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={addChecklistItem}
                              className="flex items-center text-sm text-indigo-600 hover:text-indigo-800"
                            >
                              <PlusIcon className="h-4 w-4 mr-1" />
                              添加子任务
                            </button>
                          </div>
                        </div>

                        {/* 难度 */}
                        <div>
                          <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
                            难度 *
                          </label>
                          <Listbox value={difficulty} onChange={setDifficulty}>
                            <div className="relative mt-1">
                              <Listbox.Button className={`relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ${
                                errors.difficulty 
                                  ? 'ring-red-500 animate-pulse-red' 
                                  : 'ring-gray-300'
                              } focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6`}>
                                <span className="block truncate">{difficulty.name}</span>
                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                  <ChevronUpDownIcon
                                    className="h-5 w-5 text-gray-400"
                                    aria-hidden="true"
                                  />
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
                                      value={option}
                                    >
                                      {({ selected }) => (
                                        <>
                                          <span
                                            className={`block truncate ${
                                              selected ? 'font-medium' : 'font-normal'
                                            }`}
                                          >
                                            {option.name}
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

                        {/* 开始日期 */}
                        <div>
                          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                            开始日期 *
                          </label>
                          <input
                            type="date"
                            id="startDate"
                            className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            min={today}
                          />
                        </div>

                        {/* 重复周期 */}
                        <div>
                          <label htmlFor="repeatPeriod" className="block text-sm font-medium text-gray-700 mb-1">
                            重复周期 *
                          </label>
                          <Listbox 
                            value={repeatPeriod} 
                            onChange={(value) => {
                              setRepeatPeriod(value);
                              // 清除相关错误
                              setErrors((prev) => ({
                                ...prev,
                                repeatPeriod: false,
                                weekDays: false,
                                monthDays: false,
                                months: false
                              }));
                            }}
                          >
                            <div className="relative mt-1">
                              <Listbox.Button className={`relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ${
                                errors.repeatPeriod 
                                  ? 'ring-red-500 animate-pulse-red' 
                                  : 'ring-gray-300'
                              } focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6`}>
                                <span className="block truncate">{repeatPeriod.name}</span>
                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                  <ChevronUpDownIcon
                                    className="h-5 w-5 text-gray-400"
                                    aria-hidden="true"
                                  />
                                </span>
                              </Listbox.Button>
                              <Transition
                                as={Fragment}
                                leave="transition ease-in duration-100"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                              >
                                <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                  {repeatPeriodOptions.map((option) => (
                                    <Listbox.Option
                                      key={option.id}
                                      className={({ active }) =>
                                        `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                          active ? 'bg-indigo-100 text-indigo-900' : 'text-gray-900'
                                        }`
                                      }
                                      value={option}
                                    >
                                      {({ selected }) => (
                                        <>
                                          <span
                                            className={`block truncate ${
                                              selected ? 'font-medium' : 'font-normal'
                                            }`}
                                          >
                                            {option.name}
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

                        {/* 周期频次 / 活跃方式（根据重复周期显示不同内容） */}
                        {repeatPeriod.id === DailyRepeatPeriod.DAILY && (
                          <div>
                            <label htmlFor="dailyFrequency" className="block text-sm font-medium text-gray-700 mb-1">
                              每日频次（1-24次）
                            </label>
                            <input
                              type="number"
                              id="dailyFrequency"
                              className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                              value={dailyFrequency}
                              onChange={(e) => {
                                const value = parseInt(e.target.value);
                                setDailyFrequency(
                                  isNaN(value) ? 1 : Math.min(24, Math.max(1, value))
                                );
                              }}
                              min={1}
                              max={24}
                            />
                          </div>
                        )}

                        {repeatPeriod.id === DailyRepeatPeriod.WEEKLY && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              每周哪几天 *
                            </label>
                            <div className={`flex flex-wrap gap-2 p-3 border rounded-md ${
                              errors.weekDays ? 'border-red-500 animate-pulse-red' : 'border-gray-300'
                            }`}>
                              {weekDayOptions.map((day) => (
                                <button
                                  key={day.id}
                                  type="button"
                                  onClick={() => {
                                    if (selectedWeekDays.includes(day.id)) {
                                      setSelectedWeekDays(selectedWeekDays.filter(id => id !== day.id));
                                    } else {
                                      setSelectedWeekDays([...selectedWeekDays, day.id]);
                                      // 清除错误
                                      if (errors.weekDays) {
                                        setErrors((prev) => ({ ...prev, weekDays: false }));
                                      }
                                    }
                                  }}
                                  className={`px-3 py-1 rounded-full text-sm ${
                                    selectedWeekDays.includes(day.id)
                                      ? 'bg-indigo-600 text-white'
                                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                  }`}
                                >
                                  {day.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {repeatPeriod.id === DailyRepeatPeriod.MONTHLY && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              每月哪几天 *
                            </label>
                            <div className={`grid grid-cols-7 gap-2 p-3 border rounded-md ${
                              errors.monthDays ? 'border-red-500 animate-pulse-red' : 'border-gray-300'
                            }`}>
                              {createMonthDayOptions().map((day) => (
                                <button
                                  key={day.id}
                                  type="button"
                                  onClick={() => {
                                    if (selectedMonthDays.includes(day.id)) {
                                      setSelectedMonthDays(selectedMonthDays.filter(id => id !== day.id));
                                    } else {
                                      setSelectedMonthDays([...selectedMonthDays, day.id]);
                                      // 清除错误
                                      if (errors.monthDays) {
                                        setErrors((prev) => ({ ...prev, monthDays: false }));
                                      }
                                    }
                                  }}
                                  className={`px-1 py-1 rounded-full text-xs ${
                                    selectedMonthDays.includes(day.id)
                                      ? 'bg-indigo-600 text-white'
                                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                  }`}
                                >
                                  {day.id}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {repeatPeriod.id === DailyRepeatPeriod.YEARLY && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              每年哪几个月 *
                            </label>
                            <div className={`flex flex-wrap gap-2 p-3 border rounded-md ${
                              errors.months ? 'border-red-500 animate-pulse-red' : 'border-gray-300'
                            }`}>
                              {monthOptions.map((month) => (
                                <button
                                  key={month.id}
                                  type="button"
                                  onClick={() => {
                                    if (selectedMonths.includes(month.id)) {
                                      setSelectedMonths(selectedMonths.filter(id => id !== month.id));
                                    } else {
                                      setSelectedMonths([...selectedMonths, month.id]);
                                      // 清除错误
                                      if (errors.months) {
                                        setErrors((prev) => ({ ...prev, months: false }));
                                      }
                                    }
                                  }}
                                  className={`px-3 py-1 rounded-full text-sm ${
                                    selectedMonths.includes(month.id)
                                      ? 'bg-indigo-600 text-white'
                                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                  }`}
                                >
                                  {month.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 标签 */}
                        <div>
                          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                            标签
                          </label>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {tags.map((tag, index) => (
                              <div key={index} className="flex items-center bg-indigo-100 text-indigo-800 text-sm px-2 py-1 rounded">
                                {tag}
                                <button
                                  type="button"
                                  onClick={() => removeTag(tag)}
                                  className="ml-1 text-indigo-500 hover:text-indigo-700"
                                >
                                  <XMarkIcon className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                          <div className="flex">
                            <input
                              type="text"
                              className="block flex-1 rounded-l-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                              value={newTag}
                              onChange={(e) => setNewTag(e.target.value)}
                              placeholder="输入标签"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  addTag();
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={addTag}
                              disabled={!newTag.trim()}
                              className="inline-flex items-center px-3 py-1.5 rounded-r-md border border-l-0 border-gray-300 bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                              添加
                            </button>
                          </div>
                        </div>

                        <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                          <button
                            type="submit"
                            className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2"
                          >
                            保存
                          </button>
                          <button
                            type="button"
                            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                            onClick={onClose}
                          >
                            取消
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
} 