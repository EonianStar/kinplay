'use client';

import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition, Listbox } from '@headlessui/react';
import { 
  XMarkIcon, 
  CheckIcon, 
  ChevronUpDownIcon, 
  PlusIcon, 
  TrashIcon, 
  MinusIcon,
  CalendarIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import { 
  TodoDifficulty,
  CreateTodoRequest,
  Todo
} from '@/types/todo';
import { createPortal } from 'react-dom';
import { Combobox } from '@headlessui/react';

// 难度选项
const difficultyOptions = [
  { id: TodoDifficulty.VERY_EASY, name: '★', description: '非常容易' },
  { id: TodoDifficulty.EASY, name: '★★', description: '简单' },
  { id: TodoDifficulty.MEDIUM, name: '★★★', description: '中等' },
  { id: TodoDifficulty.HARD, name: '★★★★', description: '困难' },
];

// 预设标签
const presetTags = [
  '工作', '学习', '家庭', '健康', '购物', '娱乐', '旅行', '阅读', '重要', '紧急'
];

// 难度星级映射
const difficultyStars: Record<TodoDifficulty, number> = {
  [TodoDifficulty.VERY_EASY]: 1,
  [TodoDifficulty.EASY]: 2,
  [TodoDifficulty.MEDIUM]: 3,
  [TodoDifficulty.HARD]: 4,
};

// 难度星级显示组件
const DifficultyStarsDisplay = ({ difficulty, className }: { difficulty: TodoDifficulty, className?: string }) => {
  const starCount = difficultyStars[difficulty];
  return (
    <div className={`flex ${className || ''}`}>
      {[...Array(starCount)].map((_, index) => (
        <StarIcon
          key={index}
          className="h-3.5 w-3.5 text-yellow-400"
        />
      ))}
    </div>
  );
};

// 格式化日期为YYYY-MM-DD
const formatDate = (date: Date) => {
  return date.toISOString().split('T')[0];
};

interface TodoEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (todoData: CreateTodoRequest) => void;
  initialData?: Todo;
}

