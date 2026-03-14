# Imgood Demo - 简单图片查看器

一个简洁优雅的图片查看和展示 Web 应用。

## Features

- 🖼️ 图片上传（点击或拖放）
- 📊 图片统计信息
- 👁 原图查看模式
- 🗑️ 图片删除功能
- 📱 响应式设计，支持移动端
- ⚡ 纯前端实现，无需服务器

## Setup

无需任何设置！直接打开 HTML 文件即可。

## Run

### 本地打开

```bash
# 直接在浏览器中打开
open index.html

# 或使用 Python 服务器
python3 -m http.server 8000
# 然后访问 http://localhost:8000
```

## Usage

### 1. 上传图片

- **点击上传区域**：选择图片文件
- **拖放图片**：直接将图片拖放到上传区域
- 支持格式：JPG、PNG、GIF

### 2. 查看图片

- 点击"查看"按钮在新标签页打开原图
- 支持任意大小的图片自动缩放

### 3. 管理图片

- 查看统计：图片数量和总大小
- 删除图片：点击"删除"按钮移除

## Technical Details

- **前端框架**：纯 HTML/CSS/JavaScript
- **样式**：内联 CSS，无外部依赖
- **存储**：内存中临时存储（刷新后清除）
- **兼容性**：现代浏览器（Chrome、Firefox、Safari、Edge）

## Project Structure

```
imgood_2026-03-14/
├── index.html    # 单文件应用（HTML + CSS + JS）
└── README.md     # 本文件
```

## Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## Notes

- 纯前端实现，不需要后端服务器
- 图片只在浏览器会话中临时存储
- 刷新页面会清空所有图片
- 支持批量上传多张图片

---

*Demo created for GitHub Trending analysis - 2026-03-14*
