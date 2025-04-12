# 执行数据库字段类型迁移

## 方法1：通过Supabase控制台执行

1. 登录[Supabase控制台](https://app.supabase.io)
2. 选择你的项目
3. 进入"SQL编辑器"
4. 创建一个新的查询
5. 复制以下SQL代码到查询编辑器中：

```sql
-- 修改user_stats表中的exp字段类型为DECIMAL(10,2)
ALTER TABLE user_stats 
ALTER COLUMN exp TYPE DECIMAL(10, 2);

-- 修改user_stats表中的coins字段类型为DECIMAL(10,2)
ALTER TABLE user_stats 
ALTER COLUMN coins TYPE DECIMAL(10, 2);

-- 增加注释说明
COMMENT ON COLUMN user_stats.exp IS '用户经验值 (小数类型，可保留两位小数)';
COMMENT ON COLUMN user_stats.coins IS '用户金币 (小数类型，可保留两位小数)';
```

6. 点击"运行"按钮执行SQL

## 方法2：使用Supabase CLI

如果你已安装并配置了Supabase CLI，可以使用以下命令：

```bash
supabase db push decimal_migration.sql
```

## 迁移后验证

执行完迁移后，可以通过以下SQL查询验证字段类型是否已成功修改：

```sql
SELECT 
  column_name, 
  data_type 
FROM 
  information_schema.columns 
WHERE 
  table_name = 'user_stats' 
  AND column_name IN ('exp', 'coins');
```

应该会显示两个字段的data_type都是"numeric"类型。 