'use client'

import { useState } from 'react'
import { marked } from 'marked'

export default function Home() {
  const [question, setQuestion] = useState('')
  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setReport(null)

    try {
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Research failed')
      }

      const data = await response.json()
      setReport(data)
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const renderMarkdown = (content: string) => {
    return { __html: marked(content) }
  }

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            🔬 Deep Research Orchestrator
          </h1>
          <p className="text-xl text-purple-200">
            Multi-Engine AI Research Synthesis Platform
          </p>
        </header>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="question" className="block text-white font-semibold mb-2">
                Research Question
              </label>
              <textarea
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Enter your research question here..."
                className="w-full h-32 p-4 rounded-lg bg-white/90 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '🔄 Researching...' : '🚀 Start Deep Research'}
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-white p-4 rounded-lg mb-8">
            <strong>Error:</strong> {error}
          </div>
        )}

        {loading && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mb-4"></div>
              <p className="text-white text-lg">Querying multiple AI research engines...</p>
              <p className="text-purple-200 text-sm mt-2">This may take 30-60 seconds</p>
            </div>
          </div>
        )}

        {report && (
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
              <h2 className="text-3xl font-bold text-white mb-6">📊 Research Report</h2>

              <div className="space-y-6">
                {report.executiveSummary && (
                  <section>
                    <h3 className="text-2xl font-semibold text-purple-300 mb-3">Executive Summary</h3>
                    <div
                      className="prose prose-invert max-w-none text-white"
                      dangerouslySetInnerHTML={renderMarkdown(report.executiveSummary)}
                    />
                  </section>
                )}

                {report.subQuestions && report.subQuestions.length > 0 && (
                  <section>
                    <h3 className="text-2xl font-semibold text-purple-300 mb-3">Sub-Questions Analyzed</h3>
                    <ul className="list-disc list-inside space-y-2 text-white">
                      {report.subQuestions.map((sq: string, idx: number) => (
                        <li key={idx}>{sq}</li>
                      ))}
                    </ul>
                  </section>
                )}

                {report.keyFindings && (
                  <section>
                    <h3 className="text-2xl font-semibold text-purple-300 mb-3">Key Findings by Theme</h3>
                    <div
                      className="prose prose-invert max-w-none text-white"
                      dangerouslySetInnerHTML={renderMarkdown(report.keyFindings)}
                    />
                  </section>
                )}

                {report.toolComparison && (
                  <section>
                    <h3 className="text-2xl font-semibold text-purple-300 mb-3">Tool Comparison & Cross-Validation</h3>
                    <div
                      className="prose prose-invert max-w-none text-white"
                      dangerouslySetInnerHTML={renderMarkdown(report.toolComparison)}
                    />
                  </section>
                )}

                {report.risksUncertainties && (
                  <section>
                    <h3 className="text-2xl font-semibold text-purple-300 mb-3">⚠️ Risks & Uncertainties</h3>
                    <div
                      className="prose prose-invert max-w-none text-white"
                      dangerouslySetInnerHTML={renderMarkdown(report.risksUncertainties)}
                    />
                  </section>
                )}

                {report.recommendations && (
                  <section>
                    <h3 className="text-2xl font-semibold text-purple-300 mb-3">💡 Recommendations</h3>
                    <div
                      className="prose prose-invert max-w-none text-white"
                      dangerouslySetInnerHTML={renderMarkdown(report.recommendations)}
                    />
                  </section>
                )}
              </div>
            </div>

            {report.toolResponses && (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
                <h2 className="text-3xl font-bold text-white mb-6">🛠️ Individual Tool Responses</h2>
                <div className="space-y-4">
                  {Object.entries(report.toolResponses).map(([tool, response]: [string, any]) => (
                    <details key={tool} className="bg-white/5 rounded-lg p-4">
                      <summary className="cursor-pointer font-semibold text-purple-300 hover:text-purple-200">
                        {tool}
                      </summary>
                      <div className="mt-4 text-white text-sm whitespace-pre-wrap">
                        {typeof response === 'string' ? response : JSON.stringify(response, null, 2)}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
