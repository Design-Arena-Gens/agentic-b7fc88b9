# 🔬 Deep Research Orchestrator

A multi-engine AI research synthesis platform that queries multiple research engines, cross-validates findings, and generates comprehensive master reports.

## Features

- **Multi-Engine Research**: Queries OpenAI Deep Research, Perplexity Deep Research, Kimi K2, and Gemini 2.5 Pro
- **Intelligent Sub-Question Generation**: Automatically breaks down complex questions into focused sub-queries
- **Cross-Validation**: Identifies consensus and disagreements across different AI engines
- **Comprehensive Synthesis**: Generates structured reports with executive summary, key findings, tool comparison, risks, and recommendations
- **Uncertainty Marking**: Explicitly marks conflicting or uncertain information
- **Beautiful UI**: Modern, responsive interface with real-time progress indicators

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables in `.env.local`:
```
OPENAI_API_KEY=your_openai_api_key_here
```

3. Run development server:
```bash
npm run dev
```

## Deployment

Deploy to Vercel:
```bash
vercel deploy --prod
```

Set `OPENAI_API_KEY` in Vercel environment variables.
