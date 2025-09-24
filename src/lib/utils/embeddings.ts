/**
 * Embedding utilities for document vector storage
 * This module handles generating embeddings for documents using OpenAI's API
 */

interface EmbeddingResponse {
  object: string
  data: Array<{
    object: string
    index: number
    embedding: number[]
  }>
  model: string
  usage: {
    prompt_tokens: number
    total_tokens: number
  }
}

/**
 * Generate embeddings for text content using OpenAI's text-embedding-3-small model via API route
 * @param text - The text content to generate embeddings for
 * @returns Promise<number[]> - The embedding vector
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    // Clean and truncate text
    const cleanText = text.replace(/\n/g, ' ').trim()
    const truncatedText = cleanText.substring(0, 8000) // Limit to ~8000 chars for embeddings

    const response = await fetch('/api/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ texts: [truncatedText] }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to generate embedding')
    }

    const data = await response.json()
    return data.embeddings[0]
  } catch (error) {
    console.error('Error generating embedding:', error)
    throw new Error(`Failed to generate embedding: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Generate embeddings for multiple text chunks via API route
 * @param textChunks - Array of text chunks to process
 * @returns Promise<number[][]> - Array of embedding vectors
 */
export async function generateBatchEmbeddings(textChunks: string[]): Promise<number[][]> {
  if (!textChunks || textChunks.length === 0) {
    return []
  }

  try {
    // Process texts in batches to avoid rate limits
    const batchSize = 10
    const embeddings: number[][] = []

    for (let i = 0; i < textChunks.length; i += batchSize) {
      const batch = textChunks.slice(i, i + batchSize)

      const response = await fetch('/api/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ texts: batch }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate batch embeddings')
      }

      const data = await response.json()
      embeddings.push(...data.embeddings)

      // Add small delay between batches to respect rate limits
      if (i + batchSize < textChunks.length) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    return embeddings
  } catch (error) {
    console.error('Error generating batch embeddings:', error)
    throw error
  }
}

/**
 * Chunk text into smaller pieces for processing
 * This is useful for large documents that need to be split for embedding
 * @param text - The text to chunk
 * @param chunkSize - Maximum characters per chunk (default: 1000)
 * @param overlap - Characters to overlap between chunks (default: 200)
 * @returns string[] - Array of text chunks
 */
export function chunkText(
  text: string,
  chunkSize: number = 1000,
  overlap: number = 200
): string[] {
  if (text.length <= chunkSize) {
    return [text]
  }

  const chunks: string[] = []
  let start = 0

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length)
    let chunk = text.slice(start, end)

    // Try to break at sentence boundaries
    if (end < text.length) {
      const lastPeriod = chunk.lastIndexOf('.')
      const lastNewline = chunk.lastIndexOf('\n')
      const breakPoint = Math.max(lastPeriod, lastNewline)

      if (breakPoint > start + chunkSize * 0.5) {
        chunk = text.slice(start, breakPoint + 1)
        start = breakPoint + 1 - overlap
      } else {
        start = end - overlap
      }
    } else {
      start = end
    }

    if (chunk.trim()) {
      chunks.push(chunk.trim())
    }
  }

  return chunks
}

/**
 * Process a document by chunking and generating embeddings
 * @param title - Document title
 * @param content - Document content
 * @returns Promise with document chunks and their embeddings
 */
export async function processDocumentForEmbedding(
  title: string,
  content: string
): Promise<{
  chunks: string[]
  embeddings: number[][]
  combinedEmbedding: number[]
}> {
  // Combine title and content for full context
  const fullText = `${title}\n\n${content}`

  // Chunk the text
  const chunks = chunkText(fullText)

  // Generate embeddings for each chunk
  const chunkEmbeddings = await generateBatchEmbeddings(chunks)

  // Generate a combined embedding for the entire document
  const combinedText = chunks.join(' ')
  const combinedEmbedding = await generateEmbedding(combinedText.slice(0, 8000)) // Limit to 8k chars

  return {
    chunks,
    embeddings: chunkEmbeddings,
    combinedEmbedding
  }
}