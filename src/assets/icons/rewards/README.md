# 奖励图标集

这个目录包含了所有用于奖励系统的 SVG 图标。

## 来源
- 图标来自 [Streamline](https://www.streamlinehq.com/)
- 使用渐变风格的 SVG 格式图标
- 来自 Ultimate Colors 或 Ultimate Duotone 系列

## 命名规则
- 所有图标文件名使用小写字母
- 单词之间使用连字符 `-` 分隔（例如：`credit-card.svg`）
- 命名应当简洁明了，表示图标的含义

## 当前图标列表
1. `bag.svg` - 包
2. `book.svg` - 书籍
3. `camping.svg` - 露营
4. `chat.svg` - 聊天
5. `device.svg` - 设备
6. `dice.svg` - 骰子
7. `dictionary.svg` - 字典
8. `discount.svg` - 折扣
9. `fireworks.svg` - 烟花
10. `game.svg` - 游戏
11. `gourmet.svg` - 美食
12. `increase.svg` - 增长
13. `music.svg` - 音乐
14. `peace.svg` - 和平
15. `pen.svg` - 钢笔
16. `photo.svg` - 照片
17. `production.svg` - 生产
18. `puzzle.svg` - 拼图
19. `robot.svg` - 机器人
20. `school.svg` - 学校
21. `smirk.svg` - 假笑
22. `snorkle.svg` - 潜水
23. `spring.svg` - 春天
24. `sprout.svg` - 发芽
25. `store.svg` - 商店
26. `telescope.svg` - 望远镜
27. `ticket.svg` - 票
28. `toy.svg` - 玩具
29. `travel.svg` - 旅行
30. `vr.svg` - 虚拟现实
31. `watch.svg` - 手表
32. `wave.svg` - 波浪

## 使用方法

### 1. 在 React 组件中使用图标

```tsx
import RewardIcon from '@/components/icons/RewardIcon';

// 在组件中使用
<RewardIcon name="game" className="h-6 w-6" />
```

### 2. 添加新图标

1. 从 Streamline 下载 SVG 格式的图标
2. 将图标文件放在 `src/assets/icons/rewards/` 目录下
3. 文件命名遵循命名规则
4. 必要时修改 `DEFAULT_ICONS` 数组（位于 `src/types/reward.ts`）

### 3. 自定义图标颜色

所有图标使用渐变色，可通过修改 SVG 中的 `linearGradient` 元素来改变颜色：

```xml
<linearGradient id="paint0_linear" x1="3" y1="15" x2="21" y2="15" gradientUnits="userSpaceOnUse">
  <stop stop-color="#4facfe"/>  <!-- 起始颜色 -->
  <stop offset="1" stop-color="#00f2fe"/>  <!-- 结束颜色 -->
</linearGradient>
```

## 注意事项

1. 所有图标应保持 24x24 像素的尺寸
2. 图标风格应保持一致
3. 确保图标 SVG 代码经过优化，移除不必要的属性
4. 优先使用语义化的命名方式 