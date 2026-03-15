# README Summary Feature Specification

## Overview
This feature enhances GitHub project analysis by fetching and summarizing source repository READMEs using Large Language Models (LLMs), replacing the hardcoded inference logic.

## Architecture

### Module Structure
```
README-summary/
├── spec.md                      # This specification document
├── README.md                    # Feature documentation
├── index.js                     # Main entry point
├── fetch-readme.js             # GitHub README fetcher
├── summarize-with-llm.js       # LLM summarization service
└── types.js                    # TypeScript-like type definitions (JSDoc)
```

### Data Flow
```
GitHub API → README Content → LLM Processing → Structured Summary → Report Generation
```

## Core Components

### 1. Fetch README Service (`fetch-readme.js`)

**Purpose:** Fetch README content from GitHub repository

**Interface:**
```javascript
/**
 * Fetch README content from GitHub repository
 * @param {string} repo - Repository name in format "owner/repo"
 * @param {string} token - GitHub API token
 * @returns {Promise<string>} README content in markdown
 */
async function fetchReadme(repo, token)
```

**Implementation Details:**
- Use GitHub API: `GET /repos/{owner}/{repo}/readme`
- Handle multiple README formats (README.md, README.rst, etc.)
- Decode Base64 content
- Cache fetched READMEs (optional)

### 2. LLM Summarization Service (`summarize-with-llm.js`)

**Purpose:** Analyze README and extract structured project information

**Interface:**
```javascript
/**
 * Summarize project from README content using LLM
 * @param {string} readme - README markdown content
 * @param {Object} projectMeta - Project metadata from GitHub API
 * @returns {Promise<Object>} Structured project analysis
 */
async function summarizeWithLLM(readme, projectMeta)
```

**Output Structure:**
```javascript
{
  main_function: string,        // e.g., "API 服务"
  core_advantages: string[],    // e.g., ["高性能", "易于使用"]
  use_cases: string[],         // e.g., ["后端服务", "API集成"]
  key_features: string[],       // Main features from README
  tech_stack: string[],        // Technologies mentioned
  summary: string              // Brief project summary (2-3 sentences)
}
```

**LLM Prompt Design:**
```
You are an expert software analyst. Analyze this GitHub repository README and extract:
1. Main function/purpose (2-4 words in Chinese)
2. Core advantages (3-5 items, concise)
3. Use cases (3-5 items, specific scenarios)
4. Key features (bullet points)
5. Technology stack mentioned
6. Brief summary (2-3 sentences)

README Content:
{readme}

Project Info:
- Name: {name}
- Language: {language}
- Stars: {stars}

Respond in JSON format:
{
  "main_function": "...",
  "core_advantages": ["...", "..."],
  "use_cases": ["...", "..."],
  "key_features": ["...", "..."],
  "tech_stack": ["...", "..."],
  "summary": "..."
}
```

### 3. Main Entry Point (`index.js`)

**Purpose:** Orchestrate README fetching and summarization

**Interface:**
```javascript
/**
 * Analyze project with enhanced README-based insights
 * @param {Object} project - Project metadata from GitHub API
 * @param {string} token - GitHub API token
 * @returns {Promise<Object>} Enhanced project analysis
 */
async function analyzeProjectWithReadme(project, token)

/**
 * Batch analyze multiple projects
 * @param {Object[]} projects - Array of project metadata
 * @param {string} token - GitHub API token
 * @returns {Promise<Object[]>} Array of enhanced project analyses
 */
async function analyzeProjectsBatch(projects, token)
```

## Integration with Existing Code

### Before (Hardcoded Inference)
```javascript
const mainFunction = inferMainFunction(project.name, project.description, project.language);
const advantages = generateAdvantages(project.stars, project.description);
const useCases = generateUseCases(project.name, project.description, project.language);
```

### After (LLM-Powered Analysis)
```javascript
const readmeAnalysis = await analyzeProjectWithReadme(project, GITHUB_TOKEN);
const mainFunction = readmeAnalysis.main_function;
const advantages = readmeAnalysis.core_advantages;
const useCases = readmeAnalysis.use_cases;
```

