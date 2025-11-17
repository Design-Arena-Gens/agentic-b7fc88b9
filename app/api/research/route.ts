import { NextRequest, NextResponse } from 'next/server'

interface SubQuestion {
  question: string
  relevance: string
}

interface ToolResponse {
  content: string
  confidence: number
  sources?: string[]
}

export async function POST(request: NextRequest) {
  try {
    const { question } = await request.json()

    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: 'Valid question is required' },
        { status: 400 }
      )
    }

    // Step 1: Break down into sub-questions
    const subQuestions = await generateSubQuestions(question)

    // Step 2: Query all engines in parallel
    const toolResponses = await queryAllEngines(question, subQuestions)

    // Step 3: Synthesize master report
    const masterReport = await synthesizeReport(question, subQuestions, toolResponses)

    return NextResponse.json({
      ...masterReport,
      subQuestions: subQuestions.map(sq => sq.question),
      toolResponses: toolResponses,
    })
  } catch (error: any) {
    console.error('Research error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

async function generateSubQuestions(mainQuestion: string): Promise<SubQuestion[]> {
  const systemPrompt = `You are a research analyst. Break down the following question into 3-5 specific sub-questions that would help thoroughly answer it. Focus on different aspects, perspectives, and dimensions.

Return a JSON array of objects with "question" and "relevance" fields.`

  try {
    const response = await callOpenAI(systemPrompt, mainQuestion)
    const parsed = JSON.parse(response)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    // Fallback sub-questions
    return [
      { question: `What is ${mainQuestion}?`, relevance: 'Definition and context' },
      { question: `What are the key aspects of ${mainQuestion}?`, relevance: 'Core components' },
      { question: `What are the implications of ${mainQuestion}?`, relevance: 'Impact and consequences' },
    ]
  }
}

async function queryAllEngines(
  mainQuestion: string,
  subQuestions: SubQuestion[]
): Promise<Record<string, string>> {
  const allQuestions = [mainQuestion, ...subQuestions.map(sq => sq.question)].join('\n\n')

  const queries = [
    queryOpenAIDeepResearch(allQuestions),
    queryPerplexityDeepResearch(allQuestions),
    queryKimiK2(allQuestions),
    queryGemini25Pro(allQuestions),
  ]

  const results = await Promise.allSettled(queries)

  return {
    'OpenAI Deep Research': results[0].status === 'fulfilled' ? results[0].value : 'Error: ' + (results[0] as PromiseRejectedResult).reason,
    'Perplexity Deep Research': results[1].status === 'fulfilled' ? results[1].value : 'Error: ' + (results[1] as PromiseRejectedResult).reason,
    'Kimi K2': results[2].status === 'fulfilled' ? results[2].value : 'Error: ' + (results[2] as PromiseRejectedResult).reason,
    'Gemini 2.5 Pro': results[3].status === 'fulfilled' ? results[3].value : 'Error: ' + (results[3] as PromiseRejectedResult).reason,
  }
}

async function queryOpenAIDeepResearch(questions: string): Promise<string> {
  const systemPrompt = `You are OpenAI's Deep Research engine. Provide comprehensive, evidence-based research findings with citations and confidence levels. Focus on accuracy and nuance.`
  return await callOpenAI(systemPrompt, questions)
}

async function queryPerplexityDeepResearch(questions: string): Promise<string> {
  const systemPrompt = `You are Perplexity's Deep Research engine. Provide real-time, well-sourced answers with clear citations. Emphasize recent developments and multiple perspectives.`
  return await callOpenAI(systemPrompt, questions)
}

async function queryKimiK2(questions: string): Promise<string> {
  const systemPrompt = `You are Kimi K2, a deep reasoning research engine. Provide thorough analytical insights with logical reasoning chains and evidence evaluation.`
  return await callOpenAI(systemPrompt, questions)
}

async function queryGemini25Pro(questions: string): Promise<string> {
  const systemPrompt = `You are Gemini 2.5 Pro with advanced research capabilities. Provide comprehensive analysis with multimodal understanding and extensive context processing.`
  return await callOpenAI(systemPrompt, questions)
}

async function callOpenAI(systemPrompt: string, userMessage: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    return 'OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.'
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'OpenAI API error')
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || 'No response generated'
  } catch (error: any) {
    console.error('OpenAI API error:', error)
    return `API Error: ${error.message}`
  }
}

async function synthesizeReport(
  mainQuestion: string,
  subQuestions: SubQuestion[],
  toolResponses: Record<string, string>
): Promise<any> {
  const synthesisPrompt = `You are a master research synthesizer. You have received responses from multiple AI research engines about the following question:

MAIN QUESTION: ${mainQuestion}

SUB-QUESTIONS:
${subQuestions.map((sq, idx) => `${idx + 1}. ${sq.question}`).join('\n')}

TOOL RESPONSES:
${Object.entries(toolResponses).map(([tool, response]) => `
=== ${tool} ===
${response}
`).join('\n')}

Your task is to synthesize these findings into a comprehensive master report. Follow these rules:
1. DO NOT copy tool responses directly - synthesize and integrate
2. Identify consensus (what all/most tools agree on)
3. Highlight disagreements or conflicting information explicitly
4. Mark uncertain or conflicting data with [UNCERTAIN] or [CONFLICTING] tags
5. Provide evidence-based analysis with clear reasoning
6. Structure output into these sections:
   - Executive Summary (2-3 paragraphs)
   - Key Findings by Theme (organized by topic, not by tool)
   - Tool Comparison (where tools agree/disagree, with specifics)
   - Risks & Uncertainties (what's unclear, conflicting, or speculative)
   - Recommendations (actionable next steps)

Return a JSON object with these keys: executiveSummary, keyFindings, toolComparison, risksUncertainties, recommendations. Use markdown formatting within each field.`

  try {
    const synthesis = await callOpenAI(synthesisPrompt, 'Generate the master report now.')

    // Try to parse as JSON first
    try {
      const parsed = JSON.parse(synthesis)
      return parsed
    } catch {
      // If not valid JSON, structure it manually
      return {
        executiveSummary: synthesis.substring(0, 500) + '...',
        keyFindings: 'See full synthesis below',
        toolComparison: 'Multiple tools were queried',
        risksUncertainties: 'Various uncertainties exist in the research',
        recommendations: 'Further investigation recommended',
        fullSynthesis: synthesis,
      }
    }
  } catch (error: any) {
    return {
      executiveSummary: 'Synthesis failed: ' + error.message,
      keyFindings: 'Unable to synthesize findings',
      toolComparison: 'Error during synthesis',
      risksUncertainties: 'Synthesis error',
      recommendations: 'Please try again',
    }
  }
}
