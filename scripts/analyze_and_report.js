#!/usr/bin/env node

/**
 * 项目分析脚本 - 深度分析 GitHub 项目
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const DAILY_DIR = path.join(__dirname, '../daily');

// 确保目录存在
[DATA_DIR, DAILY_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

/**
 * 获取最近 7 天出现过的项目名称
 */
function getRecentProjectNames() {
    const recentProjects = new Set();
    const today = new Date();

    // 检查最近 7 天（包括今天）
    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const reportFile = path.join(DAILY_DIR, `report_${dateStr}.md`);

        if (fs.existsSync(reportFile)) {
            const reportContent = fs.readFileSync(reportFile, 'utf8');
            // 提取项目名称（格式：## 1. owner/repo）
            const projectMatches = reportContent.match(/## \d+\. ([^\n]+)/g);
            if (projectMatches) {
                projectMatches.forEach(match => {
                    const projectName = match.replace(/## \d+\.\s+/, '');
                    recentProjects.add(projectName);
                });
            }
        }
    }

    return recentProjects;
}

function generateDetailedReport(projects, date) {
    let report = '# GitHub Trending 深度分析报告 - ' + date + '\n\n';
    report += '本报告对 GitHub Trending 项目进行了深度技术分析，基于项目描述和多维度评估。\n\n';
    report += '**筛选算法：** 综合评分 = log(绝对增长 + 1) + 0.3 × log(基础规模 + 1)\n\n';
    report += '---\n\n';

    // 获取最近 7 天的项目
    const recentProjects = getRecentProjectNames();

    projects.forEach((project, index) => {
        const isRecent = recentProjects.has(project.name);
        const reportName = index + 1;
        report += '## ' + reportName + '. ' + project.name + '\n\n';

        // 如果项目在最近 7 天已经出现过，只简要提及
        if (isRecent) {
            report += '> **📌 该项目最近 7 天已分析过，此处仅简要提及**\n\n';
        }

        // 基本信息
        report += '### 📊 项目数据\n\n';
        report += '- **⭐ Stars:** ' + project.stars + '\n';
        report += '- **📈 增长:** +' + project.deltaStars + ' (' + (project.growthRate * 100).toFixed(2) + '%)\n';
        report += '- **🎯 综合评分:** ' + project.score.toFixed(4) + '\n';
        report += '- **💻 语言:** ' + project.language + '\n';
        report += '- **🔗 [GitHub](' + project.url + ')\n';
        report += '- **📅 创建时间:** ' + new Date(project.created_at).toLocaleDateString('zh-CN') + '\n';
        report += '- **🔄 更新时间:** ' + new Date(project.updated_at).toLocaleDateString('zh-CN') + '\n\n';

        // 如果项目在最近 7 天已分析过，跳过详细分析
        if (isRecent) {
            report += '---\n\n';
            return;
        }

        // 基本信息
        report += '### 📊 项目数据\n\n';
        report += '- **⭐ Stars:** ' + project.stars + '\n';
        report += '- **📈 增长:** +' + project.deltaStars + ' (' + (project.growthRate * 100).toFixed(2) + '%)\n';
        report += '- **🎯 综合评分:** ' + project.score.toFixed(4) + '\n';
        report += '- **💻 语言:** ' + project.language + '\n';
        report += '- **🔗 [GitHub](' + project.url + ')\n';
        report += '- **📅 创建时间:** ' + new Date(project.created_at).toLocaleDateString('zh-CN') + '\n';
        report += '- **🔄 更新时间:** ' + new Date(project.updated_at).toLocaleDateString('zh-CN') + '\n\n';

        // 描述
        report += '### 📝 项目描述\n\n';
        report += project.description + '\n\n';
        
        // 主要功能
        report += '### 🎯 核心功能\n\n';
        const mainFunction = inferMainFunction(project.name, project.description, project.language);
        report += '**' + mainFunction + '**\n\n';
        
        // 技术栈
        report += '### 💻 技术栈\n\n';
        report += '**编程语言:** ' + project.language + '\n\n';
        
        // 核心优势
        report += '### 💡 核心优势\n\n';
        const advantages = generateAdvantages(project.stars, project.description);
        advantages.forEach(adv => {
            report += '- ' + adv + '\n';
        });
        report += '\n';
        
        // 适用场景
        report += '### 🚀 适用场景\n\n';
        const useCases = generateUseCases(project.name, project.description, project.language);
        useCases.forEach(uc => {
            report += '- ' + uc + '\n';
        });
        report += '\n';
        
        report += '---\n\n';
    });
    
    // 总结
    report += '## 📊 总结\n\n';
    
    // 技术分布
    report += '### 技术栈分布\n\n';
    const langCount = {};
    projects.forEach(p => {
        const lang = p.language || 'Unknown';
        langCount[lang] = (langCount[lang] || 0) + 1;
    });
    
    Object.entries(langCount).forEach(([lang, count]) => {
        report += '- **' + lang + ':** ' + count + ' 个项目\n';
    });
    report += '\n';

    // 增长统计
    const totalDelta = projects.reduce((sum, p) => sum + p.deltaStars, 0);
    const avgGrowthRate = projects.reduce((sum, p) => sum + p.growthRate, 0) / projects.length;
    report += '### 增长统计\n\n';
    report += '- **总增长：** +' + totalDelta + ' stars\n';
    report += '- **平均增长率：** ' + (avgGrowthRate * 100).toFixed(2) + '%\n\n';

    // 增长最快的项目
    const fastestGrowing = projects.reduce((best, current) => {
        return current.growthRate > best.growthRate ? current : best;
    }, projects[0]);

    if (fastestGrowing) {
        report += '### 🚀 增长最快项目\n\n';
        report += '**' + fastestGrowing.name + '** 增长最快（+' + fastestGrowing.deltaStars + ' stars，' + (fastestGrowing.growthRate * 100).toFixed(2) + '%）。\n\n';
    }

    // 综合评分最高的项目
    const highestScored = projects.reduce((best, current) => {
        return current.score > best.score ? current : best;
    }, projects[0]);

    if (highestScored) {
        report += '### 🏆 综合评分最高项目\n\n';
        report += '**' + highestScored.name + '** 获得最高的综合评分（' + highestScored.score.toFixed(4) + '）。\n\n';
    }

    // 最佳项目
    const best = projects.reduce((b, current) => {
        return (current.stars || 0) > (b.stars || 0) ? current : b;
    }, projects[0]);

    if (best) {
        report += '### 🌟 最受关注项目\n\n';
        report += '**' + best.name + '** 获得了最高的关注度（' + (best.stars || 0) + ' stars）。\n\n';
    }
    
    report += '---\n\n';
    report += '*本报告由 OpenClaw 自动生成*\n';
    report += '*生成时间: ' + new Date().toISOString() + '*\n';
    
    return report;
}

function inferMainFunction(name, description, language) {
    const desc = (description || '').toLowerCase();
    const lang = (language || '').toLowerCase();
    
    if (desc.includes('api')) {
        return 'API 服务';
    } else if (desc.includes('framework') || desc.includes('template')) {
        return '开发框架/模板';
    } else if (desc.includes('tool') || desc.includes('cli')) {
        return '开发工具';
    } else if (desc.includes('bot') || desc.includes('automation')) {
        return '自动化系统';
    } else if (desc.includes('agent') || desc.includes('assistant')) {
        return 'AI 助手/智能体';
    } else if (desc.includes('domain') || desc.includes('free')) {
        return '域名/服务工具';
    } else if (desc.includes('system') || desc.includes('prompts')) {
        return '系统工具/提示词库';
    } else if (desc.includes('code') && (desc.includes('agent') || desc.includes('agent'))) {
        return '代码智能体';
    } else if (desc.includes('coding')) {
        return '编程辅助工具';
    } else {
        return '开源项目';
    }
}

function generateAdvantages(stars, description) {
    const advantages = [];
    const desc = (description || '').toLowerCase();
    
    // 社区优势
    if (stars > 100000) {
        advantages.push('超高社区关注度（10万+ stars）');
    } else if (stars > 50000) {
        advantages.push('超高社区认可度（5万+ stars）');
    } else if (stars > 20000) {
        advantages.push('高社区关注度（2万+ stars）');
    } else if (stars > 10000) {
        advantages.push('高社区认可度（1万+ stars）');
    } else if (stars > 5000) {
        advantages.push('活跃的开发社区（5千+ stars）');
    } else if (stars > 1000) {
        advantages.push('活跃社区');
    }
    
    // 技术优势
    if (desc.includes('fast') || desc.includes('performance')) {
        advantages.push('性能优化');
    }
    if (desc.includes('scalable') || desc.includes('scale')) {
        advantages.push('可扩展性强');
    }
    if (desc.includes('simple') || desc.includes('easy')) {
        advantages.push('易于使用');
    }
    if (desc.includes('any') || desc.includes('platform')) {
        advantages.push('跨平台支持');
    }
    if (desc.includes('api') || desc.includes('service')) {
        advantages.push('API 驱动架构');
    }
    if (desc.includes('cli') || desc.includes('terminal')) {
        advantages.push('命令行交互友好');
    }
    
    // 创新优势
    if (desc.includes('ai') || desc.includes('ml')) {
        advantages.push('AI/ML 集成');
    }
    if (desc.includes('novel') || desc.includes('unique')) {
        advantages.push('创新性方案');
    }
    if (desc.includes('open')) {
        advantages.push('开源免费');
    }
    if (desc.includes('personal')) {
        advantages.push('个性化定制');
    }
    
    if (advantages.length === 0) {
        advantages.push('开源免费', '功能完整', '社区活跃');
    }
    
    return [...new Set(advantages)]; // 去重
}

function generateUseCases(name, description, language) {
    const useCases = [];
    const desc = (description || '').toLowerCase();
    const lang = (language || '').toLowerCase();
    
    // 基于名称的推断
    const nameLower = name.toLowerCase();
    
    if (nameLower.includes('openclaw') || desc.includes('assistant') || desc.includes('agent')) {
        useCases.push('个人 AI 助手部署');
        useCases.push('自定义 AI 智能体开发');
        useCases.push('跨平台自动化控制');
    } else if (nameLower.includes('domain') || desc.includes('domain')) {
        useCases.push('域名注册和管理');
        useCases.push('域名搜索和发现');
        useCases.push('网站搭建辅助');
    } else if (nameLower.includes('system') || desc.includes('system') || desc.includes('prompts')) {
        useCases.push('AI 提示词库管理');
        useCases.push('系统提示词模板');
        useCases.push('AI 工具集成');
    } else if (nameLower.includes('coding') || desc.includes('coding') || nameLower.includes('opencode')) {
        useCases.push('代码辅助和智能编程');
        useCases.push('开发效率提升');
        useCases.push('智能代码生成');
    } else if (desc.includes('api')) {
        useCases.push('API 服务开发');
        useCases.push('后端服务构建');
        useCases.push('第三方集成');
    } else if (desc.includes('tool') || desc.includes('cli')) {
        useCases.push('命令行工具开发');
        useCases.push('自动化脚本编写');
        useCases.push('开发效率工具');
    }
    
    // 基于语言的通用场景
    if (lang.includes('python')) {
        useCases.push('Python 应用开发');
        useCases.push('数据处理和自动化');
        useCases.push('机器学习集成');
    } else if (lang.includes('typescript')) {
        useCases.push('类型安全开发');
        useCases.push('大型应用架构');
        useCases.push('全栈开发');
    } else if (lang.includes('javascript') || lang.includes('html')) {
        useCases.push('Web 应用开发');
        useCases.push('前端框架学习');
        useCases.push('快速原型开发');
    }
    
    if (useCases.length === 0) {
        useCases.push('通用开发和学习场景');
        useCases.push('快速原型开发');
        useCases.push('技术学习和研究');
    }
    
    return [...new Set(useCases)]; // 去重
}

async function main() {
    try {
        console.log('╔════════════════════════════════════════════════════════╗');
        console.log('║  GitHub Trending 深度分析报告生成器                      ║');
        console.log('╚════════════════════════════════════════════════════════╝');
        console.log('');
        
        const today = new Date().toISOString().split('T')[0];
        const trendingFile = path.join(DATA_DIR, `trending_${today}.json`);
        
        if (!fs.existsSync(trendingFile)) {
            console.log('❌ Trending 数据文件不存在');
            console.log('路径: ' + trendingFile);
            process.exit(1);
        }
        
        console.log('📂 读取 Trending 数据...');
        const projects = JSON.parse(fs.readFileSync(trendingFile, 'utf8'));
        console.log('✅ 找到 ' + projects.length + ' 个项目\n');
        
        // 生成详细报告
        console.log('📄 生成深度分析报告...');
        const reportContent = generateDetailedReport(projects, today);
        const reportFile = path.join(DAILY_DIR, `report_${today}.md`);
        fs.writeFileSync(reportFile, reportContent, 'utf8');
        console.log('✅ 报告已保存: ' + reportFile);
        
        // 保存分析数据
        const analyses = projects.map(p => ({
            name: p.name,
            description: p.description,
            stars: p.stars,
            language: p.language,
            url: p.url,
            main_function: inferMainFunction(p.name, p.description, p.language),
            core_advantages: generateAdvantages(p.stars, p.description),
            use_cases: generateUseCases(p.name, p.description, p.language),
            created_at: p.created_at,
            updated_at: p.updated_at,
            // 新增字段
            deltaStars: p.deltaStars,
            previousStars: p.previousStars,
            growthRate: p.growthRate,
            score: p.score
        }));
        
        const analysisFile = path.join(DATA_DIR, `analysis_${today}.json`);
        fs.writeFileSync(analysisFile, JSON.stringify(analyses, null, 2), 'utf8');
        console.log('✅ 分析数据已保存: ' + analysisFile);
        
        // 计算语言数量
        const langCount = {};
        projects.forEach(p => {
            const lang = p.language || 'Unknown';
            langCount[lang] = (langCount[lang] || 0) + 1;
        });
        
        console.log('\n🎉 深度分析报告生成完成！');
        console.log('\n📊 报告统计:');
        console.log('  - 项目总数: ' + projects.length);
        console.log('  - 语言种类: ' + Object.keys(langCount).length);
        
    } catch (error) {
        console.error('❌ 生成报告过程中出错:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

main();
