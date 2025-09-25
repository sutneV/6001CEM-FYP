import { NextRequest, NextResponse } from 'next/server'
import { LlamaParse } from 'llama-parse'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    const apiKey = process.env.LLAMA_PARSE_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'LlamaParse API key not configured' },
        { status: 500 }
      )
    }

    try {
      const parser = new LlamaParse({ apiKey })
      const result = await parser.parseFile(file)

      if (result.markdown && result.markdown.trim()) {
        return NextResponse.json({
          success: true,
          content: result.markdown.trim(),
          metadata: result.job_metadata
        })
      } else {
        return NextResponse.json({
          success: false,
          error: 'LlamaParse returned empty content'
        })
      }

    } catch (llamaError) {
      console.error('LlamaParse error:', llamaError)
      return NextResponse.json({
        success: false,
        error: `LlamaParse failed: ${llamaError instanceof Error ? llamaError.message : 'Unknown error'}`
      })
    }

  } catch (error) {
    console.error('Document parsing API error:', error)
    return NextResponse.json(
      { error: 'Failed to process document' },
      { status: 500 }
    )
  }
}