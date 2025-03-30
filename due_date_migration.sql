-- 为 habits 表添加最后逾期检查时间字段
ALTER TABLE habits 
ADD COLUMN last_due_check TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- 为 dailies 表添加最后逾期检查时间字段
ALTER TABLE dailies 
ADD COLUMN last_due_check TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- 为 todos 表添加最后逾期检查时间字段
ALTER TABLE todos 
ADD COLUMN last_due_check TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- 创建 daily_completions 表用于记录日常任务的完成情况
CREATE TABLE IF NOT EXISTS daily_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  daily_id UUID NOT NULL REFERENCES dailies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
); 