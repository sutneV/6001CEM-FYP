import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface DocumentFolder {
  id: string
  name: string
  description: string | null
  is_open: boolean
  created_at: string
  updated_at: string
}

export interface Document {
  id: string
  title: string
  content: string
  status: 'indexed' | 'processing' | 'error'
  chunks: number
  last_updated: string
  size_kb: number
  folder_id: string
  embedding: number[] | null
  created_at: string
  updated_at: string
}

export interface DocumentChunk {
  id: string
  document_id: string
  chunk_text: string
  chunk_index: number
  token_count: number
  embedding: number[] | null
  created_at: string
  updated_at: string
}

export interface DocumentWithFolder extends Document {
  folder: DocumentFolder
}

export interface KnowledgeStats {
  totalDocuments: number
  totalChunks: number
  indexedDocuments: number
  processingDocuments: number
  errorDocuments: number
  storageUsed: string
}

// Folder operations
export async function getFolders(): Promise<DocumentFolder[]> {
  const { data, error } = await supabase
    .from('document_folders')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching folders:', error)
    throw new Error(`Failed to fetch folders: ${error.message}`)
  }

  return data || []
}

export async function createFolder(
  name: string,
  description?: string
): Promise<DocumentFolder> {
  const { data, error } = await supabase
    .from('document_folders')
    .insert({
      name,
      description,
      is_open: false
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating folder:', error)
    throw new Error(`Failed to create folder: ${error.message}`)
  }

  return data
}

export async function updateFolder(
  id: string,
  updates: Partial<Pick<DocumentFolder, 'name' | 'description' | 'is_open'>>
): Promise<DocumentFolder> {
  const { data, error } = await supabase
    .from('document_folders')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating folder:', error)
    throw new Error(`Failed to update folder: ${error.message}`)
  }

  return data
}

export async function deleteFolder(id: string): Promise<void> {
  const { error } = await supabase
    .from('document_folders')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting folder:', error)
    throw new Error(`Failed to delete folder: ${error.message}`)
  }
}

// Document operations
export async function getDocuments(): Promise<Document[]> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching documents:', error)
    throw new Error(`Failed to fetch documents: ${error.message}`)
  }

  return data || []
}

export async function getDocumentsByFolder(folderId: string): Promise<Document[]> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('folder_id', folderId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching documents by folder:', error)
    throw new Error(`Failed to fetch documents: ${error.message}`)
  }

  return data || []
}

export async function getDocument(id: string): Promise<Document | null> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Document not found
    }
    console.error('Error fetching document:', error)
    throw new Error(`Failed to fetch document: ${error.message}`)
  }

  return data
}

export async function createDocument(
  document: Omit<Document, 'id' | 'created_at' | 'updated_at' | 'last_updated'>
): Promise<Document> {
  const { data, error } = await supabase
    .from('documents')
    .insert({
      ...document,
      last_updated: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating document:', error)
    throw new Error(`Failed to create document: ${error.message}`)
  }

  return data
}

export async function updateDocument(
  id: string,
  updates: Partial<Omit<Document, 'id' | 'created_at' | 'updated_at'>>
): Promise<Document> {
  const { data, error } = await supabase
    .from('documents')
    .update({
      ...updates,
      last_updated: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating document:', error)
    throw new Error(`Failed to update document: ${error.message}`)
  }

  return data
}

export async function deleteDocument(id: string): Promise<void> {
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting document:', error)
    throw new Error(`Failed to delete document: ${error.message}`)
  }
}

// Analytics and stats
export async function getKnowledgeStats(): Promise<KnowledgeStats> {
  // Get document counts by status
  const { data: statusCounts, error: statusError } = await supabase
    .from('documents')
    .select('status')

  if (statusError) {
    console.error('Error fetching document status counts:', statusError)
    throw new Error(`Failed to fetch stats: ${statusError.message}`)
  }

  // Get total chunks
  const { data: chunkData, error: chunkError } = await supabase
    .from('documents')
    .select('chunks')

  if (chunkError) {
    console.error('Error fetching chunk counts:', chunkError)
    throw new Error(`Failed to fetch chunk stats: ${chunkError.message}`)
  }

  // Get storage usage
  const { data: sizeData, error: sizeError } = await supabase
    .from('documents')
    .select('size_kb')

  if (sizeError) {
    console.error('Error fetching size data:', sizeError)
    throw new Error(`Failed to fetch size stats: ${sizeError.message}`)
  }

  const docs = statusCounts || []
  const totalDocuments = docs.length
  const indexedDocuments = docs.filter(d => d.status === 'indexed').length
  const processingDocuments = docs.filter(d => d.status === 'processing').length
  const errorDocuments = docs.filter(d => d.status === 'error').length

  const totalChunks = (chunkData || []).reduce((sum, doc) => sum + (doc.chunks || 0), 0)
  const totalSizeKb = (sizeData || []).reduce((sum, doc) => sum + (doc.size_kb || 0), 0)
  const storageUsed = totalSizeKb > 1024
    ? `${(totalSizeKb / 1024).toFixed(1)} MB`
    : `${totalSizeKb} KB`

  return {
    totalDocuments,
    totalChunks,
    indexedDocuments,
    processingDocuments,
    errorDocuments,
    storageUsed
  }
}

// Search documents
export async function searchDocuments(query: string): Promise<Document[]> {
  if (!query.trim()) {
    return getDocuments()
  }

  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error searching documents:', error)
    throw new Error(`Failed to search documents: ${error.message}`)
  }

  return data || []
}

