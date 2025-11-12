"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, PawPrint, Clock, MapPin, Info, ArrowRight, Search, Mail, Phone, Dog, Cat, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef, useState, useEffect } from "react"
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
      staggerChildren: 0.2,
    },
  },
}

const popIn = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10,
    },
  },
}

interface AnimatedSectionProps {
  children: React.ReactNode
  className?: string
  id?: string
}

const AnimatedSection = ({ children, className, id }: AnimatedSectionProps) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px 0px" })

  return (
    <motion.section
      ref={ref}
      id={id}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={fadeIn}
      className={className}
    >
      {children}
    </motion.section>
  )
}

const typeIcons = {
  dog: Dog,
  cat: Cat,
  rabbit: PawPrint,
  bird: PawPrint,
  other: PawPrint,
}

export default function Home() {
  const [pets, setPets] = useState<PetWithShelter[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPets()
  }, [])

  const fetchPets = async () => {
    try {
      setLoading(true)
      const data = await petsService.getAllPets({ status: 'available' })
      // Get first 6 pets for the landing page
      setPets(data.slice(0, 6))
    } catch (error) {
      console.error('Error fetching pets:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      >
        <div className="container flex h-16 items-center justify-between max-w-7xl mx-auto px-4 md:px-6">
          <motion.div
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <PawPrint className="h-6 w-6 text-teal-500" />
            <span className="text-xl font-bold">Penang Pet Pals</span>
          </motion.div>
          <nav className="hidden md:flex gap-6">
            {["Available Pets", "How It Works", "Resources", "About Us", "Contact"].map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 + 0.3 }}
              >
                <Link
                  href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                  className="text-sm font-medium hover:text-teal-500 transition-colors"
                >
                  {item}
                </Link>
              </motion.div>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/auth/signin">
                <Button variant="outline" size="sm" className="hidden md:flex">
                  Sign In
                </Button>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/auth/register">
                <Button size="sm" className="bg-teal-500 hover:bg-teal-600">
                  Register
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.header>
      <main className="flex-1">
        {/* Hero Section */}
        <AnimatedSection className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-teal-50 to-white">
          <div className="container px-4 md:px-6 max-w-7xl mx-auto">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 items-center">
              <motion.div className="space-y-6" variants={fadeIn}>
                <motion.div
                  className="inline-block rounded-lg bg-teal-100 px-3 py-1 text-sm text-teal-700"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Penang's First Pet Adoption Platform
                </motion.div>
                <motion.h1
                  className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                >
                  Find Your Perfect Furry Companion
                </motion.h1>
                <motion.p
                  className="text-gray-500 md:text-lg lg:text-xl leading-relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                >
                  Connecting first-time pet owners with loving animals in need of homes across Penang. We guide you
                  through every step of your pet adoption journey.
                </motion.p>
                <motion.div
                  className="flex flex-col gap-3 sm:flex-row sm:gap-4"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.div variants={popIn} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button className="bg-teal-500 hover:bg-teal-600 h-12 px-8">
                      Browse Pets
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </motion.div>
                  <motion.div variants={popIn} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="outline" className="h-12 px-8">Learn About Adoption</Button>
                  </motion.div>
                </motion.div>
              </motion.div>
              <motion.div
                className="flex justify-center lg:justify-end"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <motion.div
                  className="aspect-video overflow-hidden rounded-xl w-full max-w-lg lg:max-w-xl"
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  <Image
                    src="/images/nana2.jpg"
                    alt="Happy pet owner with adopted dog in Penang"
                    width={800}
                    height={600}
                    className="object-cover w-full h-full"
                  />
                </motion.div>
              </motion.div>
            </div>
          </div>
        </AnimatedSection>

        {/* Features Section */}
        <AnimatedSection className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 max-w-7xl mx-auto">
            <motion.div className="flex flex-col items-center justify-center space-y-4 text-center" variants={fadeIn}>
              <div className="space-y-2">
                <motion.div
                  className="inline-block rounded-lg bg-teal-100 px-3 py-1 text-sm text-teal-700"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Why Choose Us
                </motion.div>
                <motion.h2
                  className="text-3xl font-bold tracking-tighter sm:text-5xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Designed for First-Time Pet Parents
                </motion.h2>
                <motion.p
                  className="max-w-4xl text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  We understand that adopting your first pet can be both exciting and overwhelming. Our platform
                  provides everything you need to make the process smooth and enjoyable.
                </motion.p>
              </div>
            </motion.div>
            <motion.div
              className="mx-auto grid max-w-6xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-8"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {[
                {
                  icon: <Heart className="h-6 w-6 text-teal-700" />,
                  title: "Personalized Matching",
                  description:
                    "Our smart matching system helps you find pets that fit your lifestyle, living situation, and preferences.",
                },
                {
                  icon: <Info className="h-6 w-6 text-teal-700" />,
                  title: "First-Time Owner Resources",
                  description:
                    "Access guides, videos, and expert advice specifically tailored for new pet owners in Penang.",
                },
                {
                  icon: <MapPin className="h-6 w-6 text-teal-700" />,
                  title: "Local Support Network",
                  description:
                    "Connect with local vets, trainers, and pet communities throughout Penang to support your journey.",
                },
              ].map((feature, index) => (
                <motion.div key={index} variants={popIn} whileHover={{ y: -10 }}>
                  <Card className="border-2 border-teal-100 h-full">
                    <CardContent className="pt-6">
                      <motion.div
                        className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-teal-100"
                        whileHover={{ rotate: 10 }}
                      >
                        {feature.icon}
                      </motion.div>
                      <h3 className="text-xl font-bold">{feature.title}</h3>
                      <p className="text-gray-500 mt-2">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </AnimatedSection>

        {/* Available Pets Section */}
        <AnimatedSection id="available-pets" className="w-full py-12 md:py-24 lg:py-32 bg-teal-50">
          <div className="container px-4 md:px-6 max-w-7xl mx-auto">
            <motion.div className="flex flex-col items-center justify-center space-y-4 text-center" variants={fadeIn}>
              <div className="space-y-2">
                <motion.h2
                  className="text-3xl font-bold tracking-tighter sm:text-5xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  Meet Our Adoptable Pets
                </motion.h2>
                <motion.p
                  className="max-w-4xl text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  These loving animals are waiting for their forever homes in Penang. Could you be their perfect match?
                </motion.p>
              </div>
              <motion.div
                className="w-full max-w-md space-y-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    type="search"
                    placeholder="Search by breed, age, or location..."
                    className="w-full rounded-md border border-gray-300 bg-white py-2 pl-8 pr-4 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal-500"
                  />
                </div>
              </motion.div>
            </motion.div>
            <motion.div
              className="mx-auto grid max-w-6xl gap-6 py-12 md:grid-cols-2 lg:grid-cols-3"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {loading ? (
                <div className="col-span-full flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin mb-4 text-teal-500" />
                  <p className="text-muted-foreground">Loading available pets...</p>
                </div>
              ) : pets.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-12">
                  <PawPrint className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">No pets available at the moment</p>
                </div>
              ) : (
                pets.map((pet) => {
                  const TypeIcon = typeIcons[pet.type as keyof typeof typeIcons] || PawPrint
                  return (
                    <motion.div key={pet.id} variants={popIn} whileHover={{ y: -10 }}>
                      <Card className="overflow-hidden">
                        <div className="aspect-square relative">
                          <Image
                            src={pet.images && pet.images.length > 0 ? pet.images[0] : `/placeholder.svg?height=300&width=300&text=${pet.name}`}
                            alt={pet.name}
                            fill
                            className="object-cover"
                          />
                          <Badge className="absolute top-2 right-2 bg-teal-500 flex items-center gap-1">
                            <TypeIcon className="h-3 w-3" />
                            <span className="capitalize">{pet.type}</span>
                          </Badge>
                        </div>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="font-bold text-lg">{pet.name}</h3>
                            <Badge variant="outline" className="text-teal-700 border-teal-200 bg-teal-100 capitalize">
                              {pet.age}
                            </Badge>
                          </div>
                          <div className="flex items-center text-sm text-gray-500 mb-3">
                            <MapPin className="mr-1 h-3 w-3" />
                            {pet.shelter.name}
                          </div>
                          <p className="text-sm text-gray-500 mb-2">
                            {pet.breed || 'Mixed Breed'} • {pet.gender.charAt(0).toUpperCase() + pet.gender.slice(1)}
                            {pet.size && ` • ${pet.size.charAt(0).toUpperCase() + pet.size.slice(1)}`}
                          </p>
                          <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                            {pet.description || 'A wonderful pet looking for a loving home.'}
                          </p>
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Link href={`/dashboard/pets/${pet.id}`}>
                              <Button className="w-full bg-teal-500 hover:bg-teal-600">View Profile</Button>
                            </Link>
                          </motion.div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })
              )}
            </motion.div>
            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/dashboard/pets">
                <Button variant="outline" className="gap-1">
                  View All Pets
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </AnimatedSection>

        {/* How It Works Section */}
        <AnimatedSection id="how-it-works" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 max-w-7xl mx-auto">
            <motion.div className="flex flex-col items-center justify-center space-y-4 text-center" variants={fadeIn}>
              <div className="space-y-2">
                <motion.div
                  className="inline-block rounded-lg bg-teal-100 px-3 py-1 text-sm text-teal-700"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Simple Process
                </motion.div>
                <motion.h2
                  className="text-3xl font-bold tracking-tighter sm:text-5xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  How Adoption Works
                </motion.h2>
                <motion.p
                  className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  We've simplified the adoption process to make it easy for first-time pet owners in Penang.
                </motion.p>
              </div>
            </motion.div>
            <motion.div
              className="mx-auto grid max-w-6xl items-start gap-6 py-12 md:grid-cols-2 lg:grid-cols-4"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {[
                {
                  title: "Browse & Match",
                  description: "Explore available pets and find ones that match your lifestyle and preferences.",
                  icon: <Search className="h-10 w-10 text-teal-500" />,
                },
                {
                  title: "Learn & Prepare",
                  description: "Access resources to learn about pet care and prepare your home for your new companion.",
                  icon: <Info className="h-10 w-10 text-teal-500" />,
                },
                {
                  title: "Meet & Connect",
                  description: "Schedule a meeting with the pet at one of our Penang partner shelters or foster homes.",
                  icon: <Heart className="h-10 w-10 text-teal-500" />,
                },
                {
                  title: "Adopt & Thrive",
                  description:
                    "Complete the adoption process and begin your journey with ongoing support from our community.",
                  icon: <PawPrint className="h-10 w-10 text-teal-500" />,
                },
              ].map((step, index) => (
                <motion.div
                  key={index}
                  className="flex flex-col items-center text-center"
                  variants={popIn}
                  whileHover={{ y: -10 }}
                >
                  <motion.div
                    className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-100"
                    whileHover={{ rotate: 10 }}
                    transition={{ type: "spring", stiffness: 300, damping: 10 }}
                  >
                    {step.icon}
                  </motion.div>
                  <motion.div
                    className="rounded-full bg-teal-500 text-white font-bold w-8 h-8 flex items-center justify-center mb-4"
                    whileHover={{ scale: 1.2 }}
                    transition={{ type: "spring", stiffness: 300, damping: 10 }}
                  >
                    {index + 1}
                  </motion.div>
                  <h3 className="text-xl font-bold">{step.title}</h3>
                  <p className="text-gray-500 mt-2">{step.description}</p>
                </motion.div>
              ))}
            </motion.div>
            <motion.div
              className="flex justify-center mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button className="bg-teal-500 hover:bg-teal-600">Start Your Adoption Journey</Button>
            </motion.div>
          </div>
        </AnimatedSection>

        {/* Testimonials Section */}
        <AnimatedSection className="w-full py-12 md:py-24 lg:py-32 bg-teal-50">
          <div className="container px-4 md:px-6 max-w-7xl mx-auto">
            <motion.div className="flex flex-col items-center justify-center space-y-4 text-center" variants={fadeIn}>
              <div className="space-y-2">
                <motion.div
                  className="inline-block rounded-lg bg-teal-100 px-3 py-1 text-sm text-teal-700"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Success Stories
                </motion.div>
                <motion.h2
                  className="text-3xl font-bold tracking-tighter sm:text-5xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Happy Tails from Penang
                </motion.h2>
                <motion.p
                  className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  Hear from first-time pet owners who found their perfect companions through our platform.
                </motion.p>
              </div>
            </motion.div>
            <motion.div
              className="mx-auto grid max-w-6xl gap-6 py-12 md:grid-cols-2 lg:grid-cols-3"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {[1, 2, 3].map((testimonial) => (
                <motion.div
                  key={testimonial}
                  variants={popIn}
                  whileHover={{
                    y: -10,
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                  }}
                >
                  <Card className="overflow-hidden h-full">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <motion.div
                          className="rounded-full overflow-hidden h-12 w-12 relative"
                          whileHover={{ scale: 1.1 }}
                        >
                          <Image
                            src={`/placeholder.svg?height=48&width=48&text=User`}
                            alt="User avatar"
                            fill
                            className="object-cover"
                          />
                        </motion.div>
                        <div>
                          <h4 className="font-semibold">
                            {testimonial === 1 ? "Mei Ling" : testimonial === 2 ? "Ahmad" : "Priya"}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {testimonial === 1 ? "George Town" : testimonial === 2 ? "Bayan Lepas" : "Tanjung Tokong"}
                          </p>
                        </div>
                      </div>
                      <p className="italic text-gray-600 mb-4">
                        {testimonial === 1
                          ? "As a first-time pet owner, I was nervous about adoption. Penang Pet Pals guided me through every step, and now my cat Milo is the joy of my life!"
                          : testimonial === 2
                            ? "The resources for new pet owners were invaluable. My dog Rocky and I are thriving thanks to the ongoing support from the community."
                            : "I never thought I'd be able to care for a pet in my apartment, but the matching system helped me find the perfect companion for my lifestyle."}
                      </p>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <motion.svg
                            key={i}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="h-4 w-4 text-yellow-500"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 + i * 0.1 }}
                          >
                            <path
                              fillRule="evenodd"
                              d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                              clipRule="evenodd"
                            />
                          </motion.svg>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </AnimatedSection>

        {/* Resources Section */}
        <AnimatedSection id="resources" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 max-w-7xl mx-auto">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 items-center">
              <motion.div className="space-y-4" variants={fadeIn}>
                <motion.div
                  className="inline-block rounded-lg bg-teal-100 px-3 py-1 text-sm text-teal-700"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  First-Time Owner Resources
                </motion.div>
                <motion.h2
                  className="text-3xl font-bold tracking-tighter sm:text-5xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Everything You Need to Know
                </motion.h2>
                <motion.p
                  className="text-gray-500 md:text-xl/relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  Our comprehensive resources help first-time pet owners in Penang navigate the joys and challenges of
                  pet parenthood.
                </motion.p>
                <motion.ul className="grid gap-3" variants={staggerContainer} initial="hidden" animate="visible">
                  {[
                    "Pet-friendly housing in Penang",
                    "Local veterinarians and clinics",
                    "Training resources for new pet owners",
                    "Pet nutrition and health guides",
                    "Penang pet laws and regulations",
                  ].map((resource, index) => (
                    <motion.li
                      key={index}
                      className="flex items-center gap-2"
                      variants={popIn}
                      whileHover={{ x: 10 }}
                      transition={{ type: "spring", stiffness: 300, damping: 10 }}
                    >
                      <motion.div
                        className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-100"
                        whileHover={{ rotate: 90 }}
                        transition={{ type: "spring", stiffness: 300, damping: 10 }}
                      >
                        <ArrowRight className="h-3 w-3 text-teal-700" />
                      </motion.div>
                      <span>{resource}</span>
                    </motion.li>
                  ))}
                </motion.ul>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button className="bg-teal-500 hover:bg-teal-600">Explore Resources</Button>
                </motion.div>
              </motion.div>
              <motion.div
                className="mx-auto w-full max-w-[500px] lg:max-w-none"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <motion.div
                  className="aspect-video overflow-hidden rounded-xl"
                  whileHover={{ scale: 1.03, rotate: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  <Image
                    src="/placeholder.svg?height=600&width=800"
                    alt="Pet owner reading resources with their pet"
                    width={800}
                    height={600}
                    className="object-cover w-full h-full"
                  />
                </motion.div>
              </motion.div>
            </div>
          </div>
        </AnimatedSection>

        {/* CTA Section */}
        <AnimatedSection className="w-full py-12 md:py-24 lg:py-32 bg-teal-500 text-white">
          <div className="container px-4 md:px-6 max-w-7xl mx-auto">
            <motion.div className="flex flex-col items-center justify-center space-y-4 text-center" variants={fadeIn}>
              <div className="space-y-2">
                <motion.h2
                  className="text-3xl font-bold tracking-tighter sm:text-5xl"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                >
                  Ready to Find Your Perfect Pet?
                </motion.h2>
                <motion.p
                  className="max-w-[900px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Join thousands of happy pet owners across Penang who found their companions through our platform.
                </motion.p>
              </div>
              <motion.div
                className="flex flex-col gap-2 min-[400px]:flex-row"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                <motion.div variants={popIn} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button className="bg-white text-teal-500 hover:bg-gray-100">Browse Available Pets</Button>
                </motion.div>
                <motion.div variants={popIn} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="outline" className="text-black border-white hover:bg-teal-600">
                    Learn More
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </AnimatedSection>

        {/* Contact Section */}
        <AnimatedSection id="contact" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 max-w-7xl mx-auto">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 items-start">
              <motion.div className="space-y-4" variants={fadeIn}>
                <motion.div
                  className="inline-block rounded-lg bg-teal-100 px-3 py-1 text-sm text-teal-700"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Get In Touch
                </motion.div>
                <motion.h2
                  className="text-3xl font-bold tracking-tighter sm:text-5xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Contact Us
                </motion.h2>
                <motion.p
                  className="text-gray-500 md:text-xl/relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  Have questions about pet adoption in Penang? Our team is here to help you every step of the way.
                </motion.p>
                <motion.div className="grid gap-4" variants={staggerContainer} initial="hidden" animate="visible">
                  {[
                    {
                      icon: <Mail className="mt-1 h-5 w-5 text-teal-500" />,
                      title: "Email Us",
                      content: "hello@penangpetpals.com",
                    },
                    {
                      icon: <Phone className="mt-1 h-5 w-5 text-teal-500" />,
                      title: "Call Us",
                      content: "+60 4-123 4567",
                    },
                  ].map((item, index) => (
                    <motion.div key={index} className="flex items-start gap-4" variants={popIn} whileHover={{ x: 10 }}>
                      <motion.div
                        whileHover={{ rotate: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 10 }}
                      >
                        {item.icon}
                      </motion.div>
                      <div>
                        <h3 className="font-semibold">{item.title}</h3>
                        <p className="text-sm text-gray-500">{item.content}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <form className="grid gap-4">
                      <div className="grid gap-2">
                        <label htmlFor="name" className="text-sm font-medium leading-none">
                          Name
                        </label>
                        <motion.input
                          whileFocus={{ scale: 1.02 }}
                          transition={{ type: "spring", stiffness: 300, damping: 15 }}
                          id="name"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Enter your name"
                        />
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="email" className="text-sm font-medium leading-none">
                          Email
                        </label>
                        <motion.input
                          whileFocus={{ scale: 1.02 }}
                          transition={{ type: "spring", stiffness: 300, damping: 15 }}
                          id="email"
                          type="email"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Enter your email"
                        />
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="subject" className="text-sm font-medium leading-none">
                          Subject
                        </label>
                        <motion.input
                          whileFocus={{ scale: 1.02 }}
                          transition={{ type: "spring", stiffness: 300, damping: 15 }}
                          id="subject"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Enter subject"
                        />
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="message" className="text-sm font-medium leading-none">
                          Message
                        </label>
                        <motion.textarea
                          whileFocus={{ scale: 1.02 }}
                          transition={{ type: "spring", stiffness: 300, damping: 15 }}
                          id="message"
                          className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Enter your message"
                        />
                      </div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button className="w-full bg-teal-500 hover:bg-teal-600">Send Message</Button>
                      </motion.div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </AnimatedSection>
      </main>
      <motion.footer
        className="w-full border-t bg-gray-50 py-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="container flex flex-col items-center justify-center gap-4 px-4 md:px-6 md:flex-row md:justify-between max-w-7xl mx-auto">
          <motion.div className="flex items-center gap-2" whileHover={{ scale: 1.05 }}>
            <PawPrint className="h-5 w-5 text-teal-500" />
            <span className="font-semibold">Penang Pet Pals</span>
          </motion.div>
          <p className="text-center text-sm text-gray-500 md:text-left">
            &copy; {new Date().getFullYear()} Penang Pet Pals. All rights reserved.
          </p>
          <motion.div className="flex gap-4" variants={staggerContainer} initial="hidden" animate="visible">
            {[
              { icon: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z", name: "Facebook" },
              { icon: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z M17.5 6.5h.01", name: "Instagram", rect: true },
              {
                icon: "M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z",
                name: "Twitter",
              },
            ].map((social, index) => (
              <motion.div key={index} variants={popIn}>
                <Link href="#" className="text-gray-500 hover:text-teal-500">
                  <motion.svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 10 }}
                  >
                    {social.rect && <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>}
                    <path d={social.icon}></path>
                  </motion.svg>
                  <span className="sr-only">{social.name}</span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.footer>
    </div>
  )
}
