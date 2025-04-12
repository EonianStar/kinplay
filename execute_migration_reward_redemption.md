# 奖励兑换功能数据库迁移指南

本文档指导如何将奖励兑换功能所需的数据库迁移应用到 Supabase 项目中。

## 迁移内容

此次迁移将为奖励表添加以下字段:

1. `redeemed` - 布尔值，表示奖励是否已被兑换（默认为 false）
2. `redeemed_at` - 时间戳，记录奖励被兑换的时间

同时，新增一个索引以加速查询已兑换/未兑换状态的奖励列表。

## 执行步骤

1. 登录 Supabase 控制台
2. 进入项目 -> SQL 编辑器
3. 选择 "New Query" 创建新查询
4. 复制粘贴 `sql/rewards_redemption_migration.sql` 文件中的内容
5. 点击 "Run" 执行 SQL 语句
6. 验证迁移是否成功：检查 rewards 表是否有新增的 `redeemed` 和 `redeemed_at` 字段

## 验证迁移

执行以下查询确认表结构是否已更新：

```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'rewards';
```

确认表中存在以下字段：
- `redeemed` (BOOLEAN 类型, 默认值为 false)
- `redeemed_at` (TIMESTAMP WITH TIME ZONE 类型)

## 使用方法

迁移完成后，更新的 rewards 表支持：

1. 检索待兑换的奖励：
```sql
SELECT * FROM rewards WHERE redeemed = false;
```

2. 检索已兑换的奖励：
```sql
SELECT * FROM rewards WHERE redeemed = true;
```

3. 兑换奖励（在应用代码中使用）：
```sql
UPDATE rewards 
SET redeemed = true, redeemed_at = now() 
WHERE id = :reward_id AND user_id = :user_id;
```

## 问题排查

如果遇到问题，可以尝试以下步骤：

1. 确认 SQL 语句执行没有返回错误
2. 检查 Supabase SQL 编辑器的日志输出
3. 确认当前用户具有修改表结构的权限
4. 如果使用了 RLS 策略，确保没有干扰表结构的更新 