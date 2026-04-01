#!/usr/bin/env node

/**
 * 测试去重逻辑
 */

const fs = require('fs');
const path = require('path');

const HISTORY_DIR = path.join(__dirname, '../history');

/**
 * 获取过去 5 天已推荐过的项目名称
 */
function getRecentRecommendedProjects(days = 5) {
    const recommendedProjects = new Set();

    for (let i = 1; i <= days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const historyFile = path.join(HISTORY_DIR, `history_${dateStr}.json`);

        if (fs.existsSync(historyFile)) {
            try {
                const historyData = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
                historyData.forEach(project => {
                    recommendedProjects.add(project.name);
                });
            } catch (error) {
                console.error(`读取历史文件 ${historyFile} 失败:`, error.message);
            }
        }
    }

    return recommendedProjects;
}

/**
 * 主函数
 */
function main() {
    console.log('🔍 测试去重逻辑...\n');

    // 获取过去 5 天已推荐过的项目
    const recentProjects = getRecentRecommendedProjects(5);

    console.log(`📋 过去 5 天已推荐 ${recentProjects.size} 个项目\n`);

    // 显示前 10 个项目
    console.log('🔟 前 10 个已推荐的项目：');
    let count = 0;
    recentProjects.forEach(projectName => {
        if (count < 10) {
            console.log(`   ${count + 1}. ${projectName}`);
            count++;
        }
    });

    // 模拟一些候选项目
    const candidateProjects = [
        { full_name: 'anthropics/claude-code' },
        { full_name: 'openai/gpt-4' },
        { full_name: 'facebook/react' },
        { full_name: 'microsoft/typescript' },
        { full_name: 'vuejs/vue' },
        { full_name: 'test/new-project-1' },
        { full_name: 'test/new-project-2' },
        { full_name: 'test/new-project-3' },
    ];

    console.log(`\n🎯 候选项目过滤结果：\n`);
    console.log(`原始候选项目数：${candidateProjects.length}`);

    // 过滤逻辑
    const filteredProjects = candidateProjects.filter(project => {
        const fullName = project.full_name.toLowerCase();

        // 过滤 openclaw 项目
        if (fullName.includes('openclaw')) {
            return false;
        }

        // 过滤过去 5 天已推荐过的项目
        if (recentProjects.has(project.full_name)) {
            return false;
        }

        return true;
    });

    console.log(`过滤后项目数：${filteredProjects.length}`);
    console.log(`过滤掉项目数：${candidateProjects.length - filteredProjects.length}`);

    console.log(`\n✅ 过滤后的项目：`);
    filteredProjects.forEach((project, index) => {
        console.log(`   ${index + 1}. ${project.full_name}`);
    });

    console.log(`\n❌ 被过滤的项目：`);
    candidateProjects.forEach((project, index) => {
        const wasFiltered = !filteredProjects.includes(project);
        if (wasFiltered) {
            const reason = recentProjects.has(project.full_name) ? '过去 5 天已推荐' : '包含 openclaw';
            console.log(`   ✗ ${project.full_name} (${reason})`);
        }
    });

    console.log('\n✅ 去重逻辑测试完成！');
}

main();
