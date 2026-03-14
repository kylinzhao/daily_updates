#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const DATA_DIR = path.join(__dirname, '../data');
const DAILY_DIR = path.join(__dirname, '../daily');
const DEMOS_DIR = path.join(__dirname, '../demos');

// 确保目录存在
[DATA_DIR, DAILY_DIR, DEMOS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

function fetchReadme(repoOwner, repoName) {
    return new Promise((resolve) => {
        const options = {
            hostname: 'api.github.com',
            path: `/repos/${repoOwner}/${repoName}/readme`,
            method: 'GET',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'User-Agent': 'GitHub-Trending-Tracker',
                'Accept': 'application/vnd.github.v3+json'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    try {
                        const result = JSON.parse(data);
                        // Base64 decode
                        const content = Buffer.from(result.content, 'base64').toString('utf8');
                        resolve(content);
                    } catch (error) {
                        resolve(null);
                    }
                } else {
                    resolve(null);
                }
            });
        });

        req.on('error', () => resolve(null));
        req.end();
    });
}

function analyzeProject(project) {
    const analysis = {
        name: project.name,
        description: project.description,
        stars: project.stars,
        language: project.language,
        url: project.url,
        main_function: '',
        core_advantages: [],
        use_cases: [],
        demo_language: project.language.toLowerCase().includes('javascript') ? 'JavaScript' : 
                      project.language.toLowerCase().includes('python') ? 'Python' : 
                      project.language.toLowerCase().includes('go') ? 'Go' : 'JavaScript'
    };

    // 基于描述生成简要分析
    const desc = project.description.toLowerCase();
    
    // 主要功能推断
    if (desc.includes('framework') || desc.includes('library')) {
        analysis.main_function = '开发框架/工具库';
    } else if (desc.includes('api') || desc.includes('service')) {
        analysis.main_function = 'API 服务';
    } else if (desc.includes('tool') || desc.includes('cli')) {
        analysis.main_function = '命令行工具';
    } else if (desc.includes('app') || desc.includes('application')) {
        analysis.main_function = '应用程序';
    } else {
        analysis.main_function = '开源项目';
    }

    // 核心优势推断
    if (desc.includes('fast') || desc.includes('performance')) {
        analysis.core_advantages.push('高性能');
    }
    if (desc.includes('simple') || desc.includes('easy')) {
        analysis.core_advantages.push('易于使用');
    }
    if (desc.includes('scalable')) {
        analysis.core_advantages.push('可扩展');
    }
    if (project.stars > 10000) {
        analysis.core_advantages.push('社区活跃');
    }
    if (analysis.core_advantages.length === 0) {
        analysis.core_advantages.push('创新性强');
    }

    // 适用场景推断
    if (desc.includes('web') || desc.includes('frontend')) {
        analysis.use_cases.push('Web 开发');
    }
    if (desc.includes('api') || desc.includes('backend')) {
        analysis.use_cases.push('后端服务');
    }
    if (desc.includes('data') || desc.includes('analytics')) {
        analysis.use_cases.push('数据处理');
    }
    if (desc.includes('devops') || desc.includes('deploy')) {
        analysis.use_cases.push('DevOps 运维');
    }
    if (analysis.use_cases.length === 0) {
        analysis.use_cases.push('通用场景');
    }

    return analysis;
}

function generateDailyReport(analyses, date) {
    const report = `# GitHub Trending Report - ${date}

本报告分析了最近 24 小时 GitHub 上最热门的 5 个项目。

---

${analyses.map((analysis, index) => `
## ${index + 1}. ${analysis.name}

**⭐ Stars:** ${analysis.stars} | **💻 语言:** ${analysis.language} | **🔗 [链接](${analysis.url})**

### 📝 描述
${analysis.description}

### 🎯 主要功能
${analysis.main_function}

### 💡 核心优势
${analysis.core_advantages.map(adv => `- ${adv}`).join('\n')}

### 🚀 适用场景
${analysis.use_cases.map(uc => `- ${uc}`).join('\n')}

### 🛠️ Demo 技术栈
${analysis.demo_language}

---

`).join('')}

---

*本报告由 OpenClaw 自动生成*
*生成时间: ${new Date().toISOString()}*
`;

    return report;
}

async function main() {
    try {
        const today = new Date().toISOString().split('T')[0];
        const trendingFile = path.join(DATA_DIR, `trending_${today}.json`);

        console.log('📂 Reading trending data...');
        if (!fs.existsSync(trendingFile)) {
            console.log('❌ No trending data found. Run fetch_trending.js first.');
            process.exit(1);
        }

        const projects = JSON.parse(fs.readFileSync(trendingFile, 'utf8'));
        console.log(`✅ Found ${projects.length} projects`);

        console.log('\n🔍 Analyzing projects...');
        const analyses = [];
        
        for (const project of projects) {
            console.log(`  - Analyzing ${project.name}...`);
            const analysis = analyzeProject(project);
            analyses.push(analysis);
            
            // 简要延迟，避免 API 限流
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        console.log('✅ Analysis complete');

        // 生成报告
        console.log('\n📄 Generating daily report...');
        const reportContent = generateDailyReport(analyses, today);
        const reportFile = path.join(DAILY_DIR, `report_${today}.md`);
        fs.writeFileSync(reportFile, reportContent, 'utf8');
        console.log(`✅ Report saved to ${reportFile}`);

        // 保存分析数据供 demo 开发使用
        const analysisFile = path.join(DATA_DIR, `analysis_${today}.json`);
        fs.writeFileSync(analysisFile, JSON.stringify(analyses, null, 2), 'utf8');
        console.log(`✅ Analysis data saved to ${analysisFile}`);

        console.log('\n🎉 Daily report generation complete!');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

main();
