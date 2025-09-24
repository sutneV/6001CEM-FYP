import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { generateEmbedding } from '@/lib/utils/embeddings'
import { supabase } from '@/lib/supabase/client'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: NextRequest) {
  try {
    const { message, userRole } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      )
    }

    // Generate embedding for the user's question
    const questionEmbedding = await generateEmbedding(message)

    // Search for relevant document chunks using vector similarity
    const { data: relevantChunks, error: searchError } = await supabase
      .rpc('search_similar_chunks', {
        query_embedding: questionEmbedding,
        match_threshold: 0.7,
        match_count: 5
      })

    if (searchError) {
      console.error('Vector search error:', searchError)
    }

    // Get document details for the relevant chunks
    let contextDocuments = []
    if (relevantChunks && relevantChunks.length > 0) {
      const documentIds = [...new Set(relevantChunks.map((chunk: any) => chunk.document_id))]

      const { data: documents, error: docError } = await supabase
        .from('documents')
        .select('id, title, content, folder_id, document_folders(name)')
        .in('id', documentIds)

      if (!docError && documents) {
        contextDocuments = documents
      }
    }

    // Prepare context from relevant chunks
    let contextText = ''
    let sourceInfo = ''

    if (relevantChunks && relevantChunks.length > 0) {
      const contextChunks = relevantChunks.slice(0, 5) // Limit to top 5 most relevant chunks

      contextText = contextChunks
        .map((chunk: any, index: number) => {
          const doc = contextDocuments.find(d => d.id === chunk.document_id)
          return `[Source ${index + 1}: ${doc?.title || 'Unknown Document'}]\n${chunk.chunk_text}`
        })
        .join('\n\n')

      // Create source information
      const uniqueSources = [...new Set(contextChunks.map((chunk: any) => {
        const doc = contextDocuments.find(d => d.id === chunk.document_id)
        return doc?.title || 'Unknown Document'
      }))]
      sourceInfo = `\n\n**Sources consulted:** ${uniqueSources.join(', ')}`
    }

    // Create role-specific system prompt
    const getSystemPrompt = (role: string) => {
      const basePrompt = `You are a helpful AI assistant for an animal shelter and pet adoption platform. You have access to a knowledge base of documents containing information about pet care, adoption procedures, shelter policies, and related topics.`

      if (role === 'admin') {
        return `${basePrompt} You are assisting an administrator who manages the platform and needs detailed information about policies, procedures, and administrative tasks.`
      } else if (role === 'shelter') {
        return `${basePrompt} You are assisting a shelter staff member who needs information about animal care, adoption processes, and shelter operations.`
      } else {
        return `${basePrompt} You are assisting an adopter who is looking for information about pet adoption, care, and related topics.`
      }
    }

    // Prepare messages for OpenAI
    const messages = [
      {
        role: 'system' as const,
        content: contextText
          ? `${getSystemPrompt(userRole || 'adopter')}

IMPORTANT INSTRUCTIONS:
1. Use the provided context documents to answer the user's question accurately
2. If the context contains relevant information, base your answer primarily on that information
3. If the context doesn't contain relevant information for the specific question, clearly state that you don't have specific information about that topic in the knowledge base
4. Always be helpful and provide general guidance when specific information isn't available
5. Cite your sources when using information from the knowledge base
6. Keep responses concise but comprehensive

Context from Knowledge Base:
${contextText}`
          : `${getSystemPrompt(userRole || 'adopter')}

IMPORTANT: The knowledge base search didn't return any relevant documents for this query. Please provide helpful general information about pet adoption and animal care, but clearly indicate that you don't have access to specific organizational policies or procedures. Encourage the user to contact the shelter directly for specific information.`
      },
      {
        role: 'user' as const,
        content: message
      }
    ]

    // Generate response using OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages,
      max_tokens: 1000,
      temperature: 0.7,
    })

    const response = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.'

    return NextResponse.json({
      response: response + (contextText ? sourceInfo : ''),
      hasRelevantContext: Boolean(contextText),
      sourceCount: relevantChunks?.length || 0
    })

  } catch (error) {
    console.error('AI Assistant error:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Failed to process request: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}