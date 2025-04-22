'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import HabitList from '@/components/habits/HabitList';
import HabitEditDialog from '@/components/habits/HabitEditDialog';
import DailyList from '@/components/dailies/DailyList';
import DailyEditDialog from '@/components/dailies/DailyEditDialog';
import DailyQuickAdd from '@/components/dailies/DailyQuickAdd';
import TodoList from '@/components/todos/TodoList';
import TodoQuickAdd from '@/components/todos/TodoQuickAdd';
import TodoQuickCreate from '@/components/todos/TodoQuickCreate';
import RewardList from '@/components/rewards/RewardList';
import RewardEditDialog from '@/components/rewards/RewardEditDialog';
import RewardQuickAdd from '@/components/rewards/RewardQuickAdd';
import { createHabit, updateHabit } from '@/services/habits';
import { createDaily, updateDaily } from '@/services/dailies';
import { createTodo, updateTodo } from '@/services/todos';
import { createReward, updateReward } from '@/services/rewards';
import { CreateHabitRequest, UpdateHabitRequest, Habit } from '@/types/habit';
import { CreateDailyRequest, Daily, DailyDifficulty, DailyRepeatPeriod, UpdateDailyRequest } from '@/types/daily';
import { CreateTodoRequest, TodoDifficulty, UpdateTodoRequest, Todo } from '@/types/todo';
import { CreateRewardRequest, Reward, DEFAULT_REWARD, UpdateRewardRequest, RewardStatus } from '@/types/reward';
import { toast } from 'react-hot-toast';
import { QuestionMarkCircleIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { HabitListRef } from '@/components/habits/HabitList';
import { DailyListRef } from '@/components/dailies/DailyList';
import { TodoListRef } from '@/components/todos/TodoList';
import { RewardListRef } from '@/components/rewards/RewardList';

export default function TasksPage() {
  const router = useRouter();
  const { signOut, user, loading } = useAuth();
  const [isClient, setIsClient] = useState(false);
  const [isHabitDialogOpen, setIsHabitDialogOpen] = useState(false);
  const [isDailyDialogOpen, setIsDailyDialogOpen] = useState(false);
  const [isHabitHelpOpen, setIsHabitHelpOpen] = useState(false);
  const [isDailyHelpOpen, setIsDailyHelpOpen] = useState(false);
  const [isTodoHelpOpen, setIsTodoHelpOpen] = useState(false);
  const [isRewardHelpOpen, setIsRewardHelpOpen] = useState(false);
  const [isRewardDialogOpen, setIsRewardDialogOpen] = useState(false);
  const [habitFilter, setHabitFilter] = useState<'all' | 'forming' | 'formed'>('all');
  const [dailyFilter, setDailyFilter] = useState<'active' | 'inactive' | 'all'>('active');
  const [todoFilter, setTodoFilter] = useState<'incomplete' | 'completed' | 'all'>('incomplete');
  const [rewardFilter, setRewardFilter] = useState<'pending' | 'redeemed' | 'all'>('pending');
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const habitListRef = useRef<HabitListRef | null>(null);
  const dailyListRef = useRef<DailyListRef | null>(null);
  const todoListRef = useRef<TodoListRef | null>(null);
  const rewardListRef = useRef<RewardListRef | null>(null);

  // 确保组件只在客户端渲染
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 检查认证状态
  useEffect(() => {
    if (isClient && !loading && !user) {
      router.replace('/login');
    }
  }, [isClient, loading, user, router]);

  // 包装异步操作的错误处理
  const safeAsyncOperation = async <T,>(
    operation: () => Promise<T>,
    errorMessage: string = '操作失败，请重试'
  ): Promise<T | null> => {
    try {
      return await operation();
    } catch (error: any) {
      console.error(errorMessage, error);
      toast.error(`${errorMessage}: ${error?.message || '请重试'}`);
      return null;
    }
  };

  const handleSaveHabit = async (habitData: CreateHabitRequest | UpdateHabitRequest) => {
    try {
      // 区分新建和编辑
      if ('id' in habitData) {
        // 更新现有习惯
        const updatedHabit = await safeAsyncOperation<Habit>(
          () => updateHabit(habitData.id, habitData),
          '更新习惯失败'
        );
        if (!updatedHabit) return;
        
        setIsHabitDialogOpen(false);
        
        // 只更新修改的单个习惯条目
        if (habitListRef.current) {
          habitListRef.current.updateHabitItem(updatedHabit);
        }
      } else {
        // 创建新习惯
        const newHabit = await safeAsyncOperation<Habit>(
          () => createHabit(habitData),
          '创建习惯失败'
        );
        if (!newHabit) return;
        
        setIsHabitDialogOpen(false);
        
        // 添加新习惯到列表
        if (habitListRef.current) {
          habitListRef.current.addHabitItem(newHabit);
        }
      }
    } catch (error: any) {
      console.error('处理习惯失败:', error);
      toast.error(`操作失败: ${error?.message || '请重试'}`);
    }
  };

  const handleSaveDaily = async (dailyData: CreateDailyRequest | Partial<Daily>) => {
    try {
      // 区分新建和编辑
      if ('id' in dailyData && dailyData.id) {
        // 更新现有日常任务
        const updatedDaily = await safeAsyncOperation<Daily>(
          () => updateDaily(dailyData.id as string, dailyData as UpdateDailyRequest),
          '更新日常任务失败'
        );
        if (!updatedDaily) return;
        
        setIsDailyDialogOpen(false);
        
        // 只更新修改的单个日常任务条目
        if (dailyListRef.current) {
          dailyListRef.current.updateDailyItem(updatedDaily);
        }
      } else {
        // 创建新日常任务
        const newDaily = await safeAsyncOperation<Daily>(
          () => createDaily(dailyData as CreateDailyRequest),
          '创建日常任务失败'
        );
        if (!newDaily) return;
        
        setIsDailyDialogOpen(false);
        
        // 添加新日常任务到列表
        if (dailyListRef.current) {
          dailyListRef.current.addDailyItem(newDaily);
        }
      }
    } catch (error: any) {
      console.error('处理日常任务失败:', error);
      toast.error(`操作失败: ${error?.message || '请重试'}`);
    }
  };
  
  const handleSaveTodo = async (todoData: CreateTodoRequest | Partial<Todo>) => {
    try {
      // 区分新建和编辑
      if ('id' in todoData && todoData.id) {
        // 更新现有待办事项
        const updatedTodo = await safeAsyncOperation<Todo>(
          () => updateTodo(todoData.id as string, todoData as UpdateTodoRequest),
          '更新待办事项失败'
        );
        if (!updatedTodo) return;
        
        // 只更新修改的单个待办事项条目
        if (todoListRef.current) {
          todoListRef.current.updateTodoItem(updatedTodo);
        }
      } else {
        // 创建新待办事项
        const newTodo = await safeAsyncOperation<Todo>(
          () => createTodo(todoData as CreateTodoRequest),
          '创建待办事项失败'
        );
        if (!newTodo) return;
        
        // 添加新待办事项到列表
        if (todoListRef.current) {
          todoListRef.current.addTodoItem(newTodo);
        }
      }
    } catch (error: any) {
      console.error('处理待办事项失败:', error);
      toast.error(`操作失败: ${error?.message || '请重试'}`);
    }
  };

  const handleSaveReward = async (rewardData: CreateRewardRequest) => {
    try {
      // 区分新建和编辑
      if ('id' in rewardData) {
        // 更新现有奖励
        const updatedReward = await safeAsyncOperation<Reward>(
          () => updateReward(rewardData as UpdateRewardRequest),
          '更新奖励失败'
        );
        if (!updatedReward) return;
        
        setIsRewardDialogOpen(false);
        
        // 只更新修改的单个奖励条目
        if (rewardListRef.current) {
          rewardListRef.current.updateRewardItem(updatedReward);
        }
      } else {
        // 创建新奖励
        const newReward = await safeAsyncOperation<Reward>(
          () => createReward(rewardData),
          '创建奖励失败'
        );
        if (!newReward) return;
        
        setIsRewardDialogOpen(false);
        
        // 添加新奖励到列表而不是刷新整个列表
        if (rewardListRef.current) {
          rewardListRef.current.addRewardItem(newReward);
        }
      }
    } catch (error: any) {
      console.error('处理奖励失败:', error);
      toast.error(`操作失败: ${error?.message || '请重试'}`);
    }
  };

  // 映射rewardFilter到RewardStatus枚举
  const getRewardStatus = (filter: 'pending' | 'redeemed' | 'all'): RewardStatus => {
    switch (filter) {
      case 'pending': return RewardStatus.PENDING;
      case 'redeemed': return RewardStatus.REDEEMED;
      case 'all': return RewardStatus.ALL;
      default: return RewardStatus.PENDING;
    }
  };

  // 处理编辑奖励
  const handleEditReward = (reward: Reward) => {
    setEditingReward(reward);
    setIsRewardDialogOpen(true);
  };

  const handleQuickAddDaily = async (title: string) => {
    try {
      // 使用默认值创建日常任务
      // 使用本地时区获取今天的日期
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const localDate = `${year}-${month}-${day}`;
      
      const dailyData: CreateDailyRequest = {
        title,
        description: '',
        difficulty: DailyDifficulty.EASY, // 修改为简单难度
        start_date: localDate, // 使用本地时区日期
        repeat_period: DailyRepeatPeriod.DAILY,
        active_pattern: { type: DailyRepeatPeriod.DAILY, value: 1 },
        tags: []
      };
      
      const newDaily = await safeAsyncOperation<Daily>(
        () => createDaily(dailyData),
        '快速创建日常任务失败'
      );
      if (!newDaily) return;
      
      // 添加新日常任务到列表
      if (dailyListRef.current) {
        dailyListRef.current.addDailyItem(newDaily);
      }
    } catch (error: any) {
      console.error('快速创建日常任务失败:', error);
      toast.error(`创建失败: ${error?.message || '请重试'}`);
    }
  };

  const handleQuickAddTodo = async (title: string) => {
    if (!title.trim()) return;
    
    try {
      const todoData: CreateTodoRequest = {
        title,
        description: '',
        difficulty: TodoDifficulty.MEDIUM,
        value_level: 0,
        completed: false,
        due_date: null,
        checklist: [],
        tags: []
      };
      
      const createdTodo = await safeAsyncOperation<Todo>(
        () => createTodo(todoData),
        '快速创建待办事项失败'
      );
      if (!createdTodo) return;
      
      // 添加新待办事项到列表
      if (todoListRef.current) {
        todoListRef.current.addTodoItem(createdTodo);
      }
    } catch (error: any) {
      console.error('创建待办事项失败:', error);
      toast.error(`创建失败: ${error?.message || '请重试'}`);
    }
  };

  // 处理快速添加奖励
  const handleQuickAddReward = async (title: string) => {
    try {
      // 使用默认值创建奖励
      const rewardData: CreateRewardRequest = {
        title,
        description: '',
        icon: DEFAULT_REWARD.icon,
        price: DEFAULT_REWARD.price
      };
      
      const createdReward = await safeAsyncOperation<Reward>(
        () => createReward(rewardData),
        '快速创建奖励失败'
      );
      if (!createdReward) return;
      
      // 添加新奖励到列表
      if (rewardListRef.current) {
        rewardListRef.current.addRewardItem(createdReward);
      }
    } catch (error: any) {
      console.error('快速创建奖励失败:', error);
      toast.error(`创建失败: ${error?.message || '请重试'}`);
    }
  };

  // 渲染帮助弹窗
  const renderHelpDialog = (isOpen: boolean, setIsOpen: (open: boolean) => void, title: string, content: JSX.Element) => {
    return (
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="div" className="flex justify-between items-center">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">{title}</h3>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-500"
                      onClick={() => setIsOpen(false)}
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </Dialog.Title>
                  
                  <div className="mt-4">
                    {content}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    );
  };

  // 筛选器按钮样式
  const filterButtonClass = (isActive: boolean) => 
    `px-2 py-1 text-xs rounded-md transition-colors ${
      isActive 
        ? 'bg-indigo-100 text-indigo-700 font-medium' 
        : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
    }`;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100">
        <div className="container mx-auto px-4 py-8 pt-16 md:pt-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 培养习惯板块 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold text-gray-900">培养习惯</h2>
                  <button
                    onClick={() => setIsHabitHelpOpen(true)}
                    className="text-gray-500 hover:text-gray-700 focus:outline-none"
                    aria-label="习惯功能帮助"
                  >
                    <QuestionMarkCircleIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setIsHabitDialogOpen(true)}
                    className="text-indigo-600 hover:text-indigo-800 focus:outline-none"
                    aria-label="添加习惯"
                  >
                    <PlusIcon className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="flex gap-1">
                  <button 
                    className={filterButtonClass(habitFilter === 'all')}
                    onClick={() => setHabitFilter('all')}
                  >
                    全部
                  </button>
                  <button 
                    className={filterButtonClass(habitFilter === 'forming')}
                    onClick={() => setHabitFilter('forming')}
                  >
                    未养成
                  </button>
                  <button 
                    className={filterButtonClass(habitFilter === 'formed')}
                    onClick={() => setHabitFilter('formed')}
                  >
                    已养成
                  </button>
                </div>
              </div>
              <HabitList ref={habitListRef} filter={habitFilter} />
            </div>

            {/* 日常任务板块 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold text-gray-900">日常任务</h2>
                  <button
                    onClick={() => setIsDailyHelpOpen(true)}
                    className="text-gray-500 hover:text-gray-700 focus:outline-none"
                    aria-label="日常任务功能帮助"
                  >
                    <QuestionMarkCircleIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setIsDailyDialogOpen(true)}
                    className="text-indigo-600 hover:text-indigo-800 focus:outline-none"
                    aria-label="添加日常任务"
                  >
                    <PlusIcon className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="flex gap-1">
                  <button 
                    className={filterButtonClass(dailyFilter === 'active')}
                    onClick={() => setDailyFilter('active')}
                  >
                    活跃
                  </button>
                  <button 
                    className={filterButtonClass(dailyFilter === 'inactive')}
                    onClick={() => setDailyFilter('inactive')}
                  >
                    休眠
                  </button>
                  <button 
                    className={filterButtonClass(dailyFilter === 'all')}
                    onClick={() => setDailyFilter('all')}
                  >
                    全部
                  </button>
                </div>
              </div>
              <DailyQuickAdd onAdd={handleQuickAddDaily} />
              <DailyList ref={dailyListRef} filter={dailyFilter} />
            </div>

            {/* 待办事项板块 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold text-gray-900">待办事项</h2>
                  <button
                    onClick={() => setIsTodoHelpOpen(true)}
                    className="text-gray-500 hover:text-gray-700 focus:outline-none"
                    aria-label="待办事项功能帮助"
                  >
                    <QuestionMarkCircleIcon className="h-5 w-5" />
                  </button>
                  <TodoQuickAdd onSave={handleSaveTodo} />
                </div>
                
                <div className="flex gap-1">
                  <button 
                    className={filterButtonClass(todoFilter === 'incomplete')}
                    onClick={() => setTodoFilter('incomplete')}
                  >
                    未完成
                  </button>
                  <button 
                    className={filterButtonClass(todoFilter === 'completed')}
                    onClick={() => setTodoFilter('completed')}
                  >
                    已完成
                  </button>
                  <button 
                    className={filterButtonClass(todoFilter === 'all')}
                    onClick={() => setTodoFilter('all')}
                  >
                    全部
                  </button>
                </div>
              </div>
              <TodoQuickCreate onAdd={handleQuickAddTodo} />
              <TodoList ref={todoListRef} filter={todoFilter} />
            </div>

            {/* 成长激励板块 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold text-gray-900">成长激励</h2>
                  <button
                    onClick={() => setIsRewardHelpOpen(true)}
                    className="text-gray-500 hover:text-gray-700 focus:outline-none"
                    aria-label="成长激励功能帮助"
                  >
                    <QuestionMarkCircleIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingReward(null);
                      setIsRewardDialogOpen(true);
                    }}
                    className="text-indigo-600 hover:text-indigo-800 focus:outline-none"
                    aria-label="添加奖励"
                  >
                    <PlusIcon className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="flex gap-1">
                  <button 
                    className={filterButtonClass(rewardFilter === 'pending')}
                    onClick={() => setRewardFilter('pending')}
                  >
                    未兑换
                  </button>
                  <button 
                    className={filterButtonClass(rewardFilter === 'redeemed')}
                    onClick={() => setRewardFilter('redeemed')}
                  >
                    已兑换
                  </button>
                  <button 
                    className={filterButtonClass(rewardFilter === 'all')}
                    onClick={() => setRewardFilter('all')}
                  >
                    全部
                  </button>
                </div>
              </div>
              <RewardQuickAdd onAdd={handleQuickAddReward} />
              <RewardList 
                ref={rewardListRef} 
                onAddClick={() => {
                  setEditingReward(null);
                  setIsRewardDialogOpen(true);
                }}
                onEditClick={handleEditReward}
                filter={getRewardStatus(rewardFilter)}
                hideHeader={true}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 对话框放在顶层，确保全屏覆盖 */}
      <HabitEditDialog
        isOpen={isHabitDialogOpen}
        onClose={() => setIsHabitDialogOpen(false)}
        onSave={(habitData) => handleSaveHabit(habitData)}
      />

      <DailyEditDialog
        isOpen={isDailyDialogOpen}
        onClose={() => setIsDailyDialogOpen(false)}
        onSave={(dailyData) => handleSaveDaily(dailyData)}
      />
      
      <RewardEditDialog
        isOpen={isRewardDialogOpen}
        reward={editingReward || undefined}
        onClose={() => setIsRewardDialogOpen(false)}
        onSave={handleSaveReward}
      />
      
      {renderHelpDialog(
        isHabitHelpOpen, 
        setIsHabitHelpOpen, 
        "培养习惯功能介绍", 
        <div className="space-y-3 text-gray-600">
          <p>「培养习惯」板块帮助您建立和追踪良好习惯或戒除不良习惯。</p>
          <p className="font-medium text-gray-800">主要功能：</p>
          <ul className="list-disc ml-5 space-y-1">
            <li>建立好习惯、坏习惯或双向习惯</li>
            <li>记录日常习惯完成情况</li>
            <li>查看习惯连续完成天数</li>
            <li>根据完成情况自动调整习惯价值等级</li>
          </ul>
          <p className="font-medium text-gray-800">注意事项：</p>
          <ul className="list-disc ml-5 space-y-1">
            <li>好习惯：每日完成可提升价值等级，未完成会降级</li>
            <li>坏习惯：记录发生会降低价值等级</li>
            <li>双向习惯：可同时记录正向和负向行为</li>
          </ul>
        </div>
      )}
      
      {renderHelpDialog(
        isDailyHelpOpen, 
        setIsDailyHelpOpen, 
        "日常任务功能介绍", 
        <div className="space-y-3 text-gray-600">
          <p>「日常任务」板块帮助您管理需要定期重复的任务。</p>
          <p className="font-medium text-gray-800">主要功能：</p>
          <ul className="list-disc ml-5 space-y-1">
            <li>创建每日、每周、每月或每年的重复任务</li>
            <li>设置不同的重复模式（如每周一三五）</li>
            <li>记录任务完成情况和连续完成次数</li>
            <li>任务可设置不同难度级别</li>
          </ul>
          <p className="font-medium text-gray-800">重复规则：</p>
          <ul className="list-disc ml-5 space-y-1">
            <li>每日任务：每天需要完成</li>
            <li>每周任务：在指定的星期几需要完成</li>
            <li>每月任务：在每月指定的日期需要完成</li>
            <li>每年任务：在每年指定的月份需要完成</li>
          </ul>
          <p className="text-sm italic mt-2">未按时完成任务将影响任务价值等级和连击次数。</p>
        </div>
      )}
      
      {renderHelpDialog(
        isTodoHelpOpen, 
        setIsTodoHelpOpen, 
        "待办事项功能介绍", 
        <div className="space-y-3 text-gray-600">
          <p>「待办事项」板块帮助您管理一次性任务和项目。</p>
          <p className="font-medium text-gray-800">主要功能：</p>
          <ul className="list-disc ml-5 space-y-1">
            <li>创建单次待办事项</li>
            <li>添加子任务和截止日期</li>
            <li>设置任务难度和标签</li>
            <li>标记完成状态和进度</li>
          </ul>
          <p className="font-medium text-gray-800">特色功能：</p>
          <ul className="list-disc ml-5 space-y-1">
            <li>可拖拽排序调整优先级</li>
            <li>截止日期提醒和逾期警告</li>
            <li>根据逾期情况自动调整任务价值等级</li>
          </ul>
          <p className="text-sm italic mt-2">按时完成高价值任务将获得更多成长激励。</p>
        </div>
      )}
      
      {renderHelpDialog(
        isRewardHelpOpen, 
        setIsRewardHelpOpen, 
        "成长激励功能介绍", 
        <div className="space-y-3 text-gray-600">
          <p>「成长激励」板块帮助您设置奖励目标，激励自己完成习惯和任务。</p>
          <p className="font-medium text-gray-800">主要功能：</p>
          <ul className="list-disc ml-5 space-y-1">
            <li>设置不同价值的奖励目标</li>
            <li>使用完成任务获得的金币兑换奖励</li>
            <li>为不同种类的奖励添加自定义图标</li>
            <li>给奖励添加详细描述和标签</li>
          </ul>
          <p className="font-medium text-gray-800">使用建议：</p>
          <ul className="list-disc ml-5 space-y-1">
            <li>设置不同价值的短期和长期奖励</li>
            <li>将奖励与生活目标结合</li>
            <li>合理设置奖励价格，激励持续进步</li>
          </ul>
          <p className="text-sm italic mt-2">兑换奖励功能将在后续版本添加，敬请期待。</p>
        </div>
      )}
      
    </ProtectedRoute>
  );
} 