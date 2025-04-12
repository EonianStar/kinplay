-- 为rewards表添加redeemed和redeemed_at字段
ALTER TABLE rewards ADD COLUMN IF NOT EXISTS redeemed BOOLEAN DEFAULT FALSE;
ALTER TABLE rewards ADD COLUMN IF NOT EXISTS redeemed_at TIMESTAMP WITH TIME ZONE;

-- 创建一个索引加速查询已兑换/未兑换奖励
CREATE INDEX IF NOT EXISTS rewards_redeemed_idx ON rewards(redeemed);

-- 注释
COMMENT ON COLUMN rewards.redeemed IS '奖励是否已被兑换';
COMMENT ON COLUMN rewards.redeemed_at IS '奖励兑换的时间'; 