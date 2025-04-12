-- 修改user_stats表中的exp字段类型为DECIMAL(10,2)
ALTER TABLE user_stats 
ALTER COLUMN exp TYPE DECIMAL(10, 2);

-- 修改user_stats表中的coins字段类型为DECIMAL(10,2)
ALTER TABLE user_stats 
ALTER COLUMN coins TYPE DECIMAL(10, 2);

-- 增加注释说明
COMMENT ON COLUMN user_stats.exp IS '用户经验值 (小数类型，可保留两位小数)';
COMMENT ON COLUMN user_stats.coins IS '用户金币 (小数类型，可保留两位小数)';

-- 检查是否存在需要修改的数据
-- 如果有现有整数数据，这个修改不会影响数据值
-- 因为INTEGER可以无损转换为DECIMAL 