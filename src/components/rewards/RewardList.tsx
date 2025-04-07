'use client';

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Reward } from '@/types/reward';
import { getRewards, deleteReward, updateRewardsOrder } from '@/services/rewards';
import RewardIcon from '@/components/icons/RewardIcon';
import CashflowIcon from '../../assets/icons/coins/cashflow.svg';
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

export interface RewardListRef {
  loadRewards: () => Promise<void>;
  updateRewardItem: (reward: Reward) => void;
  addRewardItem: (reward: Reward) => void;
}

interface RewardListProps {
  onAddClick?: () => void;
  onEditClick?: (reward: Reward) => void;
}

// 可排序的奖励项组件
interface SortableRewardItemProps {
  reward: Reward;
  onEditClick?: (reward: Reward) => void;
  onDelete: (id: string) => void;
}

const SortableRewardItem = ({ reward, onEditClick, onDelete }: SortableRewardItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: reward.id });

  const style = {
    transform: transform ? CSS.Transform.toString({
      ...transform,
      scaleX: 1,
      scaleY: 1
    }) : undefined,
    transition,
    zIndex: isDragging ? 1000 : 1,
    opacity: isDragging ? 0.7 : 1,
    position: 'relative' as const
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-3 relative cursor-grab active:cursor-grabbing"
    >
      {/* 编辑和删除按钮移至右上角 */}
      <div className="absolute top-2 right-2 flex space-x-1">
        {onEditClick && (
          <button
            type="button"
            onClick={() => onEditClick(reward)}
            className="p-1 rounded-full text-gray-400 hover:text-indigo-600 focus:outline-none focus:text-indigo-600"
          >
            <PencilSquareIcon className="h-4 w-4" />
          </button>
        )}
        <button
          type="button"
          onClick={() => onDelete(reward.id)}
          className="p-1 rounded-full text-gray-400 hover:text-red-600 focus:outline-none focus:text-red-600"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="flex" {...listeners}>
        {/* 图标容器 - 使用自身的flex布局保持垂直居中 */}
        <div className="flex items-center self-center mr-3">
          <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
            <RewardIcon name={reward.icon} className="h-6 w-6" />
          </div>
        </div>
        
        {/* 内容区域 */}
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900 pr-12">{reward.title}</h3>
          <div className="flex justify-between items-end mt-1">
            {reward.description ? (
              <p className="text-xs text-gray-500 pr-3 flex-1">{reward.description}</p>
            ) : (
              <div className="flex-1"></div>
            )}
            <div className="flex-shrink-0 flex items-center text-sm font-medium bg-indigo-50 px-2 py-0.5 rounded-full">
              <CashflowIcon className="h-4 w-4 mr-1.5" />
              <span className="text-indigo-600">{reward.price}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const RewardList = forwardRef<RewardListRef, RewardListProps>((props, ref) => {
  const { onAddClick, onEditClick } = props;
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 配置拖拽传感器
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // 暴露刷新方法给父组件
  useImperativeHandle(ref, () => ({
    loadRewards,
    updateRewardItem: (reward: Reward) => {
      setRewards(prev => {
        // 检查奖励是否已经存在
        const exists = prev.some(item => item.id === reward.id);
        if (exists) {
          // 更新现有奖励
          return prev.map(item => item.id === reward.id ? reward : item);
        } else {
          // 如果不存在，则添加到列表
          return [...prev, reward];
        }
      });
    },
    addRewardItem: (reward: Reward) => {
      setRewards(prev => [...prev, reward]);
    }
  }));

  // 首次加载数据
  useEffect(() => {
    loadRewards();
  }, []);

  // 加载奖励列表
  const loadRewards = async () => {
    setLoading(true);
    setError(null);
    try {
      const rewardsData = await getRewards();
      setRewards(rewardsData);
    } catch (err: any) {
      console.error('加载奖励失败:', err);
      const errorMsg = err?.message || '未知错误';
      setError(`加载奖励失败: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  // 处理删除奖励
  const handleDelete = async (id: string) => {
    if (window.confirm('确定要删除这个奖励吗？')) {
      try {
        await deleteReward(id);
        // 成功删除后刷新列表
        loadRewards();
      } catch (err) {
        console.error('删除奖励失败:', err);
        alert('删除奖励失败，请重试');
      }
    }
  };

  // 处理拖拽结束
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setRewards((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        console.log(`拖拽排序: 奖励 "${items[oldIndex].title}" 从位置 ${oldIndex} 移动到 ${newIndex}`);
        
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // 更新服务器上的顺序
        const newOrder = newItems.map(item => item.id);
        console.log('新奖励排序顺序 IDs:', newOrder);
        
        updateRewardsOrder(newOrder)
          .then(() => console.log('奖励排序更新成功保存到服务器'))
          .catch(error => {
            console.error('更新奖励顺序失败:', error);
          });
        
        return newItems;
      });
    }
  };

  // 加载中显示
  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // 错误显示
  if (error) {
    return (
      <div className="text-red-500 p-4">{error}</div>
    );
  }

  // 空列表显示
  if (rewards.length === 0) {
    return (
      <div className="text-center text-gray-500 py-10">
        <p className="mb-3">暂无奖励</p>
        {onAddClick && (
          <button 
            onClick={onAddClick}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            添加奖励
          </button>
        )}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={rewards.map(reward => reward.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {rewards.map((reward) => (
            <SortableRewardItem
              key={reward.id}
              reward={reward}
              onEditClick={onEditClick}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
});

RewardList.displayName = 'RewardList';

export default RewardList; 