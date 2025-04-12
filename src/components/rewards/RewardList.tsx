'use client';

import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Reward, RewardStatus } from '@/types/reward';
import { getRewards, deleteReward, updateRewardsOrder, redeemReward } from '@/services/rewards';
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
import useIsMobile from '@/hooks/useIsMobile';
import MobileOrderButtons from '@/components/common/MobileOrderButtons';

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
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRedeem: (reward: Reward) => void;
  isFirst: boolean;
  isLast: boolean;
}

const SortableRewardItem = ({ 
  reward, 
  onEditClick, 
  onDelete, 
  onMoveUp, 
  onMoveDown,
  onRedeem,
  isFirst,
  isLast
}: SortableRewardItemProps) => {
  const [showMobileButtons, setShowMobileButtons] = useState(false);
  const isMobile = useIsMobile();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: reward.id });
  
  // 只在非移动设备上启用拖拽监听器
  const desktopListeners = isMobile ? {} : listeners;
  
  // 长按处理 - 用于移动设备
  const longPressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const startLongPress = () => {
    longPressTimeoutRef.current = setTimeout(() => {
      setShowMobileButtons(prev => !prev);
    }, 600); // 600ms 长按时间
  };
  
  const cancelLongPress = () => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
  };
  
  useEffect(() => {
    return () => {
      cancelLongPress();
    };
  }, []);
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 30 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  // 处理兑换按钮点击
  const handleRedeemClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRedeem(reward);
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-3 relative cursor-grab active:cursor-grabbing"
    >
      {/* 编辑和删除按钮移至右上角 */}
      <div className="absolute top-2 right-2 flex space-x-1 z-10">
        {onEditClick && !reward.redeemed && (
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
    
      <div 
        className={`flex ${isMobile ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}`} 
        {...desktopListeners}
        onTouchStart={isMobile ? startLongPress : undefined}
        onTouchEnd={isMobile ? cancelLongPress : undefined}
        onTouchMove={isMobile ? cancelLongPress : undefined}
        onTouchCancel={isMobile ? cancelLongPress : undefined}
      >
        {/* 图标容器 - 使用自身的flex布局保持垂直居中 */}
        <div className="flex items-center self-center mr-3">
          <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
            <RewardIcon name={reward.icon} className="h-6 w-6" />
          </div>
        </div>
        
        {/* 内容区域 */}
        <div className="flex-1">
          <h3 className={`text-sm font-medium text-gray-900 pr-12 ${reward.redeemed ? 'line-through text-gray-500' : ''}`}>
            {reward.title}
          </h3>
          <div className="flex justify-between items-end mt-1">
            {reward.description ? (
              <p className={`text-xs text-gray-500 pr-3 flex-1 ${reward.redeemed ? 'line-through' : ''}`}>
                {reward.description}
              </p>
            ) : (
              <div className="flex-1"></div>
            )}
            {reward.redeemed ? (
              <div className="flex-shrink-0 text-xs text-gray-400 italic">
                已兑换 {new Date(reward.redeemed_at || '').toLocaleDateString()}
              </div>
            ) : (
              <button
                onClick={handleRedeemClick}
                className="flex-shrink-0 flex items-center text-sm font-medium bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 px-3 py-1 rounded-full transition-colors"
              >
                <CashflowIcon className="h-4 w-4 mr-1.5" />
                <span className="text-indigo-600">兑换 {reward.price}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// 过滤器组件
const RewardFilter = ({ 
  currentStatus, 
  onStatusChange 
}: { 
  currentStatus: RewardStatus; 
  onStatusChange: (status: RewardStatus) => void 
}) => {
  return (
    <div className="flex space-x-2 mb-4">
      <button
        onClick={() => onStatusChange(RewardStatus.PENDING)}
        className={`px-3 py-1 rounded-full text-sm ${
          currentStatus === RewardStatus.PENDING
            ? 'bg-indigo-100 text-indigo-700 font-medium'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        待兑换
      </button>
      <button
        onClick={() => onStatusChange(RewardStatus.REDEEMED)}
        className={`px-3 py-1 rounded-full text-sm ${
          currentStatus === RewardStatus.REDEEMED
            ? 'bg-indigo-100 text-indigo-700 font-medium'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        已兑换
      </button>
      <button
        onClick={() => onStatusChange(RewardStatus.ALL)}
        className={`px-3 py-1 rounded-full text-sm ${
          currentStatus === RewardStatus.ALL
            ? 'bg-indigo-100 text-indigo-700 font-medium'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        全部
      </button>
    </div>
  );
};

const RewardList = forwardRef<RewardListRef, RewardListProps>((props, ref) => {
  const { onAddClick, onEditClick } = props;
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<RewardStatus>(RewardStatus.PENDING);
  const [redeeming, setRedeeming] = useState(false);
  const isMobile = useIsMobile();

  // 配置拖拽传感器
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
  }, [status]); // 当状态过滤器变化时重新加载

  // 加载奖励列表
  const loadRewards = async () => {
    setLoading(true);
    setError(null);
    try {
      const rewardsData = await getRewards(status);
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
        // 直接从状态中移除该奖励
        setRewards(prev => prev.filter(item => item.id !== id));
      } catch (err) {
        console.error('删除奖励失败:', err);
        alert('删除奖励失败，请重试');
      }
    }
  };

  // 处理兑换奖励
  const handleRedeem = async (reward: Reward) => {
    if (redeeming) return; // 防止重复点击
    
    try {
      setRedeeming(true);
      const updatedReward = await redeemReward({ id: reward.id });
      
      // 更新本地状态
      setRewards(prev => 
        prev.map(item => 
          item.id === updatedReward.id ? updatedReward : item
        )
      );
      
      alert(`恭喜！成功兑换了 "${reward.title}"，花费 ${reward.price} 金币`);
    } catch (err: any) {
      console.error('兑换奖励失败:', err);
      alert(err?.message || '兑换奖励失败，请重试');
    } finally {
      setRedeeming(false);
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

  // 处理上移按钮点击
  const handleMoveUp = (rewardId: string) => {
    setRewards((items) => {
      const index = items.findIndex((item) => item.id === rewardId);
      if (index <= 0) return items;
      
      const newItems = [...items];
      [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
      
      // 更新后端顺序
      updateRewardsOrder(newItems.map(item => item.id));
      
      return newItems;
    });
  };

  // 处理下移按钮点击
  const handleMoveDown = (rewardId: string) => {
    setRewards((items) => {
      const index = items.findIndex((item) => item.id === rewardId);
      if (index >= items.length - 1) return items;
      
      const newItems = [...items];
      [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
      
      // 更新后端顺序
      updateRewardsOrder(newItems.map(item => item.id));
      
      return newItems;
    });
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

  return (
    <div>
      {/* 过滤器 */}
      <div className="flex justify-between items-center mb-4">
        <RewardFilter currentStatus={status} onStatusChange={setStatus} />
        
        {/* 添加奖励按钮 */}
        {onAddClick && status !== RewardStatus.REDEEMED && (
          <button 
            onClick={onAddClick}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            添加奖励
          </button>
        )}
      </div>
      
      {/* 奖励列表 */}
      {rewards.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          <p className="mb-3">
            {status === RewardStatus.PENDING && '暂无待兑换奖励'}
            {status === RewardStatus.REDEEMED && '暂无已兑换奖励'}
            {status === RewardStatus.ALL && '暂无奖励'}
          </p>
          {onAddClick && status !== RewardStatus.REDEEMED && (
            <button 
              onClick={onAddClick}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              添加奖励
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={rewards.map(reward => reward.id)}
              strategy={verticalListSortingStrategy}
            >
              {rewards.map((reward, index) => (
                <SortableRewardItem
                  key={reward.id}
                  reward={reward}
                  onEditClick={onEditClick}
                  onDelete={handleDelete}
                  onRedeem={handleRedeem}
                  onMoveUp={() => handleMoveUp(reward.id)}
                  onMoveDown={() => handleMoveDown(reward.id)}
                  isFirst={index === 0}
                  isLast={index === rewards.length - 1}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  );
});

RewardList.displayName = 'RewardList';

export default RewardList; 