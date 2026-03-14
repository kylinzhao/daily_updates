#!/bin/bash

# Demo 推送脚本 - 检查 demo 完成状态并推送到 GitHub

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$SCRIPT_DIR/.."
DATA_DIR="$SCRIPT_DIR/../data"
DEMOS_DIR="$SCRIPT_DIR/../demos"
TODAY=$(date +%Y-%m-%d)

echo "╔══════════════════════════════════════════════════════════╗"
echo "║  Final Report and Push                                       ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo "📅 Date: $TODAY"
echo ""

# 检查是否所有 demo 都已完成
ANALYSIS_FILE="$DATA_DIR/analysis_$TODAY.json"

if [ ! -f "$ANALYSIS_FILE" ]; then
    echo "❌ Analysis file not found"
    exit 1
fi

# 使用 Node.js 读取 JSON
NUM_PROJECTS=$(node -p "const fs=require('fs'); const data=JSON.parse(fs.readFileSync('$ANALYSIS_FILE','utf8')); console.log(data.length);")

echo "📊 Total projects: $NUM_PROJECTS"

# 检查已完成的 demos
NUM_DEMOS=$(find "$DEMOS_DIR" -maxdepth 1 -type d -name "*_${TODAY}" 2>/dev/null | wc -l)

echo "📁 Completed demos: $NUM_DEMOS"

if [ "$NUM_DEMOS" -ge "$NUM_PROJECTS" ]; then
    echo "✅ All demos completed"
else
    echo "⚠️  Some demos may be pending ($NUM_DEMOS/$NUM_PROJECTS)"
fi

echo ""

# 推送到 GitHub
cd "$REPO_DIR"

echo "🔄 Adding files to git..."
git add -A

if git diff --cached --quiet; then
    echo "ℹ️ No changes to commit"
    exit 0
fi

COMMIT_MSG="Daily update - $TODAY

- GitHub trending analysis
- Project demos
- Daily report
- Demo hub index

Generated: $TODAY"

echo "📝 Committing changes..."
git commit -m "$COMMIT_MSG"

echo "🚀 Pushing to GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed to GitHub"
    echo ""
    echo "🔗 Repository: https://github.com/kylinzhao/daily_updates"
else
    echo "❌ Failed to push to GitHub"
    exit 1
fi
