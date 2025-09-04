"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Search, Filter, Download, MoreHorizontal, Edit, Eye, Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { petsService, PetWithShelter } from "@/lib/services/pets"

const statusColors = {
  available: "bg-green-100 text-green-800",
  adopted: "bg-blue-100 text-blue-800",
  pending: "bg-yellow-100 text-yellow-800",
}

export default function ShelterPetsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedPets, setSelectedPets] = useState<string[]>([])
  const [pets, setPets] = useState<PetWithShelter[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPets(filteredPets.map((pet) => pet.id))
    } else {
      setSelectedPets([])
    }
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Pet Management</h1>
          <p className="text-muted-foreground">Manage your shelter's pets and their adoption status</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Link href="/dashboard/shelter/pets/add">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Pet
            </Button>
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All pets in shelter</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.available}</div>
            <p className="text-xs text-muted-foreground">Ready for adoption</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Adopted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.adopted}</div>
            <p className="text-xs text-muted-foreground">Successfully placed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Pet List</CardTitle>
          <CardDescription>Manage and track all pets in your shelter</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search pets by name or breed..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Pet Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="dog">Dogs</SelectItem>
                <SelectItem value="cat">Cats</SelectItem>
                <SelectItem value="rabbit">Rabbits</SelectItem>
                <SelectItem value="bird">Birds</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
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
              onClick={() => {
                setSearchTerm("")
                setTypeFilter("all")
                setStatusFilter("all")
              }}
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>

          {/* Bulk Actions */}
          {selectedPets.length > 0 && (
            <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 rounded-lg">
              <span className="text-sm text-blue-700">
                {selectedPets.length} pet{selectedPets.length > 1 ? "s" : ""} selected
              </span>
              <Button size="sm" variant="outline">
                Update Status
              </Button>
              <Button size="sm" variant="outline">
                Delete Selected
              </Button>
            </div>
          )}

          {/* Pet Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedPets.length === filteredPets.length && filteredPets.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Pet</TableHead>
                  <TableHead>Type & Breed</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      <p className="text-muted-foreground mt-2">Loading pets...</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPets.map((pet) => (
                    <TableRow key={pet.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedPets.includes(pet.id)}
                          onCheckedChange={(checked) => handleSelectPet(pet.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage 
                              src={pet.images && pet.images.length > 0 ? pet.images[0] : "/placeholder.svg"} 
                              alt={pet.name} 
                            />
                            <AvatarFallback>{pet.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{pet.name}</div>
                            <div className="text-sm text-muted-foreground">{pet.description}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium capitalize">{pet.type}</div>
                          <div className="text-sm text-muted-foreground">{pet.breed || 'Mixed breed'}</div>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{pet.age}</TableCell>
                      <TableCell className="capitalize">{pet.gender}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[pet.status as keyof typeof statusColors]}>
                          {pet.status.charAt(0).toUpperCase() + pet.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(pet.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
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
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Pet
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDeletePet(pet.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Pet
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {filteredPets.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No pets found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
