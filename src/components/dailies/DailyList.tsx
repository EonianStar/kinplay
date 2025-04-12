'use client';

import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import { Daily, DailyDifficulty, UpdateDailyRequest, CreateDailyRequest, DailyTask, DailyRepeatPeriod } from '@/types/daily';
import { getDailies, deleteDaily, updateDailyStreak, updateDaily, updateDailiesOrder } from '@/services/dailies';
import DailyEditDialog from './DailyEditDialog';
import { Menu } from '@headlessui/react';
import { 
  PlusIcon, 
  MinusIcon, 
  TagIcon,
  EllipsisVerticalIcon,
  PencilSquareIcon,
  TrashIcon,
  StarIcon as StarIconOutline,
  ArrowPathIcon,
  CheckIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ListBulletIcon
} from '@heroicons/react/24/outline';
import { ForwardIcon, StarIcon } from '@heroicons/react/24/solid';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { supabase } from '@/lib/supabase';
import { getColorByValueLevel, ValueLevel } from '@/utils/valueLevel';
import useIsMobile from '@/hooks/useIsMobile';
import MobileOrderButtons from '@/components/common/MobileOrderButtons';

interface DailyListProps {
  onAddClick?: () => void;
  filter?: 'active' | 'inactive' | 'all';
}

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

interface SortableDailyItemProps {
  daily: Daily;
  onDelete: (id: string) => Promise<void>;
  onEdit: (daily: Daily) => void;
  onToggleComplete: (daily: Daily) => Promise<void>;
  onToggleSubtaskComplete: (dailyId: string, taskId: string, completed: boolean) => Promise<void>;
  onIncrementStreak: (id: string) => Promise<void>;
  onResetStreak: (id: string) => Promise<void>;
  onTagClick: (id: string) => void;
  visibleTagId: string | null;
  expandedDailies: {[key: string]: boolean};
  toggleExpand: (dailyId: string) => void;
  getCompletedTasksCount: (checklist: DailyTask[] | undefined) => { completed: number; total: number };
  renderDifficultyStars: (difficulty: DailyDifficulty) => JSX.Element;
  formatDate: (dateStr: string) => string;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}