const TodoEditDialog = ({ isOpen, onClose, onSave, initialData }: TodoEditDialogProps) => {
  // 表单状态
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subtasks, setSubtasks] = useState<{ title: string; completed: boolean }[]>([]);
  const [difficulty, setDifficulty] = useState<TodoDifficulty>(TodoDifficulty.EASY);
  const [dueDate, setDueDate] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [filteredTags, setFilteredTags] = useState<string[]>([]);
  
  // 错误状态
  const [titleError, setTitleError] = useState(false);
  
  // 清空表单
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSubtasks([]);
    setDifficulty(TodoDifficulty.EASY);
    setDueDate('');
    setTags([]);
    setTagInput('');
    setTitleError(false);
  };
  
  // 初始化数据
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setSubtasks(initialData.checklist || []);
      setDifficulty(initialData.difficulty || TodoDifficulty.EASY);
      
      // 处理截止日期，如果有的话
      if (initialData.due_date) {
        const date = new Date(initialData.due_date);
        setDueDate(formatDate(date));
      } else {
        setDueDate('');
      }
      
      setTags(initialData.tags || []);
    } else {
      // 重置表单
      resetForm();
    }
    
    setTitleError(false);
  }, [initialData]);
  
  // 处理标签输入
  useEffect(() => {
    if (tagInput.trim() === '') {
      setFilteredTags([]);
      return;
    }
    
    const filtered = presetTags
      .filter(tag => 
        tag.toLowerCase().includes(tagInput.toLowerCase()) && 
        !tags.includes(tag)
      )
      .slice(0, 5);
    
    setFilteredTags(filtered);
  }, [tagInput, tags]);
  
  // 添加子任务
  const addSubtask = () => {
    setSubtasks([...subtasks, { title: '', completed: false }]);
  };
  
  // 删除子任务
  const removeSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };
  
  // 更新子任务标题
  const updateSubtaskTitle = (index: number, newTitle: string) => {
    const updatedSubtasks = [...subtasks];
    updatedSubtasks[index].title = newTitle;
    setSubtasks(updatedSubtasks);
  };
  
  // 添加标签
  const addTag = (newTag: string) => {
    if (newTag.trim() === '' || tags.includes(newTag)) return;
    
    setTags([...tags, newTag]);
    setTagInput('');
  };
  
  // 删除标签
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // 处理标签选择变化
  const handleTagChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === '') return;
    
    if (!tags.includes(value)) {
      setTags(prev => [...prev, value]);
    }
    e.target.value = ''; // 重置选择
  };
  
  // 提交表单
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let hasError = false;
    
    // 验证
    if (!title.trim()) {
      setTitleError(true);
      hasError = true;
    }
    
    if (hasError) {
      // 1秒后清除错误状态
      setTimeout(() => {
        setTitleError(false);
      }, 1000);
      return;
    }
    
    // 过滤掉空的子任务
    const validSubtasks = subtasks.filter(task => task.title.trim() !== '');
    
    // 构建待办事项数据
    const todoData: CreateTodoRequest = {
      title: title.trim(),
      description: description.trim(),
      difficulty,
      tags
    };
    
    // 添加子任务，如果有的话
    if (validSubtasks.length > 0) {
      todoData.checklist = validSubtasks;
    }
    
    // 添加截止日期，如果有的话
    if (dueDate) {
      todoData.due_date = dueDate;
    }
    
    // 保存数据
    onSave(todoData);
    
    // 关闭对话框
    onClose();
    
    // 重置表单
    resetForm();
  };
  
  // 渲染对话框内容
  return createPortal(
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" />
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center sticky top-0 bg-white rounded-t-lg px-4 pt-3 sm:px-6 sm:pt-4 pb-4 z-10">
                  <Dialog.Title 
                    as="h2" 
                    className="text-xl sm:text-2xl font-semibold text-gray-900"
                  >
                    编辑待办
                  </Dialog.Title>
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-2.5 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      form="todoForm"
                      className="px-2.5 py-1.5 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      保存
                    </button>
                  </div>
                </div>
                
                <form id="todoForm" onSubmit={handleSubmit} className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 9rem)' }}>
                  <div className="space-y-2 sm:space-y-3 px-4 sm:px-6 pb-6">
                    {/* 标题 */}
                    <div className="px-3 py-2 sm:p-3">
                      <label htmlFor="title" className="block text-base font-medium text-gray-700 mb-1.5">
                        标题 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="title"
                        className={`block w-full h-12 sm:h-13 rounded-lg border ${
                          titleError ? 'border-red-500 animate-pulse-red' : 'border-gray-100'
                        } bg-white shadow-sm hover:shadow-md transition-shadow focus:ring-2 focus:ring-indigo-500 text-sm px-3 py-2`}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="输入待办事项标题"
                        required
                      />
                    </div>
                    
                    {/* 说明 */}
                    <div className="px-3 py-2 sm:p-3">
                      <label htmlFor="description" className="block text-base font-medium text-gray-700 mb-1.5">
                        说明
                      </label>
                      <textarea
                        id="description"
                        className="block w-full rounded-lg border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow focus:ring-2 focus:ring-indigo-500 text-sm px-3 py-2"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="输入详细说明"
                        rows={3}
                      />
                    </div>
                    
                    {/* 子任务清单 */}
                    <div className="px-3 py-2 sm:p-3">
                      <label className="block text-base font-medium text-gray-700 mb-1.5">
                        子任务清单
                      </label>
                      <div className="space-y-2">
                        {subtasks.map((task, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <input
                              type="text"
                              className="block flex-1 rounded-lg border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow focus:ring-2 focus:ring-indigo-500 text-sm px-3 py-2"
                              value={task.title}
                              onChange={(e) => updateSubtaskTitle(index, e.target.value)}
                              placeholder={`子任务 ${index + 1}`}
                            />
                            <button
                              type="button"
                              onClick={() => removeSubtask(index)}
                              className="p-1.5 text-gray-500 hover:text-red-600"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={addSubtask}
                          className="flex items-center text-sm text-indigo-600 hover:text-indigo-800"
                        >
                          <PlusIcon className="h-4 w-4 mr-1" />
                          添加子任务
                        </button>
                      </div>
                    </div>
                    
                    {/* 难度选择 */}
                    <div className="px-3 py-2 sm:p-3">
                      <label htmlFor="difficulty" className="block text-base font-medium text-gray-700 mb-1.5">
                        难度
                      </label>
                      <Listbox value={difficulty} onChange={setDifficulty}>
                        <div className="relative mt-1">
                          <Listbox.Button className="relative w-full cursor-default rounded-lg border border-gray-100 bg-white py-2 pl-3 pr-10 text-left shadow-sm hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm">
                            <span className="flex items-center">
                              <span className="block truncate mr-2 text-yellow-400">{difficultyOptions.find(o => o.id === difficulty)?.name}</span>
                              <span className="text-sm text-gray-500">{difficultyOptions.find(o => o.id === difficulty)?.description}</span>
                            </span>
                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                              <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </span>
                          </Listbox.Button>
                          <Transition
                            as={Fragment}
                            leave="transition ease-in duration-100"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                          >
                            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                              {difficultyOptions.map((option) => (
                                <Listbox.Option
                                  key={option.id}
                                  className={({ active }) =>
                                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                      active ? 'bg-indigo-100 text-indigo-900' : 'text-gray-900'
                                    }`
                                  }
                                  value={option.id}
                                >
                                  {({ selected }) => (
                                    <>
                                      <span className={`flex items-center ${selected ? 'font-medium' : 'font-normal'}`}>
                                        <span className="mr-2 text-yellow-400">{option.name}</span>
                                        <span className="text-sm text-gray-500">{option.description}</span>
                                      </span>
                                      {selected ? (
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600">
                                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                        </span>
                                      ) : null}
                                    </>
                                  )}
                                </Listbox.Option>
                              ))}
                            </Listbox.Options>
                          </Transition>
                        </div>
                      </Listbox>
                    </div>
                    
                    {/* 截止日期 */}
                    <div className="px-3 py-2 sm:p-3">
                      <label htmlFor="dueDate" className="block text-base font-medium text-gray-700 mb-1.5">
                        截止日期
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          id="dueDate"
                          className="block w-full rounded-lg border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow focus:ring-2 focus:ring-indigo-500 text-sm pl-10 pr-3 py-2"
                          value={dueDate}
                          onChange={(e) => setDueDate(e.target.value)}
                          min={formatDate(new Date())}
                        />
                        <CalendarIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        选择的截止日期将设置为当天的 23:59:59
                      </div>
                    </div>
                    
                    {/* 标签 */}
                    <div className="px-3 py-2 sm:p-3">
                      <label htmlFor="tags" className="block text-base font-medium text-gray-700 mb-1.5">
                        标签
                      </label>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div className="col-span-1 relative">
                          <select
                            onChange={handleTagChange}
                            className="block w-full h-10 rounded-lg border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow focus:ring-2 focus:ring-indigo-500 text-sm px-3 py-2 pr-12 appearance-none truncate"
                            aria-label="选择标签"
                          >
                            <option value="" className="truncate">选择标签</option>
                            {presetTags.map((tag) => (
                              <option key={tag} value={tag} className="truncate">{tag}</option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
                            <ChevronDownIcon className="h-4 w-4 text-gray-400 flex-shrink-0" aria-hidden="true" />
                          </div>
                        </div>
                        <div className="col-span-1">
                          <input
                            type="text"
                            className="block w-full h-10 rounded-lg border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow focus:ring-2 focus:ring-indigo-500 text-sm px-3 py-2"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            placeholder="输入自定义标签"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && tagInput.trim() !== '') {
                                e.preventDefault();
                                addTag(tagInput);
                              }
                            }}
                          />
                        </div>
                      </div>
                      
                      {/* 标签显示 */}
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {tags.map((tag, index) => (
                            <div 
                              key={index} 
                              className="flex items-center border border-gray-200 text-gray-700 text-sm px-3 py-1 rounded-full transition-all hover:shadow-md hover:border-gray-300 hover:bg-gray-50"
                            >
                              {tag}
                              <button
                                type="button"
                                onClick={() => removeTag(tag)}
                                className="ml-1 text-gray-500 hover:text-red-500"
                              >
                                <XMarkIcon className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>,
    document.body
  );
};

export default TodoEditDialog; 