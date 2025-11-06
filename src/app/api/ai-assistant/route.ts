import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'
import { CohereClient } from 'cohere-ai'

// Create server-side Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// Initialize Cohere for re-ranking (optional - only if API key is provided)
const cohere = process.env.COHERE_API_KEY ? new CohereClient({
  token: process.env.COHERE_API_KEY
}) : null

export async function POST(request: NextRequest) {
  try {
    const { message, images, pdfs, userRole, conversationHistory = [] } = await request.json()

    if ((!message || typeof message !== 'string') && (!images || images.length === 0) && (!pdfs || pdfs.length === 0)) {
      return NextResponse.json(
        { error: 'Message, images, or PDFs are required' },
        { status: 400 }
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      )
    }

    // Parse PDFs if present
    let pdfContent = ''
    if (pdfs && pdfs.length > 0) {
      for (const pdf of pdfs) {
        try {
          // Convert base64 to blob
          const base64Data = pdf.data.split(',')[1]
          const binaryData = Buffer.from(base64Data, 'base64')
          const blob = new Blob([binaryData], { type: 'application/pdf' })
          const file = new File([blob], pdf.name, { type: 'application/pdf' })

          // Use the existing parse-document API
          const formData = new FormData()
          formData.append('file', file)

          const parseResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/parse-document`, {
            method: 'POST',
            body: formData
          })

          if (parseResponse.ok) {
            const result = await parseResponse.json()
            if (result.success && result.content) {
              pdfContent += `\n\n[PDF: ${pdf.name}]\n${result.content}\n`
            }
          }
        } catch (error) {
          console.error(`Error parsing PDF ${pdf.name}:`, error)
        }
      }
    }

    // Decide when to use RAG (knowledge-base retrieval)
    // If the user attaches images and asks a short/vision-style question
    // like "what breed is this?", prefer pure vision without RAG.
    // Reserve RAG for policy/process/KB-style questions.
    const isImageFocusedQuery = (text: unknown, hasImagesFlag: boolean) => {
      if (!hasImagesFlag) return false
      if (!text || typeof text !== 'string') return true
      const q = text.trim()
      if (!q) return true
      // Heuristics for vision-style prompts
      const patterns = [
        /\b(what|which)\s+(breed|color|colour)\b/i,
        /\bwhat\s+is\s+(this|in\s+the\s+(image|photo|picture))\b/i,
        /\bdescribe(\s+the\s+(image|photo|picture))?\b/i,
        /\bidentify\b/i,
        /\bhow\s+many\b/i,
      ]
      if (patterns.some((re) => re.test(q))) return true
      // Very short questions with images are usually vision-oriented
      return hasImagesFlag && q.length <= 40
    }

    // Skip RAG for image-focused questions
    let relevantChunks = null
    const shouldUseRAG = Boolean(message && message.trim().length > 0) &&
                         !isImageFocusedQuery(message, Boolean(images?.length))

    if (shouldUseRAG) {
      // Generate embedding for the user's question directly with OpenAI
      const searchQuery = message || 'analyzing attached files'
      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: searchQuery.replace(/\n/g, ' ').substring(0, 8000),
      })
      const questionEmbedding = embeddingResponse.data[0].embedding

      // STAGE 1: Retrieve candidates using vector similarity
      // Retrieve more candidates (20-30) for re-ranking
      const candidateCount = cohere ? 25 : 5 // Get more if we're re-ranking
      const { data: candidateChunks, error: searchError } = await supabase
        .rpc('search_similar_chunks', {
          query_embedding: questionEmbedding,
          match_threshold: 0.1, // Lower threshold for first stage to get more candidates
          match_count: candidateCount
        })

      if (searchError) {
        console.error('Vector search error:', searchError)
      }

      // STAGE 2: Re-rank with Cohere (if available)
      relevantChunks = candidateChunks
      if (cohere && candidateChunks && candidateChunks.length > 0) {
        try {
          console.log(`Re-ranking ${candidateChunks.length} candidates with Cohere...`)

          // Prepare documents for re-ranking
          const documents = candidateChunks.map((chunk: any) => chunk.chunk_text)

          // Call Cohere re-rank API
          const reranked = await cohere.rerank({
            model: 'rerank-english-v3.0', // or 'rerank-multilingual-v3.0' for multilingual
            query: searchQuery,
            documents: documents,
            topN: 5, // Return top 5 after re-ranking
            returnDocuments: false // We already have the documents
          })

          // Map re-ranked results back to original chunks
          relevantChunks = reranked.results.map((result: any) => {
            const chunk = candidateChunks[result.index]
            return {
              ...chunk,
              // Add re-ranking score for debugging
              rerank_score: result.relevanceScore,
              // Keep original similarity for comparison
              original_similarity: chunk.similarity
            }
          })

          console.log(`Re-ranking improved results. Top score: ${reranked.results[0]?.relevanceScore}`)
        } catch (rerankError) {
          console.error('Re-ranking failed, falling back to vector search only:', rerankError)
          // Fall back to top 5 from vector search
          relevantChunks = candidateChunks?.slice(0, 5)
        }
      }
    } else {
      console.log('Skipping RAG - image-focused or no text context')
    }

    // Get document details for the relevant chunkswh
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

    // Prepare messages for OpenAI with conversation history
    const hasImages = images && images.length > 0
    const imageQuery = isImageFocusedQuery(message, Boolean(hasImages))
    const hasPDFs = pdfContent && pdfContent.trim().length > 0
    const hasRAGContext = contextText && contextText.trim().length > 0

    let systemPrompt = getSystemPrompt(userRole || 'adopter')

    // Add appropriate instructions based on what's available
    if (hasImages && !hasRAGContext && (imageQuery || !message?.trim())) {
      // Image-only query
      systemPrompt += `

IMPORTANT INSTRUCTIONS:
1. Analyze the provided image(s) carefully
2. Describe what you see in detail (animals, environment, conditions, etc.)
3. Provide relevant advice or information based on the image content
4. If it's a pet image, comment on breed, health, behavior cues, or care needs
5. Be helpful and informative based purely on visual analysis
6. Do NOT cite knowledge base sources - focus on image analysis`
    } else if (hasRAGContext) {
      // Has RAG context
      systemPrompt += `

IMPORTANT INSTRUCTIONS:
1. Use the provided context documents to answer the user's question accurately
2. If the context contains relevant information, base your answer primarily on that information
3. If the context doesn't contain relevant information for the specific question, clearly state that you don't have specific information about that topic in the knowledge base
4. Always be helpful and provide general guidance when specific information isn't available
5. Cite your sources when using information from the knowledge base
6. Keep responses concise but comprehensive
7. Remember the conversation history and maintain context throughout the chat
${hasImages ? '8. If images are provided, analyze them in conjunction with the context documents' : ''}

Context from Knowledge Base:
${contextText}
${pdfContent ? `\nPDF Content:\n${pdfContent}` : ''}`
    } else {
      // No RAG context available
      systemPrompt += `

IMPORTANT: ${hasPDFs ? 'Using PDF content provided.' : 'The knowledge base search didn\'t return any relevant documents for this query.'} Please provide helpful general information about pet adoption and animal care${hasPDFs ? ' combined with the PDF content' : ', but clearly indicate that you don\'t have access to specific organizational policies or procedures'}. Remember the conversation history and maintain context throughout the chat.
${pdfContent ? `\nPDF Content:\n${pdfContent}` : ''}`
    }

    const systemMessage = {
      role: 'system' as const,
      content: systemPrompt
    }

    // Build messages array with conversation history
    const messages: Array<{role: 'system' | 'user' | 'assistant', content: string | Array<any>}> = [systemMessage]

    // Add conversation history (excluding the initial AI greeting to avoid confusion)
    if (conversationHistory && Array.isArray(conversationHistory)) {
      const filteredHistory = conversationHistory.filter((msg: any) => {
        // Skip the initial AI greeting message
        return !(msg.role === 'assistant' && msg.content.includes("I'm your AI assistant for shelter management"))
      })
      messages.push(...filteredHistory)
    }

    // Add the current message with images if present
    if (images && images.length > 0) {
      // Use vision model for image analysis
      const contentParts: Array<any> = []

      if (message && message.trim()) {
        contentParts.push({
          type: 'text',
          text: message
        })
      }

      // Add all images
      images.forEach((image: string) => {
        contentParts.push({
          type: 'image_url',
          image_url: {
            url: image
          }
        })
      })

      messages.push({
        role: 'user' as const,
        content: contentParts
      })
    } else {
      // Text-only message
      messages.push({
        role: 'user' as const,
        content: message || 'Please analyze the attached PDFs'
      })
    }

    // Generate streaming response using OpenAI
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 1000,
      temperature: 0.7,
      stream: true,
    })

    // Create a readable stream for the response
    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) {
              controller.enqueue(encoder.encode(content))
            }
          }

          // Add source information at the end if we have context
          if (contextText && sourceInfo) {
            controller.enqueue(encoder.encode(sourceInfo))
          }

          controller.close()
        } catch (error) {
          controller.error(error)
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
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
