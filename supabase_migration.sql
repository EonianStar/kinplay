-- 为 habits 表添加 sort_order 字段
ALTER TABLE habits 
ADD COLUMN sort_order INTEGER DEFAULT 0;

-- 为 dailies 表添加 sort_order 字段
ALTER TABLE dailies 
ADD COLUMN sort_order INTEGER DEFAULT 0;

-- 为 todos 表添加 sort_order 字段
ALTER TABLE todos 
ADD COLUMN sort_order INTEGER DEFAULT 0;

-- 为现有数据设置初始排序顺序（基于创建时间）
UPDATE habits
SET sort_order = sub.row_num - 1
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) as row_num
  FROM habits
) sub
WHERE habits.id = sub.id;

UPDATE dailies
SET sort_order = sub.row_num - 1
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) as row_num
  FROM dailies
) sub
WHERE dailies.id = sub.id;

UPDATE todos
SET sort_order = sub.row_num - 1
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) as row_num
  FROM todos
) sub
WHERE todos.id = sub.id; 