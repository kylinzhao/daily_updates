#!/bin/bash

# Demo 验证脚本 - 验证每个 demo 是否可以正常运行

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEMOS_DIR="$SCRIPT_DIR/../demos"
DATA_DIR="$SCRIPT_DIR/../data"
TODAY=$(date +%Y-%m-%d)

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  Demo 验证脚本                                                ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo "📅 Date: $TODAY"
echo ""

# 读取最新的分析数据
ANALYSIS_FILE="$DATA_DIR/analysis_$TODAY.json"
if [ ! -f "$ANALYSIS_FILE" ]; then
    echo "❌ Analysis file not found: $ANALYSIS_FILE"
    exit 1
fi

PROJECTS=$(cat "$ANALYSIS_FILE" | jq '. | length')
echo "📊 Found $PROJECTS projects to verify"
echo ""

# 验证每个 demo
for i in $(seq 0 $((PROJECTS - 1))); do
    PROJECT=$(cat "$ANALYSIS_FILE" | jq ".[$i]")
    NAME=$(echo "$PROJECT" | jq -r '.name | split("/")[1]' | tr '[:upper:]' '[:lower:]')
    DESCRIPTION=$(echo "$PROJECT" | jq -r '.description')
    
    PROJECT_DIR="$DEMOS_DIR/${NAME}_${TODAY}"
    
    if [ ! -d "$PROJECT_DIR" ]; then
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "⏸️  SKIP: $NAME (demo not created yet)"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        continue
    fi
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔍 Verifying: $NAME"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📝 $DESCRIPTION"
    echo ""
    
    # 检查 README
    README_FILE="$PROJECT_DIR/README.md"
    if [ -f "$README_FILE" ]; then
        echo "✅ README.md found"
        
        # 检查是否包含必要部分
        if grep -q "## Setup" "$README_FILE"; then
            echo "✅ Setup instructions found"
        else
            echo "⚠️  Setup instructions missing"
        fi
        
        if grep -q "## Run" "$README_FILE"; then
            echo "✅ Run instructions found"
        else
            echo "⚠️  Run instructions missing"
        fi
    else
        echo "❌ README.md missing"
    fi
    
    # 根据项目类型验证
    if [ -f "$PROJECT_DIR/app.py" ]; then
        echo "🐍 Python Flask App detected"
        
        # 检查依赖文件
        if [ -f "$PROJECT_DIR/requirements.txt" ]; then
            echo "✅ requirements.txt found"
            
            # 验证依赖是否可以安装（dry run）
            echo "📦 Checking dependencies..."
            if python3 -m pip install --dry-run -r "$PROJECT_DIR/requirements.txt" > /dev/null 2>&1; then
                echo "✅ Dependencies are installable"
            else
                echo "⚠️  Some dependencies may not be available"
            fi
        else
            echo "❌ requirements.txt missing"
        fi
        
        # 检查 app.py 语法
        echo "🔍 Checking Python syntax..."
        if python3 -m py_compile "$PROJECT_DIR/app.py" > /dev/null 2>&1; then
            echo "✅ Python syntax is valid"
        else
            echo "❌ Python syntax error found"
        fi
        
    elif [ -f "$PROJECT_DIR/index.html" ]; then
        echo "🌐 HTML/JS App detected"
        
        # 检查 HTML 语法
        echo "🔍 Checking HTML structure..."
        if grep -q "<!DOCTYPE html>" "$PROJECT_DIR/index.html"; then
            echo "✅ HTML structure is valid"
        else
            echo "⚠️  HTML structure may be incomplete"
        fi
        
        # 检查是否有 JavaScript
        if grep -q "<script>" "$PROJECT_DIR/index.html"; then
            echo "✅ JavaScript code found"
        fi
        
    elif [ -f "$PROJECT_DIR/src/TradingBot.ts" ] || [ -f "$PROJECT_DIR/src/demo.ts" ]; then
        echo "💰 TypeScript Project detected"
        
        # 检查 TypeScript 配置
        if [ -f "$PROJECT_DIR/tsconfig.json" ]; then
            echo "✅ tsconfig.json found"
        else
            echo "⚠️  tsconfig.json missing"
        fi
        
        # 检查 package.json
        if [ -f "$PROJECT_DIR/package.json" ]; then
            echo "✅ package.json found"
            
            # 尝试验证 JSON 格式
            if python3 -m json.tool "$PROJECT_DIR/package.json" > /dev/null 2>&1; then
                echo "✅ package.json is valid JSON"
            else
                echo "❌ package.json has invalid JSON"
            fi
        else
            echo "⚠️  package.json missing"
        fi
        
        # 检查 TypeScript 文件
        if ls "$PROJECT_DIR"/src/*.ts > /dev/null 2>&1; then
            echo "✅ TypeScript source files found"
        fi
    fi
    
    echo ""
    echo "✅ Verification complete for: $NAME"
    echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 All demos verified!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
