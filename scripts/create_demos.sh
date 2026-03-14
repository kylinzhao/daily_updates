#!/bin/bash

# Demo 创建脚本 - 使用 Claude Code ACP 会话
# 此脚本会在 22:00-10:00 窗口内执行

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DATA_DIR="$SCRIPT_DIR/../data"
DEMOS_DIR="$SCRIPT_DIR/../demos"
TODAY=$(date +%Y-%m-%d)

echo "🚀 Starting demo creation process..."
echo "📅 Date: $TODAY"

# 检查分析数据是否存在
ANALYSIS_FILE="$DATA_DIR/analysis_$TODAY.json"
if [ ! -f "$ANALYSIS_FILE" ]; then
    echo "❌ Analysis file not found: $ANALYSIS_FILE"
    exit 1
fi

echo "📂 Reading analysis data..."
PROJECTS=$(cat "$ANALYSIS_FILE")
NUM_PROJECTS=$(echo "$PROJECTS" | jq '. | length')

echo "✅ Found $NUM_PROJECTS projects to create demos for"

# 为每个项目创建 demo
for i in $(seq 0 $((NUM_PROJECTS - 1))); do
    PROJECT=$(echo "$PROJECTS" | jq ".[$i]")
    NAME=$(echo "$PROJECT" | jq -r '.name | split("/")[1]')
    LANGUAGE=$(echo "$PROJECT" | jq -r '.demo_language')
    DESCRIPTION=$(echo "$PROJECT" | jq -r '.description')
    MAIN_FUNCTION=$(echo "$PROJECT" | jq -r '.main_function')
    
    PROJECT_DIR="$DEMOS_DIR/${NAME}_${TODAY}"
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🛠️ Creating demo for: $NAME"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "💻 Language: $LANGUAGE"
    echo "📝 Description: $DESCRIPTION"
    echo "🎯 Main Function: $MAIN_FUNCTION"
    
    # 创建项目目录
    mkdir -p "$PROJECT_DIR"
    
    # 生成 demo 任务描述
    TASK_DESC="Create a simple, working demo in $LANGUAGE that demonstrates a $MAIN_FUNCTION. 
The demo should be based on this context: $DESCRIPTION.
Requirements:
- Keep it simple and focused
- Include clear README with instructions
- Make it easy to understand and run
- Add comments for key concepts
- Use best practices for $LANGUAGE
- Make it self-contained (no complex dependencies)
- Include a simple example use case"

    echo ""
    echo "🤖 Invoking Claude Code ACP session..."
    
    # 这里会在实际运行时被替换为 ACP 调用
    # 现在只是占位符
    echo "Task: $TASK_DESC"
    echo "Output directory: $PROJECT_DIR"
    
    # TODO: 实际调用 sessions_spawn 来启动 Claude Code
    # 这需要通过 OpenClaw agent 来执行
    
    echo "✅ Demo task queued for $NAME"
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 All demo tasks queued successfully!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
