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


---

## 📅 今日新增项目 (2026-03-14)

本日新增 5 个 GitHub 热门项目的分析和演示。

### 1. skernelx/tavily-key-generator

- **⭐ Stars:** 370
- **💻 语言:** Python
- **🎯 主要功能:** API 服务
- **💡 核心优势:** 创新性强
- **🚀 适用场景:** 后端服务
- **🔗 [GitHub](https://github.com/skernelx/tavily-key-generator)

#### 📝 描述
Auto batch register Tavily API Keys with pluggable email backends

#### 🛠️ Demo
技术栈: Python
位置: demos/tavily-key-generator_2026-03-14/

### 2. hengfengliya/imgood

- **⭐ Stars:** 70
- **💻 语言:** Unknown
- **🎯 主要功能:** 开源项目
- **💡 核心优势:** 创新性强
- **🚀 适用场景:** 通用场景
- **🔗 [GitHub](https://github.com/hengfengliya/imgood)

#### 📝 描述
No description

#### 🛠️ Demo
技术栈: JavaScript
位置: demos/imgood_2026-03-14/

### 3. davis7dotsh/my-sveltekit-template

- **⭐ Stars:** 33
- **💻 语言:** Svelte
- **🎯 主要功能:** 开源项目
- **💡 核心优势:** 创新性强
- **🚀 适用场景:** 通用场景
- **🔗 [GitHub](https://github.com/davis7dotsh/my-sveltekit-template)

#### 📝 描述
Updated as of March 2026: sveltekit, effect v4, convex, tailwind, etc.

#### 🛠️ Demo
技术栈: JavaScript
位置: demos/my-sveltekit-template_2026-03-14/

### 4. fuzzylord-oss/strk-mev-bot

- **⭐ Stars:** 30
- **💻 语言:** TypeScript
- **🎯 主要功能:** 开源项目
- **💡 核心优势:** 创新性强
- **🚀 适用场景:** 通用场景
- **🔗 [GitHub](https://github.com/fuzzylord-oss/strk-mev-bot)

#### 📝 描述
MEV bot for Starknet — sandwich and backrun strategies across Ekubo, JediSwap, Nostra, and 6 more DEXs

#### 🛠️ Demo
技术栈: JavaScript
位置: demos/strk-mev-bot_2026-03-14/

### 5. andforce/Andclaw

- **⭐ Stars:** 29
- **💻 语言:** Java
- **🎯 主要功能:** 开源项目
- **💡 核心优势:** 创新性强
- **🚀 适用场景:** 通用场景
- **🔗 [GitHub](https://github.com/andforce/Andclaw)

#### 📝 描述
无需ROOT，无需连电脑，像Openclaw控制电脑一样，让Andclaw控制你的安卓手机

#### 🛠️ Demo
技术栈: JavaScript
位置: demos/Andclaw_2026-03-14/


---

## 自动化流程## 自动化流程

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
