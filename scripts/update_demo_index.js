#!/usr/bin/env node

/**
 * 更新 Demo Hub 索引
 * 根据每日分析结果自动更新 demos/index.html
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const DEMOS_DIR = path.join(__dirname, '../demos');
const INDEX_FILE = path.join(DEMOS_DIR, 'index.html');

// 读取最新分析数据
function getLatestAnalysis() {
    const today = new Date().toISOString().split('T')[0];
    const analysisFile = path.join(DATA_DIR, `analysis_${today}.json`);
    
    if (!fs.existsSync(analysisFile)) {
        console.log('❌ No analysis data found for today');
        return null;
    }
    
    const analyses = JSON.parse(fs.readFileSync(analysisFile, 'utf8'));
    return analyses;
}

// 读取现有 demo 目录
function getExistingDemos() {
    if (!fs.existsSync(DEMOS_DIR)) {
        return [];
    }
    
    const entries = fs.readdirSync(DEMOS_DIR, { withFileTypes: true });
    const demos = [];
    
    for (const entry of entries) {
        if (entry.isDirectory() && entry.name !== 'logs' && entry.name.startsWith('demo_') === false && entry.name.match(/^\d{4}-\d{2}-\d{2}/)) {
            const demoPath = path.join(DEMOS_DIR, entry.name);
            const readmeFile = path.join(demoPath, 'README.md');
            
            let description = 'Demo project';
            let language = 'Unknown';
            let canRun = false;
            let runPath = '';
            let status = 'standalone';
            
            // 尝试读取 README
            if (fs.existsSync(readmeFile)) {
                const readmeContent = fs.readFileSync(readmeFile, 'utf8');
                // 提取描述（第一段）
                const descMatch = readmeContent.match(/## Description\s*\n([\s\S]*?)(?:\n|$)/i);
                if (descMatch && descMatch[1]) {
                    description = descMatch[1].trim();
                }
                
                // 尝试识别语言
                const langMatch = readmeContent.match(/Language|技术栈|Tech Stack\s*[:：]\s*([^\n]+)/i);
                if (langMatch && langMatch[1]) {
                    language = langMatch[1].trim();
                }
            }
            
            // 检查是否可以运行
            const indexHtml = path.join(demoPath, 'index.html');
            const appPy = path.join(demoPath, 'app.py');
            const mainJs = path.join(demoPath, 'main.js');
            
            if (fs.existsSync(indexHtml)) {
                canRun = true;
                runPath = `./${entry.name}/index.html`;
                status = 'standalone';
            } else if (fs.existsSync(appPy)) {
                // Python 应用需要本地环境
                canRun = false;
                status = 'standalone';
            } else if (fs.existsSync(mainJs)) {
                canRun = true;
                runPath = `./${entry.name}/main.js`;
                status = 'standalone';
            }
            
            demos.push({
                name: entry.name.replace(/_\d{4}-\d{2}-\d{2}$/, ''),
                date: entry.name.match(/(\d{4}-\d{2}-\d{2})/)?.[1] || 'Unknown',
                description: description.substring(0, 200),
                language: language,
                path: entry.name,
                status: status,
                canRun: canRun,
                runPath: runPath
            });
        }
    }
    
    return demos;
}

// 生成新的索引 HTML
function generateIndexHtml(demos) {
    // 这里使用一个简化的模板，实际应该从模板文件加载
    const demoCards = demos.map(demo => `
                <div class="demo-card">
                    <div class="demo-header">
                        <h2>${demo.name}</h2>
                        <span class="badge">${demo.language}</span>
                    </div>
                    <div class="demo-body">
                        <p class="demo-description">${demo.description}</p>
                        <div class="demo-actions">
                            ${demo.canRun ? `
                                <a href="${demo.runPath}" class="btn btn-primary" target="_blank">
                                    ▶ 运行 Demo
                                </a>
                            ` : ''}
                            <a href="./${demo.path}/README.md" class="btn btn-secondary" target="_blank">
                                📖 查看文档
                            </a>
                        </div>
                        <div class="demo-status status-${demo.status}">
                            ${getStatusText(demo)}
                        </div>
                    </div>
                </div>
    `).join('');
    
    return demoCards;
}

function getStatusText(demo) {
    switch (demo.status) {
        case 'running':
            return '✅ 可实时运行';
        case 'standalone':
            return '🔧 独立运行（需要本地环境）';
        case 'not-available':
            return '⏸️ 不可运行';
        default:
            return '';
    }
}

// 主函数
async function main() {
    try {
        console.log('🔄 Updating demo hub index...');
        
        // 获取现有 demos
        const existingDemos = getExistingDemos();
        console.log(`✅ Found ${existingDemos.length} existing demos`);
        
        // 生成新的索引
        const demoCards = generateIndexHtml(existingDemos);
        console.log(`✅ Generated ${demoCards.length / 5} demo cards`);
        
        // 更新索引文件
        if (fs.existsSync(INDEX_FILE)) {
            const currentContent = fs.readFileSync(INDEX_FILE, 'utf8');
            const updatedContent = currentContent.replace(
                /<div class="demo-grid" id="demoGrid">[\s\S]*?<\/div>/s,
                `<div class="demo-grid" id="demoGrid">${demoCards}</div>`
            );
            fs.writeFileSync(INDEX_FILE, updatedContent, 'utf8');
        } else {
            console.log('❌ Index file not found. Please create demos/index.html first.');
        }
        
        console.log('✅ Demo hub index updated successfully!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

main();
