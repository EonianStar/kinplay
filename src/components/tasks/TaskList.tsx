'use client';

import { useState, useEffect } from 'react';
import { Task } from '@/types/task';
import { TrashIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import TaskEditDialog from './TaskEditDialog';

interface TaskListProps {
  tasks?: Task[];
}

export default function TaskList({ tasks = [] }: TaskListProps) {
  const [localTasks, setLocalTasks] = useState<Task[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setIsEditDialogOpen(true);
  };

  const handleEditComplete = async (taskData: any) => {
    // 这里处理任务编辑逻辑
    console.log("编辑任务", taskData);
    setIsEditDialogOpen(false);
    setEditingTask(null);
  };

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">待办事项</h2>
      
      {localTasks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          暂无任务，点击上方&quot;添加任务&quot;按钮创建新任务
        </div>
      ) : (
        <ul className="space-y-3">
          {localTasks.map((task) => (
            <li 
              key={task.id} 
              className="bg-white rounded-lg shadow p-4 flex items-center justify-between"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 flex items-center justify-center">
                  <input
                    type="checkbox"
                    className="h-5 w-5 text-indigo-600 rounded"
                    checked={task.completed}
                    onChange={() => {
                      // 处理任务完成逻辑
                    }}
                  />
                </div>
                <span className={`ml-3 ${task.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                  {task.title}
                </span>
              </div>

              <div className="flex space-x-2">
                <button
                  type="button"
                  className="p-1 text-gray-500 hover:text-indigo-600"
                  onClick={() => handleEditClick(task)}
                >
                  <PencilSquareIcon className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className="p-1 text-gray-500 hover:text-red-600"
                  onClick={() => {
                    // 处理任务删除逻辑
                  }}
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* 编辑对话框 */}
      <TaskEditDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingTask(null);
        }}
        onSave={handleEditComplete}
        initialData={editingTask}
      />
    </div>
  );
}