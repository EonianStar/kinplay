// 任务类型定义
export interface Task {
  id: string;
  user_id: string;
  title: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

// 创建任务的请求类型
export interface CreateTaskRequest {
  title: string;
}

// 更新任务的请求类型
export interface UpdateTaskRequest {
  id: string;
  title?: string;
  completed?: boolean;
} 