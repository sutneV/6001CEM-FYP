import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: NextRequest) {
  try {
    const { texts } = await request.json()

    if (!texts || !Array.isArray(texts)) {
      return NextResponse.json(
        { error: 'Invalid input: texts array is required' },
        { status: 400 }
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      )
    }

    // Generate embeddings for all texts
    const embeddings = await Promise.all(
      texts.map(async (text: string) => {
        const response = await openai.embeddings.create({
          model: 'text-embedding-3-small',
          input: text.replace(/\n/g, ' ').substring(0, 8000), // Limit to 8000 chars
        })
        return response.data[0].embedding
      })
    )

    return NextResponse.json({ embeddings })

  } catch (error) {
    console.error('Error generating embeddings:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Failed to generate embeddings: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to generate embeddings' },
      { status: 500 }
    )
  }
}