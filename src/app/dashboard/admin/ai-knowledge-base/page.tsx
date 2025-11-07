"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { motion } from "framer-motion"
import {
  Upload,
  FileText,
  Database,
  Search,
  Plus,
  Trash2,
  Edit,
  Eye,
  Download,
  RefreshCw,
  BarChart3,
  Brain,
  Zap,
  CheckCircle,
  Clock,
  AlertCircle,
  File,
  FolderOpen,
  FolderClosed,
  ChevronDown,
  ChevronRight,
  Settings,
  X,
  Loader2
} from "lucide-react"
import {
  getFolders,
  getDocuments,
  createFolder,
  createDocument,
  updateDocument,
  deleteDocument,
  deleteFolder,
  updateFolder,
  reindexDocument,
  getKnowledgeStats,
  getDocumentChunks,
  createDocumentChunks,
  getDocument,
  type DocumentFolder,
  type Document,
  type DocumentChunk,
  type KnowledgeStats
} from "@/lib/supabase/documents"
import {
  parseFiles,
  isSupportedFileType,
  getFileTypeDisplayName,
  formatFileSize
} from "@/lib/utils/file-parser"
import {
  generateBatchEmbeddings,
  generateEmbedding
} from "@/lib/utils/embeddings"

export default function AIKnowledgeBasePage() {
  // State management
  const [folders, setFolders] = useState<DocumentFolder[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [documentChunks, setDocumentChunks] = useState<DocumentChunk[]>([])
  const [stats, setStats] = useState<KnowledgeStats>({
    totalDocuments: 0,
    totalChunks: 0,
    indexedDocuments: 0,
    processingDocuments: 0,
    errorDocuments: 0,
    storageUsed: '0 KB'
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // UI state
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [isAddFolderDialogOpen, setIsAddFolderDialogOpen] = useState(false)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadFolder, setUploadFolder] = useState("")
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set())
  const [uploadingFiles, setUploadingFiles] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [newFolder, setNewFolder] = useState({
    name: "",
    description: ""
  })

  // Load data on mount
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [foldersData, documentsData, statsData] = await Promise.all([
        getFolders(),
        getDocuments(),
        getKnowledgeStats()
      ])

      setFolders(foldersData)
      setDocuments(documentsData)
      setStats(statsData)

      // Set first folder as default upload folder
      if (foldersData.length > 0) {
        setUploadFolder(foldersData[0].id)
      }
    } catch (err) {
      console.error('Error loading data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  // Helper functions
  const getStatusColor = (status: Document['status']) => {
    switch (status) {
      case 'indexed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getDocumentsForFolder = (folderId: string) => {
    return documents.filter(doc => doc.folder_id === folderId)
  }

  const getFilteredDocuments = (folderId: string) => {
    const folderDocs = getDocumentsForFolder(folderId)
    if (!searchQuery) return folderDocs
    return folderDocs.filter(doc =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  const formatFileSize = (sizeKb: number) => {
    return sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  // Event handlers
  const toggleFolder = (folderId: string) => {
    setOpenFolders(prev => {
      const newSet = new Set(prev)
      if (newSet.has(folderId)) {
        newSet.delete(folderId)
      } else {
        newSet.add(folderId)
      }
      return newSet
    })
  }

  const selectDocument = async (document: Document) => {
    setSelectedDocument(document)

    // Load chunks for the selected document
    try {
      const chunks = await getDocumentChunks(document.id)
      setDocumentChunks(chunks)
    } catch (err) {
      console.error('Error loading document chunks:', err)
      setDocumentChunks([])
    }
  }

  const handleDeleteDocument = async (id: string) => {
    try {
      await deleteDocument(id)
      setDocuments(prev => prev.filter(doc => doc.id !== id))

      if (selectedDocument?.id === id) {
        setSelectedDocument(null)
      }

      // Refresh stats
      const newStats = await getKnowledgeStats()
      setStats(newStats)
    } catch (err) {
      console.error('Error deleting document:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete document')
    }
  }

  const handleDeleteFolder = async (id: string) => {
    const folder = folders.find(f => f.id === id)
    const docCount = getDocumentsForFolder(id).length

    const confirmed = window.confirm(
      `Are you sure you want to delete "${folder?.name}"?\n\n` +
      `This will permanently delete:\n` +
      `- The folder\n` +
      `- ${docCount} document(s)\n` +
      `- All associated chunks and embeddings\n\n` +
      `This action cannot be undone.`
    )

    if (!confirmed) return

    try {
      setLoading(true)
      await deleteFolder(id)

      // Update state
      setFolders(prev => prev.filter(f => f.id !== id))
      setDocuments(prev => prev.filter(doc => doc.folder_id !== id))

      // If selected document was in this folder, deselect it
      if (selectedDocument && selectedDocument.folder_id === id) {
        setSelectedDocument(null)
      }

      // Refresh stats
      const newStats = await getKnowledgeStats()
      setStats(newStats)
    } catch (err) {
      console.error('Error deleting folder:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete folder')
    } finally {
      setLoading(false)
    }
  }

  const handleReindexDocument = async (id: string) => {
    try {
      const updatedDoc = await reindexDocument(id)
      setDocuments(prev => prev.map(doc =>
        doc.id === id ? updatedDoc : doc
      ))

      if (selectedDocument?.id === id) {
        setSelectedDocument(updatedDoc)
      }
    } catch (err) {
      console.error('Error reindexing document:', err)
      setError(err instanceof Error ? err.message : 'Failed to reindex document')
    }
  }

  const handleAddFolder = async () => {
    try {
      const newFolderData = await createFolder(newFolder.name, newFolder.description)
      setFolders(prev => [...prev, newFolderData])

      setNewFolder({ name: "", description: "" })
      setIsAddFolderDialogOpen(false)
    } catch (err) {
      console.error('Error creating folder:', err)
      setError(err instanceof Error ? err.message : 'Failed to create folder')
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      // Filter only supported files
      const supportedFiles = Array.from(files).filter(file => {
        if (!isSupportedFileType(file)) {
          console.warn(`Unsupported file type: ${file.name}`)
          return false
        }
        return true
      })

      setSelectedFiles(supportedFiles)

      // Show warning if some files were filtered out
      if (supportedFiles.length !== files.length) {
        const unsupportedCount = files.length - supportedFiles.length
        setError(`${unsupportedCount} file(s) were not added due to unsupported format`)
        // Clear error after 3 seconds
        setTimeout(() => setError(null), 3000)
      }
    }
  }

  const handleBulkUpload = async () => {
    try {
      setError(null)
      setUploadingFiles(true)
      setUploadProgress('Parsing files...')

      // Parse all files first
      const parsedFiles = await parseFiles(selectedFiles)

      if (parsedFiles.length === 0) {
        throw new Error('No files could be processed')
      }

      // Create documents and their chunks
      const newDocs: Document[] = []

      for (const parsedFile of parsedFiles) {
        try {
          // Create the document first
          const newDoc = await createDocument({
            title: parsedFile.title,
            content: parsedFile.content,
            status: 'processing',
            chunks: parsedFile.chunks.length,
            size_kb: Math.round(parsedFile.size / 1024),
            folder_id: uploadFolder,
            embedding: null
          })

          // Create document chunks with embeddings
          if (parsedFile.chunks.length > 0) {
            try {
              // Generate embeddings for all chunks
              console.log(`Generating embeddings for ${parsedFile.chunks.length} chunks...`)
              const chunkEmbeddings = await generateBatchEmbeddings(parsedFile.chunks)

              // Generate document-level embedding from full content
              const documentEmbedding = await generateEmbedding(parsedFile.content.slice(0, 8000))

              const chunkData = parsedFile.chunks.map((chunkText, index) => ({
                document_id: newDoc.id,
                chunk_text: chunkText,
                chunk_index: index,
                token_count: Math.ceil(chunkText.length / 4), // Rough token estimate
                embedding: chunkEmbeddings[index]
              }))

              await createDocumentChunks(chunkData)

              // Update document with document-level embedding
              await updateDocument(newDoc.id, {
                status: 'indexed',
                embedding: documentEmbedding
              })

              console.log(`Successfully created ${chunkData.length} chunks with embeddings`)
            } catch (embeddingError) {
              console.error(`Error generating embeddings for ${parsedFile.title}:`, embeddingError)

              // Create chunks without embeddings as fallback
              const chunkData = parsedFile.chunks.map((chunkText, index) => ({
                document_id: newDoc.id,
                chunk_text: chunkText,
                chunk_index: index,
                token_count: Math.ceil(chunkText.length / 4),
                embedding: null
              }))

              await createDocumentChunks(chunkData)

              // Update document status to error due to embedding failure
              await updateDocument(newDoc.id, {
                status: 'error'
              })
            }
          }

          // Get final document state after all updates
          const finalDoc = await getDocument(newDoc.id)
          if (finalDoc) {
            newDocs.push(finalDoc)
          }
        } catch (docError) {
          console.error(`Error creating document for ${parsedFile.title}:`, docError)
          // Continue with other files
        }
      }

      setDocuments(prev => [...prev, ...newDocs])

      // Refresh stats
      const newStats = await getKnowledgeStats()
      setStats(newStats)

      setSelectedFiles([])
      setIsUploadDialogOpen(false)

      // Show success message if some files failed to parse
      if (parsedFiles.length < selectedFiles.length) {
        const failedCount = selectedFiles.length - parsedFiles.length
        console.warn(`${failedCount} file(s) could not be processed`)
      }
    } catch (err) {
      console.error('Error uploading files:', err)
      setError(err instanceof Error ? err.message : 'Failed to upload files')
    } finally {
      setUploadingFiles(false)
    }
  }

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-6rem)] bg-gray-50 rounded-lg border overflow-hidden">
        <div className="flex items-center justify-center w-full">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading knowledge base...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-6rem)] bg-gray-50 rounded-lg border overflow-hidden">
        <div className="flex items-center justify-center w-full">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] bg-gray-50 rounded-lg border overflow-hidden">
      {/* File Explorer Sidebar */}
      <div className="flex flex-col bg-white border-r border-gray-200 overflow-hidden flex-none w-96 min-w-[24rem] max-w-[24rem]">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex gap-2">
              <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Upload className="h-4 w-4 mr-1" />
                    Upload Files
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Upload Documents</DialogTitle>
                    <DialogDescription>
                      Upload multiple documents to add to your knowledge base.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Target Folder</label>
                      <Select value={uploadFolder} onValueChange={setUploadFolder}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {folders.map((folder) => (
                            <SelectItem key={folder.id} value={folder.id}>
                              {folder.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Select Files</label>
                      <div
                        className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-teal-400 transition-colors cursor-pointer"
                        onClick={() => {
                          const input = document.getElementById('file-upload') as HTMLInputElement
                          input?.click()
                        }}
                      >
                        <input
                          id="file-upload"
                          type="file"
                          multiple
                          accept=".txt,.pdf,.doc,.docx,.md"
                          onChange={handleFileUpload}
                          className="sr-only"
                        />
                        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <div className="text-sm font-medium text-teal-600 hover:text-teal-500 mb-2">
                          Click to upload files
                        </div>
                        <p className="text-xs text-gray-500">
                          PDF, DOC, DOCX, TXT, MD up to 10MB each
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          PDF files will be processed to extract text content
                        </p>
                      </div>
                    </div>
                    {selectedFiles.length > 0 && (
                      <div>
                        <label className="text-sm font-medium">Selected Files ({selectedFiles.length})</label>
                        <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                          {selectedFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-gray-400" />
                                <div className="flex-1">
                                  <span className="text-sm font-medium">{file.name}</span>
                                  <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <span>{getFileTypeDisplayName(file)}</span>
                                    <span>•</span>
                                    <span>{formatFileSize(file.size)}</span>
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeSelectedFile(index)}
                                className="h-6 w-6 p-0"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {uploadingFiles && uploadProgress && (
                      <div className="mt-4">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
                          <span className="text-sm font-medium text-teal-700">{uploadProgress}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleBulkUpload}
                      disabled={selectedFiles.length === 0 || uploadingFiles}
                      className="bg-teal-500 hover:bg-teal-600"
                    >
                      {uploadingFiles ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing Files...
                        </>
                      ) : (
                        `Upload ${selectedFiles.length} File${selectedFiles.length === 1 ? '' : 's'}`
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={isAddFolderDialogOpen} onOpenChange={setIsAddFolderDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-teal-500 hover:bg-teal-600">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Folder
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Folder</DialogTitle>
                    <DialogDescription>
                      Create a new folder to organize your documents.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Folder Name</label>
                      <Input
                        value={newFolder.name}
                        onChange={(e) =>
                          setNewFolder(prev => ({ ...prev, name: e.target.value }))
                        }
                        placeholder="Enter folder name"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Description</label>
                      <Input
                        value={newFolder.description}
                        onChange={(e) =>
                          setNewFolder(prev => ({ ...prev, description: e.target.value }))
                        }
                        placeholder="Enter folder description"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddFolderDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddFolder} className="bg-teal-500 hover:bg-teal-600">
                      Add Folder
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Folder Tree */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {folders.map((folder) => (
              <div key={folder.id} className="mb-2">
                <div
                  className="group flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => toggleFolder(folder.id)}
                >
                  {openFolders.has(folder.id) ? (
                    <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  )}
                  {openFolders.has(folder.id) ? (
                    <FolderOpen className="h-4 w-4 text-teal-500 flex-shrink-0" />
                  ) : (
                    <FolderClosed className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0 max-w-[140px]">
                    <p className="text-sm font-medium text-gray-900 truncate" title={folder.name}>
                      {folder.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate" title={folder.description || undefined}>
                      {folder.description}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {getDocumentsForFolder(folder.id).length} documents
                    </p>
                  </div>
                  <div className="flex-1"></div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteFolder(folder.id)
                    }}
                  >
                    <Trash2 className="h-3 w-3 text-red-600" />
                  </Button>
                </div>

                {openFolders.has(folder.id) && (
                  <div className="ml-6 mt-1 space-y-1">
                    {getFilteredDocuments(folder.id).map((doc) => (
                      <motion.div
                        key={doc.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                          selectedDocument?.id === doc.id
                            ? "bg-teal-50 border border-teal-200"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() => selectDocument(doc)}
                      >
                        <File className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <div className="min-w-0 max-w-[180px]">
                          <p className="text-sm font-medium text-gray-900 truncate" title={doc.title}>
                            {doc.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={`text-xs ${getStatusColor(doc.status)}`}>
                              {doc.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex-1"></div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteDocument(doc.id)
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content Area */}
      {selectedDocument ? (
        <div className="flex-1 flex flex-col">
          {/* Document Header */}
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <File className="h-5 w-5 text-gray-400" />
                <div>
                  <h2 className="font-semibold text-gray-900">{selectedDocument.title}</h2>
                  <p className="text-sm text-gray-600">
                    Last updated {formatDate(selectedDocument.last_updated)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleReindexDocument(selectedDocument.id)}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Reindex
                </Button>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </div>
            </div>
          </div>

          {/* Document Content */}
          <div className="flex-1 overflow-auto p-4">
            <div className="space-y-4">
              {/* Status and Stats */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Status</p>
                        <div className="flex items-center mt-1">
                          <Badge className={getStatusColor(selectedDocument.status)}>
                            {selectedDocument.status === 'indexed' && <CheckCircle className="h-3 w-3 mr-1" />}
                            {selectedDocument.status === 'processing' && <Clock className="h-3 w-3 mr-1" />}
                            {selectedDocument.status === 'error' && <AlertCircle className="h-3 w-3 mr-1" />}
                            {selectedDocument.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center">
                        {selectedDocument.status === 'indexed' && <CheckCircle className="h-4 w-4 text-teal-600" />}
                        {selectedDocument.status === 'processing' && <Clock className="h-4 w-4 text-yellow-600" />}
                        {selectedDocument.status === 'error' && <AlertCircle className="h-4 w-4 text-red-600" />}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Chunks</p>
                        <p className="text-2xl font-bold text-gray-900">{selectedDocument.chunks}</p>
                      </div>
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Database className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">File Size</p>
                        <p className="text-2xl font-bold text-gray-900">{formatFileSize(selectedDocument.size_kb)}</p>
                      </div>
                      <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                        <FileText className="h-4 w-4 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Document Content */}
              <Card>
                <CardHeader>
                  <CardTitle>Content Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-lg border">
                      {selectedDocument.content}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              {/* Document Metadata */}
              <Card>
                <CardHeader>
                  <CardTitle>Metadata</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">Document ID:</span>
                      <span className="ml-2 font-mono">{selectedDocument.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Last Updated:</span>
                      <span className="ml-2">{new Date(selectedDocument.last_updated).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Chunks:</span>
                      <span className="ml-2">{selectedDocument.chunks} segments</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Has Embedding:</span>
                      <span className="ml-2">{selectedDocument.embedding ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                  {selectedDocument.status === 'indexed' && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <div className="ml-2">
                          <p className="text-sm font-medium text-green-800">Document Indexed</p>
                          <p className="text-sm text-green-700 mt-1">
                            This document has been successfully processed and is ready for AI queries.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  {selectedDocument.status === 'processing' && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex">
                        <Clock className="h-4 w-4 text-yellow-600" />
                        <div className="ml-2">
                          <p className="text-sm font-medium text-yellow-800">Processing</p>
                          <p className="text-sm text-yellow-700 mt-1">
                            Document is being processed and indexed. This may take a few minutes.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Document Chunks */}
              {selectedDocument.chunks > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Document Chunks ({selectedDocument.chunks})</CardTitle>
                    <CardDescription>
                      Text chunks ready for vector similarity search
                      {documentChunks.length > 0 && ` • ${documentChunks.length} loaded`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {documentChunks.length > 0 ? (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {documentChunks.map((chunk, index) => (
                          <div key={chunk.id} className="border rounded-lg p-3 bg-gray-50">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  Chunk {chunk.chunk_index + 1}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  {chunk.token_count} tokens
                                </span>
                                <span className="text-xs text-gray-500">
                                  {chunk.embedding ? '✓ Embedded' : '○ No embedding'}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {chunk.chunk_text.length} chars
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-700">
                              {chunk.chunk_text.substring(0, 300)}
                              {chunk.chunk_text.length > 300 && (
                                <span className="text-gray-400">... ({chunk.chunk_text.length - 300} more chars)</span>
                              )}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Loading chunks...</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* No Chunks Message */}
              {selectedDocument.chunks === 0 && (
                <Card className="border-yellow-200 bg-yellow-50">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 text-yellow-700">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">No chunks created</span>
                    </div>
                    <p className="text-sm text-yellow-600 mt-1">
                      This document hasn't been chunked yet. Try reindexing to create chunks for better search performance.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          {/* Overview Header */}
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5 text-teal-500" />
              <div>
                <h2 className="font-semibold text-gray-900">Knowledge Base Overview</h2>
                <p className="text-sm text-gray-600">
                  Manage documents and content for RAG-powered AI assistants
                </p>
              </div>
            </div>
          </div>

          {/* Stats Dashboard */}
          <div className="flex-1 p-4 overflow-auto">
            <div className="space-y-4">
              {/* Stats Cards */}
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalDocuments}</div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Indexed Chunks</CardTitle>
                      <Database className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalChunks}</div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Processing</CardTitle>
                      <RefreshCw className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.processingDocuments}</div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.storageUsed}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Quick Actions */}
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setIsUploadDialogOpen(true)}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-teal-100 rounded-lg">
                      <Upload className="h-5 w-5 text-teal-600" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Upload Documents</div>
                      <div className="text-xs text-gray-500">Add new files</div>
                    </div>
                  </div>
                </Card>
                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={loadData}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <RefreshCw className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Refresh Data</div>
                      <div className="text-xs text-gray-500">Reload from database</div>
                    </div>
                  </div>
                </Card>
                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Brain className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">RAG Settings</div>
                      <div className="text-xs text-gray-500">Configure AI</div>
                    </div>
                  </div>
                </Card>
                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <BarChart3 className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Analytics</div>
                      <div className="text-xs text-gray-500">View statistics</div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}