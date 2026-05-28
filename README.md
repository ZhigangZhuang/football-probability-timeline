# football-probability-timeline

横版短视频风格的足球比赛胜平负概率走势可视化。当前版本会默认加载 Everton FC vs. Manchester City FC 这场 Polymarket 真实历史价格；如果接口失败，会保留 mock 数据兜底。

## 运行

```bash
npm install
npm run dev
```

打开本地页面后，会看到一个居中的 16:9 横版视频画面，左右保留留白，适合横屏录屏和剪辑。

录屏建议使用专门的录屏模式：

```txt
http://localhost:3005?record=1
```

录屏模式会隐藏右侧控制台，只保留 16:9 主画面，并允许画布在大窗口下接近 1920×1080。发布到小红书、抖音前，建议用 1920×1080 或更高分辨率录屏，浏览器缩放保持 100%。

## 已实现

- 横版 16:9 数据海报布局
- 每分钟 mock 概率数据，0 到 90 分钟共 91 个点
- 主胜、平局、客胜三条动态折线
- 当前比赛时间指针
- 进球、点球、红牌、绝杀事件卡片
- 终场结果标签
- 重新播放、事件显示开关、主题切换、PNG 导出
- 进度拖动查看任意分钟
- Polymarket API 接口结构预留
- 默认通过 `/api/polymarket-timeline?slug=epl-eve-mac-2026-05-04` 加载真实历史价格
- 左侧事件栏按比赛时间逐条显示进球事件，并支持球员头像

## 新比赛接入流程

拿到一场新的 Polymarket 比赛后，建议按这份文档接入：

```txt
docs/new-match-workflow.md
```

重点步骤是：从链接取 slug、确认真实进球事件、补中文球员名和头像、配置比赛分钟到真实时间戳的映射、最后检查事件卡片是否贴住概率跳变。

## Polymarket 接入说明

Polymarket 文档说明，公开市场数据无需认证；`outcomePrices` 与 `outcomes` 一一对应，可作为 implied probability 理解。CLOB 的历史价格接口会返回 timestamp + price，后续接真实数据时需要把真实时间戳映射到比赛分钟，再转换为页面使用的 `ProbabilityPoint`。

当前页面只做“概率叙事可视化”，不包含交易、投注或推荐逻辑。

## 当前真实数据示例

默认 slug：

```txt
epl-eve-mac-2026-05-04
```

来源页面：

```txt
https://polymarket.com/zh/sports/epl/epl-eve-mac-2026-05-04
```

该页面的 Moneyline 市场是三个独立 Yes/No 市场：Everton 胜、平局、Man City 胜。应用读取三个 Yes token 的 `/prices-history`，再归一化为主胜/平局/客胜三条概率线。

时间轴不是把开赛到终场的真实时间简单压缩到 90 分钟，而是按比赛时钟分段校准：开场、关键进球反应点、半场、补时和终场。

注意：Polymarket 历史价格提供的是时间戳和价格，不包含进球、红牌等比赛事件时间。因此 Everton vs Man City 这场使用单独补入的真实进球节点，并把卡片贴到对应价格变动附近；其他未配置事件的比赛会退回到自动识别“概率跳变”节点。
