'use client';

import { useState, Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface TaskEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: any) => void;
  initialData?: any;
}

export default function TaskEditDialog({
  isOpen,
  onClose,
  onSave,
  initialData
}: TaskEditDialogProps) {
  const [title, setTitle] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});
  
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
    } else {
      // 重置表单
      setTitle('');
    }
    setErrors({});
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 验证
    const newErrors: { [key: string]: boolean } = {};
    if (!title.trim()) {
      newErrors.title = true;
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // 提交数据
    onSave({
      title: title.trim(),
      ...(initialData?.id ? { id: initialData.id } : {})
    });
    
    onClose();
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
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
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={onClose}
                  >
                    <span className="sr-only">关闭</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                      {initialData ? '编辑任务' : '新增任务'}
                    </Dialog.Title>
                    <div className="mt-4">
                      <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                            标题 *
                          </label>
                          <input
                            type="text"
                            id="title"
                            className={`block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ${
                              errors.title 
                                ? 'ring-red-500 animate-pulse-red' 
                                : 'ring-gray-300 focus:ring-indigo-600'
                            } placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6`}
                            value={title}
                            onChange={(e) => {
                              setTitle(e.target.value);
                              if (e.target.value.trim()) {
                                setErrors((prev) => ({ ...prev, title: false }));
                              }
                            }}
                            placeholder="输入任务标题"
                          />
                        </div>
                        
                        <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                          <button
                            type="submit"
                            className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2"
                          >
                            保存
                          </button>
                          <button
                            type="button"
                            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                            onClick={onClose}
                          >
                            取消
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
} 