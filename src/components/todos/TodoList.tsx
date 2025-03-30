'use client';

import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import { StarIcon, CalendarIcon, ChevronDownIcon, ChevronRightIcon, ListBulletIcon } from '@heroicons/react/24/solid';
import { 
  PencilSquareIcon, 
  TrashIcon, 
  PlusIcon, 
  XMarkIcon, 
  CheckIcon, 
  EllipsisVerticalIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Todo, TodoDifficulty, TodoTask, CreateTodoRequest, UpdateTodoRequest } from '@/types/todo';
import { getAllTodos, deleteTodo, updateTodo, toggleTodoComplete, updateTodosOrder } from '@/services/todos';
import TodoEditDialog from './TodoEditDialog';
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

interface TodoListProps {
  onAddClick?: () => void;
  filter?: 'incomplete' | 'completed' | 'all';
}

// 难度星级映射
const difficultyStars: Record<TodoDifficulty, number> = {
  [TodoDifficulty.VERY_EASY]: 1,
  [TodoDifficulty.EASY]: 2,
  [TodoDifficulty.MEDIUM]: 3,
  [TodoDifficulty.HARD]: 4,
};

interface SortableTodoItemProps {
  todo: Todo;
  onDelete: (id: string) => Promise<void>;
  onEdit: (todo: Todo) => void;
  onToggleComplete: (todo: Todo) => Promise<void>;
  onToggleSubtaskComplete: (todoId: string, taskId: string, completed: boolean) => Promise<void>;
  onTagClick: (id: string) => void;
  visibleTagId: string | null;
  expandedTodos: {[key: string]: boolean};
  toggleExpand: (todoId: string) => void;
  getCompletedTasksCount: (checklist: TodoTask[] | undefined) => { completed: number; total: number };
  renderDifficultyStars: (difficulty: TodoDifficulty) => JSX.Element;
  formatDate: (dateStr: string) => string;
}