## Configuration

### Environment Variables
```bash
# GitHub API Token (already exists)
GITHUB_TOKEN=your_github_token

# OpenAI API Key (new, for LLM summarization)
OPENAI_API_KEY=your_openai_key

# Alternative: Use other LLM providers
# ANTHROPIC_API_KEY=your_anthropic_key
# ZAI_API_KEY=your_zai_key
```

### Configuration File (`.env`)
```
# LLM Configuration
LLM_PROVIDER=openai          # Options: openai, anthropic, zai
LLM_MODEL=gpt-4o-mini        # Default model
LLM_TEMPERATURE=0.3          # Lower for consistent output
LLM_MAX_TOKENS=1000          # Response limit
```

## Error Handling

### README Not Found
- Log warning: "README not found for {repo}"
- Fallback to original hardcoded inference
- Tag analysis with `method: "fallback"` for tracking

### LLM API Failure
- Implement retry logic (3 attempts with exponential backoff)
- Log error details
- Fallback to hardcoded inference
- Tag analysis with `method: "fallback_llm_failed"`

### Rate Limiting
- Implement request queuing
- Respect GitHub API rate limits (5000 req/hour authenticated)
- Add delay between requests if needed

## Testing

### Unit Tests
```javascript
describe('fetch-readme.js', () => {
  it('should fetch README from GitHub', async () => {
    const readme = await fetchReadme('openclaw/openclaw', token);
    expect(readme).toContain('OpenClaw');
  });
});

describe('summarize-with-llm.js', () => {
  it('should extract main function from README', async () => {
    const result = await summarizeWithLLM(sampleReadme, sampleMeta);
    expect(result.main_function).toBeTruthy();
  });
});
```

### Integration Tests
```javascript
describe('README-summary integration', () => {
  it('should analyze project end-to-end', async () => {
    const analysis = await analyzeProjectWithReadme(sampleProject, token);
    expect(analysis).toHaveProperty('main_function');
    expect(analysis).toHaveProperty('core_advantages');
    expect(analysis).toHaveProperty('use_cases');
  });
});
```

## Performance Considerations

### Optimization Strategies
1. **Caching**: Cache README content to avoid repeated API calls
2. **Batching**: Process multiple projects in parallel when possible
3. **Streaming**: Use streaming LLM responses for large READMEs
4. **Timeout**: Implement reasonable timeout (30s per LLM call)

### Estimated Performance
- README fetch: 200-500ms per repository
- LLM analysis: 2-5s per repository
- Total per project: 2.5-5.5s
- Batch processing (5 projects): 5-15s (with parallelization)

## Migration Path

### Phase 1: Implementation (Current)
- Implement core modules
- Add to existing pipeline as optional enhancement
- Maintain backward compatibility

### Phase 2: Integration
- Update `analyze_and_report.js` to use new feature
- Add feature flag: `USE_README_SUMMARY=true`

### Phase 3: Production
- Enable feature by default
- Monitor metrics (accuracy, performance)
- Retire old hardcoded logic

## Future Enhancements

1. **Multi-language Support**: Analyze READMEs in different languages
2. **Version Tracking**: Track README changes over time
3. **Enhanced Analysis**: Extract more insights (dependencies, architecture patterns)
4. **Code Quality Metrics**: Combine with static analysis tools
5. **Community Signals**: Integrate discussions, issues, PRs

## Metrics & Monitoring

### Key Metrics
- README fetch success rate
- LLM API response time
- Analysis accuracy (manual sample validation)
- Fallback rate (hardcoded inference usage)

### Logging
```javascript
logger.info('README analysis completed', {
  repo: project.name,
  method: 'llm' | 'fallback',
  duration_ms: duration,
  readme_length: readme.length
});
```

## Version History
- v1.0.0 (2026-03-14): Initial implementation
