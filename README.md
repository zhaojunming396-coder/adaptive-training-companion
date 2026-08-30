# Adaptive Training Companion v0.5 工作副本

这是当前任务中整理出来的健身训练软件工作副本。它把旧版本里的完整训练记录系统、重量推荐、训练分析、档案/备份，以及后续的蛋白质/补剂记录合并到一个可继续开发的版本里。

作品集方向建议使用英文项目名：

**Adaptive Training Companion**

核心叙事不是“普通健身记录 App”，而是：

> 将个人训练数据转化为可理解、可行动的下一次训练反馈。

## 当前已实现功能

- 今日训练：按 4 天训练计划自动显示今日训练或休息日。
- 手动选择训练日：支持上肢 A、下肢 A、上肢 B、下肢 B、有氧核心和休息日。
- 训练详情：展示热身、动作目标、主练肌群、动作步骤和安全提示。
- 训练记录：按目标组数填写重量、次数、RIR、时长、距离和完成状态。
- 保存校验：已完成组必须补齐关键数据，避免影响后续分析。
- 休息倒计时：完成一组后按动作目标休息时间启动倒计时。
- 上次训练参考：训练中显示同一动作的上次完成记录。
- 建议重量：基于历史记录和用户基准力量给出保守建议重量/时长。
- 我的档案：保存身高、体重、训练年限、力量水平和基准力量。
- 器械配重档位：支持哑铃、杠铃、绳索、固定器械的重量档位设置。
- 训练历史：本地保存并回看每次训练记录。
- 数据分析：显示训练概览、容量趋势、动作表现和 PR 记录。
- 蛋白质/补剂：记录每日蛋白质目标、蛋白粉、肌酸、鱼油、姜黄素。
- 数据备份：导出/导入本地 JSON，覆盖训练、档案、设置、营养和补剂数据。

## 当前项目边界

- 这是手机端 H5 原型，不是原生 App。
- 数据保存在浏览器本地缓存，没有账号系统和云同步。
- 建议重量是保守规则，不是医疗、营养或专业教练处方。
- 还没有真正的 AI 模型调用，当前更准确地说是规则驱动的 adaptive recommendation。
- 还缺少作品集需要的 research、用户测试、开发过程截图和最终 case study。

## 启动方式

在当前任务目录运行静态服务：

```bash
python3 -m http.server 8031 --bind 127.0.0.1 --directory work/fitness-app
```

本机访问：

```text
http://127.0.0.1:8031/src/pages/workouts/index.html
```

## 核心文件

- 页面入口与样式：`src/pages/workouts/index.html`
- 页面路由：`src/pages/workouts/main.js`
- 今日训练页：`src/pages/workouts/todayPage.js`
- 训练详情页：`src/pages/workouts/trainingDetailPage.js`
- 训练记录页：`src/pages/workouts/workoutRecordPage.js`
- 训练历史页：`src/pages/workouts/workoutHistoryPage.js`
- 我的档案页：`src/pages/workouts/profilePage.js`
- 数据分析页：`src/pages/workouts/analyticsPage.js`
- 补剂/蛋白质页：`src/pages/workouts/nutritionPage.js`
- 数据备份页：`src/pages/workouts/backupPage.js`
- 训练计划数据：`src/data/trainingPlans/bodyRecomposition4DayPlan.js`
- 动作库数据：`src/data/exercises/exercises.js`
- 训练记录逻辑：`src/data/workouts/workoutSession.js`
- 建议重量逻辑：`src/data/workouts/weightRecommendation.js`
- 数据分析逻辑：`src/data/workouts/workoutAnalytics.js`
- 营养补剂逻辑：`src/data/workouts/dailyNutrition.js`
- 本地备份逻辑：`src/data/workouts/localBackup.js`

## 下一步作品集改造重点

1. 把首页从“训练工具”升级为“数据驱动训练反馈”的清晰体验。
2. 增加更明显的下一次训练建议：保持、加重量、加次数、降低强度。
3. 增加过程证据页面或文档：用户问题、流程图、数据结构、推荐逻辑、测试反馈。
4. 录制 30-60 秒 demo，用于 UAL/Southampton 作品集。
5. 整理 6-8 页 case study，把项目讲成 Creative AI / Web Product，而不是普通记录器。