// 可拖拽的待办事项组件
const SortableTodoItem = ({
  todo,
  onDelete,
  onEdit,
  onToggleComplete,
  onToggleSubtaskComplete,
  onTagClick,
  visibleTagId,
  expandedTodos,
  toggleExpand,
  getCompletedTasksCount,
  renderDifficultyStars,
  formatDate
}: SortableTodoItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: todo.id });

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
      className={`bg-white rounded-lg shadow-sm transition-all duration-200 hover:shadow-md mb-3 ${
        todo.completed ? 'opacity-60' : ''
      } relative group`}
    >
      <div className="flex">
        {/* 左侧色块与复选框 */}
        <div className="w-10 flex items-start justify-center pt-4 rounded-l-lg" style={{ backgroundColor: getColorByValueLevel(todo.value_level || 0) }}>
          <input
            type="checkbox"
            className="h-5 w-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
            checked={todo.completed}
            onChange={() => onToggleComplete(todo)}
          />
        </div>
        
        {/* 主要内容区域 */}
        <div 
          className="flex-1 py-3 pr-4 pl-4 cursor-grab active:cursor-grabbing" 
          {...listeners}
        >
          <div className="flex flex-col">
            {/* 顶部区域：标题和操作菜单 */}
            <div className="flex justify-between items-start mb-1">
              <div>
                <h3 className={`font-medium text-gray-900 break-all ${todo.completed ? 'line-through' : ''}`}>
                  {todo.title}
                </h3>
                
                {/* 描述 - 直接跟在标题下方 */}
                {todo.description && (
                  <p className={`text-sm text-gray-500 mt-0.5 break-all ${todo.completed ? 'line-through' : ''}`}>
                    {todo.description}
                  </p>
                )}
              </div>
              
              {/* 右侧：操作菜单和难度星星 */}
              <div className="flex flex-col items-end space-y-2 ml-2">
                {/* 替换下拉菜单为直接的按钮 */}
                <div className="flex space-x-1">
                  <button
                    onClick={() => onEdit(todo)}
                    className="p-1 text-gray-400 hover:text-indigo-600 focus:outline-none rounded-full hover:bg-gray-100"
                  >
                    <PencilSquareIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(todo.id)}
                    className="p-1 text-gray-400 hover:text-red-600 focus:outline-none rounded-full hover:bg-gray-100"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
                
                {/* 难度星星 */}
                {renderDifficultyStars(todo.difficulty)}
              </div>
            </div>
            
            {/* 子任务列表 */}
            {todo.checklist && todo.checklist.length > 0 && (
              <div className="mt-2 mb-2">
                <button
                  type="button"
                  onClick={() => toggleExpand(todo.id)}
                  className="flex items-center text-xs text-gray-500 mb-1 hover:text-indigo-600"
                >
                  <ListBulletIcon className="h-4 w-4 mr-1" />
                  {expandedTodos[todo.id] ? (
                    <ChevronDownIcon className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronRightIcon className="h-3.5 w-3.5" />
                  )}
                  <span className="ml-1.5">
                    {getCompletedTasksCount(todo.checklist).completed}/{getCompletedTasksCount(todo.checklist).total}
                  </span>
                </button>
                
                {expandedTodos[todo.id] && (
                  <div className="pl-2 space-y-1 mt-1 border-l-2 border-gray-100">
                    {todo.checklist.map((task) => (
                      <div key={task.id} className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 mr-2"
                          checked={task.completed}
                          onChange={() => onToggleSubtaskComplete(todo.id, task.id, task.completed)}
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
            
            {/* 底部区域：截止日期和标签 */}
            <div className="flex justify-between items-center mt-1">
              {/* 左侧：截止日期 */}
              <div>
                {todo.due_date && (
                  <div className="flex items-center text-xs text-gray-500">
                    <CalendarIcon className="h-3.5 w-3.5 text-gray-400 mr-1" />
                    <span>{formatDate(todo.due_date)}</span>
                  </div>
                )}
              </div>
              
              {/* 右侧：标签图标 */}
              <div>
                {todo.tags && todo.tags.length > 0 && (
                  <div className="relative group">
                    <button 
                      className="flex items-center text-gray-400 hover:text-indigo-600 p-0.5 rounded-full hover:bg-gray-100"
                      onClick={() => onTagClick(todo.id)}
                    >
                      <TagIcon className="h-4 w-4" />
                    </button>
                    <div 
                      className={`absolute bottom-6 right-0 mt-1 w-auto min-w-max max-w-xs bg-indigo-600 shadow-lg rounded-full p-1.5 
                        hidden group-hover:flex flex-wrap gap-1 z-50`}
                    >
                      {todo.tags.map((tag, idx) => (
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
    </div>
  );
};

const TodoList = forwardRef<{ loadTodos: () => Promise<void> }, TodoListProps>(function TodoList(props, ref) {
  const { onAddClick, filter = 'all' } = props;
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedTodos, setExpandedTodos] = useState<{[key: string]: boolean}>({});
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [visibleTagId, setVisibleTagId] = useState<string | null>(null);
  
  // 拖拽相关传感器设置
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  
  // 加载待办事项
  const loadTodos = async () => {
    try {
      setLoading(true);
      setError(null);
      const todosData = await getAllTodos();
      setTodos(todosData);
    } catch (error) {
      console.error('加载待办事项失败:', error);
      setError('加载待办事项失败，请刷新页面重试');
    } finally {
      setLoading(false);
    }
  };
  
  // 初始加载
  useEffect(() => {
    loadTodos();
  }, []);
  
  // 暴露刷新方法
  useEffect(() => {
    if (ref) {
      if (typeof ref === 'function') {
        ref({ loadTodos });
      } else {
        ref.current = { loadTodos };
      }
    }
  }, [ref]);
  
  // 处理编辑
  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo);
    setIsEditDialogOpen(true);
  };
  
  // 编辑完成
  const handleEditComplete = async (todoData: CreateTodoRequest) => {
    if (!editingTodo) return;
    
    try {
      setLoading(true);
      
      // 构建更新数据，处理类型兼容问题
      const updateData: UpdateTodoRequest = {
        id: editingTodo.id,
        title: todoData.title,
        description: todoData.description,
        difficulty: todoData.difficulty,
        tags: todoData.tags,
        due_date: todoData.due_date
      };
      
      // 处理子任务，为每个子任务添加ID
      if (todoData.checklist && todoData.checklist.length > 0) {
        // 保留已有子任务的ID
        const existingTasks = editingTodo.checklist || [];
        
        updateData.checklist = todoData.checklist.map(task => {
          // 查找是否有对应的已存在任务
          const existingTask = existingTasks.find(t => t.title === task.title);
          return {
            id: existingTask?.id || uuidv4(), // 使用已有ID或生成新ID
            title: task.title,
            completed: task.completed || false
          };
        });
      }
      
      // 调用updateTodo服务函数保存到数据库
      await updateTodo(editingTodo.id, updateData);
      setIsEditDialogOpen(false);
      await loadTodos(); // 重新加载数据以更新UI
    } catch (error) {
      console.error('更新待办事项失败:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // 处理删除
  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这个待办事项吗？')) {
      try {
        await deleteTodo(id);
        await loadTodos();
      } catch (error) {
        console.error('删除待办事项失败:', error);
      }
    }
  };
  
  // 处理完成状态切换
  const handleToggleComplete = async (todo: Todo) => {
    try {
      // 简单切换完成状态，不再自动完成所有子任务
      await toggleTodoComplete(todo.id, !todo.completed);
      
      // 刷新列表
      await loadTodos();
    } catch (error) {
      console.error('更新任务状态失败:', error);
    }
  };
  
  // 处理子任务完成状态切换
  const handleToggleSubtaskComplete = async (todoId: string, taskId: string, completed: boolean) => {
    try {
      const todo = todos.find(t => t.id === todoId);
      if (!todo || !todo.checklist) return;
      
      const updatedChecklist = todo.checklist.map(task => 
        task.id === taskId ? { ...task, completed: !completed } : task
      );
      
      // 只更新子任务状态，不再自动完成主任务
      await updateTodo(todoId, { 
        id: todoId,
        checklist: updatedChecklist
        // 移除 completed: allCompleted，不再自动设置主任务完成状态
      });
      
      await loadTodos();
    } catch (error) {
      console.error('更新子任务状态失败:', error);
    }
  };
  
  // 格式化日期
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = 
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();
    
    if (isToday) {
      return '今天';
    }
    
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = 
      date.getDate() === tomorrow.getDate() &&
      date.getMonth() === tomorrow.getMonth() &&
      date.getFullYear() === tomorrow.getFullYear();
    
    if (isTomorrow) {
      return '明天';
    }
    
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  };
  
  // 渲染难度星星
  const renderDifficultyStars = (difficulty: TodoDifficulty) => {
    let starCount = 0;
    
    switch (difficulty) {
      case TodoDifficulty.VERY_EASY:
        starCount = 1;
        break;
      case TodoDifficulty.EASY:
        starCount = 2;
        break;
      case TodoDifficulty.MEDIUM:
        starCount = 3;
        break;
      case TodoDifficulty.HARD:
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
  
  // 切换展开状态
  const toggleExpand = (todoId: string) => {
    setExpandedTodos(prev => ({
      ...prev,
      [todoId]: !prev[todoId]
    }));
  };
  
  // 计算已完成任务数量
  const getCompletedTasksCount = (checklist?: TodoTask[]) => {
    if (!checklist || checklist.length === 0) return { completed: 0, total: 0 };
    const completed = checklist.filter(task => task.completed).length;
    return { completed, total: checklist.length };
  };
  
  // 处理拖拽结束事件
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setTodos((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        console.log(`拖拽排序: 项目 "${items[oldIndex].title}" 从位置 ${oldIndex} 移动到 ${newIndex}`);
        
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // 更新服务器上的顺序
        const newOrder = newItems.map(item => item.id);
        console.log('新排序顺序 IDs:', newOrder);
        
        updateTodosOrder(newOrder)
          .then(() => console.log('排序更新成功保存到服务器'))
          .catch(error => {
            console.error('更新待办事项顺序失败:', error);
          });
        
        return newItems;
      });
    }
  };
  
  // 处理标签点击事件（现在只需要作为props传递，实际功能已移除）
  const handleTagClick = () => {};
  
  // 根据筛选条件过滤待办事项
  const filteredTodos = todos.filter(todo => {
    if (filter === 'all') return true;
    if (filter === 'completed') return todo.completed;
    if (filter === 'incomplete') return !todo.completed;
    return true;
  });
  
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
  if (todos.length === 0) {
    return (
      <div className="text-center text-gray-500 py-10">
        <p className="mb-3">暂无待办事项</p>
        {onAddClick && (
          <button 
            onClick={onAddClick}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="h-4 w-4 mr-1" /> 添加待办事项
          </button>
        )}
      </div>
    );
  }
  
  // 筛选后的空列表显示
  if (filteredTodos.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        {filter === 'completed' ? '没有已完成的待办事项' : 
         filter === 'incomplete' ? '没有未完成的待办事项' : 
         '暂无待办事项'}
      </div>
    );
  }
  
  // 渲染待办事项列表
  return (
    <div className="space-y-3">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={filteredTodos.map(todo => todo.id)}
          strategy={verticalListSortingStrategy}
        >
          {filteredTodos.map((todo) => (
            <SortableTodoItem
              key={todo.id}
              todo={todo}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onToggleComplete={handleToggleComplete}
              onToggleSubtaskComplete={handleToggleSubtaskComplete}
              onTagClick={handleTagClick}
              visibleTagId={visibleTagId}
              expandedTodos={expandedTodos}
              toggleExpand={toggleExpand}
              getCompletedTasksCount={getCompletedTasksCount}
              renderDifficultyStars={renderDifficultyStars}
              formatDate={formatDate}
            />
          ))}
        </SortableContext>
      </DndContext>
      
      {/* 编辑对话框 */}
      {editingTodo && (
        <TodoEditDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          onSave={handleEditComplete}
          initialData={editingTodo}
        />
      )}
    </div>
  );
});

TodoList.displayName = 'TodoList';

export default TodoList; 