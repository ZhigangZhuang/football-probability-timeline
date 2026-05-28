# 新比赛接入流程

这份文档记录当前项目在拿到一场新的 Polymarket 足球比赛后，如何把它做成一条可录屏的胜平负概率时间轴。

当前页面的核心逻辑是：Polymarket 提供胜平负三个 outcome 的历史价格，页面把这些价格理解为 implied probability，再映射到比赛分钟，最后叠加真实进球事件，形成一条“比赛概率叙事可视化”。

## 1. 拿到比赛链接

示例链接：

```txt
https://polymarket.com/zh/sports/epl/epl-eve-mac-2026-05-04
```

从链接里取最后一段作为 slug：

```txt
epl-eve-mac-2026-05-04
```

需要修改两个默认 slug：

```ts
// app/page.tsx
const DEFAULT_POLYMARKET_SLUG = "epl-eve-mac-2026-05-04";

// app/api/polymarket-timeline/route.ts
const DEFAULT_SLUG = "epl-eve-mac-2026-05-04";
```

如果只是临时预览，也可以直接访问：

```txt
/api/polymarket-timeline?slug=新的-slug
```

## 2. 确认比赛基础信息

Polymarket 的 Gamma API 会返回比赛标题、比分、队伍、队徽、开赛时间、终场时间、moneyline 市场等信息。

接口文件在：

```txt
app/api/polymarket-timeline/route.ts
```

当前逻辑会自动做这些事：

- 读取 Polymarket event。
- 找到 `sportsMarketType === "moneyline"` 的三个市场。
- 按队伍 abbreviation 匹配主胜、平局、客胜。
- 读取三个 Yes token 的 `/prices-history`。
- 把价格归一化为 `homeWin / draw / awayWin` 三条概率线。

注意：不要默认相信 moneyline 市场顺序。当前代码已经用队伍缩写匹配主队和客队，避免把客胜误当主胜。

## 3. 补充真实比赛事件

Polymarket 历史价格只提供时间戳和价格，不提供进球、红牌、换人等比赛事件。因此新比赛必须单独补真实事件。

目前主要补进球事件，位置在：

```ts
// app/api/polymarket-timeline/route.ts
const matchConfigs: Record<string, MatchConfig> = {
  "新的-slug": {
    timestampAnchors: (startTs, endTs) => [...],
    goals: [...]
  }
};
```

每个进球事件结构：

```ts
{
  id: "goal-43-doku",
  minute: 43,
  title: "43' 进球",
  subtitle: "多库",
  description: "Man City 0-1",
  avatarUrl: "https://resources.premierleague.com/premierleague/photos/players/250x250/p248875.png",
  team: "away",
  color: "red",
  probabilityKey: "awayWin"
}
```

字段说明：

- `minute`：页面时间轴上的比赛分钟，补时进球可以写成 `90`，标题里写 `90+7' 进球`。
- `title`：事件时间和类型。
- `subtitle`：球员中文名，尽量用中文互联网常见叫法，比如“多库”“哈兰德”。
- `description`：比分变化，比如 `Everton 3-2`。
- `avatarUrl`：左侧事件栏头像。
- `team`：主队事件写 `home`，客队事件写 `away`。
- `color`：主队常用 `green`，客队常用 `red`，平局/点球等可用 `yellow`。
- `probabilityKey`：事件应该贴在哪条曲线上，主队进球通常是 `homeWin`，客队进球通常是 `awayWin`。

如果没有为某场比赛配置 `goals`，页面会退回到自动识别“概率跳变”节点，但这只适合临时预览，不适合最终录屏。

## 4. 配置时间映射

真实比赛不是简单的 90 分钟。中场、伤停补时、VAR、市场反应延迟都会让 Polymarket 时间戳和比赛分钟不完全一致。

所以每场重点比赛都要配置 `timestampAnchors`。

示例：

