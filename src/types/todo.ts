/**
 * 待办事项数据类型定义
 */

// 待办事项难度级别枚举
export enum TodoDifficulty {
  VERY_EASY = 1, // 非常容易
  EASY = 2,      // 简单
  MEDIUM = 3,    // 中等
  HARD = 4       // 困难
}

// 待办事项子项任务类型
export interface TodoTask {
  id: string;           // 子任务ID
  title: string;        // 子任务标题
  completed: boolean;   // 是否已完成
}

// 待办事项完整数据模型
export interface Todo {
  id: string;                  // 待办事项ID
  title: string;               // 标题（必填）
  description?: string;        // 说明（选填）
  checklist?: TodoTask[];      // 子事项列表（选填）
  difficulty: TodoDifficulty;  // 难度（必选）
  due_date?: string;           // 截止日期（选填）格式：YYYY-MM-DD
  tags?: string[];             // 标签（选填）
  completed: boolean;          // 是否已完成
  created_at: string;          // 创建时间
  updated_at: string;          // 更新时间
  value_level?: number;        // 价值权重等级（-4到4的整数，默认为0）
}

// 创建待办事项请求数据类型
export interface CreateTodoRequest {
  title: string;                          // 标题（必填）
  description?: string;                   // 说明（选填）
  checklist?: Omit<TodoTask, 'id'>[];     // 子事项列表（选填）
  difficulty: TodoDifficulty;             // 难度（必选）
  due_date?: string;                      // 截止日期（选填）
  tags?: string[];                        // 标签（选填）
}

// 更新待办事项请求数据类型
export interface UpdateTodoRequest {
  id: string;                             // 待办事项ID（必填）
  title?: string;                         // 标题（选填）
  description?: string;                   // 说明（选填）
  checklist?: TodoTask[];                 // 子事项列表（选填）
  difficulty?: TodoDifficulty;            // 难度（选填）
  due_date?: string;                      // 截止日期（选填）
  tags?: string[];                        // 标签（选填）
  completed?: boolean;                    // 是否已完成（选填）
  value_level?: number;                   // 价值权重等级（选填）
} 