"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import {
  Bell,
  Calendar,
  ChevronRight,
  ChevronLeft,
  Home,
  LogOut,
  MessageSquare,
  PawPrint,
  Settings,
  User,
  FileText,
  CheckCircle2,
  ClipboardList,
  Plus,
  Edit,
  Eye,
  Users,
  Building,
  Camera,
  Menu,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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

export default function ShelterDashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {/* Shelter Sidebar */}
      <motion.aside
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-white transition-all duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${sidebarCollapsed ? "w-16" : "w-64"}`}
      >
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/" className="flex items-center gap-2">
            <Building className="h-6 w-6 text-teal-500" />
            {!sidebarCollapsed && <span className="text-xl font-bold">Shelter Portal</span>}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="ml-auto hidden h-8 w-8 lg:flex"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid gap-1 px-2">
            {[
              { name: "Dashboard", icon: Home, href: "/dashboard/shelter", active: true },
              { name: "My Pets", icon: PawPrint, href: "/dashboard/shelter/pets" },
              { name: "Add New Pet", icon: Plus, href: "/dashboard/shelter/pets/add" },
              { name: "Applications", icon: ClipboardList, href: "/dashboard/shelter/applications" },
              { name: "Adopters", icon: Users, href: "/dashboard/shelter/adopters" },
              { name: "Messages", icon: MessageSquare, href: "/dashboard/shelter/messages", badge: "8" },
              { name: "Events", icon: Calendar, href: "/dashboard/shelter/events" },
              { name: "Reports", icon: FileText, href: "/dashboard/shelter/reports" },
            ].map((item) => (
              <motion.div key={item.name} whileHover={{ x: 5 }} whileTap={{ scale: 0.95 }}>
                <div className="relative">
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
                      item.active ? "bg-teal-50 text-teal-700" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                    } ${sidebarCollapsed ? "justify-center" : ""}`}
                    title={sidebarCollapsed ? item.name : undefined}
                  >
                    <item.icon className={`h-4 w-4 ${item.active ? "text-teal-700" : "text-gray-400"}`} />
                    {!sidebarCollapsed && (
                      <>
                        <span>{item.name}</span>
                        {item.badge && <Badge className="ml-auto bg-teal-500">{item.badge}</Badge>}
                      </>
                    )}
                  </Link>
                  {sidebarCollapsed && item.badge && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-teal-500 text-[10px] font-medium text-white">
                      {item.badge}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </nav>
          <div className="mt-6">
            {!sidebarCollapsed && (
              <div className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Shelter</div>
            )}
            <nav className={`grid gap-1 px-2 ${sidebarCollapsed ? "mt-2" : "mt-2"}`}>
              {[
                { name: "Profile", icon: User, href: "/dashboard/shelter/profile" },
                { name: "Settings", icon: Settings, href: "/dashboard/shelter/settings" },
              ].map((item) => (
                <motion.div key={item.name} whileHover={{ x: 5 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-900 ${
                      sidebarCollapsed ? "justify-center" : ""
                    }`}
                    title={sidebarCollapsed ? item.name : undefined}
                  >
                    <item.icon className="h-4 w-4 text-gray-400" />
                    {!sidebarCollapsed && <span>{item.name}</span>}
                  </Link>
                </motion.div>
              ))}
              <motion.div whileHover={{ x: 5 }} whileTap={{ scale: 0.95 }}>
                <button 
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-900 ${
                    sidebarCollapsed ? "justify-center" : ""
                  }`}
                  title={sidebarCollapsed ? "Log Out" : undefined}
                >
                  <LogOut className="h-4 w-4 text-gray-400" />
                  {!sidebarCollapsed && <span>Log Out</span>}
                </button>
              </motion.div>
            </nav>
          </div>
        </div>
        <div className="border-t p-4">
          <div className={`flex items-center gap-3 ${sidebarCollapsed ? "justify-center" : ""}`}>
            <Avatar>
              <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Shelter" />
              <AvatarFallback>SP</AvatarFallback>
            </Avatar>
            {!sidebarCollapsed && (
              <>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">SPCA Penang</span>
                  <span className="text-xs text-gray-500">shelter@spca.org.my</span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="ml-auto h-8 w-8">
                      <ChevronRight className="h-4 w-4" />
                      <span className="sr-only">More options</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Shelter Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                    <DropdownMenuItem>Settings</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Log out</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className={`flex flex-1 flex-col transition-all duration-300 ${sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"}`}>
        {/* Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-white px-4 sm:px-6"
        >
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:text-gray-900 lg:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Shelter Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button variant="outline" size="icon" className="relative h-8 w-8">
                  <Bell className="h-4 w-4" />
                  <span className="sr-only">Notifications</span>
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-teal-500 text-[10px] font-medium text-white">
                    4
                  </span>
                </Button>
              </motion.div>
            </div>
            <div className="relative">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <MessageSquare className="h-4 w-4" />
                  <span className="sr-only">Messages</span>
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-teal-500 text-[10px] font-medium text-white">
                    8
                  </span>
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid gap-6">
            {/* Welcome Section */}
            <motion.section variants={fadeIn}>
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">Welcome back, SPCA Penang!</h2>
                      <p className="text-gray-500">Manage your pets and adoption applications</p>
                    </div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button className="bg-teal-500 hover:bg-teal-600">
                        Add New Pet
                        <Plus className="ml-2 h-4 w-4" />
                      </Button>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.section>

            {/* Shelter Stats */}
            <motion.section variants={fadeIn}>
              <div className="grid gap-4 md:grid-cols-4">
                {[
                  { label: "Available Pets", value: "23", change: "+3", icon: PawPrint, color: "text-blue-600" },
                  {
                    label: "Pending Applications",
                    value: "12",
                    change: "+5",
                    icon: ClipboardList,
                    color: "text-orange-600",
                  },
                  {
                    label: "Successful Adoptions",
                    value: "87",
                    change: "+8",
                    icon: CheckCircle2,
                    color: "text-green-600",
                  },
                  { label: "Active Adopters", value: "156", change: "+12", icon: Users, color: "text-purple-600" },
                ].map((stat, index) => (
                  <motion.div key={index} variants={popIn}>
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                            <p className="text-xs text-gray-500">{stat.change} this month</p>
                          </div>
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                            <stat.icon className="h-6 w-6 text-gray-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* Recent Applications and Pet Management */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Recent Applications */}
              <motion.section variants={fadeIn}>
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Recent Applications</CardTitle>
                    <CardDescription>Latest adoption applications for your pets</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
                      {[
                        {
                          applicant: "Sarah Chen",
                          pet: "Buddy (Golden Retriever)",
                          status: "pending",
                          time: "2 hours ago",
                          avatar: "SC",
                        },
                        {
                          applicant: "Ahmad Rahman",
                          pet: "Whiskers (Siamese Cat)",
                          status: "approved",
                          time: "5 hours ago",
                          avatar: "AR",
                        },
                        {
                          applicant: "Lim Wei Ming",
                          pet: "Max (Labrador)",
                          status: "interview",
                          time: "1 day ago",
                          avatar: "LW",
                        },
                        {
                          applicant: "Priya Sharma",
                          pet: "Luna (Persian Cat)",
                          status: "pending",
                          time: "2 days ago",
                          avatar: "PS",
                        },
                      ].map((application, index) => (
                        <motion.div
                          key={index}
                          variants={popIn}
                          whileHover={{ y: -2 }}
                          className="flex gap-4 rounded-lg border p-3"
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>{application.avatar}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h4 className="font-medium">{application.applicant}</h4>
                            <p className="text-sm text-gray-500">{application.pet}</p>
                            <p className="text-xs text-gray-400">{application.time}</p>
                          </div>
                          <Badge
                            variant={
                              application.status === "approved"
                                ? "default"
                                : application.status === "pending"
                                  ? "secondary"
                                  : "outline"
                            }
                            className={
                              application.status === "approved"
                                ? "bg-green-100 text-green-700"
                                : application.status === "pending"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-blue-100 text-blue-700"
                            }
                          >
                            {application.status}
                          </Badge>
                        </motion.div>
                      ))}
                    </motion.div>
                  </CardContent>
                  <CardFooter className="border-t bg-gray-50 px-6 py-3">
                    <Link
                      href="/dashboard/shelter/applications"
                      className="text-sm font-medium text-teal-600 hover:text-teal-700"
                    >
                      View all applications
                    </Link>
                  </CardFooter>
                </Card>
              </motion.section>

              {/* Pet Management */}
              <motion.section variants={fadeIn}>
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Your Pets</CardTitle>
                    <CardDescription>Manage your available pets</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
                      {[
                        {
                          name: "Buddy",
                          breed: "Golden Retriever",
                          age: "2 years",
                          status: "available",
                          applications: 5,
                        },
                        {
                          name: "Whiskers",
                          breed: "Siamese Cat",
                          age: "1 year",
                          status: "pending",
                          applications: 3,
                        },
                        {
                          name: "Max",
                          breed: "Labrador",
                          age: "3 years",
                          status: "available",
                          applications: 8,
                        },
                        {
                          name: "Luna",
                          breed: "Persian Cat",
                          age: "2 years",
                          status: "available",
                          applications: 2,
                        },
                      ].map((pet, index) => (
                        <motion.div
                          key={index}
                          variants={popIn}
                          whileHover={{ y: -2 }}
                          className="flex gap-4 rounded-lg border p-3"
                        >
                          <div className="relative h-12 w-12 overflow-hidden rounded-lg">
                            <Image
                              src={`/placeholder.svg?height=48&width=48&text=${pet.name}`}
                              alt={pet.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{pet.name}</h4>
                            <p className="text-sm text-gray-500">
                              {pet.breed} • {pet.age}
                            </p>
                            <p className="text-xs text-gray-400">{pet.applications} applications</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={pet.status === "available" ? "default" : "secondary"}
                              className={
                                pet.status === "available"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }
                            >
                              {pet.status}
                            </Badge>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
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
                                <DropdownMenuItem>
                                  <Camera className="mr-2 h-4 w-4" />
                                  Update Photos
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  </CardContent>
                  <CardFooter className="border-t bg-gray-50 px-6 py-3">
                    <Link
                      href="/dashboard/shelter/pets"
                      className="text-sm font-medium text-teal-600 hover:text-teal-700"
                    >
                      Manage all pets
                    </Link>
                  </CardFooter>
                </Card>
              </motion.section>
            </div>

            {/* Adoption Statistics */}
            <motion.section variants={fadeIn}>
              <Card>
                <CardHeader>
                  <CardTitle>Adoption Statistics</CardTitle>
                  <CardDescription>Track your shelter's adoption performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="mb-4">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="monthly">Monthly</TabsTrigger>
                      <TabsTrigger value="breeds">By Breed</TabsTrigger>
                      <TabsTrigger value="age">By Age</TabsTrigger>
                    </TabsList>
                    <TabsContent value="overview" className="mt-0">
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Adoption Rate</p>
                          <p className="text-2xl font-bold text-green-600">87%</p>
                          <Progress value={87} className="h-2" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Average Days to Adopt</p>
                          <p className="text-2xl font-bold text-blue-600">14</p>
                          <Progress value={70} className="h-2" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Return Rate</p>
                          <p className="text-2xl font-bold text-red-600">3%</p>
                          <Progress value={3} className="h-2" />
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="monthly" className="mt-0">
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <p className="text-sm font-medium">This Month</p>
                          <p className="text-2xl font-bold text-green-600">12</p>
                          <Progress value={80} className="h-2" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Last Month</p>
                          <p className="text-2xl font-bold text-blue-600">8</p>
                          <Progress value={60} className="h-2" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Growth</p>
                          <p className="text-2xl font-bold text-purple-600">+50%</p>
                          <Progress value={50} className="h-2" />
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="breeds" className="mt-0">
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Dogs</p>
                          <p className="text-2xl font-bold text-blue-600">65%</p>
                          <Progress value={65} className="h-2" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Cats</p>
                          <p className="text-2xl font-bold text-purple-600">30%</p>
                          <Progress value={30} className="h-2" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Others</p>
                          <p className="text-2xl font-bold text-green-600">5%</p>
                          <Progress value={5} className="h-2" />
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="age" className="mt-0">
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Puppies/Kittens</p>
                          <p className="text-2xl font-bold text-green-600">45%</p>
                          <Progress value={45} className="h-2" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Young Adults</p>
                          <p className="text-2xl font-bold text-blue-600">35%</p>
                          <Progress value={35} className="h-2" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Seniors</p>
                          <p className="text-2xl font-bold text-purple-600">20%</p>
                          <Progress value={20} className="h-2" />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.section>

            {/* Quick Actions */}
            <motion.section variants={fadeIn}>
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks for shelter management</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    <Link href="/dashboard/shelter/pets/add">
                      <Button variant="outline" className="w-full justify-start gap-2">
                        <Plus className="h-4 w-4" />
                        Add New Pet
                      </Button>
                    </Link>
                    <Link href="/dashboard/shelter/applications">
                      <Button variant="outline" className="w-full justify-start gap-2">
                        <ClipboardList className="h-4 w-4" />
                        Review Applications
                      </Button>
                    </Link>
                    <Link href="/dashboard/shelter/pets">
                      <Button variant="outline" className="w-full justify-start gap-2">
                        <PawPrint className="h-4 w-4" />
                        Manage Pets
                      </Button>
                    </Link>
                    <Link href="/dashboard/shelter/reports">
                      <Button variant="outline" className="w-full justify-start gap-2">
                        <FileText className="h-4 w-4" />
                        View Reports
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.section>
          </motion.div>
        </main>
      </div>
    </div>
  )
}
