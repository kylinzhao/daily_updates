#!/usr/bin/env node

/**
 * 更新主 README.md，添加今日新增项目
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const REPO_DIR = path.join(__dirname, '..');
const README_FILE = path.join(REPO_DIR, 'README.md');
const TODAY = new Date().toISOString().split('T')[0];

// 读取今天的分析数据
function getTodayAnalysis() {
    const analysisFile = path.join(DATA_DIR, `analysis_${TODAY}.json`);
    
    if (!fs.existsSync(analysisFile)) {
        console.log('❌ No analysis data found for today');
        return null;
    }
    
    return JSON.parse(fs.readFileSync(analysisFile, 'utf8'));
}

// 生成今日新增部分
function generateTodaySection(projects) {
    const projectsList = projects.map((project, index) => {
        const name = project.name.split('/')[1];
        return `
### ${index + 1}. ${project.name}

- **⭐ Stars:** ${project.stars}
- **💻 语言:** ${project.language}
- **🎯 主要功能:** ${project.main_function}
- **💡 核心优势:** ${project.core_advantages.join(', ')}
- **🚀 适用场景:** ${project.use_cases.join(', ')}
- **🔗 [GitHub](${project.url})`

#### 📝 描述
${project.description}

#### 🛠️ Demo
技术栈: ${project.demo_language}
位置: \`demos/${name}_${TODAY}/\`
`;
    }).join('\n');

    return `
---

## 📅 今日新增项目 (${TODAY})

本日新增 ${projects.length} 个 GitHub 热门项目的分析和演示。

${projectsList}

---

`;
}

// 更新 README.md
function updateReadme(todaySection) {
    if (!fs.existsSync(README_FILE)) {
        console.log('❌ README.md not found');
        return false;
    }
    
    let content = fs.readFileSync(README_FILE, 'utf8');
    
    // 检查是否已有今日部分
    const todayMarker = `📅 今日新增项目 (${TODAY})`;
    
    if (content.includes(todayMarker)) {
        console.log('ℹ️  Today\'s section already exists, skipping...');
        return false;
    }
    
    // 在 "自动化流程" 之后插入今日部分
    const automationSection = '## 自动化流程';
    const insertPosition = content.indexOf(automationSection);
    
    if (insertPosition === -1) {
        console.log('⚠️  Automation section not found, appending to end');
        content += todaySection;
    } else {
        // 在自动化流程之前插入
        const beforeAutomation = content.substring(0, insertPosition);
        const afterAutomation = content.substring(insertPosition);
        content = beforeAutomation + todaySection + automationSection + afterAutomation;
    }
    
    // 更新文件
    fs.writeFileSync(README_FILE, content, 'utf8');
    console.log('✅ README.md updated with today\'s new projects');
    return true;
}

// 主函数
async function main() {
    try {
        console.log('🔄 Updating README.md with today\'s new projects...');
        
        const projects = getTodayAnalysis();
        if (!projects || projects.length === 0) {
            console.log('⚠️  No projects found for today');
            process.exit(0);
        }
        
        console.log(`📊 Found ${projects.length} new projects`);
        
        const todaySection = generateTodaySection(projects);
        
        const updated = updateReadme(todaySection);
        
        if (updated) {
            console.log('✅ README.md updated successfully');
            console.log(`📝 Added ${projects.length} projects for ${TODAY}`);
        } else {
            console.log('ℹ️  README.md already up to date');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

main();
