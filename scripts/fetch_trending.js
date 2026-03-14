#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OUTPUT_DIR = path.join(__dirname, '../data');

// 确保输出目录存在
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function fetchTrendingProjects() {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.github.com',
            path: '/search/repositories?q=created:>2024-03-13&sort=stars&order=desc&per_page=5',
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

function formatProject(project) {
    return {
        name: project.full_name,
        description: project.description || 'No description',
        stars: project.stargazers_count,
        url: project.html_url,
        language: project.language || 'Unknown',
        created_at: project.created_at,
        updated_at: project.updated_at,
        topics: project.topics || []
    };
}

async function main() {
    try {
        console.log('🔍 Fetching GitHub trending projects...');
        const projects = await fetchTrendingProjects();
        console.log(`✅ Found ${projects.length} trending projects`);

        const formattedProjects = projects.map(formatProject);
        const today = new Date().toISOString().split('T')[0];
        const outputFile = path.join(OUTPUT_DIR, `trending_${today}.json`);

        fs.writeFileSync(outputFile, JSON.stringify(formattedProjects, null, 2), 'utf8');
        console.log(`📄 Saved to ${outputFile}`);

        console.log('\n📊 Trending Projects:');
        formattedProjects.forEach((project, index) => {
            console.log(`\n${index + 1}. ${project.name}`);
            console.log(`   ⭐ ${project.stars} stars | 🌐 ${project.language}`);
            console.log(`   📝 ${project.description.substring(0, 100)}...`);
            console.log(`   🔗 ${project.url}`);
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

main();
