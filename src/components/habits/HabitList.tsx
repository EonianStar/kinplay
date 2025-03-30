'use client';

import { useEffect, useState, forwardRef, useImperativeHandle, useRef } from 'react';
import { Habit, HabitNature, CreateHabitRequest, HabitDifficulty, HabitResetPeriod } from '@/types/habit';
import { getHabits, deleteHabit, incrementGoodCount, incrementBadCount, createHabit, updateHabit, updateHabitsOrder } from '@/services/habits';
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
import { getColorByValueLevel, ValueLevel } from '@/utils/valueLevel';
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

export interface HabitListRef {
  loadHabits: () => Promise<void>;
}

interface HabitListProps {
  filter?: 'all' | 'forming' | 'formed';
}

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

interface SortableHabitItemProps {
  habit: Habit;
  onDelete: (id: number) => void;
  onEdit: (habit: Habit) => void;
  onGoodIncrement: (id: number) => Promise<void>;
  onBadIncrement: (id: number) => Promise<void>;
  onTagsClick: (id: number) => void;
  showTags: number | null;
  handleDelete: (id: number) => Promise<void>;
}

// 可拖拽的习惯项组件
const SortableHabitItem = ({
  habit,
  onDelete,
  onEdit,
  onGoodIncrement,
  onBadIncrement,
  onTagsClick,
  showTags,
  handleDelete
}: SortableHabitItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: habit.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1000 : 1,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative' as const
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-2.5 relative group mb-3"
    >
      {/* Left side actions */}
      <div className="absolute left-0 top-0 bottom-0 flex items-center">
        <button
          onClick={() => onGoodIncrement(habit.id)}
          disabled={!habit.nature.includes(HabitNature.GOOD)}
          className={`h-full px-1.5 rounded-l ${
            habit.nature.includes(HabitNature.GOOD)
              ? 'text-white shadow-sm hover:opacity-90'
              : 'bg-gray-100 text-gray-300 cursor-not-allowed'
          }`}
          style={habit.nature.includes(HabitNature.GOOD) ? {
            backgroundColor: getColorByValueLevel(habit.value_level || 0)
          } : {}}
        >
          <PlusIcon className="h-5 w-5 stroke-2" />
        </button>
      </div>

      {/* Right side actions */}
      <div className="absolute right-0 top-0 bottom-0 flex items-center">
        <button
          onClick={() => onBadIncrement(habit.id)}
          disabled={!habit.nature.includes(HabitNature.BAD)}
          className={`h-full px-1.5 rounded-r ${
            habit.nature.includes(HabitNature.BAD)
              ? 'text-white shadow-sm hover:opacity-90'
              : 'bg-gray-100 text-gray-300 cursor-not-allowed'
          }`}
          style={habit.nature.includes(HabitNature.BAD) ? {
            backgroundColor: getColorByValueLevel(habit.value_level || 0)
          } : {}}
        >
          <MinusIcon className="h-5 w-5 stroke-2" />
        </button>
      </div>

      {/* Main content */}
      <div 
        className="flex flex-col px-8 cursor-grab active:cursor-grabbing min-h-[60px] py-1"
        {...listeners}
      >
        <div className="flex justify-between items-start mb-1">
          <div className="pr-16">
            <h3 className="font-medium text-gray-900 break-all">{habit.title}</h3>
            {habit.description && (
              <p className="text-sm text-gray-500 mt-0.5 break-all">{habit.description}</p>
            )}
          </div>
        </div>
        
        {/* 右侧操作按钮 - 改为直接按钮 */}
        <div className="absolute right-10 top-1.5 flex space-x-1">
          <button
            onClick={() => onEdit(habit)}
            className="p-1 text-gray-400 hover:text-indigo-600 focus:outline-none rounded-full hover:bg-gray-100"
          >
            <PencilSquareIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(habit.id)}
            className="p-1 text-gray-400 hover:text-red-600 focus:outline-none rounded-full hover:bg-gray-100"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
            
        {/* 难度星星 - 右侧中间位置 */}
        <div className="absolute right-10 top-1/2 -translate-y-1/2">
          <DifficultyStars difficulty={habit.difficulty} />
        </div>

        <div className="absolute right-10 bottom-2.5 flex items-center space-x-1.5">
          <button className="p-0.5 rounded-full hover:bg-gray-100">
            <ForwardIcon className="h-3.5 w-3.5 text-gray-500" />
          </button>
          <div className="text-xs text-gray-500 mx-1.5 flex items-center space-x-1">
            <span>{habit.nature.includes(HabitNature.GOOD) && habit.good_count}</span>
            {habit.nature.includes(HabitNature.GOOD) && habit.nature.includes(HabitNature.BAD) && <span>|</span>}
            <span>{habit.nature.includes(HabitNature.BAD) && habit.bad_count}</span>
          </div>
          {habit.tags && habit.tags.length > 0 && (
            <div className="relative">
              <button 
                className="p-0.5 rounded-full hover:bg-gray-100 relative group"
                onClick={() => onTagsClick(habit.id)}
              >
                <TagIcon className="h-3.5 w-3.5 text-gray-500" />
                <div 
                  className="absolute bottom-6 right-0 w-auto min-w-max max-w-xs bg-indigo-600 shadow-lg rounded-full p-1.5 
                    hidden group-hover:flex flex-wrap gap-1 z-50"
                >
                  {habit.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium text-white"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const HabitList = forwardRef<HabitListRef, HabitListProps>(function HabitList(props, ref) {
  const { filter = 'all' } = props;
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [showTags, setShowTags] = useState<number | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const loadHabits = async () => {
    setLoading(true);
    setError(null);
    try {
      const habits = await getHabits();
      setHabits(habits);
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
    if (confirm('确定要删除这个习惯吗？')) {
      try {
        await deleteHabit(id);
        await loadHabits(); // 重新加载列表
      } catch (err) {
        console.error('删除习惯失败:', err);
      }
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

  // 处理拖拽结束事件
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setHabits((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        console.log(`拖拽排序: 习惯 "${items[oldIndex].title}" 从位置 ${oldIndex} 移动到 ${newIndex}`);
        
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // 更新服务器上的顺序
        const newOrder = newItems.map(item => item.id);
        console.log('新排序顺序 IDs:', newOrder);
        
        updateHabitsOrder(newOrder)
          .then(() => console.log('习惯排序更新成功保存到服务器'))
          .catch(error => {
            console.error('更新习惯顺序失败:', error);
          });
        
        return newItems;
      });
    }
  };

  // 根据filter筛选习惯
  const filteredHabits = habits.filter(habit => {
    if (filter === 'all') return true;
    if (filter === 'forming') return (habit.value_level || 0) < 3;
    if (filter === 'formed') return (habit.value_level || 0) >= 3;
    return true;
  });

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
    <div className="space-y-3">
      <HabitQuickAdd onAdd={handleQuickAdd} />
      <div className="relative">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filteredHabits.map(habit => habit.id)}
            strategy={verticalListSortingStrategy}
          >
            {filteredHabits.length > 0 ? (
              filteredHabits.map((habit) => (
                <SortableHabitItem
                  key={habit.id}
                  habit={habit}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                  onGoodIncrement={handleGoodCountIncrement}
                  onBadIncrement={handleBadCountIncrement}
                  onTagsClick={() => {}}
                  showTags={null}
                  handleDelete={handleDelete}
                />
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                {filter === 'forming' ? '没有未养成的习惯' : 
                 filter === 'formed' ? '没有已养成的习惯' : 
                 '没有习惯'}
              </div>
            )}
          </SortableContext>
        </DndContext>
      </div>

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