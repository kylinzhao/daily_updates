#!/bin/bash

# 主运行脚本 - 协调整个每日更新流程

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$SCRIPT_DIR/../logs"
REPO_DIR="$SCRIPT_DIR/.."

# 创建日志目录
mkdir -p "$LOG_DIR"

TODAY=$(date +%Y-%m-%d)
TIME=$(date +%H:%M:%S)
LOG_FILE="$LOG_DIR/daily_${TODAY}.log"

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  Daily Updates Runner                                          ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo "📅 Date: $TODAY"
echo "🕐 Time: $TIME"
echo "📄 Log: $LOG_FILE"
echo ""

# 记录日志函数
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Git 推送函数
git_push() {
    cd "$REPO_DIR"
    
    log "🔄 Adding files to git..."
    git add -A
    
    if git diff --cached --quiet; then
        log "ℹ️ No changes to commit"
        return 0
    fi
    
    COMMIT_MSG="Daily update - $TODAY
    
- GitHub trending analysis
- Project demos
- Daily report"

    log "📝 Committing changes..."
    git commit -m "$COMMIT_MSG"
    
    log "🚀 Pushing to GitHub..."
    git push origin main
    
    log "✅ Successfully pushed to GitHub"
}

# 阶段 1: 抓取 trending 项目 (22:00)
phase1_fetch() {
    log "📍 Phase 1: Fetching GitHub trending projects (v2)..."

    node "$SCRIPT_DIR/fetch_trending_v2.js" >> "$LOG_FILE" 2>&1

    if [ $? -eq 0 ]; then
        log "✅ Phase 1 completed successfully"
    else
        log "❌ Phase 1 failed"
        exit 1
    fi
}

# 阶段 2: 分析和报告 (紧接阶段 1)
phase2_analyze() {
    log "📍 Phase 2: Analyzing projects and generating report..."
    
    node "$SCRIPT_DIR/analyze_and_report.js" >> "$LOG_FILE" 2>&1
    
    if [ $? -eq 0 ]; then
        log "✅ Phase 2 completed successfully"
    else
        log "❌ Phase 2 failed"
        exit 1
    fi
}

# 阶段 3: 创建 demos (22:00-10:00)
phase3_demos() {
    log "📍 Phase 3: Creating demos with Claude Code..."
    log "⏰ Demo creation window: 22:00 - 10:00"
    
    # 这个阶段会通过 OpenClaw agent 来执行
    # 调用 sessions_spawn 来启动 Claude Code ACP 会话
    log "⚠️ Demo creation will be handled by OpenClaw ACP sessions"
    
    log "✅ Phase 3 completed successfully"
}

# 阶段 4: 最终报告和推送 (10:00)
phase4_report() {
    log "📍 Phase 4: Final report and push..."
    
    # 检查是否所有 demo 都已完成
    DATA_DIR="$SCRIPT_DIR/../data"
    DEMOS_DIR="$SCRIPT_DIR/../demos"
    ANALYSIS_FILE="$DATA_DIR/analysis_$TODAY.json"
    
    if [ -f "$ANALYSIS_FILE" ]; then
        NUM_PROJECTS=$(cat "$ANALYSIS_FILE" | jq '. | length')
        NUM_DEMOS=$(ls -1 "$DEMOS_DIR" 2>/dev/null | grep "$TODAY" | wc -l)
        
        log "📊 Projects: $NUM_PROJECTS, Demos: $NUM_DEMOS"
        
        if [ "$NUM_DEMOS" -ge "$NUM_PROJECTS" ]; then
            log "✅ All demos completed"
        else
            log "⚠️ Some demos may be pending"
        fi
    fi
    
    # 推送到 GitHub
    git_push
    
    log "✅ Phase 4 completed successfully"
}

# 主流程
main() {
    log "🚀 Starting daily update process..."
    
    case "$1" in
        fetch)
            phase1_fetch
            ;;
        analyze)
            phase2_analyze
            ;;
        demos)
            phase3_demos
            ;;
        report)
            phase4_report
            ;;
        all)
            phase1_fetch
            sleep 2
            phase2_analyze
            sleep 2
            phase3_demos
            ;;
        *)
            echo "Usage: $0 {fetch|analyze|demos|report|all}"
            echo ""
            echo "Commands:"
            echo "  fetch    - Phase 1: Fetch trending projects"
            echo "  analyze  - Phase 2: Analyze and generate report"
            echo "  demos    - Phase 3: Create demos (via Claude Code)"
            echo "  report   - Phase 4: Final report and push"
            echo "  all      - Run all phases"
            exit 1
            ;;
    esac
    
    log "🎉 Daily update process completed!"
}

main "$@"
