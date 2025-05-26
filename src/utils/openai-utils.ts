import { generateConversationalResponse } from '@/app/api/openai/actions'

export { generateConversationalResponse }

export async function enhanceFormResponseWithAI(
  message: string,
  context?: {
    respondentName?: string
    formName?: string
    additionalContext?: string
  }
): Promise<string> {
  try {
    const contextString = context
      ? `This is a form response from ${
          context.respondentName || 'a user'
        } via ${context.formName || 'a form'}${
          context.additionalContext ? `. ${context.additionalContext}` : ''
        }`
      : undefined

    const enhancedMessage = await generateConversationalResponse(
      message,
      contextString
    )
    return enhancedMessage
  } catch (error) {
    console.error('Error enhancing form response with AI:', error)
    return message // Return original message if enhancement fails
  }
}

export async function generateResponseSummary(
  responses: Record<string, unknown>,
  formName?: string
): Promise<string> {
  try {
    const responseText = Object.entries(responses)
      .filter(([, value]) => value && typeof value === 'string')
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n')

    const context = formName
      ? `This is a summary of responses from the form "${formName}"`
      : 'This is a summary of form responses'

    const summary = await generateConversationalResponse(
      `Please provide a brief summary of these form responses:\n\n${responseText}`,
      context
    )

    return summary
  } catch (error) {
    console.error('Error generating response summary:', error)
    return 'Unable to generate summary'
  }
}

export async function analyzeResponseSentiment(message: string): Promise<{
  sentiment: 'positive' | 'negative' | 'neutral'
  confidence: number
  summary: string
}> {
  try {
    const analysis = await generateConversationalResponse(
      `Analyze the sentiment of this message and provide a JSON response with sentiment (positive/negative/neutral), confidence (0-1), and a brief summary: "${message}"`,
      'You are analyzing customer feedback sentiment. Respond only with valid JSON.'
    )

    // Try to parse the response as JSON
    try {
      const parsed = JSON.parse(analysis)
      return {
        sentiment: parsed.sentiment || 'neutral',
        confidence: parsed.confidence || 0.5,
        summary: parsed.summary || 'Unable to analyze sentiment',
      }
    } catch {
      // If JSON parsing fails, return a default analysis
      return {
        sentiment: 'neutral',
        confidence: 0.5,
        summary: analysis,
      }
    }
  } catch (error) {
    console.error('Error analyzing sentiment:', error)
    return {
      sentiment: 'neutral',
      confidence: 0,
      summary: 'Unable to analyze sentiment',
    }
  }
}