// Reindex document (update status to processing)
export async function reindexDocument(id: string): Promise<Document> {
  return updateDocument(id, {
    status: 'processing',
    chunks: 0
  })
}

// Document chunks operations
export async function getDocumentChunks(documentId: string): Promise<DocumentChunk[]> {
  const { data, error } = await supabase
    .from('document_chunks')
    .select('*')
    .eq('document_id', documentId)
    .order('chunk_index', { ascending: true })

  if (error) {
    console.error('Error fetching document chunks:', error)
    throw new Error(`Failed to fetch document chunks: ${error.message}`)
  }

  return data || []
}

export async function createDocumentChunk(
  chunk: Omit<DocumentChunk, 'id' | 'created_at' | 'updated_at'>
): Promise<DocumentChunk> {
  const { data, error } = await supabase
    .from('document_chunks')
    .insert(chunk)
    .select()
    .single()

  if (error) {
    console.error('Error creating document chunk:', error)
    throw new Error(`Failed to create document chunk: ${error.message}`)
  }

  return data
}

export async function createDocumentChunks(
  chunks: Omit<DocumentChunk, 'id' | 'created_at' | 'updated_at'>[]
): Promise<DocumentChunk[]> {
  const { data, error } = await supabase
    .from('document_chunks')
    .insert(chunks)
    .select()

  if (error) {
    console.error('Error creating document chunks:', error)
    throw new Error(`Failed to create document chunks: ${error.message}`)
  }

  return data || []
}

export async function updateDocumentChunk(
  id: string,
  updates: Partial<Omit<DocumentChunk, 'id' | 'created_at' | 'updated_at'>>
): Promise<DocumentChunk> {
  const { data, error } = await supabase
    .from('document_chunks')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating document chunk:', error)
    throw new Error(`Failed to update document chunk: ${error.message}`)
  }

  return data
}

export async function deleteDocumentChunks(documentId: string): Promise<void> {
  const { error } = await supabase
    .from('document_chunks')
    .delete()
    .eq('document_id', documentId)

  if (error) {
    console.error('Error deleting document chunks:', error)
    throw new Error(`Failed to delete document chunks: ${error.message}`)
  }
}

// Vector similarity search
export async function searchSimilarChunks(
  queryEmbedding: number[],
  limit: number = 10,
  similarityThreshold: number = 0.7
): Promise<DocumentChunk[]> {
  const { data, error } = await supabase.rpc('search_similar_chunks', {
    query_embedding: queryEmbedding,
    match_threshold: similarityThreshold,
    match_count: limit
  })

  if (error) {
    console.error('Error searching similar chunks:', error)
    throw new Error(`Failed to search similar chunks: ${error.message}`)
  }

  return data || []
}

// Process document with chunks and embeddings
export async function processDocumentWithChunks(
  documentId: string,
  textChunks: string[],
  chunkEmbeddings: number[][],
  documentEmbedding: number[]
): Promise<void> {
  try {
    // Delete existing chunks
    await deleteDocumentChunks(documentId)

    // Create new chunks
    const chunks = textChunks.map((text, index) => ({
      document_id: documentId,
      chunk_text: text,
      chunk_index: index,
      token_count: Math.ceil(text.length / 4), // Rough token estimate
      embedding: chunkEmbeddings[index]
    }))

    await createDocumentChunks(chunks)

    // Update document with summary embedding and chunk count
    await updateDocument(documentId, {
      embedding: documentEmbedding,
      chunks: chunks.length,
      status: 'indexed'
    })
  } catch (error) {
    console.error('Error processing document with chunks:', error)
    // Update document status to error
    await updateDocument(documentId, { status: 'error' })
    throw error
  }
}