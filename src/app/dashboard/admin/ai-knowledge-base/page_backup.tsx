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
  AlertCircle,
  Clock,
  Folder,
  FolderOpen,
  File,
  MoreVertical,
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
  isOpen: boolean
  documents: Document[]
  icon: string
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
      name: 'Adoption Guidelines',
      description: 'Documents related to pet adoption processes',
      icon: '🏠',
      isOpen: true,
      documents: [
        {
          id: '1',
          title: 'Pet Adoption Guidelines',
          content: 'Comprehensive guide for pet adoption processes...',
          type: 'guide',
          status: 'indexed',
          chunks: 25,
          lastUpdated: new Date('2024-01-15'),
          size: '45 KB',
          folderId: 'adoption'
        },
        {
          id: '2',
          title: 'Adoption Interview Questions',
          content: 'Standard questions for potential adopters...',
          type: 'guide',
          status: 'indexed',
          chunks: 18,
          lastUpdated: new Date('2024-01-12'),
          size: '28 KB',
          folderId: 'adoption'
        }
      ]
    },
    {
      id: 'care',
      name: 'Pet Care & Health',
      description: 'Health protocols and care instructions',
      icon: '🏥',
      isOpen: false,
      documents: [
        {
          id: '3',
          title: 'Shelter Care Standards',
          content: 'Standards and protocols for animal care in shelters...',
          type: 'manual',
          status: 'indexed',
          chunks: 42,
          lastUpdated: new Date('2024-01-10'),
          size: '78 KB',
          folderId: 'care'
        },
        {
          id: '4',
          title: 'Pet Health FAQ',
          content: 'Frequently asked questions about pet health and care...',
          type: 'faq',
          status: 'processing',
          chunks: 0,
          lastUpdated: new Date('2024-01-18'),
          size: '32 KB',
          folderId: 'care'
        }
      ]
    },
    {
      id: 'policies',
      name: 'Policies & Procedures',
      description: 'Organizational policies and standard procedures',
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
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadFolder, setUploadFolder] = useState("adoption")
  const [newDocument, setNewDocument] = useState({
    title: "",
    content: "",
    type: "guide" as Document['type'],
    folderId: "adoption"
  })

  const getStatusColor = (status: Document['status']) => {
    switch (status) {
      case 'indexed': return 'bg-green-100 text-green-800'
      case 'processing': return 'bg-yellow-100 text-yellow-800'
      case 'error': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: Document['type']) => {
    switch (type) {
      case 'faq': return 'bg-blue-100 text-blue-800'
      case 'guide': return 'bg-purple-100 text-purple-800'
      case 'policy': return 'bg-orange-100 text-orange-800'
      case 'manual': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const toggleFolder = (folderId: string) => {
    setFolders(prev => prev.map(folder =>
      folder.id === folderId
        ? { ...folder, isOpen: !folder.isOpen }
        : folder
    ))
  }

  const filteredFolders = folders.map(folder => ({
    ...folder,
    documents: folder.documents.filter(doc =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(folder => folder.documents.length > 0 || searchQuery === "")

  const formatTime = (date: Date) => {
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return `${Math.round(diffInHours * 60)}m`
    } else if (diffInHours < 24) {
      return `${Math.round(diffInHours)}h`
    } else {
      return `${Math.round(diffInHours / 24)}d`
    }
  }

  const handleAddDocument = () => {
    if (!newDocument.title || !newDocument.content) return

    const document: Document = {
      id: Date.now().toString(),
      title: newDocument.title,
      content: newDocument.content,
      type: newDocument.type,
      status: 'processing',
      chunks: 0,
      lastUpdated: new Date(),
      size: `${Math.ceil(newDocument.content.length / 1024)} KB`,
      folderId: newDocument.folderId
    }

    setFolders(prev => prev.map(folder =>
      folder.id === newDocument.folderId
        ? { ...folder, documents: [document, ...folder.documents] }
        : folder
    ))
    setNewDocument({ title: "", content: "", type: "guide", folderId: "adoption" })
    setIsAddDialogOpen(false)

    // Simulate processing
    setTimeout(() => {
      setFolders(prev => prev.map(folder => ({
        ...folder,
        documents: folder.documents.map(doc =>
          doc.id === document.id
            ? { ...doc, status: 'indexed' as const, chunks: Math.ceil(document.content.length / 200) }
            : doc
        )
      })))
    }, 3000)
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
        doc.id === id ? { ...doc, status: 'processing' as const } : doc
      )
    })))

    setTimeout(() => {
      setFolders(prev => prev.map(folder => ({
        ...folder,
        documents: folder.documents.map(doc =>
          doc.id === id ? { ...doc, status: 'indexed' as const } : doc
        )
      })))
    }, 2000)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      setSelectedFiles(Array.from(files))
    }
  }

  const handleBulkUpload = () => {
    if (selectedFiles.length === 0) return

    selectedFiles.forEach((file, index) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        const document: Document = {
          id: (Date.now() + index).toString(),
          title: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
          content: content,
          type: getFileType(file.name),
          status: 'processing',
          chunks: 0,
          lastUpdated: new Date(),
          size: `${Math.ceil(file.size / 1024)} KB`,
          folderId: uploadFolder
        }

        setFolders(prev => prev.map(folder =>
          folder.id === uploadFolder
            ? { ...folder, documents: [document, ...folder.documents] }
            : folder
        ))

        // Simulate processing
        setTimeout(() => {
          setFolders(prev => prev.map(folder => ({
            ...folder,
            documents: folder.documents.map(doc =>
              doc.id === document.id
                ? { ...doc, status: 'indexed' as const, chunks: Math.ceil(content.length / 200) }
                : doc
            )
          })))
        }, 1500 + index * 500) // Stagger processing
      }
      reader.readAsText(file)
    })

    setSelectedFiles([])
    setIsUploadDialogOpen(false)
  }

  const getFileType = (filename: string): Document['type'] => {
    const extension = filename.toLowerCase().split('.').pop()
    switch (extension) {
      case 'pdf':
      case 'doc':
      case 'docx':
        return 'manual'
      case 'md':
      case 'txt':
        return 'guide'
      default:
        return 'guide'
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] bg-gray-50 rounded-lg border overflow-hidden">
      {/* File Explorer Sidebar */}
      <div className="flex flex-col bg-white border-r border-gray-200 overflow-hidden flex-none w-96 min-w-[24rem] max-w-[24rem]">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xl font-semibold text-gray-900">Knowledge Base</h3>
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
                          {folders.map(folder => (
                            <SelectItem key={folder.id} value={folder.id}>
                              {folder.icon} {folder.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Select Files</label>
                      <div className="mt-2">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="mt-4">
                            <label htmlFor="file-upload" className="cursor-pointer">
                              <span className="mt-2 block text-sm font-medium text-gray-900">
                                Click to upload files or drag and drop
                              </span>
                              <span className="mt-1 block text-sm text-gray-500">
                                PDF, TXT, MD, DOC, DOCX files supported
                              </span>
                              <input
                                id="file-upload"
                                name="file-upload"
                                type="file"
                                multiple
                                accept=".pdf,.txt,.md,.doc,.docx"
                                className="sr-only"
                                onChange={handleFileUpload}
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {selectedFiles.length > 0 && (
                      <div>
                        <label className="text-sm font-medium">Selected Files ({selectedFiles.length})</label>
                        <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                          {selectedFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-700">{file.name}</span>
                                <span className="text-xs text-gray-500">({Math.ceil(file.size / 1024)} KB)</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(index)}
                                className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                              >
                                <Trash2 className="h-3 w-3" />
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
                      className="bg-teal-500 hover:bg-teal-600"
                      disabled={selectedFiles.length === 0}
                    >
                      Upload {selectedFiles.length > 0 ? `${selectedFiles.length} Files` : 'Files'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-teal-500 hover:bg-teal-600">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Document
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Document</DialogTitle>
                  <DialogDescription>
                    Add a new document to the knowledge base for AI training.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Folder</label>
                    <Select
                      value={newDocument.folderId}
                      onValueChange={(value) =>
                        setNewDocument(prev => ({ ...prev, folderId: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {folders.map(folder => (
                          <SelectItem key={folder.id} value={folder.id}>
                            {folder.icon} {folder.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      placeholder="Document title..."
                      value={newDocument.title}
                      onChange={(e) => setNewDocument(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Type</label>
                    <Select
                      value={newDocument.type}
                      onValueChange={(value: Document['type']) =>
                        setNewDocument(prev => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="guide">Guide</SelectItem>
                        <SelectItem value="faq">FAQ</SelectItem>
                        <SelectItem value="policy">Policy</SelectItem>
                        <SelectItem value="manual">Manual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Content</label>
                    <Textarea
                      placeholder="Document content..."
                      className="min-h-[200px]"
                      value={newDocument.content}
                      onChange={(e) => setNewDocument(prev => ({ ...prev, content: e.target.value }))}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddDocument} className="bg-teal-500 hover:bg-teal-600">
                    Add Document
                  </Button>
                </DialogFooter>
                </DialogContent>
              </Dialog>
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

        {/* File Explorer Tree */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {filteredFolders.map((folder) => (
              <div key={folder.id} className="space-y-1">
                {/* Folder Header */}
                <div
                  className="flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleFolder(folder.id)}
                >
                  {folder.isOpen ? (
                    <FolderOpen className="h-4 w-4 text-teal-500" />
                  ) : (
                    <Folder className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="text-sm font-medium text-gray-700">{folder.icon} {folder.name}</span>
                  <span className="text-xs text-gray-400 ml-auto">
                    {folder.documents.length}
                  </span>
                </div>

                {/* Folder Contents */}
                {folder.isOpen && (
                  <div className="ml-6 space-y-1">
                    {folder.documents.map((doc) => (
                      <motion.div
                        key={doc.id}
                        whileHover={{ x: 2 }}
                        className={`group p-3 rounded-lg cursor-pointer transition-all duration-200 border-2 shadow-sm hover:shadow-md ${
                          selectedDocument?.id === doc.id
                            ? "border-teal-500 shadow-lg bg-teal-50"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 bg-white"
                        }`}
                        onClick={() => setSelectedDocument(doc)}
                      >
                        <div className="flex items-start gap-3">
                          <File className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900 truncate max-w-[160px]">
                                {doc.title}
                              </p>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className="text-xs text-gray-500">
                                  {formatTime(doc.lastUpdated)}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className={getStatusColor(doc.status)}>
                                {doc.status === 'indexed' && <CheckCircle className="h-3 w-3 mr-1" />}
                                {doc.status === 'processing' && <Clock className="h-3 w-3 mr-1" />}
                                {doc.status === 'error' && <AlertCircle className="h-3 w-3 mr-1" />}
                                {doc.status}
                              </Badge>
                              <Badge variant="outline" className={getTypeColor(doc.type)}>
                                {doc.type.toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {doc.lastUpdated.toLocaleDateString()} • {doc.size} • {doc.chunks} chunks
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-gray-400 hover:text-red-500 flex-shrink-0"
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
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleReindexDocument(selectedDocument.id)}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Document Content */}
          <div className="flex-1 p-4 overflow-auto">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Document Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Status</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getStatusColor(selectedDocument.status)}>
                            {selectedDocument.status === 'indexed' && <CheckCircle className="h-3 w-3 mr-1" />}
                            {selectedDocument.status === 'processing' && <Clock className="h-3 w-3 mr-1" />}
                            {selectedDocument.status === 'error' && <AlertCircle className="h-3 w-3 mr-1" />}
                            {selectedDocument.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Chunks</p>
                        <p className="text-2xl font-bold text-gray-900">{selectedDocument.chunks}</p>
                      </div>
                      <Database className="h-8 w-8 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Size</p>
                        <p className="text-2xl font-bold text-gray-900">{selectedDocument.size}</p>
                      </div>
                      <FileText className="h-8 w-8 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Document Content Display */}
              <Card>
                <CardHeader>
                  <CardTitle>Document Content</CardTitle>
                  <CardDescription>
                    Preview of the document content used for AI training
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-auto">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700">
                      {selectedDocument.content}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              {/* Processing Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Processing Details</CardTitle>
                  <CardDescription>
                    Information about document processing and indexing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Document ID:</span>
                      <span className="ml-2 font-mono">{selectedDocument.id}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Type:</span>
                      <span className="ml-2">{selectedDocument.type}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Created:</span>
                      <span className="ml-2">{selectedDocument.lastUpdated.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Chunks:</span>
                      <span className="ml-2">{selectedDocument.chunks} segments</span>
                    </div>
                  </div>

                  {selectedDocument.status === 'indexed' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-green-800">
                        <CheckCircle className="h-4 w-4" />
                        <span className="font-medium">Successfully Indexed</span>
                      </div>
                      <p className="text-sm text-green-700 mt-1">
                        This document has been processed and is available for AI queries.
                      </p>
                    </div>
                  )}

                  {selectedDocument.status === 'processing' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-yellow-800">
                        <Clock className="h-4 w-4" />
                        <span className="font-medium">Processing</span>
                      </div>
                      <p className="text-sm text-yellow-700 mt-1">
                        Document is being processed and indexed. This may take a few minutes.
                      </p>
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
          <div className="flex-1 p-6 overflow-auto">
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Stats Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                        of 10 GB limit
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Common tasks for managing your knowledge base
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      className="justify-start h-auto p-4"
                      onClick={() => setIsUploadDialogOpen(true)}
                    >
                      <Upload className="h-5 w-5 mr-3" />
                      <div className="text-left">
                        <div className="font-medium">Bulk Upload</div>
                        <div className="text-sm text-gray-500">Upload multiple documents</div>
                      </div>
                    </Button>
                    <Button variant="outline" className="justify-start h-auto p-4">
                      <RefreshCw className="h-5 w-5 mr-3" />
                      <div className="text-left">
                        <div className="font-medium">Rebuild Index</div>
                        <div className="text-sm text-gray-500">Refresh vector database</div>
                      </div>
                    </Button>
                    <Button variant="outline" className="justify-start h-auto p-4">
                      <Brain className="h-5 w-5 mr-3" />
                      <div className="text-left">
                        <div className="font-medium">RAG Settings</div>
                        <div className="text-sm text-gray-500">Configure AI parameters</div>
                      </div>
                    </Button>
                    <Button variant="outline" className="justify-start h-auto p-4">
                      <BarChart3 className="h-5 w-5 mr-3" />
                      <div className="text-left">
                        <div className="font-medium">Analytics</div>
                        <div className="text-sm text-gray-500">View usage statistics</div>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Getting Started */}
              <Card>
                <CardHeader>
                  <CardTitle>Getting Started</CardTitle>
                  <CardDescription>
                    Set up your knowledge base for optimal AI performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center font-medium">1</div>
                      <span>Select a document from the file explorer to view details</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center font-medium">2</div>
                      <span>Add documents to folders to organize your knowledge base</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center font-medium">3</div>
                      <span>Monitor processing status and reindex documents as needed</span>
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
