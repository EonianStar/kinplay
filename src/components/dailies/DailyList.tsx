'use client';

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Daily, DailyDifficulty } from '@/types/daily';
import { getDailies, deleteDaily, updateDailyStreak } from '@/services/dailies';
import DailyEditDialog from './DailyEditDialog';
import { Menu } from '@headlessui/react';
import { 
  PlusIcon, 
  MinusIcon, 
  TagIcon,
  EllipsisVerticalIcon,
  PencilSquareIcon,
  TrashIcon,
  StarIcon as StarIconOutline
} from '@heroicons/react/24/outline';
import { ForwardIcon, StarIcon } from '@heroicons/react/24/solid';

interface DailyListProps {
  onAddClick?: () => void;
}

const DailyList = forwardRef<{ loadDailies: () => Promise<void> }, DailyListProps>(({ onAddClick }, ref) => {
  const [dailies, setDailies] = useState<Daily[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingDaily, setEditingDaily] = useState<Daily | null>(null);

  const loadDailies = async () => {
    try {
      setLoading(true);
      const data = await getDailies();
      setDailies(data);
    } catch (error) {
      console.error('获取日常任务失败:', error);
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

  const handleEditClick = (daily: Daily) => {
    setEditingDaily(daily);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (window.confirm('确定要删除这个日常任务吗？')) {
      try {
        await deleteDaily(id);
        await loadDailies(); // 重新加载列表
      } catch (error) {
        console.error('删除日常任务失败:', error);
      }
    }
  };

  const handleStreakIncrease = async (id: string) => {
    try {
      await updateDailyStreak(id, true);
      await loadDailies(); // 重新加载列表
    } catch (error) {
      console.error('更新连击次数失败:', error);
    }
  };

  const handleStreakReset = async (id: string) => {
    try {
      await updateDailyStreak(id, false);
      await loadDailies(); // 重新加载列表
    } catch (error) {
      console.error('重置连击次数失败:', error);
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
          <StarIcon key={i} className="h-4 w-4 text-yellow-500" />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
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
          className="bg-white rounded-lg shadow-sm py-3 px-4 transition-all duration-200 hover:shadow-md"
        >
          <div className="flex justify-between items-start mb-1">
            <div className="flex flex-col grow mr-2">
              <div className="font-medium text-gray-900 mb-1 line-clamp-1">{daily.title}</div>
              {daily.description && (
                <p className="text-gray-500 text-sm line-clamp-2">{daily.description}</p>
              )}
            </div>
            <Menu as="div" className="relative inline-block text-left">
              <Menu.Button className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none">
                <EllipsisVerticalIcon className="h-5 w-5" />
              </Menu.Button>
              <Menu.Items className="absolute right-0 z-10 mt-1 w-32 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => handleEditClick(daily)}
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
                        onClick={() => handleDeleteClick(daily.id)}
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
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center text-xs text-gray-500 space-x-3">
              <div className="flex items-center">
                {renderDifficultyStars(daily.difficulty)}
              </div>
              <div>
                开始: {formatDate(daily.start_date)}
              </div>
              {daily.tags && daily.tags.length > 0 && (
                <div className="flex items-center">
                  <TagIcon className="h-3 w-3 mr-1" />
                  <span className="truncate max-w-[100px]">
                    {daily.tags.join(', ')}
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handleStreakReset(daily.id)}
                className="p-1 text-red-500 hover:text-red-700 focus:outline-none"
              >
                <MinusIcon className="h-5 w-5 font-bold" />
              </button>
              
              <div className="w-8 text-center text-xs font-medium">
                {daily.streak_count || 0}
              </div>
              
              <button
                onClick={() => handleStreakIncrease(daily.id)}
                className="p-1 text-green-500 hover:text-green-700 focus:outline-none"
              >
                <PlusIcon className="h-5 w-5 font-bold" />
              </button>
            </div>
          </div>
        </div>
      ))}

      <DailyEditDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingDaily(null);
        }}
        onSave={async (dailyData) => {
          console.log('保存日常任务:', dailyData);
          // 这里应该处理保存逻辑
          setIsEditDialogOpen(false);
          setEditingDaily(null);
          await loadDailies();
        }}
        initialData={editingDaily}
      />
    </div>
  );
});

DailyList.displayName = 'DailyList';

export default DailyList; 