/**
 * File parsing utilities for different document types
 * Handles PDF, TXT, MD, DOC, DOCX files with proper text extraction
 */

// Dynamic import to avoid SSR issues with PDF.js
let pdfjs: any = null

// Initialize PDF.js only on client side
const initPDFJS = async () => {
  if (typeof window !== 'undefined' && !pdfjs) {
    try {
      pdfjs = await import('pdfjs-dist')
      pdfjs.GlobalWorkerOptions.workerSrc = '/pdf-worker/pdf.worker.min.mjs'
    } catch (error) {
      console.error('Failed to load PDF.js:', error)
      throw new Error('PDF.js failed to load')
    }
  }
  return pdfjs
}

export interface ParsedDocument {
  content: string
  title: string
  size: number
  type: string
  chunks: string[]
}

/**
 * Parse PDF file and extract text content
 */
async function parsePDF(file: File): Promise<string> {
  try {
    // Initialize PDF.js dynamically
    const pdfjsLib = await initPDFJS()
    if (!pdfjsLib) {
      throw new Error('PDF.js is not available')
    }

    const arrayBuffer = await file.arrayBuffer()
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      // Disable streaming to avoid worker issues
      disableStream: true,
      // Disable auto-fetch to avoid network requests
      disableAutoFetch: true,
      // Use legacy build for better compatibility
      useSystemFonts: true
    })

    const pdf = await loadingTask.promise
    let fullText = ''

    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum)
        const textContent = await page.getTextContent()

        // Extract text items and join them
        const pageText = textContent.items
          .filter((item: any) => item.str && typeof item.str === 'string')
          .map((item: any) => item.str.trim())
          .filter(text => text.length > 0)
          .join(' ')

        if (pageText.trim()) {
          fullText += pageText + '\n\n'
        }
      } catch (pageError) {
        console.warn(`Error processing page ${pageNum}:`, pageError)
        // Continue with other pages
      }
    }

    // Clean up the extracted text
    const cleanText = fullText
      .trim()
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      // Remove weird characters but keep basic punctuation
      .replace(/[^\w\s.,!?;:()\-\[\]{}'"]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    if (!cleanText || cleanText.length < 10) {
      return `[PDF Document: ${file.name}]

This PDF was processed but contained no readable text content. This could be because:

1. The PDF contains only images or scanned documents
2. The PDF is password protected
3. The PDF uses unsupported fonts or encoding

File size: ${Math.round(file.size / 1024)} KB

To extract text from image-based PDFs, you would need OCR (Optical Character Recognition) processing.`
    }

    return cleanText

  } catch (error) {
    console.error('Error parsing PDF:', error)

    // Check if it's a PDF.js loading error
    if (error instanceof Error && error.message.includes('PDF.js')) {
      return `[PDF Processing Unavailable: ${file.name}]

PDF text extraction is currently unavailable. This could be due to:

1. Browser compatibility issues
2. PDF.js library failed to load
3. Security restrictions

File size: ${Math.round(file.size / 1024)} KB

Please try:
- Refreshing the page and trying again
- Converting the PDF to a text file (.txt) or markdown (.md)
- Using a different browser

The document has been uploaded but without extracted text content.`
    }

    // Return a more helpful error message for other errors
    return `[PDF Processing Error: ${file.name}]

Could not extract text from this PDF file. This could be due to:

1. Corrupted or unsupported PDF format
2. Password-protected PDF
3. PDF contains only images without text layer
4. Browser security restrictions

File size: ${Math.round(file.size / 1024)} KB

Error details: ${error instanceof Error ? error.message : 'Unknown error'}

Please try:
- Converting the PDF to a text file
- Ensuring the PDF is not password protected
- Using a different PDF file`
  }
}

/**
 * Parse plain text file
 */
async function parseTextFile(file: File): Promise<string> {
  try {
    return await file.text()
  } catch (error) {
    console.error('Error parsing text file:', error)
    throw new Error(`Failed to parse text file: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Get file extension from filename
 */
function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || ''
}

/**
 * Get clean filename without extension
 */
function getCleanFilename(filename: string): string {
  return filename.replace(/\.[^/.]+$/, '')
}

/**
 * Validate if file type is supported
 */
export function isSupportedFileType(file: File): boolean {
  const supportedTypes = [
    'application/pdf',
    'text/plain',
    'text/markdown',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]

  const supportedExtensions = ['pdf', 'txt', 'md', 'doc', 'docx']
  const extension = getFileExtension(file.name)

  return supportedTypes.includes(file.type) || supportedExtensions.includes(extension)
}

/**
 * Get file type display name
 */
export function getFileTypeDisplayName(file: File): string {
  const extension = getFileExtension(file.name)

  switch (extension) {
    case 'pdf':
      return 'PDF Document'
    case 'txt':
      return 'Text File'
    case 'md':
      return 'Markdown File'
    case 'doc':
      return 'Word Document (basic)'
    case 'docx':
      return 'Word Document (basic)'
    default:
      return 'Document'
  }
}

/**
 * Chunk text into smaller pieces for processing
 * This is useful for large documents that need to be split for embedding
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
 * Parse file content based on its type
 */
export async function parseFile(file: File): Promise<ParsedDocument> {
  if (!isSupportedFileType(file)) {
    throw new Error(`Unsupported file type: ${file.type || getFileExtension(file.name)}`)
  }

  const extension = getFileExtension(file.name)
  let content: string

  try {
    switch (extension) {
      case 'pdf':
        content = await parsePDF(file)
        break

      case 'txt':
      case 'md':
        content = await parseTextFile(file)
        break

      case 'doc':
      case 'docx':
        // For now, we'll treat these as text files
        // In a production app, you'd want to use a proper DOC/DOCX parser
        try {
          content = await parseTextFile(file)
        } catch {
          content = `[${getFileTypeDisplayName(file)} - Content extraction not yet supported. Please convert to PDF or TXT format.]`
        }
        break

      default:
        throw new Error(`Parsing not implemented for file type: ${extension}`)
    }

    // Validate content
    if (!content || content.trim().length === 0) {
      throw new Error('No readable content found in file')
    }

    const cleanContent = content.trim()

    // Create chunks from the content
    const textChunks = chunkText(cleanContent)

    return {
      content: cleanContent,
      title: getCleanFilename(file.name),
      size: file.size,
      type: extension,
      chunks: textChunks
    }

  } catch (error) {
    console.error(`Error parsing file ${file.name}:`, error)
    throw error
  }
}

/**
 * Parse multiple files
 */
export async function parseFiles(files: File[]): Promise<ParsedDocument[]> {
  const results: ParsedDocument[] = []
  const errors: { filename: string, error: string }[] = []

  for (const file of files) {
    try {
      const parsed = await parseFile(file)
      results.push(parsed)
    } catch (error) {
      errors.push({
        filename: file.name,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  // If there were errors, include them in the result somehow
  if (errors.length > 0) {
    console.warn('Some files failed to parse:', errors)
  }

  return results
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 Bytes'

  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}