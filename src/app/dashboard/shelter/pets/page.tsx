"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Plus,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  Loader2,
  PawPrint,
  Heart,
  Check,
  Activity,
  TrendingUp,
  Calendar,
  Users,
  Star,
  Dog,
  Cat,
  RefreshCw
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { petsService, PetWithShelter } from "@/lib/services/pets"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

const statusColors = {
  available: "bg-green-100 text-green-800 border-green-200",
  adopted: "bg-blue-100 text-blue-800 border-blue-200",
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
}

const typeIcons = {
  dog: Dog,
  cat: Cat,
  rabbit: PawPrint,
  bird: PawPrint,
  other: PawPrint,
}

export default function ShelterPetsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedPets, setSelectedPets] = useState<string[]>([])
  const [pets, setPets] = useState<PetWithShelter[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [activeView, setActiveView] = useState("grid") // grid or list
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [selectedPetForStatus, setSelectedPetForStatus] = useState<PetWithShelter | null>(null)
  const [newStatus, setNewStatus] = useState<string>("")
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [bulkStatusDialogOpen, setBulkStatusDialogOpen] = useState(false)
  const [bulkNewStatus, setBulkNewStatus] = useState<string>("")

  // Fetch pets on component mount
  useEffect(() => {
    fetchPets()
  }, [])

  const fetchPets = async () => {
    try {
      setLoading(true)
      const data = await petsService.getShelterPets()
      setPets(data)
    } catch (error) {
      toast.error('Failed to fetch pets')
      console.error('Error fetching pets:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPets = pets.filter((pet) => {
    const matchesSearch =
      pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pet.breed && pet.breed.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesType = typeFilter === "all" || pet.type.toLowerCase() === typeFilter.toLowerCase()
    const matchesStatus = statusFilter === "all" || pet.status === statusFilter

    return matchesSearch && matchesType && matchesStatus
  })

  const stats = {
    total: pets.length,
    available: pets.filter((p) => p.status === "available").length,
    adopted: pets.filter((p) => p.status === "adopted").length,
    pending: pets.filter((p) => p.status === "pending").length,
  }

  const handleSelectPet = (petId: string, checked: boolean) => {
    if (checked) {
      setSelectedPets([...selectedPets, petId])
    } else {
      setSelectedPets(selectedPets.filter((id) => id !== petId))
    }
  }

  const handleDeletePet = async (petId: string) => {
    if (!confirm('Are you sure you want to delete this pet? This action cannot be undone.')) {
      return
    }

    try {
      setDeleting(petId)
      await petsService.deletePet(petId)
      toast.success('Pet deleted successfully')
      fetchPets() // Refresh the list
    } catch (error) {
      toast.error('Failed to delete pet')
      console.error('Error deleting pet:', error)
    } finally {
      setDeleting(null)
    }
  }

  const handleOpenStatusDialog = (pet: PetWithShelter, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedPetForStatus(pet)
    setNewStatus(pet.status)
    setStatusDialogOpen(true)
  }

  const handleUpdateStatus = async () => {
    if (!selectedPetForStatus || !newStatus) return

    try {
      setUpdatingStatus(true)
      await petsService.updatePet(selectedPetForStatus.id, { status: newStatus })
      toast.success('Pet status updated successfully')
      setStatusDialogOpen(false)
      fetchPets() // Refresh the list
    } catch (error) {
      toast.error('Failed to update pet status')
      console.error('Error updating pet status:', error)
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleBulkStatusUpdate = async () => {
    if (!bulkNewStatus || selectedPets.length === 0) return

    try {
      setUpdatingStatus(true)
      await Promise.all(
        selectedPets.map(petId => petsService.updatePet(petId, { status: bulkNewStatus }))
      )
      toast.success(`Successfully updated status for ${selectedPets.length} pet${selectedPets.length > 1 ? 's' : ''}`)
      setBulkStatusDialogOpen(false)
      setSelectedPets([])
      fetchPets() // Refresh the list
    } catch (error) {
      toast.error('Failed to update pet status')
      console.error('Error updating pet status:', error)
    } finally {
      setUpdatingStatus(false)
    }
  }

  const clearFilters = () => {
    setSearchTerm("")
    setTypeFilter("all")
    setStatusFilter("all")
    setSelectedPets([])
  }

  const renderPetCard = (pet: PetWithShelter) => {
    const TypeIcon = typeIcons[pet.type as keyof typeof typeIcons] || PawPrint
    const isSelected = selectedPets.includes(pet.id)

    return (
      <Card
        key={pet.id}
        className={`cursor-pointer transition-all hover:shadow-md ${
          isSelected ? 'ring-2 ring-teal-500 bg-teal-50' : ''
        }`}
        onClick={() => handleSelectPet(pet.id, !isSelected)}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 border-2 border-white shadow-sm">
              <AvatarImage
                src={pet.images && pet.images.length > 0 ? pet.images[0] : "/placeholder.svg"}
                alt={pet.name}
                className="object-cover"
              />
              <AvatarFallback className="bg-teal-100 text-teal-600">
                {pet.name[0]}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900 truncate">{pet.name}</h3>
                <div className="flex items-center gap-2">
                  <TypeIcon className="h-4 w-4 text-gray-500" />
                  <Badge className={statusColors[pet.status as keyof typeof statusColors]}>
                    {pet.status.charAt(0).toUpperCase() + pet.status.slice(1)}
                  </Badge>
                </div>
              </div>

              <div className="space-y-1 text-sm text-gray-600">
                <p>{pet.breed || 'Mixed breed'} • {pet.age} • {pet.gender}</p>
                {pet.description && (
                  <p className="line-clamp-2 text-gray-500">{pet.description}</p>
                )}
              </div>

              <div className="flex items-center justify-between mt-3">
                <div className="flex gap-1">
                  {pet.vaccinated && <Badge variant="outline" className="text-xs">Vaccinated</Badge>}
                  {pet.neutered && <Badge variant="outline" className="text-xs">Spayed/Neutered</Badge>}
                  {pet.houseTrained && <Badge variant="outline" className="text-xs">House Trained</Badge>}
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      disabled={deleting === pet.id}
                    >
                      {deleting === pet.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <MoreHorizontal className="h-4 w-4" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/shelter/pets/${pet.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/shelter/pets/${pet.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Pet
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => handleOpenStatusDialog(pet, e)}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Change Status
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeletePet(pet.id)
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Pet
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] bg-gray-50 rounded-lg border overflow-hidden relative">
      {/* Left Sidebar - Stats & Filters */}
      <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-gray-900">Pet Management</h1>
            <Link href="/dashboard/shelter/pets/add">
              <Button size="sm" className="bg-teal-500 hover:bg-teal-600">
                <Plus className="h-4 w-4 mr-2" />
                Add Pet
              </Button>
            </Link>
          </div>
          <p className="text-sm text-gray-600">Manage your shelter's pets and their adoption status</p>
        </div>

        {/* Statistics */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-3">OVERVIEW</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-teal-100 rounded">
                  <PawPrint className="h-4 w-4 text-teal-600" />
                </div>
                <span className="text-sm font-medium">Total Pets</span>
              </div>
              <span className="text-lg font-bold text-gray-900">{stats.total}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-green-100 rounded">
                  <Heart className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-sm font-medium">Available</span>
              </div>
              <span className="text-lg font-bold text-green-600">{stats.available}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-blue-100 rounded">
                  <Check className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium">Adopted</span>
              </div>
              <span className="text-lg font-bold text-blue-600">{stats.adopted}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-yellow-100 rounded">
                  <Activity className="h-4 w-4 text-yellow-600" />
                </div>
                <span className="text-sm font-medium">Pending</span>
              </div>
              <span className="text-lg font-bold text-yellow-600">{stats.pending}</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-3">FILTERS</h3>
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search pets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300 focus:border-teal-500 focus:ring-teal-500"
              />
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="border-gray-300 focus:border-teal-500 focus:ring-teal-500">
                <SelectValue placeholder="Pet Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="dog">Dogs</SelectItem>
                <SelectItem value="cat">Cats</SelectItem>
                <SelectItem value="rabbit">Rabbits</SelectItem>
                <SelectItem value="bird">Birds</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="border-gray-300 focus:border-teal-500 focus:ring-teal-500">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="adopted">Adopted</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={clearFilters}
              className="w-full border-gray-300 hover:bg-gray-50"
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Selected Actions */}
        {selectedPets.length > 0 && (
          <div className="p-4 border-b border-gray-200 bg-blue-50">
            <h3 className="text-sm font-medium text-blue-900 mb-2">
              {selectedPets.length} pet{selectedPets.length > 1 ? "s" : ""} selected
            </h3>
            <div className="space-y-2">
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => setBulkStatusDialogOpen(true)}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Update Status
              </Button>
              <Button size="sm" variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">
                Delete Selected
              </Button>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="p-4">
          <Button variant="outline" className="w-full gap-2 mb-2">
            <Download className="h-4 w-4" />
            Export Data
          </Button>
          <Button variant="outline" className="w-full gap-2">
            <TrendingUp className="h-4 w-4" />
            View Analytics
          </Button>
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Content Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-teal-100 text-teal-600">
                <PawPrint className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Your Pets</h2>
                <p className="text-gray-600">
                  {loading ? "Loading..." : `${filteredPets.length} of ${pets.length} pets`}
                  {selectedPets.length > 0 && ` • ${selectedPets.length} selected`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={activeView === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveView("grid")}
                className={activeView === "grid" ? "bg-teal-500 hover:bg-teal-600" : ""}
              >
                Grid
              </Button>
              <Button
                variant={activeView === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveView("list")}
                className={activeView === "list" ? "bg-teal-500 hover:bg-teal-600" : ""}
              >
                List
              </Button>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1 p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mb-4 text-teal-500" />
              <p className="text-muted-foreground">Loading pets...</p>
            </div>
          ) : filteredPets.length === 0 ? (
            <div className="flex h-60 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mb-4">
                <PawPrint className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">No pets found</h3>
              <p className="text-sm text-gray-500 mb-4">
                {pets.length === 0
                  ? "Get started by adding your first pet to the shelter."
                  : "Try adjusting your filters or search criteria to find more pets."
                }
              </p>
              {pets.length === 0 ? (
                <Link href="/dashboard/shelter/pets/add">
                  <Button className="bg-teal-500 hover:bg-teal-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Pet
                  </Button>
                </Link>
              ) : (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className={activeView === "grid"
              ? "grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 p-1"
              : "space-y-3 p-1"
            }>
              {filteredPets.map(renderPetCard)}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Pet Status</DialogTitle>
            <DialogDescription>
              Change the adoption status for {selectedPetForStatus?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      Available
                    </div>
                  </SelectItem>
                  <SelectItem value="pending">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-yellow-500" />
                      Pending
                    </div>
                  </SelectItem>
                  <SelectItem value="adopted">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                      Adopted
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)} disabled={updatingStatus}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateStatus}
              disabled={updatingStatus || !newStatus}
              className="bg-teal-500 hover:bg-teal-600"
            >
              {updatingStatus ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Status'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Status Update Dialog */}
      <Dialog open={bulkStatusDialogOpen} onOpenChange={setBulkStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Status for Multiple Pets</DialogTitle>
            <DialogDescription>
              Change the adoption status for {selectedPets.length} selected pet{selectedPets.length > 1 ? 's' : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="bulk-status">New Status</Label>
              <Select value={bulkNewStatus} onValueChange={setBulkNewStatus}>
                <SelectTrigger id="bulk-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      Available
                    </div>
                  </SelectItem>
                  <SelectItem value="pending">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-yellow-500" />
                      Pending
                    </div>
                  </SelectItem>
                  <SelectItem value="adopted">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                      Adopted
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkStatusDialogOpen(false)} disabled={updatingStatus}>
              Cancel
            </Button>
            <Button
              onClick={handleBulkStatusUpdate}
              disabled={updatingStatus || !bulkNewStatus}
              className="bg-teal-500 hover:bg-teal-600"
            >
              {updatingStatus ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                `Update ${selectedPets.length} Pet${selectedPets.length > 1 ? 's' : ''}`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}