// 可拖拽的日常任务项组件
const SortableDailyItem = ({
  daily,
  onDelete,
  onEdit,
  onToggleComplete,
  onToggleSubtaskComplete,
  onIncrementStreak,
  onResetStreak,
  onTagClick,
  visibleTagId,
  expandedDailies,
  toggleExpand,
  getCompletedTasksCount,
  renderDifficultyStars,
  formatDate,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast
}: SortableDailyItemProps) => {
  const [showMobileButtons, setShowMobileButtons] = useState(false);
  const isMobile = useIsMobile();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: daily.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1000 : 1,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative' as const
  };

  // 长按处理函数
  const handleLongPress = () => {
    if (isMobile) {
      // 播放触觉反馈 (如果设备支持)
      if ('vibrate' in navigator) {
        navigator.vibrate(50); // 振动50ms
      }
      // 显示移动按钮
      setShowMobileButtons(true);
    }
  };

  // 添加长按检测
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  
  const startLongPress = () => {
    if (isMobile) {
      longPressTimer.current = setTimeout(() => {
        handleLongPress();
      }, 500); // 500ms长按触发
    }
  };
  
  const cancelLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const desktopListeners = isMobile ? {} : listeners;

  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="bg-white rounded-lg shadow-sm transition-all duration-200 hover:shadow-md mb-3 relative group"
    >
      <div className="flex">
        {/* 左侧色块与复选框 */}
        <div className="w-10 flex items-center justify-center rounded-l-lg" style={{ backgroundColor: getColorByValueLevel(daily.value_level || 0) }}>
          <input
            type="checkbox"
            className="h-5 w-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
            onChange={() => onToggleComplete(daily)}
          />
        </div>
        
        {/* 主要内容区域 */}
        <div 
          className={`flex-1 py-3 px-4 ${isMobile ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}`}
          {...desktopListeners}
          onTouchStart={isMobile ? startLongPress : undefined}
          onTouchEnd={isMobile ? cancelLongPress : undefined}
          onTouchMove={isMobile ? cancelLongPress : undefined}
          onTouchCancel={isMobile ? cancelLongPress : undefined}
        >
          {/* 移动端排序按钮 */}
          {isMobile && showMobileButtons && (
            <MobileOrderButtons
              isFirst={isFirst}
              isLast={isLast}
              onMoveUp={onMoveUp}
              onMoveDown={onMoveDown}
              onClose={() => setShowMobileButtons(false)}
            />
          )}
          
          <div className="flex justify-between items-start">
            <div>
              <div className="font-medium text-gray-900 break-all">{daily.title}</div>
              {daily.description && (
                <p className="text-gray-500 text-sm mt-0.5 break-all">{daily.description}</p>
              )}
              
              {/* 子任务清单 - 带折叠功能，使用图标代替文字 */}
              {daily.checklist && daily.checklist.length > 0 && (
                <div className="mt-1 mb-2">
                  <button 
                    onClick={() => toggleExpand(daily.id)}
                    className="flex items-center text-xs text-gray-500 mb-1 hover:text-indigo-600"
                  >
                    <ListBulletIcon className="h-4 w-4 mr-1" />
                    {expandedDailies[daily.id] ? (
                      <ChevronDownIcon className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronRightIcon className="h-3.5 w-3.5" />
                    )}
                    <span className="ml-1.5">
                      {getCompletedTasksCount(daily.checklist).completed}/{getCompletedTasksCount(daily.checklist).total}
                    </span>
                  </button>
                  
                  {expandedDailies[daily.id] && (
                    <div className="pl-2 space-y-1 mt-1 border-l-2 border-gray-100">
                      {daily.checklist.map((task) => (
                        <div key={task.id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => onToggleSubtaskComplete(daily.id, task.id, task.completed)}
                            className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 mr-2"
                          />
                          <span className={`text-xs ${task.completed ? 'line-through text-gray-400' : 'text-gray-600'}`}>
                            {task.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex flex-col items-end space-y-2 ml-2">
              {/* 直接按钮替代下拉菜单 */}
              <div className="flex space-x-1">
                <button
                  onClick={() => onEdit(daily)}
                  className="p-1 text-gray-400 hover:text-indigo-600 focus:outline-none rounded-full hover:bg-gray-100"
                >
                  <PencilSquareIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDelete(daily.id)}
                  className="p-1 text-gray-400 hover:text-red-600 focus:outline-none rounded-full hover:bg-gray-100"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
              
              {/* 难度星星显示 */}
              <div className="flex items-center">
                {renderDifficultyStars(daily.difficulty)}
              </div>
            </div>
          </div>
            
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center text-xs text-gray-500 space-x-3">
              {/* 显示重复周期 */}
              {daily.repeat_period && (
                <div className="max-w-[160px] break-words">
                  {daily.repeat_period === DailyRepeatPeriod.DAILY && (
                    <span><span className="font-bold">每日</span> x {daily.active_pattern?.value || 1}次</span>
                  )}
                  
                  {daily.repeat_period === DailyRepeatPeriod.WEEKLY && (
                    <div className="grid grid-cols-[auto_1fr] items-start">
                      <span className="font-bold whitespace-nowrap mr-1">每周</span>
                      <div className="text-xs text-gray-500">
                        {daily.active_pattern && daily.active_pattern.value
                          ? (Array.isArray(daily.active_pattern.value) 
                              ? [...daily.active_pattern.value]
                                  .sort((a, b) => a - b)
                                  .map(day => {
                                    const option = weekDayOptions.find(opt => opt.id === day);
                                    return option ? option.name : day;
                                  })
                                  .join(', ')
                              : daily.active_pattern.value)
                          : ''}
                      </div>
                    </div>
                  )}
                  
                  {daily.repeat_period === DailyRepeatPeriod.MONTHLY && (
                    <div className="grid grid-cols-[auto_1fr] items-start">
                      <span className="font-bold whitespace-nowrap mr-1">每月</span>
                      <div className="text-xs text-gray-500">
                        {daily.active_pattern && daily.active_pattern.value
                          ? (Array.isArray(daily.active_pattern.value)
                              ? [...daily.active_pattern.value]
                                  .sort((a, b) => a - b)
                                  .map(day => `${day}日`)
                                  .join(', ')
                              : daily.active_pattern.value)
                          : ''}
                      </div>
                    </div>
                  )}
                  
                  {daily.repeat_period === DailyRepeatPeriod.YEARLY && (
                    <div className="grid grid-cols-[auto_1fr] items-start">
                      <span className="font-bold whitespace-nowrap mr-1">每年</span>
                      <div className="text-xs text-gray-500">
                        {daily.active_pattern && daily.active_pattern.value
                          ? (Array.isArray(daily.active_pattern.value)
                              ? [...daily.active_pattern.value]
                                  .sort((a, b) => a - b)
                                  .map(month => `${month}月`)
                                  .join(', ')
                              : daily.active_pattern.value)
                          : ''}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* 计数与标签图标 */}
            <div className="flex items-center">
              {/* 使用与习惯条目相同的计数样式 */}
              <div className="flex items-center">
                <ForwardIcon className="h-3.5 w-3.5 text-gray-500" />
                <div className="text-xs text-gray-500 mx-1.5 flex items-center space-x-1">
                  <span>{daily.streak_count || 0}</span>
                </div>
              </div>
              
              {/* 标签图标仅在有标签时显示，点击时在上方显示标签 */}
              {daily.tags && daily.tags.length > 0 && (
                <div className="relative group ml-2">
                  <button 
                    className="flex items-center text-gray-500 hover:text-indigo-600 p-0.5 rounded-full hover:bg-gray-100"
                    onClick={() => onTagClick(daily.id)}
                  >
                    <TagIcon className="h-3.5 w-3.5" />
                  </button>
                  <div 
                    className={`absolute bottom-6 right-0 mt-1 w-auto min-w-max max-w-xs bg-indigo-600 shadow-lg rounded-full p-1.5 
                      hidden group-hover:flex flex-wrap gap-1 z-50`}
                  >
                    {daily.tags.map((tag, idx) => (
                      <span key={idx} className="inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium text-white">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export interface DailyListRef {
  loadDailies: () => Promise<void>;
  updateDailyItem: (daily: Daily) => void;
  addDailyItem: (daily: Daily) => void;
}

const DailyList = forwardRef<DailyListRef, DailyListProps>(({ onAddClick, filter = 'all' }, ref) => {
  const [dailies, setDailies] = useState<Daily[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedDailies, setExpandedDailies] = useState<{[key: string]: boolean}>({});
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingDaily, setEditingDaily] = useState<Daily | null>(null);
  const [visibleTagId, setVisibleTagId] = useState<string | null>(null);
  const isMobile = useIsMobile();
  
  // 拖拽相关传感器设置
  const sensors = useSensors(
    useSensor(PointerSensor, { 
      activationConstraint: { 
        delay: 250, // 延迟触发时间
        tolerance: 8, // 容差值，在此范围内的移动不会触发滚动
        distance: 8, // 需要移动8px才触发拖拽
      } 
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const loadDailies = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDailies();
      setDailies(data);
    } catch (err) {
      console.error('加载日常任务失败:', err);
      setError('加载日常任务失败，请刷新页面重试');
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    loadDailies,
    updateDailyItem: (daily: Daily) => {
      setDailies(prev => {
        // 检查条目是否已经存在
        const exists = prev.some(item => item.id === daily.id);
        if (exists) {
          // 更新现有条目
          return prev.map(item => item.id === daily.id ? daily : item);
        } else {
          // 如果不存在，则添加到列表
          return [...prev, daily];
        }
      });
    },
    addDailyItem: (daily: Daily) => {
      setDailies(prev => [...prev, daily]);
    }
  }));

  useEffect(() => {
    loadDailies();
  }, []);

  useEffect(() => {
    // 默认展开所有子任务
    const initialExpandState: {[key: string]: boolean} = {};
    dailies.forEach(daily => {
      if (daily.checklist && daily.checklist.length > 0) {
        initialExpandState[daily.id] = true;
      }
    });
    setExpandedDailies(initialExpandState);
  }, [dailies]);

  const handleEdit = (daily: Daily) => {
    console.log("编辑日常任务:", daily);
    setEditingDaily(daily);
    setIsEditDialogOpen(true);
  };

  const handleEditComplete = async (dailyData: CreateDailyRequest | Partial<Daily>) => {
    if (!editingDaily) return;
    
    try {
      setLoading(true);
      const updateData: UpdateDailyRequest = {
        ...dailyData,
        id: editingDaily.id
      };
      const updatedDaily = await updateDaily(editingDaily.id, updateData);
      setIsEditDialogOpen(false);
      
      // 直接更新单个条目
      setDailies(prev => prev.map(item => item.id === updatedDaily.id ? updatedDaily : item));
    } catch (error) {
      console.error('更新日常任务失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这个日常任务吗？')) {
      try {
        await deleteDaily(id);
        // 直接从状态中移除该项
        setDailies(prev => prev.filter(item => item.id !== id));
      } catch (error) {
        console.error('删除日常任务失败:', error);
      }
    }
  };

  const handleIncrementStreak = async (id: string) => {
    try {
      const updatedDaily = await updateDailyStreak(id, true);
      // 直接更新单个条目
      setDailies(prev => prev.map(item => item.id === updatedDaily.id ? updatedDaily : item));
    } catch (error) {
      console.error('更新连击次数失败:', error);
    }
  };

  const handleResetStreak = async (id: string) => {
    try {
      const updatedDaily = await updateDailyStreak(id, false);
      // 直接更新单个条目
      setDailies(prev => prev.map(item => item.id === updatedDaily.id ? updatedDaily : item));
    } catch (error) {
      console.error('重置连击次数失败:', error);
    }
  };

  const handleToggleComplete = async (daily: Daily) => {
    try {
      // 如果该任务有子任务，则切换所有子任务的完成状态
      if (daily.checklist && daily.checklist.length > 0) {
        // 检查是否所有子任务都已完成
        const allCompleted = daily.checklist.every(task => task.completed);
        
        // 根据当前状态反转所有子任务的完成状态
        const updatedChecklist = daily.checklist.map(task => ({
          ...task,
          completed: !allCompleted
        }));
        
        // 更新子任务完成状态
        const updatedDaily = await updateDaily(daily.id, { 
          id: daily.id,
          checklist: updatedChecklist
        });
        
        // 如果所有子任务完成状态由未完成变为完成，则增加连击次数
        if (!allCompleted) {
          const updatedDailyWithStreak = await updateDailyStreak(daily.id, true);
          // 直接更新单个条目
          setDailies(prev => prev.map(item => item.id === updatedDailyWithStreak.id ? updatedDailyWithStreak : item));
        } else {
          // 直接更新单个条目
          setDailies(prev => prev.map(item => item.id === updatedDaily.id ? updatedDaily : item));
        }
      } else {
        // 没有子任务时，每次勾选都增加连击次数
        const updatedDaily = await updateDailyStreak(daily.id, true);
        // 直接更新单个条目
        setDailies(prev => prev.map(item => item.id === updatedDaily.id ? updatedDaily : item));
      }
    } catch (error) {
      console.error('更新任务状态失败:', error);
    }
  };

  const handleToggleSubtaskComplete = async (dailyId: string, taskId: string, completed: boolean) => {
    try {
      const daily = dailies.find(d => d.id === dailyId);
      if (!daily || !daily.checklist) return;
      
      const updatedChecklist = daily.checklist.map(task => 
        task.id === taskId ? { ...task, completed: !completed } : task
      );
      
      const updatedDaily = await updateDaily(dailyId, { 
        id: dailyId,
        checklist: updatedChecklist
      });
      
      // 直接更新单个条目
      setDailies(prev => prev.map(item => item.id === updatedDaily.id ? updatedDaily : item));
    } catch (error) {
      console.error('更新子任务状态失败:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  };

  const renderDifficultyStars = (difficulty: DailyDifficulty) => {
    let starCount = 0;
    
    switch (difficulty) {
      case DailyDifficulty.VERY_EASY:
        starCount = 1;
        break;
      case DailyDifficulty.EASY:
        starCount = 2;
        break;
      case DailyDifficulty.MEDIUM:
        starCount = 3;
        break;
      case DailyDifficulty.HARD:
        starCount = 4;
        break;
      default:
        starCount = 0;
    }
    
    return (
      <div className="flex">
        {Array.from({ length: starCount }).map((_, i) => (
          <StarIcon key={i} className="h-3.5 w-3.5 text-yellow-400" />
        ))}
      </div>
    );
  };

  const toggleExpand = (dailyId: string) => {
    setExpandedDailies(prev => ({
      ...prev,
      [dailyId]: !prev[dailyId]
    }));
  };

  const getCompletedTasksCount = (checklist: DailyTask[] | undefined) => {
    if (!checklist || checklist.length === 0) return { completed: 0, total: 0 };
    const completed = checklist.filter(task => task.completed).length;
    return { completed, total: checklist.length };
  };

  // 处理拖拽结束事件
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setDailies((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        console.log(`拖拽排序: 日常任务 "${items[oldIndex].title}" 从位置 ${oldIndex} 移动到 ${newIndex}`);
        
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // 更新服务器上的顺序
        const newOrder = newItems.map(item => item.id);
        console.log('新排序顺序 IDs:', newOrder);
        
        updateDailiesOrder(newOrder)
          .then(() => console.log('日常任务排序更新成功保存到服务器'))
          .catch(error => {
            console.error('更新日常任务顺序失败:', error);
          });
        
        return newItems;
      });
    }
  };

  // 检查日常任务是否在当前日期活跃
  const isDailyActive = (daily: Daily): boolean => {
    // 获取今天的日期
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1; // 月份从0开始，需要+1
    const date = today.getDate();
    const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay(); // 转换为1-7表示周一到周日
    
    // 检查日常任务是否已完成
    const isCompleted = daily.checklist && daily.checklist.length > 0 
      ? daily.checklist.every(task => task.completed)
      : false; // Daily类型没有completed属性，默认为false
    
    // 如果已完成，则不活跃
    if (isCompleted) return false;
    
    // 根据重复周期判断
    if (!daily.active_pattern || !daily.repeat_period) return true;
    
    switch (daily.repeat_period) {
      case DailyRepeatPeriod.DAILY:
        // 每日任务总是活跃
        return true;
        
      case DailyRepeatPeriod.WEEKLY:
        // 每周任务在指定的星期几活跃
        const weeklyActivePattern = daily.active_pattern.value as number[];
        return Array.isArray(weeklyActivePattern) && weeklyActivePattern.includes(dayOfWeek);
        
      case DailyRepeatPeriod.MONTHLY:
        // 每月任务在指定日期活跃
        const monthlyActivePattern = daily.active_pattern.value as number[];
        return Array.isArray(monthlyActivePattern) && monthlyActivePattern.includes(date);
        
      case DailyRepeatPeriod.YEARLY:
        // 每年任务在指定月份活跃
        const yearlyActivePattern = daily.active_pattern.value as number[];
        return Array.isArray(yearlyActivePattern) && yearlyActivePattern.includes(month);
        
      default:
        return true;
    }
  };
  
  // 根据filter筛选日常任务
  const filteredDailies = dailies.filter(daily => {
    if (filter === 'all') return true;
    const isActive = isDailyActive(daily);
    if (filter === 'active') return isActive;
    if (filter === 'inactive') return !isActive;
    return true;
  });

  // 处理上移按钮点击
  const handleMoveUp = (dailyId: string) => {
    setDailies((items) => {
      const index = items.findIndex((item) => item.id === dailyId);
      if (index <= 0) return items;
      
      const newItems = [...items];
      [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
      
      // 更新后端顺序
      updateDailiesOrder(newItems.map(item => item.id));
      
      return newItems;
    });
  };

  // 处理下移按钮点击
  const handleMoveDown = (dailyId: string) => {
    setDailies((items) => {
      const index = items.findIndex((item) => item.id === dailyId);
      if (index >= items.length - 1) return items;
      
      const newItems = [...items];
      [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
      
      // 更新后端顺序
      updateDailiesOrder(newItems.map(item => item.id));
      
      return newItems;
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-4">{error}</div>
    );
  }

  if (dailies.length === 0) {
    return (
      <div className="py-4 text-center text-gray-500">
        <p className="mb-3">暂无日常任务</p>
        {onAddClick && (
          <button 
            onClick={onAddClick}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="h-4 w-4 mr-1" /> 添加日常任务
          </button>
        )}
      </div>
    );
  }

  if (filteredDailies.length === 0) {
    return (
      <div className="py-4 text-center text-gray-500">
        {filter === 'active' ? '当前没有活跃的日常任务' : 
         filter === 'inactive' ? '当前没有休眠的日常任务' : 
         '暂无日常任务'}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filteredDailies.map(daily => daily.id)}
            strategy={verticalListSortingStrategy}
          >
            {filteredDailies.map((daily, index) => (
              <SortableDailyItem
                key={daily.id}
                daily={daily}
                onDelete={handleDelete}
                onEdit={handleEdit}
                onToggleComplete={handleToggleComplete}
                onToggleSubtaskComplete={handleToggleSubtaskComplete}
                onIncrementStreak={handleIncrementStreak}
                onResetStreak={handleResetStreak}
                onTagClick={(id) => {}}
                visibleTagId={null}
                expandedDailies={expandedDailies}
                toggleExpand={toggleExpand}
                getCompletedTasksCount={getCompletedTasksCount}
                renderDifficultyStars={renderDifficultyStars}
                formatDate={formatDate}
                onMoveUp={() => handleMoveUp(daily.id)}
                onMoveDown={() => handleMoveDown(daily.id)}
                isFirst={index === 0}
                isLast={index === filteredDailies.length - 1}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      {isEditDialogOpen && editingDaily && (
        <DailyEditDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          onSave={handleEditComplete}
          initialData={editingDaily}
        />
      )}
    </div>
  );
});

DailyList.displayName = 'DailyList';

export default DailyList; 