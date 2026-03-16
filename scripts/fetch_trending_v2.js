#!/usr/bin/env node

/**
 * GitHub Trending Fetch Script v2
 * 改进的筛选逻辑：权衡绝对值和比例增长
 * 使用智谱 GLM-4.5-Flash 总结 README
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OUTPUT_DIR = path.join(__dirname, '../data');
const HISTORY_DIR = path.join(__dirname, '../history');

// 智谱 API 配置
const ZHIPU_API_KEY = 'a3eeb2f2fedd4f758872afdcb9478edd.tVsUPTwkUxcD4rJe';
const ZHIPU_API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

// 确保目录存在
[OUTPUT_DIR, HISTORY_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

/**
 * 获取项目基本信息
 */
function fetchTrendingProjects() {
    return new Promise((resolve, reject) => {
        // 获取更多候选项目，筛选速度快的
        const options = {
            hostname: 'api.github.com',
            path: '/search/repositories?q=created:>2024-01-01&sort=stars&order=desc&per_page=50',
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
                        resolve(result.items || []);
                    } catch (error) {
                        reject(error);
                    }
                } else {
                    reject(new Error(`GitHub API returned ${res.statusCode}`));
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

/**
 * 获取项目的历史 Star 数据
 */
function fetchProjectHistory(fullName) {
    return new Promise((resolve, reject) => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        // 尝试从历史数据文件读取
        const historyFile = path.join(HISTORY_DIR, `history_${yesterdayStr}.json`);
        if (fs.existsSync(historyFile)) {
            const historyData = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
            const projectHistory = historyData.find(p => p.name === fullName);
            if (projectHistory) {
                resolve(projectHistory.stars);
                return;
            }
        }

        // 如果历史数据不存在，返回 0
        resolve(0);
    });
}

/**
 * 保存当前数据到历史文件
 */
function saveToHistory(projects) {
    const todayStr = new Date().toISOString().split('T')[0];
    const historyFile = path.join(HISTORY_DIR, `history_${todayStr}.json`);

    const historyData = projects.map(project => ({
        name: project.name,
        stars: project.stars,
        date: todayStr
    }));

    fs.writeFileSync(historyFile, JSON.stringify(historyData, null, 2), 'utf8');
    console.log(`📄 Saved history to ${historyFile}`);
}

/**
 * 计算项目的综合评分
 * 算法：score = log(Δ + 1) + 0.3 * log(T0 + 1)
 * Δ: 绝对增长
 * T0: 24小时前的 stars
 */
function calculateScore(currentStars, previousStars) {
    const delta = currentStars - previousStars;
    const previousStarsForCalc = previousStars > 0 ? previousStars : 1;

    // 使用对数函数，避免被极端值影响
    const deltaScore = Math.log10(delta + 1);
    const baseScore = Math.log10(previousStarsForCalc + 1);

    // 综合评分：绝对增长 + 基础规模（权重 0.3）
    const score = deltaScore + 0.3 * baseScore;

    // 如果没有历史数据（第一天），使用估算增长率
    let growthRate;
    if (previousStars === 0) {
        // 估算增长率：假设项目已经存在一定时间
        // 使用项目年龄估算日均增长，然后计算日增长率
        growthRate = delta / Math.max(1, Math.sqrt(currentStars));
    } else {
        growthRate = delta / previousStars;
    }

    return {
        delta,
        previousStars,
        score,
        growthRate
    };
}

/**
 * 使用智谱 GLM-4.5-Flash 总结 README
 */
async function summarizeWithZhipu(readmeUrl) {
    return new Promise((resolve, reject) => {
        // 先获取 README 内容
        const readmeOptions = {
            hostname: 'raw.githubusercontent.com',
            path: readmeUrl,
            method: 'GET',
            headers: {
                'User-Agent': 'GitHub-Trending-Tracker'
            }
        };

        const readmeReq = https.request(readmeOptions, (res) => {
            let readmeData = '';
            res.on('data', chunk => readmeData += chunk);
            res.on('end', () => {
                if (res.statusCode === 200 && readmeData) {
                    // 限制 README 长度，避免 API 调用超时
                    const truncatedReadme = readmeData.substring(0, 3000);

                    // 调用智谱 API
                    const chatOptions = {
                        hostname: 'open.bigmodel.cn',
                        path: '/api/paas/v4/chat/completions',
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${ZHIPU_API_KEY}`
                        }
                    };

                    const chatData = JSON.stringify({
                        model: 'glm-4-flash', // 使用非推理模型
                        messages: [
                            {
                                role: 'system',
                                content: '你是一个专业的项目分析师。请用简洁的中文总结项目的主要功能、特点和优势。控制在 100 字以内。'
                            },
                            {
                                role: 'user',
                                content: `请总结以下项目的 README：\n\n${truncatedReadme}`
                            }
                        ],
                        max_tokens: 200
                    });

                    const chatReq = https.request(chatOptions, (chatRes) => {
                        let chatData = '';
                        chatRes.on('data', chunk => chatData += chunk);
                        chatRes.on('end', () => {
                            try {
                                const result = JSON.parse(chatData);
                                if (result.choices && result.choices[0] && result.choices[0].message) {
                                    // 优先使用 content，如果为空则尝试 reasoning_content
                                    const content = result.choices[0].message.content || result.choices[0].message.reasoning_content;
                                    resolve(content ? content.trim() : '暂无项目简介');
                                } else {
                                    resolve('暂无项目简介');
                                }
                            } catch (error) {
                                console.error('智谱 API 解析错误:', error.message);
                                console.error('原始响应:', chatData);
                                resolve('项目简介获取失败');
                            }
                        });
                    });

                    chatReq.on('error', (error) => {
                        console.error('智谱 API 请求错误:', error.message);
                        resolve('项目简介获取失败');
                    });

                    chatReq.write(chatData);
                    chatReq.end();

                } else {
                    resolve('暂无 README');
                }
            });
        });

        readmeReq.on('error', (error) => {
            console.error('获取 README 错误:', error.message);
            resolve('暂无 README');
        });

        readmeReq.end();
    });
}

/**
 * 格式化项目数据
 */
async function formatProject(project) {
    const fullName = project.full_name;
    const currentStars = project.stargazers_count;
    const previousStars = await fetchProjectHistory(fullName);

    const scoreData = calculateScore(currentStars, previousStars);

    // 尝试获取 README URL
    const readmeUrl = `${fullName}/master/README.md`;

    // 使用智谱 API 总结 README
    const summary = await summarizeWithZhipu(readmeUrl);

    return {
        name: fullName,
        description: summary || project.description || 'No description',
        stars: currentStars,
        url: project.html_url,
        language: project.language || 'Unknown',
        created_at: project.created_at,
        updated_at: project.updated_at,
        topics: project.topics || [],
        // 新增字段
        deltaStars: scoreData.delta,
        previousStars: scoreData.previousStars,
        growthRate: scoreData.growthRate,
        score: scoreData.score
    };
}

/**
 * 主函数
 */
async function main() {
    try {
        console.log('🔍 Fetching GitHub trending projects (v2)...');
        const projects = await fetchTrendingProjects();
        console.log(`✅ Found ${projects.length} candidate projects`);

        // 格式化项目并计算评分
        console.log('⚙️ Calculating scores and generating summaries...');
        const formattedProjects = await Promise.all(
            projects.slice(0, 20).map(formatProject) // 只处理前 20 个项目，避免 API 调用过多
        );

        // 按照评分排序
        formattedProjects.sort((a, b) => b.score - a.score);

        // 选择 Top 5
        const topProjects = formattedProjects.slice(0, 5);

        const today = new Date().toISOString().split('T')[0];
        const outputFile = path.join(OUTPUT_DIR, `trending_${today}.json`);

        fs.writeFileSync(outputFile, JSON.stringify(topProjects, null, 2), 'utf8');
        console.log(`📄 Saved to ${outputFile}`);

        // 保存历史数据
        saveToHistory(formattedProjects);

        console.log('\n📊 Top 5 Trending Projects (v2):');
        topProjects.forEach((project, index) => {
            console.log(`\n${index + 1}. ${project.name}`);
            console.log(`   ⭐ ${project.stars} stars (+${project.deltaStars})`);
            console.log(`   📈 增长率: ${(project.growthRate * 100).toFixed(2)}%`);
            console.log(`   🎯 综合评分: ${project.score.toFixed(4)}`);
            console.log(`   💻 ${project.language}`);
            console.log(`   📝 ${project.description.substring(0, 80)}...`);
            console.log(`   🔗 ${project.url}`);
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

main();
