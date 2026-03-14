# Daily Updates - GitHub Trending Projects

每日自动抓取和分析 GitHub 热门项目，生成报告并创建 Demo。

## 功能

- 每日自动抓取最近 24 小时 GitHub 热门项目（Top 5）
- 分析项目功能、优势、适用场景
- 使用 Claude Code 自动生成 Demo
- 生成每日报告并推送到 GitHub 仓库
- 通过飞书发送每日报告

## 目录结构

```
daily_updates/
├── daily/              # 每日报告（按日期组织）
├── demos/              # 项目 Demo 代码
├── scripts/            # 自动化脚本
└── README.md          # 项目说明
```

## 环境配置

在运行脚本前，设置 GitHub Token：

```bash
# 复制示例文件
cp .env.example .env

# 编辑 .env 文件，填入你的 GitHub Token
# 或者直接设置环境变量
export GITHUB_TOKEN=your_token_here
```

## 自动化流程

- **22:00** - 启动 GitHub Trending 抓取
- **22:00-10:00** - Demo 开发窗口（使用 Claude Code）
- **10:00** - 生成综合报告并推送到 GitHub + 飞书通知

## 安全说明

- **严禁硬编码**：所有敏感信息必须通过环境变量传入
- **Secret Scanning**：GitHub 会自动扫描提交中的敏感信息
- **.gitignore**：确保敏感文件不被提交到仓库

## 技术栈

- Node.js/Python - Demo 开发
- GitHub API - 数据抓取
- OpenClaw ACP - Claude Code 集成
- Feishu - 报告推送

---

*此仓库由 OpenClaw 自动维护*
