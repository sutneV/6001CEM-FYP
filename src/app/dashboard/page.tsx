"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import {
  Bell,
  Calendar,
  ChevronRight,
  Clock,
  Heart,
  Home,
  LogOut,
  MessageSquare,
  PawPrint,
  Settings,
  User,
  FileText,
  CheckCircle2,
  ClipboardList,
  MapPin,
  Menu,
  ChevronLeft,
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

export default function DashboardPage() {
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
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-white transition-all duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${sidebarCollapsed ? "w-16" : "w-64"}`}
      >
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/" className="flex items-center gap-2">
            <PawPrint className="h-6 w-6 text-teal-500" />
            {!sidebarCollapsed && <span className="text-xl font-bold">Penang Pet Pals</span>}
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
              { name: "Dashboard", icon: Home, href: "/dashboard", active: true },
              { name: "My Applications", icon: ClipboardList, href: "/dashboard/applications" },
              { name: "Favorites", icon: Heart, href: "/dashboard/favorites" },
              { name: "Messages", icon: MessageSquare, href: "/dashboard/messages", badge: "3" },
              { name: "Appointments", icon: Calendar, href: "/dashboard/appointments" },
              { name: "Resources", icon: FileText, href: "/dashboard/resources" },
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
              <div className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Account</div>
            )}
            <nav className={`grid gap-1 px-2 ${sidebarCollapsed ? "mt-2" : "mt-2"}`}>
              {[
                { name: "Profile", icon: User, href: "/dashboard/profile" },
                { name: "Settings", icon: Settings, href: "/dashboard/settings" },
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
              <AvatarImage src="/placeholder.svg?height=40&width=40" alt="User" />
              <AvatarFallback>ML</AvatarFallback>
            </Avatar>
            {!sidebarCollapsed && (
              <>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Mei Ling</span>
                  <span className="text-xs text-gray-500">mei.ling@example.com</span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="ml-auto h-8 w-8">
                      <ChevronRight className="h-4 w-4" />
                      <span className="sr-only">More options</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
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
      <div className={`flex flex-1 flex-col transition-all duration-300 ${sidebarCollapsed ? "lg:ml-0" : ""}`}>
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
            <h1 className="text-lg font-semibold">Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button variant="outline" size="icon" className="relative h-8 w-8">
                  <Bell className="h-4 w-4" />
                  <span className="sr-only">Notifications</span>
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-teal-500 text-[10px] font-medium text-white">
                    3
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
                    2
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
                      <h2 className="text-2xl font-bold">Welcome back, Mei Ling!</h2>
                      <p className="text-gray-500">Here's what's happening with your adoption journey.</p>
                    </div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button className="bg-teal-500 hover:bg-teal-600">
                        Browse Pets
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.section>

            {/* Application Status */}
            <motion.section variants={fadeIn}>
              <Card>
                <CardHeader>
                  <CardTitle>Your Adoption Applications</CardTitle>
                  <CardDescription>Track the status of your pet adoption applications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="relative h-16 w-16 overflow-hidden rounded-lg">
                            <Image
                              src="/placeholder.svg?height=64&width=64&text=Buddy"
                              alt="Buddy"
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="font-semibold">Buddy - Golden Retriever</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <span>Application #APP-123456</span>
                              <span>•</span>
                              <span>Submitted on May 10, 2025</span>
                            </div>
                          </div>
                        </div>
                        <Badge className="bg-yellow-500">In Review</Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Application Progress</span>
                          <span className="font-medium">2 of 4 steps completed</span>
                        </div>
                        <Progress value={50} className="h-2 bg-gray-100" indicatorClassName="bg-teal-500" />
                        <div className="grid grid-cols-4 text-xs">
                          <div className="flex flex-col items-center">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-500 text-white">
                              <CheckCircle2 className="h-3 w-3" />
                            </div>
                            <span className="mt-1 text-center">Application Submitted</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-500 text-white">
                              <CheckCircle2 className="h-3 w-3" />
                            </div>
                            <span className="mt-1 text-center">Initial Review</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-gray-500">
                              <Clock className="h-3 w-3" />
                            </div>
                            <span className="mt-1 text-center">Home Visit</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-gray-500">
                              <PawPrint className="h-3 w-3" />
                            </div>
                            <span className="mt-1 text-center">Final Approval</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="relative h-16 w-16 overflow-hidden rounded-lg">
                            <Image
                              src="/placeholder.svg?height=64&width=64&text=Whiskers"
                              alt="Whiskers"
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="font-semibold">Whiskers - Siamese Cat</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <span>Application #APP-123789</span>
                              <span>•</span>
                              <span>Submitted on May 2, 2025</span>
                            </div>
                          </div>
                        </div>
                        <Badge className="bg-green-500">Approved</Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Application Progress</span>
                          <span className="font-medium">4 of 4 steps completed</span>
                        </div>
                        <Progress value={100} className="h-2 bg-gray-100" indicatorClassName="bg-green-500" />
                        <div className="grid grid-cols-4 text-xs">
                          {["Application Submitted", "Initial Review", "Home Visit", "Final Approval"].map(
                            (step, i) => (
                              <div key={i} className="flex flex-col items-center">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white">
                                  <CheckCircle2 className="h-3 w-3" />
                                </div>
                                <span className="mt-1 text-center">{step}</span>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t bg-gray-50 px-6 py-3">
                  <Link
                    href="/dashboard/applications"
                    className="text-sm font-medium text-teal-600 hover:text-teal-700"
                  >
                    View all applications
                  </Link>
                </CardFooter>
              </Card>
            </motion.section>

            {/* Upcoming Events and Notifications */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Upcoming Events */}
              <motion.section variants={fadeIn}>
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Upcoming Events</CardTitle>
                    <CardDescription>Your scheduled appointments and events</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
                      {[
                        {
                          title: "Meet & Greet with Buddy",
                          date: "May 18, 2025",
                          time: "10:00 AM",
                          location: "Penang Pet Pals Center, George Town",
                        },
                        {
                          title: "Home Visit Assessment",
                          date: "May 20, 2025",
                          time: "2:00 PM",
                          location: "Your Home Address",
                        },
                        {
                          title: "Pet Care Workshop",
                          date: "May 25, 2025",
                          time: "11:00 AM",
                          location: "Penang Pet Pals Center, George Town",
                        },
                      ].map((event, index) => (
                        <motion.div
                          key={index}
                          variants={popIn}
                          whileHover={{ y: -5 }}
                          className="flex gap-4 rounded-lg border p-3"
                        >
                          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md bg-teal-100 text-teal-700">
                            <Calendar className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{event.title}</h4>
                            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{event.date}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{event.time}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                <span>{event.location}</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  </CardContent>
                  <CardFooter className="border-t bg-gray-50 px-6 py-3">
                    <Link
                      href="/dashboard/appointments"
                      className="text-sm font-medium text-teal-600 hover:text-teal-700"
                    >
                      View all appointments
                    </Link>
                  </CardFooter>
                </Card>
              </motion.section>

              {/* Notifications */}
              <motion.section variants={fadeIn}>
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>Recent updates and alerts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
                      {[
                        {
                          title: "Application Update",
                          description: "Your application for Buddy has moved to the next stage.",
                          time: "2 hours ago",
                          icon: FileText,
                          color: "bg-blue-100 text-blue-700",
                        },
                        {
                          title: "Appointment Reminder",
                          description: "You have a meet & greet with Buddy tomorrow at 10:00 AM.",
                          time: "5 hours ago",
                          icon: Calendar,
                          color: "bg-yellow-100 text-yellow-700",
                        },
                        {
                          title: "Application Approved",
                          description: "Your application for Whiskers has been approved!",
                          time: "1 day ago",
                          icon: CheckCircle2,
                          color: "bg-green-100 text-green-700",
                        },
                        {
                          title: "New Message",
                          description: "You have a new message from the adoption coordinator.",
                          time: "2 days ago",
                          icon: MessageSquare,
                          color: "bg-purple-100 text-purple-700",
                        },
                      ].map((notification, index) => (
                        <motion.div
                          key={index}
                          variants={popIn}
                          whileHover={{ x: 5 }}
                          className="flex gap-4 rounded-lg border p-3"
                        >
                          <div
                            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md ${notification.color}`}
                          >
                            <notification.icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{notification.title}</h4>
                            <p className="mt-1 text-xs text-gray-500">{notification.description}</p>
                            <p className="mt-1 text-xs text-gray-400">{notification.time}</p>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  </CardContent>
                  <CardFooter className="border-t bg-gray-50 px-6 py-3">
                    <Link
                      href="/dashboard/notifications"
                      className="text-sm font-medium text-teal-600 hover:text-teal-700"
                    >
                      View all notifications
                    </Link>
                  </CardFooter>
                </Card>
              </motion.section>
            </div>

            {/* Recommended Pets */}
            <motion.section variants={fadeIn}>
              <Card>
                <CardHeader>
                  <CardTitle>Recommended Pets</CardTitle>
                  <CardDescription>Based on your preferences and previous interactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="all" className="w-full">
                    <TabsList className="mb-4">
                      <TabsTrigger value="all">All Pets</TabsTrigger>
                      <TabsTrigger value="dogs">Dogs</TabsTrigger>
                      <TabsTrigger value="cats">Cats</TabsTrigger>
                      <TabsTrigger value="others">Others</TabsTrigger>
                    </TabsList>
                    <TabsContent value="all" className="mt-0">
                      <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                      >
                        {[
                          {
                            name: "Max",
                            type: "Dog",
                            breed: "Labrador Retriever",
                            age: "2 years",
                            location: "George Town",
                            compatibility: "95%",
                          },
                          {
                            name: "Luna",
                            type: "Cat",
                            breed: "Ragdoll",
                            age: "1 year",
                            location: "Batu Ferringhi",
                            compatibility: "92%",
                          },
                          {
                            name: "Rocky",
                            type: "Dog",
                            breed: "Beagle",
                            age: "3 years",
                            location: "Tanjung Bungah",
                            compatibility: "88%",
                          },
                          {
                            name: "Coco",
                            type: "Cat",
                            breed: "Maine Coon",
                            age: "4 years",
                            location: "Bayan Lepas",
                            compatibility: "85%",
                          },
                        ].map((pet, index) => (
                          <motion.div
                            key={index}
                            variants={popIn}
                            whileHover={{ y: -10 }}
                            className="overflow-hidden rounded-lg border"
                          >
                            <div className="relative aspect-square">
                              <Image
                                src={`/placeholder.svg?height=300&width=300&text=${pet.name}`}
                                alt={pet.name}
                                fill
                                className="object-cover"
                              />
                              <div className="absolute right-2 top-2 rounded-full bg-white px-2 py-1 text-xs font-medium">
                                {pet.compatibility} Match
                              </div>
                            </div>
                            <div className="p-4">
                              <div className="flex items-center justify-between">
                                <h3 className="font-semibold">{pet.name}</h3>
                                <Badge variant="outline" className="text-teal-700 border-teal-200 bg-teal-100">
                                  {pet.type}
                                </Badge>
                              </div>
                              <div className="mt-2 text-sm text-gray-500">
                                <p>
                                  {pet.breed} • {pet.age}
                                </p>
                                <div className="mt-1 flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  <span>{pet.location}</span>
                                </div>
                              </div>
                              <div className="mt-4 flex gap-2">
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
                                  <Button variant="outline" size="sm" className="w-full">
                                    <Heart className="mr-1 h-4 w-4" />
                                    Save
                                  </Button>
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
                                  <Button size="sm" className="w-full bg-teal-500 hover:bg-teal-600">
                                    View
                                  </Button>
                                </motion.div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    </TabsContent>
                    <TabsContent value="dogs" className="mt-0">
                      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {/* Dog content would go here */}
                        <div className="flex h-40 items-center justify-center rounded-lg border border-dashed text-center">
                          <div className="mx-auto flex max-w-[150px] flex-col items-center">
                            <p className="text-sm text-gray-500">Switch to the "All Pets" tab to see recommendations</p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="cats" className="mt-0">
                      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {/* Cat content would go here */}
                        <div className="flex h-40 items-center justify-center rounded-lg border border-dashed text-center">
                          <div className="mx-auto flex max-w-[150px] flex-col items-center">
                            <p className="text-sm text-gray-500">Switch to the "All Pets" tab to see recommendations</p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="others" className="mt-0">
                      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {/* Other pets content would go here */}
                        <div className="flex h-40 items-center justify-center rounded-lg border border-dashed text-center">
                          <div className="mx-auto flex max-w-[150px] flex-col items-center">
                            <p className="text-sm text-gray-500">Switch to the "All Pets" tab to see recommendations</p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
                <CardFooter className="border-t bg-gray-50 px-6 py-3">
                  <Link href="/pets" className="text-sm font-medium text-teal-600 hover:text-teal-700">
                    Browse all available pets
                  </Link>
                </CardFooter>
              </Card>
            </motion.section>

            {/* Resources and Tips */}
            <motion.section variants={fadeIn}>
              <Card>
                <CardHeader>
                  <CardTitle>Resources for New Pet Parents</CardTitle>
                  <CardDescription>Helpful guides and tips for your adoption journey</CardDescription>
                </CardHeader>
                <CardContent>
                  <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                  >
                    {[
                      {
                        title: "Preparing Your Home",
                        description: "Essential tips for pet-proofing your home before adoption.",
                        icon: Home,
                        color: "bg-blue-100 text-blue-700",
                      },
                      {
                        title: "First 30 Days Guide",
                        description: "What to expect during the first month with your new pet.",
                        icon: Calendar,
                        color: "bg-purple-100 text-purple-700",
                      },
                      {
                        title: "Local Vet Recommendations",
                        description: "Top-rated veterinarians in Penang for your new companion.",
                        icon: MapPin,
                        color: "bg-green-100 text-green-700",
                      },
                    ].map((resource, index) => (
                      <motion.div key={index} variants={popIn} whileHover={{ y: -5 }} className="rounded-lg border">
                        <div className="flex items-start gap-4 p-4">
                          <div
                            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md ${resource.color}`}
                          >
                            <resource.icon className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-medium">{resource.title}</h3>
                            <p className="mt-1 text-sm text-gray-500">{resource.description}</p>
                          </div>
                        </div>
                        <div className="border-t p-3">
                          <Link href="#" className="text-sm font-medium text-teal-600 hover:text-teal-700">
                            Read more
                          </Link>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </CardContent>
                <CardFooter className="border-t bg-gray-50 px-6 py-3">
                  <Link href="/dashboard/resources" className="text-sm font-medium text-teal-600 hover:text-teal-700">
                    View all resources
                  </Link>
                </CardFooter>
              </Card>
            </motion.section>
          </motion.div>
        </main>
      </div>
    </div>
  )
}
