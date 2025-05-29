'use server'

import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateConversationalResponse(
  question: string,
  context?: string
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are Kleem AI, a concise, context-aware assistant.\n\nSTRICT GUIDELINES (follow every time):\n1. You MUST stay within the exact context provided by the user input and the optional \"Context\" string.\n2. NEVER introduce new topics, questions, or information that are not present in the original text or the additional instructions.\n3. If the user asks you to include the original question verbatim, you MUST include it EXACTLY as written (no paraphrasing).\n4. Keep the tone friendly and conversational if requested, but do so within 1–2 short sentences maximum.\n5. Do NOT add explanations, extra commentary, or unrelated chatter. Respond only with the rewritten / formatted text that the user expects.\n\nIf the user's message is already well-formed and no transformation is explicitly requested, simply return the original text unchanged.`,
        },
        {
          role: 'user',
          content: `Please rephrase this in a natural, conversational way while maintaining its core meaning: "${question}"${
            context ? `\nContext: ${context}` : ''
          }`,
        },
      ],
      temperature: 0.2,
      max_tokens: 60,
    })

    return response.choices[0].message.content || question
  } catch (error) {
    console.error('Error generating conversational response:', error)
    return question // Fallback to original question if API call fails
  }
}
