-- 创建待办事项完成记录表
CREATE TABLE IF NOT EXISTS todo_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  todo_id UUID REFERENCES todos(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  experience_gained DECIMAL(10, 2) DEFAULT 0,
  coins_gained DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 为待办事项完成记录表添加RLS策略
ALTER TABLE todo_completions ENABLE ROW LEVEL SECURITY;

-- 创建仅允许用户访问自己待办事项完成记录的策略
CREATE POLICY "Users can only access their own todo completions"
  ON todo_completions
  FOR ALL
  USING (auth.uid() = user_id);

-- 创建待办事项完成记录索引
CREATE INDEX todo_completions_todo_id_idx ON todo_completions(todo_id);
CREATE INDEX todo_completions_user_id_idx ON todo_completions(user_id);
CREATE INDEX todo_completions_completed_at_idx ON todo_completions(completed_at);

-- 创建日常任务完成记录表
CREATE TABLE IF NOT EXISTS daily_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  daily_id UUID REFERENCES dailies(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  experience_gained DECIMAL(10, 2) DEFAULT 0,
  coins_gained DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 为日常任务完成记录表添加RLS策略
ALTER TABLE daily_completions ENABLE ROW LEVEL SECURITY;

-- 创建仅允许用户访问自己日常任务完成记录的策略
CREATE POLICY "Users can only access their own daily completions"
  ON daily_completions
  FOR ALL
  USING (auth.uid() = user_id);

-- 创建日常任务完成记录索引
CREATE INDEX daily_completions_daily_id_idx ON daily_completions(daily_id);
CREATE INDEX daily_completions_user_id_idx ON daily_completions(user_id);
CREATE INDEX daily_completions_completed_at_idx ON daily_completions(completed_at);

-- 创建习惯完成记录表
CREATE TABLE IF NOT EXISTS habit_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_good BOOLEAN NOT NULL DEFAULT true,
  experience_gained DECIMAL(10, 2) DEFAULT 0,
  coins_gained DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 为习惯完成记录表添加RLS策略
ALTER TABLE habit_completions ENABLE ROW LEVEL SECURITY;

-- 创建仅允许用户访问自己习惯完成记录的策略
CREATE POLICY "Users can only access their own habit completions"
  ON habit_completions
  FOR ALL
  USING (auth.uid() = user_id);

-- 创建习惯完成记录索引
CREATE INDEX habit_completions_habit_id_idx ON habit_completions(habit_id);
CREATE INDEX habit_completions_user_id_idx ON habit_completions(user_id);
CREATE INDEX habit_completions_completed_at_idx ON habit_completions(completed_at);
CREATE INDEX habit_completions_is_good_idx ON habit_completions(is_good); 