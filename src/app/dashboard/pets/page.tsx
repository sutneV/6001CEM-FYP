"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import {
  ChevronDown,
  Filter,
  Heart,
  MapPin,
  PawPrint,
  Search,
  SlidersHorizontal,
  Loader2,
  AlertCircle,
  Dog,
  Cat,
  Star,
  Calendar,
  Users,
  TrendingUp,
  Activity,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { petsService, PetWithShelter } from "@/lib/services/pets"

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

// Compatibility calculation (mock for now)
const calculateCompatibility = (pet: PetWithShelter) => {
  // Simple compatibility calculation based on pet attributes
  let score = 70; // Base score
  if (pet.vaccinated) score += 5
  if (pet.neutered) score += 5
  if (pet.houseTrained) score += 10
  if (pet.goodWithKids) score += 5
  if (pet.goodWithDogs) score += 3
  if (pet.goodWithCats) score += 2
  return Math.min(score, 99) // Cap at 99%
}

const typeIcons = {
  dog: Dog,
  cat: Cat,
  rabbit: PawPrint,
  bird: PawPrint,
  other: PawPrint,
}

export default function PetsPage() {
  const [favorites, setFavorites] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [pets, setPets] = useState<PetWithShelter[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedAge, setSelectedAge] = useState<string[]>([])
  const [selectedSize, setSelectedSize] = useState<string[]>([])
  const [selectedGender, setSelectedGender] = useState<string[]>([])
  const [selectedCompatibility, setSelectedCompatibility] = useState<string[]>([])
  const [sortBy, setSortBy] = useState("newest")
  const [currentPage, setCurrentPage] = useState(1)
  const [petsPerPage, setPetsPerPage] = useState(8)

  // Fetch pets on component mount
  useEffect(() => {
    fetchPets()
  }, [])

  const fetchPets = async () => {
    try {
      setLoading(true)
      const data = await petsService.getAllPets({ status: 'available' })
      setPets(data)
    } catch (error) {
      toast.error('Failed to fetch pets')
      console.error('Error fetching pets:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleFavorite = (id: string) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter((favId) => favId !== id))
      toast.success("Removed from favorites")
    } else {
      setFavorites([...favorites, id])
      toast.success("Added to favorites")
    }
  }

  // Filter pets based on search and filters
  const filteredPets = pets.filter((pet) => {
    const matchesSearch =
      pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pet.breed && pet.breed.toLowerCase().includes(searchTerm.toLowerCase())) ||
      pet.shelter.name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = selectedType === "all" || pet.type.toLowerCase() === selectedType.toLowerCase()
    const matchesAge = selectedAge.length === 0 || selectedAge.includes(pet.age)
    const matchesSize = selectedSize.length === 0 || selectedSize.includes(pet.size || "")
    const matchesGender = selectedGender.length === 0 || selectedGender.includes(pet.gender)

    // Compatibility filters
    const matchesCompatibility = selectedCompatibility.length === 0 || selectedCompatibility.some(comp => {
      switch(comp) {
        case "children": return pet.goodWithKids
        case "dogs": return pet.goodWithDogs
        case "cats": return pet.goodWithCats
        case "apartments": return pet.houseTrained
        default: return true
      }
    })

    return matchesSearch && matchesType && matchesAge && matchesSize && matchesGender && matchesCompatibility
  })

  // Sort pets
  const sortedPets = [...filteredPets].sort((a, b) => {
    switch(sortBy) {
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case "compatibility":
        return calculateCompatibility(b) - calculateCompatibility(a)
      case "alphabetical":
        return a.name.localeCompare(b.name)
      default:
        return 0
    }
  })

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedType("all")
    setSelectedAge([])
    setSelectedSize([])
    setSelectedGender([])
    setSelectedCompatibility([])
    setSortBy("newest")
    setCurrentPage(1) // Reset to first page when clearing filters
  }

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedType, selectedAge, selectedSize, selectedGender, selectedCompatibility, sortBy, petsPerPage])

  // Calculate pagination
  const totalPages = Math.ceil(sortedPets.length / petsPerPage)
  const startIndex = (currentPage - 1) * petsPerPage
  const endIndex = startIndex + petsPerPage
  const currentPets = sortedPets.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const stats = {
    total: pets.length,
    dogs: pets.filter(p => p.type === 'dog').length,
    cats: pets.filter(p => p.type === 'cat').length,
    shelters: [...new Set(pets.map(p => p.shelter.id))].length,
  }

  const renderPetCard = (pet: PetWithShelter) => {
    const compatibility = calculateCompatibility(pet)
    const TypeIcon = typeIcons[pet.type as keyof typeof typeIcons] || PawPrint

    return (
      <motion.div
        key={pet.id}
        whileHover={{ y: -10 }}
        className="overflow-hidden rounded-lg border bg-white shadow-sm hover:shadow-md transition-all cursor-pointer"
      >
        <div className="relative aspect-square">
          <Image
            src={pet.images && pet.images.length > 0 ? pet.images[0] : `/placeholder.svg?height=300&width=300&text=${pet.name}`}
            alt={pet.name}
            fill
            className="object-cover"
          />
          <div className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-1 text-xs font-medium">
            {compatibility}% Match
          </div>
          <div className="absolute bottom-2 left-2">
            <Badge variant="outline" className="bg-white/90">
              <TypeIcon className="h-3 w-3 mr-1" />
              <span className="capitalize">{pet.type}</span>
            </Badge>
          </div>
          <motion.button
            className="absolute right-2 bottom-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-500 hover:text-red-500"
            onClick={(e) => {
              e.preventDefault()
              toggleFavorite(pet.id)
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Heart className={`h-4 w-4 ${favorites.includes(pet.id) ? "fill-red-500 text-red-500" : ""}`} />
          </motion.button>
        </div>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{pet.name}</h3>
            <Badge variant="secondary" className="capitalize">
              {pet.age}
            </Badge>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            <p>
              {pet.breed || 'Mixed Breed'} • {pet.gender.charAt(0).toUpperCase() + pet.gender.slice(1)}
              {pet.size && ` • ${pet.size.charAt(0).toUpperCase() + pet.size.slice(1)}`}
            </p>
            <div className="mt-1 flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>{pet.shelter.name}</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {pet.description}
          </p>

          {/* Health & Behavior badges */}
          <div className="flex flex-wrap gap-1 mt-3">
            {pet.vaccinated && <Badge variant="outline" className="text-xs">Vaccinated</Badge>}
            {pet.neutered && <Badge variant="outline" className="text-xs">Spayed/Neutered</Badge>}
            {pet.houseTrained && <Badge variant="outline" className="text-xs">House Trained</Badge>}
            {pet.goodWithKids && <Badge variant="outline" className="text-xs">Good with Kids</Badge>}
          </div>

          <div className="mt-4 flex gap-2">
            <Link href={`/dashboard/pets/${pet.id}`} className="flex-1">
              <Button variant="outline" className="w-full">
                View Profile
              </Button>
            </Link>
            <Link href={`/dashboard/pets/${pet.id}/apply`} className="flex-1">
              <Button className="w-full bg-teal-500 hover:bg-teal-600">Apply Now</Button>
            </Link>
          </div>
        </CardContent>
      </motion.div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] bg-gray-50 rounded-lg border overflow-hidden relative">
      {/* Left Sidebar - Stats & Filters */}
      <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="mb-3">
            <h1 className="text-xl font-bold text-gray-900">Available Pets</h1>
            <p className="text-sm text-gray-600">Find your perfect companion in Penang</p>
          </div>
          {!loading && (
            <p className="text-xs text-muted-foreground">
              Showing {startIndex + 1}-{Math.min(endIndex, sortedPets.length)} of {sortedPets.length} pets
              {sortedPets.length !== pets.length && ` (${pets.length} total)`}
              {favorites.length > 0 && ` • ${favorites.length} favorited`}
              {totalPages > 1 && ` • Page ${currentPage} of ${totalPages}`}
            </p>
          )}
        </div>

        {/* Statistics */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-3">OVERVIEW</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-teal-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-teal-100 rounded">
                  <PawPrint className="h-4 w-4 text-teal-600" />
                </div>
                <span className="text-sm font-medium">Total Available</span>
              </div>
              <span className="text-lg font-bold text-teal-600">{stats.total}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-blue-100 rounded">
                  <Dog className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium">Dogs</span>
              </div>
              <span className="text-lg font-bold text-blue-600">{stats.dogs}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-purple-100 rounded">
                  <Cat className="h-4 w-4 text-purple-600" />
                </div>
                <span className="text-sm font-medium">Cats</span>
              </div>
              <span className="text-lg font-bold text-purple-600">{stats.cats}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-green-100 rounded">
                  <Users className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-sm font-medium">Shelters</span>
              </div>
              <span className="text-lg font-bold text-green-600">{stats.shelters}</span>
            </div>
          </div>
        </div>

        {/* Search & Primary Filters */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-3">SEARCH & FILTER</h3>
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by name, breed, or shelter..."
                className="pl-9 border-gray-300 focus:border-teal-500 focus:ring-teal-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="border-gray-300 focus:border-teal-500 focus:ring-teal-500">
                <SelectValue placeholder="Pet Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Pets</SelectItem>
                <SelectItem value="dog">Dogs</SelectItem>
                <SelectItem value="cat">Cats</SelectItem>
                <SelectItem value="rabbit">Rabbits</SelectItem>
                <SelectItem value="bird">Birds</SelectItem>
                <SelectItem value="other">Other Pets</SelectItem>
              </SelectContent>
            </Select>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between border-gray-300">
                  <span className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    Sort By
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[280px]">
                <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => setSortBy("newest")}>
                    <Calendar className="mr-2 h-4 w-4" />
                    Newest First
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("oldest")}>
                    <Calendar className="mr-2 h-4 w-4" />
                    Oldest First
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("compatibility")}>
                    <Star className="mr-2 h-4 w-4" />
                    Highest Compatibility
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("alphabetical")}>
                    <PawPrint className="mr-2 h-4 w-4" />
                    Alphabetical (A-Z)
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <div className="p-4 border-b border-gray-200">
          <Button
            variant="outline"
            className="w-full gap-2 border-gray-300"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
            <span>Advanced Filters</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </Button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-4">
              {/* Age Filter */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Age</h4>
                <div className="space-y-2">
                  {["baby", "young", "adult", "senior"].map((age) => (
                    <div key={age} className="flex items-center space-x-2">
                      <Checkbox
                        id={`age-${age}`}
                        checked={selectedAge.includes(age)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedAge([...selectedAge, age])
                          } else {
                            setSelectedAge(selectedAge.filter(a => a !== age))
                          }
                        }}
                      />
                      <label
                        htmlFor={`age-${age}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                      >
                        {age === 'baby' ? 'Baby/Puppy/Kitten' : age}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Size Filter */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Size</h4>
                <div className="space-y-2">
                  {["small", "medium", "large", "xlarge"].map((size) => (
                    <div key={size} className="flex items-center space-x-2">
                      <Checkbox
                        id={`size-${size}`}
                        checked={selectedSize.includes(size)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedSize([...selectedSize, size])
                          } else {
                            setSelectedSize(selectedSize.filter(s => s !== size))
                          }
                        }}
                      />
                      <label
                        htmlFor={`size-${size}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                      >
                        {size === 'xlarge' ? 'Extra Large' : size.replace('_', ' ')}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gender Filter */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Gender</h4>
                <div className="space-y-2">
                  {["male", "female"].map((gender) => (
                    <div key={gender} className="flex items-center space-x-2">
                      <Checkbox
                        id={`gender-${gender}`}
                        checked={selectedGender.includes(gender)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedGender([...selectedGender, gender])
                          } else {
                            setSelectedGender(selectedGender.filter(g => g !== gender))
                          }
                        }}
                      />
                      <label
                        htmlFor={`gender-${gender}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                      >
                        {gender}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Good With Filter */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Good With</h4>
                <div className="space-y-2">
                  {[
                    { id: "children", label: "Children" },
                    { id: "dogs", label: "Dogs" },
                    { id: "cats", label: "Cats" },
                    { id: "apartments", label: "Apartments" }
                  ].map((compatibility) => (
                    <div key={compatibility.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`compatibility-${compatibility.id}`}
                        checked={selectedCompatibility.includes(compatibility.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedCompatibility([...selectedCompatibility, compatibility.id])
                          } else {
                            setSelectedCompatibility(selectedCompatibility.filter(c => c !== compatibility.id))
                          }
                        }}
                      />
                      <label
                        htmlFor={`compatibility-${compatibility.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {compatibility.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        )}

        {/* Pagination Controls */}
        {!loading && sortedPets.length > 8 && (
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-3">DISPLAY</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">Pets per page:</span>
                <Select value={petsPerPage.toString()} onValueChange={(value) => setPetsPerPage(parseInt(value))}>
                  <SelectTrigger className="w-20 h-8 border-gray-300 focus:border-teal-500 focus:ring-teal-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="8">8</SelectItem>
                    <SelectItem value="12">12</SelectItem>
                    <SelectItem value="16">16</SelectItem>
                    <SelectItem value="24">24</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {totalPages > 1 && (
                <div className="text-xs text-gray-500">
                  Page {currentPage} of {totalPages}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Clear Filters */}
        <div className="p-4">
          <Button
            variant="outline"
            onClick={clearFilters}
            className="w-full border-gray-300 hover:bg-gray-50"
          >
            Reset All Filters
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
                <Heart className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Find Your Perfect Companion</h2>
                <p className="text-gray-600">
                  {loading ? "Loading..." :
                    totalPages > 1
                      ? `Showing ${startIndex + 1}-${Math.min(endIndex, sortedPets.length)} of ${sortedPets.length} pets`
                      : `${sortedPets.length} pets available for adoption`
                  }
                  {favorites.length > 0 && ` • ${favorites.length} favorited`}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1 p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mb-4 text-teal-500" />
              <p className="text-muted-foreground">Loading available pets...</p>
            </div>
          ) : sortedPets.length === 0 ? (
            <div className="flex h-60 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mb-4">
                <PawPrint className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">No pets found</h3>
              <p className="text-sm text-gray-500 mb-4">
                Try adjusting your filters or search criteria to find more pets
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Reset Filters
              </Button>
            </div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            >
              {currentPets.map(renderPetCard)}
            </motion.div>
          )}

          {/* Pagination Controls */}
          {!loading && sortedPets.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8 pb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {/* Show page numbers */}
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => goToPage(pageNum)}
                      className={`w-10 ${
                        currentPage === pageNum
                          ? "bg-teal-500 hover:bg-teal-600 text-white"
                          : ""
                      }`}
                    >
                      {pageNum}
                    </Button>
                  );
                })}

                {/* Show ellipsis and last page if needed */}
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    {currentPage < totalPages - 3 && (
                      <span className="px-2 text-gray-500">...</span>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(totalPages)}
                      className="w-10"
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="gap-1"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  )
}