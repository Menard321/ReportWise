import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getUserSession } from '@/lib/auth'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'fake-key-for-builds'
})

export async function POST(req: Request) {
  try {
    const session = await getUserSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!process.env.ANTHROPIC_API_KEY) {
       // Return a graceful mocked fallback if no key is present, as per Phase 2 offline reqs
       return NextResponse.json({
         improvedText: "MOCK AI (API Key Missing): " + (await req.json()).text
       })
    }

    const { text, language = 'en' } = await req.json()

    const promptText = `
      You are an expert academic and professional report editor. 
      Improve the following text for clarity, grammar, and professional tone.
      Ensure the output language is ${language === 'sw' ? 'Swahili' : 'English'}.
      Return ONLY the improved string, no conversational filler or markdown code blocks.
      
      Text to improve:
      ${text}
    `

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1500,
      temperature: 0.3,
      messages: [
        { role: 'user', content: promptText }
      ]
    })

    const improvedText = (response.content[0] as any)?.text || text

    return NextResponse.json({ improvedText })
  } catch (error) {
    console.error('AI Error:', error)
    return NextResponse.json({ error: 'AI processing failed' }, { status: 500 })
  }
}
