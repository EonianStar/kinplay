-- 为 habits 表添加价值权重字段
ALTER TABLE habits 
ADD COLUMN value_level INTEGER DEFAULT 0;

-- 为 dailies 表添加价值权重字段
ALTER TABLE dailies 
ADD COLUMN value_level INTEGER DEFAULT 0;

-- 为 todos 表添加价值权重字段
ALTER TABLE todos 
ADD COLUMN value_level INTEGER DEFAULT 0;

-- 更新当前数据为默认 0 档
UPDATE habits SET value_level = 0;
UPDATE dailies SET value_level = 0;
UPDATE todos SET value_level = 0; 