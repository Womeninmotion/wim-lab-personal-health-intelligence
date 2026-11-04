# WIM Lab #001 — v0.2 修改说明

本版本直接改自用户上传的 Next.js 项目 ZIP，未新建项目或移除原来的 Log / Food / Trends 路由。

## 已修改

- 替换官方 WendyInMotion 横版 Logo，并生成品牌图标，移除临时字标。
- 浏览器标签统一为 `Today | WendyInMotion Health Intelligence` 等格式。
- 明确欢迎 `Wendy`，并支持在 Me 中修改称呼。
- 目标区突出 UTMB 50K、减重目标及 8,000 步；赛事日期可在 Me 中填写，首页自动计算倒计时。
- 目标体重初始为此前讨论的 53 kg，但必须自行确认更新；最新体重为空，不捏造趋势。
- 首页信息顺序和密度优化，昨日五个维度默认摘要，点击后展开。
- 健康案例继续保留供演示，但明确标记不是 Wendy 的真实数据。
- Me 页面新增本地浏览器目标配置；这不等于安全的健康数据存储。

## 尚未实现

- Apple Health / RingConn / COROS / Calendar 自动数据同步
- 私有数据库、用户登录与体检报告上传
- 实时 AI 健康解读、后台提醒与真实外卖点餐

## 使用方法

1. 在 Mac 上备份现有项目文件夹。
2. 解压本 ZIP，将文件同步到原项目目录（不需要重建 GitHub 仓库）。
3. `npm install`（若依赖已安装可跳过），`npm run build` 验证。
4. `npm run dev`，访问 `http://localhost:3000`。
5. 进入 Me 填写 UTMB 赛事日期及确认体重目标。
6. 检查后通过 GitHub Desktop Commit、Push。

## 安全注意

当前仍是公开源码仓库。切勿将医疗报告、真实健康数据、Token 或密钥直接存到 `public/` 或 Git 中。