```ts
timestampAnchors: (startTs, endTs) => [
  { minute: 0, ts: startTs + 60 },
  { minute: 43, ts: startTs + 43 * 60 + 6 },
  { minute: 45, ts: startTs + 46 * 60 },
  { minute: 68, ts: startTs + 87 * 60 + 4 },
  { minute: 73, ts: startTs + 92 * 60 + 4 },
  { minute: 81, ts: startTs + 100 * 60 + 6 },
  { minute: 83, ts: startTs + 102 * 60 + 4 },
  { minute: 90, ts: endTs }
]
```

配置思路：

- `minute: 0` 通常取开赛后约 60 秒，避开刚开盘抖动。
- 上半场进球用 `startTs + 进球分钟 * 60 + 少量秒数`。
- 下半场事件不能直接用 `startTs + minute * 60`，要加上中场休息和补时时间。
- 如果事件卡片和曲线跳变对不上，就微调对应 anchor 的秒数。
- `minute: 90` 通常使用 `finishedTimestamp` 或 `closedTime`，让终场收束准确。

目标不是还原精确到秒的比赛时钟，而是让曲线跳变、事件卡片、视频叙事三者对齐。

## 5. 球员头像来源

英超球员头像可优先尝试：

```txt
https://resources.premierleague.com/premierleague/photos/players/250x250/p球员代码.png
```

示例：

```txt
多库：p248875
杰克·奥布赖恩：p512462
哈兰德：p223094
```

如果官方图加载不到，可以先用占位头像：

```txt
https://ui-avatars.com/api/?name=%E5%B7%B4%E9%87%8C&background=10b981&color=fff&bold=true&size=128
```

页面会把 `avatarUrl` 显示在左侧事件栏。图表上的小事件卡片目前仍以图标和文字为主，避免头像把曲线区域弄乱。

## 6. 视觉检查清单

新比赛接入后，按下面顺序检查：

- 比分是否正确。
- 主队、客队是否没有反。
- 主胜、平局、客胜三条线颜色是否正确。
- 进球事件是否贴在对应球队的概率曲线上。
- 左侧事件栏是否一开始保留，单条事件是否按时间出现。
- 球员中文名是否自然。
- 头像是否能加载。
- 概率标签是否跟在曲线后侧，不遮挡关键曲线。
- 图例是否不压标题、不遮曲线。
- 终场 90+ 的结果是否符合这场比赛的市场结果。

## 7. 运行和验证

开发预览：

```bash
npm run dev -- --port 3005
```

打开：

```txt
http://localhost:3005
```

正式录屏建议打开：

```txt
http://localhost:3005?record=1
```

`record=1` 会隐藏右侧控制台，只保留 16:9 主画面。建议把浏览器窗口或录屏画布设为 1920×1080，浏览器缩放保持 100%。如果后期会被平台二次压缩，可以优先用 2560×1440 或 4K 屏幕录制，再导出 1080p 视频。

检查代码：

```bash
npm run lint
npm run build
```

如果开发预览出现黑屏或 `.next` 缓存异常，先停掉 3005 端口进程，再清理缓存重新启动：

```bash
rm -rf .next
npm run dev -- --port 3005
```

## 8. 新比赛接入最小步骤

1. 从 Polymarket 链接取 slug。
2. 修改 `app/page.tsx` 和 `app/api/polymarket-timeline/route.ts` 的默认 slug。
3. 在 `matchConfigs` 新增该 slug。
4. 查真实进球时间、进球球员、比分变化。
5. 用中文名填写 `goals`。
6. 给进球球员补 `avatarUrl`。
7. 配置 `timestampAnchors`，让事件卡片贴住曲线跳变。
8. 跑页面预览，拖动或播放到关键分钟。
9. 调整卡片位置和时间 anchor。
10. 跑 `npm run lint && npm run build`。

## 9. 内容边界

这个页面是“比赛概率叙事可视化”，不是交易或投注工具。

文案可以使用：

- 概率变化
- 市场预期
- 实时盘口
- 数据可视化

避免使用：

- 买入
- 下注
- 盈利
- 稳赚
- 推荐
- 抄底
- 跟单
