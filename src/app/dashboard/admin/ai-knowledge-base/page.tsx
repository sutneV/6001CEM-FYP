"use client"

import { useState } from "react"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
  X
} from "lucide-react"

interface Document {
  id: string
  title: string
  content: string
  type: 'faq' | 'guide' | 'policy' | 'manual'
  status: 'indexed' | 'processing' | 'error'
  chunks: number
  lastUpdated: Date
  size: string
  folderId: string
}

interface DocumentFolder {
  id: string
  name: string
  description: string
  icon: string
  isOpen: boolean
  documents: Document[]
}

interface KnowledgeStats {
  totalDocuments: number
  totalChunks: number
  indexedDocuments: number
  processingDocuments: number
  errorDocuments: number
  storageUsed: string
}

export default function AIKnowledgeBasePage() {
  const [folders, setFolders] = useState<DocumentFolder[]>([
    {
      id: 'adoption',
      name: 'Adoption Guides',
      description: 'Pet adoption processes and requirements',
      icon: '🏠',
      isOpen: true,
      documents: [
        {
          id: '1',
          title: 'Pet Adoption Process',
          content: 'A comprehensive guide on pet adoption procedures...',
          type: 'guide',
          status: 'indexed',
          chunks: 45,
          lastUpdated: new Date('2024-01-15'),
          size: '64 KB',
          folderId: 'adoption'
        },
        {
          id: '2',
          title: 'Pre-adoption Checklist',
          content: 'Essential checklist for potential adopters...',
          type: 'guide',
          status: 'indexed',
          chunks: 28,
          lastUpdated: new Date('2024-01-12'),
          size: '42 KB',
          folderId: 'adoption'
        }
      ]
    },
    {
      id: 'petcare',
      name: 'Pet Care',
      description: 'Health and wellness information',
      icon: '🏥',
      isOpen: false,
      documents: [
        {
          id: '3',
          title: 'Basic Pet Health Care',
          content: 'Essential health care information for pets...',
          type: 'manual',
          status: 'processing',
          chunks: 67,
          lastUpdated: new Date('2024-01-10'),
          size: '89 KB',
          folderId: 'petcare'
        },
        {
          id: '4',
          title: 'Emergency Pet Care',
          content: 'Emergency procedures and first aid for pets...',
          type: 'manual',
          status: 'error',
          chunks: 0,
          lastUpdated: new Date('2024-01-08'),
          size: '56 KB',
          folderId: 'petcare'
        }
      ]
    },
    {
      id: 'policies',
      name: 'Policies & Procedures',
      description: 'Internal policies and guidelines',
      icon: '📋',
      isOpen: false,
      documents: [
        {
          id: '5',
          title: 'Volunteer Guidelines',
          content: 'Guidelines for volunteer management and training...',
          type: 'policy',
          status: 'indexed',
          chunks: 35,
          lastUpdated: new Date('2024-01-08'),
          size: '52 KB',
          folderId: 'policies'
        }
      ]
    },
    {
      id: 'training',
      name: 'Training Materials',
      description: 'Staff and volunteer training resources',
      icon: '🎓',
      isOpen: false,
      documents: []
    }
  ])

  const [stats] = useState<KnowledgeStats>({
    totalDocuments: 15,
    totalChunks: 342,
    indexedDocuments: 12,
    processingDocuments: 2,
    errorDocuments: 1,
    storageUsed: '2.4 MB'
  })

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [isAddFolderDialogOpen, setIsAddFolderDialogOpen] = useState(false)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadFolder, setUploadFolder] = useState("adoption")
  const [newFolder, setNewFolder] = useState({
    name: "",
    description: "",
    icon: "📁"
  })

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

  const getTypeColor = (type: Document['type']) => {
    switch (type) {
      case 'guide':
        return 'bg-blue-100 text-blue-800'
      case 'manual':
        return 'bg-purple-100 text-purple-800'
      case 'policy':
        return 'bg-orange-100 text-orange-800'
      case 'faq':
        return 'bg-teal-100 text-teal-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const toggleFolder = (folderId: string) => {
    setFolders(prev => prev.map(folder =>
      folder.id === folderId
        ? { ...folder, isOpen: !folder.isOpen }
        : folder
    ))
  }

  const selectDocument = (document: Document) => {
    setSelectedDocument(document)
  }

  const handleDocumentSelect = (id: string) => {
    const document = folders.flatMap(f => f.documents).find(d => d.id === id)
    if (document) {
      setSelectedDocument(document)
    }
  }

  const handleDeleteDocument = (id: string) => {
    setFolders(prev => prev.map(folder => ({
      ...folder,
      documents: folder.documents.filter(doc => doc.id !== id)
    })))

    if (selectedDocument?.id === id) {
      setSelectedDocument(null)
    }
  }

  const handleReindexDocument = (id: string) => {
    setFolders(prev => prev.map(folder => ({
      ...folder,
      documents: folder.documents.map(doc =>
        doc.id === id
          ? { ...doc, status: 'processing' as const }
          : doc
      )
    })))
  }

  const handleAddFolder = () => {
    const newFolderData: DocumentFolder = {
      id: Date.now().toString(),
      name: newFolder.name,
      description: newFolder.description,
      icon: newFolder.icon,
      isOpen: false,
      documents: []
    }

    setFolders(prev => [...prev, newFolderData])

    setNewFolder({
      name: "",
      description: "",
      icon: "📁"
    })
    setIsAddFolderDialogOpen(false)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      setSelectedFiles(Array.from(files))
    }
  }

  const detectFileType = (filename: string): Document['type'] => {
    const lower = filename.toLowerCase()
    if (lower.includes('faq') || lower.includes('question')) return 'faq'
    if (lower.includes('manual') || lower.includes('handbook')) return 'manual'
    if (lower.includes('policy') || lower.includes('procedure')) return 'policy'
    return 'guide'
  }

  const handleBulkUpload = () => {
    const newDocs: Document[] = selectedFiles.map((file, index) => ({
      id: (Date.now() + index).toString(),
      title: file.name.replace(/\.[^/.]+$/, ""),
      content: `Content from ${file.name}`,
      type: detectFileType(file.name),
      status: 'processing' as const,
      chunks: 0,
      lastUpdated: new Date(),
      size: `${Math.round(file.size / 1024)} KB`,
      folderId: uploadFolder
    }))

    setFolders(prev => prev.map(folder =>
      folder.id === uploadFolder
        ? { ...folder, documents: [...folder.documents, ...newDocs] }
        : folder
    ))

    setSelectedFiles([])
    setIsUploadDialogOpen(false)
  }

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
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
                      <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="flex text-sm text-gray-600">
                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-teal-600 hover:text-teal-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-teal-500">
                              <span>Upload files</span>
                              <input
                                id="file-upload"
                                name="file-upload"
                                type="file"
                                className="sr-only"
                                multiple
                                accept=".txt,.pdf,.doc,.docx,.md"
                                onChange={handleFileUpload}
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">
                            PDF, DOC, DOCX, TXT, MD up to 10MB each
                          </p>
                        </div>
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
                                <span className="text-sm">{file.name}</span>
                                <span className="text-xs text-gray-500">({Math.round(file.size / 1024)} KB)</span>
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
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleBulkUpload}
                      disabled={selectedFiles.length === 0}
                      className="bg-teal-500 hover:bg-teal-600"
                    >
                      Upload {selectedFiles.length} Files
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
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => toggleFolder(folder.id)}
                >
                  {folder.isOpen ? (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  )}
                  {folder.isOpen ? (
                    <FolderOpen className="h-4 w-4 text-teal-500" />
                  ) : (
                    <FolderClosed className="h-4 w-4 text-gray-400" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {folder.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {folder.description}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {folder.documents.length} documents
                    </p>
                  </div>
                </div>

                {folder.isOpen && (
                  <div className="ml-6 mt-1 space-y-1">
                    {folder.documents
                      .filter(doc =>
                        searchQuery === "" ||
                        doc.title.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((doc) => (
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
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {doc.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={`text-xs ${getStatusColor(doc.status)}`}>
                                {doc.status}
                              </Badge>
                            </div>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteDocument(doc.id)
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
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
                    {selectedDocument.type.charAt(0).toUpperCase() + selectedDocument.type.slice(1)} •
                    Last updated {selectedDocument.lastUpdated.toLocaleDateString()}
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
                        <p className="text-2xl font-bold text-gray-900">{selectedDocument.size}</p>
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
                      <span className="font-medium">Type:</span>
                      <span className="ml-2">{selectedDocument.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Last Updated:</span>
                      <span className="ml-2">{selectedDocument.lastUpdated.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Chunks:</span>
                      <span className="ml-2">{selectedDocument.chunks} segments</span>
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
                      <p className="text-xs text-muted-foreground">
                        +2 from last month
                      </p>
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
                      <p className="text-xs text-muted-foreground">
                        Vector embeddings ready
                      </p>
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
                      <p className="text-xs text-muted-foreground">
                        Currently indexing
                      </p>
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
                      <p className="text-xs text-muted-foreground">
                        of 100MB limit
                      </p>
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
                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <RefreshCw className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Rebuild Index</div>
                      <div className="text-xs text-gray-500">Refresh database</div>
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

              {/* Recent Activity */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Pet Adoption Process indexed</p>
                        <p className="text-xs text-gray-500">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <Clock className="h-4 w-4 text-yellow-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Basic Pet Health Care processing</p>
                        <p className="text-xs text-gray-500">5 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                        <Upload className="h-4 w-4 text-teal-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">3 new documents uploaded</p>
                        <p className="text-xs text-gray-500">1 day ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}