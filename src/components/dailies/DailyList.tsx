'use client';

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Daily, DailyDifficulty, UpdateDailyRequest, CreateDailyRequest, DailyTask, DailyRepeatPeriod } from '@/types/daily';
import { getDailies, deleteDaily, updateDailyStreak, updateDaily } from '@/services/dailies';
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

interface DailyListProps {
  onAddClick?: () => void;
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

const DailyList = forwardRef<{ loadDailies: () => Promise<void> }, DailyListProps>(({ onAddClick }, ref) => {
  const [dailies, setDailies] = useState<Daily[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingDaily, setEditingDaily] = useState<Daily | null>(null);
  const [expandedDailies, setExpandedDailies] = useState<{[key: string]: boolean}>({});

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
    loadDailies
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
      await updateDaily(editingDaily.id, updateData);
      setIsEditDialogOpen(false);
      await loadDailies();
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
        await loadDailies();
      } catch (error) {
        console.error('删除日常任务失败:', error);
      }
    }
  };

  const handleIncrementStreak = async (id: string) => {
    try {
      await updateDailyStreak(id, true);
      await loadDailies();
    } catch (error) {
      console.error('更新连击次数失败:', error);
    }
  };

  const handleResetStreak = async (id: string) => {
    try {
      await updateDailyStreak(id, false);
      await loadDailies();
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
        
        await updateDaily(daily.id, { 
          id: daily.id,
          checklist: updatedChecklist
        });
        
        // 如果所有子任务完成状态由未完成变为完成，则增加连击次数
        if (!allCompleted) {
          await handleIncrementStreak(daily.id);
        }
      } else {
        // 没有子任务时，每次勾选都增加连击次数
        await handleIncrementStreak(daily.id);
      }
      
      // 刷新列表
      await loadDailies();
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
      
      await updateDaily(dailyId, { 
        id: dailyId,
        checklist: updatedChecklist
      });
      
      await loadDailies();
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

  return (
    <div className="space-y-3 mt-3">
      {dailies.map((daily) => (
        <div 
          key={daily.id} 
          className="bg-white rounded-lg shadow-sm transition-all duration-200 hover:shadow-md mb-3"
        >
          <div className="flex">
            {/* 左侧色块与复选框 */}
            <div className="w-10 bg-indigo-100 rounded-l-lg flex items-start justify-center pt-4">
              <input
                type="checkbox"
                className="h-5 w-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                onChange={() => handleToggleComplete(daily)}
              />
            </div>
            
            {/* 主要内容区域 */}
            <div className="flex-1 py-3 px-4">
              <div className="flex justify-between items-start">
                <div className="flex flex-col grow mr-2">
                  <div className="font-medium text-gray-900 mb-1 line-clamp-1">{daily.title}</div>
                  {daily.description && (
                    <p className="text-gray-500 text-sm line-clamp-2 mb-2">{daily.description}</p>
                  )}
                  
                  {/* 子任务清单 - 带折叠功能，使用图标代替文字 */}
                  {daily.checklist && daily.checklist.length > 0 && (
                    <div className="mt-1">
                      <button 
                        onClick={() => toggleExpand(daily.id)}
                        className="flex items-center text-sm text-gray-700 mb-1 hover:text-indigo-600"
                      >
                        {expandedDailies[daily.id] ? (
                          <ChevronDownIcon className="h-4 w-4 mr-1" />
                        ) : (
                          <ChevronRightIcon className="h-4 w-4 mr-1" />
                        )}
                        <ListBulletIcon className="h-4 w-4" />
                        <span className="ml-2 px-1.5 py-0.5 bg-gray-100 rounded-md text-xs">
                          {getCompletedTasksCount(daily.checklist).completed}/{getCompletedTasksCount(daily.checklist).total}
                        </span>
                      </button>
                      
                      {expandedDailies[daily.id] && (
                        <div className="pl-4 space-y-1 mb-1">
                          {daily.checklist.map((task) => (
                            <div key={task.id} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => handleToggleSubtaskComplete(daily.id, task.id, task.completed)}
                                className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 mr-2"
                              />
                              <span className={`text-sm ${task.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                                {task.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col items-end space-y-2">
                  <Menu as="div" className="relative inline-block text-left">
                    <Menu.Button className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none">
                      <EllipsisVerticalIcon className="h-5 w-5" />
                    </Menu.Button>
                    <Menu.Items className="absolute right-0 z-10 mt-1 w-32 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="py-1">
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => handleEdit(daily)}
                              className={`${
                                active ? 'bg-gray-100' : ''
                              } flex w-full items-center px-4 py-2 text-sm text-gray-700`}
                            >
                              <PencilSquareIcon className="h-4 w-4 mr-2" />
                              编辑
                            </button>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => handleDelete(daily.id)}
                              className={`${
                                active ? 'bg-gray-100' : ''
                              } flex w-full items-center px-4 py-2 text-sm text-red-600`}
                            >
                              <TrashIcon className="h-4 w-4 mr-2" />
                              删除
                            </button>
                          )}
                        </Menu.Item>
                      </div>
                    </Menu.Items>
                  </Menu>
                  
                  {/* 难度星星显示 */}
                  <div className="flex items-center mt-1">
                    {renderDifficultyStars(daily.difficulty)}
                  </div>
                </div>
              </div>
                
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center text-xs text-gray-500 space-x-3">
                  {/* 移除所有重复周期及频次显示 */}
                </div>
                
                {/* 计数与标签图标 */}
                <div className="flex items-center">
                  {/* 使用与习惯条目相同的计数样式 */}
                  <div className="flex items-center">
                    <ForwardIcon className="h-3.5 w-3.5 text-gray-500" />
                    <span 
                      className="ml-1 text-xs font-medium text-gray-700 cursor-pointer hover:text-indigo-600 transition-colors"
                      onClick={() => handleIncrementStreak(daily.id)}
                      title="点击增加连击次数"
                    >
                      {daily.streak_count || 0}
                    </span>
                  </div>
                  
                  {/* 标签图标仅在有标签时显示，点击时在上方显示标签 */}
                  {daily.tags && daily.tags.length > 0 && (
                    <div className="relative group ml-2">
                      <button className="flex items-center text-gray-500 hover:text-indigo-600 p-0.5 rounded-full hover:bg-gray-100">
                        <TagIcon className="h-3.5 w-3.5" />
                      </button>
                      <div className="absolute bottom-6 right-0 mt-1 w-auto min-w-max max-w-xs bg-gray-100 shadow-lg rounded-md p-2 hidden group-hover:flex flex-wrap gap-1 z-10">
                        {daily.tags.map((tag, idx) => (
                          <span key={idx} className="inline-flex items-center rounded-full bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-700">
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
      ))}

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