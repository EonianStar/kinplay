'use client';

import { useEffect, useState, forwardRef, useImperativeHandle, useRef } from 'react';
import { Habit, HabitNature, CreateHabitRequest, HabitDifficulty, HabitResetPeriod } from '@/types/habit';
import { getHabits, deleteHabit, incrementGoodCount, incrementBadCount, createHabit, updateHabit } from '@/services/habits';
import HabitQuickAdd from './HabitQuickAdd';
import HabitEditDialog from './HabitEditDialog';
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

export interface HabitListRef {
  loadHabits: () => Promise<void>;
}

interface HabitListProps {}

// 添加难度星级映射
const difficultyStars: Record<HabitDifficulty, number> = {
  [HabitDifficulty.VERY_EASY]: 1,
  [HabitDifficulty.EASY]: 2,
  [HabitDifficulty.MEDIUM]: 3,
  [HabitDifficulty.HARD]: 4,
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

const HabitList = forwardRef<HabitListRef, HabitListProps>(function HabitList(props, ref) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [showTags, setShowTags] = useState<number | null>(null);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const tagTimerRef = useRef<NodeJS.Timeout>();

  const loadHabits = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getHabits();
      setHabits(data);
    } catch (err) {
      setError('加载习惯列表失败');
      console.error('加载习惯列表失败:', err);
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    loadHabits
  }));

  useEffect(() => {
    loadHabits();
  }, []);

  const handleQuickAdd = async (title: string) => {
    try {
      const habitData: CreateHabitRequest = {
        title,
        description: '',
        nature: [HabitNature.GOOD, HabitNature.BAD],
        difficulty: HabitDifficulty.EASY,
        reset_period: HabitResetPeriod.DAILY,
        good_count: 0,
        bad_count: 0,
        tags: []
      };
      await createHabit(habitData);
      await loadHabits();
    } catch (error) {
      console.error('创建习惯失败:', error);
    }
  };

  const handleEdit = (habit: Habit) => {
    setEditingHabit(habit);
  };

  const handleEditComplete = async (habitData: CreateHabitRequest) => {
    if (!editingHabit) return;

    try {
      const updateData = {
        ...habitData,
        updated_at: new Date().toISOString(),
      };

      await updateHabit(editingHabit.id.toString(), updateData);
      setEditingHabit(null);
      // 刷新习惯列表
      await loadHabits();
    } catch (error) {
      console.error('更新习惯失败:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteHabit(id);
      await loadHabits(); // 重新加载列表
    } catch (err) {
      console.error('删除习惯失败:', err);
    }
  };

  const handleGoodCountIncrement = async (habitId: number) => {
    try {
      await incrementGoodCount(habitId);
      // 刷新习惯列表
      await loadHabits();
    } catch (error) {
      console.error('增加计数失败:', error);
    }
  };

  const handleBadCountIncrement = async (habitId: number) => {
    try {
      await incrementBadCount(habitId);
      // 刷新习惯列表
      await loadHabits();
    } catch (error) {
      console.error('增加计数失败:', error);
    }
  };

  // 处理标签显示
  const handleTagsClick = (habitId: number) => {
    // 清除之前的定时器
    if (tagTimerRef.current) {
      clearTimeout(tagTimerRef.current);
    }

    // 如果点击的是当前显示的标签，则隐藏
    if (showTags === habitId) {
      setShowTags(null);
      return;
    }

    // 显示新的标签
    setShowTags(habitId);

    // 设置1.5秒后自动隐藏
    tagTimerRef.current = setTimeout(() => {
      setShowTags(null);
    }, 1500);
  };

  // 组件卸载时清除定时器
  useEffect(() => {
    return () => {
      if (tagTimerRef.current) {
        clearTimeout(tagTimerRef.current);
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <HabitQuickAdd onAdd={handleQuickAdd} />
        <div className="text-center py-4">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <HabitQuickAdd onAdd={handleQuickAdd} />
        <div className="text-center text-red-500 py-4">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <HabitQuickAdd onAdd={handleQuickAdd} />
      {habits.map((habit) => (
        <div
          key={habit.id}
          className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-2.5 relative"
        >
          {/* Left side actions */}
          <div className="absolute left-0 top-0 bottom-0 flex items-center">
            <button
              onClick={() => handleGoodCountIncrement(habit.id)}
              disabled={!habit.nature.includes(HabitNature.GOOD)}
              className={`h-full px-1.5 rounded-l ${
                habit.nature.includes(HabitNature.GOOD)
                  ? 'bg-[#FDD835] hover:bg-[#FDD835]/90 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-300 cursor-not-allowed'
              }`}
            >
              <PlusIcon className="h-5 w-5 stroke-2" />
            </button>
          </div>

          {/* Right side actions */}
          <div className="absolute right-0 top-0 bottom-0 flex items-center">
            <button
              onClick={() => handleBadCountIncrement(habit.id)}
              disabled={!habit.nature.includes(HabitNature.BAD)}
              className={`h-full px-1.5 rounded-r ${
                habit.nature.includes(HabitNature.BAD)
                  ? 'bg-[#FDD835] hover:bg-[#FDD835]/90 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-300 cursor-not-allowed'
              }`}
            >
              <MinusIcon className="h-5 w-5 stroke-2" />
            </button>
          </div>

          {/* Difficulty stars - 右侧中间位置 */}
          <div className="absolute right-10 top-1/2 -translate-y-1/2">
            <DifficultyStars difficulty={habit.difficulty} />
          </div>

          {/* Menu button */}
          <div className="absolute right-10 top-1.5">
            <Menu as="div" className="relative inline-block text-left">
              <Menu.Button className="p-0.5 rounded-full hover:bg-gray-100">
                <EllipsisVerticalIcon className="h-4 w-4 text-gray-500" />
              </Menu.Button>
              <Menu.Items className="absolute right-0 mt-1 w-48 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } group flex w-full items-center px-4 py-2 text-sm text-gray-700`}
                      onClick={() => handleEdit(habit)}
                    >
                      <PencilSquareIcon className="mr-3 h-4 w-4 text-gray-400" />
                      编辑
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } group flex w-full items-center px-4 py-2 text-sm text-red-600`}
                      onClick={() => setShowDeleteConfirm(habit.id)}
                    >
                      <TrashIcon className="mr-3 h-4 w-4 text-red-400" />
                      删除
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Menu>
          </div>

          {/* Main content */}
          <div className="ml-8 mr-24 pt-0.5 pb-3 min-h-[3.5rem]">
            <h3 className="text-base font-medium text-gray-900 break-words leading-5">{habit.title}</h3>
            <div className="mt-0.5 mb-1 h-4">
              {habit.description && (
                <p className="text-xs text-gray-500 break-words leading-4">{habit.description}</p>
              )}
            </div>
          </div>

          {/* Bottom actions */}
          <div className="absolute right-10 bottom-1.5 flex items-center space-x-1.5">
            <button className="p-0.5 rounded-full hover:bg-gray-100">
              <ForwardIcon className="h-3.5 w-3.5 text-gray-500" />
            </button>
            <div className="text-xs text-gray-500 mx-1.5 flex items-center space-x-1">
              <span>{habit.nature.includes(HabitNature.GOOD) && habit.good_count}</span>
              {habit.nature.includes(HabitNature.GOOD) && habit.nature.includes(HabitNature.BAD) && <span>|</span>}
              <span>{habit.nature.includes(HabitNature.BAD) && habit.bad_count}</span>
            </div>
            {habit.tags && habit.tags.length > 0 && (
              <button 
                className="p-0.5 rounded-full hover:bg-gray-100"
                onClick={() => handleTagsClick(habit.id)}
              >
                <TagIcon className="h-3.5 w-3.5 text-gray-500" />
              </button>
            )}
          </div>

          {/* Tags popup */}
          {showTags === habit.id && habit.tags && habit.tags.length > 0 && (
            <div className="absolute right-10 bottom-7 bg-white rounded-lg shadow-lg p-1.5 z-10">
              <div className="flex flex-wrap gap-1">
                {habit.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Delete confirmation */}
          {showDeleteConfirm === habit.id && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">确认删除</h3>
                <p className="text-sm text-gray-500 mb-6">确定要删除这个习惯吗？此操作无法撤销。</p>
                <div className="flex justify-end space-x-4">
                  <button
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                    onClick={() => setShowDeleteConfirm(null)}
                  >
                    取消
                  </button>
                  <button
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
                    onClick={() => {
                      handleDelete(habit.id);
                      setShowDeleteConfirm(null);
                    }}
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* 编辑弹窗 - 移到列表外部 */}
      {editingHabit && (
        <HabitEditDialog
          isOpen={true}
          habit={editingHabit}
          onClose={() => setEditingHabit(null)}
          onSave={handleEditComplete}
        />
      )}
    </div>
  );
});

HabitList.displayName = 'HabitList';

export default HabitList; 