"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Bell,
  ChevronRight,
  ChevronLeft,
  Home,
  LogOut,
  PawPrint,
  Settings,
  FileText,
  CheckCircle2,
  ClipboardList,
  Users,
  Building,
  BarChart3,
  Shield,
  AlertTriangle,
  Activity,
  Menu,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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

export default function AdminDashboardPage() {
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
      {/* Admin Sidebar */}
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
            <PawPrint className="h-6 w-6 text-teal-500" />
            {!sidebarCollapsed && <span className="text-xl font-bold">Admin Panel</span>}
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
              { name: "Dashboard", icon: Home, href: "/dashboard/admin", active: true },
              { name: "User Management", icon: Users, href: "/dashboard/admin/users" },
              { name: "Shelter Management", icon: Building, href: "/dashboard/admin/shelters" },
              { name: "Pet Management", icon: PawPrint, href: "/dashboard/admin/pets" },
              { name: "Applications", icon: ClipboardList, href: "/dashboard/admin/applications" },
              { name: "Analytics", icon: BarChart3, href: "/dashboard/admin/analytics" },
              { name: "Reports", icon: FileText, href: "/dashboard/admin/reports" },
              { name: "System Health", icon: Activity, href: "/dashboard/admin/system" },
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
              <div className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Admin Tools</div>
            )}
            <nav className={`grid gap-1 px-2 ${sidebarCollapsed ? "mt-2" : "mt-2"}`}>
              {[
                { name: "Security", icon: Shield, href: "/dashboard/admin/security" },
                { name: "Settings", icon: Settings, href: "/dashboard/admin/settings" },
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
              <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Admin" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            {!sidebarCollapsed && (
              <>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Admin User</span>
                  <span className="text-xs text-gray-500">admin@penangpets.com</span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="ml-auto h-8 w-8">
                      <ChevronRight className="h-4 w-4" />
                      <span className="sr-only">More options</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
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
            <h1 className="text-lg font-semibold">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button variant="outline" size="icon" className="relative h-8 w-8">
                  <Bell className="h-4 w-4" />
                  <span className="sr-only">Notifications</span>
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                    5
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
                      <h2 className="text-2xl font-bold">Welcome to Admin Dashboard</h2>
                      <p className="text-gray-500">Manage the entire Penang Pet Adoption platform</p>
                    </div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button className="bg-teal-500 hover:bg-teal-600">
                        System Overview
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.section>

            {/* Admin Stats */}
            <motion.section variants={fadeIn}>
              <div className="grid gap-4 md:grid-cols-4">
                {[
                  { label: "Total Users", value: "2,847", change: "+12%", icon: Users, color: "text-blue-600" },
                  { label: "Active Shelters", value: "23", change: "+2", icon: Building, color: "text-green-600" },
                  { label: "Available Pets", value: "156", change: "+8", icon: PawPrint, color: "text-purple-600" },
                  {
                    label: "Pending Applications",
                    value: "47",
                    change: "-3",
                    icon: ClipboardList,
                    color: "text-orange-600",
                  },
                ].map((stat, index) => (
                  <motion.div key={index} variants={popIn}>
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                            <p className="text-xs text-gray-500">{stat.change} from last month</p>
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

            {/* Recent Activity and Alerts */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Recent Activity */}
              <motion.section variants={fadeIn}>
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Recent System Activity</CardTitle>
                    <CardDescription>Latest actions across the platform</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
                      {[
                        {
                          action: "New shelter registered",
                          details: "Penang Animal Welfare Society joined",
                          time: "2 hours ago",
                          icon: Building,
                          color: "bg-green-100 text-green-700",
                        },
                        {
                          action: "Application approved",
                          details: "Buddy adopted by Sarah Chen",
                          time: "4 hours ago",
                          icon: CheckCircle2,
                          color: "bg-blue-100 text-blue-700",
                        },
                        {
                          action: "New pet added",
                          details: "Luna (Ragdoll Cat) by SPCA Penang",
                          time: "6 hours ago",
                          icon: PawPrint,
                          color: "bg-purple-100 text-purple-700",
                        },
                        {
                          action: "User reported issue",
                          details: "Application form not loading",
                          time: "8 hours ago",
                          icon: AlertTriangle,
                          color: "bg-yellow-100 text-yellow-700",
                        },
                      ].map((activity, index) => (
                        <motion.div
                          key={index}
                          variants={popIn}
                          whileHover={{ x: 5 }}
                          className="flex gap-4 rounded-lg border p-3"
                        >
                          <div
                            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md ${activity.color}`}
                          >
                            <activity.icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{activity.action}</h4>
                            <p className="mt-1 text-xs text-gray-500">{activity.details}</p>
                            <p className="mt-1 text-xs text-gray-400">{activity.time}</p>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.section>

              {/* System Alerts */}
              <motion.section variants={fadeIn}>
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>System Alerts</CardTitle>
                    <CardDescription>Important notifications requiring attention</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
                      {[
                        {
                          title: "High Application Volume",
                          description: "47 pending applications need review",
                          priority: "high",
                          icon: ClipboardList,
                        },
                        {
                          title: "Shelter Capacity Alert",
                          description: "3 shelters approaching capacity limits",
                          priority: "medium",
                          icon: Building,
                        },
                        {
                          title: "System Maintenance Due",
                          description: "Scheduled maintenance in 2 days",
                          priority: "low",
                          icon: Settings,
                        },
                        {
                          title: "New User Registrations",
                          description: "15 new users registered today",
                          priority: "info",
                          icon: Users,
                        },
                      ].map((alert, index) => (
                        <motion.div
                          key={index}
                          variants={popIn}
                          whileHover={{ y: -2 }}
                          className="flex gap-4 rounded-lg border p-3"
                        >
                          <div
                            className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md ${
                              alert.priority === "high"
                                ? "bg-red-100 text-red-700"
                                : alert.priority === "medium"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : alert.priority === "low"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-green-100 text-green-700"
                            }`}
                          >
                            <alert.icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{alert.title}</h4>
                            <p className="mt-1 text-xs text-gray-500">{alert.description}</p>
                          </div>
                          <Badge
                            variant={
                              alert.priority === "high"
                                ? "destructive"
                                : alert.priority === "medium"
                                  ? "default"
                                  : "secondary"
                            }
                          >
                            {alert.priority}
                          </Badge>
                        </motion.div>
                      ))}
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.section>
            </div>

            {/* Platform Overview */}
            <motion.section variants={fadeIn}>
              <Card>
                <CardHeader>
                  <CardTitle>Platform Overview</CardTitle>
                  <CardDescription>Key metrics and performance indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="users" className="w-full">
                    <TabsList className="mb-4">
                      <TabsTrigger value="users">Users</TabsTrigger>
                      <TabsTrigger value="shelters">Shelters</TabsTrigger>
                      <TabsTrigger value="adoptions">Adoptions</TabsTrigger>
                      <TabsTrigger value="system">System</TabsTrigger>
                    </TabsList>
                    <TabsContent value="users" className="mt-0">
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <p className="text-sm font-medium">User Growth</p>
                          <p className="text-2xl font-bold text-blue-600">+12%</p>
                          <Progress value={75} className="h-2" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Active Users</p>
                          <p className="text-2xl font-bold text-green-600">1,847</p>
                          <Progress value={85} className="h-2" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium">New Registrations</p>
                          <p className="text-2xl font-bold text-purple-600">156</p>
                          <Progress value={60} className="h-2" />
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="shelters" className="mt-0">
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Active Shelters</p>
                          <p className="text-2xl font-bold text-green-600">23</p>
                          <Progress value={90} className="h-2" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Pending Approval</p>
                          <p className="text-2xl font-bold text-yellow-600">3</p>
                          <Progress value={30} className="h-2" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Total Capacity</p>
                          <p className="text-2xl font-bold text-blue-600">450</p>
                          <Progress value={70} className="h-2" />
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="adoptions" className="mt-0">
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Successful Adoptions</p>
                          <p className="text-2xl font-bold text-green-600">342</p>
                          <Progress value={95} className="h-2" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Pending Applications</p>
                          <p className="text-2xl font-bold text-orange-600">47</p>
                          <Progress value={40} className="h-2" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Success Rate</p>
                          <p className="text-2xl font-bold text-blue-600">87%</p>
                          <Progress value={87} className="h-2" />
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="system" className="mt-0">
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <p className="text-sm font-medium">System Uptime</p>
                          <p className="text-2xl font-bold text-green-600">99.9%</p>
                          <Progress value={99} className="h-2" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Response Time</p>
                          <p className="text-2xl font-bold text-blue-600">120ms</p>
                          <Progress value={80} className="h-2" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Error Rate</p>
                          <p className="text-2xl font-bold text-red-600">0.1%</p>
                          <Progress value={5} className="h-2" />
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
                  <CardDescription>Common administrative tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    <Link href="/dashboard/admin/users">
                      <Button variant="outline" className="w-full justify-start gap-2">
                        <Users className="h-4 w-4" />
                        Manage Users
                      </Button>
                    </Link>
                    <Link href="/dashboard/admin/shelters">
                      <Button variant="outline" className="w-full justify-start gap-2">
                        <Building className="h-4 w-4" />
                        Approve Shelters
                      </Button>
                    </Link>
                    <Link href="/dashboard/admin/applications">
                      <Button variant="outline" className="w-full justify-start gap-2">
                        <ClipboardList className="h-4 w-4" />
                        Review Applications
                      </Button>
                    </Link>
                    <Link href="/dashboard/admin/reports">
                      <Button variant="outline" className="w-full justify-start gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Generate Reports
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
