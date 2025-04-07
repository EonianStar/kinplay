-- 创建奖励(rewards)表
CREATE TABLE IF NOT EXISTS rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50) NOT NULL,
  price BIGINT NOT NULL DEFAULT 10 CHECK (price > 0 AND price <= 2147483647),
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 添加RLS策略
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;

-- 创建仅允许用户访问自己数据的策略
CREATE POLICY "Users can only access their own rewards"
  ON rewards
  FOR ALL
  USING (auth.uid() = user_id);

-- 创建触发器，在更新时自动更新updated_at字段
CREATE OR REPLACE FUNCTION update_rewards_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rewards_updated_at
BEFORE UPDATE ON rewards
FOR EACH ROW
EXECUTE FUNCTION update_rewards_updated_at();

-- 创建索引以提高查询性能
CREATE INDEX rewards_user_id_idx ON rewards(user_id);
CREATE INDEX rewards_price_idx ON rewards(price);
CREATE INDEX rewards_position_idx ON rewards(position);
