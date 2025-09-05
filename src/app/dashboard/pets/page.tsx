"use client"

import { useState, useEffect } from "react"
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
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Dog,
  Cat,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

export default function PetsPage() {
  const [favorites, setFavorites] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [pets, setPets] = useState<PetWithShelter[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("all")

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

  // Filter pets based on search and type
  const filteredPets = pets.filter((pet) => {
    const matchesSearch = 
      pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pet.breed && pet.breed.toLowerCase().includes(searchTerm.toLowerCase())) ||
      pet.shelter.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = selectedType === "all" || pet.type.toLowerCase() === selectedType.toLowerCase()
    
    return matchesSearch && matchesType
  })

  return (
    <div className="space-y-8">
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-8">
          {/* Page Title */}
          <motion.div variants={fadeIn} className="space-y-2">
            <h1 className="text-3xl font-bold">Available Pets</h1>
            <p className="text-gray-500">Find your perfect companion from our available pets in Penang</p>
            {!loading && (
              <p className="text-sm text-muted-foreground">
                Showing {filteredPets.length} of {pets.length} pets • {favorites.length} favorited
              </p>
            )}
          </motion.div>

          {/* Search and Filters */}
          <motion.div variants={fadeIn} className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input 
                  placeholder="Search by name, breed, or shelter..." 
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-[140px]">
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
                    <Button variant="outline" className="gap-2">
                      <SlidersHorizontal className="h-4 w-4" />
                      <span>Sort</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[200px]">
                    <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem>Newest First</DropdownMenuItem>
                      <DropdownMenuItem>Oldest First</DropdownMenuItem>
                      <DropdownMenuItem>Highest Compatibility</DropdownMenuItem>
                      <DropdownMenuItem>Alphabetical (A-Z)</DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="outline" className="gap-2" onClick={() => setShowFilters(!showFilters)}>
                  <Filter className="h-4 w-4" />
                  <span>Filters</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
                </Button>
              </div>
            </div>

            {/* Expanded Filters */}
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="rounded-lg border bg-white p-4"
              >
                <div className="grid gap-6 md:grid-cols-4">
                  <div>
                    <h3 className="mb-3 font-medium">Age</h3>
                    <div className="space-y-2">
                      {["Baby/Puppy/Kitten", "Young", "Adult", "Senior"].map((age) => (
                        <div key={age} className="flex items-center space-x-2">
                          <Checkbox id={`age-${age.toLowerCase()}`} />
                          <label
                            htmlFor={`age-${age.toLowerCase()}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {age}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-3 font-medium">Size</h3>
                    <div className="space-y-2">
                      {["Small", "Medium", "Large", "Extra Large"].map((size) => (
                        <div key={size} className="flex items-center space-x-2">
                          <Checkbox id={`size-${size.toLowerCase().replace(" ", "-")}`} />
                          <label
                            htmlFor={`size-${size.toLowerCase().replace(" ", "-")}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {size}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-3 font-medium">Gender</h3>
                    <div className="space-y-2">
                      {["Male", "Female"].map((gender) => (
                        <div key={gender} className="flex items-center space-x-2">
                          <Checkbox id={`gender-${gender.toLowerCase()}`} />
                          <label
                            htmlFor={`gender-${gender.toLowerCase()}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {gender}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-3 font-medium">Good With</h3>
                    <div className="space-y-2">
                      {["Children", "Dogs", "Cats", "Apartments"].map((compatibility) => (
                        <div key={compatibility} className="flex items-center space-x-2">
                          <Checkbox id={`compatibility-${compatibility.toLowerCase()}`} />
                          <label
                            htmlFor={`compatibility-${compatibility.toLowerCase()}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {compatibility}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <Button variant="outline" size="sm">
                    Reset Filters
                  </Button>
                  <Button size="sm" className="bg-teal-500 hover:bg-teal-600">
                    Apply Filters
                  </Button>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Pet Cards Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mb-4" />
              <p className="text-muted-foreground">Loading pets...</p>
            </div>
          ) : filteredPets.length === 0 ? (
            <div className="flex h-60 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <PawPrint className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="mt-4 font-medium">No pets found</h3>
              <p className="mt-2 text-sm text-gray-500">
                Try adjusting your filters or search criteria to find more pets
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSearchTerm("")
                  setSelectedType("all")
                }}
              >
                Reset Filters
              </Button>
            </div>
          ) : (
            <motion.div variants={staggerContainer} className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filteredPets.map((pet) => {
                const compatibility = calculateCompatibility(pet)
                return (
                  <motion.div
                    key={pet.id}
                    whileHover={{ y: -10 }}
                    className="overflow-hidden rounded-lg border bg-white shadow-sm hover:shadow-md transition-shadow"
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
                          {pet.type === 'dog' && <Dog className="h-3 w-3 mr-1" />}
                          {pet.type === 'cat' && <Cat className="h-3 w-3 mr-1" />}
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
                          {pet.breed || 'Mixed breed'} • {pet.gender}
                          {pet.size && ` • ${pet.size}`}
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
                        <Link href={`/apply/${pet.id}`} className="flex-1">
                          <Button className="w-full bg-teal-500 hover:bg-teal-600">Apply Now</Button>
                        </Link>
                      </div>
                    </CardContent>
                  </motion.div>
                )
              })}
            </motion.div>
          )}

          {/* Pagination - Hide for now, can be implemented later */}
          {!loading && filteredPets.length > 0 && (
            <motion.div variants={fadeIn} className="flex items-center justify-center gap-1">
              <Button variant="outline" size="icon" disabled>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="bg-teal-50">
                1
              </Button>
              <Button variant="outline" size="icon" disabled>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </motion.div>
    </div>
  )
}
