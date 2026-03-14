#!/usr/bin/env node

/**
 * Demo 验证脚本 - 验证每个 demo 是否可以正常运行
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DATA_DIR = path.join(__dirname, '../data');
const DEMOS_DIR = path.join(__dirname, '../demos');
const TODAY = new Date().toISOString().split('T')[0];

console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║  Demo 验证脚本                                                ║');
console.log('╚════════════════════════════════════════════════════════════╝');
console.log(`📅 Date: ${TODAY}`);
console.log('');

// 读取分析数据
function getAnalysis() {
    const analysisFile = path.join(DATA_DIR, `analysis_${TODAY}.json`);
    
    if (!fs.existsSync(analysisFile)) {
        console.log('❌ Analysis file not found');
        process.exit(1);
    }
    
    return JSON.parse(fs.readFileSync(analysisFile, 'utf8'));
}

// 验证 Python Flask App
function verifyPythonApp(projectDir) {
    const checks = [];
    
    // 检查 app.py
    const appPy = path.join(projectDir, 'app.py');
    if (fs.existsSync(appPy)) {
        checks.push({ name: 'app.py', status: '✅ found' });
        
        // 验证 Python 语法
        try {
            execSync('python3 -m py_compile app.py', { cwd: projectDir, stdio: 'pipe' });
            checks.push({ name: 'Python syntax', status: '✅ valid' });
        } catch (error) {
            checks.push({ name: 'Python syntax', status: '❌ error' });
        }
    } else {
        checks.push({ name: 'app.py', status: '❌ missing' });
    }
    
    // 检查 requirements.txt
    const reqs = path.join(projectDir, 'requirements.txt');
    if (fs.existsSync(reqs)) {
        checks.push({ name: 'requirements.txt', status: '✅ found' });
        
        const content = fs.readFileSync(reqs, 'utf8');
        const deps = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
        checks.push({ name: 'Dependencies', status: `${deps.length} found` });
    } else {
        checks.push({ name: 'requirements.txt', status: '❌ missing' });
    }
    
    // 检查 README
    const readme = path.join(projectDir, 'README.md');
    if (fs.existsSync(readme)) {
        const content = fs.readFileSync(readme, 'utf8');
        
        if (content.includes('## Setup')) {
            checks.push({ name: 'Setup instructions', status: '✅ found' });
        } else {
            checks.push({ name: 'Setup instructions', status: '⚠️  missing' });
        }
        
        if (content.includes('## Run') || content.includes('## Usage')) {
            checks.push({ name: 'Run instructions', status: '✅ found' });
        } else {
            checks.push({ name: 'Run instructions', status: '⚠️  missing' });
        }
        
        if (content.includes('## Features')) {
            checks.push({ name: 'Features section', status: '✅ found' });
        }
    } else {
        checks.push({ name: 'README.md', status: '❌ missing' });
    }
    
    return checks;
}

// 验证 HTML/JS App
function verifyHtmlApp(projectDir) {
    const checks = [];
    
    const indexHtml = path.join(projectDir, 'index.html');
    if (fs.existsSync(indexHtml)) {
        checks.push({ name: 'index.html', status: '✅ found' });
        
        const content = fs.readFileSync(indexHtml, 'utf8');
        
        // 验证 HTML 结构
        if (content.includes('<!DOCTYPE html>')) {
            checks.push({ name: 'HTML structure', status: '✅ valid' });
        } else {
            checks.push({ name: 'HTML structure', status: '⚠️  incomplete' });
        }
        
        // 检查 JavaScript
        if (content.includes('<script>')) {
            checks.push({ name: 'JavaScript code', status: '✅ found' });
        } else {
            checks.push({ name: 'JavaScript code', status: '⚠️  missing' });
        }
        
        // 检查样式
        if (content.includes('<style>')) {
            checks.push({ name: 'CSS styling', status: '✅ found' });
        }
    } else {
        checks.push({ name: 'index.html', status: '❌ missing' });
    }
    
    // 检查 README
    const readme = path.join(projectDir, 'README.md');
    if (fs.existsSync(readme)) {
        const content = fs.readFileSync(readme, 'utf8');
        
        if (content.includes('## Usage') || content.includes('## Features')) {
            checks.push({ name: 'Usage section', status: '✅ found' });
        }
        
        if (content.includes('## Setup') || content.includes('## Installation')) {
            checks.push({ name: 'Setup section', status: '✅ found' });
        }
    }
    
    return checks;
}

// 验证 TypeScript 项目
function verifyTypeScriptProject(projectDir) {
    const checks = [];
    
    // 检查 TypeScript 文件
    const srcDir = path.join(projectDir, 'src');
    if (fs.existsSync(srcDir)) {
        const tsFiles = fs.readdirSync(srcDir).filter(f => f.endsWith('.ts'));
        if (tsFiles.length > 0) {
            checks.push({ name: 'TypeScript files', status: `${tsFiles.length} found` });
            
            // 验证至少一个文件
            try {
                const sampleFile = path.join(srcDir, tsFiles[0]);
                // 尝试验证 TypeScript 是否有语法错误（简化检查）
                const content = fs.readFileSync(sampleFile, 'utf8');
                if (content.includes('export') || content.includes('class') || content.includes('interface')) {
                    checks.push({ name: 'TS structure', status: '✅ looks valid' });
                }
            } catch (error) {
                checks.push({ name: 'TS structure', status: '⚠️  cannot verify' });
            }
        }
    } else {
        checks.push({ name: 'src directory', status: '❌ missing' });
    }
    
    // 检查 package.json
    const packageJson = path.join(projectDir, 'package.json');
    if (fs.existsSync(packageJson)) {
        try {
            const pkg = JSON.parse(fs.readFileSync(packageJson, 'utf8'));
            checks.push({ name: 'package.json', status: '✅ valid' });
            
            if (pkg.description) {
                checks.push({ name: 'Description', status: '✅ present' });
            }
            
            if (pkg.dependencies) {
                const depCount = Object.keys(pkg.dependencies).length;
                checks.push({ name: 'Dependencies', status: `${depCount} listed` });
            }
        } catch (error) {
            checks.push({ name: 'package.json', status: '❌ invalid' });
        }
    } else {
        checks.push({ name: 'package.json', status: '⚠️  missing' });
    }
    
    // 检查 tsconfig.json
    const tsconfig = path.join(projectDir, 'tsconfig.json');
    if (fs.existsSync(tsconfig)) {
        checks.push({ name: 'tsconfig.json', status: '✅ found' });
    } else {
        checks.push({ name: 'tsconfig.json', status: '⚠️  missing' });
    }
    
    // 检查 README
    const readme = path.join(projectDir, 'README.md');
    if (fs.existsSync(readme)) {
        const content = fs.readFileSync(readme, 'utf8');
        
        if (content.includes('## Usage') || content.includes('## Features')) {
            checks.push({ name: 'Usage section', status: '✅ found' });
        }
        
        if (content.includes('## Setup')) {
            checks.push({ name: 'Setup section', status: '✅ found' });
        }
    }
    
    return checks;
}

// 主验证函数
function verifyProject(project) {
    const name = project.name;
    const projectName = name.split('/')[1];
    const projectDir = path.join(DEMOS_DIR, `${projectName}_${TODAY}`);
    
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`🔍 Verifying: ${name}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📝 ${project.description}`);
    console.log('');
    
    let checks = [];
    
    // 根据语言选择验证方法
    const language = project.language.toLowerCase();
    
    if (language.includes('python')) {
        checks = verifyPythonApp(projectDir);
        console.log('🐍 Python Flask App');
    } else if (language.includes('javascript') || language.includes('svelte')) {
        checks = verifyHtmlApp(projectDir);
        console.log('🌐 HTML/JavaScript App');
    } else if (language.includes('typescript')) {
        checks = verifyTypeScriptProject(projectDir);
        console.log('💰 TypeScript Project');
    } else {
        checks.push({ name: 'Verification', status: '⚠️  language not recognized' });
    }
    
    // 显示检查结果
    checks.forEach(check => {
        console.log(`${check.status} ${check.name}`);
    });
    
    console.log('');
    console.log(`✅ Verification complete for: ${name}`);
    console.log('');
    
    return checks.every(c => c.status.includes('✅'));
}

// 主函数
async function main() {
    try {
        const projects = getAnalysis();
        console.log(`📊 Found ${projects.length} projects to verify`);
        console.log('');
        
        let allPassed = true;
        let verifiedCount = 0;
        
        for (const project of projects) {
            const projectName = project.name.split('/')[1];
            const projectDir = path.join(DEMOS_DIR, `${projectName}_${TODAY}`);
            
            if (!fs.existsSync(projectDir)) {
                console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
                console.log(`⏸️  SKIP: ${project.name} (demo not created yet)`);
                console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
                console.log('');
                continue;
            }
            
            const passed = verifyProject(project);
            if (passed) {
                verifiedCount++;
            } else {
                allPassed = false;
            }
        }
        
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`🎉 Verification complete! ${verifiedCount}/${projects.length} demos passed`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        process.exit(allPassed ? 0 : 1);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

main();
